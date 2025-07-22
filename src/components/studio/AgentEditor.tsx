
import { useState } from 'react';
import { useAgentBuilder } from '@/hooks/use-agent-builder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { User, BrainCircuit, FlaskConical, MessageSquare, Save, Trash2, Rocket } from 'lucide-react';
import AgentProfileTab from './tabs/AgentProfileTab';
import AgentCapabilitiesTab from './tabs/AgentCapabilitiesTab';
import AgentKnowledgeTab from './tabs/AgentKnowledgeTab';
import AgentTestTab from './tabs/AgentTestTab';
import { ConfirmDialog } from '../ui/ConfirmDialog';

export function AgentEditor() {
    const { selectedAgent, saveAgent, deleteAgent } = useAgentBuilder();
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    if (!selectedAgent) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                    <p>Select an agent to start editing</p>
                    <p>or create a new one.</p>
                </div>
            </div>
        )
    }

    const handleSave = () => {
        saveAgent();
        toast({ title: "Agent saved!", description: `${selectedAgent.profile.name} has been updated.` });
    };

    const handleDeleteConfirm = () => {
        deleteAgent(selectedAgent.id);
        toast({ title: "Agent deleted", variant: "destructive" });
        setDeleteConfirmOpen(false);
    };
    
    return (
        <div className="p-4 md:p-6 h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center pb-4 border-b mb-4">
                <h2 className="text-2xl font-bold">{selectedAgent.profile.name}</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setDeleteConfirmOpen(true)}>
                        <Trash2 className="mr-2" /> Delete
                    </Button>
                     <Button variant="outline">
                        <Rocket className="mr-2" /> Publish
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="mr-2" /> Save
                    </Button>
                </div>
            </div>
            <Tabs defaultValue="profile" className="flex-1 flex flex-col">
                <TabsList>
                    <TabsTrigger value="profile"><User className="mr-2" />Profile</TabsTrigger>
                    <TabsTrigger value="capabilities"><BrainCircuit className="mr-2" />Capabilities</TabsTrigger>
                    <TabsTrigger value="knowledge"><FlaskConical className="mr-2" />Knowledge</TabsTrigger>
                    <TabsTrigger value="test"><MessageSquare className="mr-2" />Test</TabsTrigger>
                </TabsList>
                <div className="flex-1 mt-4 overflow-y-auto">
                    <TabsContent value="profile"><AgentProfileTab /></TabsContent>
                    <TabsContent value="capabilities"><AgentCapabilitiesTab /></TabsContent>
                    <TabsContent value="knowledge"><AgentKnowledgeTab /></TabsContent>
                    <TabsContent value="test"><AgentTestTab /></TabsContent>
                </div>
            </Tabs>
             <ConfirmDialog
                open={isDeleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                onConfirm={handleDeleteConfirm}
                title={`Delete Agent`}
                description={`Are you sure you want to delete ${selectedAgent.profile.name}? This action cannot be undone.`}
            />
        </div>
    );
}
