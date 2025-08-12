import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

interface PricingPlansProps {
  onSelectPlan?: (planId: string) => void;
  currentPlan?: string;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ onSelectPlan, currentPlan }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [pricingData, setPricingData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch pricing data from API
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const response = await fetch('/api/payments/pricing');
        if (response.ok) {
          const data = await response.json();
          setPricingData(data.pricing_tiers);
        } else {
          console.error('Failed to fetch pricing data');
        }
      } catch (error) {
        console.error('Error fetching pricing data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchPricingData();
  }, []);

  // Default pricing tiers (fallback)
  const defaultPricingTiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 99,
      currency: 'USD',
      interval: 'month',
      icon: <Star className="h-6 w-6" />,
      features: [
        '5 voice agents',
        '1,000 conversations/month',
        '500 voice minutes',
        'Basic analytics',
        'Email support',
        '1GB storage'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 299,
      currency: 'USD',
      interval: 'month',
      popular: true,
      icon: <Zap className="h-6 w-6" />,
      features: [
        '25 voice agents',
        '10,000 conversations/month',
        '5,000 voice minutes',
        'Advanced analytics',
        'Priority support',
        'Custom integrations',
        '10GB storage',
        'API access'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 999,
      currency: 'USD',
      interval: 'month',
      icon: <Crown className="h-6 w-6" />,
      features: [
        'Unlimited voice agents',
        'Unlimited conversations',
        'Unlimited voice minutes',
        'White-label solution',
        '24/7 dedicated support',
        'Custom development',
        '100GB storage',
        'Advanced API access',
        'SLA guarantee',
        'On-premise deployment option'
      ]
    }
  ];

  // Use API data if available, otherwise use default
  const pricingTiers: PricingTier[] = pricingData ? [
    {
      id: 'starter',
      name: pricingData.starter.name,
      price: pricingData.starter.price,
      currency: 'USD',
      interval: 'month',
      icon: <Star className="h-6 w-6" />,
      features: pricingData.starter.features
    },
    {
      id: 'professional',
      name: pricingData.professional.name,
      price: pricingData.professional.price,
      currency: 'USD',
      interval: 'month',
      popular: true,
      icon: <Zap className="h-6 w-6" />,
      features: pricingData.professional.features
    },
    {
      id: 'enterprise',
      name: pricingData.enterprise.name,
      price: pricingData.enterprise.price,
      currency: 'USD',
      interval: 'month',
      icon: <Crown className="h-6 w-6" />,
      features: pricingData.enterprise.features
    }
  ] : defaultPricingTiers;

  const handleSelectPlan = async (planId: string) => {
    if (currentPlan === planId) {
      toast.info('You are already on this plan');
      return;
    }

    setLoading(planId);
    
    try {
      // Call the onSelectPlan callback if provided
      if (onSelectPlan) {
        await onSelectPlan(planId);
      } else {
        // Default behavior - redirect to checkout or show modal
        toast.success(`Selected ${pricingTiers.find(t => t.id === planId)?.name} plan`);
      }
    } catch (error) {
      toast.error('Failed to select plan. Please try again.');
      console.error('Plan selection error:', error);
    } finally {
      setLoading(null);
    }
  };

  if (loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Scale your voice agent platform with flexible pricing that grows with your business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingTiers.map((tier) => (
          <Card 
            key={tier.id} 
            className={`relative transition-all duration-300 hover:shadow-lg ${
              tier.popular ? 'border-primary shadow-lg scale-105' : ''
            } ${
              currentPlan === tier.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            {tier.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full ${
                  tier.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {tier.icon}
                </div>
              </div>
              
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              
              <div className="mt-4">
                <span className="text-4xl font-bold">${tier.price}</span>
                <span className="text-muted-foreground">/{tier.interval}</span>
              </div>
              
              <CardDescription className="mt-2">
                Perfect for {tier.id === 'starter' ? 'small teams' : 
                           tier.id === 'professional' ? 'growing businesses' : 
                           'large enterprises'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full" 
                variant={tier.popular ? 'default' : 'outline'}
                onClick={() => handleSelectPlan(tier.id)}
                disabled={loading === tier.id || currentPlan === tier.id}
              >
                {loading === tier.id ? (
                  'Processing...'
                ) : currentPlan === tier.id ? (
                  'Current Plan'
                ) : (
                  `Choose ${tier.name}`
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-4">
          All plans include a 14-day free trial. No credit card required.
        </p>
        <div className="flex justify-center gap-8 text-sm text-muted-foreground">
          <span>✓ Cancel anytime</span>
          <span>✓ 99.9% uptime SLA</span>
          <span>✓ SOC 2 compliant</span>
          <span>✓ 24/7 support</span>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;