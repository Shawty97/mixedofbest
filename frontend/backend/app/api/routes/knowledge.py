from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from uuid import UUID

from app.core.database import get_db
from app.core.security import is_demo_mode
from app.models.user import User
from app.models.knowledge import KnowledgeSource, KnowledgeChunk
from app.services.knowledge_service import KnowledgeService
from app.services.workspace_service import WorkspaceService
from app.api.deps import get_current_user

router = APIRouter()

class KnowledgeSourceResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    workspace_id: str
    created_by: str
    source_type: str
    source_url: Optional[str] = None
    content: Optional[str] = None
    processing_config: Dict[str, Any] = {}
    chunk_size: int = 1000
    chunk_overlap: int = 200
    status: str = "pending"
    is_active: bool = True
    total_chunks: int = 0
    file_size: Optional[int] = None
    created_at: str
    updated_at: Optional[str] = None
    processed_at: Optional[str] = None

class CreateKnowledgeSourceRequest(BaseModel):
    name: str
    description: Optional[str] = None
    workspace_id: str
    source_type: str
    source_url: Optional[str] = None
    content: Optional[str] = None
    chunk_size: int = 1000
    chunk_overlap: int = 200

class SearchKnowledgeRequest(BaseModel):
    query: str
    workspace_id: str
    limit: int = 10
    source_ids: Optional[List[str]] = None

class KnowledgeChunkResponse(BaseModel):
    id: str
    content: str
    chunk_index: int
    source_id: str
    source_name: str
    metadata: Dict[str, Any] = {}
    relevance_score: Optional[float] = None

class SearchKnowledgeResponse(BaseModel):
    query: str
    results: List[KnowledgeChunkResponse]
    total_results: int
    processing_time: float

@router.get("/workspace/{workspace_id}", response_model=List[KnowledgeSourceResponse])
async def get_workspace_knowledge_sources(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all knowledge sources for a workspace"""
    
    if is_demo_mode():
        return [
            KnowledgeSourceResponse(
                id="demo_knowledge_1",
                name="Customer Support FAQ",
                description="Frequently asked questions for customer support",
                workspace_id="demo_workspace",
                created_by="demo_user",
                source_type="text",
                content="Q: How do I reset my password? A: You can reset your password by...",
                processing_config={},
                chunk_size=1000,
                chunk_overlap=200,
                status="ready",
                is_active=True,
                total_chunks=15,
                file_size=5120,
                created_at="2024-01-01T00:00:00Z",
                processed_at="2024-01-01T00:01:00Z"
            ),
            KnowledgeSourceResponse(
                id="demo_knowledge_2",
                name="Product Documentation",
                description="Complete product documentation and user guides",
                workspace_id="demo_workspace",
                created_by="demo_user",
                source_type="url",
                source_url="https://docs.example.com",
                processing_config={},
                chunk_size=1500,
                chunk_overlap=300,
                status="ready",
                is_active=True,
                total_chunks=42,
                file_size=25600,
                created_at="2024-01-01T00:00:00Z",
                processed_at="2024-01-01T00:02:00Z"
            )
        ]
    
    # Verify workspace access
    workspace_service = WorkspaceService(db)
    workspace = await workspace_service.get_user_workspace(workspace_id, current_user.id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or access denied"
        )
    
    knowledge_service = KnowledgeService(db)
    sources = await knowledge_service.get_workspace_knowledge_sources(workspace_id)
    
    return [
        KnowledgeSourceResponse(
            id=str(source.id),
            name=source.name,
            description=source.description,
            workspace_id=str(source.workspace_id),
            created_by=str(source.created_by),
            source_type=source.source_type,
            source_url=source.source_url,
            content=source.content,
            processing_config=source.processing_config or {},
            chunk_size=source.chunk_size,
            chunk_overlap=source.chunk_overlap,
            status=source.status,
            is_active=source.is_active,
            total_chunks=source.total_chunks,
            file_size=source.file_size,
            created_at=source.created_at.isoformat(),
            updated_at=source.updated_at.isoformat() if source.updated_at else None,
            processed_at=source.processed_at.isoformat() if source.processed_at else None
        )
        for source in sources
    ]

@router.post("/", response_model=KnowledgeSourceResponse)
async def create_knowledge_source(
    request: CreateKnowledgeSourceRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new knowledge source"""
    
    if is_demo_mode():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Knowledge source creation disabled in demo mode"
        )
    
    # Verify workspace access
    workspace_service = WorkspaceService(db)
    workspace = await workspace_service.get_user_workspace(request.workspace_id, current_user.id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or access denied"
        )
    
    knowledge_service = KnowledgeService(db)
    source = await knowledge_service.create_knowledge_source(
        name=request.name,
        description=request.description,
        workspace_id=request.workspace_id,
        created_by=current_user.id,
        source_type=request.source_type,
        source_url=request.source_url,
        content=request.content,
        chunk_size=request.chunk_size,
        chunk_overlap=request.chunk_overlap
    )
    
    return KnowledgeSourceResponse(
        id=str(source.id),
        name=source.name,
        description=source.description,
        workspace_id=str(source.workspace_id),
        created_by=str(source.created_by),
        source_type=source.source_type,
        source_url=source.source_url,
        content=source.content,
        processing_config=source.processing_config or {},
        chunk_size=source.chunk_size,
        chunk_overlap=source.chunk_overlap,
        status=source.status,
        is_active=source.is_active,
        total_chunks=source.total_chunks,
        file_size=source.file_size,
        created_at=source.created_at.isoformat(),
        updated_at=source.updated_at.isoformat() if source.updated_at else None,
        processed_at=source.processed_at.isoformat() if source.processed_at else None
    )

