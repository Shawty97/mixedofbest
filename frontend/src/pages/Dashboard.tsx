
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Bot, 
  Workflow, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Zap,
  ArrowRight,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Active Workflows",
      value: "12",
      change: "+2 this week",
      icon: Workflow,
      trend: "up"
    },
    {
      title: "AI Agents",
      value: "8",
      change: "+3 this month",
      icon: Bot,
      trend: "up"
    },
    {
      title: "Executions",
      value: "1,247",
      change: "+12% from last month",
      icon: Zap,
      trend: "up"
    },
    {
      title: "Success Rate",
      value: "98.5%",
      change: "+0.3% from last week",
      icon: CheckCircle,
      trend: "up"
    }
  ];

  const recentWorkflows = [
    { id: 1, name: "Customer Support Automation", status: "active", lastRun: "2 minutes ago", executions: 145 },
    { id: 2, name: "Data Processing Pipeline", status: "paused", lastRun: "1 hour ago", executions: 89 },
    { id: 3, name: "Content Generation Flow", status: "active", lastRun: "15 minutes ago", executions: 203 },
    { id: 4, name: "Email Classification", status: "active", lastRun: "5 minutes ago", executions: 67 }
  ];

  const quickActions = [
    { title: "Create New Workflow", icon: Workflow, href: "/workflows", description: "Build AI-powered automation" },
    { title: "Train New Agent", icon: Bot, href: "/studio", description: "Create intelligent AI assistants" },
    { title: "Browse Agent Store", icon: Users, href: "/agent-store", description: "Discover community agents" },
    { title: "Build Knowledge Base", icon: Brain, href: "/knowledge-builder", description: "Create smart documentation" }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your AI platform today.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Workflows */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Workflows</CardTitle>
            <CardDescription>
              Your latest automation workflows and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentWorkflows.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-quantum-600 to-neural-600 flex items-center justify-center">
                      <Workflow className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">{workflow.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Last run: {workflow.lastRun}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                      {workflow.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {workflow.executions} runs
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/workflows">
                  View All Workflows
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <Button key={action.title} variant="ghost" className="w-full justify-start h-auto p-3" asChild>
                  <Link to={action.href}>
                    <action.icon className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current platform health and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>API Response Time</span>
                <span>142ms</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Workflow Success Rate</span>
                <span>98.5%</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Agent Availability</span>
                <span>99.2%</span>
              </div>
              <Progress value={99} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
