"""
Studio API - Agent creation and management
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.agent import Agent
from app.schemas.agent import (
    AgentCreate, AgentUpdate, AgentResponse
)
from app.core.agent_engine import AgentEngine

router = APIRouter()
agent_engine = AgentEngine()

@router.get("/", response_model=List[AgentResponse])
async def get_agents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all agents for the current user"""
    agents = db.query(Agent).filter(
        Agent.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return agents

@router.post("/", response_model=AgentResponse)
async def create_agent(
    agent_data: AgentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new agent"""
    agent = Agent(
        **agent_data.dict(),
        user_id=current_user.id
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific agent"""
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == current_user.id
    ).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    return agent

@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    agent_data: AgentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an agent"""
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == current_user.id
    ).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    for field, value in agent_data.dict(exclude_unset=True).items():
        setattr(agent, field, value)
    
    db.commit()
    db.refresh(agent)
    return agent

@router.delete("/{agent_id}")
async def delete_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an agent"""
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == current_user.id
    ).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    db.delete(agent)
    db.commit()
    return {"message": "Agent deleted successfully"}

@router.post("/{agent_id}/test")
async def test_agent(
    agent_id: str,
    test_message: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Test an agent with a message"""
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == current_user.id
    ).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Test the agent
    response = await agent_engine.test_agent(agent, test_message)
    return {"response": response}

@router.post("/{agent_id}/deploy")
async def deploy_agent(
    agent_id: str,
    environment: str = "development",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deploy an agent to an environment"""
    agent = db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.user_id == current_user.id
    ).first()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    deployment = await agent_engine.deploy_agent(agent, environment)
    return {"deployment_id": deployment["id"], "status": deployment["status"]}