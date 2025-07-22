
import { AIModelNode } from './AIModelNode';
import { InputNode } from './InputNode';
import { OutputNode } from './OutputNode';
import { ProcessingNode } from './ProcessingNode';
import { AdvancedProcessingNode } from './AdvancedProcessingNode';
import { VoiceToAgentNode } from './VoiceToAgentNode';

// Define the node types
export const nodeTypes = {
  aiModel: AIModelNode,
  input: InputNode,
  output: OutputNode,
  processing: ProcessingNode,
  advancedProcessing: AdvancedProcessingNode,
  voiceToAgent: VoiceToAgentNode
};
