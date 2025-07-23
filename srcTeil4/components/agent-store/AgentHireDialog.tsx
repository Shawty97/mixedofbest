
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, CreditCard, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { AgentType } from "@/hooks/use-agent-store";

interface AgentHireDialogProps {
  agent: AgentType;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AgentHireDialog({ agent, isOpen, onClose, onConfirm }: AgentHireDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState("standard");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState("default");

  const plans = [
    {
      id: "trial",
      name: "Free Trial",
      price: "Free",
      duration: "7 days",
      features: ["Basic functionality", "100 requests/day", "Community support"],
      limitations: ["Limited features", "No priority support"]
    },
    {
      id: "standard",
      name: "Standard Plan",
      price: "$29/month",
      duration: "Monthly",
      features: ["Full functionality", "10,000 requests/day", "Email support", "Analytics dashboard"],
      limitations: ["Standard response time"]
    },
    {
      id: "premium",
      name: "Premium Plan",
      price: "$99/month",
      duration: "Monthly",
      features: ["All features", "Unlimited requests", "Priority support", "Custom integrations", "Advanced analytics"],
      limitations: []
    }
  ];

  const selectedPlanDetails = plans.find(p => p.id === selectedPlan);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-quantum-600" />
            Hire Agent: {agent.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Agent Summary */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">by {agent.creator}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium">{agent.rating}</span>
                    <span className="text-gray-500">({agent.reviews})</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {agent.categories.map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs">{category}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{agent.description}</p>
            </CardContent>
          </Card>

          {/* Workspace Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add to Workspace</label>
            <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">My Workspace</SelectItem>
                <SelectItem value="team">Team Workspace</SelectItem>
                <SelectItem value="project">Project Alpha</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plan Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Plan</label>
            <div className="grid gap-3">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    selectedPlan === plan.id 
                      ? 'ring-2 ring-quantum-500 bg-quantum-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={selectedPlan === plan.id}
                          onChange={() => setSelectedPlan(plan.id)}
                        />
                        <div>
                          <h3 className="font-medium">{plan.name}</h3>
                          <p className="text-sm text-gray-600">{plan.duration}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{plan.price}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div>
                        <h4 className="text-sm font-medium text-green-700">Includes:</h4>
                        <ul className="text-xs text-gray-600 mt-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {plan.limitations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-amber-700">Limitations:</h4>
                          <ul className="text-xs text-gray-600 mt-1">
                            {plan.limitations.map((limitation, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                {limitation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Security & Terms */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Security & Privacy</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Agent runs in isolated environment</li>
                    <li>• Your data is encrypted and never shared</li>
                    <li>• Full audit trail of all interactions</li>
                    <li>• Cancel anytime with immediate effect</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms Agreement */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <Checkbox 
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
              I agree to the{" "}
              <a href="#" className="text-quantum-600 hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-quantum-600 hover:underline">Agent Usage Policy</a>.
              I understand that this agent will have access to data I provide within the selected workspace.
            </label>
          </div>

          {/* Summary */}
          {selectedPlanDetails && (
            <Card className="bg-quantum-50 border-quantum-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Order Summary</h3>
                    <p className="text-sm text-gray-600">
                      {agent.name} - {selectedPlanDetails.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{selectedPlanDetails.price}</div>
                    <div className="text-xs text-gray-600">{selectedPlanDetails.duration}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={!agreedToTerms}
              className="bg-quantum-600 hover:bg-quantum-700 flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              {selectedPlanDetails?.price === "Free" ? "Start Free Trial" : "Hire Agent"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
