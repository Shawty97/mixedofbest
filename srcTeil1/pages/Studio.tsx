
import PageLayout from "@/components/layout/PageLayout";
import { AgentList } from "@/components/studio/AgentList";
import { AgentEditor } from "@/components/studio/AgentEditor";
import { ContextualHelp } from "@/components/studio/ContextualHelp";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const Studio = () => {
  return (
    <PageLayout>
        <ResizablePanelGroup
            direction="horizontal"
            className="h-[calc(100vh-var(--navbar-height))]"
        >
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <aside className="h-full">
                    <AgentList />
                </aside>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={55} minSize={40}>
                <main className="h-full overflow-y-auto">
                    <AgentEditor />
                </main>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
                <aside className="h-full bg-accent/30">
                    <ContextualHelp />
                </aside>
            </ResizablePanel>
        </ResizablePanelGroup>
    </PageLayout>
  );
};

export default Studio;
