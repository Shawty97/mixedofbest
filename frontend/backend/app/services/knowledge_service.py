from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from uuid import UUID
import asyncio
import random
from datetime import datetime

from app.models.knowledge import KnowledgeSource, KnowledgeChunk

class KnowledgeService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_workspace_knowledge_sources(self, workspace_id: str) -> List[KnowledgeSource]:
        """Get all knowledge sources for a workspace"""
        query = select(KnowledgeSource).where(
            KnowledgeSource.workspace_id == workspace_id,
            KnowledgeSource.is_active == True
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_knowledge_source_by_id(self, source_id: str) -> Optional[KnowledgeSource]:
        """Get knowledge source by ID"""
        query = select(KnowledgeSource).where(KnowledgeSource.id == source_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def create_knowledge_source(
        self,
        name: str,
        workspace_id: str,
        created_by: str,
        source_type: str,
        description: Optional[str] = None,
        source_url: Optional[str] = None,
        content: Optional[str] = None,
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ) -> KnowledgeSource:
        """Create new knowledge source"""
        source = KnowledgeSource(
            name=name,
            description=description,
            workspace_id=workspace_id,
            created_by=created_by,
            source_type=source_type,
            source_url=source_url,
            content=content,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            status="pending"
        )
        
        self.db.add(source)
        await self.db.flush()
        await self.db.refresh(source)
        
        # Start processing in background (demo simulation)
        await self._process_knowledge_source(source)
        
        return source
    
    async def create_knowledge_source_from_file(
        self,
        name: str,
        workspace_id: str,
        created_by: str,
        file_content: bytes,
        file_name: str,
        content_type: str,
        description: Optional[str] = None
    ) -> KnowledgeSource:
        """Create knowledge source from uploaded file"""
        
        # Convert file content to text (demo implementation)
        if content_type.startswith('text/'):
            text_content = file_content.decode('utf-8')
        else:
            # For demo, simulate text extraction from other file types
            text_content = f"Demo extracted text from {file_name}. This would contain the actual file content in a real implementation."
        
        source = KnowledgeSource(
            name=name,
            description=description,
            workspace_id=workspace_id,
            created_by=created_by,
            source_type="file",
            content=text_content,
            file_size=len(file_content),
            status="processing"
        )
        
        self.db.add(source)
        await self.db.flush()
        await self.db.refresh(source)
        
        # Start processing
        await self._process_knowledge_source(source)
        
        return source
    
    async def _process_knowledge_source(self, source: KnowledgeSource) -> None:
        """Process knowledge source and create chunks (demo simulation)"""
        
        # Simulate processing delay
        await asyncio.sleep(0.2)
        
        content = source.content or "Demo content for processing"
        chunk_size = source.chunk_size
        
        # Simple text chunking simulation
        chunks = []
        words = content.split()
        current_chunk = []
        current_size = 0
        
        for word in words:
            if current_size + len(word) > chunk_size and current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = [word]
                current_size = len(word)
            else:
                current_chunk.append(word)
                current_size += len(word) + 1
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        # Create chunk records
        for i, chunk_content in enumerate(chunks):
            chunk = KnowledgeChunk(
                source_id=source.id,
                content=chunk_content,
                chunk_index=i,
                metadata={
                    "chunk_size": len(chunk_content),
                    "word_count": len(chunk_content.split()),
                    "created_from": source.source_type
                }
            )
            self.db.add(chunk)
        
        # Update source status
        source.status = "ready"
        source.total_chunks = len(chunks)
        source.processed_at = datetime.utcnow()
        
        await self.db.flush()
    
    async def search_knowledge(
        self,
        query: str,
        workspace_id: str,
        limit: int = 10,
        source_ids: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Search knowledge base (demo implementation)"""
        
        # Simulate search processing time
        processing_start = asyncio.get_event_loop().time()
        await asyncio.sleep(0.1)
        
        # Build query for knowledge sources in workspace
        sources_query = select(KnowledgeSource).where(
            KnowledgeSource.workspace_id == workspace_id,
            KnowledgeSource.status == "ready",
            KnowledgeSource.is_active == True
        )
        
        if source_ids:
            sources_query = sources_query.where(KnowledgeSource.id.in_(source_ids))
        
        sources_result = await self.db.execute(sources_query)
        sources = sources_result.scalars().all()
        
        # Get chunks from these sources
        source_ids_list = [str(source.id) for source in sources]
        
        chunks_query = select(KnowledgeChunk).options(
            selectinload(KnowledgeChunk.source)
        ).where(
            KnowledgeChunk.source_id.in_(source_ids_list)
        ).limit(limit * 2)  # Get more chunks for demo filtering
        
        chunks_result = await self.db.execute(chunks_query)
        all_chunks = chunks_result.scalars().all()
        
        # Demo relevance scoring based on query keywords
        query_words = query.lower().split()
        scored_chunks = []
        
        for chunk in all_chunks:
            content_lower = chunk.content.lower()
            relevance_score = 0.0
            
            # Simple keyword matching for demo
            for word in query_words:
                if word in content_lower:
                    relevance_score += 0.3
                    # Boost score for exact matches
                    if word in content_lower.split():
                        relevance_score += 0.2
            
            # Add some randomness for demo variety
            relevance_score += random.uniform(0.1, 0.3)
            relevance_score = min(relevance_score, 1.0)
            
            if relevance_score > 0.3:  # Minimum relevance threshold
                chunk.relevance_score = round(relevance_score, 2)
                scored_chunks.append(chunk)
        
        # Sort by relevance score
        scored_chunks.sort(key=lambda x: x.relevance_score, reverse=True)
        
        # Limit results
        final_chunks = scored_chunks[:limit]
        
        processing_end = asyncio.get_event_loop().time()
        processing_time = round(processing_end - processing_start, 3)
        
        return {
            "chunks": final_chunks,
            "total": len(scored_chunks),
            "processing_time": processing_time
        }
    
    async def update_knowledge_source(self, source: KnowledgeSource, **kwargs) -> KnowledgeSource:
        """Update knowledge source fields"""
        for key, value in kwargs.items():
            if hasattr(source, key):
                setattr(source, key, value)
        
        await self.db.flush()
        await self.db.refresh(source)
        
        return source
    
    async def delete_knowledge_source(self, source: KnowledgeSource) -> bool:
        """Soft delete knowledge source"""
        source.is_active = False
        await self.db.flush()
        return True