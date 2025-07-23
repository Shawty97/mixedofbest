
import { useNavigate } from "react-router-dom";
import { Brain, Bot, Database, Play, Plus, BookOpen, Workflow } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgentBuilder } from "@/hooks/use-agent-builder";
import { useKnowledgeBuilder } from "@/hooks/use-knowledge-builder";
import { PageTitle } from "@/components/ui/PageTitle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function Dashboard() {
  const navigate = useNavigate();
  const { agents } = useAgentBuilder();
  const { sources } = useKnowledgeBuilder();

  const knowledgeStats = sources.reduce((acc, source) => {
    acc[source.status] = (acc[source.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageTitle>Dashboard</PageTitle>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/studio')}>
                      <Bot /> New Agent
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/knowledge-builder')}>
                      <BookOpen /> Add Knowledge
                  </Button>
                   <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/core-platform')}>
                      <Workflow /> New Workflow
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/agent-store')}>
                      <Play /> Explore Agents
                  </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Agents</CardTitle>
                <CardDescription>Your recently edited agents.</CardDescription>
              </CardHeader>
              <CardContent>
                 {agents.length > 0 ? (
                    <div className="space-y-2">
                        {agents.slice(0, 3).map(agent => (
                            <div key={agent.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={agent.profile.avatar} />
                                        <AvatarFallback><Bot /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{agent.profile.name}</p>
                                        <p className="text-sm text-muted-foreground">{agent.profile.description}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/studio')}>Edit</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-4">No agents created yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side column */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>Status of your knowledge sources.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Sources</span>
                    <span className="font-bold">{sources.length}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-green-500">Ready</span>
                    <span className="font-bold">{knowledgeStats.ready || 0}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-blue-500">Processing</span>
                    <span className="font-bold">{knowledgeStats.processing || 0}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-red-500">Error</span>
                    <span className="font-bold">{knowledgeStats.error || 0}</span>
                 </div>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>Recent Workflows</CardTitle>
                 <CardDescription>Coming Soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">Workflow data will be shown here.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

const Index = () => (
    <Dashboard />
)

export default Index;
