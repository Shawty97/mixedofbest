import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Shield, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Star,
  Building2,
  Stethoscope,
  Phone,
  Clock
} from 'lucide-react';
import HealthcareTemplates from '@/components/templates/HealthcareTemplates';
import { toast } from 'sonner';

const Healthcare: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    toast.success('Template selected! Redirecting to setup...');
    // Here you would typically redirect to the agent builder with the template
    // For now, we'll just show a success message
  };

  const healthcareStats = [
    {
      icon: <Users className="h-8 w-8" />,
      title: '500K+',
      subtitle: 'Patients Served',
      description: 'Healthcare organizations using our platform'
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: '40%',
      subtitle: 'Efficiency Increase',
      description: 'Average improvement in operational efficiency'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: '24/7',
      subtitle: 'Availability',
      description: 'Round-the-clock patient support'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: '100%',
      subtitle: 'HIPAA Compliant',
      description: 'Fully compliant with healthcare regulations'
    }
  ];

  const benefits = [
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: 'Reduce Administrative Burden',
      description: 'Automate routine tasks like appointment scheduling, patient intake, and insurance verification'
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: 'Improve Patient Experience',
      description: 'Provide 24/7 support, reduce wait times, and offer personalized care interactions'
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: 'Enhance Care Coordination',
      description: 'Streamline communication between patients, providers, and care teams'
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: 'Ensure Compliance',
      description: 'Built-in HIPAA compliance and security measures for all patient interactions'
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: 'Scale Operations',
      description: 'Handle increased patient volume without proportional staff increases'
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: 'Reduce Costs',
      description: 'Lower operational costs while maintaining high-quality patient care'
    }
  ];

  const useCases = [
    {
      icon: <Building2 className="h-6 w-6" />,
      title: 'Hospitals & Health Systems',
      description: 'Large-scale patient management, emergency response coordination, and multi-department communication',
      features: ['Emergency triage', 'Bed management', 'Discharge planning', 'Family communication']
    },
    {
      icon: <Stethoscope className="h-6 w-6" />,
      title: 'Private Practices',
      description: 'Streamlined appointment scheduling, patient intake, and follow-up care management',
      features: ['Appointment booking', 'Patient reminders', 'Insurance verification', 'Prescription refills']
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Mental Health Providers',
      description: 'Compassionate mental health screening, crisis intervention, and ongoing support',
      features: ['Crisis assessment', 'Therapy scheduling', 'Progress tracking', 'Resource referrals']
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Telehealth Platforms',
      description: 'Enhanced virtual care delivery with AI-powered patient triage and support',
      features: ['Pre-visit screening', 'Technical support', 'Follow-up care', 'Provider matching']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4" variant="secondary">
              <Heart className="h-4 w-4 mr-2" />
              Healthcare Solutions
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              Transform Healthcare with 
              <span className="text-primary"> AI Voice Agents</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Revolutionize patient care with HIPAA-compliant voice agents that enhance 
              efficiency, improve patient experience, and reduce operational costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {healthcareStats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4 text-primary">
                    {stat.icon}
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{stat.title}</h3>
                  <p className="font-semibold text-muted-foreground mb-1">{stat.subtitle}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Agent Templates</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-8">
            <HealthcareTemplates onSelectTemplate={handleTemplateSelect} />
          </TabsContent>

          <TabsContent value="benefits" className="mt-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Why Choose Our Healthcare AI Agents?</h2>
                <p className="text-xl text-muted-foreground">
                  Discover how AI voice agents can transform your healthcare organization
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {benefits.map((benefit, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {benefit.icon}
                        <div>
                          <h3 className="font-semibold mb-2">{benefit.title}</h3>
                          <p className="text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="use-cases" className="mt-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Healthcare Use Cases</h2>
                <p className="text-xl text-muted-foreground">
                  Tailored solutions for every type of healthcare organization
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {useCases.map((useCase, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {useCase.icon}
                        </div>
                        <CardTitle>{useCase.title}</CardTitle>
                      </div>
                      <CardDescription>{useCase.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold mb-3">Key Features:</h4>
                      <ul className="space-y-2">
                        {useCase.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="mt-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Security & Compliance</h2>
                <p className="text-xl text-muted-foreground">
                  Built with healthcare security and compliance at its core
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      HIPAA Compliance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• End-to-end encryption for all communications</li>
                      <li>• Secure data storage and transmission</li>
                      <li>• Access controls and audit logging</li>
                      <li>• Business Associate Agreement (BAA) available</li>
                      <li>• Regular security assessments</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Additional Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• SOC 2 Type II certified</li>
                      <li>• GDPR compliant for international patients</li>
                      <li>• FDA guidelines adherence</li>
                      <li>• JCAHO standards alignment</li>
                      <li>• State-specific healthcare regulations</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Data Protection & Privacy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Data Encryption</h4>
                        <p className="text-sm text-muted-foreground">
                          AES-256 encryption at rest and TLS 1.3 in transit
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Access Controls</h4>
                        <p className="text-sm text-muted-foreground">
                          Role-based access with multi-factor authentication
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Audit Trails</h4>
                        <p className="text-sm text-muted-foreground">
                          Comprehensive logging of all system interactions
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Healthcare Organization?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of healthcare providers already using AI voice agents
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Healthcare;