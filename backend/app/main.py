import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import init_db
from app.routes.auth_routes import router as auth_router
from app.routes.chat_routes import router as chat_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="AskLio-chat",
    version="1.0.1",
    description="AI Chatbot Backend with PostgreSQL",
    lifespan=lifespan,
)

# Comma-separated production frontend URLs, for example:
# CORS_ORIGINS=https://your-app.vercel.app,http://localhost:5173
_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
_cors_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]
CORS_ORIGINS = list(dict.fromkeys(_default_origins + _cors_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "Cache-Control"],
    expose_headers=["Content-Type"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])


@app.get("/")
async def root():
    return {"message": "AskLio API running with PostgreSQL", "status": "healthy"}


@app.get("/health")
async def health():
    return {"status": "ok"}
