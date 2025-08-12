import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Stethoscope, 
  Calendar, 
  Phone, 
  Clock, 
  Users, 
  FileText, 
  Shield,
  Pill,
  Activity,
  Building2,
  Home,
  FlaskConical,
  CreditCard,
  Microscope,
  Dumbbell,
  TestTube,
  Smartphone,
  UserCheck,
  Bed,
  Truck,
  Brain,
  Baby
} from 'lucide-react';
import { toast } from 'sonner';

interface HealthcareTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  features: string[];
  useCase: string;
  compliance: string[];
  estimatedSetupTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface HealthcareTemplatesProps {
  onSelectTemplate?: (templateId: string) => void;
}

const HealthcareTemplates: React.FC<HealthcareTemplatesProps> = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState<string | null>(null);

  const healthcareTemplates: HealthcareTemplate[] = [
    {
      id: 'patient-intake',
      name: 'Patient Intake Assistant',
      description: 'Automated patient registration and initial screening',
      category: 'Patient Care',
      icon: <FileText className="h-6 w-6" />,
      features: [
        'Automated patient registration',
        'Insurance verification',
        'Medical history collection',
        'Symptom pre-screening',
        'Appointment scheduling',
        'HIPAA compliant data handling'
      ],
      useCase: 'Streamline patient onboarding and reduce administrative burden',
      compliance: ['HIPAA', 'SOC 2', 'GDPR'],
      estimatedSetupTime: '2-3 hours',
      difficulty: 'Beginner'
    },
    {
      id: 'appointment-scheduler',
      name: 'Smart Appointment Scheduler',
      description: 'AI-powered appointment booking and management',
      category: 'Scheduling',
      icon: <Calendar className="h-6 w-6" />,
      features: [
        'Intelligent scheduling optimization',
        'Multi-provider calendar sync',
        'Automated reminders',
        'Cancellation and rescheduling',
        'Waitlist management',
        'Insurance-based scheduling'
      ],
      useCase: 'Optimize appointment scheduling and reduce no-shows',
      compliance: ['HIPAA', 'SOC 2'],
      estimatedSetupTime: '3-4 hours',
      difficulty: 'Intermediate'
    },
    {
      id: 'medication-reminder',
      name: 'Medication Adherence Assistant',
      description: 'Personalized medication reminders and tracking',
      category: 'Patient Care',
      icon: <Pill className="h-6 w-6" />,
      features: [
        'Personalized medication schedules',
        'Voice and text reminders',
        'Adherence tracking',
        'Side effect monitoring',
        'Pharmacy integration',
        'Caregiver notifications'
      ],
      useCase: 'Improve medication adherence and patient outcomes',
      compliance: ['HIPAA', 'FDA Guidelines'],
      estimatedSetupTime: '4-5 hours',
      difficulty: 'Advanced'
    },
    {
      id: 'telehealth-triage',
      name: 'Telehealth Triage Agent',
      description: 'AI-powered patient triage for telehealth consultations',
      category: 'Telehealth',
      icon: <Stethoscope className="h-6 w-6" />,
      features: [
        'Symptom assessment protocols',
        'Urgency level determination',
        'Provider matching',
        'Pre-consultation preparation',
        'Clinical decision support',
        'Emergency escalation'
      ],
      useCase: 'Efficiently triage patients for appropriate care levels',
      compliance: ['HIPAA', 'Clinical Guidelines', 'SOC 2'],
      estimatedSetupTime: '5-6 hours',
      difficulty: 'Advanced'
    },
    {
      id: 'mental-health-support',
      name: 'Mental Health Support Bot',
      description: 'Compassionate mental health screening and support',
      category: 'Mental Health',
      icon: <Heart className="h-6 w-6" />,
      features: [
        'Mental health screening tools',
        'Crisis intervention protocols',
        'Therapeutic conversation flows',
        'Resource recommendations',
        'Provider referrals',
        'Progress tracking'
      ],
      useCase: 'Provide accessible mental health support and screening',
      compliance: ['HIPAA', 'Mental Health Parity Act', 'SOC 2'],
      estimatedSetupTime: '6-8 hours',
      difficulty: 'Advanced'
    },
    {
      id: 'insurance-navigator',
      name: 'Insurance Navigation Assistant',
      description: 'Help patients understand and navigate insurance coverage',
      category: 'Administrative',
      icon: <Shield className="h-6 w-6" />,
      features: [
        'Insurance plan explanation',
        'Coverage verification',
        'Prior authorization assistance',
        'Claims status tracking',
        'Cost estimation',
        'Appeal process guidance'
      ],
      useCase: 'Simplify insurance processes for patients and staff',
      compliance: ['HIPAA', 'Insurance Regulations'],
      estimatedSetupTime: '3-4 hours',
      difficulty: 'Intermediate'
    },
    {
      id: 'chronic-care-manager',
      name: 'Chronic Care Management',
      description: 'Ongoing support for patients with chronic conditions',
      category: 'Patient Care',
      icon: <Activity className="h-6 w-6" />,
      features: [
        'Condition-specific monitoring',
        'Lifestyle coaching',
        'Medication management',
        'Symptom tracking',
        'Care plan adherence',
        'Provider communication'
      ],
      useCase: 'Improve outcomes for chronic disease management',
      compliance: ['HIPAA', 'CMS Guidelines', 'SOC 2'],
      estimatedSetupTime: '7-9 hours',
      difficulty: 'Advanced'
    },
    {
      id: 'emergency-response',
      name: 'Emergency Response Coordinator',
      description: 'Rapid response coordination for medical emergencies',
      category: 'Emergency',
      icon: <Phone className="h-6 w-6" />,
      features: [
        'Emergency protocol activation',
        'Multi-channel notifications',
        'Resource coordination',
        'Real-time status updates',
        'Family notifications',
        'Documentation assistance'
      ],
      useCase: 'Coordinate emergency response and communication',
      compliance: ['HIPAA', 'Emergency Protocols', 'JCAHO'],
      estimatedSetupTime: '8-10 hours',
      difficulty: 'Advanced'
    },
    // Hospital & Health System Templates
    {
      id: 'hospital-bed-management',
      name: 'Hospital Bed Management System',
      description: 'Real-time bed allocation and patient flow optimization',
      category: 'Hospital Systems',
      icon: <Bed className="h-6 w-6" />,
      features: [
        'Real-time bed availability tracking',
        'Patient admission coordination',
        'Discharge planning automation',
        'Transfer request management',
        'Capacity forecasting',
        'Emergency bed allocation'
      ],
      useCase: 'Optimize hospital capacity and patient flow management',
      compliance: ['HIPAA', 'JCAHO', 'CMS Guidelines'],
      estimatedSetupTime: '6-8 hours',
      difficulty: 'Advanced'
    },
    {
      id: 'hospital-visitor-management',
      name: 'Hospital Visitor Management',
      description: 'Automated visitor registration and guidance system',
      category: 'Hospital Systems',
      icon: <UserCheck className="h-6 w-6" />,
      features: [
        'Visitor registration and screening',
        'Navigation assistance',
        'Visiting hours management',
        'Health screening protocols',
        'Emergency contact notifications',
        'Multilingual support'
      ],
      useCase: 'Streamline visitor experience and hospital security',
      compliance: ['HIPAA', 'Security Protocols', 'JCAHO'],
      estimatedSetupTime: '4-5 hours',
      difficulty: 'Intermediate'
    },
    // Nursing Home & Senior Care Templates
    {
      id: 'senior-care-coordinator',
      name: 'Senior Care Coordinator',
      description: 'Comprehensive care management for elderly residents',
      category: 'Senior Care',
      icon: <Home className="h-6 w-6" />,
      features: [
        'Daily care routine management',
        'Medication adherence monitoring',
        'Family communication portal',
        'Health status tracking',
        'Activity scheduling',
        'Emergency response protocols'
      ],
      useCase: 'Enhance quality of care and family communication in senior facilities',
      compliance: ['HIPAA', 'CMS Long-term Care', 'State Regulations'],
      estimatedSetupTime: '7-9 hours',
      difficulty: 'Advanced'
    },
    {
      id: 'dementia-care-assistant',
      name: 'Dementia Care Assistant',
      description: 'Specialized support for dementia and Alzheimer\'s patients',
      category: 'Senior Care',
      icon: <Brain className="h-6 w-6" />,
      features: [
        'Cognitive assessment tools',
        'Behavioral pattern tracking',
        'Caregiver support guidance',
        'Safety monitoring alerts',
        'Memory care activities',
        'Family education resources'
      ],
      useCase: 'Provide specialized care for cognitive impairment conditions',
      compliance: ['HIPAA', 'Alzheimer\'s Association Guidelines', 'CMS'],
      estimatedSetupTime: '8-10 hours',
      difficulty: 'Advanced'
    },
    // Pharmacy & Pharmaceutical Templates
    {
      id: 'pharmacy-dispensing-assistant',
      name: 'Pharmacy Dispensing Assistant',
      description: 'Automated prescription processing and patient counseling',
      category: 'Pharmacy',
      icon: <Pill className="h-6 w-6" />,
      features: [
        'Prescription verification',
        'Drug interaction checking',
        'Patient counseling protocols',
        'Insurance processing',
        'Refill reminders',
        'Adverse reaction monitoring'
      ],
      useCase: 'Streamline pharmacy operations and improve patient safety',
      compliance: ['HIPAA', 'FDA Regulations', 'DEA Guidelines'],
      estimatedSetupTime: '5-7 hours',
      difficulty: 'Advanced'
    },
    {
      id: 'clinical-trial-coordinator',
      name: 'Clinical Trial Coordinator',
      description: 'Patient recruitment and trial management for pharmaceutical research',
      category: 'Pharmacy',
      icon: <FlaskConical className="h-6 w-6" />,
      features: [
        'Patient eligibility screening',
        'Informed consent management',
        'Appointment scheduling',
        'Adverse event reporting',
        'Protocol compliance tracking',
        'Data collection assistance'
      ],
      useCase: 'Facilitate clinical trial operations and patient engagement',
       compliance: ['FDA GCP', 'ICH Guidelines', 'HIPAA', 'IRB Requirements'],
       estimatedSetupTime: '9-12 hours',
       difficulty: 'Advanced'
     },
     // Insurance & Payer Templates
     {
       id: 'insurance-claims-processor',
       name: 'Insurance Claims Processor',
       description: 'Automated claims processing and member support',
       category: 'Insurance',
       icon: <CreditCard className="h-6 w-6" />,
       features: [
         'Claims status inquiries',
         'Prior authorization requests',
         'Benefits verification',
         'Provider network navigation',
         'Appeal process guidance',
         'Member enrollment assistance'
       ],
       useCase: 'Streamline insurance operations and improve member experience',
       compliance: ['HIPAA', 'ACA Regulations', 'State Insurance Laws'],
       estimatedSetupTime: '5-6 hours',
       difficulty: 'Intermediate'
     },
     {
       id: 'utilization-management',
       name: 'Utilization Management Assistant',
       description: 'Medical necessity review and care authorization',
       category: 'Insurance',
       icon: <Shield className="h-6 w-6" />,
       features: [
         'Medical necessity screening',
         'Care authorization workflows',
         'Clinical criteria application',
         'Provider communication',
         'Appeal management',
         'Quality metrics tracking'
       ],
       useCase: 'Ensure appropriate care utilization and cost management',
       compliance: ['HIPAA', 'NCQA Standards', 'CMS Guidelines'],
       estimatedSetupTime: '7-8 hours',
       difficulty: 'Advanced'
     },
     // Research & Academic Templates
     {
       id: 'research-participant-recruiter',
       name: 'Research Participant Recruiter',
       description: 'Automated recruitment for medical research studies',
       category: 'Research',
       icon: <Microscope className="h-6 w-6" />,
       features: [
         'Eligibility pre-screening',
         'Study information delivery',
         'Consent process facilitation',
         'Appointment coordination',
         'Follow-up scheduling',
         'Retention strategies'
       ],
       useCase: 'Accelerate research recruitment and participant engagement',
       compliance: ['IRB Requirements', 'GCP Guidelines', 'HIPAA'],
       estimatedSetupTime: '6-7 hours',
       difficulty: 'Advanced'
     },
     {
       id: 'biobank-coordinator',
       name: 'Biobank Sample Coordinator',
       description: 'Biological sample collection and tracking system',
       category: 'Research',
       icon: <TestTube className="h-6 w-6" />,
       features: [
         'Sample collection scheduling',
         'Consent verification',
         'Chain of custody tracking',
         'Storage condition monitoring',
         'Quality control protocols',
         'Researcher access management'
       ],
       useCase: 'Manage biobank operations and sample integrity',
       compliance: ['HIPAA', 'CLIA', 'IRB Requirements', 'ISO Standards'],
       estimatedSetupTime: '8-10 hours',
       difficulty: 'Advanced'
     },
     // Rehabilitation & Therapy Templates
     {
       id: 'physical-therapy-coach',
       name: 'Physical Therapy Coach',
       description: 'Personalized rehabilitation guidance and progress tracking',
       category: 'Rehabilitation',
       icon: <Dumbbell className="h-6 w-6" />,
       features: [
         'Exercise program delivery',
         'Progress monitoring',
         'Pain assessment tracking',
         'Appointment reminders',
         'Home exercise guidance',
         'Therapist communication'
       ],
       useCase: 'Enhance rehabilitation outcomes and patient compliance',
       compliance: ['HIPAA', 'Physical Therapy Guidelines', 'CMS'],
       estimatedSetupTime: '5-6 hours',
       difficulty: 'Intermediate'
     },
     {
       id: 'addiction-recovery-support',
       name: 'Addiction Recovery Support',
       description: 'Comprehensive support for substance abuse recovery',
       category: 'Rehabilitation',
       icon: <Heart className="h-6 w-6" />,
       features: [
         'Crisis intervention protocols',
         'Recovery milestone tracking',
         'Support group coordination',
         'Relapse prevention strategies',
         'Family support resources',
         'Treatment plan adherence'
       ],
       useCase: 'Support addiction recovery journey and prevent relapse',
       compliance: ['HIPAA', '42 CFR Part 2', 'SAMHSA Guidelines'],
       estimatedSetupTime: '7-9 hours',
       difficulty: 'Advanced'
     },
     // Laboratory & Diagnostics Templates
     {
       id: 'lab-results-communicator',
       name: 'Lab Results Communicator',
       description: 'Automated lab result delivery and patient education',
       category: 'Laboratory',
       icon: <TestTube className="h-6 w-6" />,
       features: [
         'Result interpretation guidance',
         'Critical value alerts',
         'Follow-up recommendations',
         'Provider notifications',
         'Patient education materials',
         'Trend analysis reporting'
       ],
       useCase: 'Improve lab result communication and patient understanding',
       compliance: ['HIPAA', 'CLIA', 'CAP Standards'],
       estimatedSetupTime: '4-5 hours',
       difficulty: 'Intermediate'
     },
     {
       id: 'diagnostic-imaging-scheduler',
       name: 'Diagnostic Imaging Scheduler',
       description: 'Intelligent scheduling for radiology and imaging services',
       category: 'Laboratory',
       icon: <Activity className="h-6 w-6" />,
       features: [
         'Exam preparation instructions',
         'Contrast allergy screening',
         'Equipment optimization',
         'Insurance pre-authorization',
         'Patient anxiety management',
         'Results delivery coordination'
       ],
       useCase: 'Optimize imaging workflows and patient preparation',
       compliance: ['HIPAA', 'ACR Guidelines', 'FDA Regulations'],
       estimatedSetupTime: '5-6 hours',
       difficulty: 'Intermediate'
     },
     // Wellness & Digital Health Templates
     {
       id: 'wellness-app-coach',
       name: 'Wellness App Coach',
       description: 'Personalized health and wellness guidance platform',
       category: 'Digital Health',
       icon: <Smartphone className="h-6 w-6" />,
       features: [
         'Personalized health goals',
         'Activity tracking integration',
         'Nutrition guidance',
         'Sleep optimization',
         'Stress management tools',
         'Progress celebrations'
       ],
       useCase: 'Promote healthy lifestyle choices and preventive care',
       compliance: ['HIPAA', 'FDA Digital Health Guidelines', 'FTC Health Claims'],
       estimatedSetupTime: '4-5 hours',
       difficulty: 'Beginner'
     },
     {
       id: 'maternal-health-assistant',
       name: 'Maternal Health Assistant',
       description: 'Comprehensive pregnancy and postpartum care support',
       category: 'Digital Health',
       icon: <Baby className="h-6 w-6" />,
       features: [
         'Prenatal appointment reminders',
         'Symptom monitoring',
         'Educational content delivery',
         'Postpartum depression screening',
         'Breastfeeding support',
         'Emergency contact protocols'
       ],
       useCase: 'Support maternal and infant health throughout pregnancy journey',
       compliance: ['HIPAA', 'ACOG Guidelines', 'CDC Recommendations'],
       estimatedSetupTime: '6-7 hours',
       difficulty: 'Intermediate'
     },
     {
       id: 'transport-logistics-coordinator',
       name: 'Medical Transport Coordinator',
       description: 'Patient transport and logistics management system',
       category: 'Logistics',
       icon: <Truck className="h-6 w-6" />,
       features: [
         'Transport scheduling optimization',
         'Vehicle tracking and dispatch',
         'Patient condition monitoring',
         'Insurance verification',
         'Route optimization',
         'Emergency response protocols'
       ],
       useCase: 'Coordinate medical transport services and patient logistics',
       compliance: ['HIPAA', 'DOT Regulations', 'State EMS Guidelines'],
       estimatedSetupTime: '6-8 hours',
       difficulty: 'Advanced'
     }
  ];

  const categories = ['all', ...Array.from(new Set(healthcareTemplates.map(t => t.category)))];

  const filteredTemplates = selectedCategory === 'all' 
    ? healthcareTemplates 
    : healthcareTemplates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = async (templateId: string) => {
    setLoading(templateId);
    
    try {
      if (onSelectTemplate) {
        await onSelectTemplate(templateId);
      } else {
        // Default behavior
        const template = healthcareTemplates.find(t => t.id === templateId);
        toast.success(`Selected ${template?.name} template`);
      }
    } catch (error) {
      toast.error('Failed to select template. Please try again.');
      console.error('Template selection error:', error);
    } finally {
      setLoading(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Healthcare Agent Templates</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Pre-built, HIPAA-compliant voice agents designed specifically for healthcare organizations
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category === 'all' ? 'All Templates' : category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                <Badge className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty}
                </Badge>
              </div>
              <CardDescription className="mt-3">
                {template.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Key Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                    {template.features.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{template.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.estimatedSetupTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {template.compliance.length} compliance standards
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-3">
                    <strong>Use Case:</strong> {template.useCase}
                  </p>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleSelectTemplate(template.id)}
                    disabled={loading === template.id}
                  >
                    {loading === template.id ? 'Setting up...' : 'Use This Template'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Notice */}
      <div className="mt-12 p-6 bg-muted rounded-lg max-w-4xl mx-auto">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold mb-2">Compliance & Security</h3>
            <p className="text-sm text-muted-foreground">
              All healthcare templates are designed with HIPAA compliance in mind and include 
              built-in security measures. However, organizations are responsible for ensuring 
              their specific implementation meets all applicable regulatory requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthcareTemplates;