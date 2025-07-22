
import { ReactFlowProvider as XYFlowProvider } from '@xyflow/react';
import { ReactNode } from 'react';

/**
 * A wrapper component that provides the ReactFlow context to its children
 * This resolves the error: "[React Flow]: Seems like you have not used zustand provider as an ancestor"
 */
export function ReactFlowWrapper({ children }: { children: ReactNode }) {
  return <XYFlowProvider>{children}</XYFlowProvider>;
}
