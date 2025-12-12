import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronDown, Search, X } from 'lucide-react';
import { 
  Bath, ChefHat, Wrench, Hammer, Palette, Zap, Droplets, 
  Shield, Home, Sparkles, FileText, DoorOpen, Layers, 
  Thermometer, Scissors, Info 
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  PRICING_TABLE, 
  CATEGORY_METADATA, 
  PricingItem,
  getAllCategoriesWithItems,
  applyMargin
} from '@/lib/pricing-table';

const ICON_MAP: Record<string, React.ReactNode> = {
  Hammer: <Hammer className="h-5 w-5" />,
  Home: <Home className="h-5 w-5" />,
  Droplets: <Droplets className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  Layers: <Layers className="h-5 w-5" />,
  Bath: <Bath className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />,
  Palette: <Palette className="h-5 w-5" />,
  Scissors: <Scissors className="h-5 w-5" />,
  DoorOpen: <DoorOpen className="h-5 w-5" />,
  Thermometer: <Thermometer className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  Info: <Info className="h-5 w-5" />,
};

interface PricingTableSectionProps {
  targetMargin: number;
  onItemChange?: (key: string, field: 'cost' | 'price', value: number) => void;
  customPricing?: Record<string, Partial<PricingItem>>;
  readOnly?: boolean;
}

export function PricingTableSection({ 
  targetMargin, 
  onItemChange,
  customPricing = {},
  readOnly = false
}: PricingTableSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const categories = getAllCategoriesWithItems();

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(({ key, item }) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        key.toLowerCase().includes(query) ||
        item.aliases.some(a => a.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query)
      );
    })
  })).filter(cat => cat.items.length > 0);

  const getEffectiveValue = (key: string, field: 'cost' | 'price'): number => {
    const customItem = customPricing[key];
    if (customItem && customItem[field] !== undefined) {
      return customItem[field]!;
    }
    return PRICING_TABLE[key][field];
  };

  const calculateMargin = (cost: number, price: number): number => {
    if (price === 0) return 0;
    return ((price - cost) / price) * 100;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pricing items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          Found {filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0)} items
        </p>
      )}

      {/* Category Sections */}
      <div className="space-y-3">
        {filteredCategories.map(({ category, metadata, items }) => (
          <Collapsible 
            key={category} 
            open={expandedCategories.has(category) || !!searchQuery}
            onOpenChange={() => !searchQuery && toggleCategory(category)}
          >
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border shadow-sm hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-3">
                  <span className="text-primary">
                    {ICON_MAP[metadata.icon] || <Layers className="h-5 w-5" />}
                  </span>
                  <span className="text-base font-semibold text-foreground">{metadata.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {items.length} items
                  </Badge>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform duration-200",
                  (expandedCategories.has(category) || searchQuery) && "rotate-180"
                )} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
                  <div className="col-span-4">Item</div>
                  <div className="col-span-2 text-right">Cost (IC)</div>
                  <div className="col-span-2 text-right">Price (CP)</div>
                  <div className="col-span-2 text-center">Unit</div>
                  <div className="col-span-2 text-right">Margin</div>
                </div>
                
                {/* Table Rows */}
                <div className="divide-y divide-border">
                  {items.map(({ key, item }) => {
                    const cost = getEffectiveValue(key, 'cost');
                    const price = getEffectiveValue(key, 'price');
                    const margin = calculateMargin(cost, price);
                    const isCustomized = customPricing[key] !== undefined;
                    
                    return (
                      <div 
                        key={key} 
                        className={cn(
                          "grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted/30 transition-colors",
                          isCustomized && "bg-primary/5"
                        )}
                      >
                        <div className="col-span-4">
                          <p className="text-sm font-medium text-foreground">{key}</p>
                          {item.aliases.length > 0 && (
                            <p className="text-xs text-muted-foreground truncate">
                              {item.aliases.slice(0, 3).join(', ')}
                              {item.aliases.length > 3 && '...'}
                            </p>
                          )}
                        </div>
                        <div className="col-span-2 text-right">
                          {readOnly ? (
                            <span className="text-sm font-mono">${cost.toFixed(2)}</span>
                          ) : (
                            <Input
                              type="number"
                              value={cost}
                              onChange={(e) => onItemChange?.(key, 'cost', parseFloat(e.target.value) || 0)}
                              className="h-8 text-right text-sm font-mono"
                            />
                          )}
                        </div>
                        <div className="col-span-2 text-right">
                          {readOnly ? (
                            <span className="text-sm font-mono">${price.toFixed(2)}</span>
                          ) : (
                            <Input
                              type="number"
                              value={price}
                              onChange={(e) => onItemChange?.(key, 'price', parseFloat(e.target.value) || 0)}
                              className="h-8 text-right text-sm font-mono"
                            />
                          )}
                        </div>
                        <div className="col-span-2 text-center">
                          <Badge variant="outline" className="text-xs">
                            {item.perUnit ? `per ${item.unit}` : item.unit}
                          </Badge>
                        </div>
                        <div className="col-span-2 text-right">
                          <Badge 
                            variant={margin >= targetMargin * 100 - 5 ? "default" : "secondary"}
                            className={cn(
                              "text-xs font-mono",
                              margin < targetMargin * 100 - 10 && "bg-destructive/10 text-destructive border-destructive/30"
                            )}
                          >
                            {margin.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
