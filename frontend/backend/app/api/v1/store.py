"""
Store API - Agent marketplace and templates
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.store import AgentTemplate, DeployedAgent
from app.schemas.store import (
    AgentTemplateResponse, DeployedAgentResponse,
    DeployAgentRequest, AgentTemplateCreate
)

router = APIRouter()

@router.get("/templates", response_model=List[AgentTemplateResponse])
async def get_agent_templates(
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get available agent templates"""
    query = db.query(AgentTemplate)
    
    if category and category != "all":
        query = query.filter(AgentTemplate.category == category)
    
    if search:
        query = query.filter(
            AgentTemplate.name.ilike(f"%{search}%") |
            AgentTemplate.description.ilike(f"%{search}%")
        )
    
    templates = query.offset(skip).limit(limit).all()
    return templates

@router.get("/templates/{template_id}", response_model=AgentTemplateResponse)
async def get_agent_template(
    template_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific agent template"""
    template = db.query(AgentTemplate).filter(
        AgentTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return template

@router.post("/templates/{template_id}/deploy", response_model=DeployedAgentResponse)
async def deploy_template(
    template_id: str,
    deploy_data: DeployAgentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deploy an agent template"""
    template = db.query(AgentTemplate).filter(
        AgentTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    # Create deployed agent
    deployed_agent = DeployedAgent(
        name=deploy_data.name,
        template_id=template_id,
        user_id=current_user.id,
        configuration=deploy_data.configuration,
        status="deploying"
    )
    
    db.add(deployed_agent)
    db.commit()
    db.refresh(deployed_agent)
    
    return deployed_agent

@router.get("/deployed", response_model=List[DeployedAgentResponse])
async def get_deployed_agents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's deployed agents"""
    agents = db.query(DeployedAgent).filter(
        DeployedAgent.user_id == current_user.id
    ).all()
    return agents

@router.get("/analytics")
async def get_store_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get store analytics for user's deployed agents"""
    deployed_agents = db.query(DeployedAgent).filter(
        DeployedAgent.user_id == current_user.id
    ).all()
    
    total_agents = len(deployed_agents)
    active_agents = len([a for a in deployed_agents if a.status == "active"])
    
    # Mock analytics data
    analytics = {
        "total_deployed": total_agents,
        "active_agents": active_agents,
        "total_calls_today": sum([a.calls_today for a in deployed_agents]),
        "success_rate": 94.2,
        "popular_templates": [
            {"name": "Customer Support Pro", "deployments": 45},
            {"name": "Sales Assistant Elite", "deployments": 32},
            {"name": "Healthcare Scheduler", "deployments": 18}
        ]
    }
    
    return analytics