
import PageLayout from "@/components/layout/PageLayout";
import { AdvancedWorkflowBuilder } from "@/components/workflow/AdvancedWorkflowBuilder";
import { CopilotInterface } from "@/components/ai-copilot/CopilotInterface";

const Workflows = () => {
  return (
    <PageLayout>
      <div className="h-[calc(100vh-var(--navbar-height))]">
        <AdvancedWorkflowBuilder />
        <CopilotInterface workflowContext={{ page: "workflows" }} />
      </div>
    </PageLayout>
  );
};

export default Workflows;
