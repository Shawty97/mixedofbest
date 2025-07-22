from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.voice_agent import VoiceAgent, VoiceInteraction
from app.services.embedding_service import embedding_service
from app.services.qdrant_service import qdrant_service

router = APIRouter()

@router.post("/voice-agents/")
async def create_voice_agent(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    name: str,
    description: Optional[str] = None,
    avatar: Optional[str] = None,
    voice_id: Optional[str] = None,
    voice_settings: Optional[dict] = None,
    system_prompt: Optional[str] = None,
):
    """Create a new voice agent"""
    try:
        # Create vector collection if needed
        collection_name = f"agent_{str(uuid.uuid4())}"
        await qdrant_service.init_collection()
        
        # Create agent
        agent = VoiceAgent(
            user_id=current_user.id,
            name=name,
            description=description,
            avatar=avatar,
            voice_id=voice_id,
            voice_settings=voice_settings or {},
            system_prompt=system_prompt,
            vector_collection=collection_name
        )
        
        # Add initial embeddings if system prompt provided
        if system_prompt:
            embeddings = await embedding_service.get_embeddings([system_prompt])
            if embeddings:
                await qdrant_service.upsert_vectors(
                    vectors=embeddings,
                    ids=[str(uuid.uuid4())],
                    payloads=[{"type": "system_prompt", "text": system_prompt}]
                )
        
        db.add(agent)
        db.commit()
        db.refresh(agent)
        
        return agent.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/voice-agents/")
async def list_voice_agents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    offset: int = 0,
    limit: int = 10,
):
    """List all voice agents for the current user"""
    try:
        agents = db.query(VoiceAgent).filter(
            VoiceAgent.user_id == current_user.id
        ).offset(offset).limit(limit).all()
        
        return [agent.to_dict() for agent in agents]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/voice-agents/{agent_id}")
async def get_voice_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific voice agent"""
    agent = db.query(VoiceAgent).filter(
        VoiceAgent.id == agent_id,
        VoiceAgent.user_id == current_user.id
    ).first()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Voice agent not found")
        
    return agent.to_dict()

@router.put("/voice-agents/{agent_id}")
async def update_voice_agent(
    *,
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    name: Optional[str] = None,
    description: Optional[str] = None,
    avatar: Optional[str] = None,
    voice_id: Optional[str] = None,
    voice_settings: Optional[dict] = None,
    system_prompt: Optional[str] = None,
):
    """Update a voice agent"""
    try:
        agent = db.query(VoiceAgent).filter(
            VoiceAgent.id == agent_id,
            VoiceAgent.user_id == current_user.id
        ).first()
        
        if not agent:
            raise HTTPException(status_code=404, detail="Voice agent not found")
            
        # Update fields if provided
        if name is not None:
            agent.name = name
        if description is not None:
            agent.description = description
        if avatar is not None:
            agent.avatar = avatar
        if voice_id is not None:
            agent.voice_id = voice_id
        if voice_settings is not None:
            agent.voice_settings = voice_settings
        if system_prompt is not None:
            agent.system_prompt = system_prompt
            # Update embeddings
            embeddings = await embedding_service.get_embeddings([system_prompt])
            if embeddings:
                await qdrant_service.upsert_vectors(
                    vectors=embeddings,
                    ids=[str(uuid.uuid4())],
                    payloads=[{"type": "system_prompt", "text": system_prompt}]
                )
        
        agent.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(agent)
        
        return agent.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/voice-agents/{agent_id}")
async def delete_voice_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a voice agent"""
    try:
        agent = db.query(VoiceAgent).filter(
            VoiceAgent.id == agent_id,
            VoiceAgent.user_id == current_user.id
        ).first()
        
        if not agent:
            raise HTTPException(status_code=404, detail="Voice agent not found")
            
        # Delete vector collection
        if agent.vector_collection:
            await qdrant_service.delete_collection(agent.vector_collection)
            
        db.delete(agent)
        db.commit()
        
        return {"message": "Voice agent deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/voice-agents/{agent_id}/interactions")
async def create_interaction(
    *,
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    session_id: str,
    user_input: str,
    agent_response: str,
    user_audio_url: Optional[str] = None,
    agent_audio_url: Optional[str] = None,
    tokens_used: Optional[int] = None,
    response_time: Optional[float] = None,
    user_rating: Optional[int] = None,
):
    """Create a new voice interaction"""
    try:
        # Verify agent exists and belongs to user
        agent = db.query(VoiceAgent).filter(
            VoiceAgent.id == agent_id,
            VoiceAgent.user_id == current_user.id
        ).first()
        
        if not agent:
            raise HTTPException(status_code=404, detail="Voice agent not found")
            
        # Create interaction
        interaction = VoiceInteraction(
            voice_agent_id=agent_id,
            user_id=current_user.id,
            session_id=session_id,
            user_input=user_input,
            agent_response=agent_response,
            user_audio_url=user_audio_url,
            agent_audio_url=agent_audio_url,
            tokens_used=tokens_used,
            response_time=response_time,
            user_rating=user_rating
        )
        
        db.add(interaction)
        
        # Update agent metrics
        agent.total_interactions += 1
        if response_time:
            # Update average response time
            agent.avg_response_time = (
                (agent.avg_response_time * (agent.total_interactions - 1) + response_time)
                / agent.total_interactions
            )
        
        db.commit()
        db.refresh(interaction)
        
        return interaction.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/voice-agents/{agent_id}/interactions")
async def list_interactions(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    offset: int = 0,
    limit: int = 10,
):
    """List interactions for a voice agent"""
    try:
        interactions = db.query(VoiceInteraction).filter(
            VoiceInteraction.voice_agent_id == agent_id,
            VoiceInteraction.user_id == current_user.id
        ).order_by(VoiceInteraction.created_at.desc()).offset(offset).limit(limit).all()
        
        return [interaction.to_dict() for interaction in interactions]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/voice-agents/{agent_id}/metrics")
async def get_agent_metrics(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get performance metrics for a voice agent"""
    try:
        agent = db.query(VoiceAgent).filter(
            VoiceAgent.id == agent_id,
            VoiceAgent.user_id == current_user.id
        ).first()
        
        if not agent:
            raise HTTPException(status_code=404, detail="Voice agent not found")
            
        # Get recent interactions
        recent_interactions = db.query(VoiceInteraction).filter(
            VoiceInteraction.voice_agent_id == agent_id
        ).order_by(VoiceInteraction.created_at.desc()).limit(100).all()
        
        # Calculate metrics
        total_tokens = sum(i.tokens_used or 0 for i in recent_interactions)
        avg_tokens = total_tokens / len(recent_interactions) if recent_interactions else 0
        
        avg_rating = sum(i.user_rating or 0 for i in recent_interactions if i.user_rating) / \
                    len([i for i in recent_interactions if i.user_rating]) if recent_interactions else 0
        
        return {
            "total_interactions": agent.total_interactions,
            "avg_response_time": agent.avg_response_time,
            "avg_tokens_per_interaction": avg_tokens,
            "avg_user_rating": avg_rating,
            "total_tokens_last_100": total_tokens,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))