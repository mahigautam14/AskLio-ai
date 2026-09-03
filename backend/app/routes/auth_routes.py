from fastapi import APIRouter, HTTPException, status, Depends
import aiosqlite

from app.models.schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from app.auth.auth_handler import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)
from app.database.database import get_db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, db: aiosqlite.Connection = Depends(get_db)):
    username = user.username.strip()
    email = user.email.strip().lower()
    password = user.password.strip()

    if not username or not email or not password:
        raise HTTPException(status_code=400, detail="All fields are required")

    existing = await db.execute_fetchall(
        "SELECT id FROM users WHERE lower(email) = ? OR lower(username) = ?",
        (email, username.lower())
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )

    hashed = hash_password(password)

    cursor = await db.execute(
        "INSERT INTO users (username, email, hashed_password) VALUES (?, ?, ?)",
        (username, email, hashed)
    )
    await db.commit()

    user_id = cursor.lastrowid
    token = create_access_token({"user_id": user_id, "email": email})

    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, username=username, email=email)
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: aiosqlite.Connection = Depends(get_db)):
    identifier = credentials.identifier.strip().lower()
    password = credentials.password.strip()

    rows = await db.execute_fetchall(
        """
        SELECT id, username, email, hashed_password, created_at
        FROM users
        WHERE lower(email) = ? OR lower(username) = ?
        """,
        (identifier, identifier)
    )

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found. Please use your registered email or username."
        )

    user_row = rows[0]
    user_id, username, email, hashed_password = user_row[0], user_row[1], user_row[2], user_row[3]

    if not verify_password(password, hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )

    token = create_access_token({"user_id": user_id, "email": email})

    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user_id, username=username, email=email)
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    rows = await db.execute_fetchall(
        "SELECT id, username, email, created_at FROM users WHERE id = ?",
        (current_user["user_id"],)
    )

    if not rows:
        raise HTTPException(status_code=404, detail="User not found")

    r = rows[0]
    return UserResponse(id=r[0], username=r[1], email=r[2], created_at=r[3])