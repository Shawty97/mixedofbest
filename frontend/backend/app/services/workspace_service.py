from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.models.workspace import Workspace, WorkspaceMember

class WorkspaceService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_user_workspaces(self, user_id: str) -> List[Workspace]:
        """Get all workspaces for a user (owned or member)"""
        query = select(Workspace).where(
            Workspace.owner_id == user_id
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_workspace_by_id(self, workspace_id: str) -> Optional[Workspace]:
        """Get workspace by ID"""
        query = select(Workspace).where(Workspace.id == workspace_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_workspace_by_slug(self, slug: str) -> Optional[Workspace]:
        """Get workspace by slug"""
        query = select(Workspace).where(Workspace.slug == slug)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_user_workspace(self, workspace_id: str, user_id: str) -> Optional[Workspace]:
        """Get workspace if user has access to it"""
        query = select(Workspace).where(
            Workspace.id == workspace_id,
            Workspace.owner_id == user_id
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def create_workspace(
        self,
        name: str,
        slug: str,
        owner_id: str,
        description: Optional[str] = None,
        is_public: bool = False
    ) -> Workspace:
        """Create new workspace"""
        workspace = Workspace(
            name=name,
            description=description,
            slug=slug,
            owner_id=owner_id,
            is_public=is_public
        )
        
        self.db.add(workspace)
        await self.db.flush()
        await self.db.refresh(workspace)
        
        return workspace
    
    async def update_workspace(self, workspace: Workspace, **kwargs) -> Workspace:
        """Update workspace fields"""
        for key, value in kwargs.items():
            if hasattr(workspace, key):
                setattr(workspace, key, value)
        
        await self.db.flush()
        await self.db.refresh(workspace)
        
        return workspace
    
    async def delete_workspace(self, workspace: Workspace) -> bool:
        """Soft delete workspace"""
        workspace.is_active = False
        await self.db.flush()
        return True