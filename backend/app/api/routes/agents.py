from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from uuid import UUID

from app.core.database import get_db
from app.core.security import is_demo_mode
from app.models.user import User
from app.models.agent import Agent, AgentInstance
from app.services.agent_service import AgentService
from app.services.workspace_service import WorkspaceService
from app.api.deps import get_current_user

router = APIRouter()

class AgentResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    workspace_id: str
    created_by: str
    config: Dict[str, Any] = {}
    prompt: Optional[str] = None
    model: str = "gpt-4"
    temperature: float = 0.7
    max_tokens: int = 1000
    capabilities: List[str] = []
    tools: List[Dict[str, Any]] = []
    knowledge_sources: List[str] = []
    voice_config: Optional[Dict[str, Any]] = None
    agent_type: str = "chat"
    is_active: bool = True
    is_published: bool = False
    version: str = "1.0.0"
    total_conversations: int = 0
    average_rating: float = 0.0
    created_at: str
    updated_at: Optional[str] = None

class CreateAgentRequest(BaseModel):
    name: str
    description: Optional[str] = None
    workspace_id: str
    prompt: Optional[str] = None
    model: str = "gpt-4"
    temperature: float = 0.7
    max_tokens: int = 1000
    capabilities: List[str] = []
    tools: List[Dict[str, Any]] = []
    knowledge_sources: List[str] = []
    voice_config: Optional[Dict[str, Any]] = None
    agent_type: str = "chat"

class UpdateAgentRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    prompt: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    capabilities: Optional[List[str]] = None
    tools: Optional[List[Dict[str, Any]]] = None
    knowledge_sources: Optional[List[str]] = None
    voice_config: Optional[Dict[str, Any]] = None

class TestAgentRequest(BaseModel):
    message: str
    context: Dict[str, Any] = {}

class TestAgentResponse(BaseModel):
    response: str
    confidence: float
    processing_time: float
    tokens_used: int
    status: str = "success"

@router.get("/workspace/{workspace_id}", response_model=List[AgentResponse])
async def get_workspace_agents(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all agents for a workspace"""
    
    if is_demo_mode():
        return [
            AgentResponse(
                id="demo_agent_1",
                name="Customer Support Assistant",
                description="AI assistant for customer support queries",
                workspace_id="demo_workspace",
                created_by="demo_user",
                config={},
                prompt="You are a helpful customer support assistant.",
                model="gpt-4",
                temperature=0.7,
                max_tokens=1000,
                capabilities=["customer_support", "multilingual", "sentiment_analysis"],
                tools=[{"name": "knowledge_search", "type": "search"}],
                knowledge_sources=["support_docs", "faq"],
                agent_type="chat",
                is_active=True,
                is_published=False,
                version="1.0.0",
                total_conversations=0,
                average_rating=0.0,
                created_at="2024-01-01T00:00:00Z"
            ),
            AgentResponse(
                id="demo_agent_2",
                name="Voice Sales Assistant",
                description="Voice-enabled sales assistant for phone calls",
                workspace_id="demo_workspace",
                created_by="demo_user",
                config={},
                prompt="You are a professional sales assistant.",
                model="gpt-4",
                temperature=0.8,
                max_tokens=800,
                capabilities=["sales", "lead_qualification", "appointment_scheduling"],
                tools=[{"name": "calendar", "type": "integration"}],
                knowledge_sources=["product_catalog"],
                voice_config={"voice_id": "en-US-Standard-A", "speed": 1.0},
                agent_type="voice",
                is_active=True,
                is_published=False,
                version="1.0.0",
                total_conversations=0,
                average_rating=0.0,
                created_at="2024-01-01T00:00:00Z"
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
    
    agent_service = AgentService(db)
    agents = await agent_service.get_workspace_agents(workspace_id)
    
    return [
        AgentResponse(
            id=str(agent.id),
            name=agent.name,
            description=agent.description,
            workspace_id=str(agent.workspace_id),
            created_by=str(agent.created_by),
            config=agent.config or {},
            prompt=agent.prompt,
            model=agent.model,
            temperature=agent.temperature,
            max_tokens=agent.max_tokens,
            capabilities=agent.capabilities or [],
            tools=agent.tools or [],
            knowledge_sources=agent.knowledge_sources or [],
            voice_config=agent.voice_config,
            agent_type=agent.agent_type,
            is_active=agent.is_active,
            is_published=agent.is_published,
            version=agent.version,
            total_conversations=agent.total_conversations,
            average_rating=agent.average_rating,
            created_at=agent.created_at.isoformat(),
            updated_at=agent.updated_at.isoformat() if agent.updated_at else None
        )
        for agent in agents
    ]

@router.post("/", response_model=AgentResponse)
async def create_agent(
    request: CreateAgentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create new agent"""
    
    if is_demo_mode():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agent creation disabled in demo mode"
        )
    
    # Verify workspace access
    workspace_service = WorkspaceService(db)
    workspace = await workspace_service.get_user_workspace(request.workspace_id, current_user.id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found or access denied"
        )
    
    agent_service = AgentService(db)
    agent = await agent_service.create_agent(
        name=request.name,
        description=request.description,
        workspace_id=request.workspace_id,
        created_by=current_user.id,
        prompt=request.prompt,
        model=request.model,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        capabilities=request.capabilities,
        tools=request.tools,
        knowledge_sources=request.knowledge_sources,
        voice_config=request.voice_config,
        agent_type=request.agent_type
    )
    
    return AgentResponse(
        id=str(agent.id),
        name=agent.name,
        description=agent.description,
        workspace_id=str(agent.workspace_id),
        created_by=str(agent.created_by),
        config=agent.config or {},
        prompt=agent.prompt,
        model=agent.model,
        temperature=agent.temperature,
        max_tokens=agent.max_tokens,
        capabilities=agent.capabilities or [],
        tools=agent.tools or [],
        knowledge_sources=agent.knowledge_sources or [],
        voice_config=agent.voice_config,
        agent_type=agent.agent_type,
        is_active=agent.is_active,
        is_published=agent.is_published,
        version=agent.version,
        total_conversations=agent.total_conversations,
        average_rating=agent.average_rating,
        created_at=agent.created_at.isoformat(),
        updated_at=agent.updated_at.isoformat() if agent.updated_at else None
    )

@router.post("/{agent_id}/test", response_model=TestAgentResponse)
async def test_agent(
    agent_id: str,
    request: TestAgentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Test agent with demo simulation"""
    
    if is_demo_mode():
        return TestAgentResponse(
            response=f"Demo response to: {request.message}",
            confidence=0.95,
            processing_time=0.5,
            tokens_used=25,
            status="success"
        )
    
    agent_service = AgentService(db)
    agent = await agent_service.get_agent_by_id(agent_id)
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Verify workspace access
    workspace_service = WorkspaceService(db)
    workspace = await workspace_service.get_user_workspace(agent.workspace_id, current_user.id)
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace access denied"
        )
    
    # Demo agent testing simulation
    test_result = await agent_service.test_agent(agent, request.message, request.context)
    
    return TestAgentResponse(
        response=test_result["response"],
        confidence=test_result["confidence"],
        processing_time=test_result["processing_time"],
        tokens_used=test_result["tokens_used"],
        status=test_result["status"]
    )