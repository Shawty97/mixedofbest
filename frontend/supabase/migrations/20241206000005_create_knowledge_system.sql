
-- Module 5: Knowledge Builder - Automatisierte Wissensbasis

-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Wissensbasen
CREATE TABLE knowledge_bases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES auth.users(id),
  config jsonb, -- Embedding-Modell, Chunking-Strategie etc.
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Dokumente
CREATE TABLE knowledge_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_base_id uuid REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_path text, -- Supabase Storage Pfad
  content_type text,
  file_size integer,
  status text DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  processed_at timestamp with time zone,
  metadata jsonb, -- Autor, Erstellungsdatum, etc.
  created_at timestamp with time zone DEFAULT now()
);

-- Text-Chunks mit Embeddings
CREATE TABLE knowledge_chunks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_text text NOT NULL,
  chunk_index integer,
  embedding vector(1536), -- OpenAI Ada-002 Dimensionen
  metadata jsonb, -- Seite, Kapitel, etc.
  created_at timestamp with time zone DEFAULT now()
);

-- Knowledge Graph Entities
CREATE TABLE knowledge_entities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_base_id uuid REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  entity_name text NOT NULL,
  entity_type text, -- 'person', 'concept', 'organization', etc.
  description text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Knowledge Graph Relationships
CREATE TABLE knowledge_relationships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  from_entity_id uuid REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  to_entity_id uuid REFERENCES knowledge_entities(id) ON DELETE CASCADE,
  relationship_type text, -- 'related_to', 'part_of', 'causes', etc.
  confidence_score decimal(3,2),
  source_chunk_id uuid REFERENCES knowledge_chunks(id),
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_relationships ENABLE ROW LEVEL SECURITY;

-- Knowledge bases are private to the owner
CREATE POLICY "Users can manage their own knowledge bases" ON knowledge_bases
FOR ALL USING (auth.uid() = owner_id);

-- Documents follow knowledge base permissions
CREATE POLICY "Knowledge base documents are private to owner" ON knowledge_documents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM knowledge_bases 
    WHERE id = knowledge_documents.knowledge_base_id 
    AND owner_id = auth.uid()
  )
);

-- Chunks follow document permissions
CREATE POLICY "Knowledge chunks are private to document owner" ON knowledge_chunks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM knowledge_documents kd
    JOIN knowledge_bases kb ON kd.knowledge_base_id = kb.id
    WHERE kd.id = knowledge_chunks.document_id 
    AND kb.owner_id = auth.uid()
  )
);

-- Entities follow knowledge base permissions
CREATE POLICY "Knowledge entities are private to knowledge base owner" ON knowledge_entities
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM knowledge_bases 
    WHERE id = knowledge_entities.knowledge_base_id 
    AND owner_id = auth.uid()
  )
);

-- Relationships follow entity permissions
CREATE POLICY "Knowledge relationships are private to entity owner" ON knowledge_relationships
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM knowledge_entities ke
    JOIN knowledge_bases kb ON ke.knowledge_base_id = kb.id
    WHERE ke.id = knowledge_relationships.from_entity_id 
    AND kb.owner_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX idx_knowledge_chunks_document ON knowledge_chunks(document_id);
CREATE INDEX idx_knowledge_entities_base ON knowledge_entities(knowledge_base_id);
CREATE INDEX idx_knowledge_documents_base ON knowledge_documents(knowledge_base_id);

-- Function for semantic search
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1536),
  knowledge_base_ids uuid[],
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_text text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.document_id,
    kc.chunk_text,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  FROM knowledge_chunks kc
  JOIN knowledge_documents kd ON kc.document_id = kd.id
  WHERE kd.knowledge_base_id = ANY(knowledge_base_ids)
    AND kd.status = 'completed'
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
