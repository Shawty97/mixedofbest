from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from uuid import UUID
import asyncio
import random

from app.models.agent import Agent, AgentInstance

class AgentService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_workspace_agents(self, workspace_id: str) -> List[Agent]:
        """Get all agents for a workspace"""
        query = select(Agent).where(
            Agent.workspace_id == workspace_id,
            Agent.is_active == True
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_agent_by_id(self, agent_id: str) -> Optional[Agent]:
        """Get agent by ID"""
        query = select(Agent).where(Agent.id == agent_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def create_agent(
        self,
        name: str,
        workspace_id: str,
        created_by: str,
        description: Optional[str] = None,
        prompt: Optional[str] = None,
        model: str = "gpt-4",
        temperature: float = 0.7,
        max_tokens: int = 1000,
        capabilities: Optional[List[str]] = None,
        tools: Optional[List[Dict]] = None,
        knowledge_sources: Optional[List[str]] = None,
        voice_config: Optional[Dict] = None,
        agent_type: str = "chat"
    ) -> Agent:
        """Create new agent"""
        agent = Agent(
            name=name,
            description=description,
            workspace_id=workspace_id,
            created_by=created_by,
            prompt=prompt,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            capabilities=capabilities or [],
            tools=tools or [],
            knowledge_sources=knowledge_sources or [],
            voice_config=voice_config,
            agent_type=agent_type
        )
        
        self.db.add(agent)
        await self.db.flush()
        await self.db.refresh(agent)
        
        return agent
    
    async def update_agent(self, agent: Agent, **kwargs) -> Agent:
        """Update agent fields"""
        for key, value in kwargs.items():
            if hasattr(agent, key):
                setattr(agent, key, value)
        
        await self.db.flush()
        await self.db.refresh(agent)
        
        return agent
    
    async def test_agent(
        self,
        agent: Agent,
        message: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Test agent with demo simulation"""
        
        # Simulate processing delay
        await asyncio.sleep(0.3)
        
        # Demo response based on agent type and capabilities
        if agent.agent_type == "voice":
            demo_responses = [
                f"Hello! I'm {agent.name}. How can I help you today?",
                f"Thank you for your message: '{message}'. Let me assist you with that.",
                f"As your {agent.agent_type} assistant, I'm here to help you efficiently.",
            ]
        else:
            demo_responses = [
                f"Hello! I understand you said: '{message}'. Let me help you with that.",
                f"Based on your query about '{message}', here's what I can tell you...",
                f"Thank you for reaching out. Regarding '{message}', I'd be happy to assist.",
            ]
        
        # Add capability-specific responses
        if "customer_support" in (agent.capabilities or []):
            demo_responses.append("I'm specialized in customer support and ready to resolve your issue.")
        
        if "multilingual" in (agent.capabilities or []):
            demo_responses.append("I can communicate in multiple languages if needed.")
        
        if "sentiment_analysis" in (agent.capabilities or []):
            demo_responses.append("I've analyzed the sentiment of your message and will respond appropriately.")
        
        # Select random response
        response = random.choice(demo_responses)
        
        return {
            "response": response,
            "confidence": round(random.uniform(0.85, 0.98), 2),
            "processing_time": round(random.uniform(0.2, 0.8), 2),
            "tokens_used": random.randint(15, 50),
            "status": "success",
            "model_used": agent.model,
            "capabilities_used": agent.capabilities[:2] if agent.capabilities else []
        }
    
    async def create_agent_instance(
        self,
        agent: Agent,
        instance_name: str,
        runtime_config: Optional[Dict] = None
    ) -> AgentInstance:
        """Create agent instance for deployment"""
        instance = AgentInstance(
            agent_id=agent.id,
            instance_name=instance_name,
            status="stopped",
            runtime_config=runtime_config or {}
        )
        
        self.db.add(instance)
        await self.db.flush()
        await self.db.refresh(instance)
        
        return instance
    
    async def get_agent_instances(self, agent_id: str) -> List[AgentInstance]:
        """Get all instances for an agent"""
        query = select(AgentInstance).where(AgentInstance.agent_id == agent_id)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def start_agent_instance(self, instance: AgentInstance) -> bool:
        """Start agent instance (demo simulation)"""
        instance.status = "running"
        instance.endpoint_url = f"https://demo-agent-{instance.id}.aimpact.dev"
        await self.db.flush()
        return True
    
    async def stop_agent_instance(self, instance: AgentInstance) -> bool:
        """Stop agent instance"""
        instance.status = "stopped"
        instance.endpoint_url = None
        await self.db.flush()
        return True