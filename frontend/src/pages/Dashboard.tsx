
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Plus,
  BarChart3,
  AlertCircle,
  Play,
  Settings
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from 'react-router-dom';
import { apiService, Agent, Workflow as WorkflowType, Task } from '@/services/apiService';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalWorkflows: 0,
    completedTasks: 0,
    totalTasks: 0,
    totalSessions: 0,
    activeWorkflows: 0,
    activeSessions: 0
  });
  const [recentWorkflows, setRecentWorkflows] = useState<WorkflowType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardStats, workflows] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getWorkflows()
        ]);
        
        setStats(dashboardStats);
        setRecentWorkflows(workflows.slice(0, 4)); // Show only first 4 workflows
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsDisplay = [
    {
      title: "Active Workflows",
      value: stats.activeWorkflows.toString(),
      change: "+2 this week",
      icon: Workflow,
      trend: "up"
    },
    {
      title: "AI Agents",
      value: stats.totalAgents.toString(),
      change: "+3 this month",
      icon: Bot,
      trend: "up"
    },
    {
      title: "Executions",
      value: stats.completedTasks.toString(),
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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsDisplay.map((stat) => (
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
              {recentWorkflows.map((workflow) => {
                const statusColor = workflow.status === 'active' ? 'bg-green-500' : 
                                  workflow.status === 'completed' ? 'bg-blue-500' : 
                                  workflow.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500';
                const progress = workflow.status === 'completed' ? 100 : 
                               workflow.status === 'active' ? 75 : 
                               workflow.status === 'pending' ? 25 : 0;
                
                return (
                  <div key={workflow._id || workflow.workflow_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-quantum-600 to-neural-600 flex items-center justify-center">
                        <Workflow className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">{workflow.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Status: {workflow.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                        {workflow.status}
                      </Badge>
                      <div className="flex items-center space-x-2">
                        <Progress value={progress} className="w-20" />
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {recentWorkflows.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No workflows found. Create your first workflow to get started.
                </div>
              )}
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
        </>
      )}

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
};

export default Dashboard;
