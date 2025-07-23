
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, JSON, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class KnowledgeSource(Base):
    __tablename__ = "knowledge_sources"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # file, url
    source_uri = Column(String, nullable=False)  # File path or URL
    status = Column(String, default="uploaded")  # uploaded, processing, ready, error
    source_metadata = Column(JSON)  # File size, content type, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="knowledge_sources")
    chunks = relationship("KnowledgeChunk", back_populates="source")


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("knowledge_sources.id"), nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(LargeBinary)  # Stored as binary for efficiency
    chunk_metadata = Column(JSON)  # Chunk metadata (position, etc.)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    source = relationship("KnowledgeSource", back_populates="chunks")
