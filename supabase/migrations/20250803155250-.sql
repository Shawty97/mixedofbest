-- Create Universal Agents table for the Universal Agent Metamodel
CREATE TABLE public.universal_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  definition JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent deployments table
CREATE TABLE public.agent_deployments (
  id TEXT NOT NULL PRIMARY KEY,
  agent_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  endpoint TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'deploying' CHECK (status IN ('deploying', 'deployed', 'failed', 'stopped')),
  configuration JSONB NOT NULL,
  deployed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.universal_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_deployments ENABLE ROW LEVEL SECURITY;

-- Create policies for universal_agents
CREATE POLICY "Users can view their own universal agents" 
ON public.universal_agents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own universal agents" 
ON public.universal_agents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own universal agents" 
ON public.universal_agents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own universal agents" 
ON public.universal_agents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for agent_deployments
CREATE POLICY "Users can view their own deployments" 
ON public.agent_deployments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deployments" 
ON public.agent_deployments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deployments" 
ON public.agent_deployments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_universal_agents_user_id ON public.universal_agents(user_id);
CREATE INDEX idx_universal_agents_status ON public.universal_agents(status);
CREATE INDEX idx_universal_agents_workspace_id ON public.universal_agents(workspace_id);
CREATE INDEX idx_universal_agents_definition ON public.universal_agents USING GIN (definition);

CREATE INDEX idx_agent_deployments_user_id ON public.agent_deployments(user_id);
CREATE INDEX idx_agent_deployments_agent_id ON public.agent_deployments(agent_id);
CREATE INDEX idx_agent_deployments_environment ON public.agent_deployments(environment);
CREATE INDEX idx_agent_deployments_status ON public.agent_deployments(status);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_universal_agents_updated_at
BEFORE UPDATE ON public.universal_agents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_deployments_updated_at
BEFORE UPDATE ON public.agent_deployments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();