from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import verify_token, is_demo_mode
from app.models.user import User
from app.services.user_service import UserService
from app.api.deps import get_current_user

router = APIRouter()

class UserProfile(BaseModel):
    id: str
    email: str
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    is_demo_user: bool = False

class UpdateUserRequest(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user profile"""
    if is_demo_mode():
        return UserProfile(
            id="demo_user",
            email="demo@aimpact.dev",
            username="demo_user",
            full_name="Demo User",
            bio="This is a demo user account",
            company="AImpact Demo",
            role="Admin",
            is_demo_user=True
        )
    
    return UserProfile(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        bio=current_user.bio,
        company=current_user.company,
        role=current_user.role,
        is_demo_user=current_user.is_demo_user
    )

@router.put("/me", response_model=UserProfile)
async def update_user_profile(
    request: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user profile"""
    if is_demo_mode():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Profile updates disabled in demo mode"
        )
    
    user_service = UserService(db)
    updated_user = await user_service.update_user(
        current_user,
        **request.dict(exclude_unset=True)
    )
    
    return UserProfile(
        id=str(updated_user.id),
        email=updated_user.email,
        username=updated_user.username,
        full_name=updated_user.full_name,
        avatar_url=updated_user.avatar_url,
        bio=updated_user.bio,
        company=updated_user.company,
        role=updated_user.role,
        is_demo_user=updated_user.is_demo_user
    )