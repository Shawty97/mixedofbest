
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { AnalyticsFilters } from './types/analytics.types';

interface CostAnalyzerProps {
  filters: AnalyticsFilters;
}

export function CostAnalyzer({ filters }: CostAnalyzerProps) {
  const [costData] = useState({
    totalCost: 45.67,
    monthlyTrend: 12.3,
    costPerWorkflow: 0.85,
    projectedMonthlyCost: 52.40
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamtkosten</p>
                <p className="text-2xl font-bold">${costData.totalCost}</p>
              </div>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-xs text-red-600">{costData.monthlyTrend}% vs. letzter Monat</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kosten pro Workflow</p>
                <p className="text-2xl font-bold">${costData.costPerWorkflow}</p>
              </div>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">-5.2% optimiert</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monatsprognose</p>
                <p className="text-2xl font-bold">${costData.projectedMonthlyCost}</p>
              </div>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-xs text-gray-500">Basierend auf aktueller Nutzung</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Einsparungspotential</p>
                <p className="text-2xl font-bold text-green-600">$8.45</p>
              </div>
              <TrendingDown className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <Button size="sm" variant="outline" className="text-xs">
                Optimierungen anzeigen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kostenaufschlüsselung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">OpenAI API (GPT-4)</p>
                <p className="text-sm text-gray-600">Token-basierte Abrechnung</p>
              </div>
              <div className="text-right">
                <p className="font-bold">$28.45</p>
                <p className="text-sm text-gray-600">62.3%</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">Anthropic Claude</p>
                <p className="text-sm text-gray-600">API-Aufrufe</p>
              </div>
              <div className="text-right">
                <p className="font-bold">$12.22</p>
                <p className="text-sm text-gray-600">26.8%</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">Sonstige Services</p>
                <p className="text-sm text-gray-600">Storage, Computing</p>
              </div>
              <div className="text-right">
                <p className="font-bold">$5.00</p>
                <p className="text-sm text-gray-600">10.9%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
