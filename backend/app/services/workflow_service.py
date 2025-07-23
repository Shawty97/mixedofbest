from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from uuid import UUID
import json
import asyncio
from datetime import datetime

from app.models.workflow import Workflow, WorkflowRun
from app.models.workspace import Workspace

class WorkflowService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_workspace_workflows(self, workspace_id: str) -> List[Workflow]:
        """Get all workflows for a workspace"""
        query = select(Workflow).where(
            Workflow.workspace_id == workspace_id,
            Workflow.is_active == True
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_workflow_by_id(self, workflow_id: str) -> Optional[Workflow]:
        """Get workflow by ID"""
        query = select(Workflow).where(Workflow.id == workflow_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def create_workflow(
        self,
        name: str,
        workspace_id: str,
        created_by: str,
        description: Optional[str] = None,
        nodes: Optional[List[Dict]] = None,
        edges: Optional[List[Dict]] = None,
        config: Optional[Dict] = None
    ) -> Workflow:
        """Create new workflow"""
        workflow = Workflow(
            name=name,
            description=description,
            workspace_id=workspace_id,
            created_by=created_by,
            nodes=nodes or [],
            edges=edges or [],
            config=config or {}
        )
        
        self.db.add(workflow)
        await self.db.flush()
        await self.db.refresh(workflow)
        
        return workflow
    
    async def update_workflow(self, workflow: Workflow, **kwargs) -> Workflow:
        """Update workflow fields"""
        for key, value in kwargs.items():
            if hasattr(workflow, key):
                setattr(workflow, key, value)
        
        await self.db.flush()
        await self.db.refresh(workflow)
        
        return workflow
    
    async def execute_workflow(
        self,
        workflow: Workflow,
        input_data: Dict[str, Any],
        triggered_by: str,
        trigger_type: str = "manual"
    ) -> WorkflowRun:
        """Execute workflow with DAG processing"""
        
        # Create workflow run record
        workflow_run = WorkflowRun(
            workflow_id=workflow.id,
            status="running",
            input_data=input_data,
            triggered_by=triggered_by,
            trigger_type=trigger_type
        )
        
        self.db.add(workflow_run)
        await self.db.flush()
        await self.db.refresh(workflow_run)
        
        try:
            # Execute workflow nodes in DAG order
            execution_result = await self._execute_workflow_dag(
                workflow, input_data, workflow_run
            )
            
            # Update run with results
            workflow_run.status = "completed"
            workflow_run.output_data = execution_result
            workflow_run.completed_at = datetime.utcnow()
            
        except Exception as e:
            # Handle execution errors
            workflow_run.status = "failed"
            workflow_run.error_message = str(e)
            workflow_run.completed_at = datetime.utcnow()
        
        await self.db.flush()
        await self.db.refresh(workflow_run)
        
        return workflow_run
    
    async def _execute_workflow_dag(
        self,
        workflow: Workflow,
        input_data: Dict[str, Any],
        workflow_run: WorkflowRun
    ) -> Dict[str, Any]:
        """Execute workflow nodes in DAG order"""
        
        nodes = workflow.nodes or []
        edges = workflow.edges or []
        
        # Build execution graph
        execution_graph = self._build_execution_graph(nodes, edges)
        
        # Execute nodes in topological order
        node_results = {}
        execution_order = self._topological_sort(execution_graph)
        
        for node_id in execution_order:
            node = next((n for n in nodes if n.get('id') == node_id), None)
            if not node:
                continue
            
            # Execute node with demo simulation
            node_result = await self._execute_node(node, node_results, input_data)
            node_results[node_id] = node_result
            
            # Update workflow run progress
            workflow_run.nodes_executed += 1
            await self.db.flush()
        
        return {
            "status": "completed",
            "results": node_results,
            "execution_order": execution_order
        }
    
    def _build_execution_graph(self, nodes: List[Dict], edges: List[Dict]) -> Dict[str, List[str]]:
        """Build execution graph from nodes and edges"""
        graph = {}
        
        # Initialize graph with all nodes
        for node in nodes:
            graph[node['id']] = []
        
        # Add edges to graph
        for edge in edges:
            source = edge.get('source')
            target = edge.get('target')
            if source and target:
                if target not in graph:
                    graph[target] = []
                graph[target].append(source)
        
        return graph
    
    def _topological_sort(self, graph: Dict[str, List[str]]) -> List[str]:
        """Topological sort for DAG execution order"""
        visited = set()
        temp_visited = set()
        result = []
        
        def visit(node: str):
            if node in temp_visited:
                raise ValueError("Circular dependency detected in workflow")
            
            if node in visited:
                return
            
            temp_visited.add(node)
            
            for dependency in graph.get(node, []):
                visit(dependency)
            
            temp_visited.remove(node)
            visited.add(node)
            result.append(node)
        
        for node in graph:
            if node not in visited:
                visit(node)
        
        return result
    
    async def _execute_node(
        self,
        node: Dict[str, Any],
        node_results: Dict[str, Any],
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute individual node with demo simulation"""
        
        node_type = node.get('type', 'unknown')
        node_data = node.get('data', {})
        
        # Simulate processing delay
        await asyncio.sleep(0.1)
        
        # Demo node execution based on type
        if node_type == 'input':
            return {
                "type": "input",
                "data": input_data,
                "status": "completed"
            }
        
        elif node_type == 'aiModel':
            model = node_data.get('model', 'gpt-4')
            prompt = node_data.get('prompt', 'Default prompt')
            
            return {
                "type": "aiModel",
                "model": model,
                "prompt": prompt,
                "response": f"Demo AI response for model {model}",
                "tokens_used": 150,
                "status": "completed"
            }
        
        elif node_type == 'processing':
            processing_type = node_data.get('processingType', 'transform')
            
            return {
                "type": "processing",
                "processing_type": processing_type,
                "result": f"Demo processing result for {processing_type}",
                "status": "completed"
            }
        
        elif node_type == 'output':
            output_type = node_data.get('outputType', 'text')
            
            return {
                "type": "output",
                "output_type": output_type,
                "result": f"Demo output result for {output_type}",
                "status": "completed"
            }
        
        else:
            return {
                "type": node_type,
                "result": f"Demo result for {node_type}",
                "status": "completed"
            }