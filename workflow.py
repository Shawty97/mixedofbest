from datetime import datetime
import json
import uuid
from src.database import db

class Workflow(db.Model):
    __tablename__ = 'workflows'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    creator = db.Column(db.String(255), nullable=False, default='demo_user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    dag_structure = db.Column(db.Text)  # JSON string for DAG structure
    status = db.Column(db.String(50), default='draft')  # draft, published, archived
    
    def __init__(self, name, description=None, creator='demo_user', dag_structure=None):
        self.name = name
        self.description = description
        self.creator = creator
        self.dag_structure = json.dumps(dag_structure) if dag_structure else json.dumps({"nodes": [], "edges": []})
    
    def get_dag_structure(self):
        """Return DAG structure as Python dict"""
        return json.loads(self.dag_structure) if self.dag_structure else {"nodes": [], "edges": []}
    
    def set_dag_structure(self, dag_dict):
        """Set DAG structure from Python dict"""
        self.dag_structure = json.dumps(dag_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'creator': self.creator,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'dag_structure': self.get_dag_structure(),
            'status': self.status
        }

class WorkflowExecution(db.Model):
    __tablename__ = 'workflow_executions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = db.Column(db.String(36), db.ForeignKey('workflows.id'), nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, running, completed, failed
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    result = db.Column(db.Text)  # JSON string for execution results
    error_message = db.Column(db.Text)
    
    workflow = db.relationship('Workflow', backref=db.backref('executions', lazy=True))
    
    def __init__(self, workflow_id):
        self.workflow_id = workflow_id
    
    def get_result(self):
        """Return result as Python dict"""
        return json.loads(self.result) if self.result else {}
    
    def set_result(self, result_dict):
        """Set result from Python dict"""
        self.result = json.dumps(result_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'workflow_id': self.workflow_id,
            'status': self.status,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'result': self.get_result(),
            'error_message': self.error_message
        }

