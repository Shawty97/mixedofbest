"""Universal Agent Service - Minimal implementation for workflow management"""

import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class UniversalAgentService:
    """Minimal service for managing universal agents and workflows"""
    
    def __init__(self):
        # Simple in-memory storage - minimal implementation
        self.agents: Dict[str, Dict[str, Any]] = {}
        self.workflows: Dict[str, Dict[str, Any]] = {}
        self.tasks: Dict[str, Dict[str, Any]] = {}
        
        # Basic agent templates
        self.templates = {
            "sales_specialist": {
                "id": "sales_specialist",
                "name": "Sales Specialist",
                "description": "Specialized in sales processes and customer engagement",
                "category": "sales",
                "capabilities": ["lead_qualification", "product_demo", "objection_handling"]
            },
            "customer_success": {
                "id": "customer_success", 
                "name": "Customer Success Manager",
                "description": "Focused on customer retention and satisfaction",
                "category": "support",
                "capabilities": ["customer_onboarding", "issue_resolution", "account_management"]
            }
        }
    
    async def get_agent_templates(self) -> List[Dict[str, Any]]:
        """Get available agent templates"""
        return list(self.templates.values())
    
    async def create_universal_agent(
        self, 
        template_id: str, 
        name: str, 
        config: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None
    ) -> str:
        """Create a new universal agent"""
        if template_id not in self.templates:
            raise ValueError(f"Template {template_id} not found")
        
        agent_id = f"ua_{uuid.uuid4().hex[:8]}"
        template = self.templates[template_id]
        
        agent = {
            "id": agent_id,
            "name": name,
            "template_id": template_id,
            "category": template["category"],
            "capabilities": template["capabilities"].copy(),
            "status": "active",
            "created_at": datetime.utcnow().isoformat(),
            "config": config or {},
            "user_id": user_id,
            "metrics": {"tasks_completed": 0, "workflows_executed": 0}
        }
        
        self.agents[agent_id] = agent
        logger.info(f"Created universal agent: {agent_id}")
        return agent_id
    
    async def get_universal_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get universal agent by ID"""
        return self.agents.get(agent_id)
    
    async def get_all_universal_agents(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all universal agents"""
        agents = list(self.agents.values())
        if user_id:
            agents = [a for a in agents if a.get("user_id") == user_id]
        return agents
    
    async def create_workflow(
        self, 
        name: str, 
        agent_ids: List[str], 
        steps: List[Dict[str, Any]],
        user_id: Optional[str] = None
    ) -> str:
        """Create a new workflow"""
        workflow_id = f"wf_{uuid.uuid4().hex[:8]}"
        
        workflow = {
            "id": workflow_id,
            "name": name,
            "agent_ids": agent_ids,
            "steps": steps,
            "status": "created",
            "created_at": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "execution_history": []
        }
        
        self.workflows[workflow_id] = workflow
        logger.info(f"Created workflow: {workflow_id}")
        return workflow_id
    
    async def get_workflow(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get workflow by ID"""
        return self.workflows.get(workflow_id)
    
    async def execute_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Execute a workflow - minimal implementation"""
        workflow = self.workflows.get(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        # Simple execution simulation
        execution_id = f"exec_{uuid.uuid4().hex[:8]}"
        execution = {
            "id": execution_id,
            "workflow_id": workflow_id,
            "status": "completed",
            "started_at": datetime.utcnow().isoformat(),
            "completed_at": datetime.utcnow().isoformat(),
            "results": {"message": "Workflow executed successfully"}
        }
        
        workflow["execution_history"].append(execution)
        
        # Update agent metrics
        for agent_id in workflow["agent_ids"]:
            if agent_id in self.agents:
                self.agents[agent_id]["metrics"]["workflows_executed"] += 1
        
        logger.info(f"Executed workflow: {workflow_id}")
        return execution
    
    async def create_task(
        self, 
        agent_id: str, 
        title: str, 
        description: str,
        priority: str = "medium"
    ) -> str:
        """Create a new task"""
        if agent_id not in self.agents:
            raise ValueError(f"Agent {agent_id} not found")
        
        task_id = f"task_{uuid.uuid4().hex[:8]}"
        
        task = {
            "id": task_id,
            "agent_id": agent_id,
            "title": title,
            "description": description,
            "status": "pending",
            "priority": priority,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        self.tasks[task_id] = task
        logger.info(f"Created task: {task_id} for agent {agent_id}")
        return task_id
    
    async def update_task_status(self, task_id: str, status: str) -> bool:
        """Update task status"""
        if task_id not in self.tasks:
            return False
        
        self.tasks[task_id]["status"] = status
        self.tasks[task_id]["updated_at"] = datetime.utcnow().isoformat()
        
        # Update agent metrics if task completed
        if status == "completed":
            agent_id = self.tasks[task_id]["agent_id"]
            if agent_id in self.agents:
                self.agents[agent_id]["metrics"]["tasks_completed"] += 1
        
        logger.info(f"Updated task {task_id} status to {status}")
        return True
    
    async def get_tasks_by_agent(self, agent_id: str) -> List[Dict[str, Any]]:
        """Get all tasks for an agent"""
        return [task for task in self.tasks.values() if task["agent_id"] == agent_id]
    
    async def get_agent_statistics(self, agent_id: str) -> Dict[str, Any]:
        """Get agent statistics"""
        if agent_id not in self.agents:
            return {}
        
        agent = self.agents[agent_id]
        tasks = await self.get_tasks_by_agent(agent_id)
        
        return {
            "agent_id": agent_id,
            "tasks_total": len(tasks),
            "tasks_completed": agent["metrics"]["tasks_completed"],
            "workflows_executed": agent["metrics"]["workflows_executed"],
            "status": agent["status"],
            "created_at": agent["created_at"]
        }
    
    async def get_platform_statistics(self) -> Dict[str, Any]:
        """Get platform-wide statistics"""
        return {
            "total_agents": len(self.agents),
            "total_workflows": len(self.workflows),
            "total_tasks": len(self.tasks),
            "active_agents": len([a for a in self.agents.values() if a["status"] == "active"])
        }

# Global service instance
universal_agent_service = UniversalAgentService()