
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Bot, 
  Workflow, 
  Mic, 
  TrendingUp, 
  Users, 
  Zap, 
  Star,
  Play,
  Plus,
  ArrowRight,
  Activity,
  Clock,
  DollarSign,
  Download
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { title: "Active Workflows", value: "12", change: "+2", icon: Workflow, color: "text-blue-600" },
    { title: "AI Agents", value: "8", change: "+3", icon: Bot, color: "text-green-600" },
    { title: "Voice Agents", value: "5", change: "+1", icon: Mic, color: "text-purple-600" },
    { title: "API Calls Today", value: "1,247", change: "+15%", icon: Zap, color: "text-orange-600" }
  ];

  const recentWorkflows = [
    { id: "1", name: "Customer Support Bot", status: "running", executions: 145, lastRun: "2 minutes ago", performance: 98 },
    { id: "2", name: "Content Generator", status: "paused", executions: 89, lastRun: "1 hour ago", performance: 94 },
    { id: "3", name: "Data Analyzer", status: "running", executions: 67, lastRun: "5 minutes ago", performance: 87 },
    { id: "4", name: "Email Automation", status: "running", executions: 234, lastRun: "Just now", performance: 96 }
  ];

  const quickActions = [
    { title: "Create Workflow", description: "Build a new AI workflow", icon: Workflow, href: "/core-platform", color: "bg-blue-50 hover:bg-blue-100 border-blue-200" },
    { title: "New AI Agent", description: "Design an intelligent agent", icon: Bot, href: "/studio", color: "bg-green-50 hover:bg-green-100 border-green-200" },
    { title: "Voice Agent", description: "Create voice assistant", icon: Mic, href: "/voice-agents", color: "bg-purple-50 hover:bg-purple-100 border-purple-200" },
    { title: "Browse Store", description: "Discover pre-built agents", icon: Download, href: "/agent-store", color: "bg-orange-50 hover:bg-orange-100 border-orange-200" }
  ];

  const marketplaceHighlights = [
    { name: "Customer Service Pro", author: "AImpact Team", rating: 4.9, downloads: 1234, price: "Free" },
    { name: "Content Creator", author: "Creative AI", rating: 4.8, downloads: 892, price: "$29" },
    { name: "Data Insights", author: "Analytics Pro", rating: 4.7, downloads: 567, price: "$49" }
  ];

  return (
    <PageLayout>
      <div className="container mx-auto py-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your AI platform today.
            </p>
          </div>
          <Button asChild>
            <Link to="/core-platform">
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Workflows</CardTitle>
                    <CardDescription>Your most active AI workflows</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentWorkflows.map((workflow) => (
                      <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${workflow.status === 'running' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <div>
                            <p className="font-medium">{workflow.name}</p>
                            <p className="text-sm text-muted-foreground">{workflow.executions} executions • {workflow.lastRun}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">{workflow.performance}%</p>
                            <Progress value={workflow.performance} className="w-16 h-2" />
                          </div>
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {quickActions.map((action) => (
                      <Link key={action.title} to={action.href}>
                        <div className={`p-3 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${action.color}`}>
                          <div className="flex items-center space-x-3">
                            <action.icon className="h-5 w-5" />
                            <div>
                              <p className="font-medium text-sm">{action.title}</p>
                              <p className="text-xs text-muted-foreground">{action.description}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-dashed border-2 border-muted-foreground/25">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Create New Agent</h3>
                  <p className="text-sm text-muted-foreground mb-4">Build a custom AI agent for your specific needs</p>
                  <Button asChild>
                    <Link to="/studio">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Sample Agents */}
              {[
                { name: "Customer Support", description: "Handles customer inquiries", status: "Active", conversations: 145 },
                { name: "Content Writer", description: "Creates blog posts and articles", status: "Active", conversations: 89 },
                { name: "Data Analyst", description: "Analyzes business metrics", status: "Paused", conversations: 67 }
              ].map((agent) => (
                <Card key={agent.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge variant={agent.status === "Active" ? "default" : "secondary"}>
                        {agent.status}
                      </Badge>
                    </div>
                    <CardDescription>{agent.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {agent.conversations} conversations today
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaceHighlights.map((item) => (
                <Card key={item.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {item.name}
                      <Badge variant="outline">{item.price}</Badge>
                    </CardTitle>
                    <CardDescription>by {item.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{item.rating}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.downloads} downloads
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Get Agent
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center">
              <Button asChild variant="outline">
                <Link to="/agent-store">
                  View Full Marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2,345</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+5% from last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.2s</div>
                  <p className="text-xs text-muted-foreground">-0.3s improvement</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">98.5%</div>
                  <p className="text-xs text-muted-foreground">+0.2% from yesterday</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Your platform performance metrics over the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                    <p>Analytics dashboard will be available soon</p>
                    <p className="text-sm">Real-time metrics and insights coming in the next update</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
