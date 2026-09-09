from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from dotenv import load_dotenv
import httpx
import os
import json

from app.models.schemas import Conversation, Message
from app.auth.auth_handler import get_current_user
from app.database.database import get_db, async_session

# Force load variables from backend/.env file
load_dotenv()

router = APIRouter()


# ───────── Pydantic Request Schemas ─────────
class ChatSendRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Chat"


class ConversationUpdate(BaseModel):
    title: str


# ───────── 1. List Conversations ─────────
@router.get("/conversations")
async def list_conversations(
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Conversation).where(Conversation.user_id == current_user["user_id"])
    if search:
        query = query.where(Conversation.title.ilike(f"%{search}%"))
    query = query.order_by(desc(Conversation.updated_at))
    result = await db.execute(query)
    conversations = result.scalars().all()
    return [
        {
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        }
        for c in conversations
    ]


# ───────── 2. Create Conversation ─────────
@router.post("/conversations")
async def create_conversation(
    payload: ConversationCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv = Conversation(
        user_id=current_user["user_id"],
        title=payload.title or "New Chat",
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return {
        "id": conv.id,
        "title": conv.title,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
    }


# ───────── 3. Get Single Conversation with Messages ─────────
@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user["user_id"],
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {
        "id": conv.id,
        "title": conv.title,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in conv.messages
        ],
    }


# ───────── 4. Update Conversation Title ─────────
@router.put("/conversations/{conversation_id}")
@router.patch("/conversations/{conversation_id}")
async def update_conversation(
    conversation_id: int,
    payload: ConversationUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user["user_id"],
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conv.title = payload.title
    conv.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(conv)
    return {
        "id": conv.id,
        "title": conv.title,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
    }


# ───────── 5. Delete Conversation ─────────
@router.delete("/conversations/{conversation_id}", status_code=204)
async def delete_conversation(
    conversation_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user["user_id"],
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    await db.delete(conv)
    await db.commit()
    return None


# ───────── 6. Send Message & Stream AI Reply ─────────
@router.post("/send")
async def send_message(
    payload: ChatSendRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = current_user["user_id"]
    user_text = payload.message.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    conv = None
    if payload.conversation_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == payload.conversation_id,
                Conversation.user_id == user_id,
            )
        )
        conv = result.scalar_one_or_none()

    if not conv:
        title_str = user_text[:40] + ("..." if len(user_text) > 40 else "")
        conv = Conversation(user_id=user_id, title=title_str)
        db.add(conv)
        await db.commit()
        await db.refresh(conv)

    user_msg = Message(conversation_id=conv.id, role="user", content=user_text)
    db.add(user_msg)
    conv.updated_at = datetime.now(timezone.utc)
    await db.commit()

    history_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv.id)
        .order_by(Message.created_at)
    )
    history = history_result.scalars().all()
    messages_for_llm = [{"role": m.role, "content": m.content} for m in history]

    conv_id = conv.id

    async def event_stream():
        yield f"data: {json.dumps({'type': 'start', 'conversation_id': conv_id})}\n\n"

        # Dynamically read environment variables
        api_key = os.getenv("LLM_API_KEY", "")
        api_url = os.getenv("LLM_API_URL", "https://api.groq.com/openai/v1/chat/completions")
        model_name = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")

        full_reply = ""
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        body = {
            "model": model_name,
            "messages": messages_for_llm,
            "stream": True,
            "temperature": 0.7,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream("POST", api_url, headers=headers, json=body) as resp:
                    if resp.status_code != 200:
                        err_bytes = await resp.aread()
                        print(f"[Groq API Error]: {err_bytes.decode()}")
                        yield f"data: {json.dumps({'type': 'chunk', 'content': 'Error calling AI service.'})}\n\n"
                        yield f"data: {json.dumps({'type': 'done', 'conversation_id': conv_id})}\n\n"
                        return

                    async for line in resp.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            delta = data.get("choices", [{}])[0].get("delta", {})
                            token = delta.get("content", "")
                            if token:
                                full_reply += token
                                yield f"data: {json.dumps({'type': 'chunk', 'content': token})}\n\n"
                        except Exception:
                            continue

            if full_reply:
                async with async_session() as stream_db:
                    assistant_msg = Message(
                        conversation_id=conv_id,
                        role="assistant",
                        content=full_reply,
                    )
                    stream_db.add(assistant_msg)
                    c_res = await stream_db.execute(
                        select(Conversation).where(Conversation.id == conv_id)
                    )
                    c = c_res.scalar_one_or_none()
                    if c:
                        c.updated_at = datetime.now(timezone.utc)
                    await stream_db.commit()

        except Exception as e:
            print(f"[Stream Error]: {e}")
            yield f"data: {json.dumps({'type': 'chunk', 'content': f' Error: {str(e)}'})}\n\n"

        yield f"data: {json.dumps({'type': 'done', 'conversation_id': conv_id})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ───────── 7. Regenerate Response ─────────
@router.post("/regenerate/{conversation_id}")
async def regenerate_response(
    conversation_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user_id = current_user["user_id"]
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
    )
    conv = result.scalar_one_or_none()
    if not conv or not conv.messages:
        raise HTTPException(status_code=404, detail="Conversation or messages not found")

    if conv.messages[-1].role == "assistant":
        await db.delete(conv.messages[-1])
        await db.commit()

    history_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    history = history_result.scalars().all()
    messages_for_llm = [{"role": m.role, "content": m.content} for m in history]

    async def event_stream():
        yield f"data: {json.dumps({'type': 'start', 'conversation_id': conversation_id})}\n\n"

        api_key = os.getenv("LLM_API_KEY", "")
        api_url = os.getenv("LLM_API_URL", "https://api.groq.com/openai/v1/chat/completions")
        model_name = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")

        full_reply = ""
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        body = {
            "model": model_name,
            "messages": messages_for_llm,
            "stream": True,
            "temperature": 0.7,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream("POST", api_url, headers=headers, json=body) as resp:
                    if resp.status_code != 200:
                        yield f"data: {json.dumps({'type': 'chunk', 'content': 'Error calling AI service.'})}\n\n"
                        yield f"data: {json.dumps({'type': 'done', 'conversation_id': conversation_id})}\n\n"
                        return

                    async for line in resp.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            data = json.loads(data_str)
                            delta = data.get("choices", [{}])[0].get("delta", {})
                            token = delta.get("content", "")
                            if token:
                                full_reply += token
                                yield f"data: {json.dumps({'type': 'chunk', 'content': token})}\n\n"
                        except Exception:
                            continue

            if full_reply:
                async with async_session() as stream_db:
                    assistant_msg = Message(
                        conversation_id=conversation_id,
                        role="assistant",
                        content=full_reply,
                    )
                    stream_db.add(assistant_msg)
                    await stream_db.commit()

        except Exception as e:
            yield f"data: {json.dumps({'type': 'chunk', 'content': f' Error: {str(e)}'})}\n\n"

        yield f"data: {json.dumps({'type': 'done', 'conversation_id': conversation_id})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")