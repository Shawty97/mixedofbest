
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useModelComparison } from '@/hooks/use-model-comparison';
import { useModelPerformance } from '@/hooks/use-model-performance';
import { ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface ModelPerformanceProps {
  modelId?: string;
}

export default function ModelPerformancePanel({ modelId }: ModelPerformanceProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>("quality");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("week");
  
  const { models } = useModelComparison();
  const performanceHook = useModelPerformance();
  
  const [performanceChartData, setPerformanceChartData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  
  useEffect(() => {
    // Mock performance data for now
    const mockData = generateMockPerformanceData(selectedPeriod);
    setPerformanceChartData(mockData);
    
    // Mock model comparison data
    const mockComparisonData = generateMockComparisonData();
    setComparisonData(mockComparisonData);
  }, [selectedPeriod]);
  
  // Helper function to safely format number values
  const formatValue = (value: ValueType) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  // Custom tooltip formatter for recharts
  const tooltipFormatter = (value: ValueType, _name: string, _props: any) => {
    return [formatValue(value), _name];
  };
  
  // Mock data generation for demonstration purposes
  function generateMockPerformanceData(period: string) {
    const dataPoints = period === 'day' ? 24 : period === 'week' ? 7 : 30;
    return Array.from({ length: dataPoints }, (_, i) => {
      const date = period === 'day' ? `${i}h` : period === 'week' ? `Day ${i+1}` : `Day ${i+1}`;
      return {
        date,
        quality: 70 + Math.random() * 20,
        speed: 80 + Math.random() * 15,
        cost: 0.05 + Math.random() * 0.1,
        benchmark: 85,
      };
    });
  }
  
  function generateMockComparisonData() {
    const models = ['GPT-4', 'Claude 3', 'Llama 2', 'Mistral', 'Custom LLM'];
    return models.map(name => ({
      name,
      quality: 60 + Math.random() * 30,
      speed: 60 + Math.random() * 30,
      cost: 0.05 + Math.random() * 0.2,
    }));
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Model Performance</CardTitle>
          <div className="flex gap-2">
            <Select 
              value={selectedMetric} 
              onValueChange={setSelectedMetric}
            >
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quality">Quality</SelectItem>
                <SelectItem value="speed">Speed</SelectItem>
                <SelectItem value="cost">Cost</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedPeriod} 
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Performance Over Time</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceChartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  {selectedMetric === 'quality' && (
                    <Line 
                      type="monotone" 
                      dataKey="benchmark" 
                      stroke="#82ca9d" 
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Model Comparison</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Bar dataKey={selectedMetric} fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
