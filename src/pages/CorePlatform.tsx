
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/ui/status-badge";
import { Brain, GitBranch, Box, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdvancedWorkflowBuilder } from "@/components/workflow/AdvancedWorkflowBuilder";
import { FeatureCard } from "@/components/core-platform/FeatureCard";
import { ServiceStatus } from "@/components/core-platform/ServiceStatus";
import { QuickLinks } from "@/components/core-platform/QuickLinks";
import { TechnicalDocs } from "@/components/core-platform/TechnicalDocs";
import useWorkflowStore from "@/components/workflow/store/workflowStore";
import { toast } from "@/hooks/use-toast";

const CorePlatform = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { syncWithSupabase, getUserWorkflows } = useWorkflowStore();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      // Add try-catch to prevent crashes if syncWithSupabase fails
      try {
        // Sync user's workflows from Supabase when component mounts
        syncWithSupabase().catch(err => {
          console.error("Failed to sync workflows:", err);
          toast({
            title: "Synchronization Failed",
            description: "Could not sync your workflows from the server.",
            variant: "destructive"
          });
        });
      } catch (error) {
        console.error("Error in syncWithSupabase:", error);
      }
    }
  }, [user, navigate, syncWithSupabase]);

  // Get user workflows safely, ensuring we don't throw errors if they're undefined
  const userWorkflows = user ? (getUserWorkflows() || []) : [];

  if (!user) {
    return null;
  }

  return (
    <PageLayout>
      <div className="bg-gradient-to-r from-quantum-50 to-neural-50 dark:from-gray-900 dark:to-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <StatusBadge status="success" text="Operational" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-2">
                <Brain className="h-8 w-8 text-quantum-600" />
                Core Platform
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
                The central AI Workflow Creator with DAG-based agent orchestration, REST/GraphQL endpoints, and self-learning capabilities.
              </p>
            </div>
            <Button className="bg-quantum-600 hover:bg-quantum-700">
              View API Documentation
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Advanced Workflow Builder</h2>
                <div className="text-sm text-gray-500">
                  {userWorkflows && userWorkflows.length > 0 ? `${userWorkflows.length} workflows available` : "No workflows yet"}
                </div>
              </div>
              <AdvancedWorkflowBuilder />
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The Core Platform serves as the foundation of the AImpact ecosystem, providing essential services for AI workflow creation, agent orchestration, and runtime execution. It translates prompt DSL into executable directed acyclic graphs (DAGs) and coordinates the interaction between different AI agents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureCard
                  icon={Brain}
                  title="Prompt-DSL Parser"
                  description="Translates high-level prompt specifications into abstract syntax trees (AST)."
                />
                <FeatureCard
                  icon={GitBranch}
                  title="DAG Generator"
                  description="Converts ASTs into executable directed acyclic graphs for workflow orchestration."
                />
                <FeatureCard
                  icon={Server}
                  title="REST/GraphQL API"
                  description="Comprehensive API endpoints for workflow management and execution."
                />
                <FeatureCard
                  icon={Box}
                  title="Self-Learning Loop"
                  description="Continuous improvement through Proximal Policy Optimization (PPO) with KPI-based rewards."
                />
              </div>
            </section>

            <TechnicalDocs />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <QuickLinks />
              <ServiceStatus />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CorePlatform;
