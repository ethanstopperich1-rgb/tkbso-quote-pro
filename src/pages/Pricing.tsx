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

// TKBSO Default Values - Updated Jan 2025
const TKBSO_DEFAULTS: Partial<PricingConfig> = {
  // Base Rates (no multipliers - use line items for scope variations)
  kitchen_ic_per_sqft: 128,
  kitchen_cp_per_sqft: 190,
  bath_ic_per_sqft: 245,
  bath_cp_per_sqft: 385,
  closet_ic_per_sqft: 55,
  closet_cp_per_sqft: 90,
  
  // Tile Labor
  tile_wall_ic_per_sqft: 20,
  tile_wall_cp_per_sqft: 39,
  tile_floor_ic_per_sqft: 5.5,
  tile_floor_cp_per_sqft: 12,
  tile_shower_floor_ic_per_sqft: 6,
  tile_shower_floor_cp_per_sqft: 14,
  cement_board_ic_per_sqft: 3,
  cement_board_cp_per_sqft: 5,
  waterproofing_ic_per_sqft: 6,
  waterproofing_cp_per_sqft: 13,
  
  // Demo Packages
  demo_shower_only_ic: 900,
  demo_shower_only_cp: 1450,
  demo_small_bath_ic: 1300,
  demo_small_bath_cp: 2050,
  demo_large_bath_ic: 1650,
  demo_large_bath_cp: 2500,
  demo_kitchen_ic: 1750,
  demo_kitchen_cp: 2800,
  
  // Plumbing Packages
  plumbing_shower_standard_ic: 2225,
  plumbing_shower_standard_cp: 3425,
  plumbing_extra_head_ic: 625,
  plumbing_extra_head_cp: 1100,
  plumbing_tub_freestanding_ic: 3300,
  plumbing_tub_freestanding_cp: 4800,
  plumbing_toilet_ic: 350,
  plumbing_toilet_cp: 690,
  
  // Electrical
  recessed_can_ic_each: 65,
  recessed_can_cp_each: 110,
  electrical_vanity_light_ic: 200,
  electrical_vanity_light_cp: 350,
  electrical_small_package_ic: 250,
  electrical_small_package_cp: 400,
  electrical_kitchen_package_ic: 950,
  electrical_kitchen_package_cp: 1750,
  
  // Paint & Drywall
  paint_patch_bath_ic: 800,
  paint_patch_bath_cp: 1300,
  paint_full_bath_ic: 1200,
  paint_full_bath_cp: 1900,
  
  // Shower Glass
  glass_shower_standard_ic: 1200,
  glass_shower_standard_cp: 2100,
  glass_panel_only_ic: 800,
  glass_panel_only_cp: 1450,
  frameless_glass_ic_per_sqft: 45,
  frameless_glass_cp_per_sqft: 75,
  
  // Vanities & Counters
  vanity_48_bundle_ic: 1600,
  vanity_48_bundle_cp: 2600,
  vanity_60_bundle_ic: 2200,
  vanity_60_bundle_cp: 3500,
  quartz_ic_per_sqft: 15,
  quartz_cp_per_sqft: 50,
  cabinet_markup_multiplier_no_gc: 1.28,
  cabinet_markup_multiplier_with_gc: 1.15,
  
  // Permits & GC
  gc_permit_fee_ic: 2500,
  gc_permit_fee_cp: 2500,
  
  // Material Allowances
  tile_material_allowance_cp_per_sqft: 7.85,
  plumbing_fixture_allowance_cp: 1350,
  mirror_lighting_allowance_cp: 800,
  
  // Payment Terms
  payment_split_deposit: 0.65,
  payment_split_progress: 0.25,
  payment_split_final: 0.10,
};

