
-- Create voice_agents table
CREATE TABLE IF NOT EXISTS public.voice_agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    voice_id TEXT NOT NULL,
    model_id TEXT NOT NULL,
    voice_name TEXT,
    model_name TEXT,
    system_prompt TEXT,
    is_active BOOLEAN DEFAULT true,
    capabilities TEXT[] DEFAULT '{}',
    knowledge_sources TEXT[] DEFAULT '{}',
    provider_id TEXT,
    custom_instructions TEXT,
    learning_mode BOOLEAN DEFAULT false,
    context_window INTEGER DEFAULT 8192,
    max_response_tokens INTEGER DEFAULT 1024,
    multimodal_input BOOLEAN DEFAULT false,
    temperature_value DECIMAL(3,2) DEFAULT 0.7,
    conversation_memory BOOLEAN DEFAULT true,
    knowledge_bases TEXT[] DEFAULT '{}',
    integrations TEXT[] DEFAULT '{}',
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.voice_agents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own voice agents" ON public.voice_agents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice agents" ON public.voice_agents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice agents" ON public.voice_agents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice agents" ON public.voice_agents
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.voice_agents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data for demo
INSERT INTO public.voice_agents (
    user_id, name, description, voice_id, model_id, voice_name, model_name, 
    system_prompt, capabilities, is_active, learning_mode, context_window,
    max_response_tokens, temperature_value, conversation_memory, is_demo
) VALUES 
(
    '00000000-0000-0000-0000-000000000000', -- Demo user ID
    'Customer Support Assistant',
    'Handles customer inquiries, troubleshoots common issues, and manages support tickets.',
    'EXAVITQu4vr4xnSDxMaL',
    'eleven_multilingual_v2',
    'Sarah (American)',
    'Multilingual v2',
    'You are a helpful customer support agent. Address concerns politely and efficiently.',
    '{"Support", "Knowledge Base", "Ticketing"}',
    true,
    true,
    8192,
    1024,
    0.7,
    true,
    true
),
(
    '00000000-0000-0000-0000-000000000000',
    'Sales Assistant', 
    'Guides potential customers through the sales process, answers product questions, and handles objections.',
    'CwhRBWXzGAHq8TQ4Fs17',
    'eleven_turbo_v2_5',
    'Roger (American)',
    'Turbo v2.5',
    'You are a knowledgeable sales assistant. Help customers find the right products for their needs.',
    '{"Sales", "Product Info", "CRM Integration"}',
    false,
    false,
    4096,
    512,
    0.8,
    true,
    true
);
