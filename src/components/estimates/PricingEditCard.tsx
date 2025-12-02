import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DollarSign, Save, X, Edit2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency, formatPercentage } from '@/lib/pricing-calculator';
import { Estimate } from '@/types/database';

interface PricingEditCardProps {
  estimate: Estimate;
  onUpdate: (updates: Partial<Estimate>) => void;
}

type OverrideMode = 'auto' | 'sell_price' | 'target_margin';

export function PricingEditCard({ estimate, onUpdate }: PricingEditCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<OverrideMode>('auto');
  const [sellPrice, setSellPrice] = useState(estimate.final_cp_total?.toString() || '');
  const [targetMargin, setTargetMargin] = useState('38');
  const [saving, setSaving] = useState(false);

  const internalCost = estimate.final_ic_total || 0;
  
  // Calculate preview values based on mode
  const getCalculatedPrice = (): number => {
    if (mode === 'auto') {
      return estimate.final_cp_total || 0;
    } else if (mode === 'sell_price') {
      return parseFloat(sellPrice) || 0;
    } else {
      // target_margin mode: CP = IC / (1 - margin)
      const margin = parseFloat(targetMargin) / 100;
      if (margin >= 1) return internalCost * 2;
      return internalCost / (1 - margin);
    }
  };

  const calculatedPrice = getCalculatedPrice();
  const calculatedMargin = calculatedPrice > 0 
    ? ((calculatedPrice - internalCost) / calculatedPrice) * 100 
    : 0;
  const calculatedProfit = calculatedPrice - internalCost;

  const handleSave = async () => {
    setSaving(true);
    try {
      const lowMultiplier = 0.95;
      const highMultiplier = 1.05;
      
      const updates = {
        final_cp_total: calculatedPrice,
        low_estimate_cp: calculatedPrice * lowMultiplier,
        high_estimate_cp: calculatedPrice * highMultiplier,
      };

      const { error } = await supabase
        .from('estimates')
        .update(updates)
        .eq('id', estimate.id);

      if (error) throw error;

      onUpdate(updates);
      setIsEditing(false);
      toast.success('Pricing updated!');
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast.error('Failed to update pricing');
    } finally {
      setSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg text-amber-800">Internal Breakdown</CardTitle>
            <p className="text-xs text-amber-600">This section is NOT shown on the client PDF</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-1" />
            Edit Pricing
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Internal Cost</p>
              <p className="font-semibold">{formatCurrency(internalCost)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Client Price</p>
              <p className="font-semibold">{formatCurrency(estimate.final_cp_total)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Margin</p>
              <p className="font-semibold text-emerald-600">
                {estimate.final_cp_total > 0
                  ? formatPercentage((estimate.final_cp_total - internalCost) / estimate.final_cp_total)
                  : '0%'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Gross Profit</p>
              <p className="font-semibold">{formatCurrency(estimate.final_cp_total - internalCost)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Edit Pricing
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={mode} onValueChange={(v) => setMode(v as OverrideMode)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="auto" id="auto" />
            <Label htmlFor="auto" className="text-sm">Use Auto Margin (from original calculation)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sell_price" id="sell_price" />
            <Label htmlFor="sell_price" className="text-sm">Set Selling Price</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="target_margin" id="target_margin" />
            <Label htmlFor="target_margin" className="text-sm">Set Target Margin %</Label>
          </div>
        </RadioGroup>

        {mode === 'sell_price' && (
          <div className="space-y-2">
            <Label htmlFor="sellPrice">Selling Price ($)</Label>
            <Input
              id="sellPrice"
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              placeholder="Enter selling price"
            />
          </div>
        )}

        {mode === 'target_margin' && (
          <div className="space-y-2">
            <Label htmlFor="targetMargin">Target Margin (%)</Label>
            <Input
              id="targetMargin"
              type="number"
              value={targetMargin}
              onChange={(e) => setTargetMargin(e.target.value)}
              placeholder="e.g., 38"
              min="0"
              max="99"
            />
          </div>
        )}

        {/* Preview */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
          <p className="font-medium text-muted-foreground mb-3">Preview</p>
          <div className="flex justify-between">
            <span>Internal Cost:</span>
            <span>{formatCurrency(internalCost)}</span>
          </div>
          <div className="flex justify-between font-semibold text-primary">
            <span>Client Price:</span>
            <span>{formatCurrency(calculatedPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Margin:</span>
            <span className="text-emerald-600">{calculatedMargin.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Profit:</span>
            <span>{formatCurrency(calculatedProfit)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
