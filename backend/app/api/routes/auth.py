from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import create_access_token, verify_password, get_password_hash, create_demo_token, is_demo_mode
from app.models.user import User
from app.services.user_service import UserService

router = APIRouter()
security = HTTPBearer()

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    demo_mode: bool = False

@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login endpoint with demo mode support"""
    
    # Demo mode login
    if is_demo_mode() and request.email == "demo@aimpact.dev" and request.password == "demo":
        token = create_demo_token()
        return TokenResponse(
            access_token=token,
            user_id="demo_user",
            demo_mode=True
        )
    
    # Regular login
    user_service = UserService(db)
    user = await user_service.get_user_by_email(request.email)
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled"
        )
    
    access_token = create_access_token(subject=str(user.id))
    
    return TokenResponse(
        access_token=access_token,
        user_id=str(user.id),
        demo_mode=is_demo_mode()
    )

@router.post("/register", response_model=TokenResponse)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """User registration endpoint"""
    
    # Check if demo mode - in demo mode, don't actually create users
    if is_demo_mode():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration disabled in demo mode. Use demo@aimpact.dev / demo to login"
        )
    
    user_service = UserService(db)
    
    # Check if user already exists
    existing_user = await user_service.get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )
    
    # Check username availability
    existing_username = await user_service.get_user_by_username(request.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(request.password)
    user = await user_service.create_user(
        email=request.email,
        username=request.username,
        hashed_password=hashed_password,
        full_name=request.full_name
    )
    
    access_token = create_access_token(subject=str(user.id))
    
    return TokenResponse(
        access_token=access_token,
        user_id=str(user.id),
        demo_mode=False
    )

@router.get("/demo-token", response_model=TokenResponse)
async def get_demo_token():
    """Get demo token for quick access"""
    if not is_demo_mode():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Demo tokens only available in demo mode"
        )
    
    token = create_demo_token()
    return TokenResponse(
        access_token=token,
        user_id="demo_user",
        demo_mode=True
    )