
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface AdvancedProcessingConfigProps {
  config: any;
  onConfigChange: (config: any) => void;
}

export const AdvancedProcessingConfig: React.FC<AdvancedProcessingConfigProps> = ({
  config,
  onConfigChange,
}) => {
  const handleErrorHandlingChange = (value: string) => {
    onConfigChange({ ...config, errorHandling: value });
  };

  const handleCacheResultsChange = (checked: boolean) => {
    onConfigChange({ ...config, cacheResults: checked });
  };

  const handleRetryOptionsChange = (value: string) => {
    onConfigChange({ ...config, retryOptions: value });
  };

  const handleMaxRetriesChange = (value: string) => {
    onConfigChange({ ...config, maxRetries: parseInt(value) || 3 });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Error Handling</Label>
        <Select
          value={config.errorHandling || 'throw'}
          onValueChange={handleErrorHandlingChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select error handling" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="throw">Throw Error</SelectItem>
            <SelectItem value="skip">Skip Node</SelectItem>
            <SelectItem value="default">Use Default Value</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Retry Options</Label>
        <Select
          value={config.retryOptions || 'none'}
          onValueChange={handleRetryOptionsChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select retry strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Retries</SelectItem>
            <SelectItem value="immediate">Immediate</SelectItem>
            <SelectItem value="exponential">Exponential Backoff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.retryOptions && config.retryOptions !== 'none' && (
        <div className="space-y-2">
          <Label>Max Retries</Label>
          <Select
            value={String(config.maxRetries || 3)}
            onValueChange={handleMaxRetriesChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select max retries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Switch
          checked={config.cacheResults || false}
          onCheckedChange={handleCacheResultsChange}
        />
        <Label>Cache Results</Label>
      </div>
    </div>
  );
};
