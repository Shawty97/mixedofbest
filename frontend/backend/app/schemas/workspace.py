
from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class WorkspaceBase(BaseModel):
    name: str
    description: Optional[str] = None


class WorkspaceCreate(WorkspaceBase):
    pass


class WorkspaceUpdate(WorkspaceBase):
    name: Optional[str] = None


class WorkspaceInDBBase(WorkspaceBase):
    id: Optional[int] = None
    owner_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Workspace(WorkspaceInDBBase):
    pass
