from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func


from app.models.schemas import User, UserCreate, UserLogin, TokenResponse, UserResponse
from app.auth.auth_handler import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.database.database import get_db

router = APIRouter()

@router.post("/signup", status_code=status.HTTP_201_CREATED)
@router.post("/register", status_code=status.HTTP_201_CREATED)
# @router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    username = user.username.strip()
    email = user.email.strip().lower()
    password = user.password.strip()

    if not username or not email or not password:
        raise HTTPException(status_code=400, detail="All fields are required")

    result = await db.execute(
        select(User).where(
            or_(
                func.lower(User.email) == email,
                func.lower(User.username) == username.lower(),
            )
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists",
        )

    new_user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token({"user_id": new_user.id, "email": new_user.email})

    return TokenResponse(
        access_token=token,
        user=UserResponse(id=new_user.id, username=new_user.username, email=new_user.email),
    )

@router.post("/login")
@router.post("/signin")
# @router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    identifier = credentials.identifier.strip().lower()
    password = credentials.password.strip()

    result = await db.execute(
        select(User).where(
            or_(
                func.lower(User.email) == identifier,
                func.lower(User.username) == identifier,
            )
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found. Please use your registered email or username.",
        )

    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
        )

    token = create_access_token({"user_id": user.id, "email": user.email})

    return TokenResponse(
        access_token=token,
        user=UserResponse(id=user.id, username=user.username, email=user.email),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == current_user["user_id"]))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(id=user.id, username=user.username, email=user.email)
