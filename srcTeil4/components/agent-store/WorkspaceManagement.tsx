
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Briefcase, Users, Clock, PlusCircle, Settings, UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AgentCollection, TeamMember, UserWorkspace, TeamMemberRole } from "@/types/agent.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkspaceManagementProps {
  workspace: UserWorkspace;
  onWorkspaceUpdate: (updates: Partial<UserWorkspace>) => void;
}

export function WorkspaceManagement({ workspace, onWorkspaceUpdate }: WorkspaceManagementProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [isAddTeamMemberOpen, setIsAddTeamMemberOpen] = useState(false);
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false);
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    email: '',
    role: 'member' as TeamMemberRole,
  });
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
  });
  
  const handleUpdateSetting = (key: string, value: any) => {
    onWorkspaceUpdate({
      settings: {
        ...workspace.settings,
        [key]: value
      }
    });
    
    toast({
      title: "Settings updated",
      description: "Your workspace settings have been updated."
    });
  };
  
  const handleAddTeamMember = () => {
    if (!newTeamMember.name || !newTeamMember.email) {
      toast({
        title: "Missing information",
        description: "Please provide both name and email for the new team member.",
        variant: "destructive"
      });
      return;
    }
    
    const teamMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: newTeamMember.name,
      email: newTeamMember.email,
      role: newTeamMember.role,
      permissions: {
        canCreateAgents: newTeamMember.role !== 'guest',
        canHireAgents: newTeamMember.role !== 'guest',
        canModifyWorkspace: newTeamMember.role === 'owner' || newTeamMember.role === 'admin'
      }
    };
    
    onWorkspaceUpdate({
      team: [...(workspace.team || []), teamMember]
    });
    
    setNewTeamMember({
      name: '',
      email: '',
      role: 'member',
    });
    
    setIsAddTeamMemberOpen(false);
    
    toast({
      title: "Team member added",
      description: `${teamMember.name} has been added to your workspace.`
    });
  };
  
  const handleAddCollection = () => {
    if (!newCollection.name) {
      toast({
        title: "Collection name required",
        description: "Please provide a name for the new collection.",
        variant: "destructive"
      });
      return;
    }
    
    const collection: AgentCollection = {
      id: `collection-${Date.now()}`,
      name: newCollection.name,
      description: newCollection.description,
      agentIds: [],
      isDefault: false
    };
    
    onWorkspaceUpdate({
      collections: [...workspace.collections, collection]
    });
    
    setNewCollection({
      name: '',
      description: '',
    });
    
    setIsAddCollectionOpen(false);
    
    toast({
      title: "Collection created",
      description: `'${collection.name}' collection has been created.`
    });
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-quantum-600" />
            Workspace Management
          </CardTitle>
          <CardDescription>
            Manage your AImpact OS workspace, team members and agent collections
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="ml-6 mb-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="logs">Agent Logs</TabsTrigger>
          </TabsList>
          
          <CardContent>
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  value={workspace.name}
                  onChange={(e) => onWorkspaceUpdate({ name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workspace-description">Workspace Description</Label>
                <Input
                  id="workspace-description"
                  value={workspace.description || ''}
                  onChange={(e) => onWorkspaceUpdate({ description: e.target.value })}
                />
              </div>
              
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-medium">Workspace Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Session Continuity</h4>
                      <p className="text-sm text-muted-foreground">
                        Maintain agent context between sessions
                      </p>
                    </div>
                    <Switch
                      checked={workspace.settings.sessionContinuity || false}
                      onCheckedChange={(checked) => handleUpdateSetting('sessionContinuity', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Voice Interaction</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable voice interaction with agents by default
                      </p>
                    </div>
                    <Switch
                      checked={workspace.settings.defaultVoiceSettings?.enabled || false}
                      onCheckedChange={(checked) => handleUpdateSetting('defaultVoiceSettings', {
                        ...(workspace.settings.defaultVoiceSettings || {}),
                        enabled: checked
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Automatic Improvement</h4>
                      <p className="text-sm text-muted-foreground">
                        Allow agents to improve themselves based on feedback
                      </p>
                    </div>
                    <Switch
                      checked={workspace.settings.autoImprovement}
                      onCheckedChange={(checked) => handleUpdateSetting('autoImprovement', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about agent activity
                      </p>
                    </div>
                    <Switch
                      checked={workspace.settings.notifications}
                      onCheckedChange={(checked) => handleUpdateSetting('notifications', checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="team" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Team Members</h3>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddTeamMemberOpen(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Button>
              </div>
              
              <div className="space-y-2">
                {workspace.team && workspace.team.length > 0 ? (
                  workspace.team.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <Badge>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    No team members yet. Add your first team member to collaborate.
                  </p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="collections" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Agent Collections</h3>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => setIsAddCollectionOpen(true)}
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  New Collection
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workspace.collections.map((collection) => (
                  <Card key={collection.id}>
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {collection.name}
                          {collection.isDefault && (
                            <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>
                          )}
                        </CardTitle>
                        <Badge variant="outline">{collection.agentIds.length} agents</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="py-2">
                      <p className="text-sm text-muted-foreground">
                        {collection.description || "No description provided."}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="logs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Agent Activity Logs</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  View All
                </Button>
              </div>
              
              {workspace.agentLogs && workspace.agentLogs.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {workspace.agentLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="p-3 border rounded-md"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {log.taskDescription || "Untitled Task"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Agent ID: {log.agentId}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {new Date(log.startTime).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No agent activity logs yet. Logs will appear when you start working with agents.
                </p>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
      
      {/* Add Team Member Dialog */}
      <Dialog open={isAddTeamMemberOpen} onOpenChange={setIsAddTeamMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Name</Label>
              <Input
                id="member-name"
                placeholder="John Doe"
                value={newTeamMember.name}
                onChange={(e) => setNewTeamMember({...newTeamMember, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                placeholder="john@example.com"
                type="email"
                value={newTeamMember.email}
                onChange={(e) => setNewTeamMember({...newTeamMember, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="member-role">Role</Label>
              <select
                id="member-role"
                className="w-full p-2 rounded-md border"
                value={newTeamMember.role}
                onChange={(e) => setNewTeamMember({...newTeamMember, role: e.target.value as any})}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleAddTeamMember}>
              Add Team Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add Collection Dialog */}
      <Dialog open={isAddCollectionOpen} onOpenChange={setIsAddCollectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Agent Collection</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input
                id="collection-name"
                placeholder="My Collection"
                value={newCollection.name}
                onChange={(e) => setNewCollection({...newCollection, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="collection-description">Description (Optional)</Label>
              <Input
                id="collection-description"
                placeholder="Describe this collection"
                value={newCollection.description}
                onChange={(e) => setNewCollection({...newCollection, description: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleAddCollection}>
              Create Collection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
