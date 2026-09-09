import os
from urllib.parse import urlsplit, urlunsplit

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker


raw_database_url = os.getenv("DATABASE_URL", "").strip()
if not raw_database_url:
    raise RuntimeError("DATABASE_URL is required")

# Render/Postgres may provide postgres:// or postgresql:// URLs.
# SQLAlchemy's async engine requires the asyncpg driver.
if raw_database_url.startswith("postgres://"):
    DATABASE_URL = raw_database_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif raw_database_url.startswith("postgresql://") and "+asyncpg" not in raw_database_url:
    DATABASE_URL = raw_database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    DATABASE_URL = raw_database_url

# asyncpg does not understand sslmode as a libpq URL query parameter.
# Render's managed Postgres requires TLS, so translate it to an asyncpg option.
parts = urlsplit(DATABASE_URL)
query_pairs = [pair for pair in parts.query.split("&") if pair]
kept_pairs = []
sslmode = None
for pair in query_pairs:
    key, sep, value = pair.partition("=")
    if key.lower() == "sslmode":
        sslmode = value.lower() or "require"
    elif key:
        kept_pairs.append(pair)

DATABASE_URL = urlunsplit(
    (parts.scheme, parts.netloc, parts.path, "&".join(kept_pairs), parts.fragment)
)

connect_args = {}
if sslmode and sslmode not in {"disable", "allow", "prefer"}:
    connect_args["ssl"] = "require"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    connect_args=connect_args,
)

async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
AsyncSessionLocal = async_session

Base = declarative_base()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("PostgreSQL database initialized successfully")


async def get_db():
    async with async_session() as session:
        yield session
