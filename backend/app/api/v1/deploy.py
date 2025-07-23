"""
Deploy API - Deployment and infrastructure management
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.deployment import Deployment
from app.schemas.deployment import (
    DeploymentCreate, DeploymentResponse, DeploymentUpdate
)
from app.services.deployment import DeploymentService

router = APIRouter()
deployment_service = DeploymentService()

@router.get("/", response_model=List[DeploymentResponse])
async def get_deployments(
    environment: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's deployments"""
    query = db.query(Deployment).filter(Deployment.user_id == current_user.id)
    
    if environment:
        query = query.filter(Deployment.environment == environment)
    
    if status_filter:
        query = query.filter(Deployment.status == status_filter)
    
    deployments = query.all()
    return deployments

@router.post("/", response_model=DeploymentResponse)
async def create_deployment(
    deployment_data: DeploymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new deployment"""
    deployment = await deployment_service.create_deployment(
        deployment_data, current_user.id, db
    )
    return deployment

@router.get("/{deployment_id}", response_model=DeploymentResponse)
async def get_deployment(
    deployment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific deployment"""
    deployment = db.query(Deployment).filter(
        Deployment.id == deployment_id,
        Deployment.user_id == current_user.id
    ).first()
    
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found"
        )
    return deployment

@router.post("/{deployment_id}/start")
async def start_deployment(
    deployment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start a deployment"""
    deployment = db.query(Deployment).filter(
        Deployment.id == deployment_id,
        Deployment.user_id == current_user.id
    ).first()
    
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found"
        )
    
    await deployment_service.start_deployment(deployment)
    return {"status": "starting"}

@router.post("/{deployment_id}/stop")
async def stop_deployment(
    deployment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Stop a deployment"""
    deployment = db.query(Deployment).filter(
        Deployment.id == deployment_id,
        Deployment.user_id == current_user.id
    ).first()
    
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found"
        )
    
    await deployment_service.stop_deployment(deployment)
    return {"status": "stopping"}

@router.get("/infrastructure/stats")
async def get_infrastructure_stats(
    current_user: User = Depends(get_current_user)
):
    """Get infrastructure statistics"""
    stats = await deployment_service.get_infrastructure_stats(current_user.id)
    return stats

@router.get("/regions")
async def get_available_regions():
    """Get available deployment regions"""
    return [
        {"id": "us-east-1", "name": "US East (N. Virginia)"},
        {"id": "us-west-2", "name": "US West (Oregon)"},
        {"id": "eu-west-1", "name": "Europe (Ireland)"},
        {"id": "ap-southeast-1", "name": "Asia Pacific (Singapore)"}
    ]