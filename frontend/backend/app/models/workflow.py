
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, index=True)  # UUID string
    name = Column(String, nullable=False)
    description = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    definition = Column(JSON)  # Stores React Flow nodes and edges
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    version = Column(Integer, default=1)
    
    # Relationships
    user = relationship("User", back_populates="workflows")
    versions = relationship("WorkflowVersion", back_populates="workflow", cascade="all, delete-orphan")
    runs = relationship("WorkflowRun", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowVersion(Base):
    __tablename__ = "workflow_versions"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    definition = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    workflow = relationship("Workflow", back_populates="versions")


class WorkflowRun(Base):
    __tablename__ = "workflow_runs"

    id = Column(String, primary_key=True, index=True)  # UUID string
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False)
    workflow_version_id = Column(Integer, ForeignKey("workflow_versions.id"))
    status = Column(String, default="pending")  # pending, running, completed, failed, cancelled
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True))
    results = Column(JSON)
    logs = Column(Text)
    error_message = Column(Text)
    
    # Relationships
    workflow = relationship("Workflow", back_populates="runs")
    version = relationship("WorkflowVersion")
