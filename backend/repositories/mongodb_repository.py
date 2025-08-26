"""MongoDB Repository for Universal Agent Platform"""
import os
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
from .models import AgentModel, WorkflowModel, TaskModel, SessionModel

logger = logging.getLogger(__name__)

class MongoDBRepository:
    """MongoDB Repository for managing platform data"""
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.agents_collection = None
        self.workflows_collection = None
        self.tasks_collection = None
        self.sessions_collection = None
    
    async def connect(self):
        """Connect to MongoDB"""
        try:
            mongodb_url = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
            db_name = os.getenv('MONGODB_DB_NAME', 'universal_agent_platform')
            
            self.client = AsyncIOMotorClient(mongodb_url)
            self.db = self.client[db_name]
            
            # Initialize collections
            self.agents_collection = self.db.agents
            self.workflows_collection = self.db.workflows
            self.tasks_collection = self.db.tasks
            self.sessions_collection = self.db.sessions
            
            # Create indexes
            await self._create_indexes()
            
            logger.info(f"Connected to MongoDB: {mongodb_url}/{db_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            return False
    
    async def _create_indexes(self):
        """Create database indexes for better performance"""
        try:
            # Agent indexes
            await self.agents_collection.create_index("agent_id", unique=True)
            await self.agents_collection.create_index("agent_type")
            await self.agents_collection.create_index("status")
            await self.agents_collection.create_index("owner_id")
            
            # Workflow indexes
            await self.workflows_collection.create_index("workflow_id", unique=True)
            await self.workflows_collection.create_index("status")
            await self.workflows_collection.create_index("owner_id")
            
            # Task indexes
            await self.tasks_collection.create_index("task_id", unique=True)
            await self.tasks_collection.create_index("workflow_id")
            await self.tasks_collection.create_index("agent_id")
            await self.tasks_collection.create_index("status")
            await self.tasks_collection.create_index("priority")
            await self.tasks_collection.create_index("owner_id")
            
            # Session indexes
            await self.sessions_collection.create_index("session_id", unique=True)
            await self.sessions_collection.create_index("agent_id")
            await self.sessions_collection.create_index("user_id")
            await self.sessions_collection.create_index("status")
            
            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.error(f"Failed to create indexes: {e}")
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")
    
    async def create_indexes(self):
        """Create database indexes for better performance"""
        try:
            # Create indexes for agents collection
            try:
                await self.db.agents.create_index("agent_id", unique=True)
            except Exception:
                pass  # Index might already exist
            try:
                await self.db.agents.create_index("name")
            except Exception:
                pass
            try:
                await self.db.agents.create_index("agent_type")
            except Exception:
                pass
            try:
                await self.db.agents.create_index("status")
            except Exception:
                pass
            
            # Create indexes for workflows collection
            try:
                await self.db.workflows.create_index("name")
            except Exception:
                pass
            try:
                await self.db.workflows.create_index("type")
            except Exception:
                pass
            
            # Create indexes for tasks collection
            try:
                await self.db.tasks.create_index("title")
            except Exception:
                pass
            try:
                await self.db.tasks.create_index("status")
            except Exception:
                pass
            try:
                await self.db.tasks.create_index("priority")
            except Exception:
                pass
            try:
                await self.db.tasks.create_index("workflow_id")
            except Exception:
                pass
            
            # Create indexes for sessions collection
            try:
                await self.db.sessions.create_index("agent_id")
            except Exception:
                pass
            try:
                await self.db.sessions.create_index("status")
            except Exception:
                pass
            
            print("Database indexes created successfully")
        except Exception as e:
            print(f"Error creating indexes: {e}")
    
    # Agent CRUD operations
    async def create_agent(self, agent_data: Dict[str, Any]):
        """Create a new agent"""
        try:
            agent = AgentModel(**agent_data)
            result = await self.agents_collection.insert_one(agent.dict(by_alias=True))
            logger.info(f"Created agent: {agent.agent_id}")
            return result
        except DuplicateKeyError:
            logger.error(f"Agent with ID {agent_data.get('agent_id')} already exists")
            return None
        except Exception as e:
            logger.error(f"Failed to create agent: {e}")
            return None
    
    async def get_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent by ID"""
        try:
            agent = await self.agents_collection.find_one({"agent_id": agent_id})
            if agent:
                agent["_id"] = str(agent["_id"])
            return agent
        except Exception as e:
            logger.error(f"Failed to get agent {agent_id}: {e}")
            return None
    
    async def update_agent(self, agent_id: str, update_data: Dict[str, Any]) -> bool:
        """Update agent"""
        try:
            update_data["updated_at"] = datetime.utcnow()
            result = await self.agents_collection.update_one(
                {"agent_id": agent_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update agent {agent_id}: {e}")
            return False
    
    async def delete_agent(self, agent_id: str) -> bool:
        """Delete agent"""
        try:
            result = await self.agents_collection.delete_one({"agent_id": agent_id})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Failed to delete agent {agent_id}: {e}")
            return False
    
    async def list_agents(self, owner_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """List agents with optional filters"""
        try:
            query = {}
            if owner_id:
                query["owner_id"] = owner_id
            if status:
                query["status"] = status
            
            cursor = self.agents_collection.find(query)
            agents = await cursor.to_list(length=None)
            
            for agent in agents:
                agent["_id"] = str(agent["_id"])
            
            return agents
        except Exception as e:
            logger.error(f"Failed to list agents: {e}")
            return []
    
    # Workflow CRUD operations
    async def create_workflow(self, workflow_data: Dict[str, Any]):
        """Create a new workflow"""
        try:
            workflow = WorkflowModel(**workflow_data)
            result = await self.workflows_collection.insert_one(workflow.dict(by_alias=True))
            logger.info(f"Created workflow: {workflow.name}")
            return result
        except DuplicateKeyError:
            logger.error(f"Workflow with name {workflow_data.get('name')} already exists")
            return None
        except Exception as e:
            logger.error(f"Failed to create workflow: {e}")
            return None
    
    async def get_workflow(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get workflow by ID"""
        try:
            workflow = await self.workflows_collection.find_one({"workflow_id": workflow_id})
            if workflow:
                workflow["_id"] = str(workflow["_id"])
            return workflow
        except Exception as e:
            logger.error(f"Failed to get workflow {workflow_id}: {e}")
            return None
    
    async def update_workflow(self, workflow_id: str, update_data: Dict[str, Any]) -> bool:
        """Update workflow"""
        try:
            update_data["updated_at"] = datetime.utcnow()
            result = await self.workflows_collection.update_one(
                {"workflow_id": workflow_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update workflow {workflow_id}: {e}")
            return False
    
    async def list_workflows(self, owner_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """List workflows with optional filters"""
        try:
            query = {}
            if owner_id:
                query["owner_id"] = owner_id
            if status:
                query["status"] = status
            
            cursor = self.workflows_collection.find(query)
            workflows = await cursor.to_list(length=None)
            
            for workflow in workflows:
                workflow["_id"] = str(workflow["_id"])
            
            return workflows
        except Exception as e:
            logger.error(f"Failed to list workflows: {e}")
            return []
    
    # Task CRUD operations
    async def create_task(self, task_data: Dict[str, Any]):
        """Create a new task"""
        try:
            task = TaskModel(**task_data)
            result = await self.tasks_collection.insert_one(task.dict(by_alias=True))
            logger.info(f"Created task: {task.title}")
            return result
        except DuplicateKeyError:
            logger.error(f"Task with title {task_data.get('title')} already exists")
            return None
        except Exception as e:
            logger.error(f"Failed to create task: {e}")
            return None
    
    async def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get task by ID"""
        try:
            task = await self.tasks_collection.find_one({"task_id": task_id})
            if task:
                task["_id"] = str(task["_id"])
            return task
        except Exception as e:
            logger.error(f"Failed to get task {task_id}: {e}")
            return None
    
    async def update_task(self, task_id: str, update_data: Dict[str, Any]) -> bool:
        """Update task"""
        try:
            result = await self.tasks_collection.update_one(
                {"task_id": task_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update task {task_id}: {e}")
            return False
    
    async def list_tasks(self, 
                        workflow_id: Optional[str] = None,
                        agent_id: Optional[str] = None,
                        status: Optional[str] = None,
                        owner_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List tasks with optional filters"""
        try:
            query = {}
            if workflow_id:
                query["workflow_id"] = workflow_id
            if agent_id:
                query["agent_id"] = agent_id
            if status:
                query["status"] = status
            if owner_id:
                query["owner_id"] = owner_id
            
            cursor = self.tasks_collection.find(query)
            tasks = await cursor.to_list(length=None)
            
            for task in tasks:
                task["_id"] = str(task["_id"])
            
            return tasks
        except Exception as e:
            logger.error(f"Failed to list tasks: {e}")
            return []
    
    # Session CRUD operations
    async def create_session(self, session_data: Dict[str, Any]):
        """Create a new session"""
        try:
            session = SessionModel(**session_data)
            result = await self.sessions_collection.insert_one(session.dict(by_alias=True))
            logger.info(f"Created session: {session.session_type}")
            return result
        except DuplicateKeyError:
            logger.error(f"Session already exists")
            return None
        except Exception as e:
            logger.error(f"Failed to create session: {e}")
            return None
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session by ID"""
        try:
            session = await self.sessions_collection.find_one({"session_id": session_id})
            if session:
                session["_id"] = str(session["_id"])
            return session
        except Exception as e:
            logger.error(f"Failed to get session {session_id}: {e}")
            return None
    
    async def update_session(self, session_id: str, update_data: Dict[str, Any]) -> bool:
        """Update session"""
        try:
            update_data["last_activity"] = datetime.utcnow()
            result = await self.sessions_collection.update_one(
                {"session_id": session_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update session {session_id}: {e}")
            return False
    
    async def add_session_message(self, session_id: str, message: Dict[str, Any]) -> bool:
        """Add message to session"""
        try:
            message["timestamp"] = datetime.utcnow()
            result = await self.sessions_collection.update_one(
                {"session_id": session_id},
                {
                    "$push": {"messages": message},
                    "$set": {"last_activity": datetime.utcnow()}
                }
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to add message to session {session_id}: {e}")
            return False

    def _convert_objectid(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        """Convert ObjectId to string"""
        if doc and "_id" in doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def get_workflows(self):
        """Get all workflows"""
        try:
            workflows = await self.workflows_collection.find({}).to_list(length=None)
            return [self._convert_objectid(workflow) for workflow in workflows]
        except Exception as e:
            logger.error(f"Error getting workflows: {e}")
            return []

    async def get_conversations(self):
        """Get all conversations"""
        try:
            conversations = await self.sessions_collection.find({}).sort("created_at", -1).to_list(length=None)
            return [self._convert_objectid(conversation) for conversation in conversations]
        except Exception as e:
            logger.error(f"Error getting conversations: {e}")
            return []

    async def get_recent_conversations(self, limit: int = 5):
        """Get recent conversations"""
        try:
            conversations = await self.sessions_collection.find({}).sort("created_at", -1).limit(limit).to_list(length=None)
            return [self._convert_objectid(conversation) for conversation in conversations]
        except Exception as e:
            logger.error(f"Error getting recent conversations: {e}")
            return []

    async def count_agents(self):
        """Count total agents"""
        try:
            return await self.agents_collection.count_documents({})
        except Exception as e:
            logger.error(f"Error counting agents: {e}")
            return 0

# Global repository instance
mongodb_repository = MongoDBRepository()