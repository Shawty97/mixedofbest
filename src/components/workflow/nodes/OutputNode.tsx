import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layout, BarChart3, Code, FileText, Share2, Download, ChevronDown, Image, Globe, Terminal, Slice } from 'lucide-react';
import { NodeDataProps } from '../types/workflow.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function OutputNodeComponent({ data, isConnectable }: { data: NodeDataProps; isConnectable: boolean }) {
  const [activeFormat, setActiveFormat] = useState<string>('preview');
  
  const handleExport = (format: string) => {
    toast({
      title: `Export als ${format}`,
      description: "Ergebnis wurde exportiert",
    });
  };
  
  const handleShare = (type: string) => {
    toast({
      title: type === 'link' ? "Link erstellt" : "Als API veröffentlicht",
      description: type === 'link' 
        ? "Ergebnis-Link wurde in die Zwischenablage kopiert" 
        : "Workflow als API-Endpunkt veröffentlicht",
    });
  };

  const getResultPreview = () => {
    if (!data.result) return "Output wird hier erscheinen";
    
    if (typeof data.result === 'object') {
      try {
        return JSON.stringify(data.result, null, 2);
      } catch (e) {
        return String(data.result);
      }
    }
    
    return data.result;
  };

  return (
    <div className="p-4 border rounded-md border-purple-500 bg-purple-50 dark:bg-purple-950 dark:border-purple-800 w-[280px]">
      <div className="flex items-center gap-2 mb-3">
        <Layout className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        <div className="font-medium text-purple-700 dark:text-purple-300 flex-1">
          {data.label || "Output"}
        </div>
        <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900 text-xs">
          {data.outputType || "Text"}
        </Badge>
      </div>
      
      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        {data.description || "Formatiert und liefert das Endergebnis"}
      </div>
      
      <Tabs defaultValue="preview" value={activeFormat} onValueChange={setActiveFormat} className="mt-3">
        <TabsList className="w-full grid grid-cols-4 h-8">
          <TabsTrigger value="preview" className="text-xs">Vorschau</TabsTrigger>
          <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
          <TabsTrigger value="code" className="text-xs">Code</TabsTrigger>
          <TabsTrigger value="visual" className="text-xs">Visual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="mt-2">
          <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs font-mono max-h-[150px] overflow-y-auto">
            {getResultPreview()}
          </div>
        </TabsContent>
        
        <TabsContent value="json" className="mt-2">
          <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs font-mono max-h-[150px] overflow-y-auto">
            <pre>{data.result ? JSON.stringify(data.result, null, 2) : "Keine JSON-Daten verfügbar"}</pre>
          </div>
        </TabsContent>
        
        <TabsContent value="code" className="mt-2">
          <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs font-mono max-h-[150px] overflow-y-auto">
            <pre>{data.code || "// Kein Code generiert"}</pre>
          </div>
        </TabsContent>
        
        <TabsContent value="visual" className="mt-2">
          <div className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs max-h-[150px] overflow-y-auto flex items-center justify-center">
            {data.visualData ? (
              <img src={data.visualData} alt="Visualisierung" className="max-w-full h-auto" />
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Keine Visualisierung verfügbar</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-2 gap-1 mt-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="text-xs h-7 w-full">
              <Download className="h-3 w-3 mr-1" />
              Exportieren
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <FileText className="h-3.5 w-3.5 mr-2" />
              Als PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('json')}>
              <Code className="h-3.5 w-3.5 mr-2" />
              Als JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('image')}>
              <Image className="h-3.5 w-3.5 mr-2" />
              Als Bild
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <Slice className="h-3.5 w-3.5 mr-2" />
              Als CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="text-xs h-7 w-full">
              <Share2 className="h-3 w-3 mr-1" />
              Teilen
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleShare('link')}>
              <Globe className="h-3.5 w-3.5 mr-2" />
              Link teilen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('api')}>
              <Terminal className="h-3.5 w-3.5 mr-2" />
              Als API veröffentlichen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {data.metrics && (
        <div className="mt-3 pt-2 border-t border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <BarChart3 className="h-3 w-3 mr-1" />
              Metriken
            </div>
            <div>
              {data.metrics.tokens && `${data.metrics.tokens} Tokens`}
              {data.metrics.time && ` • ${data.metrics.time}ms`}
            </div>
          </div>
          
          {data.metrics.optimizationScore && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-purple-600 dark:bg-purple-500 h-1.5 rounded-full transition-all duration-500 ease-in-out"
                      style={{ width: `${data.metrics.optimizationScore}%` }}
                    ></div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Optimierungsgrad: {data.metrics.optimizationScore}%</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {data.metrics.qualityScore && (
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className="text-gray-500 dark:text-gray-400">Qualität:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className={`h-2 w-2 mx-0.5 rounded-full ${
                    star <= Math.round(data.metrics.qualityScore / 20) 
                      ? 'bg-purple-600 dark:bg-purple-500' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-600 border-2 border-white dark:border-gray-800"
      />
    </div>
  );
}

export const OutputNode = memo(OutputNodeComponent);
