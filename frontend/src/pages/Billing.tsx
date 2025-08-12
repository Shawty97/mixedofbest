import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Settings, TrendingUp, Users } from 'lucide-react';
import PricingPlans from '@/components/payments/PricingPlans';
import BillingDashboard from '@/components/payments/BillingDashboard';
import StripeCheckout from '@/components/payments/StripeCheckout';
import { toast } from 'sonner';

interface BillingProps {
  // Add any props if needed
}

const Billing: React.FC<BillingProps> = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
  } | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Mock user subscription data
  const currentSubscription = {
    plan: 'starter',
    status: 'active',
    nextBilling: '2024-02-15'
  };

  const handleSelectPlan = async (planId: string) => {
    // Map plan IDs to plan details
    const planDetails = {
      starter: { id: 'starter', name: 'Starter', price: 99 },
      professional: { id: 'professional', name: 'Professional', price: 299 },
      enterprise: { id: 'enterprise', name: 'Enterprise', price: 999 }
    };

    const plan = planDetails[planId as keyof typeof planDetails];
    if (!plan) {
      toast.error('Invalid plan selected');
      return;
    }

    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (subscriptionId: string) => {
    toast.success('Subscription created successfully!');
    setShowCheckout(false);
    setSelectedPlan(null);
    setActiveTab('dashboard');
    // Refresh subscription data
  };

  const handleCheckoutError = (error: string) => {
    toast.error(`Checkout failed: ${error}`);
  };

  const handleCancelCheckout = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  if (showCheckout && selectedPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={handleCancelCheckout}
              className="mb-4"
            >
              ← Back to Plans
            </Button>
            <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
            <p className="text-muted-foreground">
              You're subscribing to the {selectedPlan.name} plan
            </p>
          </div>
          
          <StripeCheckout
            planId={selectedPlan.id}
            planName={selectedPlan.name}
            planPrice={selectedPlan.price}
            onSuccess={handleCheckoutSuccess}
            onError={handleCheckoutError}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage your subscription, view usage, and billing history
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <BillingDashboard customerId="demo-customer" />
        </TabsContent>
        
        <TabsContent value="plans" className="space-y-6">
          <PricingPlans 
            onSelectPlan={handleSelectPlan}
            currentPlan={currentSubscription.plan}
          />
        </TabsContent>
        
        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Voice Minutes</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.5</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  2 more available
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,250</div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
              <CardDescription>
                Monitor your platform usage over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Usage analytics chart would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Manage your payment methods and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <Badge>Default</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Billing Preferences
                </CardTitle>
                <CardDescription>
                  Configure your billing and notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Billing Email</label>
                  <p className="text-sm text-muted-foreground">billing@example.com</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Frequency</label>
                  <p className="text-sm text-muted-foreground">Monthly</p>
                </div>
                <Button variant="outline" className="w-full">
                  Update Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>
                Manage your current subscription and billing cycle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Current Plan: {currentSubscription.plan}</p>
                  <p className="text-sm text-muted-foreground">
                    Status: {currentSubscription.status} • Next billing: {currentSubscription.nextBilling}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    Change Plan
                  </Button>
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Billing;