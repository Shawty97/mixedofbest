import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Mic, 
  HardDrive,
  ExternalLink,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  status: string;
  tier_id: string;
  tier_name: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

interface UsageMetrics {
  conversations: number;
  api_calls: number;
  voice_minutes: number;
  agents_created: number;
  storage_mb: number;
}

interface UsageLimits {
  conversations: number;
  api_calls: number;
  voice_minutes: number;
  agents_created: number;
  storage_gb: number;
}

interface BillingDashboardProps {
  customerId?: string;
}

const BillingDashboard: React.FC<BillingDashboardProps> = ({ customerId = 'demo-customer' }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageMetrics>({
    conversations: 245,
    api_calls: 1250,
    voice_minutes: 87.5,
    agents_created: 3,
    storage_mb: 256
  });
  const [limits, setLimits] = useState<UsageLimits>({
    conversations: 1000,
    api_calls: 10000,
    voice_minutes: 500,
    agents_created: 5,
    storage_gb: 1
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock subscription data
    setSubscription({
      id: 'sub_demo123',
      status: 'active',
      tier_id: 'starter',
      tier_name: 'Starter',
      current_period_start: Math.floor(Date.now() / 1000) - (15 * 24 * 60 * 60), // 15 days ago
      current_period_end: Math.floor(Date.now() / 1000) + (15 * 24 * 60 * 60), // 15 days from now
      cancel_at_period_end: false
    });
  }, [customerId]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          return_url: window.location.href
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.url) {
        window.location.href = result.url;
      } else {
        throw new Error(result.detail || 'Failed to create portal session');
      }
    } catch (error) {
      toast.error('Failed to open billing portal');
      console.error('Billing portal error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    // Navigate to pricing page or open upgrade modal
    toast.info('Redirecting to upgrade options...');
  };

  if (!subscription) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Usage</h1>
          <p className="text-muted-foreground">Manage your subscription and monitor usage</p>
        </div>
        <Button onClick={handleManageBilling} disabled={loading}>
          <CreditCard className="h-4 w-4 mr-2" />
          {loading ? 'Loading...' : 'Manage Billing'}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Details</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Current Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-lg font-semibold">{subscription.tier_name}</p>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                    {subscription.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Billing Period</p>
                  <p className="text-sm">
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Billing</p>
                  <p className="text-sm">{formatDate(subscription.current_period_end)}</p>
                  {subscription.cancel_at_period_end && (
                    <Badge variant="destructive" className="mt-1">
                      Cancelling
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Conversations</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{usage.conversations.toLocaleString()}</span>
                    <span className="text-muted-foreground">
                      {limits.conversations === -1 ? 'unlimited' : limits.conversations.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.conversations, limits.conversations)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mic className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Voice Minutes</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{usage.voice_minutes}</span>
                    <span className="text-muted-foreground">
                      {limits.voice_minutes === -1 ? 'unlimited' : limits.voice_minutes}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.voice_minutes, limits.voice_minutes)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Agents</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{usage.agents_created}</span>
                    <span className="text-muted-foreground">
                      {limits.agents_created === -1 ? 'unlimited' : limits.agents_created}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.agents_created, limits.agents_created)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{(usage.storage_mb / 1024).toFixed(2)}GB</span>
                    <span className="text-muted-foreground">{limits.storage_gb}GB</span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(usage.storage_mb, limits.storage_gb * 1024)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Alerts */}
          {getUsagePercentage(usage.conversations, limits.conversations) > 80 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Usage Alert</p>
                    <p className="text-sm text-yellow-700">
                      You've used {getUsagePercentage(usage.conversations, limits.conversations).toFixed(0)}% 
                      of your monthly conversation limit. Consider upgrading to avoid service interruption.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleUpgrade}>
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Usage Metrics</CardTitle>
              <CardDescription>
                Monitor your platform usage across all services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { label: 'Conversations', value: usage.conversations, limit: limits.conversations, icon: MessageSquare },
                  { label: 'API Calls', value: usage.api_calls, limit: limits.api_calls, icon: TrendingUp },
                  { label: 'Voice Minutes', value: usage.voice_minutes, limit: limits.voice_minutes, icon: Mic },
                  { label: 'Agents Created', value: usage.agents_created, limit: limits.agents_created, icon: Users },
                ].map((metric) => {
                  const percentage = getUsagePercentage(metric.value, metric.limit);
                  const Icon = metric.icon;
                  
                  return (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{metric.label}</span>
                        </div>
                        <span className={`text-sm font-medium ${getUsageColor(percentage)}`}>
                          {metric.value} / {metric.limit === -1 ? 'unlimited' : metric.limit}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}% used this billing period
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your past invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock billing history */}
                {[
                  { date: '2024-01-01', amount: '$99.00', status: 'Paid', invoice: 'inv_123' },
                  { date: '2023-12-01', amount: '$99.00', status: 'Paid', invoice: 'inv_122' },
                  { date: '2023-11-01', amount: '$99.00', status: 'Paid', invoice: 'inv_121' },
                ].map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{invoice.date}</p>
                      <p className="text-sm text-muted-foreground">Invoice {invoice.invoice}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{invoice.amount}</p>
                      <Badge variant={invoice.status === 'Paid' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingDashboard;