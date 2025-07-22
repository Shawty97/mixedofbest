
"""
Workflow execution engine with DAG processing
"""
import asyncio
import json
import logging
import time
from typing import Dict, List, Any, Optional
from datetime import datetime
from uuid import uuid4

from app.schemas.workflow import WorkflowDefinition, WorkflowNode, WorkflowRunResult

logger = logging.getLogger(__name__)


class NodeProcessor:
    """Base class for processing different node types"""
    
    async def process(self, node: WorkflowNode, inputs: Dict[str, Any]) -> WorkflowRunResult:
        """Process a node with given inputs"""
        raise NotImplementedError


class InputNodeProcessor(NodeProcessor):
    """Processes input nodes"""
    
    async def process(self, node: WorkflowNode, inputs: Dict[str, Any]) -> WorkflowRunResult:
        start_time = time.time()
        
        try:
            content = node.data.content or ""
            result = {
                "text": content,
                "timestamp": datetime.now().isoformat(),
                "nodeId": node.id
            }
            
            return WorkflowRunResult(
                node_id=node.id,
                status="completed",
                result=result,
                execution_time=time.time() - start_time
            )
        except Exception as e:
            return WorkflowRunResult(
                node_id=node.id,
                status="failed",
                error=str(e),
                execution_time=time.time() - start_time
            )


class AIModelNodeProcessor(NodeProcessor):
    """Processes AI model nodes (simulated in demo mode)"""
    
    async def process(self, node: WorkflowNode, inputs: Dict[str, Any]) -> WorkflowRunResult:
        start_time = time.time()
        
        try:
            # Simulate AI processing delay
            await asyncio.sleep(1)
            
            model = node.data.model or "gpt-3.5-turbo"
            prompt = node.data.prompt or "Generate a response"
            temperature = node.data.temperature or 0.7
            
            # Collect input text from connected nodes
            input_text = ""
            for input_data in inputs.values():
                if isinstance(input_data, dict) and "text" in input_data:
                    input_text += input_data["text"] + " "
            
            # Simulate AI response based on prompt and inputs
            simulated_responses = [
                f"Based on your input '{input_text.strip()}', here's a thoughtful AI-generated response using {model}.",
                f"I've analyzed the input and generated this response with temperature {temperature}.",
                f"This is a simulated response demonstrating the AI model capabilities of {model}.",
                f"Processing complete. The AI model {model} has generated this response based on: {prompt}"
            ]
            
            import random
            response_text = random.choice(simulated_responses)
            
            result = {
                "text": response_text,
                "model": model,
                "temperature": temperature,
                "prompt": prompt,
                "tokenCount": len(response_text.split()) * 1.3,  # Simulate token count
                "timestamp": datetime.now().isoformat(),
                "nodeId": node.id
            }
            
            return WorkflowRunResult(
                node_id=node.id,
                status="completed",
                result=result,
                execution_time=time.time() - start_time
            )
        except Exception as e:
            return WorkflowRunResult(
                node_id=node.id,
                status="failed",
                error=str(e),
                execution_time=time.time() - start_time
            )


class ProcessingNodeProcessor(NodeProcessor):
    """Processes data processing nodes"""
    
    async def process(self, node: WorkflowNode, inputs: Dict[str, Any]) -> WorkflowRunResult:
        start_time = time.time()
        
        try:
            # Simulate processing delay
            await asyncio.sleep(0.5)
            
            # Collect all inputs
            processed_data = []
            for input_data in inputs.values():
                if isinstance(input_data, dict):
                    # Simulate text processing
                    if "text" in input_data:
                        text = input_data["text"]
                        processed_data.append({
                            "original_text": text,
                            "word_count": len(text.split()),
                            "character_count": len(text),
                            "processed": True
                        })
            
            result = {
                "processed_data": processed_data,
                "processing_type": "text_analysis",
                "timestamp": datetime.now().isoformat(),
                "nodeId": node.id
            }
            
            return WorkflowRunResult(
                node_id=node.id,
                status="completed",
                result=result,
                execution_time=time.time() - start_time
            )
        except Exception as e:
            return WorkflowRunResult(
                node_id=node.id,
                status="failed",
                error=str(e),
                execution_time=time.time() - start_time
            )


