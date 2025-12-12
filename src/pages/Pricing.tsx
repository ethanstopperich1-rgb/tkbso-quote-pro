import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  PRICING_TABLE,
  CATEGORY_CONFIG,
  PricingItem,
  getAllCategoriesWithItems,
} from '@/lib/pricing-table-v2';

const Pricing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Get all items organized by category
  const categorizedItems = useMemo(() => getAllCategoriesWithItems(), []);

  // Filter items based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categorizedItems;

    const search = searchTerm.toLowerCase();
    const filtered: Record<string, Record<string, PricingItem>> = {};

    Object.entries(categorizedItems).forEach(([category, items]) => {
      const matchingItems: Record<string, PricingItem> = {};
      Object.entries(items).forEach(([key, item]) => {
        const matchesKey = key.toLowerCase().includes(search);
        const matchesCategory = item.category.toLowerCase().includes(search);
        const matchesAliases = item.aliases?.some(a => a.toLowerCase().includes(search));
        
        if (matchesKey || matchesCategory || matchesAliases) {
          matchingItems[key] = item;
        }
      });
      
      if (Object.keys(matchingItems).length > 0) {
        filtered[category] = matchingItems;
      }
    });

    return filtered;
  }, [categorizedItems, searchTerm]);

  // Auto-expand categories when searching
  useMemo(() => {
    if (searchTerm.trim()) {
      setExpandedCategories(new Set(Object.keys(filteredCategories)));
    }
  }, [searchTerm, filteredCategories]);

  const toggleCategory = (category: string) => {
    const next = new Set(expandedCategories);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    setExpandedCategories(next);
  };

  const expandAll = () => {
    setExpandedCategories(new Set(Object.keys(categorizedItems)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatItemName = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const calculateMargin = (cost: number, price: number) => {
    if (price === 0) return 0;
    return ((price - cost) / price) * 100;
  };

  const totalItems = Object.keys(PRICING_TABLE).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Pricing Table</h1>
          <p className="text-muted-foreground">
            {totalItems} items across {Object.keys(CATEGORY_CONFIG).length} categories
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items, categories, or aliases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Category List */}
        <div className="space-y-4">
          {Object.entries(CATEGORY_CONFIG)
            .sort((a, b) => a[1].order - b[1].order)
            .map(([categoryKey, categoryConfig]) => {
              const items = filteredCategories[categoryKey];
              if (!items || Object.keys(items).length === 0) return null;

              const isExpanded = expandedCategories.has(categoryKey);
              const itemCount = Object.keys(items).length;

              return (
                <Collapsible
                  key={categoryKey}
                  open={isExpanded}
                  onOpenChange={() => toggleCategory(categoryKey)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="font-semibold text-foreground">{categoryConfig.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {itemCount} items
                        </Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="mt-2 border border-border rounded-lg overflow-hidden">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border">
                        <div className="col-span-5">Item</div>
                        <div className="col-span-2 text-right">Cost (IC)</div>
                        <div className="col-span-2 text-right">Price (CP)</div>
                        <div className="col-span-1 text-center">Unit</div>
                        <div className="col-span-2 text-right">Margin</div>
                      </div>

                      {/* Table Rows */}
                      {Object.entries(items).map(([key, item], index) => {
                        const margin = calculateMargin(item.cost, item.price);
                        const isLowMargin = margin < 30;
                        const isHighMargin = margin > 50;

                        return (
                          <div
                            key={key}
                            className={cn(
                              "grid grid-cols-12 gap-4 px-4 py-3 text-sm items-center",
                              index % 2 === 0 ? "bg-background" : "bg-muted/20",
                              "hover:bg-accent/30 transition-colors"
                            )}
                          >
                            <div className="col-span-5">
                              <div className="font-medium text-foreground">
                                {formatItemName(key)}
                              </div>
                              {item.aliases && item.aliases.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {item.aliases.slice(0, 3).join(', ')}
                                  {item.aliases.length > 3 && ` +${item.aliases.length - 3} more`}
                                </div>
                              )}
                            </div>
                            <div className="col-span-2 text-right font-mono text-foreground">
                              {formatCurrency(item.cost)}
                            </div>
                            <div className="col-span-2 text-right font-mono text-foreground">
                              {formatCurrency(item.price)}
                            </div>
                            <div className="col-span-1 text-center">
                              <Badge variant="outline" className="text-xs">
                                {item.unit}
                              </Badge>
                            </div>
                            <div className="col-span-2 text-right">
                              <span
                                className={cn(
                                  "font-mono text-sm",
                                  isLowMargin && "text-destructive",
                                  isHighMargin && "text-green-600 dark:text-green-400",
                                  !isLowMargin && !isHighMargin && "text-muted-foreground"
                                )}
                              >
                                {margin.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
        </div>

        {/* Empty State */}
        {Object.keys(filteredCategories).length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
