from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.security import is_demo_mode
from app.models.user import User
from app.models.workspace import Workspace
from app.services.workspace_service import WorkspaceService
from app.api.deps import get_current_user

router = APIRouter()

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    slug: str
    is_active: bool = True
    is_public: bool = False
    owner_id: str
    created_at: str
    updated_at: Optional[str] = None

class CreateWorkspaceRequest(BaseModel):
    name: str
    description: Optional[str] = None
    slug: str
    is_public: bool = False

class UpdateWorkspaceRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

@router.get("/", response_model=List[WorkspaceResponse])
async def get_user_workspaces(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all workspaces for current user"""
    if is_demo_mode():
        return [
            WorkspaceResponse(
                id="demo_workspace",
                name="Demo Workspace",
                description="This is a demo workspace",
                slug="demo-workspace",
                is_active=True,
                is_public=False,
                owner_id="demo_user",
                created_at="2024-01-01T00:00:00Z"
            )
        ]
    
    workspace_service = WorkspaceService(db)
    workspaces = await workspace_service.get_user_workspaces(current_user.id)
    
    return [
        WorkspaceResponse(
            id=str(ws.id),
            name=ws.name,
            description=ws.description,
            slug=ws.slug,
            is_active=ws.is_active,
            is_public=ws.is_public,
            owner_id=str(ws.owner_id),
            created_at=ws.created_at.isoformat(),
            updated_at=ws.updated_at.isoformat() if ws.updated_at else None
        )
        for ws in workspaces
    ]

@router.post("/", response_model=WorkspaceResponse)
async def create_workspace(
    request: CreateWorkspaceRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new workspace"""
    if is_demo_mode():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Workspace creation disabled in demo mode"
        )
    
    workspace_service = WorkspaceService(db)
    
    # Check if slug is available
    existing = await workspace_service.get_workspace_by_slug(request.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Workspace slug already exists"
        )
    
    workspace = await workspace_service.create_workspace(
        name=request.name,
        description=request.description,
        slug=request.slug,
        owner_id=current_user.id,
        is_public=request.is_public
    )
    
    return WorkspaceResponse(
        id=str(workspace.id),
        name=workspace.name,
        description=workspace.description,
        slug=workspace.slug,
        is_active=workspace.is_active,
        is_public=workspace.is_public,
        owner_id=str(workspace.owner_id),
        created_at=workspace.created_at.isoformat(),
        updated_at=workspace.updated_at.isoformat() if workspace.updated_at else None
    )

@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific workspace"""
    if is_demo_mode() and workspace_id == "demo_workspace":
        return WorkspaceResponse(
            id="demo_workspace",
            name="Demo Workspace",
            description="This is a demo workspace",
            slug="demo-workspace",
            is_active=True,
            is_public=False,
            owner_id="demo_user",
            created_at="2024-01-01T00:00:00Z"
        )
    
    workspace_service = WorkspaceService(db)
    workspace = await workspace_service.get_user_workspace(workspace_id, current_user.id)
    
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    
    return WorkspaceResponse(
        id=str(workspace.id),
        name=workspace.name,
        description=workspace.description,
        slug=workspace.slug,
        is_active=workspace.is_active,
        is_public=workspace.is_public,
        owner_id=str(workspace.owner_id),
        created_at=workspace.created_at.isoformat(),
        updated_at=workspace.updated_at.isoformat() if workspace.updated_at else None
    )