import aiosqlite
from typing import List, Dict, Optional
from datetime import datetime


async def create_conversation(db: aiosqlite.Connection, user_id: int, title: str = "New Chat") -> dict:
    now = datetime.utcnow().isoformat()
    cursor = await db.execute(
        "INSERT INTO conversations (user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
        (user_id, title, now, now)
    )
    await db.commit()
    
    row = await db.execute_fetchall(
        "SELECT * FROM conversations WHERE id = ?", (cursor.lastrowid,)
    )
    if row:
        r = row[0]
        return {
            "id": r[0], "user_id": r[1], "title": r[2],
            "created_at": r[3], "updated_at": r[4]
        }
    return {"id": cursor.lastrowid, "user_id": user_id, "title": title,
            "created_at": now, "updated_at": now}


async def get_conversations(db: aiosqlite.Connection, user_id: int, search: Optional[str] = None) -> list:
    if search:
        rows = await db.execute_fetchall(
            """SELECT c.id, c.user_id, c.title, c.created_at, c.updated_at 
            FROM conversations c 
            WHERE c.user_id = ? AND (
                c.title LIKE ? OR 
                c.id IN (SELECT conversation_id FROM messages WHERE content LIKE ?)
            )
            ORDER BY c.updated_at DESC""",
            (user_id, f"%{search}%", f"%{search}%")
        )
    else:
        rows = await db.execute_fetchall(
            """SELECT id, user_id, title, created_at, updated_at 
            FROM conversations WHERE user_id = ? 
            ORDER BY updated_at DESC""",
            (user_id,)
        )
    
    return [
        {"id": r[0], "user_id": r[1], "title": r[2],
         "created_at": r[3], "updated_at": r[4]}
        for r in rows
    ]


async def get_conversation(db: aiosqlite.Connection, conversation_id: int, user_id: int) -> Optional[dict]:
    rows = await db.execute_fetchall(
        "SELECT id, user_id, title, created_at, updated_at FROM conversations WHERE id = ? AND user_id = ?",
        (conversation_id, user_id)
    )
    if not rows:
        return None
    r = rows[0]
    return {"id": r[0], "user_id": r[1], "title": r[2],
            "created_at": r[3], "updated_at": r[4]}


async def update_conversation_title(db: aiosqlite.Connection, conversation_id: int, user_id: int, title: str) -> bool:
    now = datetime.utcnow().isoformat()
    cursor = await db.execute(
        "UPDATE conversations SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?",
        (title, now, conversation_id, user_id)
    )
    await db.commit()
    return cursor.rowcount > 0


async def delete_conversation(db: aiosqlite.Connection, conversation_id: int, user_id: int) -> bool:
    await db.execute(
        "DELETE FROM messages WHERE conversation_id = ? AND conversation_id IN (SELECT id FROM conversations WHERE user_id = ?)",
        (conversation_id, user_id)
    )
    cursor = await db.execute(
        "DELETE FROM conversations WHERE id = ? AND user_id = ?",
        (conversation_id, user_id)
    )
    await db.commit()
    return cursor.rowcount > 0


async def add_message(db: aiosqlite.Connection, conversation_id: int, role: str, content: str) -> dict:
    now = datetime.utcnow().isoformat()
    cursor = await db.execute(
        "INSERT INTO messages (conversation_id, role, content, created_at) VALUES (?, ?, ?, ?)",
        (conversation_id, role, content, now)
    )
    await db.execute(
        "UPDATE conversations SET updated_at = ? WHERE id = ?",
        (now, conversation_id)
    )
    await db.commit()
    return {
        "id": cursor.lastrowid, "conversation_id": conversation_id,
        "role": role, "content": content, "created_at": now
    }


async def get_messages(db: aiosqlite.Connection, conversation_id: int) -> list:
    rows = await db.execute_fetchall(
        """SELECT id, conversation_id, role, content, created_at 
        FROM messages WHERE conversation_id = ? 
        ORDER BY created_at ASC""",
        (conversation_id,)
    )
    return [
        {"id": r[0], "conversation_id": r[1], "role": r[2],
         "content": r[3], "created_at": r[4]}
        for r in rows
    ]


async def delete_message_and_after(db: aiosqlite.Connection, conversation_id: int, message_id: int):
    await db.execute(
        "DELETE FROM messages WHERE conversation_id = ? AND id >= ?",
        (conversation_id, message_id)
    )
    await db.commit()


async def get_last_user_message(db: aiosqlite.Connection, conversation_id: int) -> Optional[dict]:
    rows = await db.execute_fetchall(
        """SELECT id, conversation_id, role, content, created_at 
        FROM messages WHERE conversation_id = ? AND role = 'user' 
        ORDER BY created_at DESC LIMIT 1""",
        (conversation_id,)
    )
    if not rows:
        return None
    r = rows[0]
    return {"id": r[0], "conversation_id": r[1], "role": r[2],
            "content": r[3], "created_at": r[4]}