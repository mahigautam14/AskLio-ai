from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import StreamingResponse
import aiosqlite
import json
import asyncio
from typing import Optional

from app.models.schemas import (
    ChatRequest, MessageResponse, ConversationResponse,
    ConversationCreate, ConversationUpdate, ConversationWithMessages
)
from app.auth.auth_handler import get_current_user
from app.database.database import get_db
from app.services import chat_service, llm_service

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.get("/conversations", response_model=list)
async def list_conversations(
    search: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    conversations = await chat_service.get_conversations(
        db, current_user["user_id"], search
    )
    return conversations


@router.post("/conversations", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    data: ConversationCreate = ConversationCreate(),
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    conversation = await chat_service.create_conversation(
        db, current_user["user_id"], data.title or "New Chat"
    )
    return conversation


@router.get("/conversations/{conversation_id}", response_model=dict)
async def get_conversation(
    conversation_id: int,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    conversation = await chat_service.get_conversation(
        db, conversation_id, current_user["user_id"]
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = await chat_service.get_messages(db, conversation_id)
    conversation["messages"] = messages
    return conversation


@router.put("/conversations/{conversation_id}", response_model=dict)
async def update_conversation(
    conversation_id: int,
    data: ConversationUpdate,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    success = await chat_service.update_conversation_title(
        db, conversation_id, current_user["user_id"], data.title
    )
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = await chat_service.get_conversation(
        db, conversation_id, current_user["user_id"]
    )
    return conversation


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    success = await chat_service.delete_conversation(
        db, conversation_id, current_user["user_id"]
    )
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted"}


@router.post("/send")
async def send_message(
    data: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    user_id = current_user["user_id"]
    
    if data.conversation_id:
        conversation = await chat_service.get_conversation(
            db, data.conversation_id, user_id
        )
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        conversation_id = data.conversation_id
    else:
        conversation = await chat_service.create_conversation(db, user_id)
        conversation_id = conversation["id"]
    
    await chat_service.add_message(db, conversation_id, "user", data.message)
    
    messages = await chat_service.get_messages(db, conversation_id)
    message_history = [{"role": m["role"], "content": m["content"]} for m in messages]
    
    collected_response = []

    async def generate():
        nonlocal collected_response
        
        yield f"data: {json.dumps({'conversation_id': conversation_id, 'type': 'start'})}\n\n"
        
        async for chunk in llm_service.stream_llm_response(message_history):
            collected_response.append(chunk)
            yield f"data: {json.dumps({'content': chunk, 'type': 'chunk'})}\n\n"
        
        full_response = "".join(collected_response)
        
        save_db = await aiosqlite.connect(str(chat_service.__import__('pathlib').Path(__file__).parent.parent.parent / "AskLio.db") if False else "AskLio.db")
        try:
            pass
        finally:
            pass
        
        yield f"data: {json.dumps({'type': 'done', 'conversation_id': conversation_id})}\n\n"

    async def generate_and_save():
        yield f"data: {json.dumps({'conversation_id': conversation_id, 'type': 'start'})}\n\n"
        
        full_response_parts = []
        
        async for chunk in llm_service.stream_llm_response(message_history):
            full_response_parts.append(chunk)
            yield f"data: {json.dumps({'content': chunk, 'type': 'chunk'})}\n\n"
        
        full_response = "".join(full_response_parts)
        
        db2 = await aiosqlite.connect("AskLio.db")
        try:
            now = __import__('datetime').datetime.utcnow().isoformat()
            await db2.execute(
                "INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, ?)",
                (conversation_id, "assistant", full_response, now)
            )
            await db2.execute(
                "UPDATE conversations SET updated_at = ? WHERE id = ?",
                (now, conversation_id)
            )
            
            msg_count = await db2.execute_fetchall(
                "SELECT COUNT(*) FROM messages WHERE conversation_id = ?",
                (conversation_id,)
            )
            if msg_count and msg_count[0][0] <= 2:
                title = await llm_service.generate_title(data.message)
                await db2.execute(
                    "UPDATE conversations SET title = ? WHERE id = ?",
                    (title, conversation_id)
                )
                yield f"data: {json.dumps({'type': 'title_update', 'title': title})}\n\n"
            
            await db2.commit()
        finally:
            await db2.close()
        
        yield f"data: {json.dumps({'type': 'done', 'conversation_id': conversation_id})}\n\n"

    return StreamingResponse(
        generate_and_save(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.post("/regenerate/{conversation_id}")
async def regenerate_response(
    conversation_id: int,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    conversation = await chat_service.get_conversation(
        db, conversation_id, current_user["user_id"]
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = await chat_service.get_messages(db, conversation_id)
    
    if messages and messages[-1]["role"] == "assistant":
        await db.execute(
            "DELETE FROM messages WHERE id = ?", (messages[-1]["id"],)
        )
        await db.commit()
        messages = messages[:-1]
    
    message_history = [{"role": m["role"], "content": m["content"]} for m in messages]

    async def generate_and_save():
        yield f"data: {json.dumps({'conversation_id': conversation_id, 'type': 'start'})}\n\n"
        
        full_response_parts = []
        
        async for chunk in llm_service.stream_llm_response(message_history):
            full_response_parts.append(chunk)
            yield f"data: {json.dumps({'content': chunk, 'type': 'chunk'})}\n\n"
        
        full_response = "".join(full_response_parts)
        
        db2 = await aiosqlite.connect("AskLio.db")
        try:
            now = __import__('datetime').datetime.utcnow().isoformat()
            await db2.execute(
                "INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, ?)",
                (conversation_id, "assistant", full_response, now)
            )
            await db2.commit()
        finally:
            await db2.close()
        
        yield f"data: {json.dumps({'type': 'done', 'conversation_id': conversation_id})}\n\n"

    return StreamingResponse(
        generate_and_save(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )