from datetime import datetime
import json
import uuid
from src.database import db

class Agent(db.Model):
    __tablename__ = 'agents'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    creator = db.Column(db.String(255), nullable=False, default='demo_user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    configuration = db.Column(db.Text)  # JSON string for agent configuration
    status = db.Column(db.String(50), default='draft')  # draft, published, archived
    
    def __init__(self, name, description=None, creator='demo_user', configuration=None):
        self.name = name
        self.description = description
        self.creator = creator
        self.configuration = json.dumps(configuration) if configuration else json.dumps({
            "personality_traits": [],
            "capabilities": [],
            "knowledge_sources": []
        })
    
    def get_configuration(self):
        """Return configuration as Python dict"""
        return json.loads(self.configuration) if self.configuration else {
            "personality_traits": [],
            "capabilities": [],
            "knowledge_sources": []
        }
    
    def set_configuration(self, config_dict):
        """Set configuration from Python dict"""
        self.configuration = json.dumps(config_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'creator': self.creator,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'configuration': self.get_configuration(),
            'status': self.status
        }

class AgentListing(db.Model):
    __tablename__ = 'agent_listings'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = db.Column(db.String(36), db.ForeignKey('agents.id'), nullable=False)
    price = db.Column(db.Float, default=0.0)
    category = db.Column(db.String(100))
    published_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='draft')  # draft, published, archived
    downloads = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float, default=0.0)
    
    agent = db.relationship('Agent', backref=db.backref('listings', lazy=True))
    
    def __init__(self, agent_id, price=0.0, category=None):
        self.agent_id = agent_id
        self.price = price
        self.category = category
    
    def to_dict(self):
        return {
            'id': self.id,
            'agent_id': self.agent_id,
            'agent': self.agent.to_dict() if self.agent else None,
            'price': self.price,
            'category': self.category,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'status': self.status,
            'downloads': self.downloads,
            'rating': self.rating
        }

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    listing_id = db.Column(db.String(36), db.ForeignKey('agent_listings.id'), nullable=False)
    user_id = db.Column(db.String(255), nullable=False, default='demo_user')
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    listing = db.relationship('AgentListing', backref=db.backref('reviews', lazy=True))
    
    def __init__(self, listing_id, rating, comment=None, user_id='demo_user'):
        self.listing_id = listing_id
        self.rating = rating
        self.comment = comment
        self.user_id = user_id
    
    def to_dict(self):
        return {
            'id': self.id,
            'listing_id': self.listing_id,
            'user_id': self.user_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

