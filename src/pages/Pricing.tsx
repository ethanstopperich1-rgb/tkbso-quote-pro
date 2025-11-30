import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PricingConfig } from '@/types/database';
import { formatCurrency, formatPercentage } from '@/lib/pricing-calculator';
import { Save, RefreshCw, RotateCcw, HelpCircle, ChevronDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

// TKBSO Default Values - matches tkbso-pricing.ts
const TKBSO_DEFAULTS: Partial<PricingConfig> = {
  kitchen_ic_per_sqft: 120,
  kitchen_cp_per_sqft: 185,
  kitchen_partial_multiplier: 0.60,
  kitchen_refresh_multiplier: 0.40,
  bath_ic_per_sqft: 240,
  bath_cp_per_sqft: 370,
  bath_shower_only_multiplier: 0.60,
  bath_partial_multiplier: 0.75,
  bath_refresh_multiplier: 0.50,
  closet_ic_per_sqft: 45,
  closet_cp_per_sqft: 75,
  tile_wall_ic_per_sqft: 21,
  tile_wall_cp_per_sqft: 35,
  tile_floor_ic_per_sqft: 4.5,
  tile_floor_cp_per_sqft: 8,
  tile_shower_floor_ic_per_sqft: 5,
  tile_shower_floor_cp_per_sqft: 9,
  cement_board_ic_per_sqft: 3,
  cement_board_cp_per_sqft: 5,
  waterproofing_ic_per_sqft: 5,
  waterproofing_cp_per_sqft: 8,
  quartz_ic_per_sqft: 15,
  quartz_cp_per_sqft: 28,
  frameless_glass_ic_per_sqft: 45,
  frameless_glass_cp_per_sqft: 75,
  recessed_can_ic_each: 65,
  recessed_can_cp_each: 110,
  cabinet_markup_multiplier_no_gc: 1.28,
  cabinet_markup_multiplier_with_gc: 1.15,
  gc_permit_fee_ic: 2500,
  gc_permit_fee_cp: 2500,
  min_job_ic: 8000,
  min_job_cp: 13000,
  target_margin: 0.38,
  low_range_multiplier: 0.95,
  high_range_multiplier: 1.05,
  demo_shower_only_ic: 800,
  demo_shower_only_cp: 1300,
  demo_small_bath_ic: 1100,
  demo_small_bath_cp: 1800,
  demo_large_bath_ic: 1500,
  demo_large_bath_cp: 2400,
  demo_kitchen_ic: 1400,
  demo_kitchen_cp: 2250,
  plumbing_shower_standard_ic: 1800,
  plumbing_shower_standard_cp: 2900,
  plumbing_extra_head_ic: 450,
  plumbing_extra_head_cp: 725,
  plumbing_tub_freestanding_ic: 2400,
  plumbing_tub_freestanding_cp: 3900,
  plumbing_toilet_ic: 350,
  plumbing_toilet_cp: 565,
  electrical_vanity_light_ic: 200,
  electrical_vanity_light_cp: 325,
  electrical_small_package_ic: 250,
  electrical_small_package_cp: 400,
  electrical_kitchen_package_ic: 950,
  electrical_kitchen_package_cp: 1550,
  paint_patch_bath_ic: 600,
  paint_patch_bath_cp: 1000,
  paint_full_bath_ic: 1000,
  paint_full_bath_cp: 1600,
  glass_shower_standard_ic: 1200,
  glass_shower_standard_cp: 2000,
  glass_panel_only_ic: 800,
  glass_panel_only_cp: 1300,
  vanity_48_bundle_ic: 1600,
  vanity_48_bundle_cp: 2600,
  vanity_60_bundle_ic: 2200,
  vanity_60_bundle_cp: 3500,
  payment_split_deposit: 0.65,
  payment_split_progress: 0.25,
  payment_split_final: 0.10,
};

// Help text for each field
const FIELD_HELP: Record<string, string> = {
  kitchen_ic_per_sqft: 'Internal cost per square foot for full kitchen gut remodel',
  kitchen_cp_per_sqft: 'Client-facing price per square foot. Target: $175-195',
  kitchen_partial_multiplier: 'Multiplier for partial kitchen work (cabinets + counters only)',
  kitchen_refresh_multiplier: 'Multiplier for refresh (paint, hardware, minor updates)',
  bath_ic_per_sqft: 'Internal cost per square foot for full bathroom gut',
  bath_cp_per_sqft: 'Client-facing price per square foot. Target: $360-380',
  bath_shower_only_multiplier: 'Multiplier when only doing shower conversion',
  bath_partial_multiplier: 'Multiplier for partial bathroom work',
  bath_refresh_multiplier: 'Multiplier for bathroom refresh (paint, fixtures only)',
  closet_ic_per_sqft: 'Internal cost for custom closet buildout per sqft',
  closet_cp_per_sqft: 'Client price for closet work per sqft',
  tile_wall_ic_per_sqft: 'What you pay subs for wall/shower tile labor',
  tile_wall_cp_per_sqft: 'Client price for wall tile installation',
  tile_floor_ic_per_sqft: 'Sub cost for main bathroom floor tile',
  tile_floor_cp_per_sqft: 'Client price for floor tile installation',
  tile_shower_floor_ic_per_sqft: 'Sub cost for shower floor tile (pan area)',
  tile_shower_floor_cp_per_sqft: 'Client price for shower floor tile',
  cement_board_ic_per_sqft: 'Backer board installation cost (labor + material)',
  cement_board_cp_per_sqft: 'Client price for cement board prep',
  waterproofing_ic_per_sqft: 'Schluter or membrane system (labor + material)',
  waterproofing_cp_per_sqft: 'Client price for waterproofing',
  quartz_ic_per_sqft: 'Fabrication + install cost for level 1 quartz',
  quartz_cp_per_sqft: 'Client price for quartz countertops',
  frameless_glass_ic_per_sqft: 'Frameless shower glass cost per sqft',
  frameless_glass_cp_per_sqft: 'Client price for frameless glass',
  recessed_can_ic_each: 'Cost per recessed light (labor + basic trim)',
  recessed_can_cp_each: 'Client price per recessed can',
  cabinet_markup_multiplier_no_gc: 'Cabinet markup when TKBSO manages project directly',
  cabinet_markup_multiplier_with_gc: 'Cabinet markup when working under a GC',
  gc_permit_fee_ic: 'GC partner + permit cost when permits required',
  gc_permit_fee_cp: 'Client price for GC/permit services',
  min_job_ic: 'Minimum internal cost floor for any job',
  min_job_cp: 'Minimum client price (protect small job margins)',
  target_margin: 'Target gross margin (0.38 = 38%). Baths: 38-42%, Kitchens: 35-40%',
  low_range_multiplier: 'Low end of estimate range (e.g., 0.95 = -5%)',
  high_range_multiplier: 'High end of estimate range (e.g., 1.05 = +5%)',
  demo_shower_only_ic: 'Demo cost for shower-only tearout',
  demo_shower_only_cp: 'Client price for shower demo',
  demo_small_bath_ic: 'Demo cost for small/hall bath (5x8)',
  demo_small_bath_cp: 'Client price for small bath demo',
  demo_large_bath_ic: 'Demo cost for larger primary baths',
  demo_large_bath_cp: 'Client price for large bath demo',
  demo_kitchen_ic: 'Demo cost for full kitchen tearout',
  demo_kitchen_cp: 'Client price for kitchen demo',
  plumbing_shower_standard_ic: 'Standard shower rough-in (valve, pan, drain, trim)',
  plumbing_shower_standard_cp: 'Client price for standard shower plumbing',
  plumbing_extra_head_ic: 'Add-on for handheld or extra showerhead',
  plumbing_extra_head_cp: 'Client price for extra head',
  plumbing_tub_freestanding_ic: 'Freestanding tub + filler rough & set',
  plumbing_tub_freestanding_cp: 'Client price for freestanding tub install',
  plumbing_toilet_ic: 'Toilet set + materials allowance',
  plumbing_toilet_cp: 'Client price for toilet install',
  electrical_vanity_light_ic: 'Vanity light rough-in and trim cost',
  electrical_vanity_light_cp: 'Client price per vanity light',
  electrical_small_package_ic: 'Basic switch/outlet refresh package',
  electrical_small_package_cp: 'Client price for small electrical package',
  electrical_kitchen_package_ic: 'Kitchen electrical (5-6 cans + switches/outlets)',
  electrical_kitchen_package_cp: 'Client price for kitchen electrical',
  paint_patch_bath_ic: 'Patch + texture only (disturbed areas)',
  paint_patch_bath_cp: 'Client price for patch work',
  paint_full_bath_ic: 'Full bath paint (walls, ceiling, trim)',
  paint_full_bath_cp: 'Client price for full paint',
  glass_shower_standard_ic: 'Standard frameless door + panel combo',
  glass_shower_standard_cp: 'Client price for standard glass enclosure',
  glass_panel_only_ic: 'Single fixed panel only',
  glass_panel_only_cp: 'Client price for panel only',
  vanity_48_bundle_ic: '48" vanity + quartz top + sink (level 1)',
  vanity_48_bundle_cp: 'Client price for 48" vanity bundle',
  vanity_60_bundle_ic: '60" double vanity + quartz + 2 sinks',
  vanity_60_bundle_cp: 'Client price for 60" double bundle',
  payment_split_deposit: 'Deposit percentage (e.g., 0.65 = 65%)',
  payment_split_progress: 'Progress payment percentage (e.g., 0.25 = 25%)',
  payment_split_final: 'Final payment percentage (e.g., 0.10 = 10%)',
};

interface PricingFieldProps {
  label: string;
  field: keyof PricingConfig;
  value: number;
  onChange: (field: keyof PricingConfig, value: string) => void;
  step?: string;
  prefix?: string;
  suffix?: string;
}

function PricingField({ label, field, value, onChange, step = '1', prefix, suffix }: PricingFieldProps) {
  const helpText = FIELD_HELP[field];
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={field} className="text-sm">{label}</Label>
        {helpText && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[250px] text-xs">
              {helpText}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <Input
          id={field}
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          className={cn(prefix && 'pl-7', suffix && 'pr-12')}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  description: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, description, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg">
            <div className="text-left">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ChevronDown className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

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

  const handleResetToDefaults = () => {
    if (!config) return;
    setConfig({
      ...config,
      ...TKBSO_DEFAULTS,
    });
    toast.success('Reset to TKBSO defaults. Remember to save!');
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
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-display">Pricing & Allowances</h1>
          <p className="text-muted-foreground mt-1">Configure your standard cost and price rates</p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset to TKBSO Defaults?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all pricing values to the standard TKBSO rates. Your current values will be replaced, but you'll need to click "Save" to persist the changes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetToDefaults}>
                  Reset Values
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="mb-6 bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Bath CP/sqft</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(config.bath_cp_per_sqft)}
              </p>
              <p className="text-xs text-muted-foreground">Target: $360-380</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Kitchen CP/sqft</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(config.kitchen_cp_per_sqft)}
              </p>
              <p className="text-xs text-muted-foreground">Target: $175-195</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Target Margin</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatPercentage(config.target_margin)}
              </p>
              <p className="text-xs text-muted-foreground">~38% recommended</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Min Job</p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(config.min_job_cp)}
              </p>
              <p className="text-xs text-muted-foreground">Client minimum</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collapsible Sections */}
      <div className="space-y-4">
        {/* Kitchen & Bath Base Rates */}
        <CollapsibleSection 
          title="Kitchen & Bath Base Rates" 
          description="Per-square-foot pricing for full gut remodels"
          defaultOpen={true}
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Kitchen IC/sqft" field="kitchen_ic_per_sqft" value={config.kitchen_ic_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Kitchen CP/sqft" field="kitchen_cp_per_sqft" value={config.kitchen_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Bath IC/sqft" field="bath_ic_per_sqft" value={config.bath_ic_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Bath CP/sqft" field="bath_cp_per_sqft" value={config.bath_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Closet IC/sqft" field="closet_ic_per_sqft" value={config.closet_ic_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Closet CP/sqft" field="closet_cp_per_sqft" value={config.closet_cp_per_sqft} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Scope Multipliers */}
        <CollapsibleSection 
          title="Scope Multipliers" 
          description="Adjust pricing for partial vs full remodels"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Kitchen Partial" field="kitchen_partial_multiplier" value={config.kitchen_partial_multiplier} onChange={handleChange} step="0.01" suffix="×" />
            <PricingField label="Kitchen Refresh" field="kitchen_refresh_multiplier" value={config.kitchen_refresh_multiplier} onChange={handleChange} step="0.01" suffix="×" />
            <PricingField label="Bath Shower-Only" field="bath_shower_only_multiplier" value={config.bath_shower_only_multiplier} onChange={handleChange} step="0.01" suffix="×" />
            <PricingField label="Bath Partial" field="bath_partial_multiplier" value={config.bath_partial_multiplier} onChange={handleChange} step="0.01" suffix="×" />
            <PricingField label="Bath Refresh" field="bath_refresh_multiplier" value={config.bath_refresh_multiplier} onChange={handleChange} step="0.01" suffix="×" />
          </div>
        </CollapsibleSection>

        {/* Tile & Backer */}
        <CollapsibleSection 
          title="Tile & Backer Labor" 
          description="Per-sqft rates for tile installation"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Wall Tile IC/sqft" field="tile_wall_ic_per_sqft" value={config.tile_wall_ic_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Wall Tile CP/sqft" field="tile_wall_cp_per_sqft" value={config.tile_wall_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Floor Tile IC/sqft" field="tile_floor_ic_per_sqft" value={config.tile_floor_ic_per_sqft} onChange={handleChange} step="0.1" prefix="$" />
            <PricingField label="Floor Tile CP/sqft" field="tile_floor_cp_per_sqft" value={config.tile_floor_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Shower Floor IC/sqft" field="tile_shower_floor_ic_per_sqft" value={config.tile_shower_floor_ic_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Shower Floor CP/sqft" field="tile_shower_floor_cp_per_sqft" value={config.tile_shower_floor_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Cement Board IC/sqft" field="cement_board_ic_per_sqft" value={config.cement_board_ic_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Cement Board CP/sqft" field="cement_board_cp_per_sqft" value={config.cement_board_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Waterproofing IC/sqft" field="waterproofing_ic_per_sqft" value={config.waterproofing_ic_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Waterproofing CP/sqft" field="waterproofing_cp_per_sqft" value={config.waterproofing_cp_per_sqft} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Demo Packages */}
        <CollapsibleSection 
          title="Demo & Haul Away" 
          description="Fixed packages for demolition work"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Shower-Only Demo IC" field="demo_shower_only_ic" value={config.demo_shower_only_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Shower-Only Demo CP" field="demo_shower_only_cp" value={config.demo_shower_only_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Small Bath Demo IC" field="demo_small_bath_ic" value={config.demo_small_bath_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Small Bath Demo CP" field="demo_small_bath_cp" value={config.demo_small_bath_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Large Bath Demo IC" field="demo_large_bath_ic" value={config.demo_large_bath_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Large Bath Demo CP" field="demo_large_bath_cp" value={config.demo_large_bath_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Kitchen Demo IC" field="demo_kitchen_ic" value={config.demo_kitchen_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Kitchen Demo CP" field="demo_kitchen_cp" value={config.demo_kitchen_cp} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Plumbing */}
        <CollapsibleSection 
          title="Plumbing Packages" 
          description="Fixed packages for plumbing rough-in and trim"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Shower Standard IC" field="plumbing_shower_standard_ic" value={config.plumbing_shower_standard_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Shower Standard CP" field="plumbing_shower_standard_cp" value={config.plumbing_shower_standard_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Extra Head IC" field="plumbing_extra_head_ic" value={config.plumbing_extra_head_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Extra Head CP" field="plumbing_extra_head_cp" value={config.plumbing_extra_head_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Tub Freestanding IC" field="plumbing_tub_freestanding_ic" value={config.plumbing_tub_freestanding_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Tub Freestanding CP" field="plumbing_tub_freestanding_cp" value={config.plumbing_tub_freestanding_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Toilet IC" field="plumbing_toilet_ic" value={config.plumbing_toilet_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Toilet CP" field="plumbing_toilet_cp" value={config.plumbing_toilet_cp} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Electrical */}
        <CollapsibleSection 
          title="Electrical Packages" 
          description="Lighting and electrical rough-in rates"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Recessed Can IC (each)" field="recessed_can_ic_each" value={config.recessed_can_ic_each} onChange={handleChange} prefix="$" />
            <PricingField label="Recessed Can CP (each)" field="recessed_can_cp_each" value={config.recessed_can_cp_each} onChange={handleChange} prefix="$" />
            <PricingField label="Vanity Light IC" field="electrical_vanity_light_ic" value={config.electrical_vanity_light_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Vanity Light CP" field="electrical_vanity_light_cp" value={config.electrical_vanity_light_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Small Package IC" field="electrical_small_package_ic" value={config.electrical_small_package_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Small Package CP" field="electrical_small_package_cp" value={config.electrical_small_package_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Kitchen Package IC" field="electrical_kitchen_package_ic" value={config.electrical_kitchen_package_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Kitchen Package CP" field="electrical_kitchen_package_cp" value={config.electrical_kitchen_package_cp} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Paint */}
        <CollapsibleSection 
          title="Paint & Drywall" 
          description="Paint and patch packages"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Patch Bath IC" field="paint_patch_bath_ic" value={config.paint_patch_bath_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Patch Bath CP" field="paint_patch_bath_cp" value={config.paint_patch_bath_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Full Bath IC" field="paint_full_bath_ic" value={config.paint_full_bath_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Full Bath CP" field="paint_full_bath_cp" value={config.paint_full_bath_cp} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Glass */}
        <CollapsibleSection 
          title="Shower Glass" 
          description="Frameless glass enclosure packages"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Standard Glass IC" field="glass_shower_standard_ic" value={config.glass_shower_standard_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Standard Glass CP" field="glass_shower_standard_cp" value={config.glass_shower_standard_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Panel Only IC" field="glass_panel_only_ic" value={config.glass_panel_only_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Panel Only CP" field="glass_panel_only_cp" value={config.glass_panel_only_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Frameless IC/sqft" field="frameless_glass_ic_per_sqft" value={config.frameless_glass_ic_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Frameless CP/sqft" field="frameless_glass_cp_per_sqft" value={config.frameless_glass_cp_per_sqft} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Vanities & Counters */}
        <CollapsibleSection 
          title="Vanities & Counters" 
          description="Vanity bundles and quartz rates"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label='48" Vanity Bundle IC' field="vanity_48_bundle_ic" value={config.vanity_48_bundle_ic} onChange={handleChange} prefix="$" />
            <PricingField label='48" Vanity Bundle CP' field="vanity_48_bundle_cp" value={config.vanity_48_bundle_cp} onChange={handleChange} prefix="$" />
            <PricingField label='60" Double Bundle IC' field="vanity_60_bundle_ic" value={config.vanity_60_bundle_ic} onChange={handleChange} prefix="$" />
            <PricingField label='60" Double Bundle CP' field="vanity_60_bundle_cp" value={config.vanity_60_bundle_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Quartz IC/sqft" field="quartz_ic_per_sqft" value={config.quartz_ic_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Quartz CP/sqft" field="quartz_cp_per_sqft" value={config.quartz_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Cabinet Markup (No GC)" field="cabinet_markup_multiplier_no_gc" value={config.cabinet_markup_multiplier_no_gc} onChange={handleChange} step="0.01" suffix="×" />
            <PricingField label="Cabinet Markup (With GC)" field="cabinet_markup_multiplier_with_gc" value={config.cabinet_markup_multiplier_with_gc} onChange={handleChange} step="0.01" suffix="×" />
          </div>
        </CollapsibleSection>

        {/* GC & Permits */}
        <CollapsibleSection 
          title="Permits & GC" 
          description="General contractor and permit fees"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="GC/Permit Fee IC" field="gc_permit_fee_ic" value={config.gc_permit_fee_ic} onChange={handleChange} prefix="$" />
            <PricingField label="GC/Permit Fee CP" field="gc_permit_fee_cp" value={config.gc_permit_fee_cp} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Minimums & Margins */}
        <CollapsibleSection 
          title="Minimums, Margins & Range" 
          description="Job minimums and estimate range settings"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Min Job IC" field="min_job_ic" value={config.min_job_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Min Job CP" field="min_job_cp" value={config.min_job_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Target Margin" field="target_margin" value={config.target_margin} onChange={handleChange} step="0.01" />
            <PricingField label="Low Range Multiplier" field="low_range_multiplier" value={config.low_range_multiplier} onChange={handleChange} step="0.01" suffix="×" />
            <PricingField label="High Range Multiplier" field="high_range_multiplier" value={config.high_range_multiplier} onChange={handleChange} step="0.01" suffix="×" />
          </div>
        </CollapsibleSection>

        {/* Payment Terms */}
        <CollapsibleSection 
          title="Payment Terms" 
          description="Payment split percentages (must total 100%)"
        >
          <div className="grid md:grid-cols-3 gap-x-6 gap-y-4">
            <PricingField label="Deposit %" field="payment_split_deposit" value={config.payment_split_deposit} onChange={handleChange} step="0.01" />
            <PricingField label="Progress %" field="payment_split_progress" value={config.payment_split_progress} onChange={handleChange} step="0.01" />
            <PricingField label="Final %" field="payment_split_final" value={config.payment_split_final} onChange={handleChange} step="0.01" />
          </div>
          {Math.abs((config.payment_split_deposit + config.payment_split_progress + config.payment_split_final) - 1) > 0.001 && (
            <p className="text-sm text-destructive mt-2">
              Warning: Payment splits should total 100% (currently {((config.payment_split_deposit + config.payment_split_progress + config.payment_split_final) * 100).toFixed(0)}%)
            </p>
          )}
        </CollapsibleSection>
      </div>

      {/* Sticky Save Footer */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t mt-8 -mx-8 px-8 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Changes are saved to your contractor profile
          </p>
          <Button onClick={handleSave} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