@router.post("/search", response_model=SearchKnowledgeResponse)
async def search_knowledge(
    request: SearchKnowledgeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Search knowledge base"""
    
    if is_demo_mode():
        demo_results = [
            KnowledgeChunkResponse(
                id="demo_chunk_1",
                content=f"Demo knowledge result for query: {request.query}",
                chunk_index=1,
                source_id="demo_knowledge_1",
                source_name="Customer Support FAQ",
                metadata={"section": "passwords", "type": "faq"},
                relevance_score=0.95
            ),
            KnowledgeChunkResponse(
                id="demo_chunk_2",
                content=f"Additional context related to: {request.query}",
                chunk_index=2,
                source_id="demo_knowledge_2",
                source_name="Product Documentation",
                metadata={"section": "user_guide", "type": "documentation"},
                relevance_score=0.87
            )
        ]
        
        return SearchKnowledgeResponse(
            query=request.query,
            results=demo_results[:request.limit],
            total_results=len(demo_results),
            processing_time=0.15
        )
    
    # Verify workspace access
    workspace_service = WorkspaceService(db)
    workspace = await workspace_service.get_user_workspace(request.workspace_id, current_user.id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or access denied"
        )
    
    knowledge_service = KnowledgeService(db)
    search_results = await knowledge_service.search_knowledge(
        query=request.query,
        workspace_id=request.workspace_id,
        limit=request.limit,
        source_ids=request.source_ids
    )
    
    return SearchKnowledgeResponse(
        query=request.query,
        results=[
            KnowledgeChunkResponse(
                id=str(chunk.id),
                content=chunk.content,
                chunk_index=chunk.chunk_index,
                source_id=str(chunk.source_id),
                source_name=chunk.source.name,
                metadata=chunk.metadata or {},
                relevance_score=chunk.relevance_score
            )
            for chunk in search_results["chunks"]
        ],
        total_results=search_results["total"],
        processing_time=search_results["processing_time"]
    )

@router.post("/upload", response_model=KnowledgeSourceResponse)
async def upload_knowledge_file(
    workspace_id: str,
    file: UploadFile = File(...),
    name: Optional[str] = None,
    description: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload file for knowledge processing"""
    
    if is_demo_mode():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="File upload disabled in demo mode"
        )
    
    # Verify workspace access
    workspace_service = WorkspaceService(db)
    workspace = await workspace_service.get_user_workspace(workspace_id, current_user.id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or access denied"
        )
    
    # Read file content
    content = await file.read()
    
    knowledge_service = KnowledgeService(db)
    source = await knowledge_service.create_knowledge_source_from_file(
        name=name or file.filename,
        description=description,
        workspace_id=workspace_id,
        created_by=current_user.id,
        file_content=content,
        file_name=file.filename,
        content_type=file.content_type
    )
    
    return KnowledgeSourceResponse(
        id=str(source.id),
        name=source.name,
        description=source.description,
        workspace_id=str(source.workspace_id),
        created_by=str(source.created_by),
        source_type=source.source_type,
        source_url=source.source_url,
        content=source.content,
        processing_config=source.processing_config or {},
        chunk_size=source.chunk_size,
        chunk_overlap=source.chunk_overlap,
        status=source.status,
        is_active=source.is_active,
        total_chunks=source.total_chunks,
        file_size=source.file_size,
        created_at=source.created_at.isoformat(),
        updated_at=source.updated_at.isoformat() if source.updated_at else None,
        processed_at=source.processed_at.isoformat() if source.processed_at else None
    )