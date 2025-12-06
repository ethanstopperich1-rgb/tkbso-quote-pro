import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { DollarSign, Save, X, Edit2, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency, formatPercentage } from '@/lib/pricing-calculator';
import { Estimate, PricingConfig } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';

interface PricingEditCardProps {
  estimate: Estimate;
  onUpdate: (updates: Partial<Estimate>) => void;
}

type OverrideMode = 'auto' | 'sell_price' | 'target_margin';

export function PricingEditCard({ estimate, onUpdate }: PricingEditCardProps) {
  const { contractor } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<OverrideMode>('auto');
  const [sellPrice, setSellPrice] = useState(estimate.final_cp_total?.toString() || '');
  const [targetMargin, setTargetMargin] = useState('38');
  const [saving, setSaving] = useState(false);
  
  // Management fee state
  const [includeManagementFee, setIncludeManagementFee] = useState(estimate.include_management_fee || false);
  const [managementFeePercent, setManagementFeePercent] = useState(
    (estimate.management_fee_percent ? estimate.management_fee_percent * 100 : 15).toString()
  );
  const [defaultFeePercent, setDefaultFeePercent] = useState(15);

  // Sync local state when estimate prop changes (e.g., after save or external update)
  useEffect(() => {
    setIncludeManagementFee(estimate.include_management_fee || false);
    setManagementFeePercent(
      (estimate.management_fee_percent ? estimate.management_fee_percent * 100 : defaultFeePercent).toString()
    );
    setSellPrice(estimate.final_cp_total?.toString() || '');
  }, [estimate.include_management_fee, estimate.management_fee_percent, estimate.final_cp_total, defaultFeePercent]);

  // Fetch default fee from pricing config
  useEffect(() => {
    async function fetchConfig() {
      if (!contractor) return;
      const { data } = await supabase
        .from('pricing_configs')
        .select('management_fee_percent')
        .eq('contractor_id', contractor.id)
        .single();
      if (data?.management_fee_percent) {
        setDefaultFeePercent(data.management_fee_percent * 100);
        if (!estimate.management_fee_percent) {
          setManagementFeePercent((data.management_fee_percent * 100).toString());
        }
      }
    }
    fetchConfig();
  }, [contractor, estimate.management_fee_percent]);

  // Base values (without current management fee)
  const baseIcTotal = (estimate.final_ic_total || 0) - (estimate.management_fee_ic || 0);
  const baseCpTotal = (estimate.final_cp_total || 0) - (estimate.management_fee_cp || 0);

  // Calculate management fee amounts
  const feePercent = parseFloat(managementFeePercent) / 100 || 0;
  const managementFeeIc = includeManagementFee ? Math.round(baseIcTotal * feePercent) : 0;
  const managementFeeCp = includeManagementFee ? Math.round(baseCpTotal * feePercent) : 0;

  // Final totals with management fee
  const internalCostWithFee = baseIcTotal + managementFeeIc;
  
  // Calculate preview values based on mode
  const getCalculatedPrice = (): number => {
    const basePrice = baseCpTotal + managementFeeCp;
    if (mode === 'auto') {
      return basePrice;
    } else if (mode === 'sell_price') {
      return parseFloat(sellPrice) || 0;
    } else {
      // target_margin mode: CP = IC / (1 - margin)
      const margin = parseFloat(targetMargin) / 100;
      if (margin >= 1) return internalCostWithFee * 2;
      return internalCostWithFee / (1 - margin);
    }
  };

  const calculatedPrice = getCalculatedPrice();
  const calculatedMargin = calculatedPrice > 0 
    ? ((calculatedPrice - internalCostWithFee) / calculatedPrice) * 100 
    : 0;
  const calculatedProfit = calculatedPrice - internalCostWithFee;

  const handleSave = async () => {
    setSaving(true);
    try {
      const lowMultiplier = 0.95;
      const highMultiplier = 1.05;
      
      // Scale line items proportionally if price changed
      let updatedPayload = estimate.internal_json_payload;
      const payload = estimate.internal_json_payload as any;
      
      if (payload?.pricing?.line_items && payload?.pricing?.totals?.total_cp) {
        const originalTotalCp = payload.pricing.totals.total_cp;
        // Calculate new base CP (without management fee) from calculatedPrice
        const newBaseCp = calculatedPrice - managementFeeCp;
        
        if (originalTotalCp > 0 && Math.abs(newBaseCp - originalTotalCp) > 1) {
          const scaleFactor = newBaseCp / originalTotalCp;
          
          const scaledLineItems = payload.pricing.line_items.map((item: any) => ({
            ...item,
            cp_total: Math.round(item.cp_total * scaleFactor * 100) / 100,
            cp_per_unit: item.cp_per_unit ? Math.round(item.cp_per_unit * scaleFactor * 100) / 100 : item.cp_per_unit,
            margin_percent: item.ic_total > 0 
              ? Math.round(((item.cp_total * scaleFactor - item.ic_total) / (item.cp_total * scaleFactor)) * 10000) / 100
              : item.margin_percent,
          }));
          
          updatedPayload = {
            ...payload,
            pricing: {
              ...payload.pricing,
              line_items: scaledLineItems,
              totals: {
                ...payload.pricing.totals,
                total_cp: newBaseCp,
                overall_margin_percent: internalCostWithFee > 0 
                  ? ((calculatedPrice - internalCostWithFee) / calculatedPrice) * 100 
                  : 0,
                low_estimate: calculatedPrice * lowMultiplier,
                high_estimate: calculatedPrice * highMultiplier,
              },
            },
          };
        }
      }
      
      const dbUpdates: Record<string, any> = {
        final_ic_total: internalCostWithFee,
        final_cp_total: calculatedPrice,
        low_estimate_cp: calculatedPrice * lowMultiplier,
        high_estimate_cp: calculatedPrice * highMultiplier,
        include_management_fee: includeManagementFee,
        management_fee_percent: feePercent,
        management_fee_ic: managementFeeIc,
        management_fee_cp: managementFeeCp,
        internal_json_payload: updatedPayload,
      };

      const { error } = await supabase
        .from('estimates')
        .update(dbUpdates)
        .eq('id', estimate.id);

      if (error) throw error;

      onUpdate(dbUpdates as Partial<Estimate>);
      setIsEditing(false);
      toast.success('Pricing updated!');
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast.error('Failed to update pricing');
    } finally {
      setSaving(false);
    }
  };

  // Current display values for read-only view
  const displayIc = estimate.final_ic_total || 0;
  const displayCp = estimate.final_cp_total || 0;

  // Quick save for management fee toggle
  const handleQuickFeeToggle = async (enabled: boolean) => {
    const newFeePercent = parseFloat(managementFeePercent) / 100 || defaultFeePercent / 100;
    const newFeeIc = enabled ? Math.round(baseIcTotal * newFeePercent) : 0;
    const newFeeCp = enabled ? Math.round(baseCpTotal * newFeePercent) : 0;
    const newIcTotal = baseIcTotal + newFeeIc;
    const newCpTotal = baseCpTotal + newFeeCp;

    const dbUpdates = {
      final_ic_total: newIcTotal,
      final_cp_total: newCpTotal,
      low_estimate_cp: newCpTotal * 0.95,
      high_estimate_cp: newCpTotal * 1.05,
      include_management_fee: enabled,
      management_fee_percent: newFeePercent,
      management_fee_ic: newFeeIc,
      management_fee_cp: newFeeCp,
    };

    try {
      const { error } = await supabase
        .from('estimates')
        .update(dbUpdates)
        .eq('id', estimate.id);

      if (error) throw error;

      setIncludeManagementFee(enabled);
      onUpdate(dbUpdates as Partial<Estimate>);
      toast.success(enabled ? 'Management fee added!' : 'Management fee removed');
    } catch (error) {
      console.error('Error updating management fee:', error);
      toast.error('Failed to update management fee');
    }
  };

  if (!isEditing) {
    return (
      <Card className="border-amber-300 bg-amber-50/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg text-amber-900">Profitability Analysis</CardTitle>
            <p className="text-xs text-amber-700 flex items-center gap-1 mt-0.5">
              ⚠️ Contains sensitive data - NOT shown on client PDF
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="border-amber-300 hover:bg-amber-100">
            <Edit2 className="h-4 w-4 mr-1" />
            Edit Pricing
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Internal Cost</p>
              <p className="font-semibold">{formatCurrency(displayIc)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Client Price</p>
              <p className="font-semibold">{formatCurrency(displayCp)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Margin</p>
              <p className="font-semibold text-emerald-600">
                {displayCp > 0
                  ? formatPercentage((displayCp - displayIc) / displayCp)
                  : '0%'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Gross Profit</p>
              <p className="font-semibold">{formatCurrency(displayCp - displayIc)}</p>
            </div>
          </div>

          {/* Management Fee Quick Toggle */}
          <div className="pt-3 border-t border-amber-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-0.5">
                <Label className="text-sm font-medium text-amber-800">Management Fee</Label>
                {!includeManagementFee && (
                  <p className="text-xs text-amber-600">Add {defaultFeePercent.toFixed(0)}% fee</p>
                )}
              </div>
              {includeManagementFee && (
                <div className="flex items-center gap-2">
                  <div className="relative w-20">
                    <Input
                      type="number"
                      value={managementFeePercent}
                      onChange={(e) => setManagementFeePercent(e.target.value)}
                      onBlur={() => {
                        const pct = parseFloat(managementFeePercent) / 100 || 0;
                        if (pct > 0) handleQuickFeeToggle(true);
                      }}
                      className="h-8 pr-6 text-sm"
                      min="0"
                      max="50"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                  </div>
                  <span className="text-sm font-medium text-amber-800 whitespace-nowrap">
                    = {formatCurrency(Math.round(baseCpTotal * (parseFloat(managementFeePercent) / 100 || 0)))}
                  </span>
                </div>
              )}
              <Switch
                checked={includeManagementFee}
                onCheckedChange={handleQuickFeeToggle}
              />
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
        {/* Management Fee Toggle */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Management Fee</Label>
              <p className="text-xs text-muted-foreground">Add percentage-based management fee</p>
            </div>
            <Switch
              checked={includeManagementFee}
              onCheckedChange={setIncludeManagementFee}
            />
          </div>
          
          {includeManagementFee && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label htmlFor="feePercent" className="text-xs text-muted-foreground">Fee %</Label>
                <div className="relative">
                  <Input
                    id="feePercent"
                    type="number"
                    value={managementFeePercent}
                    onChange={(e) => setManagementFeePercent(e.target.value)}
                    className="pr-8"
                    min="0"
                    max="50"
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Fee Amount</p>
                <p className="text-sm font-medium">{formatCurrency(managementFeeCp)}</p>
              </div>
            </div>
          )}
        </div>

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
            <span>Base Internal Cost:</span>
            <span>{formatCurrency(baseIcTotal)}</span>
          </div>
          {includeManagementFee && (
            <div className="flex justify-between text-amber-700">
              <span>+ Management Fee ({managementFeePercent}%):</span>
              <span>{formatCurrency(managementFeeIc)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2">
            <span>Total Internal Cost:</span>
            <span>{formatCurrency(internalCostWithFee)}</span>
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