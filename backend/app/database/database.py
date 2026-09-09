from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv
import os

load_dotenv()

# Port 5433 = your actual PostgreSQL port (from pgAdmin log)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://asklio_user:asklio123@127.0.0.1:5433/asklio_db",
)

print(f"[DB] Connecting with URL host/port: {DATABASE_URL.split('@')[-1]}")

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=5,
    max_overflow=5,
    pool_pre_ping=True,
)

async_session = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ PostgreSQL Database initialized successfully")