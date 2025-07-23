from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_current_active_user, get_db
from app.models.user import User

router = APIRouter()


@router.get("/permissions")
async def get_user_permissions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's permissions"""
    permissions = []
    
    if current_user.is_superuser:
        permissions = ["admin", "create_agents", "manage_workflows", "access_store"]
    else:
        permissions = ["create_agents", "manage_workflows"]
    
    return {"permissions": permissions}


@router.get("/roles")
async def get_user_roles(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's roles"""
    roles = []
    
    if current_user.is_superuser:
        roles = ["admin"]
    else:
        roles = ["user"]
    
    return {"roles": roles}