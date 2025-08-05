
-- Create copilot_sessions table
CREATE TABLE IF NOT EXISTS public.copilot_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL CHECK (session_type IN ('workflow_help', 'debugging', 'optimization', 'code_generation', 'general')),
    context JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    total_messages INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    session_cost DECIMAL(10,4) DEFAULT 0.0000
);

-- Create copilot_messages table
CREATE TABLE IF NOT EXISTS public.copilot_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.copilot_sessions(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    processing_time INTEGER DEFAULT 0, -- milliseconds
    model_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create code_suggestions table
CREATE TABLE IF NOT EXISTS public.code_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.copilot_sessions(id) ON DELETE CASCADE,
    suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('optimization', 'fix', 'enhancement', 'refactor', 'security')),
    context JSONB DEFAULT '{}',
    suggestion_data JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'dismissed', 'modified')),
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_at TIMESTAMP WITH TIME ZONE,
    user_feedback TEXT
);

-- Enable RLS
ALTER TABLE public.copilot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_suggestions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for copilot_sessions
CREATE POLICY "Users can view their own copilot sessions" ON public.copilot_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own copilot sessions" ON public.copilot_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own copilot sessions" ON public.copilot_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own copilot sessions" ON public.copilot_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for copilot_messages
CREATE POLICY "Users can view messages from their sessions" ON public.copilot_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.copilot_sessions 
            WHERE id = copilot_messages.session_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to their sessions" ON public.copilot_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.copilot_sessions 
            WHERE id = copilot_messages.session_id 
            AND user_id = auth.uid()
        )
    );

-- Create RLS policies for code_suggestions
CREATE POLICY "Users can view their own code suggestions" ON public.code_suggestions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own code suggestions" ON public.code_suggestions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own code suggestions" ON public.code_suggestions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own code suggestions" ON public.code_suggestions
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_copilot_sessions_user_id ON public.copilot_sessions(user_id);
CREATE INDEX idx_copilot_sessions_started_at ON public.copilot_sessions(started_at DESC);
CREATE INDEX idx_copilot_messages_session_id ON public.copilot_messages(session_id);
CREATE INDEX idx_copilot_messages_created_at ON public.copilot_messages(created_at DESC);
CREATE INDEX idx_code_suggestions_user_id ON public.code_suggestions(user_id);
CREATE INDEX idx_code_suggestions_status ON public.code_suggestions(status);
CREATE INDEX idx_code_suggestions_created_at ON public.code_suggestions(created_at DESC);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_copilot_sessions
    BEFORE UPDATE ON public.copilot_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert demo data for development
INSERT INTO public.copilot_sessions (
    user_id, session_type, context, total_messages, total_tokens, session_cost
) VALUES 
(
    '00000000-0000-0000-0000-000000000000',
    'workflow_help',
    '{"workflow_id": "demo_workflow", "node_count": 5, "last_action": "node_creation"}',
    12,
    1450,
    0.0025
),
(
    '00000000-0000-0000-0000-000000000000',
    'debugging',
    '{"error_type": "connection_timeout", "node_id": "ai_model_node_1", "workflow_id": "demo_workflow"}',
    8,
    980,
    0.0018
);