// Help text for each field
const FIELD_HELP: Record<string, string> = {
  kitchen_ic_per_sqft: 'Full gut kitchen IC: demo, cabinets, plumbing swap, electrical, quartz, backsplash, flooring patch',
  kitchen_cp_per_sqft: 'Client-facing price per sqft for full kitchen gut',
  bath_ic_per_sqft: 'Full gut bath IC: demo, tile-to-tile rebuild, waterproofing, vanity/fixtures, drywall/paint, flooring',
  bath_cp_per_sqft: 'Client-facing price per sqft for full bath gut',
  closet_ic_per_sqft: 'Closet buildout: drywall, patch, trim, shelving, lighting adjustments',
  closet_cp_per_sqft: 'Client price for closet work per sqft',
  tile_wall_ic_per_sqft: 'Wall tile install labor ($18-22/sqft range)',
  tile_wall_cp_per_sqft: 'Client price for wall tile ($36-42/sqft range)',
  tile_floor_ic_per_sqft: 'Main floor tile labor ($4.5-6.5/sqft range)',
  tile_floor_cp_per_sqft: 'Client price for floor tile ($10-14/sqft range)',
  tile_shower_floor_ic_per_sqft: 'Shower floor tile labor ($5-7/sqft range)',
  tile_shower_floor_cp_per_sqft: 'Client price for shower floor tile ($12-16/sqft range)',
  cement_board_ic_per_sqft: 'Backer board installation (labor + material)',
  cement_board_cp_per_sqft: 'Client price for cement board prep',
  waterproofing_ic_per_sqft: 'Membrane, corners, seam banding, pan integration, bonding flange',
  waterproofing_cp_per_sqft: 'Client price for waterproofing system ($12-14/sqft range)',
  quartz_ic_per_sqft: 'Fabrication + install cost for level 1 quartz',
  quartz_cp_per_sqft: 'Client price for quartz ($50/sqft + cutouts)',
  frameless_glass_ic_per_sqft: 'Frameless shower glass cost per sqft',
  frameless_glass_cp_per_sqft: 'Client price for frameless glass',
  recessed_can_ic_each: 'Cost per recessed light (labor + basic trim)',
  recessed_can_cp_each: 'Client price per recessed can',
  cabinet_markup_multiplier_no_gc: 'Cabinet markup when TKBSO manages project directly (1.28 = 28%)',
  cabinet_markup_multiplier_with_gc: 'Cabinet markup when working under a GC (1.15 = 15%)',
  gc_permit_fee_ic: 'Standard permit fee (IC = CP for permits)',
  gc_permit_fee_cp: 'Standard permit client price ($3,500-4,500 for multi-area)',
  min_job_ic: 'Minimum internal cost - jobs below rejected automatically',
  min_job_cp: 'Minimum client price - $15,000 floor',
  target_margin: 'Target gross margin (0.38 = 38%)',
  low_range_multiplier: 'Low end of estimate range (0.95 = -5%)',
  high_range_multiplier: 'High end of estimate range (1.05 = +5%)',
  demo_shower_only_ic: 'Shower demo: tear-out, haul off, site protection, disposal',
  demo_shower_only_cp: 'Client price for shower demo',
  demo_small_bath_ic: 'Small bath demo (5x8 or similar)',
  demo_small_bath_cp: 'Client price for small bath demo',
  demo_large_bath_ic: 'Large/primary bath demo',
  demo_large_bath_cp: 'Client price for large bath demo',
  demo_kitchen_ic: 'Full kitchen demo',
  demo_kitchen_cp: 'Client price for kitchen demo',
  plumbing_shower_standard_ic: 'Standard shower rough-in: drain upgrade to 2", valve move w/mixing valve, supply relocation, vent tie-in, pan drain assembly, pressure test',
  plumbing_shower_standard_cp: 'Client price for standard shower plumbing ($3,250-3,600 range)',
  plumbing_extra_head_ic: 'Extra shower head, diverter, or body spray ($550-700 range)',
  plumbing_extra_head_cp: 'Client price for extra head ($900-1,300 range)',
  plumbing_tub_freestanding_ic: 'Freestanding tub + filler package, includes slab trench/cut if applicable',
  plumbing_tub_freestanding_cp: 'Client price for freestanding tub install ($4,400-5,200 range)',
  plumbing_toilet_ic: 'Toilet simple swap internal cost',
  plumbing_toilet_cp: 'Client price for toilet swap ($650-725), relocation ($800-1,100)',
  electrical_vanity_light_ic: 'Vanity light rough-in and trim cost',
  electrical_vanity_light_cp: 'Client price per vanity light',
  electrical_small_package_ic: 'Basic switch/outlet refresh package',
  electrical_small_package_cp: 'Client price for small electrical package',
  electrical_kitchen_package_ic: 'Kitchen electrical (5-6 cans + switches/outlets)',
  electrical_kitchen_package_cp: 'Client price for kitchen electrical',
  paint_patch_bath_ic: 'Patch + touch-up only (disturbed areas)',
  paint_patch_bath_cp: 'Client price for patch work',
  paint_full_bath_ic: 'Full bath paint (walls, ceiling, trim)',
  paint_full_bath_cp: 'Client price for full paint',
  glass_shower_standard_ic: 'Door + panel combo ($1,200-1,500 for 90° return)',
  glass_shower_standard_cp: 'Client price for door + panel ($2,650-2,900 for 90° return)',
  glass_panel_only_ic: 'Single fixed panel only',
  glass_panel_only_cp: 'Client price for panel only',
  vanity_48_bundle_ic: '48" vanity + quartz top + sink (level 1)',
  vanity_48_bundle_cp: 'Client price for 48" vanity bundle',
  vanity_60_bundle_ic: '60" double vanity + quartz + 2 sinks',
  vanity_60_bundle_cp: 'Client price for 60" double bundle',
  tile_material_allowance_cp_per_sqft: 'Includes tile, grout, thinset, sealer ($7.5-8.25/sqft range)',
  plumbing_fixture_allowance_cp: 'Per bathroom: valve/trim, head, handheld, faucet or tub filler ($1,100-1,600 range)',
  mirror_lighting_allowance_cp: 'Mirror + lighting fixture allowance ($400-1,200 range)',
  payment_split_deposit: 'Deposit percentage (0.65 = 65%) - Bath/Kitchen standard',
  payment_split_progress: 'Progress payment percentage (0.25 = 25%)',
  payment_split_final: 'Final payment percentage (0.10 = 10%)',
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
            <TooltipContent side="top" className="max-w-[280px] text-xs">
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
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Bath CP/sqft</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(config.bath_cp_per_sqft)}
              </p>
              <p className="text-xs text-muted-foreground">Full gut rate</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Kitchen CP/sqft</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(config.kitchen_cp_per_sqft)}
              </p>
              <p className="text-xs text-muted-foreground">Full gut rate</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Closet CP/sqft</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(config.closet_cp_per_sqft)}
              </p>
              <p className="text-xs text-muted-foreground">Build/expansion</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collapsible Sections */}
      <div className="space-y-4">
        {/* Kitchen & Bath Base Rates */}
        <CollapsibleSection 
          title="Per-Sqft Base Rates" 
          description="Full gut remodel rates - use line items for scope variations"
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

        {/* Demo Packages */}
        <CollapsibleSection 
          title="Demo & Haul Away" 
          description="Fixed packages - never blend into other categories"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Shower Demo IC" field="demo_shower_only_ic" value={config.demo_shower_only_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Shower Demo CP" field="demo_shower_only_cp" value={config.demo_shower_only_cp} onChange={handleChange} prefix="$" />
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
          description="Always ask: slab or raised? fixture relocation? diverter count?"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Shower Rough-In IC" field="plumbing_shower_standard_ic" value={config.plumbing_shower_standard_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Shower Rough-In CP" field="plumbing_shower_standard_cp" value={config.plumbing_shower_standard_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Extra Head/Diverter IC" field="plumbing_extra_head_ic" value={config.plumbing_extra_head_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Extra Head/Diverter CP" field="plumbing_extra_head_cp" value={config.plumbing_extra_head_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Freestanding Tub IC" field="plumbing_tub_freestanding_ic" value={config.plumbing_tub_freestanding_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Freestanding Tub CP" field="plumbing_tub_freestanding_cp" value={config.plumbing_tub_freestanding_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Toilet Swap IC" field="plumbing_toilet_ic" value={config.plumbing_toilet_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Toilet Swap CP" field="plumbing_toilet_cp" value={config.plumbing_toilet_cp} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Tile & Waterproofing */}
        <CollapsibleSection 
          title="Tile Labor & Waterproofing" 
          description="Per-sqft rates - never include demo in tile"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Wall Tile IC/sqft" field="tile_wall_ic_per_sqft" value={config.tile_wall_ic_per_sqft} onChange={handleChange} step="0.5" prefix="$" />
            <PricingField label="Wall Tile CP/sqft" field="tile_wall_cp_per_sqft" value={config.tile_wall_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Shower Floor IC/sqft" field="tile_shower_floor_ic_per_sqft" value={config.tile_shower_floor_ic_per_sqft} onChange={handleChange} step="0.5" prefix="$" />
            <PricingField label="Shower Floor CP/sqft" field="tile_shower_floor_cp_per_sqft" value={config.tile_shower_floor_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Main Floor IC/sqft" field="tile_floor_ic_per_sqft" value={config.tile_floor_ic_per_sqft} onChange={handleChange} step="0.1" prefix="$" />
            <PricingField label="Main Floor CP/sqft" field="tile_floor_cp_per_sqft" value={config.tile_floor_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Cement Board IC/sqft" field="cement_board_ic_per_sqft" value={config.cement_board_ic_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Cement Board CP/sqft" field="cement_board_cp_per_sqft" value={config.cement_board_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Waterproofing IC/sqft" field="waterproofing_ic_per_sqft" value={config.waterproofing_ic_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Waterproofing CP/sqft" field="waterproofing_cp_per_sqft" value={config.waterproofing_cp_per_sqft} onChange={handleChange} prefix="$" />
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
            <PricingField label="Patch + Touch-Up IC" field="paint_patch_bath_ic" value={config.paint_patch_bath_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Patch + Touch-Up CP" field="paint_patch_bath_cp" value={config.paint_patch_bath_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Full Bath Paint IC" field="paint_full_bath_ic" value={config.paint_full_bath_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Full Bath Paint CP" field="paint_full_bath_cp" value={config.paint_full_bath_cp} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Glass */}
        <CollapsibleSection 
          title="Shower Glass" 
          description="Frameless glass packages - never use '$2,000 standard'"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Panel Only IC" field="glass_panel_only_ic" value={config.glass_panel_only_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Panel Only CP" field="glass_panel_only_cp" value={config.glass_panel_only_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Door + Panel IC" field="glass_shower_standard_ic" value={config.glass_shower_standard_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Door + Panel CP" field="glass_shower_standard_cp" value={config.glass_shower_standard_cp} onChange={handleChange} prefix="$" />
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
          description="Standard $2,500, multi-area $3,500-4,500"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="GC/Permit Fee IC" field="gc_permit_fee_ic" value={config.gc_permit_fee_ic} onChange={handleChange} prefix="$" />
            <PricingField label="GC/Permit Fee CP" field="gc_permit_fee_cp" value={config.gc_permit_fee_cp} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Material Allowances */}
        <CollapsibleSection 
          title="Material Allowances" 
          description="Client-facing allowances for materials not included in labor"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Tile Material CP/sqft" field="tile_material_allowance_cp_per_sqft" value={config.tile_material_allowance_cp_per_sqft ?? 7.85} onChange={handleChange} step="0.25" prefix="$" />
            <PricingField label="Plumbing Fixtures/Bath CP" field="plumbing_fixture_allowance_cp" value={config.plumbing_fixture_allowance_cp ?? 1350} onChange={handleChange} prefix="$" />
            <PricingField label="Mirror + Lighting CP" field="mirror_lighting_allowance_cp" value={config.mirror_lighting_allowance_cp ?? 800} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Payment Terms */}
        <CollapsibleSection 
          title="Payment Terms" 
          description="Bath/Kitchen: 65/25/10 | Closet/Minor: 50/40/10"
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
