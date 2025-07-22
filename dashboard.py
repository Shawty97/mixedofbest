from flask import Blueprint, jsonify
from src.database import db
from src.models.workflow import Workflow, WorkflowExecution
from src.models.agent import Agent, AgentListing
from src.models.knowledge_source import KnowledgeSource, Document
from datetime import datetime, timedelta
import random

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get overall platform statistics for the dashboard"""
    try:
        # Get counts
        total_workflows = Workflow.query.count()
        total_agents = Agent.query.count()
        total_knowledge_sources = KnowledgeSource.query.count()
        total_executions = WorkflowExecution.query.count()
        total_listings = AgentListing.query.count()
        total_documents = Document.query.count()
        
        # Get recent activity (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_workflows = Workflow.query.filter(Workflow.created_at >= week_ago).count()
        recent_agents = Agent.query.filter(Agent.created_at >= week_ago).count()
        recent_executions = WorkflowExecution.query.filter(WorkflowExecution.started_at >= week_ago).count()
        
        # Calculate success rate for executions
        successful_executions = WorkflowExecution.query.filter(WorkflowExecution.status == 'completed').count()
        success_rate = (successful_executions / total_executions * 100) if total_executions > 0 else 0
        
        return jsonify({
            'totals': {
                'workflows': total_workflows,
                'agents': total_agents,
                'knowledge_sources': total_knowledge_sources,
                'executions': total_executions,
                'agent_listings': total_listings,
                'documents': total_documents
            },
            'recent_activity': {
                'new_workflows': recent_workflows,
                'new_agents': recent_agents,
                'recent_executions': recent_executions
            },
            'performance': {
                'execution_success_rate': round(success_rate, 1),
                'avg_execution_time': '2.3s',  # Simulated
                'platform_uptime': '99.9%'  # Simulated
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/dashboard/recent-activity', methods=['GET'])
def get_recent_activity():
    """Get recent activity across all modules"""
    try:
        activities = []
        
        # Recent workflows
        recent_workflows = Workflow.query.order_by(Workflow.created_at.desc()).limit(5).all()
        for workflow in recent_workflows:
            activities.append({
                'type': 'workflow_created',
                'title': f'Workflow "{workflow.name}" created',
                'timestamp': workflow.created_at.isoformat(),
                'module': 'Core Platform',
                'id': workflow.id
            })
        
        # Recent agents
        recent_agents = Agent.query.order_by(Agent.created_at.desc()).limit(5).all()
        for agent in recent_agents:
            activities.append({
                'type': 'agent_created',
                'title': f'Agent "{agent.name}" created',
                'timestamp': agent.created_at.isoformat(),
                'module': 'Studio',
                'id': agent.id
            })
        
        # Recent executions
        recent_executions = WorkflowExecution.query.order_by(WorkflowExecution.started_at.desc()).limit(5).all()
        for execution in recent_executions:
            activities.append({
                'type': 'workflow_executed',
                'title': f'Workflow executed ({execution.status})',
                'timestamp': execution.started_at.isoformat(),
                'module': 'Core Platform',
                'id': execution.id
            })
        
        # Recent knowledge sources
        recent_sources = KnowledgeSource.query.order_by(KnowledgeSource.created_at.desc()).limit(5).all()
        for source in recent_sources:
            activities.append({
                'type': 'knowledge_source_created',
                'title': f'Knowledge source "{source.name}" created',
                'timestamp': source.created_at.isoformat(),
                'module': 'Knowledge Builder',
                'id': source.id
            })
        
        # Sort all activities by timestamp
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify(activities[:20])  # Return top 20 most recent
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/dashboard/performance-metrics', methods=['GET'])
def get_performance_metrics():
    """Get performance metrics for charts and graphs"""
    try:
        # Generate simulated performance data for demo mode
        days = 7
        metrics = {
            'execution_times': [],
            'success_rates': [],
            'api_response_times': [],
            'user_activity': []
        }
        
        for i in range(days):
            date = (datetime.utcnow() - timedelta(days=days-i-1)).strftime('%Y-%m-%d')
            
            metrics['execution_times'].append({
                'date': date,
                'avg_time': round(random.uniform(1.5, 3.5), 2),
                'min_time': round(random.uniform(0.5, 1.5), 2),
                'max_time': round(random.uniform(4.0, 8.0), 2)
            })
            
            metrics['success_rates'].append({
                'date': date,
                'success_rate': round(random.uniform(85, 99), 1),
                'total_executions': random.randint(50, 200)
            })
            
            metrics['api_response_times'].append({
                'date': date,
                'avg_response_time': round(random.uniform(50, 150), 0),
                'p95_response_time': round(random.uniform(200, 400), 0)
            })
            
            metrics['user_activity'].append({
                'date': date,
                'active_users': random.randint(20, 100),
                'new_users': random.randint(5, 25),
                'api_calls': random.randint(1000, 5000)
            })
        
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/dashboard/module-status', methods=['GET'])
def get_module_status():
    """Get status of all platform modules"""
    try:
        # Simulate module health checks
        modules = [
            {
                'name': 'Core Platform',
                'status': 'healthy',
                'uptime': '99.9%',
                'last_check': datetime.utcnow().isoformat(),
                'active_workflows': Workflow.query.filter(Workflow.status == 'published').count(),
                'recent_executions': WorkflowExecution.query.filter(
                    WorkflowExecution.started_at >= datetime.utcnow() - timedelta(hours=24)
                ).count()
            },
            {
                'name': 'Studio',
                'status': 'healthy',
                'uptime': '99.8%',
                'last_check': datetime.utcnow().isoformat(),
                'active_agents': Agent.query.filter(Agent.status == 'published').count(),
                'agent_interactions': random.randint(100, 500)  # Simulated
            },
            {
                'name': 'Agent Store',
                'status': 'healthy',
                'uptime': '99.9%',
                'last_check': datetime.utcnow().isoformat(),
                'published_listings': AgentListing.query.filter(AgentListing.status == 'published').count(),
                'total_downloads': sum(listing.downloads for listing in AgentListing.query.all())
            },
            {
                'name': 'Knowledge Builder',
                'status': 'healthy',
                'uptime': '99.7%',
                'last_check': datetime.utcnow().isoformat(),
                'processed_sources': KnowledgeSource.query.filter(KnowledgeSource.processing_status == 'completed').count(),
                'total_documents': Document.query.count()
            }
        ]
        
        return jsonify(modules)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/dashboard/quick-actions', methods=['GET'])
def get_quick_actions():
    """Get suggested quick actions for the user"""
    try:
        actions = [
            {
                'title': 'Create New Workflow',
                'description': 'Build a new AI workflow in the Core Platform',
                'action': 'navigate',
                'target': '/workflows/new',
                'icon': 'workflow',
                'priority': 'high'
            },
            {
                'title': 'Design New Agent',
                'description': 'Create a custom AI agent in the Studio',
                'action': 'navigate',
                'target': '/agents/new',
                'icon': 'agent',
                'priority': 'high'
            },
            {
                'title': 'Browse Agent Store',
                'description': 'Discover pre-built agents in the marketplace',
                'action': 'navigate',
                'target': '/agent-store',
                'icon': 'store',
                'priority': 'medium'
            },
            {
                'title': 'Add Knowledge Source',
                'description': 'Upload documents or add URLs to build knowledge base',
                'action': 'navigate',
                'target': '/knowledge-builder/new',
                'icon': 'knowledge',
                'priority': 'medium'
            },
            {
                'title': 'View Analytics',
                'description': 'Check detailed performance metrics and insights',
                'action': 'navigate',
                'target': '/analytics',
                'icon': 'analytics',
                'priority': 'low'
            }
        ]
        
        return jsonify(actions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

