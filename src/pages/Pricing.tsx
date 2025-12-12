import { useState, useMemo, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, ChevronRight, Save, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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

interface PricingOverride {
  item_key: string;
  custom_cost: number | null;
  custom_price: number | null;
}

interface EditedItem {
  cost: number;
  price: number;
}

const Pricing = () => {
  const { profile } = useAuth();
  const contractorId = profile?.contractor_id;
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [overrides, setOverrides] = useState<Record<string, PricingOverride>>({});
  const [editedItems, setEditedItems] = useState<Record<string, EditedItem>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load overrides from database
  useEffect(() => {
    const loadOverrides = async () => {
      if (!contractorId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('pricing_overrides')
          .select('item_key, custom_cost, custom_price')
          .eq('contractor_id', contractorId);

        if (error) throw error;

        const overridesMap: Record<string, PricingOverride> = {};
        data?.forEach((row) => {
          overridesMap[row.item_key] = row;
        });
        setOverrides(overridesMap);
      } catch (error) {
        console.error('Error loading pricing overrides:', error);
        toast.error('Failed to load pricing overrides');
      } finally {
        setLoading(false);
      }
    };

    loadOverrides();
  }, [contractorId]);

  // Get effective cost/price (override or default)
  const getEffectiveValues = useCallback((key: string, item: PricingItem) => {
    const edited = editedItems[key];
    if (edited) {
      return { cost: edited.cost, price: edited.price };
    }
    const override = overrides[key];
    return {
      cost: override?.custom_cost ?? item.cost,
      price: override?.custom_price ?? item.price,
    };
  }, [overrides, editedItems]);

  // Check if item has unsaved changes
  const hasChanges = useCallback((key: string, item: PricingItem) => {
    const edited = editedItems[key];
    if (!edited) return false;
    const override = overrides[key];
    const savedCost = override?.custom_cost ?? item.cost;
    const savedPrice = override?.custom_price ?? item.price;
    return edited.cost !== savedCost || edited.price !== savedPrice;
  }, [overrides, editedItems]);

  // Check if item is customized (differs from default)
  const isCustomized = useCallback((key: string, item: PricingItem) => {
    const override = overrides[key];
    if (!override) return false;
    return override.custom_cost !== null || override.custom_price !== null;
  }, [overrides]);

  // Handle value change
  const handleValueChange = (key: string, field: 'cost' | 'price', value: string) => {
    const numValue = parseFloat(value) || 0;
    const item = PRICING_TABLE[key];
    const current = getEffectiveValues(key, item);
    
    setEditedItems(prev => ({
      ...prev,
      [key]: {
        ...current,
        [field]: numValue,
      },
    }));
  };

  // Save all changes
  const saveChanges = async () => {
    if (!contractorId) {
      toast.error('Please log in to save changes');
      return;
    }

    const changedKeys = Object.keys(editedItems).filter(key => {
      const item = PRICING_TABLE[key];
      return hasChanges(key, item);
    });

    if (changedKeys.length === 0) {
      toast.info('No changes to save');
      return;
    }

    setSaving(true);
    try {
      for (const key of changedKeys) {
        const edited = editedItems[key];
        const { error } = await supabase
          .from('pricing_overrides')
          .upsert({
            contractor_id: contractorId,
            item_key: key,
            custom_cost: edited.cost,
            custom_price: edited.price,
          }, {
            onConflict: 'contractor_id,item_key',
          });

        if (error) throw error;

        // Update local overrides
        setOverrides(prev => ({
          ...prev,
          [key]: {
            item_key: key,
            custom_cost: edited.cost,
            custom_price: edited.price,
          },
        }));
      }

      // Clear edited items
      setEditedItems({});
      toast.success(`Saved ${changedKeys.length} pricing changes`);
    } catch (error) {
      console.error('Error saving pricing overrides:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Reset item to default
  const resetToDefault = async (key: string) => {
    if (!contractorId) return;

    try {
      const { error } = await supabase
        .from('pricing_overrides')
        .delete()
        .eq('contractor_id', contractorId)
        .eq('item_key', key);

      if (error) throw error;

      setOverrides(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setEditedItems(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      toast.success('Reset to default pricing');
    } catch (error) {
      console.error('Error resetting pricing:', error);
      toast.error('Failed to reset');
    }
  };

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
  useEffect(() => {
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
  const pendingChanges = Object.keys(editedItems).filter(key => {
    const item = PRICING_TABLE[key];
    return hasChanges(key, item);
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Pricing Table</h1>
            <p className="text-muted-foreground">
              {totalItems} items across {Object.keys(CATEGORY_CONFIG).length} categories
            </p>
          </div>
          {pendingChanges > 0 && (
            <Button onClick={saveChanges} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save {pendingChanges} Changes
            </Button>
          )}
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
              const customizedCount = Object.keys(items).filter(key => isCustomized(key, items[key])).length;

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
                        {customizedCount > 0 && (
                          <Badge variant="default" className="text-xs bg-primary/20 text-primary">
                            {customizedCount} customized
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="mt-2 border border-border rounded-lg overflow-hidden">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border">
                        <div className="col-span-4">Item</div>
                        <div className="col-span-2 text-right">Cost (IC)</div>
                        <div className="col-span-2 text-right">Price (CP)</div>
                        <div className="col-span-1 text-center">Unit</div>
                        <div className="col-span-1 text-right">Margin</div>
                        <div className="col-span-2 text-center">Actions</div>
                      </div>

                      {/* Table Rows */}
                      {Object.entries(items).map(([key, item], index) => {
                        const { cost, price } = getEffectiveValues(key, item);
                        const margin = calculateMargin(cost, price);
                        const isLowMargin = margin < 30;
                        const isHighMargin = margin > 50;
                        const itemHasChanges = hasChanges(key, item);
                        const itemIsCustomized = isCustomized(key, item);

                        return (
                          <div
                            key={key}
                            className={cn(
                              "grid grid-cols-12 gap-4 px-4 py-2 text-sm items-center",
                              index % 2 === 0 ? "bg-background" : "bg-muted/20",
                              itemHasChanges && "bg-yellow-500/10",
                              "hover:bg-accent/30 transition-colors"
                            )}
                          >
                            <div className="col-span-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">
                                  {formatItemName(key)}
                                </span>
                                {itemIsCustomized && (
                                  <Badge variant="outline" className="text-xs text-primary border-primary/50">
                                    Custom
                                  </Badge>
                                )}
                                {itemHasChanges && (
                                  <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600/50">
                                    Unsaved
                                  </Badge>
                                )}
                              </div>
                              {item.aliases && item.aliases.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {item.aliases.slice(0, 2).join(', ')}
                                  {item.aliases.length > 2 && ` +${item.aliases.length - 2}`}
                                </div>
                              )}
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={cost}
                                onChange={(e) => handleValueChange(key, 'cost', e.target.value)}
                                className="h-8 text-right font-mono text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => handleValueChange(key, 'price', e.target.value)}
                                className="h-8 text-right font-mono text-sm"
                              />
                            </div>
                            <div className="col-span-1 text-center">
                              <Badge variant="outline" className="text-xs">
                                {item.unit}
                              </Badge>
                            </div>
                            <div className="col-span-1 text-right">
                              <span
                                className={cn(
                                  "font-mono text-sm",
                                  isLowMargin && "text-destructive",
                                  isHighMargin && "text-green-600 dark:text-green-400",
                                  !isLowMargin && !isHighMargin && "text-muted-foreground"
                                )}
                              >
                                {margin.toFixed(0)}%
                              </span>
                            </div>
                            <div className="col-span-2 flex justify-center">
                              {itemIsCustomized && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resetToDefault(key);
                                  }}
                                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                >
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                  Reset
                                </Button>
                              )}
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
