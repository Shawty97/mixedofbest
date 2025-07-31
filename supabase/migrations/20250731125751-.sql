-- Universal Agent Platform Database Schema
-- Phase 1: Core Agent Meta-Model

-- Agent Templates (Universal Schema Definitions)
CREATE TABLE public.agent_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  schema_definition JSONB NOT NULL, -- Universal agent schema (YAML/JSON)
  template_type TEXT NOT NULL DEFAULT 'custom', -- custom, marketplace, system
  category TEXT NOT NULL DEFAULT 'general', -- sales, support, automation, etc.
  capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  data_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  deployment_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published, deprecated
  is_public BOOLEAN NOT NULL DEFAULT false,
  price DECIMAL(10,2) DEFAULT 0.00,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent Instances (Running Agents)
CREATE TABLE public.agent_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_id UUID REFERENCES agent_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'development', -- development, staging, production
  runtime_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  deployment_status TEXT NOT NULL DEFAULT 'stopped', -- stopped, starting, running, error
  endpoint_url TEXT,
  api_key TEXT,
  last_activity TIMESTAMP WITH TIME ZONE,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent Capabilities Registry
CREATE TABLE public.capabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- communication, data, integration, ai, quantum
  schema_definition JSONB NOT NULL,
  configuration_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  provider TEXT, -- openai, elevenlabs, quantum-provider, etc.
  version TEXT NOT NULL DEFAULT '1.0.0',
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent Tools Registry
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- webhook, api, database, file, quantum
  schema_definition JSONB NOT NULL,
  configuration_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  implementation_code TEXT, -- For custom tools
  is_system BOOLEAN NOT NULL DEFAULT false,
  version TEXT NOT NULL DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Marketplace
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES agent_templates(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  category TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  demo_url TEXT,
  documentation TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  downloads INTEGER DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agent Calls/Sessions
CREATE TABLE public.agent_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID REFERENCES agent_instances(id) ON DELETE CASCADE,
  user_id UUID,
  session_type TEXT NOT NULL DEFAULT 'chat', -- chat, voice, api
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, failed
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  duration INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0.00,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Quantum Integration
CREATE TABLE public.quantum_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID REFERENCES agent_instances(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL, -- optimization, simulation, ml_training
  provider TEXT NOT NULL, -- ibm, google, aws-braket
  job_id TEXT NOT NULL, -- Provider's job ID
  status TEXT NOT NULL DEFAULT 'queued', -- queued, running, completed, failed
  input_data JSONB NOT NULL,
  result_data JSONB,
  error_message TEXT,
  cost DECIMAL(10,4) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE agent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quantum_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Agent Templates
CREATE POLICY "Users can view their own templates" ON agent_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own templates" ON agent_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON agent_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON agent_templates FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public templates are viewable by all" ON agent_templates FOR SELECT USING (is_public = true);

-- RLS Policies for Agent Instances
CREATE POLICY "Users can view their own instances" ON agent_instances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own instances" ON agent_instances FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own instances" ON agent_instances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own instances" ON agent_instances FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Marketplace
CREATE POLICY "Users can view their own listings" ON marketplace_listings FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Users can create their own listings" ON marketplace_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update their own listings" ON marketplace_listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Approved listings are public" ON marketplace_listings FOR SELECT USING (status = 'approved');

-- RLS Policies for Agent Sessions
CREATE POLICY "Users can view sessions of their instances" ON agent_sessions 
FOR SELECT USING (
  instance_id IN (
    SELECT id FROM agent_instances WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can create sessions for their instances" ON agent_sessions 
FOR INSERT WITH CHECK (
  instance_id IN (
    SELECT id FROM agent_instances WHERE user_id = auth.uid()
  )
);

-- RLS Policies for Quantum Jobs
CREATE POLICY "Users can view quantum jobs of their instances" ON quantum_jobs 
FOR SELECT USING (
  instance_id IN (
    SELECT id FROM agent_instances WHERE user_id = auth.uid()
  )
);
CREATE POLICY "Users can create quantum jobs for their instances" ON quantum_jobs 
FOR INSERT WITH CHECK (
  instance_id IN (
    SELECT id FROM agent_instances WHERE user_id = auth.uid()
  )
);

-- Insert System Capabilities
INSERT INTO capabilities (name, display_name, description, category, schema_definition, is_system) VALUES
('voice_synthesis', 'Voice Synthesis', 'Text-to-speech capability using various providers', 'communication', '{"provider": "elevenlabs", "voice_id": "", "settings": {}}', true),
('speech_recognition', 'Speech Recognition', 'Speech-to-text capability', 'communication', '{"provider": "openai", "settings": {}}', true),
('text_generation', 'Text Generation', 'AI text generation using language models', 'ai', '{"provider": "openai", "model": "gpt-4", "settings": {}}', true),
('web_search', 'Web Search', 'Search the internet for information', 'data', '{"provider": "google", "api_key": "", "settings": {}}', true),
('quantum_optimization', 'Quantum Optimization', 'Quantum-powered optimization algorithms', 'quantum', '{"provider": "ibm", "backend": "", "settings": {}}', true),
('crm_integration', 'CRM Integration', 'Connect with CRM systems', 'integration', '{"provider": "salesforce", "credentials": {}}', true),
('calendar_management', 'Calendar Management', 'Manage calendars and scheduling', 'integration', '{"provider": "google", "credentials": {}}', true);

-- Insert System Tools
INSERT INTO tools (name, display_name, description, category, schema_definition, is_system) VALUES
('webhook', 'Webhook', 'Send HTTP requests to external services', 'webhook', '{"url": "", "method": "POST", "headers": {}, "body": {}}', true),
('database_query', 'Database Query', 'Execute database queries', 'database', '{"connection": "", "query": "", "parameters": {}}', true),
('file_upload', 'File Upload', 'Upload and process files', 'file', '{"allowed_types": [], "max_size": 10485760}', true),
('email_send', 'Email Send', 'Send emails via SMTP or API', 'integration', '{"provider": "smtp", "credentials": {}}', true),
('quantum_circuit', 'Quantum Circuit', 'Execute quantum circuits', 'quantum', '{"provider": "ibm", "circuit": "", "shots": 1024}', true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_agent_templates_updated_at BEFORE UPDATE ON agent_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_instances_updated_at BEFORE UPDATE ON agent_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON marketplace_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();