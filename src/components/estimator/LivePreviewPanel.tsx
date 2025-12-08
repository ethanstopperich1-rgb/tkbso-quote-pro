import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Camera, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface PreviewLineItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  cost?: number;
  margin?: number;
  confidence?: 'high' | 'medium' | 'low';
}

interface LivePreviewPanelProps {
  lineItems: PreviewLineItem[];
  onRemoveItem: (id: string) => void;
  onFinalize: () => void;
  subtotal: number;
  avgMargin: number;
  safeMode?: boolean;
}

export function LivePreviewPanel({
  lineItems,
  onRemoveItem,
  onFinalize,
  subtotal,
  avgMargin,
  safeMode = false,
}: LivePreviewPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Group items by category
  const groupedItems = lineItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PreviewLineItem[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getCategoryTotal = (items: PreviewLineItem[]) => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const getMarginColor = (margin: number) => {
    if (margin > 40) return 'text-emerald-600';
    if (margin > 30) return 'text-amber-600';
    return 'text-red-600';
  };

  if (lineItems.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-bold text-foreground mb-2">Live Estimate Preview</h3>
        <p className="text-sm text-muted-foreground">
          Describe the project in chat and items will appear here as AI identifies them
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-bold text-foreground">Live Estimate Preview</h3>
        <p className="text-sm text-muted-foreground">
          {lineItems.length} items • {Object.keys(groupedItems).length} categories
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {Object.entries(groupedItems).map(([category, items]) => (
            <Collapsible
              key={category}
              open={expandedCategories[category] ?? true}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <h4 className="font-semibold text-sm text-foreground">{category}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {items.length} items
                    </span>
                    <span className="text-sm font-semibold">
                      ${getCategoryTotal(items).toLocaleString()}
                    </span>
                    {expandedCategories[category] ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="mt-1 space-y-1 pl-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/30 group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} {item.unit} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          ${item.total.toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveItem(item.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>

      {/* Summary Footer */}
      <div className="p-4 border-t bg-background">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">Subtotal</span>
            <span className="font-bold text-lg">${subtotal.toLocaleString()}</span>
          </div>
          {!safeMode && avgMargin > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Avg. Margin</span>
              <span className={`font-semibold ${getMarginColor(avgMargin)}`}>
                {avgMargin.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={onFinalize}>
            Review & Finalize Estimate
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <a href="/estimator/photo">
              <Camera className="w-4 h-4 mr-2" />
              Switch to Photo Mode
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
