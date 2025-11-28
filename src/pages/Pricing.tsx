import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PricingConfig } from '@/types/database';
import { formatCurrency, formatPercentage } from '@/lib/pricing-calculator';
import { Save, RefreshCw } from 'lucide-react';

export default function Pricing() {
  const { contractor } = useAuth();
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      if (!contractor) return;
      
      const { data, error } = await supabase
        .from('pricing_configs')
        .select('*')
        .eq('contractor_id', contractor.id)
        .single();
      
      if (error) {
        toast.error('Failed to load pricing config');
      } else {
        setConfig(data as PricingConfig);
      }
      setLoading(false);
    }
    
    fetchConfig();
  }, [contractor]);

  const handleChange = (field: keyof PricingConfig, value: string) => {
    if (!config) return;
    setConfig({
      ...config,
      [field]: parseFloat(value) || 0,
    });
  };

  const handleSave = async () => {
    if (!config || !contractor) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('pricing_configs')
      .update(config)
      .eq('id', config.id);
    
    setSaving(false);
    
    if (error) {
      toast.error('Failed to save changes');
    } else {
      toast.success('Pricing configuration saved!');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">No pricing configuration found.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-display">Pricing & Allowances</h1>
          <p className="text-muted-foreground mt-1">Configure your standard cost and price rates</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Bath CP/sqft</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(config.bath_cp_per_sqft)}/sqft
              </p>
              <p className="text-xs text-muted-foreground">Target: $360-380</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kitchen CP/sqft</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(config.kitchen_cp_per_sqft)}/sqft
              </p>
              <p className="text-xs text-muted-foreground">Target: $175-195</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Target Margin</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatPercentage(config.target_margin)}
              </p>
              <p className="text-xs text-muted-foreground">~38% recommended</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Kitchen & Bath Per-Sqft */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kitchen & Bath Base Rates</CardTitle>
            <CardDescription>Per-square-foot pricing for full gut remodels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kitchen IC/sqft</Label>
                <Input
                  type="number"
                  value={config.kitchen_ic_per_sqft}
                  onChange={(e) => handleChange('kitchen_ic_per_sqft', e.target.value)}
                />
              </div>
              <div>
                <Label>Kitchen CP/sqft</Label>
                <Input
                  type="number"
                  value={config.kitchen_cp_per_sqft}
                  onChange={(e) => handleChange('kitchen_cp_per_sqft', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bath IC/sqft</Label>
                <Input
                  type="number"
                  value={config.bath_ic_per_sqft}
                  onChange={(e) => handleChange('bath_ic_per_sqft', e.target.value)}
                />
              </div>
              <div>
                <Label>Bath CP/sqft</Label>
                <Input
                  type="number"
                  value={config.bath_cp_per_sqft}
                  onChange={(e) => handleChange('bath_cp_per_sqft', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Closet IC/sqft</Label>
                <Input
                  type="number"
                  value={config.closet_ic_per_sqft}
                  onChange={(e) => handleChange('closet_ic_per_sqft', e.target.value)}
                />
              </div>
              <div>
                <Label>Closet CP/sqft</Label>
                <Input
                  type="number"
                  value={config.closet_cp_per_sqft}
                  onChange={(e) => handleChange('closet_cp_per_sqft', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scope Multipliers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scope Multipliers</CardTitle>
            <CardDescription>Adjust pricing for partial vs full remodels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Kitchen Partial</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.kitchen_partial_multiplier}
                  onChange={(e) => handleChange('kitchen_partial_multiplier', e.target.value)}
                />
              </div>
              <div>
                <Label>Kitchen Refresh</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.kitchen_refresh_multiplier}
                  onChange={(e) => handleChange('kitchen_refresh_multiplier', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bath Partial</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.bath_partial_multiplier}
                  onChange={(e) => handleChange('bath_partial_multiplier', e.target.value)}
                />
              </div>
              <div>
                <Label>Bath Shower-Only</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.bath_shower_only_multiplier}
                  onChange={(e) => handleChange('bath_shower_only_multiplier', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Bath Refresh</Label>
              <Input
                type="number"
                step="0.01"
                value={config.bath_refresh_multiplier}
                onChange={(e) => handleChange('bath_refresh_multiplier', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tile & Backer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tile & Backer Labor</CardTitle>
            <CardDescription>Per-sqft rates for tile installation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Wall Tile IC/sqft</Label>
                <Input
                  type="number"
                  value={config.tile_wall_ic_per_sqft}
                  onChange={(e) => handleChange('tile_wall_ic_per_sqft', e.target.value)}
                />
              </div>
              <div>
                <Label>Wall Tile CP/sqft</Label>
                <Input
                  type="number"
                  value={config.tile_wall_cp_per_sqft}
                  onChange={(e) => handleChange('tile_wall_cp_per_sqft', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Floor Tile IC/sqft</Label>
                <Input
                  type="number"
                  value={config.tile_floor_ic_per_sqft}
                  onChange={(e) => handleChange('tile_floor_ic_per_sqft', e.target.value)}
                />
              </div>
              <div>
                <Label>Floor Tile CP/sqft</Label>
                <Input
                  type="number"
                  value={config.tile_floor_cp_per_sqft}
                  onChange={(e) => handleChange('tile_floor_cp_per_sqft', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Shower Floor IC/sqft</Label>
                <Input
                  type="number"
                  value={config.tile_shower_floor_ic_per_sqft}
                  onChange={(e) => handleChange('tile_shower_floor_ic_per_sqft', e.target.value)}
                />
              </div>
              <div>
                <Label>Shower Floor CP/sqft</Label>
                <Input
                  type="number"
                  value={config.tile_shower_floor_cp_per_sqft}
                  onChange={(e) => handleChange('tile_shower_floor_cp_per_sqft', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cement Board IC/sqft</Label>
                <Input
                  type="number"
                  value={config.cement_board_ic_per_sqft}
                  onChange={(e) => handleChange('cement_board_ic_per_sqft', e.target.value)}
                />
              </div>
              <div>
                <Label>Cement Board CP/sqft</Label>
                <Input
                  type="number"
                  value={config.cement_board_cp_per_sqft}
                  onChange={(e) => handleChange('cement_board_cp_per_sqft', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Counters & Cabinets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Counters & Cabinets</CardTitle>
            <CardDescription>Quartz and cabinet markup rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quartz IC/sqft</Label>
                <Input
                  type="number"
                  value={config.quartz_ic_per_sqft}
                  onChange={(e) => handleChange('quartz_ic_per_sqft', e.target.value)}
                />
              </div>
              <div>
                <Label>Quartz CP/sqft</Label>
                <Input
                  type="number"
                  value={config.quartz_cp_per_sqft}
                  onChange={(e) => handleChange('quartz_cp_per_sqft', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cabinet Markup (No GC)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.cabinet_markup_multiplier_no_gc}
                  onChange={(e) => handleChange('cabinet_markup_multiplier_no_gc', e.target.value)}
                />
              </div>
              <div>
                <Label>Cabinet Markup (With GC)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.cabinet_markup_multiplier_with_gc}
                  onChange={(e) => handleChange('cabinet_markup_multiplier_with_gc', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Glass & Lighting */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Glass & Lighting</CardTitle>
            <CardDescription>Shower glass and recessed lighting rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frameless Glass IC/sqft</Label>
                <Input
                  type="number"
                  value={config.frameless_glass_ic_per_sqft}
                  onChange={(e) => handleChange('frameless_glass_ic_per_sqft', e.target.value)}
                />
              </div>
              <div>
                <Label>Frameless Glass CP/sqft</Label>
                <Input
                  type="number"
                  value={config.frameless_glass_cp_per_sqft}
                  onChange={(e) => handleChange('frameless_glass_cp_per_sqft', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Recessed Can IC/each</Label>
                <Input
                  type="number"
                  value={config.recessed_can_ic_each}
                  onChange={(e) => handleChange('recessed_can_ic_each', e.target.value)}
                />
              </div>
              <div>
                <Label>Recessed Can CP/each</Label>
                <Input
                  type="number"
                  value={config.recessed_can_cp_each}
                  onChange={(e) => handleChange('recessed_can_cp_each', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GC & Permits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Permits & GC</CardTitle>
            <CardDescription>General contractor and permit fees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>GC/Permit Fee IC</Label>
                <Input
                  type="number"
                  value={config.gc_permit_fee_ic}
                  onChange={(e) => handleChange('gc_permit_fee_ic', e.target.value)}
                />
              </div>
              <div>
                <Label>GC/Permit Fee CP</Label>
                <Input
                  type="number"
                  value={config.gc_permit_fee_cp}
                  onChange={(e) => handleChange('gc_permit_fee_cp', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Minimums & Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Minimums & Range</CardTitle>
            <CardDescription>Job minimums and estimate range settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Job IC</Label>
                <Input
                  type="number"
                  value={config.min_job_ic}
                  onChange={(e) => handleChange('min_job_ic', e.target.value)}
                />
              </div>
              <div>
                <Label>Min Job CP</Label>
                <Input
                  type="number"
                  value={config.min_job_cp}
                  onChange={(e) => handleChange('min_job_cp', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Target Margin</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.target_margin}
                  onChange={(e) => handleChange('target_margin', e.target.value)}
                />
              </div>
              <div>
                <Label>Low Range ×</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.low_range_multiplier}
                  onChange={(e) => handleChange('low_range_multiplier', e.target.value)}
                />
              </div>
              <div>
                <Label>High Range ×</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config.high_range_multiplier}
                  onChange={(e) => handleChange('high_range_multiplier', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button at Bottom */}
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
}
