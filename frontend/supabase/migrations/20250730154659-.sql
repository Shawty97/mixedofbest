-- Enable pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge_documents table for storing documents
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text/plain',
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_chunks table for storing text chunks with embeddings
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimension
  position INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agents table for storing agent configurations
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  voice_provider TEXT DEFAULT 'elevenlabs' CHECK (voice_provider IN ('elevenlabs', 'openai', 'azure')),
  voice_id TEXT,
  stt_provider TEXT DEFAULT 'openai' CHECK (stt_provider IN ('openai', 'deepgram', 'azure')),
  tts_provider TEXT DEFAULT 'elevenlabs' CHECK (tts_provider IN ('elevenlabs', 'openai', 'azure')),
  capabilities JSONB DEFAULT '[]',
  webhook_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_calls table for tracking agent execution
CREATE TABLE IF NOT EXISTS public.agent_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  status TEXT DEFAULT 'starting' CHECK (status IN ('starting', 'connected', 'ended', 'error')),
  duration INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_calls ENABLE ROW LEVEL SECURITY;

-- RLS policies for knowledge_documents
CREATE POLICY "Users can view their own documents" ON public.knowledge_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" ON public.knowledge_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.knowledge_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.knowledge_documents
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for knowledge_chunks
CREATE POLICY "Users can view chunks of their documents" ON public.knowledge_chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_documents 
      WHERE id = knowledge_chunks.document_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chunks for their documents" ON public.knowledge_chunks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.knowledge_documents 
      WHERE id = knowledge_chunks.document_id AND user_id = auth.uid()
    )
  );

-- RLS policies for agents
CREATE POLICY "Users can view their own agents" ON public.agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents" ON public.agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" ON public.agents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" ON public.agents
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for agent_calls
CREATE POLICY "Users can view their own agent calls" ON public.agent_calls
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent calls" ON public.agent_calls
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent calls" ON public.agent_calls
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS knowledge_documents_user_id_idx ON public.knowledge_documents(user_id);
CREATE INDEX IF NOT EXISTS knowledge_chunks_document_id_idx ON public.knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx ON public.knowledge_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS agents_user_id_idx ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS agent_calls_agent_id_idx ON public.agent_calls(agent_id);
CREATE INDEX IF NOT EXISTS agent_calls_user_id_idx ON public.agent_calls(user_id);

-- Function to search similar chunks
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10,
  filter_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_chunks.id,
    knowledge_chunks.document_id,
    knowledge_chunks.content,
    1 - (knowledge_chunks.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks
  JOIN knowledge_documents ON knowledge_chunks.document_id = knowledge_documents.id
  WHERE 
    (filter_user_id IS NULL OR knowledge_documents.user_id = filter_user_id)
    AND 1 - (knowledge_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_knowledge_documents_updated_at
  BEFORE UPDATE ON public.knowledge_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();