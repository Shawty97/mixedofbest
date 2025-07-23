
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AgentCategoryFilterProps {
  categories?: string[];
  selectedCategories?: string[];
  onChange?: (categories: string[]) => void;
  filters?: any;
  onFiltersChange?: (filters: any) => void;
}

export function AgentCategoryFilter({ 
  categories, 
  selectedCategories, 
  onChange,
  filters, 
  onFiltersChange 
}: AgentCategoryFilterProps) {
  // Handle both prop patterns for backward compatibility
  const handleCategoryChange = (value: string) => {
    if (onFiltersChange && filters) {
      // New pattern for AgentMarketplace
      onFiltersChange({ ...filters, category: value === 'all' ? undefined : value });
    } else if (onChange && selectedCategories) {
      // Old pattern for AgentStore
      if (value === 'all') {
        onChange([]);
      } else {
        onChange([value]);
      }
    }
  };

  const handlePriceChange = (value: string) => {
    if (onFiltersChange && filters) {
      onFiltersChange({ ...filters, priceType: value as any });
    }
  };

  const currentCategory = filters?.category || (selectedCategories && selectedCategories[0]) || 'all';
  const currentPriceType = filters?.priceType || 'all';

  return (
    <div className="flex gap-2">
      <Select
        value={currentCategory}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Kategorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Kategorien</SelectItem>
          <SelectItem value="business">Business</SelectItem>
          <SelectItem value="creative">Creative</SelectItem>
          <SelectItem value="technical">Technical</SelectItem>
          <SelectItem value="educational">Educational</SelectItem>
          {categories?.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Only show price filter in AgentMarketplace context */}
      {filters && onFiltersChange && (
        <Select
          value={currentPriceType}
          onValueChange={handlePriceChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Preis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="free">Kostenlos</SelectItem>
            <SelectItem value="paid">Kostenpflichtig</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
