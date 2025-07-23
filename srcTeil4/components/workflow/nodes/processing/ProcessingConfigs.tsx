import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CodeBlock } from "@/components/ui/code-block";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Card } from '@/components/ui/card';

interface ProcessingConfigsProps {
  processingType: string;
  branchingLogic: string;
  transformType: string;
  config: any;
  onConfigChange: (config: any) => void;
}

export function ProcessingConfigs({
  processingType,
  branchingLogic,
  transformType,
  config,
  onConfigChange
}: ProcessingConfigsProps) {
  const [conditionList, setConditionList] = useState(config.conditions || [{ field: '', operator: '==', value: '' }]);
  
  const handleConditionChange = (index: number, field: string, value: string) => {
    const updatedConditions = [...conditionList];
    updatedConditions[index] = { ...updatedConditions[index], [field]: value };
    setConditionList(updatedConditions);
    onConfigChange({ ...config, conditions: updatedConditions });
  };
  
  const addCondition = () => {
    setConditionList([...conditionList, { field: '', operator: '==', value: '' }]);
  };
  
  const removeCondition = (index: number) => {
    const updatedConditions = conditionList.filter((_, i) => i !== index);
    setConditionList(updatedConditions);
    onConfigChange({ ...config, conditions: updatedConditions });
  };
  
  if (processingType === 'branch' && branchingLogic === 'conditional') {
    return (
      <div className="space-y-3">
        <Label className="text-xs text-gray-500 dark:text-gray-400">Conditions</Label>
        {conditionList.map((condition, index) => (
          <Card className="p-2" key={index}>
            <div className="flex items-center gap-2 mb-2">
              <Input
                className="h-8 text-xs flex-1"
                placeholder="Field name"
                value={condition.field}
                onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
              />
              
              <Select 
                value={condition.operator} 
                onValueChange={(value) => handleConditionChange(index, 'operator', value)}
              >
                <SelectTrigger className="h-8 text-xs w-20">
                  <SelectValue placeholder="==" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="==">==</SelectItem>
                  <SelectItem value="!=">!=</SelectItem>
                  <SelectItem value=">=">&gt;=</SelectItem>
                  <SelectItem value="<=">&lt;=</SelectItem>
                  <SelectItem value=">">&gt;</SelectItem>
                  <SelectItem value="<">&lt;</SelectItem>
                  <SelectItem value="contains">contains</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                className="h-8 text-xs flex-1"
                placeholder="Value"
                value={condition.value}
                onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
              />
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeCondition(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </Card>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 mt-2 text-xs"
          onClick={addCondition}
        >
          <PlusCircle className="h-3.5 w-3.5 mr-1" />
          Add Condition
        </Button>
        
        <div className="space-y-2 mt-4">
          <Label className="text-xs text-gray-500 dark:text-gray-400">Combine with</Label>
          <Select 
            value={config.combineWith || 'and'} 
            onValueChange={(value) => onConfigChange({ ...config, combineWith: value })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select logic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="and">AND (All conditions must be true)</SelectItem>
              <SelectItem value="or">OR (Any condition can be true)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 mt-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="debug-mode"
              checked={config.debugMode || false}
              onCheckedChange={(checked) => onConfigChange({ ...config, debugMode: checked })}
            />
            <Label htmlFor="debug-mode" className="text-xs">Debug Mode</Label>
          </div>
        </div>
      </div>
    );
  }
  
  if (processingType === 'branch' && branchingLogic === 'switch') {
    const switchCases = config.switchCases || [
      { caseValue: '', targetPath: 'path-a' },
      { caseValue: '', targetPath: 'path-b' }
    ];
    
    const updateSwitchCase = (index: number, field: string, value: string) => {
      const updatedCases = [...switchCases];
      updatedCases[index] = { ...updatedCases[index], [field]: value };
      onConfigChange({ ...config, switchCases: updatedCases });
    };
    
    const addSwitchCase = () => {
      const updatedCases = [...switchCases, { caseValue: '', targetPath: `path-${String.fromCharCode(97 + switchCases.length)}` }];
      onConfigChange({ ...config, switchCases: updatedCases });
    };
    
    const removeSwitchCase = (index: number) => {
      const updatedCases = switchCases.filter((_, i) => i !== index);
      onConfigChange({ ...config, switchCases: updatedCases });
    };
    
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-xs text-gray-500 dark:text-gray-400">Switch Field</Label>
          <Input
            className="h-8 text-xs"
            placeholder="Field to check"
            value={config.switchField || ''}
            onChange={(e) => onConfigChange({ ...config, switchField: e.target.value })}
          />
        </div>
        
        <Label className="text-xs text-gray-500 dark:text-gray-400">Cases</Label>
        {switchCases.map((switchCase, index) => (
          <Card className="p-2" key={index}>
            <div className="flex items-center gap-2 mb-2">
              <Input
                className="h-8 text-xs flex-1"
                placeholder="Case value"
                value={switchCase.caseValue}
                onChange={(e) => updateSwitchCase(index, 'caseValue', e.target.value)}
              />
              
              <Select 
                value={switchCase.targetPath} 
                onValueChange={(value) => updateSwitchCase(index, 'targetPath', value)}
              >
                <SelectTrigger className="h-8 text-xs w-24">
                  <SelectValue placeholder="Target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="path-a">Path A</SelectItem>
                  <SelectItem value="path-b">Path B</SelectItem>
                  <SelectItem value="path-c">Path C</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                </SelectContent>
              </Select>
              
              {index >= 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeSwitchCase(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          </Card>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 mt-2 text-xs"
          onClick={addSwitchCase}
        >
          <PlusCircle className="h-3.5 w-3.5 mr-1" />
          Add Case
        </Button>
        
        <div className="space-y-2 mt-4">
          <Label className="text-xs text-gray-500 dark:text-gray-400">Default Path</Label>
          <Select 
            value={config.defaultPath || 'default'} 
            onValueChange={(value) => onConfigChange({ ...config, defaultPath: value })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select default path" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Output</SelectItem>
              <SelectItem value="path-a">Path A</SelectItem>
              <SelectItem value="path-b">Path B</SelectItem>
              <SelectItem value="path-c">Path C</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
  
  if (processingType === 'transform') {
    if (transformType === 'json') {
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 dark:text-gray-400">Template</Label>
            <Textarea
              className="h-24 text-xs font-mono"
              placeholder='{ "output": "{{ input }}" }'
              value={config.template || ''}
              onChange={(e) => onConfigChange({ ...config, template: e.target.value })}
            />
            <p className="text-xs text-gray-500">Use {'{{ variable }}'} syntax to reference input values</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-500 dark:text-gray-400">Validation</Label>
              <Switch
                id="validation-enabled"
                checked={config.enableValidation || false}
                onCheckedChange={(checked) => onConfigChange({ ...config, enableValidation: checked })}
              />
            </div>
            {config.enableValidation && (
              <Select 
                value={config.validationSchema || 'basic'} 
                onValueChange={(value) => onConfigChange({ ...config, validationSchema: value })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select schema type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Validation</SelectItem>
                  <SelectItem value="strict">Strict Schema</SelectItem>
                  <SelectItem value="custom">Custom Schema</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      );
    }
    
    if (transformType === 'text') {
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 dark:text-gray-400">Text Operations</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="trim"
                  checked={config.trim || false}
                  onCheckedChange={(checked) => onConfigChange({ ...config, trim: checked })}
                />
                <Label htmlFor="trim" className="text-xs">Trim Whitespace</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="lowercase"
                  checked={config.lowercase || false}
                  onCheckedChange={(checked) => onConfigChange({ ...config, lowercase: checked })}
                />
                <Label htmlFor="lowercase" className="text-xs">Convert to Lowercase</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="uppercase"
                  checked={config.uppercase || false}
                  onCheckedChange={(checked) => onConfigChange({ ...config, uppercase: checked })}
                />
                <Label htmlFor="uppercase" className="text-xs">Convert to Uppercase</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 dark:text-gray-400">Find and Replace</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                className="h-8 text-xs"
                placeholder="Find"
                value={config.find || ''}
                onChange={(e) => onConfigChange({ ...config, find: e.target.value })}
              />
              <Input
                className="h-8 text-xs"
                placeholder="Replace"
                value={config.replace || ''}
                onChange={(e) => onConfigChange({ ...config, replace: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Switch
                id="regex"
                checked={config.useRegex || false}
                onCheckedChange={(checked) => onConfigChange({ ...config, useRegex: checked })}
              />
              <Label htmlFor="regex" className="text-xs">Use Regular Expression</Label>
            </div>
          </div>
        </div>
      );
    }
    
    if (transformType === 'filter') {
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 dark:text-gray-400">Filter Type</Label>
            <Select 
              value={config.filterType || 'include'} 
              onValueChange={(value) => onConfigChange({ ...config, filterType: value })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="include">Include Matching Items</SelectItem>
                <SelectItem value="exclude">Exclude Matching Items</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 dark:text-gray-400">Array Path</Label>
            <Input
              className="h-8 text-xs"
              placeholder="e.g. data.items"
              value={config.arrayPath || ''}
              onChange={(e) => onConfigChange({ ...config, arrayPath: e.target.value })}
            />
            <p className="text-xs text-gray-500">Path to the array to filter in the input data</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 dark:text-gray-400">Filter Conditions</Label>
            <Textarea
              className="h-24 text-xs font-mono"
              placeholder="item.status === 'active' && item.count > 10"
              value={config.filterCondition || ''}
              onChange={(e) => onConfigChange({ ...config, filterCondition: e.target.value })}
            />
            <p className="text-xs text-gray-500">Use 'item' to reference each array element</p>
          </div>
        </div>
      );
    }
    
    if (transformType === 'custom') {
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 dark:text-gray-400">Custom Transformation</Label>
            <CodeBlock
              language="javascript"
              code={config.customCode || '// Example: Process input data\nfunction transform(input) {\n  // Process the input\n  return {\n    result: input * 2\n  };\n}'}
              className="h-40 text-xs"
              onChange={(code) => onConfigChange({ ...config, customCode: code })}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="sandbox"
              checked={config.useSandbox || true}
              onCheckedChange={(checked) => onConfigChange({ ...config, useSandbox: checked })}
            />
            <Label htmlFor="sandbox" className="text-xs">Execute in Sandbox</Label>
          </div>
        </div>
      );
    }
  }
  
  return (
    <div className="text-center p-2 text-xs text-gray-500">
      Configure this node's advanced settings based on the selected type.
    </div>
  );
}
