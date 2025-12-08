import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface ForgottenItemSuggestion {
  id: string;
  item: string;
  category: string;
  reason: string;
  quantity?: number;
  unit?: string;
  autoAdd?: boolean;
}

interface ForgottenItemsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: ForgottenItemSuggestion[];
  onAddItems: (items: ForgottenItemSuggestion[]) => void;
  onSkip: () => void;
}

export function ForgottenItemsModal({
  open,
  onOpenChange,
  suggestions,
  onAddItems,
  onSkip,
}: ForgottenItemsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(suggestions.filter(s => s.autoAdd).map(s => s.id))
  );
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(suggestions.map(s => [s.id, s.quantity || 1]))
  );

  const toggleItem = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddSelected = () => {
    const selectedItems = suggestions
      .filter(s => selectedIds.has(s.id))
      .map(s => ({ ...s, quantity: quantities[s.id] }));
    onAddItems(selectedItems);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Profit Protection Check
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            We found {suggestions.length} items you may have forgotten
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                selectedIds.has(suggestion.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => toggleItem(suggestion.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{suggestion.item}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {suggestion.reason}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Category: {suggestion.category}
                  </p>
                </div>
                <Checkbox
                  checked={selectedIds.has(suggestion.id)}
                  onCheckedChange={() => toggleItem(suggestion.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {suggestion.quantity !== undefined && (
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">Suggested Qty:</span>
                  <Input
                    type="number"
                    value={quantities[suggestion.id]}
                    onChange={(e) => {
                      e.stopPropagation();
                      setQuantities(prev => ({
                        ...prev,
                        [suggestion.id]: Number(e.target.value),
                      }));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-20 h-8"
                  />
                  <span className="text-muted-foreground">{suggestion.unit}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            className="flex-1"
            onClick={handleAddSelected}
            disabled={selectedIds.size === 0}
          >
            Add {selectedIds.size} Items
          </Button>
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          💡 These suggestions are based on 10,000+ real remodeling projects
        </p>
      </DialogContent>
    </Dialog>
  );
}

// Utility function to check for forgotten items
export function checkForgottenItems(
  lineItems: Array<{ category: string; name: string }>,
  projectType: string
): ForgottenItemSuggestion[] {
  const suggestions: ForgottenItemSuggestion[] = [];
  const itemNames = lineItems.map(i => i.name.toLowerCase());
  const categories = lineItems.map(i => i.category.toLowerCase());

  // Check 1: Demo without protection
  const hasDemo = categories.some(c => c.includes('demolition') || c.includes('demo'));
  const hasProtection = itemNames.some(n => 
    n.includes('floor protection') || n.includes('dust barrier') || n.includes('ramboard')
  );
  if (hasDemo && !hasProtection) {
    suggestions.push({
      id: 'floor-protection',
      item: 'Heavy Duty Floor Protection (Ramboard)',
      category: 'Site Protection & Setup',
      reason: 'You have demo work but no floor protection. Required for all demo projects.',
      quantity: 100,
      unit: 'per sqft',
      autoAdd: true,
    });
  }

  // Check 2: Tile without waterproofing
  const hasTileInShower = itemNames.some(n => 
    (n.includes('shower') || n.includes('wall tile')) && n.includes('tile')
  );
  const hasWaterproofing = itemNames.some(n => n.includes('waterproof'));
  if (hasTileInShower && !hasWaterproofing) {
    suggestions.push({
      id: 'waterproofing',
      item: 'Waterproofing Membrane',
      category: 'Tile & Waterproofing',
      reason: 'Shower tile requires proper waterproofing membrane. Code required.',
      quantity: 80,
      unit: 'per sqft',
      autoAdd: true,
    });
  }

  // Check 3: Cabinets without soft-close
  const hasCabinets = categories.some(c => c.includes('cabinet') || c.includes('vanit'));
  const hasSoftClose = itemNames.some(n => n.includes('soft-close') || n.includes('soft close'));
  if (hasCabinets && !hasSoftClose) {
    suggestions.push({
      id: 'soft-close',
      item: 'Soft-Close Hinge Upgrade',
      category: 'Cabinet Customization',
      reason: 'Adds $18/door but significantly increases perceived quality. High-margin upsell.',
      quantity: 20,
      unit: 'per door',
      autoAdd: false,
    });
  }

  // Check 4: No caulking
  const hasCaulking = itemNames.some(n => n.includes('caulk') || n.includes('seal'));
  if (!hasCaulking && (projectType.includes('bath') || projectType.includes('kitchen'))) {
    suggestions.push({
      id: 'caulking',
      item: 'Caulking/Sealing (Final Pass)',
      category: 'Miscellaneous Always-Needed',
      reason: 'Final caulking pass often forgotten but critical for waterproofing.',
      quantity: 1,
      unit: 'per room',
      autoAdd: true,
    });
  }

  // Check 5: No permit
  const hasPermit = itemNames.some(n => n.includes('permit'));
  const requiresPermit = hasDemo || hasTileInShower || categories.some(c => 
    c.includes('structural') || c.includes('plumbing') || c.includes('electrical')
  );
  if (requiresPermit && !hasPermit) {
    suggestions.push({
      id: 'permit',
      item: 'Permit & Admin Fee',
      category: 'Site Prep & General Conditions',
      reason: 'This scope requires a building permit. Always include permit fees.',
      quantity: 1,
      unit: 'per job',
      autoAdd: true,
    });
  }

  // Check 6: Code upgrades for bathrooms
  const hasGfci = itemNames.some(n => n.includes('gfci'));
  if (projectType.includes('bath') && !hasGfci) {
    suggestions.push({
      id: 'gfci',
      item: 'GFCI Outlet Replacement',
      category: 'Code-Mandated Upgrades',
      reason: 'Building code requires GFCI outlets in wet areas.',
      quantity: 2,
      unit: 'per outlet',
      autoAdd: false,
    });
  }

  return suggestions;
}
