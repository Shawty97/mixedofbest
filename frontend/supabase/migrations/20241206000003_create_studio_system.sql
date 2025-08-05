
-- Module 3: Studio - Multi-Agent Orchestrierung

-- Agent-Teams
CREATE TABLE agent_teams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES auth.users(id),
  team_config jsonb, -- Hierarchie, Rollen, Kommunikationsregeln
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Team-Mitglieder (Referenz zu Workflows als Agenten)
CREATE TABLE team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid REFERENCES agent_teams(id) ON DELETE CASCADE,
  agent_workflow_id uuid REFERENCES workflows(id),
  role text, -- 'manager', 'worker', 'coordinator'
  priority integer DEFAULT 0,
  config jsonb -- Agent-spezifische Konfiguration im Team
);

-- Agent-zu-Agent Kommunikation
CREATE TABLE agent_communications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid REFERENCES agent_teams(id),
  from_agent_id uuid REFERENCES team_members(id),
  to_agent_id uuid REFERENCES team_members(id),
  message_type text, -- 'task', 'result', 'error', 'coordination'
  content jsonb,
  status text DEFAULT 'pending', -- 'pending', 'delivered', 'processed'
  created_at timestamp with time zone DEFAULT now()
);

-- Team-Ausführungen
CREATE TABLE team_executions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid REFERENCES agent_teams(id),
  status text DEFAULT 'pending',
  input_data jsonb,
  results jsonb,
  performance_metrics jsonb,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- RLS Policies
ALTER TABLE agent_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own teams" ON agent_teams
FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Team members are visible to team owners" ON team_members
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM agent_teams 
    WHERE id = team_members.team_id 
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Communications are visible to team owners" ON agent_communications
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM agent_teams 
    WHERE id = agent_communications.team_id 
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Executions are visible to team owners" ON team_executions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM agent_teams 
    WHERE id = team_executions.team_id 
    AND owner_id = auth.uid()
  )
);
