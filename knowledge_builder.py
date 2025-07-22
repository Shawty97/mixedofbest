from flask import Blueprint, request, jsonify
from src.database import db
from src.models.knowledge_source import KnowledgeSource, Document
from datetime import datetime
import uuid
import random
import hashlib

knowledge_bp = Blueprint('knowledge_builder', __name__)

@knowledge_bp.route('/knowledge-builder/sources', methods=['GET'])
def get_knowledge_sources():
    """Get all knowledge sources with optional pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        
        query = KnowledgeSource.query
        if status:
            query = query.filter(KnowledgeSource.processing_status == status)
        
        sources = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'sources': [source.to_dict() for source in sources.items],
            'total': sources.total,
            'pages': sources.pages,
            'current_page': page
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@knowledge_bp.route('/knowledge-builder/sources/<source_id>', methods=['GET'])
def get_knowledge_source(source_id):
    """Get a specific knowledge source by ID"""
    try:
        source = KnowledgeSource.query.get(source_id)
        if not source:
            return jsonify({'error': 'Knowledge source not found'}), 404
        
        return jsonify(source.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@knowledge_bp.route('/knowledge-builder/sources', methods=['POST'])
def create_knowledge_source():
    """Create a new knowledge source"""
    try:
        data = request.get_json()
        
        if not data or 'name' not in data or 'type' not in data or 'path_or_url' not in data:
            return jsonify({'error': 'Name, type, and path_or_url are required'}), 400
        
        if data['type'] not in ['url', 'file', 'text']:
            return jsonify({'error': 'Type must be one of: url, file, text'}), 400
        
        source = KnowledgeSource(
            name=data['name'],
            type=data['type'],
            path_or_url=data['path_or_url'],
            creator=data.get('creator', 'demo_user'),
            metadata=data.get('metadata')
        )
        
        db.session.add(source)
        db.session.commit()
        
        return jsonify(source.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@knowledge_bp.route('/knowledge-builder/sources/<source_id>', methods=['PUT'])
def update_knowledge_source(source_id):
    """Update an existing knowledge source"""
    try:
        source = KnowledgeSource.query.get(source_id)
        if not source:
            return jsonify({'error': 'Knowledge source not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if 'name' in data:
            source.name = data['name']
        if 'type' in data:
            if data['type'] not in ['url', 'file', 'text']:
                return jsonify({'error': 'Type must be one of: url, file, text'}), 400
            source.type = data['type']
        if 'path_or_url' in data:
            source.path_or_url = data['path_or_url']
        if 'metadata' in data:
            source.set_metadata(data['metadata'])
        
        source.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(source.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@knowledge_bp.route('/knowledge-builder/sources/<source_id>', methods=['DELETE'])
def delete_knowledge_source(source_id):
    """Delete a knowledge source"""
    try:
        source = KnowledgeSource.query.get(source_id)
        if not source:
            return jsonify({'error': 'Knowledge source not found'}), 404
        
        db.session.delete(source)
        db.session.commit()
        
        return jsonify({'message': 'Knowledge source deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@knowledge_bp.route('/knowledge-builder/sources/<source_id>/process', methods=['POST'])
def process_knowledge_source(source_id):
    """Process a knowledge source to extract documents and generate embeddings"""
    try:
        source = KnowledgeSource.query.get(source_id)
        if not source:
            return jsonify({'error': 'Knowledge source not found'}), 404
        
        if source.processing_status == 'processing':
            return jsonify({'error': 'Source is already being processed'}), 400
        
        # Update status to processing
        source.processing_status = 'processing'
        db.session.commit()
        
        # Simulate processing (Demo mode)
        result = simulate_knowledge_processing(source)
        
        # Update status to completed
        source.processing_status = 'completed'
        source.set_knowledge_graph(result['knowledge_graph'])
        db.session.commit()
        
        return jsonify({
            'message': 'Knowledge source processed successfully',
            'documents_created': result['documents_created'],
            'processing_time': result['processing_time']
        })
    except Exception as e:
        db.session.rollback()
        source.processing_status = 'failed'
        db.session.commit()
        return jsonify({'error': str(e)}), 500

@knowledge_bp.route('/knowledge-builder/sources/<source_id>/documents', methods=['GET'])
def get_source_documents(source_id):
    """Get all documents for a knowledge source"""
    try:
        source = KnowledgeSource.query.get(source_id)
        if not source:
            return jsonify({'error': 'Knowledge source not found'}), 404
        
        documents = Document.query.filter_by(knowledge_source_id=source_id).all()
        
        return jsonify([doc.to_dict() for doc in documents])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@knowledge_bp.route('/knowledge-builder/sources/<source_id>/graph', methods=['GET'])
def get_knowledge_graph(source_id):
    """Get the knowledge graph for a source"""
    try:
        source = KnowledgeSource.query.get(source_id)
        if not source:
            return jsonify({'error': 'Knowledge source not found'}), 404
        
        return jsonify(source.get_knowledge_graph())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@knowledge_bp.route('/knowledge-builder/search', methods=['POST'])
def semantic_search():
    """Perform semantic search across all processed documents"""
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'Query is required'}), 400
        
        query = data['query']
        limit = data.get('limit', 10)
        
        # Simulate semantic search (Demo mode)
        results = simulate_semantic_search(query, limit)
        
        return jsonify({
            'query': query,
            'results': results,
            'total_found': len(results)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def simulate_knowledge_processing(source):
    """Simulate knowledge processing for demo mode"""
    # Generate simulated content based on source type
    if source.type == 'url':
        content_segments = [
            f"Web content from {source.path_or_url} - Introduction section",
            f"Web content from {source.path_or_url} - Main content section",
            f"Web content from {source.path_or_url} - Conclusion section"
        ]
    elif source.type == 'file':
        content_segments = [
            f"File content from {source.path_or_url} - Chapter 1",
            f"File content from {source.path_or_url} - Chapter 2",
            f"File content from {source.path_or_url} - Chapter 3"
        ]
    else:  # text
        # Split text into segments
        text = source.path_or_url
        words = text.split()
        segment_size = max(50, len(words) // 3)
        content_segments = [
            ' '.join(words[i:i+segment_size]) 
            for i in range(0, len(words), segment_size)
        ]
    
    # Create documents for each segment
    documents_created = 0
    for i, content in enumerate(content_segments):
        doc = Document(
            knowledge_source_id=source.id,
            title=f"{source.name} - Segment {i+1}",
            content=content,
            metadata={'segment_index': i, 'word_count': len(content.split())}
        )
        db.session.add(doc)
        documents_created += 1
    
    # Generate simulated knowledge graph
    knowledge_graph = {
        'nodes': [
            {'id': f'entity_{i}', 'label': f'Entity {i}', 'type': 'concept'}
            for i in range(1, min(6, documents_created + 1))
        ],
        'edges': [
            {'source': f'entity_{i}', 'target': f'entity_{i+1}', 'relationship': 'relates_to'}
            for i in range(1, min(5, documents_created))
        ]
    }
    
    db.session.commit()
    
    return {
        'documents_created': documents_created,
        'processing_time': f"{random.uniform(1.0, 5.0):.1f}s",
        'knowledge_graph': knowledge_graph
    }

def simulate_semantic_search(query, limit):
    """Simulate semantic search for demo mode"""
    # Get some random documents
    documents = Document.query.limit(limit * 2).all()
    
    results = []
    for doc in documents[:limit]:
        # Simulate relevance score
        relevance = random.uniform(0.6, 0.95)
        
        # Create highlighted snippet
        words = doc.content.split()
        snippet_start = random.randint(0, max(0, len(words) - 20))
        snippet = ' '.join(words[snippet_start:snippet_start + 20])
        
        results.append({
            'document_id': doc.id,
            'title': doc.title,
            'snippet': snippet + '...',
            'relevance_score': round(relevance, 3),
            'source_name': doc.knowledge_source.name if doc.knowledge_source else 'Unknown',
            'metadata': doc.get_metadata()
        })
    
    # Sort by relevance score
    results.sort(key=lambda x: x['relevance_score'], reverse=True)
    
    return results

