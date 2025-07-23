
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ProcessingTypeSelectProps {
  processingType: string;
  onProcessingTypeChange: (value: string) => void;
}

export function ProcessingTypeSelect({ 
  processingType, 
  onProcessingTypeChange 
}: ProcessingTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-gray-500 dark:text-gray-400">Processing Type</Label>
      <Select 
        value={processingType} 
        onValueChange={onProcessingTypeChange}
      >
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Select processing type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="transform">Transform</SelectItem>
          <SelectItem value="branch">Branch Logic</SelectItem>
          <SelectItem value="filter">Filter</SelectItem>
          <SelectItem value="dataprep">Data Preparation</SelectItem>
          <SelectItem value="aggregation">Aggregation</SelectItem>
          <SelectItem value="extraction">Data Extraction</SelectItem>
          <SelectItem value="custom">Custom Processing</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
