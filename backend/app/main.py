from dotenv import load_dotenv
import os

# Load .env at application startup
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database.database import init_db
from app.routes.auth_routes import router as auth_router
from app.routes.chat_routes import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="AskLio-chat",
    version="1.0.0",
    description="AI Chatbot Backend with PostgreSQL",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
<<<<<<< HEAD
        "https://asklio-chat-24ej1xdkn-mahis-projects-86b8e89b.vercel.app",
=======
        "https://asklio-chat.vercel.app"
>>>>>>> 112712a21c4c9048be4e0a89f225da44f77b2eea
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])


@app.get("/")
async def root():
<<<<<<< HEAD
    return {"message": "AskLio API running with PostgreSQL", "status": "healthy"}
=======
    return {"message": "AskLio backend is running"}


@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "AskLio API"}
>>>>>>> 112712a21c4c9048be4e0a89f225da44f77b2eea
