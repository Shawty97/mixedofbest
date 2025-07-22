from flask import Blueprint, request, jsonify
from src.database import db
from src.models.workflow import Workflow, WorkflowExecution
from datetime import datetime
import uuid

workflows_bp = Blueprint('workflows', __name__)

@workflows_bp.route('/workflows', methods=['GET'])
def get_workflows():
    """Get all workflows with optional pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        
        query = Workflow.query
        if status:
            query = query.filter(Workflow.status == status)
        
        workflows = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'workflows': [workflow.to_dict() for workflow in workflows.items],
            'total': workflows.total,
            'pages': workflows.pages,
            'current_page': page
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@workflows_bp.route('/workflows/<workflow_id>', methods=['GET'])
def get_workflow(workflow_id):
    """Get a specific workflow by ID"""
    try:
        workflow = Workflow.query.get(workflow_id)
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        return jsonify(workflow.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@workflows_bp.route('/workflows', methods=['POST'])
def create_workflow():
    """Create a new workflow"""
    try:
        data = request.get_json()
        
        if not data or 'name' not in data:
            return jsonify({'error': 'Name is required'}), 400
        
        workflow = Workflow(
            name=data['name'],
            description=data.get('description'),
            creator=data.get('creator', 'demo_user'),
            dag_structure=data.get('dag_structure')
        )
        
        db.session.add(workflow)
        db.session.commit()
        
        return jsonify(workflow.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@workflows_bp.route('/workflows/<workflow_id>', methods=['PUT'])
def update_workflow(workflow_id):
    """Update an existing workflow"""
    try:
        workflow = Workflow.query.get(workflow_id)
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if 'name' in data:
            workflow.name = data['name']
        if 'description' in data:
            workflow.description = data['description']
        if 'dag_structure' in data:
            workflow.set_dag_structure(data['dag_structure'])
        if 'status' in data:
            workflow.status = data['status']
        
        workflow.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(workflow.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@workflows_bp.route('/workflows/<workflow_id>', methods=['DELETE'])
def delete_workflow(workflow_id):
    """Delete a workflow"""
    try:
        workflow = Workflow.query.get(workflow_id)
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        db.session.delete(workflow)
        db.session.commit()
        
        return jsonify({'message': 'Workflow deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@workflows_bp.route('/workflows/<workflow_id>/execute', methods=['POST'])
def execute_workflow(workflow_id):
    """Execute a workflow"""
    try:
        workflow = Workflow.query.get(workflow_id)
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        # Create execution record
        execution = WorkflowExecution(workflow_id=workflow_id)
        execution.status = 'running'
        db.session.add(execution)
        db.session.commit()
        
        # Simulate workflow execution (Demo mode)
        dag = workflow.get_dag_structure()
        result = simulate_workflow_execution(dag)
        
        # Update execution with result
        execution.status = 'completed'
        execution.completed_at = datetime.utcnow()
        execution.set_result(result)
        db.session.commit()
        
        return jsonify(execution.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@workflows_bp.route('/workflows/<workflow_id>/executions', methods=['GET'])
def get_workflow_executions(workflow_id):
    """Get execution history for a workflow"""
    try:
        workflow = Workflow.query.get(workflow_id)
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        executions = WorkflowExecution.query.filter_by(workflow_id=workflow_id).order_by(WorkflowExecution.started_at.desc()).all()
        
        return jsonify([execution.to_dict() for execution in executions])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def simulate_workflow_execution(dag):
    """Simulate workflow execution for demo mode"""
    nodes = dag.get('nodes', [])
    edges = dag.get('edges', [])
    
    result = {
        'execution_id': str(uuid.uuid4()),
        'nodes_executed': len(nodes),
        'edges_processed': len(edges),
        'execution_time': '2.5s',
        'status': 'success',
        'outputs': {}
    }
    
    # Simulate node execution results
    for node in nodes:
        node_id = node.get('id', 'unknown')
        node_type = node.get('type', 'unknown')
        
        if node_type == 'llm_call':
            result['outputs'][node_id] = {
                'type': 'text',
                'content': f"Simulated LLM response for node {node_id}",
                'tokens_used': 150
            }
        elif node_type == 'data_processing':
            result['outputs'][node_id] = {
                'type': 'data',
                'content': f"Processed data from node {node_id}",
                'records_processed': 100
            }
        else:
            result['outputs'][node_id] = {
                'type': 'generic',
                'content': f"Simulated output for {node_type} node {node_id}"
            }
    
    return result

