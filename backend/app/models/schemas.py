from pydantic import BaseModel, Field
from typing import Optional, List


class UserCreate(BaseModel):
    username: str = Field(
        ...,
        min_length=3,
        max_length=20,
        pattern=r"^[A-Za-z0-9_]+$"
    )
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    identifier: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=10000)


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: Optional[str] = None


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Chat"


class ConversationUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)


class ConversationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ConversationWithMessages(ConversationResponse):
    messages: List[MessageResponse] = []


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: Optional[int] = None


class ErrorResponse(BaseModel):
    detail: str