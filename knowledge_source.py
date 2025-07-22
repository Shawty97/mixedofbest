from datetime import datetime
import json
import uuid
from src.database import db

class KnowledgeSource(db.Model):
    __tablename__ = 'knowledge_sources'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # url, file, text
    path_or_url = db.Column(db.Text, nullable=False)
    creator = db.Column(db.String(255), nullable=False, default='demo_user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processing_status = db.Column(db.String(50), default='pending')  # pending, processing, completed, failed
    source_metadata = db.Column(db.Text)  # JSON string for additional metadata
    knowledge_graph = db.Column(db.Text)  # JSON string for knowledge graph
    
    def __init__(self, name, type, path_or_url, creator='demo_user', metadata=None):
        self.name = name
        self.type = type
        self.path_or_url = path_or_url
        self.creator = creator
        self.source_metadata = json.dumps(metadata) if metadata else json.dumps({})
        self.knowledge_graph = json.dumps({"nodes": [], "edges": []})
    
    def get_metadata(self):
        """Return metadata as Python dict"""
        return json.loads(self.source_metadata) if self.source_metadata else {}
    
    def set_metadata(self, metadata_dict):
        """Set metadata from Python dict"""
        self.source_metadata = json.dumps(metadata_dict)
    
    def get_knowledge_graph(self):
        """Return knowledge graph as Python dict"""
        return json.loads(self.knowledge_graph) if self.knowledge_graph else {"nodes": [], "edges": []}
    
    def set_knowledge_graph(self, graph_dict):
        """Set knowledge graph from Python dict"""
        self.knowledge_graph = json.dumps(graph_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'path_or_url': self.path_or_url,
            'creator': self.creator,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'processing_status': self.processing_status,
            'metadata': self.get_metadata(),
            'knowledge_graph': self.get_knowledge_graph()
        }

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    knowledge_source_id = db.Column(db.String(36), db.ForeignKey('knowledge_sources.id'), nullable=False)
    title = db.Column(db.String(500))
    content = db.Column(db.Text, nullable=False)
    doc_metadata = db.Column(db.Text)  # JSON string for document metadata
    embeddings = db.Column(db.Text)  # JSON string for vector embeddings (simulated)
    processed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    knowledge_source = db.relationship('KnowledgeSource', backref=db.backref('documents', lazy=True))
    
    def __init__(self, knowledge_source_id, content, title=None, metadata=None, embeddings=None):
        self.knowledge_source_id = knowledge_source_id
        self.content = content
        self.title = title
        self.doc_metadata = json.dumps(metadata) if metadata else json.dumps({})
        # For demo mode, create simple hash-based embeddings
        self.embeddings = json.dumps(embeddings) if embeddings else json.dumps([hash(content) % 1000 for _ in range(10)])
    
    def get_metadata(self):
        """Return metadata as Python dict"""
        return json.loads(self.doc_metadata) if self.doc_metadata else {}
    
    def set_metadata(self, metadata_dict):
        """Set metadata from Python dict"""
        self.doc_metadata = json.dumps(metadata_dict)
    
    def get_embeddings(self):
        """Return embeddings as Python list"""
        return json.loads(self.embeddings) if self.embeddings else []
    
    def set_embeddings(self, embeddings_list):
        """Set embeddings from Python list"""
        self.embeddings = json.dumps(embeddings_list)
    
    def to_dict(self):
        return {
            'id': self.id,
            'knowledge_source_id': self.knowledge_source_id,
            'title': self.title,
            'content': self.content,
            'metadata': self.get_metadata(),
            'embeddings': self.get_embeddings(),
            'processed_at': self.processed_at.isoformat() if self.processed_at else None
        }

