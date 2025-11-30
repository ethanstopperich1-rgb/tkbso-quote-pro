import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PricingConfig } from '@/types/database';
import { formatCurrency } from '@/lib/pricing-calculator';
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
  
  // LVP & Barrier Flooring
  lvp_ic_per_sqft: 2.5,
  lvp_cp_per_sqft: 4.5,
  barrier_ic_per_sqft: 1.0,
  barrier_cp_per_sqft: 2.0,
  
  // Demo Packages
  demo_shower_only_ic: 900,
  demo_shower_only_cp: 1450,
  demo_small_bath_ic: 1300,
  demo_small_bath_cp: 2050,
  demo_large_bath_ic: 1650,
  demo_large_bath_cp: 2500,
  demo_kitchen_ic: 1750,
  demo_kitchen_cp: 2800,
  
  // Plumbing Packages (all in one)
  plumbing_shower_standard_ic: 2225,
  plumbing_shower_standard_cp: 3425,
  plumbing_extra_head_ic: 625,
  plumbing_extra_head_cp: 1100,
  plumbing_tub_freestanding_ic: 3300,
  plumbing_tub_freestanding_cp: 4800,
  plumbing_toilet_ic: 350,
  plumbing_toilet_cp: 690,
  plumbing_tub_to_shower_ic: 2550,
  plumbing_tub_to_shower_cp: 4200,
  plumbing_smart_valve_ic: 1350,
  plumbing_smart_valve_cp: 2450,
  plumbing_linear_drain_ic: 750,
  plumbing_linear_drain_cp: 1550,
  plumbing_toilet_relocation_cp: 950,
  
  // Electrical (all in one)
  recessed_can_ic_each: 65,
  recessed_can_cp_each: 110,
  electrical_vanity_light_ic: 200,
  electrical_vanity_light_cp: 350,
  electrical_small_package_ic: 250,
  electrical_small_package_cp: 400,
  electrical_kitchen_package_ic: 950,
  electrical_kitchen_package_cp: 1750,
  electrical_microwave_circuit_cp: 550,
  electrical_hood_relocation_cp: 550,
  electrical_dishwasher_disposal_cp: 465,
  
  // Paint & Drywall
  paint_patch_bath_ic: 800,
  paint_patch_bath_cp: 1300,
  paint_full_bath_ic: 1200,
  paint_full_bath_cp: 1900,
  
  // Shower Glass (fixed packages only)
  glass_shower_standard_ic: 1200,
  glass_shower_standard_cp: 2100,
  glass_panel_only_ic: 800,
  glass_panel_only_cp: 1450,
  glass_90_return_ic: 1425,
  glass_90_return_cp: 2775,
  
  // Vanity Bundles - All Sizes
  vanity_30_bundle_ic: 1100,
  vanity_30_bundle_cp: 1800,
  vanity_36_bundle_ic: 1300,
  vanity_36_bundle_cp: 2100,
  vanity_48_bundle_ic: 1600,
  vanity_48_bundle_cp: 2600,
  vanity_54_bundle_ic: 1900,
  vanity_54_bundle_cp: 3000,
  vanity_60_bundle_ic: 2200,
  vanity_60_bundle_cp: 3500,
  vanity_72_bundle_ic: 2600,
  vanity_72_bundle_cp: 4200,
  vanity_84_bundle_ic: 3200,
  vanity_84_bundle_cp: 5000,
  
  // Quartz & Counters
  quartz_ic_per_sqft: 15,
  quartz_cp_per_sqft: 50,
  quartz_slab_level1_allowance_cp: 1000,
  
  // Material Allowances (client-facing)
  tile_material_allowance_cp_per_sqft: 7.85,
  plumbing_fixture_allowance_cp: 1350,
  mirror_allowance_cp: 500,
  lighting_fixture_allowance_cp: 400,
  hardware_allowance_per_pull_cp: 15,
  toilet_allowance_cp: 450,
  sink_faucet_allowance_cp: 350,
  tub_allowance_cp: 800,
  shower_trim_kit_allowance_cp: 450,
  tub_filler_allowance_cp: 650,
  kitchen_faucet_allowance_cp: 400,
  garbage_disposal_allowance_cp: 250,
  freestanding_tub_allowance_cp: 2500,
  
  // Dumpster/Haul (merged into Demo section)
  dumpster_bath_ic: 400,
  dumpster_bath_cp: 750,
  dumpster_kitchen_ic: 825,
  dumpster_kitchen_cp: 1400,
  
  // Framing & Structure
  framing_standard_ic: 750,
  framing_standard_cp: 1300,
  framing_pony_wall_ic: 450,
  framing_pony_wall_cp: 850,
  niche_ic_each: 300,
  niche_cp_each: 550,
  
  // Floor Leveling (lump sum)
  floor_leveling_ls_ic: 500,
  floor_leveling_ls_cp: 850,
  floor_leveling_small_ic: 300,
  floor_leveling_small_cp: 500,
  floor_leveling_bath_ic: 550,
  floor_leveling_bath_cp: 900,
  floor_leveling_kitchen_ic: 900,
  floor_leveling_kitchen_cp: 1450,
  
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
  recessed_can_ic_each: 'Cost per recessed light (labor + basic trim)',
  recessed_can_cp_each: 'Client price per recessed can',
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
  plumbing_toilet_cp: 'Client price for toilet swap ($650-725)',
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
  glass_shower_standard_ic: 'Door + panel combo',
  glass_shower_standard_cp: 'Client price for door + panel',
  glass_panel_only_ic: 'Single fixed panel only',
  glass_panel_only_cp: 'Client price for panel only',
  glass_90_return_ic: '90° return (door + 2 panels) IC',
  glass_90_return_cp: '90° return CP ($2,650-2,900 range)',
  
  // Vanity bundles
  vanity_30_bundle_ic: '30" vanity + quartz top + sink IC',
  vanity_30_bundle_cp: '30" vanity bundle CP',
  vanity_36_bundle_ic: '36" vanity + quartz top + sink IC',
  vanity_36_bundle_cp: '36" vanity bundle CP',
  vanity_48_bundle_ic: '48" vanity + quartz top + sink IC',
  vanity_48_bundle_cp: '48" vanity bundle CP',
  vanity_54_bundle_ic: '54" vanity + quartz top + sink IC',
  vanity_54_bundle_cp: '54" vanity bundle CP',
  vanity_60_bundle_ic: '60" double vanity + quartz + 2 sinks IC',
  vanity_60_bundle_cp: '60" double vanity bundle CP',
  vanity_72_bundle_ic: '72" double vanity + quartz + 2 sinks IC',
  vanity_72_bundle_cp: '72" double vanity bundle CP',
  vanity_84_bundle_ic: '84" double vanity + quartz + 2 sinks IC',
  vanity_84_bundle_cp: '84" double vanity bundle CP',
  
  // Material Allowances
  tile_material_allowance_cp_per_sqft: 'Tile, grout, thinset, sealer ($7.5-8.25/sqft range)',
  plumbing_fixture_allowance_cp: 'Per bath: valve/trim, head, handheld, faucet or filler ($1,100-1,600)',
  mirror_allowance_cp: 'Mirror allowance per bathroom',
  lighting_fixture_allowance_cp: 'Light fixture allowance per location',
  hardware_allowance_per_pull_cp: 'Hardware/pulls allowance per piece',
  toilet_allowance_cp: 'Toilet fixture allowance',
  sink_faucet_allowance_cp: 'Sink/faucet fixture allowance',
  tub_allowance_cp: 'Standard tub fixture allowance',
  shower_trim_kit_allowance_cp: 'Shower trim kit (valve trim, showerhead, handheld)',
  tub_filler_allowance_cp: 'Tub filler allowance (wall-mount or deck-mount)',
  kitchen_faucet_allowance_cp: 'Kitchen faucet allowance',
  garbage_disposal_allowance_cp: 'Garbage disposal allowance',
  freestanding_tub_allowance_cp: 'Freestanding tub fixture allowance',
  
  // Quartz Slab
  quartz_slab_level1_allowance_cp: 'Level 1 quartz slab material allowance ($1,000/slab)',
  
  // Dumpster/Haul
  dumpster_bath_ic: 'Bathroom dumpster IC ($350-450 range)',
  dumpster_bath_cp: 'Bathroom dumpster CP ($650-850 range)',
  dumpster_kitchen_ic: 'Kitchen dumpster IC ($750-900 range)',
  dumpster_kitchen_cp: 'Kitchen dumpster CP ($1,200-1,600 range)',
  
  // Additional Plumbing (merged into main)
  plumbing_tub_to_shower_ic: 'Tub-to-shower conversion IC ($2,400-2,700 range)',
  plumbing_tub_to_shower_cp: 'Tub-to-shower conversion CP ($3,900-4,500 range)',
  plumbing_smart_valve_ic: 'Smart valve system (Moen/Kohler/Digital) IC ($1,200-1,500)',
  plumbing_smart_valve_cp: 'Smart valve system CP ($2,100-2,800 range)',
  plumbing_linear_drain_ic: 'Linear drain system IC - includes pan grading ($600-900)',
  plumbing_linear_drain_cp: 'Linear drain system CP ($1,200-1,900 range)',
  plumbing_toilet_relocation_cp: 'Toilet relocation CP ($800-1,100 range)',
  
  // Additional Electrical (merged into main)
  electrical_microwave_circuit_cp: 'Dedicated microwave circuit CP ($450-650 range)',
  electrical_hood_relocation_cp: 'Hood power relocation CP ($300-800 range)',
  electrical_dishwasher_disposal_cp: 'Dishwasher/disposal GFCI bundle CP ($350-575)',
  
  // Framing & Structure
  framing_standard_ic: 'Standard framing/blocking IC ($750 per)',
  framing_standard_cp: 'Standard framing/blocking CP',
  framing_pony_wall_ic: 'Pony wall framing IC',
  framing_pony_wall_cp: 'Pony wall framing CP',
  niche_ic_each: 'Niche IC each ($300 per)',
  niche_cp_each: 'Niche CP each',
  
  // Floor Leveling
  floor_leveling_ls_ic: 'Floor leveling lump sum IC ($500)',
  floor_leveling_ls_cp: 'Floor leveling lump sum CP',
  floor_leveling_small_ic: 'Small room floor leveling IC',
  floor_leveling_small_cp: 'Small room floor leveling CP',
  floor_leveling_bath_ic: 'Full bath floor leveling IC',
  floor_leveling_bath_cp: 'Full bath floor leveling CP',
  floor_leveling_kitchen_ic: 'Kitchen floor leveling IC',
  floor_leveling_kitchen_cp: 'Kitchen floor leveling CP',
  
  // LVP & Barrier Flooring
  lvp_ic_per_sqft: 'LVP flooring IC per sqft ($2.50)',
  lvp_cp_per_sqft: 'LVP flooring CP per sqft',
  barrier_ic_per_sqft: 'Barrier/underlayment IC per sqft ($1.00)',
  barrier_cp_per_sqft: 'Barrier/underlayment CP per sqft',
  
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
          description="Fixed packages including dumpster and disposal"
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
            <PricingField label="Bathroom Dumpster IC" field="dumpster_bath_ic" value={config.dumpster_bath_ic ?? 400} onChange={handleChange} prefix="$" />
            <PricingField label="Bathroom Dumpster CP" field="dumpster_bath_cp" value={config.dumpster_bath_cp ?? 750} onChange={handleChange} prefix="$" />
            <PricingField label="Kitchen Dumpster IC" field="dumpster_kitchen_ic" value={config.dumpster_kitchen_ic ?? 825} onChange={handleChange} prefix="$" />
            <PricingField label="Kitchen Dumpster CP" field="dumpster_kitchen_cp" value={config.dumpster_kitchen_cp ?? 1400} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Plumbing - All Packages */}
        <CollapsibleSection 
          title="Plumbing Packages" 
          description="All plumbing - rough-ins, conversions, smart valves, drains, relocations"
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
            <PricingField label="Tub-to-Shower IC" field="plumbing_tub_to_shower_ic" value={config.plumbing_tub_to_shower_ic ?? 2550} onChange={handleChange} prefix="$" />
            <PricingField label="Tub-to-Shower CP" field="plumbing_tub_to_shower_cp" value={config.plumbing_tub_to_shower_cp ?? 4200} onChange={handleChange} prefix="$" />
            <PricingField label="Smart Valve IC" field="plumbing_smart_valve_ic" value={config.plumbing_smart_valve_ic ?? 1350} onChange={handleChange} prefix="$" />
            <PricingField label="Smart Valve CP" field="plumbing_smart_valve_cp" value={config.plumbing_smart_valve_cp ?? 2450} onChange={handleChange} prefix="$" />
            <PricingField label="Linear Drain IC" field="plumbing_linear_drain_ic" value={config.plumbing_linear_drain_ic ?? 750} onChange={handleChange} prefix="$" />
            <PricingField label="Linear Drain CP" field="plumbing_linear_drain_cp" value={config.plumbing_linear_drain_cp ?? 1550} onChange={handleChange} prefix="$" />
            <PricingField label="Toilet Relocation CP" field="plumbing_toilet_relocation_cp" value={config.plumbing_toilet_relocation_cp ?? 950} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Tile, LVP & Waterproofing */}
        <CollapsibleSection 
          title="Flooring, Tile & Waterproofing" 
          description="Per-sqft rates for tile, LVP, barrier, waterproofing"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Wall Tile IC/sqft" field="tile_wall_ic_per_sqft" value={config.tile_wall_ic_per_sqft} onChange={handleChange} step="0.5" prefix="$" />
            <PricingField label="Wall Tile CP/sqft" field="tile_wall_cp_per_sqft" value={config.tile_wall_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Shower Floor IC/sqft" field="tile_shower_floor_ic_per_sqft" value={config.tile_shower_floor_ic_per_sqft} onChange={handleChange} step="0.5" prefix="$" />
            <PricingField label="Shower Floor CP/sqft" field="tile_shower_floor_cp_per_sqft" value={config.tile_shower_floor_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Main Floor Tile IC/sqft" field="tile_floor_ic_per_sqft" value={config.tile_floor_ic_per_sqft} onChange={handleChange} step="0.1" prefix="$" />
            <PricingField label="Main Floor Tile CP/sqft" field="tile_floor_cp_per_sqft" value={config.tile_floor_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="LVP IC/sqft" field="lvp_ic_per_sqft" value={(config as any).lvp_ic_per_sqft ?? 2.5} onChange={handleChange} step="0.25" prefix="$" />
            <PricingField label="LVP CP/sqft" field="lvp_cp_per_sqft" value={(config as any).lvp_cp_per_sqft ?? 4.5} onChange={handleChange} step="0.25" prefix="$" />
            <PricingField label="Barrier IC/sqft" field="barrier_ic_per_sqft" value={(config as any).barrier_ic_per_sqft ?? 1.0} onChange={handleChange} step="0.25" prefix="$" />
            <PricingField label="Barrier CP/sqft" field="barrier_cp_per_sqft" value={(config as any).barrier_cp_per_sqft ?? 2.0} onChange={handleChange} step="0.25" prefix="$" />
            <PricingField label="Cement Board IC/sqft" field="cement_board_ic_per_sqft" value={config.cement_board_ic_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Cement Board CP/sqft" field="cement_board_cp_per_sqft" value={config.cement_board_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Waterproofing IC/sqft" field="waterproofing_ic_per_sqft" value={config.waterproofing_ic_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Waterproofing CP/sqft" field="waterproofing_cp_per_sqft" value={config.waterproofing_cp_per_sqft} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Electrical - All Packages */}
        <CollapsibleSection 
          title="Electrical Packages" 
          description="All electrical - lighting, circuits, kitchen packages"
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
            <PricingField label="Microwave Circuit CP" field="electrical_microwave_circuit_cp" value={config.electrical_microwave_circuit_cp ?? 550} onChange={handleChange} prefix="$" />
            <PricingField label="Hood Relocation CP" field="electrical_hood_relocation_cp" value={config.electrical_hood_relocation_cp ?? 550} onChange={handleChange} prefix="$" />
            <PricingField label="Dishwasher/Disposal CP" field="electrical_dishwasher_disposal_cp" value={config.electrical_dishwasher_disposal_cp ?? 465} onChange={handleChange} prefix="$" />
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

        {/* Glass - Fixed packages only */}
        <CollapsibleSection 
          title="Shower Glass" 
          description="Fixed glass packages - panel, door+panel, 90° return"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Panel Only IC" field="glass_panel_only_ic" value={config.glass_panel_only_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Panel Only CP" field="glass_panel_only_cp" value={config.glass_panel_only_cp} onChange={handleChange} prefix="$" />
            <PricingField label="Door + Panel IC" field="glass_shower_standard_ic" value={config.glass_shower_standard_ic} onChange={handleChange} prefix="$" />
            <PricingField label="Door + Panel CP" field="glass_shower_standard_cp" value={config.glass_shower_standard_cp} onChange={handleChange} prefix="$" />
            <PricingField label="90° Return IC" field="glass_90_return_ic" value={config.glass_90_return_ic ?? 1425} onChange={handleChange} prefix="$" />
            <PricingField label="90° Return CP" field="glass_90_return_cp" value={config.glass_90_return_cp ?? 2775} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Vanities - All Sizes */}
        <CollapsibleSection 
          title="Vanity Bundles" 
          description="Vanity + quartz top + sink bundles by size"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label='30" Bundle IC' field="vanity_30_bundle_ic" value={config.vanity_30_bundle_ic ?? 1100} onChange={handleChange} prefix="$" />
            <PricingField label='30" Bundle CP' field="vanity_30_bundle_cp" value={config.vanity_30_bundle_cp ?? 1800} onChange={handleChange} prefix="$" />
            <PricingField label='36" Bundle IC' field="vanity_36_bundle_ic" value={config.vanity_36_bundle_ic ?? 1300} onChange={handleChange} prefix="$" />
            <PricingField label='36" Bundle CP' field="vanity_36_bundle_cp" value={config.vanity_36_bundle_cp ?? 2100} onChange={handleChange} prefix="$" />
            <PricingField label='48" Bundle IC' field="vanity_48_bundle_ic" value={config.vanity_48_bundle_ic} onChange={handleChange} prefix="$" />
            <PricingField label='48" Bundle CP' field="vanity_48_bundle_cp" value={config.vanity_48_bundle_cp} onChange={handleChange} prefix="$" />
            <PricingField label='54" Bundle IC' field="vanity_54_bundle_ic" value={config.vanity_54_bundle_ic ?? 1900} onChange={handleChange} prefix="$" />
            <PricingField label='54" Bundle CP' field="vanity_54_bundle_cp" value={config.vanity_54_bundle_cp ?? 3000} onChange={handleChange} prefix="$" />
            <PricingField label='60" Double IC' field="vanity_60_bundle_ic" value={config.vanity_60_bundle_ic} onChange={handleChange} prefix="$" />
            <PricingField label='60" Double CP' field="vanity_60_bundle_cp" value={config.vanity_60_bundle_cp} onChange={handleChange} prefix="$" />
            <PricingField label='72" Double IC' field="vanity_72_bundle_ic" value={config.vanity_72_bundle_ic ?? 2600} onChange={handleChange} prefix="$" />
            <PricingField label='72" Double CP' field="vanity_72_bundle_cp" value={config.vanity_72_bundle_cp ?? 4200} onChange={handleChange} prefix="$" />
            <PricingField label='84" Double IC' field="vanity_84_bundle_ic" value={config.vanity_84_bundle_ic ?? 3200} onChange={handleChange} prefix="$" />
            <PricingField label='84" Double CP' field="vanity_84_bundle_cp" value={config.vanity_84_bundle_cp ?? 5000} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Counters & Quartz */}
        <CollapsibleSection 
          title="Counters & Quartz" 
          description="Quartz labor and material allowance"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Quartz IC/sqft" field="quartz_ic_per_sqft" value={config.quartz_ic_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Quartz CP/sqft" field="quartz_cp_per_sqft" value={config.quartz_cp_per_sqft} onChange={handleChange} prefix="$" />
            <PricingField label="Level 1 Slab Allowance CP" field="quartz_slab_level1_allowance_cp" value={(config as any).quartz_slab_level1_allowance_cp ?? 1000} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Material Allowances - Expanded */}
        <CollapsibleSection 
          title="Material Allowances" 
          description="Client-facing allowances for fixtures and materials"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Tile Material CP/sqft" field="tile_material_allowance_cp_per_sqft" value={config.tile_material_allowance_cp_per_sqft ?? 7.85} onChange={handleChange} step="0.25" prefix="$" />
            <PricingField label="Plumbing Fixtures/Bath CP" field="plumbing_fixture_allowance_cp" value={config.plumbing_fixture_allowance_cp ?? 1350} onChange={handleChange} prefix="$" />
            <PricingField label="Mirror Allowance CP" field="mirror_allowance_cp" value={config.mirror_allowance_cp ?? 500} onChange={handleChange} prefix="$" />
            <PricingField label="Lighting Fixture CP" field="lighting_fixture_allowance_cp" value={config.lighting_fixture_allowance_cp ?? 400} onChange={handleChange} prefix="$" />
            <PricingField label="Hardware/Pull CP" field="hardware_allowance_per_pull_cp" value={config.hardware_allowance_per_pull_cp ?? 15} onChange={handleChange} prefix="$" />
            <PricingField label="Toilet Allowance CP" field="toilet_allowance_cp" value={config.toilet_allowance_cp ?? 450} onChange={handleChange} prefix="$" />
            <PricingField label="Sink/Faucet Allowance CP" field="sink_faucet_allowance_cp" value={config.sink_faucet_allowance_cp ?? 350} onChange={handleChange} prefix="$" />
            <PricingField label="Tub Allowance CP" field="tub_allowance_cp" value={config.tub_allowance_cp ?? 800} onChange={handleChange} prefix="$" />
            <PricingField label="Shower Trim Kit CP" field="shower_trim_kit_allowance_cp" value={config.shower_trim_kit_allowance_cp ?? 450} onChange={handleChange} prefix="$" />
            <PricingField label="Tub Filler Allowance CP" field="tub_filler_allowance_cp" value={config.tub_filler_allowance_cp ?? 650} onChange={handleChange} prefix="$" />
            <PricingField label="Kitchen Faucet CP" field="kitchen_faucet_allowance_cp" value={config.kitchen_faucet_allowance_cp ?? 400} onChange={handleChange} prefix="$" />
            <PricingField label="Garbage Disposal CP" field="garbage_disposal_allowance_cp" value={config.garbage_disposal_allowance_cp ?? 250} onChange={handleChange} prefix="$" />
            <PricingField label="Freestanding Tub Allowance CP" field="freestanding_tub_allowance_cp" value={config.freestanding_tub_allowance_cp ?? 2500} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Framing & Structure */}
        <CollapsibleSection 
          title="Framing & Structure"
          description="Blocking, niches, curbs, pony walls"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Standard Framing IC" field="framing_standard_ic" value={config.framing_standard_ic ?? 750} onChange={handleChange} prefix="$" />
            <PricingField label="Standard Framing CP" field="framing_standard_cp" value={config.framing_standard_cp ?? 1300} onChange={handleChange} prefix="$" />
            <PricingField label="Pony Wall IC" field="framing_pony_wall_ic" value={config.framing_pony_wall_ic ?? 450} onChange={handleChange} prefix="$" />
            <PricingField label="Pony Wall CP" field="framing_pony_wall_cp" value={config.framing_pony_wall_cp ?? 850} onChange={handleChange} prefix="$" />
            <PricingField label="Niche IC (each)" field="niche_ic_each" value={(config as any).niche_ic_each ?? 300} onChange={handleChange} prefix="$" />
            <PricingField label="Niche CP (each)" field="niche_cp_each" value={(config as any).niche_cp_each ?? 550} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Floor Leveling */}
        <CollapsibleSection 
          title="Floor Leveling" 
          description="Lump sum floor leveling"
        >
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <PricingField label="Floor Leveling LS IC" field="floor_leveling_ls_ic" value={(config as any).floor_leveling_ls_ic ?? 500} onChange={handleChange} prefix="$" />
            <PricingField label="Floor Leveling LS CP" field="floor_leveling_ls_cp" value={(config as any).floor_leveling_ls_cp ?? 850} onChange={handleChange} prefix="$" />
          </div>
        </CollapsibleSection>

        {/* Payment Terms */}
        <CollapsibleSection 
          title="Payment Terms" 
          description="Standard payment split percentages"
        >
          <div className="grid md:grid-cols-3 gap-x-6 gap-y-4">
            <PricingField label="Deposit" field="payment_split_deposit" value={config.payment_split_deposit} onChange={handleChange} step="0.05" suffix="%" />
            <PricingField label="Progress" field="payment_split_progress" value={config.payment_split_progress} onChange={handleChange} step="0.05" suffix="%" />
            <PricingField label="Final" field="payment_split_final" value={config.payment_split_final} onChange={handleChange} step="0.05" suffix="%" />
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
