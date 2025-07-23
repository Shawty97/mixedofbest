
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, Settings, Play, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { AgentTeam, TeamMember } from './types/studio.types';
import useWorkflowStore from '@/components/workflow/store/workflowStore';

export function TeamBuilder() {
  const [teams, setTeams] = useState<AgentTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<AgentTeam | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const { workflows } = useWorkflowStore();

  useEffect(() => {
    if (user) {
      loadTeams();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    try {
      // Use type assertion for new table
      const { data, error } = await (supabase as any)
        .from('agent_teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams((data as AgentTeam[]) || []);
    } catch (error) {
      console.error('Error loading teams:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Teams konnten nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      // Use type assertion for new table
      const { data, error } = await (supabase as any)
        .from('team_members')
        .select('*, workflows(*)')
        .eq('team_id', teamId)
        .order('priority', { ascending: false });

      if (error) throw error;
      setTeamMembers((data as TeamMember[]) || []);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      // Use type assertion for new table
      const { data, error } = await (supabase as any)
        .from('agent_teams')
        .insert({
          name: newTeamName,
          description: newTeamDescription,
          team_config: {
            hierarchy: 'hierarchical',
            communication_rules: ['respect_priority', 'async_communication'],
            coordination_strategy: 'sequential'
          }
        })
        .select()
        .single();

      if (error) throw error;

      setTeams(prev => [data, ...prev]);
      setNewTeamName('');
      setNewTeamDescription('');
      setIsCreating(false);
      setSelectedTeam(data);

      toast({
        title: "Team erstellt",
        description: `Team "${data.name}" wurde erfolgreich erstellt.`,
      });
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Fehler",
        description: "Team konnte nicht erstellt werden.",
        variant: "destructive"
      });
    }
  };

  const addMember = async (workflowId: string, role: 'manager' | 'worker' | 'coordinator') => {
    if (!selectedTeam) return;

    try {
      const priority = role === 'manager' ? 10 : role === 'coordinator' ? 5 : 1;

      // Use type assertion for new table
      const { data, error } = await (supabase as any)
        .from('team_members')
        .insert({
          team_id: selectedTeam.id,
          agent_workflow_id: workflowId,
          role,
          priority,
          config: {
            specialization: role,
            capabilities: [role === 'manager' ? 'delegation' : 'execution'],
            constraints: []
          }
        })
        .select('*, workflows(*)')
        .single();

      if (error) throw error;

      setTeamMembers(prev => [...prev, data]);

      toast({
        title: "Mitglied hinzugefügt",
        description: `Workflow wurde als ${role} hinzugefügt.`,
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Fehler",
        description: "Mitglied konnte nicht hinzugefügt werden.",
        variant: "destructive"
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      // Use type assertion for new table
      const { error } = await (supabase as any)
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setTeamMembers(prev => prev.filter(m => m.id !== memberId));

      toast({
        title: "Mitglied entfernt",
        description: "Das Mitglied wurde aus dem Team entfernt.",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Fehler",
        description: "Mitglied konnte nicht entfernt werden.",
        variant: "destructive"
      });
    }
  };

  const executeTeam = async () => {
    if (!selectedTeam) return;

    try {
      const response = await supabase.functions.invoke('team-execution', {
        body: {
          teamId: selectedTeam.id,
          inputData: {
            task: 'Multi-agent coordination test',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Team-Ausführung gestartet",
        description: `Team "${selectedTeam.name}" wurde erfolgreich ausgeführt.`,
      });
    } catch (error) {
      console.error('Error executing team:', error);
      toast({
        title: "Fehler",
        description: "Team-Ausführung fehlgeschlagen.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-500">Lade Teams...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-6">
      {/* Teams List */}
      <div className="w-1/3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Agent Teams</h3>
          <Button
            onClick={() => setIsCreating(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Neues Team
          </Button>
        </div>

        {isCreating && (
          <Card className="mb-4">
            <CardContent className="pt-4 space-y-3">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Mein Agent Team"
                />
              </div>
              <div>
                <Label htmlFor="teamDescription">Beschreibung</Label>
                <Textarea
                  id="teamDescription"
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="Team-Beschreibung..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={createTeam} size="sm">
                  Erstellen
                </Button>
                <Button
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                  size="sm"
                >
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {teams.map((team) => (
            <Card
              key={team.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTeam?.id === team.id ? 'ring-2 ring-neural-500' : ''
              }`}
              onClick={() => setSelectedTeam(team)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{team.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {team.description || 'Keine Beschreibung'}
                    </p>
                  </div>
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Teams erstellt</p>
            <p className="text-sm mt-2">Erstellen Sie Ihr erstes Agent Team</p>
          </div>
        )}
      </div>

      {/* Team Details */}
      <div className="flex-1">
        {selectedTeam ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedTeam.name}</h2>
                <p className="text-gray-600">{selectedTeam.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={executeTeam}
                  className="flex items-center gap-2"
                  disabled={teamMembers.length === 0}
                >
                  <Play className="h-4 w-4" />
                  Team ausführen
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Team Mitglieder ({teamMembers.length})</span>
                  <Select onValueChange={(value) => {
                    const [workflowId, role] = value.split(':');
                    addMember(workflowId, role as any);
                  }}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Mitglied hinzufügen" />
                    </SelectTrigger>
                    <SelectContent>
                      {workflows.map((workflow) => (
                        <React.Fragment key={workflow.id}>
                          <SelectItem value={`${workflow.id}:manager`}>
                            {workflow.name} (Manager)
                          </SelectItem>
                          <SelectItem value={`${workflow.id}:worker`}>
                            {workflow.name} (Worker)
                          </SelectItem>
                          <SelectItem value={`${workflow.id}:coordinator`}>
                            {workflow.name} (Coordinator)
                          </SelectItem>
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">
                            {member.workflow?.name || 'Workflow'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{member.role}</Badge>
                            <span className="text-xs text-gray-500">
                              Priorität: {member.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeMember(member.id)}
                        variant="ghost"
                        size="icon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {teamMembers.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <p>Noch keine Mitglieder</p>
                    <p className="text-sm mt-1">Fügen Sie Workflows als Team-Mitglieder hinzu</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Wählen Sie ein Team aus</p>
              <p className="text-sm mt-2">Oder erstellen Sie ein neues Team</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
