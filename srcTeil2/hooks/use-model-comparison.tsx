
import { useState } from 'react';
import { useModelPerformance, ModelPerformanceData } from './use-model-performance';

export type ModelComparisonData = {
  modelId: string;
  providerId: string;
  displayName: string;
  performance: ModelPerformanceData | null;
  color: string;
};

const MODEL_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export function useModelComparison(initialModels: { modelId: string, providerId: string, displayName: string }[] = []) {
  const [selectedModels, setSelectedModels] = useState<ModelComparisonData[]>(
    initialModels.map((model, index) => ({
      ...model,
      performance: null,
      color: MODEL_COLORS[index % MODEL_COLORS.length],
    }))
  );

  // Get performance data for each model
  const modelsWithPerformance = selectedModels.map(model => {
    const { performanceData } = useModelPerformance(model.modelId, model.providerId);
    return {
      ...model,
      performance: performanceData,
    };
  });

  const addModel = (modelId: string, providerId: string, displayName: string) => {
    setSelectedModels(prev => [
      ...prev,
      {
        modelId,
        providerId,
        displayName,
        performance: null,
        color: MODEL_COLORS[prev.length % MODEL_COLORS.length],
      }
    ]);
  };

  const removeModel = (modelId: string, providerId: string) => {
    setSelectedModels(prev => 
      prev.filter(model => model.modelId !== modelId || model.providerId !== providerId)
    );
  };

  return {
    models: modelsWithPerformance,
    addModel,
    removeModel
  };
}