class OutputNodeProcessor(NodeProcessor):
    """Processes output nodes"""
    
    async def process(self, node: WorkflowNode, inputs: Dict[str, Any]) -> WorkflowRunResult:
        start_time = time.time()
        
        try:
            format_type = node.data.format or "json"
            
            # Collect all inputs
            all_inputs = list(inputs.values())
            
            if format_type == "json":
                result = {
                    "output": all_inputs,
                    "format": "json",
                    "timestamp": datetime.now().isoformat(),
                    "nodeId": node.id
                }
            elif format_type == "text":
                text_parts = []
                for input_data in all_inputs:
                    if isinstance(input_data, dict) and "text" in input_data:
                        text_parts.append(input_data["text"])
                    else:
                        text_parts.append(str(input_data))
                
                result = {
                    "output": "\n".join(text_parts),
                    "format": "text",
                    "timestamp": datetime.now().isoformat(),
                    "nodeId": node.id
                }
            else:
                result = {
                    "output": all_inputs,
                    "format": "raw",
                    "timestamp": datetime.now().isoformat(),
                    "nodeId": node.id
                }
            
            return WorkflowRunResult(
                node_id=node.id,
                status="completed",
                result=result,
                execution_time=time.time() - start_time
            )
        except Exception as e:
            return WorkflowRunResult(
                node_id=node.id,
                status="failed",
                error=str(e),
                execution_time=time.time() - start_time
            )


class WorkflowEngine:
    """Main workflow execution engine"""
    
    def __init__(self):
        self.node_processors = {
            "input": InputNodeProcessor(),
            "aiModel": AIModelNodeProcessor(),
            "processing": ProcessingNodeProcessor(),
            "advancedProcessing": ProcessingNodeProcessor(),
            "output": OutputNodeProcessor()
        }
    
    def _build_dependency_graph(self, definition: WorkflowDefinition) -> Dict[str, List[str]]:
        """Build dependency graph from workflow definition"""
        dependencies = {node.id: [] for node in definition.nodes}
        
        for edge in definition.edges:
            dependencies[edge.target].append(edge.source)
        
        return dependencies
    
    def _topological_sort(self, dependencies: Dict[str, List[str]]) -> List[str]:
        """Perform topological sort to determine execution order"""
        in_degree = {node_id: len(deps) for node_id, deps in dependencies.items()}
        queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
        result = []
        
        while queue:
            current = queue.pop(0)
            result.append(current)
            
            # Reduce in-degree for dependent nodes
            for node_id, deps in dependencies.items():
                if current in deps:
                    in_degree[node_id] -= 1
                    if in_degree[node_id] == 0:
                        queue.append(node_id)
        
        if len(result) != len(dependencies):
            raise ValueError("Circular dependency detected in workflow")
        
        return result
    
    async def execute_workflow(self, definition: WorkflowDefinition) -> List[WorkflowRunResult]:
        """Execute workflow definition and return results"""
        logger.info(f"Starting workflow execution with {len(definition.nodes)} nodes")
        
        try:
            # Build dependency graph and execution order
            dependencies = self._build_dependency_graph(definition)
            execution_order = self._topological_sort(dependencies)
            
            # Create node lookup
            node_lookup = {node.id: node for node in definition.nodes}
            
            # Store results for each node
            node_results = {}
            execution_results = []
            
            # Execute nodes in topological order
            for node_id in execution_order:
                node = node_lookup[node_id]
                
                # Collect inputs from dependency nodes
                inputs = {}
                for dep_id in dependencies[node_id]:
                    if dep_id in node_results:
                        inputs[dep_id] = node_results[dep_id]
                
                # Get appropriate processor
                processor = self.node_processors.get(node.type)
                if not processor:
                    result = WorkflowRunResult(
                        node_id=node_id,
                        status="failed",
                        error=f"No processor found for node type: {node.type}"
                    )
                else:
                    # Execute node
                    logger.info(f"Executing node {node_id} of type {node.type}")
                    result = await processor.process(node, inputs)
                
                # Store result
                node_results[node_id] = result.result
                execution_results.append(result)
                
                # If node failed, we might want to continue or stop
                if result.status == "failed":
                    logger.error(f"Node {node_id} failed: {result.error}")
            
            logger.info(f"Workflow execution completed with {len(execution_results)} results")
            return execution_results
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {str(e)}")
            raise e


# Global workflow engine instance
workflow_engine = WorkflowEngine()
