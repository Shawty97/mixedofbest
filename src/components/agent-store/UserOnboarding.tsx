import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Rocket, CheckCircle2, UserPlus, Briefcase, Sparkles, ArrowRight, Brain, Headphones, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserWorkspace, AgentVertical } from "@/types/agent.types";
import { Badge } from "@/components/ui/badge";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface UserOnboardingProps {
  isOpen: boolean;
  onComplete: (workspace: Partial<UserWorkspace>) => void;
}

export function UserOnboarding({ isOpen, onComplete }: UserOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [workspaceName, setWorkspaceName] = useState("My AI Workforce");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [businessVerticals, setBusinessVerticals] = useState<AgentVertical[]>([]);
  const [enableVoiceAgents, setEnableVoiceAgents] = useState(true);
  const [enableSessionContinuity, setEnableSessionContinuity] = useState(true);
  const [enableAutoImprovement, setEnableAutoImprovement] = useState(true);
  
  const allVerticals: AgentVertical[] = [
    'marketing', 'legal', 'development', 'sales', 
    'customer-support', 'finance', 'operations', 'hr', 
    'education', 'healthcare', 'design', 'writing'
  ];
  
  const handleComplete = () => {
    const workspace: Partial<UserWorkspace> = {
      name: workspaceName,
      description: workspaceDescription,
      settings: {
        theme: 'system',
        defaultAgentDisplay: 'grid',
        notifications: true,
        autoImprovement: enableAutoImprovement,
        sessionContinuity: enableSessionContinuity,
        defaultVoiceSettings: {
          enabled: enableVoiceAgents
        }
      },
      onboardingCompleted: true
    };
    
    onComplete(workspace);
    toast({
      title: "Welcome to AImpact OS!",
      description: "Your AI workforce platform has been created successfully."
    });
  };

  const handleSkip = () => {
    // We call onComplete with a basic workspace configuration to signal skipping
    // but still creating a usable state.
    onComplete({
      name: "My AI Workforce",
      description: "",
      settings: {
        theme: 'system',
        defaultAgentDisplay: 'grid',
        notifications: true,
        autoImprovement: true,
        sessionContinuity: true,
        defaultVoiceSettings: { enabled: true }
      },
      onboardingCompleted: true
    });
    toast({
      title: "Welcome to AImpact OS!",
      description: "You can customize your workspace later in the settings."
    });
  };
  
  const handleAddInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput("");
    }
  };
  
  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };
  
  const handleToggleVertical = (vertical: AgentVertical) => {
    if (businessVerticals.includes(vertical)) {
      setBusinessVerticals(businessVerticals.filter(v => v !== vertical));
    } else {
      setBusinessVerticals([...businessVerticals, vertical]);
    }
  };
  
  const steps: OnboardingStep[] = [
    {
      title: "Welcome to AImpact OS",
      description: "The platform for building and managing your AI workforce.",
      icon: <Rocket className="h-8 w-8 text-quantum-600" />,
      content: (
        <div className="space-y-6 py-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <UserPlus className="h-10 w-10 text-quantum-500 mb-2" />
                <h3 className="font-medium">Create your workspace</h3>
                <p className="text-sm text-gray-500">Customize your AI agent environment</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Briefcase className="h-10 w-10 text-quantum-500 mb-2" />
                <h3 className="font-medium">Hire specialized agents</h3>
                <p className="text-sm text-gray-500">Find the perfect AI for your needs</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Brain className="h-10 w-10 text-quantum-500 mb-2" />
                <h3 className="font-medium">Create custom agents</h3>
                <p className="text-sm text-gray-500">Build agents with voice or text</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center flex items-center justify-center gap-4">
            <Button 
                variant="ghost"
                onClick={handleSkip}
            >
              Skip for now
            </Button>
            <Button 
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-quantum-600 hover:bg-quantum-700"
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "Set Up Your Workspace",
      description: "Tell us about your workspace to get personalized agent recommendations.",
      icon: <Briefcase className="h-8 w-8 text-quantum-600" />,
      content: (
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input 
              id="workspace-name" 
              value={workspaceName} 
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workspace-description">Workspace Description (Optional)</Label>
            <Textarea 
              id="workspace-description" 
              placeholder="Describe what you'll use this workspace for..."
              value={workspaceDescription} 
              onChange={(e) => setWorkspaceDescription(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 pt-4">
            <Label>Platform Settings</Label>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Enable Voice Agents</h4>
                  <p className="text-xs text-muted-foreground">
                    Allow agents to speak and listen using voice interface
                  </p>
                </div>
                <Switch 
                  checked={enableVoiceAgents} 
                  onCheckedChange={setEnableVoiceAgents} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Session Continuity</h4>
                  <p className="text-xs text-muted-foreground">
                    Maintain context between agent interactions
                  </p>
                </div>
                <Switch 
                  checked={enableSessionContinuity} 
                  onCheckedChange={setEnableSessionContinuity} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Automatic Agent Improvement</h4>
                  <p className="text-xs text-muted-foreground">
                    Allow agents to learn and improve from feedback
                  </p>
                </div>
                <Switch 
                  checked={enableAutoImprovement} 
                  onCheckedChange={setEnableAutoImprovement} 
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              Back
            </Button>
            <Button 
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!workspaceName.trim()}
            >
              Continue
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "Select Business Verticals",
      description: "Choose the business areas where you'll be applying AI agents.",
      icon: <Briefcase className="h-8 w-8 text-quantum-600" />,
      content: (
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground mb-2">
            We'll recommend agents specific to your business needs.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {allVerticals.map((vertical) => (
              <Badge 
                key={vertical}
                variant={businessVerticals.includes(vertical) ? "default" : "outline"}
                className="cursor-pointer py-2 px-4 flex items-center justify-center"
                onClick={() => handleToggleVertical(vertical)}
              >
                {vertical.charAt(0).toUpperCase() + vertical.slice(1).replace('-', ' ')}
                {businessVerticals.includes(vertical) ? 
                  <CheckCircle2 className="ml-1 h-3 w-3" /> : 
                  <Plus className="ml-1 h-3 w-3" />
                }
              </Badge>
            ))}
          </div>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              Back
            </Button>
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Continue
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "Agent Capabilities",
      description: "Tell us what you'd like your AI agents to help with.",
      icon: <Sparkles className="h-8 w-8 text-quantum-600" />,
      content: (
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Add a skill or task (e.g. Content Writing, Data Analysis)" 
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInterest();
                }
              }}
            />
            <Button variant="outline" onClick={handleAddInterest}>Add</Button>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {interests.length > 0 ? (
              interests.map((interest) => (
                <div 
                  key={interest} 
                  className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {interest}
                  <button 
                    className="text-gray-500 hover:text-gray-700 ml-1"
                    onClick={() => handleRemoveInterest(interest)}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No capabilities added yet</p>
            )}
          </div>
          
          <div className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Suggested capabilities for your selected verticals:
            </p>
            <div className="flex flex-wrap gap-2">
              {getRecommendedCapabilities(businessVerticals).map((capability) => (
                !interests.includes(capability) && (
                  <Button
                    key={capability}
                    variant="outline"
                    size="sm"
                    onClick={() => setInterests([...interests, capability])}
                    className="rounded-full"
                  >
                    + {capability}
                  </Button>
                )
              ))}
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              Back
            </Button>
            <Button onClick={() => setCurrentStep(currentStep + 1)}>
              Continue
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "You're All Set!",
      description: "Your AI agent workspace is ready to use.",
      icon: <CheckCircle2 className="h-8 w-8 text-quantum-600" />,
      content: (
        <div className="space-y-4 py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          <h3 className="text-xl font-medium">Your AI workforce platform is ready!</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Start exploring the marketplace to find and hire the perfect AI agents for your business needs,
            or create custom agents with our natural language builder.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleComplete}
            >
              <Headphones className="h-4 w-4" />
              Create Voice Agent
            </Button>
            <Button 
              onClick={handleComplete}
              className="bg-quantum-600 hover:bg-quantum-700"
            >
              Explore Agent Marketplace
            </Button>
          </div>
        </div>
      )
    }
  ];
  
  const currentStepData = steps[currentStep];
  
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="bg-gradient-to-r from-quantum-50 to-neural-50 dark:from-gray-900 dark:to-gray-800 p-6">
          <div className="flex items-start gap-4">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow">
              {currentStepData.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
              <p className="text-gray-500 dark:text-gray-400">{currentStepData.description}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {currentStepData.content}
        </div>
        
        <div className="flex items-center justify-center p-4 border-t">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentStep 
                    ? 'bg-quantum-600' 
                    : index < currentStep 
                      ? 'bg-quantum-300' 
                      : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to get recommended capabilities based on selected verticals
function getRecommendedCapabilities(verticals: AgentVertical[]): string[] {
  const recommendations: Record<AgentVertical, string[]> = {
    'marketing': ['Content Creation', 'Social Media Management', 'Campaign Analysis', 'SEO Optimization'],
    'legal': ['Contract Review', 'Legal Research', 'Compliance Analysis', 'Document Drafting'],
    'development': ['Code Generation', 'Bug Fixing', 'API Documentation', 'Code Review'],
    'sales': ['Lead Qualification', 'Sales Outreach', 'Deal Management', 'Pipeline Analysis'],
    'customer-support': ['Ticket Handling', 'FAQs', 'Customer Onboarding', 'Satisfaction Surveys'],
    'finance': ['Financial Analysis', 'Budget Planning', 'Expense Tracking', 'Investment Research'],
    'operations': ['Process Automation', 'Workflow Management', 'Resource Allocation', 'Vendor Management'],
    'hr': ['Candidate Screening', 'Employee Onboarding', 'Performance Reviews', 'Training'],
    'education': ['Course Development', 'Student Assessment', 'Learning Materials', 'Tutoring'],
    'healthcare': ['Medical Research', 'Patient Scheduling', 'Health Records', 'Treatment Plans'],
    'design': ['UI/UX Design', 'Image Creation', 'Design Systems', 'Brand Guidelines'],
    'writing': ['Blog Posts', 'Technical Writing', 'Copywriting', 'Content Editing'],
    'analytics': ['Data Analysis', 'Reporting', 'Trend Forecasting', 'Market Research'],
    'general': ['Project Management', 'Meeting Notes', 'Email Management', 'Research']
  };
  
  // If no verticals selected, return general recommendations
  if (verticals.length === 0) {
    return recommendations['general'];
  }
  
  // Gather recommendations for all selected verticals
  const allRecs = verticals.flatMap(vertical => recommendations[vertical] || []);
  
  // Remove duplicates and return
  return [...new Set(allRecs)];
}
