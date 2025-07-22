
import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Brain, Settings2, Gauge, DollarSign, Zap, AlertTriangle, FileInput, Database, BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { aiProviders } from '../config/aiProviders';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { InfoIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

function AIModelNodeComponent({ data, isConnectable }: any) {
  const [selectedProvider, setSelectedProvider] = useState(data.provider || aiProviders[0].id);
  const [selectedModel, setSelectedModel] = useState(data.model || aiProviders[0].models[0].id);
  const [selectedVersion, setSelectedVersion] = useState(data.modelVersion || "");
  const [temperature, setTemperature] = useState(data.temperature || 0.7);
  const [maxTokens, setMaxTokens] = useState(data.maxTokens || 2048);
  const [topP, setTopP] = useState(data.topP || 1);
  const [frequencyPenalty, setFrequencyPenalty] = useState(data.frequencyPenalty || 0);
  const [presencePenalty, setPresencePenalty] = useState(data.presencePenalty || 0);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(data.showAdvancedOptions || false);
  const [costEstimate, setCostEstimate] = useState({ inputCost: 0, outputCost: 0, totalCost: 0 });
  const [isModelCompatible, setIsModelCompatible] = useState(true);
  
  // Fine-tuning related states
  const [isFineTuningEnabled, setIsFineTuningEnabled] = useState(data.isFineTuningEnabled || false);
  const [fineTuningDataset, setFineTuningDataset] = useState(data.fineTuningDataset || 'default');
  const [fineTuningProgress, setFineTuningProgress] = useState(data.fineTuningProgress || 0);
  const [fineTuningStatus, setFineTuningStatus] = useState(data.fineTuningStatus || 'idle');
  const [fineTuningParameters, setFineTuningParameters] = useState(data.fineTuningParameters || {
    epochs: 3,
    batchSize: 8,
    learningRate: 0.00002,
    useLoRA: true,
    loraRank: 8,
    loraAlpha: 16
  });
  
  const { toast } = useToast();
  
  const provider = aiProviders.find(p => p.id === selectedProvider);
  const model = provider?.models.find(m => m.id === selectedModel);
  const versions = model?.versions || [];
  
  // Calculate estimated cost based on model and config
  useEffect(() => {
    if (model) {
      const baseCostPer1KTokens = model.costPer1KTokens || 0;
      const inputEstimate = baseCostPer1KTokens * 0.5; // Estimated input tokens
      const outputEstimate = baseCostPer1KTokens * maxTokens / 1000;
      const total = inputEstimate + outputEstimate;
      
      // Add fine-tuning cost estimate if enabled
      const fineTuningCost = isFineTuningEnabled ? 
        baseCostPer1KTokens * 5 * fineTuningParameters.epochs : 0;
      
      setCostEstimate({
        inputCost: parseFloat(inputEstimate.toFixed(5)),
        outputCost: parseFloat(outputEstimate.toFixed(5)),
        totalCost: parseFloat((total + fineTuningCost).toFixed(5))
      });
    }
  }, [selectedModel, maxTokens, model, isFineTuningEnabled, fineTuningParameters.epochs]);
  
  // Check model compatibility with selected settings
  useEffect(() => {
    if (model && model.maxTokens && maxTokens > model.maxTokens) {
      setIsModelCompatible(false);
    } else {
      setIsModelCompatible(true);
    }
  }, [maxTokens, model]);
  
  React.useEffect(() => {
    if (!selectedVersion || !versions.find(v => v.id === selectedVersion)) {
      const defaultVersion = versions.find(v => v.isDefault)?.id || (versions[0]?.id || "");
      setSelectedVersion(defaultVersion);
      if (data.onModelVersionChange) {
        data.onModelVersionChange(defaultVersion);
      }
    }
  }, [selectedModel, versions]);

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    const newProvider = aiProviders.find(p => p.id === providerId);
    const newModel = newProvider?.models[0]?.id || "";
    setSelectedModel(newModel);
    
    if (data.onProviderChange) data.onProviderChange(providerId);
    if (data.onModelChange) data.onModelChange(newModel);
    
    // Reset fine-tuning settings when provider changes
    setIsFineTuningEnabled(false);
    
    toast({
      title: "Provider Changed",
      description: `Switched to ${newProvider?.name} provider`,
    });
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    const newModel = provider?.models.find(m => m.id === modelId);
    const defaultVersion = newModel?.versions.find(v => v.isDefault)?.id || (newModel?.versions[0]?.id || "");
    setSelectedVersion(defaultVersion);
    
    // Reset maxTokens if it exceeds the new model's limit
    if (newModel?.maxTokens && maxTokens > newModel.maxTokens) {
      setMaxTokens(newModel.maxTokens);
      if (data.onConfigChange) {
        data.onConfigChange({ 
          temperature, 
          maxTokens: newModel.maxTokens,
          topP,
          frequencyPenalty,
          presencePenalty,
          showAdvancedOptions
        });
      }
      
      toast({
        title: "Token Limit Adjusted",
        description: `Max tokens reduced to ${newModel.maxTokens} to match model's capabilities`,
      });
    }
    
    if (data.onModelChange) data.onModelChange(modelId);
    if (data.onModelVersionChange) data.onModelVersionChange(defaultVersion);
  };

  const handleVersionChange = (versionId: string) => {
    setSelectedVersion(versionId);
    if (data.onModelVersionChange) data.onModelVersionChange(versionId);
    
    // Get version details
    const version = versions.find(v => v.id === versionId);
    if (version) {
      toast({
        title: "Version Changed",
        description: `Using ${version.name} (Released: ${version.releaseDate})`,
      });
    }
  };

  const handleConfigChange = (param: string, value: any) => {
    switch (param) {
      case 'temperature':
        setTemperature(value);
        break;
      case 'maxTokens':
        setMaxTokens(value);
        break;
      case 'topP':
        setTopP(value);
        break;
      case 'frequencyPenalty':
        setFrequencyPenalty(value);
        break;
      case 'presencePenalty':
        setPresencePenalty(value);
        break;
      case 'showAdvancedOptions':
        setShowAdvancedOptions(value);
        break;
    }
    
    // Update parent component with all current settings
    if (data.onConfigChange) {
      data.onConfigChange({
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        presencePenalty,
        showAdvancedOptions,
        [param]: value
      });
    }
  };

  const handleFineTuningChange = (enabled: boolean) => {
    setIsFineTuningEnabled(enabled);
    if (data.onFineTuningChange) {
      data.onFineTuningChange(enabled);
    }
    
    if (enabled) {
      toast({
        title: "Fine-tuning Enabled",
        description: "Model will be fine-tuned with your data",
      });
    }
  };
  
  const handleFineTuningParameterChange = (param: string, value: any) => {
    setFineTuningParameters(prev => ({
      ...prev,
      [param]: value
    }));
    
    if (data.onFineTuningParametersChange) {
      data.onFineTuningParametersChange({
        ...fineTuningParameters,
        [param]: value
      });
    }
  };
  
  const handleDatasetChange = (datasetId: string) => {
    setFineTuningDataset(datasetId);
    if (data.onFineTuningDatasetChange) {
      data.onFineTuningDatasetChange(datasetId);
    }
    
    toast({
      title: "Dataset Selected",
      description: `Selected "${datasetId}" for fine-tuning`,
    });
  };
  
  const startFineTuning = () => {
    setFineTuningStatus('running');
    setFineTuningProgress(0);
    
    // Simulate fine-tuning process
    const interval = setInterval(() => {
      setFineTuningProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setFineTuningStatus('completed');
          toast({
            title: "Fine-tuning Complete",
            description: "The model has been successfully fine-tuned",
          });
          return 100;
        }
        return newProgress;
      });
    }, 1000);
    
    toast({
      title: "Fine-tuning Started",
      description: "This process may take several minutes",
    });
  };
  
  const cancelFineTuning = () => {
    setFineTuningStatus('idle');
    setFineTuningProgress(0);
    
    toast({
      title: "Fine-tuning Cancelled",
      description: "Fine-tuning process has been stopped",
    });
  };

  return (
    <div className="p-4 border rounded-md border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 w-[320px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div className="font-medium text-blue-700 dark:text-blue-300">AI Model</div>
        </div>
        
        {model && (
          <Popover>
            <PopoverTrigger asChild>
              <InfoIcon className="h-4 w-4 text-blue-500 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">{model.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{model.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {model.capabilities.map((capability) => (
                    <Badge key={capability} variant="outline" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      
      <Tabs defaultValue="model" className="w-full nodrag">
        <TabsList className="w-full mb-2 grid grid-cols-5">
          <TabsTrigger value="model" className="col-span-1">Model</TabsTrigger>
          <TabsTrigger value="version" className="col-span-1">Version</TabsTrigger>
          <TabsTrigger value="config" className="col-span-1">Config</TabsTrigger>
          <TabsTrigger value="finetune" className="col-span-1">
            <FileInput className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="perf" className="col-span-1">
            <Gauge className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="model">
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Provider</Label>
              <Select value={selectedProvider} onValueChange={handleProviderChange}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {aiProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Model</Label>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {provider?.models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="version">
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400">Version</Label>
              <Select value={selectedVersion} onValueChange={handleVersionChange}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version) => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.name}
                      {version.isDefault && " (Default)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {model?.versions.find(v => v.id === selectedVersion) && (
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Released: {model.versions.find(v => v.id === selectedVersion)?.releaseDate}
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {versions.find(v => v.id === selectedVersion)?.description}
                </div>
                
                <div className="mt-2 flex items-center gap-1">
                  {versions.find(v => v.id === selectedVersion)?.isStable ? (
                    <Badge variant="default" className="bg-green-500">Stable</Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500 text-amber-600 dark:text-amber-400">Beta</Badge>
                  )}
                  
                  {versions.find(v => v.id === selectedVersion)?.isDeprecated && (
                    <Badge variant="destructive">Deprecated</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="config">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="space-y-4 p-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-gray-500">Temperature</Label>
                  <span className="text-xs text-gray-500">{temperature}</span>
                </div>
                <Slider
                  value={[temperature]}
                  onValueChange={(values) => handleConfigChange('temperature', values[0])}
                  max={2}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">Controls randomness: lower means more focused</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-gray-500">Max Tokens</Label>
                  <span className="text-xs text-gray-500">{maxTokens}</span>
                </div>
                <Slider
                  value={[maxTokens]}
                  onValueChange={(values) => handleConfigChange('maxTokens', values[0])}
                  max={model?.maxTokens || 4096}
                  min={64}
                  step={64}
                  className={`w-full ${!isModelCompatible ? 'slider-warning' : ''}`}
                />
                
                {!isModelCompatible && (
                  <div className="flex items-center text-xs text-amber-600 gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Exceeds model's token limit</span>
                  </div>
                )}
                <p className="text-xs text-gray-500">Maximum length of generated text</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  checked={showAdvancedOptions} 
                  onCheckedChange={(value) => handleConfigChange('showAdvancedOptions', value)} 
                  id="advanced-options" 
                />
                <Label htmlFor="advanced-options" className="text-xs text-gray-500">Show advanced options</Label>
              </div>

              {showAdvancedOptions && (
                <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-gray-500">Top P</Label>
                      <span className="text-xs text-gray-500">{topP}</span>
                    </div>
                    <Slider
                      value={[topP]}
                      onValueChange={(values) => handleConfigChange('topP', values[0])}
                      max={1}
                      min={0}
                      step={0.05}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">Nucleus sampling: lower is more deterministic</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-gray-500">Frequency Penalty</Label>
                      <span className="text-xs text-gray-500">{frequencyPenalty}</span>
                    </div>
                    <Slider
                      value={[frequencyPenalty]}
                      onValueChange={(values) => handleConfigChange('frequencyPenalty', values[0])}
                      max={2}
                      min={-2}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">Reduces repetition of token sequences</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-gray-500">Presence Penalty</Label>
                      <span className="text-xs text-gray-500">{presencePenalty}</span>
                    </div>
                    <Slider
                      value={[presencePenalty]}
                      onValueChange={(values) => handleConfigChange('presencePenalty', values[0])}
                      max={2}
                      min={-2}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">Increases likelihood of discussing new topics</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* New Fine-tuning Tab */}
        <TabsContent value="finetune">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="space-y-4 p-0">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={isFineTuningEnabled} 
                  onCheckedChange={handleFineTuningChange} 
                  id="finetune-enable" 
                />
                <Label htmlFor="finetune-enable" className="text-sm">Enable Fine-Tuning</Label>
              </div>
              
              {isFineTuningEnabled && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-500 mb-2">Training Dataset</Label>
                    <Select value={fineTuningDataset} onValueChange={handleDatasetChange}>
                      <SelectTrigger className="w-full text-sm">
                        <SelectValue placeholder="Select dataset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Dataset</SelectItem>
                        <SelectItem value="domain-specific">Domain-Specific</SelectItem>
                        <SelectItem value="user-data">User-Generated Data</SelectItem>
                        <SelectItem value="custom">Custom Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {fineTuningDataset === 'custom' && (
                    <div>
                      <Button size="sm" variant="outline" className="w-full">
                        <Database className="h-4 w-4 mr-2" />
                        Upload Custom Data
                      </Button>
                    </div>
                  )}
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="params">
                      <AccordionTrigger className="text-xs py-2">
                        Advanced Parameters
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="text-xs text-gray-500">Epochs</Label>
                              <span className="text-xs text-gray-500">{fineTuningParameters.epochs}</span>
                            </div>
                            <Slider
                              value={[fineTuningParameters.epochs]}
                              onValueChange={(values) => handleFineTuningParameterChange('epochs', values[0])}
                              max={10}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="text-xs text-gray-500">Batch Size</Label>
                              <span className="text-xs text-gray-500">{fineTuningParameters.batchSize}</span>
                            </div>
                            <Slider
                              value={[fineTuningParameters.batchSize]}
                              onValueChange={(values) => handleFineTuningParameterChange('batchSize', values[0])}
                              max={32}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="text-xs text-gray-500">Learning Rate</Label>
                              <span className="text-xs text-gray-500">{fineTuningParameters.learningRate}</span>
                            </div>
                            <Slider
                              value={[fineTuningParameters.learningRate * 100000]}
                              onValueChange={(values) => handleFineTuningParameterChange('learningRate', values[0] / 100000)}
                              max={10}
                              min={1}
                              step={0.1}
                              className="w-full"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={fineTuningParameters.useLoRA} 
                              onCheckedChange={(value) => handleFineTuningParameterChange('useLoRA', value)} 
                              id="use-lora" 
                            />
                            <Label htmlFor="use-lora" className="text-xs text-gray-500">Use LoRA (Low-Rank Adaptation)</Label>
                          </div>
                          
                          {fineTuningParameters.useLoRA && (
                            <>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label className="text-xs text-gray-500">LoRA Rank</Label>
                                  <span className="text-xs text-gray-500">{fineTuningParameters.loraRank}</span>
                                </div>
                                <Slider
                                  value={[fineTuningParameters.loraRank]}
                                  onValueChange={(values) => handleFineTuningParameterChange('loraRank', values[0])}
                                  max={32}
                                  min={1}
                                  step={1}
                                  className="w-full"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label className="text-xs text-gray-500">LoRA Alpha</Label>
                                  <span className="text-xs text-gray-500">{fineTuningParameters.loraAlpha}</span>
                                </div>
                                <Slider
                                  value={[fineTuningParameters.loraAlpha]}
                                  onValueChange={(values) => handleFineTuningParameterChange('loraAlpha', values[0])}
                                  max={64}
                                  min={1}
                                  step={1}
                                  className="w-full"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  {fineTuningStatus === 'running' && (
                    <div className="space-y-2">
                      <Progress value={fineTuningProgress} className="w-full h-2" />
                      <div className="flex justify-between items-center text-xs">
                        <span>{Math.round(fineTuningProgress)}% Complete</span>
                        <Button variant="destructive" size="sm" onClick={cancelFineTuning}>Cancel</Button>
                      </div>
                    </div>
                  )}
                  
                  {fineTuningStatus !== 'running' && (
                    <Button 
                      onClick={startFineTuning} 
                      className="w-full"
                      disabled={fineTuningStatus === 'completed'}
                    >
                      {fineTuningStatus === 'completed' ? 'Fine-Tuning Complete' : 'Start Fine-Tuning'}
                    </Button>
                  )}
                  
                  {fineTuningStatus === 'completed' && (
                    <div className="flex items-center gap-2 p-2 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                      <BookOpen className="h-4 w-4" />
                      <span>Fine-tuned model available as "{model?.name}-ft"</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="perf">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="space-y-4 p-0">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Cost Estimate</Label>
                  <div className="mt-1 p-2 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Input</span>
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs">{costEstimate.inputCost}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">Output</span>
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-xs">{costEstimate.outputCost}</span>
                      </div>
                    </div>
                    {isFineTuningEnabled && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">Fine-tuning</span>
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs">
                            {parseFloat((costEstimate.totalCost - costEstimate.inputCost - costEstimate.outputCost).toFixed(5))}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-medium">Total</span>
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 text-gray-600 dark:text-gray-400 mr-1" />
                        <span className="text-xs font-medium">{costEstimate.totalCost}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Performance</Label>
                  <div className="mt-1 p-2 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Latency</span>
                      <div className="flex items-center">
                        <Zap className="h-3 w-3 text-amber-500 mr-1" />
                        <span className="text-xs">{model?.latencyMs || '~'} ms</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">Token limit</span>
                      <span className="text-xs">{model?.maxTokens || '~'}</span>
                    </div>
                  </div>
                </div>
                
                {model && (
                  <div className="text-xs text-center mt-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help flex items-center justify-center">
                            <InfoIcon className="h-3 w-3 mr-1" />
                            <span>Model card</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">View detailed model information</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-600 border-2 border-white dark:border-gray-800"
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-600 border-2 border-white dark:border-gray-800"
      />
    </div>
  );
}

export const AIModelNode = memo(AIModelNodeComponent);
