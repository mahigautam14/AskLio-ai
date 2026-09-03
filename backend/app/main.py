from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import init_db
from app.routes.auth_routes import router as auth_router
from app.routes.chat_routes import router as chat_router

app = FastAPI(
    title="AskLio-chat",
    description="AI Chatbot Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chat_router)


@app.on_event("startup")
async def startup():
    await init_db()


@app.get("/")
async def root():
    return {"message": "AskLio backend is running"}


@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "AskLio API"}