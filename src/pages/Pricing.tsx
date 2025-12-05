import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PricingConfig } from '@/types/database';
import { Save, RefreshCw, RotateCcw, ChevronDown } from 'lucide-react';
import { Bath, ChefHat, Package, Wrench, HardHat, Palette } from 'lucide-react';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { GlobalSettingsCard } from '@/components/pricing/GlobalSettingsCard';
import { PerSqftReferenceCard } from '@/components/pricing/PerSqftReferenceCard';
import { TradeBucketsCard, TradeBucket } from '@/components/pricing/TradeBucketsCard';
import { AllowancesCard } from '@/components/pricing/AllowancesCard';
import { cn } from '@/lib/utils';


// TKBSO Default Values - Updated Jan 2025
const TKBSO_DEFAULTS: Partial<PricingConfig> = {
  // Target margin
  target_margin: 0.38,
  
  // Base Rates (reference only - sanity check)
  kitchen_ic_per_sqft: 125,
  kitchen_cp_per_sqft: 190,
  bath_ic_per_sqft: 180,
  bath_cp_per_sqft: 290,
  closet_ic_per_sqft: 60,
  closet_cp_per_sqft: 95,
  
  // Tile Labor
  tile_wall_ic_per_sqft: 21,
  tile_wall_cp_per_sqft: 32,
  tile_floor_ic_per_sqft: 4.5,
  tile_floor_cp_per_sqft: 7,
  tile_shower_floor_ic_per_sqft: 5,
  tile_shower_floor_cp_per_sqft: 8,
  cement_board_ic_per_sqft: 3,
  cement_board_cp_per_sqft: 5.25,
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
  demo_small_bath_ic: 1800,
  demo_small_bath_cp: 2700,
  demo_large_bath_ic: 2200,
  demo_large_bath_cp: 3300,
  demo_kitchen_ic: 1750,
  demo_kitchen_cp: 2800,
  
  // Dumpster/Haul
  dumpster_bath_ic: 400,
  dumpster_bath_cp: 750,
  dumpster_kitchen_ic: 825,
  dumpster_kitchen_cp: 1400,
  
  // Framing & Structure
  framing_standard_ic: 900,
  framing_standard_cp: 1400,
  framing_pony_wall_ic: 450,
  framing_pony_wall_cp: 850,
  niche_ic_each: 300,
  niche_cp_each: 550,
  
  // Floor Leveling
  floor_leveling_ls_ic: 500,
  floor_leveling_ls_cp: 850,
  floor_leveling_bath_ic: 550,
  floor_leveling_bath_cp: 900,
  floor_leveling_kitchen_ic: 900,
  floor_leveling_kitchen_cp: 1450,
  
  // Plumbing Packages
  plumbing_shower_standard_ic: 1500,
  plumbing_shower_standard_cp: 2400,
  plumbing_tub_to_shower_ic: 2500,
  plumbing_tub_to_shower_cp: 4000,
  plumbing_extra_head_ic: 625,
  plumbing_extra_head_cp: 1100,
  plumbing_tub_freestanding_ic: 3300,
  plumbing_tub_freestanding_cp: 4800,
  plumbing_toilet_ic: 350,
  plumbing_toilet_cp: 690,
  plumbing_smart_valve_ic: 1350,
  plumbing_smart_valve_cp: 2450,
  plumbing_linear_drain_ic: 750,
  plumbing_linear_drain_cp: 1550,
  plumbing_toilet_relocation_cp: 950,
  
  // Electrical
  recessed_can_ic_each: 65,
  recessed_can_cp_each: 110,
  electrical_vanity_light_ic: 200,
  electrical_vanity_light_cp: 350,
  electrical_small_package_ic: 700,
  electrical_small_package_cp: 1200,
  electrical_kitchen_package_ic: 950,
  electrical_kitchen_package_cp: 1750,
  electrical_microwave_circuit_cp: 550,
  electrical_hood_relocation_cp: 550,
  electrical_dishwasher_disposal_cp: 465,
  
  // Paint & Drywall
  paint_patch_bath_ic: 400,
  paint_patch_bath_cp: 700,
  paint_full_bath_ic: 800,
  paint_full_bath_cp: 1400,
  
  // Shower Glass
  glass_shower_standard_ic: 1800,
  glass_shower_standard_cp: 2600,
  glass_panel_only_ic: 800,
  glass_panel_only_cp: 1450,
  glass_90_return_ic: 1425,
  glass_90_return_cp: 2775,
  
  // Vanity Bundles
  vanity_30_bundle_ic: 1100,
  vanity_30_bundle_cp: 1800,
  vanity_36_bundle_ic: 1300,
  vanity_36_bundle_cp: 2100,
  vanity_48_bundle_ic: 1500,
  vanity_48_bundle_cp: 2500,
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
  tile_material_allowance_cp_per_sqft: 7.5,
  plumbing_fixture_allowance_cp: 1800,
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
  
  // Payment Terms
  payment_split_deposit: 0.65,
  payment_split_progress: 0.25,
  payment_split_final: 0.10,
  
  // Minimums
  min_job_ic: 10500,
  min_job_cp: 15000,
  
  // Structural / Complex Work
  wall_removal_ic: 1800,
  wall_removal_cp: 2800,
  door_relocation_ic: 1400,
  door_relocation_cp: 2200,
  door_closure_ic: 700,
  door_closure_cp: 1100,
  entrance_enlargement_ic: 1100,
  entrance_enlargement_cp: 1700,
  soffit_removal_ic: 950,
  soffit_removal_cp: 1500,
  shower_enlargement_ic: 2000,
  shower_enlargement_cp: 3200,
  tub_relocation_ic: 3000,
  tub_relocation_cp: 4800,
  toilet_relocation_ic: 1400,
  toilet_relocation_cp: 2200,
  alcove_builtin_ic: 1050,
  alcove_builtin_cp: 1650,
  closet_reframe_ic: 1400,
  closet_reframe_cp: 2200,
  drywall_ic_per_sqft: 9,
  drywall_cp_per_sqft: 15,
  
  // Cabinet pricing (per linear foot)
  cabinet_lf_ic: 250,
  cabinet_lf_cp: 400,
  cabinet_install_only_lf_ic: 50,
  cabinet_install_only_lf_cp: 85,
};

// Market description default
const DEFAULT_MARKET_DESCRIPTION = "Orlando metro area, mid-high market, licensed & insured, turnkey kitchen & bath remodels.";

// Accordion Section Wrapper Component
function AccordionSection({ 
  title, 
  icon, 
  defaultOpen = false, 
  children 
}: { 
  title: string; 
  icon: React.ReactNode; 
  defaultOpen?: boolean; 
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] hover:border-slate-300 transition-all group">
          <div className="flex items-center gap-3">
            <span className="text-cyan-500">{icon}</span>
            <span className="text-lg font-bold text-[#0B1C3E]">{title}</span>
          </div>
          <ChevronDown className={cn(
            "h-5 w-5 text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function Pricing() {
  const { contractor } = useAuth();
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [marketDescription, setMarketDescription] = useState(DEFAULT_MARKET_DESCRIPTION);
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

  const handleChange = (field: string, value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      [field]: value,
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
      toast.success('Pricing settings updated successfully.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-8">
        <p className="text-slate-500">No pricing configuration found.</p>
      </div>
    );
  }

  // Build bathroom trade buckets from config
  const bathroomBuckets: TradeBucket[] = [
    {
      key: 'demo_haul',
      name: 'Demo & Haul-Off',
      description: 'Full bathroom gut: remove existing vanities, tops, tub/shower, wall tile, main floor tile, toilet, mirrors, baseboards, associated substrate; haul off debris.',
      unit: 'per bathroom',
      icField: 'demo_small_bath_ic',
      cpField: 'demo_small_bath_cp',
      icValue: config.demo_small_bath_ic,
      cpValue: config.demo_small_bath_cp,
    },
    {
      key: 'framing',
      name: 'Framing & Carpentry',
      description: 'Pony walls, niches, framing repairs, small layout adjustments (non-structural).',
      unit: 'per bathroom',
      icField: 'framing_standard_ic',
      cpField: 'framing_standard_cp',
      icValue: config.framing_standard_ic || 900,
      cpValue: config.framing_standard_cp || 1400,
    },
    {
      key: 'wall_tile',
      name: 'Wall Tile Labor',
      description: 'Shower walls, vertical tile, niches; excludes material.',
      unit: 'per sqft',
      icField: 'tile_wall_ic_per_sqft',
      cpField: 'tile_wall_cp_per_sqft',
      icValue: config.tile_wall_ic_per_sqft,
      cpValue: config.tile_wall_cp_per_sqft,
    },
    {
      key: 'shower_floor',
      name: 'Shower Floor Tile Labor',
      description: 'Shower floor tile installation labor.',
      unit: 'per sqft',
      icField: 'tile_shower_floor_ic_per_sqft',
      cpField: 'tile_shower_floor_cp_per_sqft',
      icValue: config.tile_shower_floor_ic_per_sqft,
      cpValue: config.tile_shower_floor_cp_per_sqft,
    },
    {
      key: 'main_floor',
      name: 'Main Floor Tile Labor',
      description: 'Main bathroom floor tile installation labor.',
      unit: 'per sqft',
      icField: 'tile_floor_ic_per_sqft',
      cpField: 'tile_floor_cp_per_sqft',
      icValue: config.tile_floor_ic_per_sqft,
      cpValue: config.tile_floor_cp_per_sqft,
    },
    {
      key: 'cement_board',
      name: 'Cement Board / Backer',
      description: 'Backer board installation (labor + material).',
      unit: 'per sqft',
      icField: 'cement_board_ic_per_sqft',
      cpField: 'cement_board_cp_per_sqft',
      icValue: config.cement_board_ic_per_sqft,
      cpValue: config.cement_board_cp_per_sqft,
    },
    {
      key: 'waterproofing',
      name: 'Waterproofing',
      description: 'Membrane, corners, seam banding, pan integration, bonding flange.',
      unit: 'per sqft',
      icField: 'waterproofing_ic_per_sqft',
      cpField: 'waterproofing_cp_per_sqft',
      icValue: config.waterproofing_ic_per_sqft,
      cpValue: config.waterproofing_cp_per_sqft,
    },
    {
      key: 'plumbing_standard',
      name: 'Plumbing – Standard (no layout change)',
      description: 'Replace shower valve/trim, reconnect vanity sink, reconnect toilet, install basic fixtures without relocating drains.',
      unit: 'per bathroom',
      icField: 'plumbing_shower_standard_ic',
      cpField: 'plumbing_shower_standard_cp',
      icValue: config.plumbing_shower_standard_ic,
      cpValue: config.plumbing_shower_standard_cp,
    },
    {
      key: 'plumbing_layout',
      name: 'Plumbing – Layout Change / Custom',
      description: 'Relocate drains, reconfigure shower, add body sprays, relocate tub drains, etc.',
      unit: 'per bathroom',
      icField: 'plumbing_tub_to_shower_ic',
      cpField: 'plumbing_tub_to_shower_cp',
      icValue: config.plumbing_tub_to_shower_ic || 2500,
      cpValue: config.plumbing_tub_to_shower_cp || 4000,
    },
    {
      key: 'electrical',
      name: 'Electrical & Lighting',
      description: 'Vanity light change-outs, 2–4 recessed cans, bath fan replacement.',
      unit: 'per bathroom',
      icField: 'electrical_small_package_ic',
      cpField: 'electrical_small_package_cp',
      icValue: config.electrical_small_package_ic,
      cpValue: config.electrical_small_package_cp,
    },
    {
      key: 'glass',
      name: 'Glass – Standard Door + Panel',
      description: 'Frameless shower door with side panel, normal height.',
      unit: 'per bathroom',
      icField: 'glass_shower_standard_ic',
      cpField: 'glass_shower_standard_cp',
      icValue: config.glass_shower_standard_ic,
      cpValue: config.glass_shower_standard_cp,
    },
    {
      key: 'vanity',
      name: 'Vanities & Tops – Standard (48")',
      description: 'Typical single vanity package with quartz top.',
      unit: 'per bathroom',
      icField: 'vanity_48_bundle_ic',
      cpField: 'vanity_48_bundle_cp',
      icValue: config.vanity_48_bundle_ic,
      cpValue: config.vanity_48_bundle_cp,
    },
    {
      key: 'paint',
      name: 'Paint & Misc Finish',
      description: 'Patch and touch-up for disturbed areas.',
      unit: 'per bathroom',
      icField: 'paint_patch_bath_ic',
      cpField: 'paint_patch_bath_cp',
      icValue: config.paint_patch_bath_ic || 400,
      cpValue: config.paint_patch_bath_cp || 700,
    },
  ];

  // Build kitchen trade buckets from config
  const kitchenBuckets: TradeBucket[] = [
    {
      key: 'demo_kitchen',
      name: 'Demo & Haul-Off',
      description: 'Full kitchen gut: remove cabinets, counters, backsplash, appliances disconnect; haul off debris.',
      unit: 'per kitchen',
      icField: 'demo_kitchen_ic',
      cpField: 'demo_kitchen_cp',
      icValue: config.demo_kitchen_ic,
      cpValue: config.demo_kitchen_cp,
    },
    {
      key: 'cabinets',
      name: 'Cabinets (Material + Install)',
      description: 'Stock/semi-custom cabinets with installation. Typical kitchen: 18-25 linear feet.',
      unit: 'per LF',
      icField: 'cabinet_lf_ic',
      cpField: 'cabinet_lf_cp',
      icValue: config.cabinet_lf_ic ?? 250,
      cpValue: config.cabinet_lf_cp ?? 400,
    },
    {
      key: 'cabinet_install_only',
      name: 'Cabinet Install Only',
      description: 'Labor only for customer-supplied cabinets.',
      unit: 'per LF',
      icField: 'cabinet_install_only_lf_ic',
      cpField: 'cabinet_install_only_lf_cp',
      icValue: config.cabinet_install_only_lf_ic ?? 50,
      cpValue: config.cabinet_install_only_lf_cp ?? 85,
    },
    {
      key: 'backsplash',
      name: 'Backsplash Tile Labor',
      description: 'Kitchen backsplash tile installation labor.',
      unit: 'per sqft',
      icField: 'tile_wall_ic_per_sqft',
      cpField: 'tile_wall_cp_per_sqft',
      icValue: config.tile_wall_ic_per_sqft,
      cpValue: config.tile_wall_cp_per_sqft,
    },
    {
      key: 'countertop',
      name: 'Countertop (Quartz)',
      description: 'Quartz fabrication and installation, includes basic edge profile.',
      unit: 'per sqft',
      icField: 'quartz_ic_per_sqft',
      cpField: 'quartz_cp_per_sqft',
      icValue: config.quartz_ic_per_sqft,
      cpValue: config.quartz_cp_per_sqft,
    },
    {
      key: 'plumbing_kitchen',
      name: 'Plumbing – Kitchen',
      description: 'Sink hookup, disposal, dishwasher connection.',
      unit: 'per kitchen',
      icField: 'plumbing_toilet_ic',
      cpField: 'plumbing_toilet_cp',
      icValue: 350,
      cpValue: 690,
    },
    {
      key: 'electrical_kitchen',
      name: 'Electrical & Lighting',
      description: 'Kitchen electrical package (5-6 cans + switches/outlets).',
      unit: 'per kitchen',
      icField: 'electrical_kitchen_package_ic',
      cpField: 'electrical_kitchen_package_cp',
      icValue: config.electrical_kitchen_package_ic,
      cpValue: config.electrical_kitchen_package_cp,
    },
    {
      key: 'flooring_kitchen',
      name: 'Flooring (LVP)',
      description: 'LVP flooring installation.',
      unit: 'per sqft',
      icField: 'lvp_ic_per_sqft',
      cpField: 'lvp_cp_per_sqft',
      icValue: config.lvp_ic_per_sqft ?? 2.5,
      cpValue: config.lvp_cp_per_sqft ?? 4.5,
    },
  ];

  // Build closet trade buckets
  const closetBuckets: TradeBucket[] = [
    {
      key: 'framing_closet',
      name: 'Framing & Drywall',
      description: 'Closet framing, drywall, and finishing.',
      unit: 'per closet',
      icField: 'framing_pony_wall_ic',
      cpField: 'framing_pony_wall_cp',
      icValue: config.framing_pony_wall_ic || 450,
      cpValue: config.framing_pony_wall_cp || 850,
    },
    {
      key: 'shelving',
      name: 'Finish Carpentry & Shelving',
      description: 'Custom shelving, rods, and trim work.',
      unit: 'per closet',
      icField: 'closet_ic_per_sqft',
      cpField: 'closet_cp_per_sqft',
      icValue: config.closet_ic_per_sqft * 40,
      cpValue: config.closet_cp_per_sqft * 40,
    },
    {
      key: 'paint_closet',
      name: 'Paint & Trim',
      description: 'Interior paint and trim finishing.',
      unit: 'per closet',
      icField: 'paint_patch_bath_ic',
      cpField: 'paint_patch_bath_cp',
      icValue: 300,
      cpValue: 500,
    },
  ];

  // Build structural / complex work trade buckets
  const structuralBuckets: TradeBucket[] = [
    {
      key: 'wall_removal',
      name: 'Wall Removal / Rebuild',
      description: 'Remove or relocate interior walls, includes framing, drywall patching, and finish work.',
      unit: 'each',
      icField: 'wall_removal_ic',
      cpField: 'wall_removal_cp',
      icValue: config.wall_removal_ic ?? 1800,
      cpValue: config.wall_removal_cp ?? 2800,
    },
    {
      key: 'door_relocation',
      name: 'Door Relocation',
      description: 'Move existing doorway to new location, frame new opening, close old opening.',
      unit: 'each',
      icField: 'door_relocation_ic',
      cpField: 'door_relocation_cp',
      icValue: config.door_relocation_ic ?? 1400,
      cpValue: config.door_relocation_cp ?? 2200,
    },
    {
      key: 'door_closure',
      name: 'Door Closure',
      description: 'Close/seal existing doorway, frame, drywall, and finish.',
      unit: 'each',
      icField: 'door_closure_ic',
      cpField: 'door_closure_cp',
      icValue: config.door_closure_ic ?? 700,
      cpValue: config.door_closure_cp ?? 1100,
    },
    {
      key: 'entrance_enlargement',
      name: 'Entrance Enlargement',
      description: 'Widen or heighten existing doorway opening.',
      unit: 'each',
      icField: 'entrance_enlargement_ic',
      cpField: 'entrance_enlargement_cp',
      icValue: config.entrance_enlargement_ic ?? 1100,
      cpValue: config.entrance_enlargement_cp ?? 1700,
    },
    {
      key: 'soffit_removal',
      name: 'Soffit Removal',
      description: 'Remove soffit/bulkhead above cabinets or ceiling, includes patching.',
      unit: 'each',
      icField: 'soffit_removal_ic',
      cpField: 'soffit_removal_cp',
      icValue: config.soffit_removal_ic ?? 950,
      cpValue: config.soffit_removal_cp ?? 1500,
    },
    {
      key: 'shower_enlargement',
      name: 'Shower Enlargement',
      description: 'Expand shower footprint into adjacent space, includes framing and waterproofing prep.',
      unit: 'each',
      icField: 'shower_enlargement_ic',
      cpField: 'shower_enlargement_cp',
      icValue: config.shower_enlargement_ic ?? 2000,
      cpValue: config.shower_enlargement_cp ?? 3200,
    },
    {
      key: 'tub_relocation',
      name: 'Tub Relocation',
      description: 'Move tub to new location, includes plumbing rough-in and drain relocation.',
      unit: 'each',
      icField: 'tub_relocation_ic',
      cpField: 'tub_relocation_cp',
      icValue: config.tub_relocation_ic ?? 3000,
      cpValue: config.tub_relocation_cp ?? 4800,
    },
    {
      key: 'toilet_relocation',
      name: 'Toilet Relocation',
      description: 'Move toilet to new location, includes drain relocation and floor patching.',
      unit: 'each',
      icField: 'toilet_relocation_ic',
      cpField: 'toilet_relocation_cp',
      icValue: config.toilet_relocation_ic ?? 1400,
      cpValue: config.toilet_relocation_cp ?? 2200,
    },
    {
      key: 'alcove_builtin',
      name: 'Alcove / Built-in',
      description: 'Build alcove, recessed shelf, or built-in storage area.',
      unit: 'each',
      icField: 'alcove_builtin_ic',
      cpField: 'alcove_builtin_cp',
      icValue: config.alcove_builtin_ic ?? 1050,
      cpValue: config.alcove_builtin_cp ?? 1650,
    },
    {
      key: 'closet_reframe',
      name: 'Closet Reframe / Buildout',
      description: 'Reframe closet space, expand or reconfigure layout.',
      unit: 'each',
      icField: 'closet_reframe_ic',
      cpField: 'closet_reframe_cp',
      icValue: config.closet_reframe_ic ?? 1400,
      cpValue: config.closet_reframe_cp ?? 2200,
    },
    {
      key: 'drywall',
      name: 'Drywall (Large Area)',
      description: 'Drywall installation and finishing for large areas.',
      unit: 'per sqft',
      icField: 'drywall_ic_per_sqft',
      cpField: 'drywall_cp_per_sqft',
      icValue: config.drywall_ic_per_sqft ?? 9,
      cpValue: config.drywall_cp_per_sqft ?? 15,
    },
  ];

  // Build allowances
  const allowances = [
    {
      key: 'tile_material',
      label: 'Tile Material',
      field: 'tile_material_allowance_cp_per_sqft',
      value: config.tile_material_allowance_cp_per_sqft,
      unit: 'per sqft',
      description: 'Includes tile material, thin-set, grout, and sealer for bathroom areas.',
    },
    {
      key: 'quartz_slab',
      label: 'Quartz Slab (Level 1)',
      field: 'quartz_slab_level1_allowance_cp',
      value: config.quartz_slab_level1_allowance_cp,
      unit: 'per slab',
      description: 'Level 1 quartz slab material allowance.',
    },
    {
      key: 'plumbing_fixture',
      label: 'Fixture – Bathroom',
      field: 'plumbing_fixture_allowance_cp',
      value: config.plumbing_fixture_allowance_cp,
      unit: 'per bath',
      description: 'Vanity faucets, shower trim, basic accessories, standard toilet.',
    },
    {
      key: 'toilet',
      label: 'Toilet',
      field: 'toilet_allowance_cp',
      value: config.toilet_allowance_cp,
      unit: 'each',
      description: 'Standard toilet fixture allowance.',
    },
    {
      key: 'sink_faucet',
      label: 'Sink Faucet',
      field: 'sink_faucet_allowance_cp',
      value: config.sink_faucet_allowance_cp,
      unit: 'each',
      description: 'Bathroom sink/faucet allowance.',
    },
    {
      key: 'shower_trim',
      label: 'Shower Trim Kit',
      field: 'shower_trim_kit_allowance_cp',
      value: config.shower_trim_kit_allowance_cp,
      unit: 'each',
      description: 'Shower trim kit (valve trim, showerhead, handheld).',
    },
    {
      key: 'tub_allowance',
      label: 'Standard Tub',
      field: 'tub_allowance_cp',
      value: config.tub_allowance_cp,
      unit: 'each',
      description: 'Standard alcove tub fixture allowance.',
    },
    {
      key: 'tub_filler',
      label: 'Tub Filler',
      field: 'tub_filler_allowance_cp',
      value: config.tub_filler_allowance_cp,
      unit: 'each',
      description: 'Tub filler allowance (wall-mount or deck-mount).',
    },
    {
      key: 'freestanding_tub',
      label: 'Freestanding Tub',
      field: 'freestanding_tub_allowance_cp',
      value: config.freestanding_tub_allowance_cp,
      unit: 'each',
      description: 'Freestanding tub fixture allowance.',
    },
    {
      key: 'mirror',
      label: 'Mirror',
      field: 'mirror_allowance_cp',
      value: config.mirror_allowance_cp,
      unit: 'each',
      description: 'Mirror allowance per bathroom.',
    },
    {
      key: 'lighting',
      label: 'Lighting Fixture',
      field: 'lighting_fixture_allowance_cp',
      value: config.lighting_fixture_allowance_cp,
      unit: 'each',
      description: 'Light fixture allowance per location.',
    },
    {
      key: 'hardware',
      label: 'Hardware / Pulls',
      field: 'hardware_allowance_per_pull_cp',
      value: config.hardware_allowance_per_pull_cp,
      unit: 'each',
      description: 'Hardware/pulls allowance per piece.',
    },
    {
      key: 'kitchen_faucet',
      label: 'Kitchen Faucet',
      field: 'kitchen_faucet_allowance_cp',
      value: config.kitchen_faucet_allowance_cp,
      unit: 'each',
      description: 'Kitchen faucet allowance.',
    },
    {
      key: 'garbage_disposal',
      label: 'Garbage Disposal',
      field: 'garbage_disposal_allowance_cp',
      value: config.garbage_disposal_allowance_cp,
      unit: 'each',
      description: 'Garbage disposal allowance.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sticky Header with backdrop blur */}
      <div className="sticky top-0 z-50 bg-[#F8FAFC]/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1C3E] tracking-tight">Pricing Configuration</h1>
              <p className="text-sm text-slate-500 mt-1">
                Configure trade buckets, allowances, and reference rates
              </p>
            </div>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none border-slate-200 hover:bg-slate-100">
                    <RotateCcw className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Reset</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="mx-4 sm:mx-auto max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset to TKBSO Defaults?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset all pricing values to the standard TKBSO rates. You'll need to save to persist.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetToDefaults} className="w-full sm:w-auto">
                      Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={handleSave} disabled={saving} size="sm" className="flex-1 sm:flex-none bg-cyan-500 hover:bg-cyan-600 text-white">
                <Save className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-4">
        {/* 1. Global Settings - Always visible */}
        <GlobalSettingsCard
          targetMargin={config.target_margin}
          managementFeePercent={config.management_fee_percent ?? 0.15}
          marketDescription={marketDescription}
          onTargetMarginChange={(value) => handleChange('target_margin', value)}
          onManagementFeeChange={(value) => handleChange('management_fee_percent', value)}
          onMarketDescriptionChange={setMarketDescription}
        />

        {/* 2. Per-Sqft Reference Rates - Always visible */}
        <PerSqftReferenceCard
          kitchenIcPerSqft={config.kitchen_ic_per_sqft}
          kitchenCpPerSqft={config.kitchen_cp_per_sqft}
          bathIcPerSqft={config.bath_ic_per_sqft}
          bathCpPerSqft={config.bath_cp_per_sqft}
          closetIcPerSqft={config.closet_ic_per_sqft}
          closetCpPerSqft={config.closet_cp_per_sqft}
          targetMargin={config.target_margin}
          onChange={handleChange}
        />

        {/* 3. Bathroom Trade Buckets - Open by default */}
        <AccordionSection 
          title="Bathroom Trade Buckets" 
          icon={<Bath className="h-5 w-5" />}
          defaultOpen={true}
        >
          <TradeBucketsCard
            title="Bathroom Trade Buckets"
            description="PRIMARY pricing engine for bathroom estimates."
            icon={<Bath className="h-5 w-5" />}
            buckets={bathroomBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
          />
        </AccordionSection>

        {/* 4. Kitchen Trade Buckets - Collapsed by default */}
        <AccordionSection 
          title="Kitchen Trade Buckets" 
          icon={<ChefHat className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Kitchen Trade Buckets"
            description="Trade buckets for kitchen remodel estimates."
            icon={<ChefHat className="h-5 w-5" />}
            buckets={kitchenBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
          />
        </AccordionSection>

        {/* 5. Closet Trade Buckets - Collapsed by default */}
        <AccordionSection 
          title="Closet Trade Buckets" 
          icon={<Package className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Closet Trade Buckets"
            description="Trade buckets for closet buildout and expansion."
            icon={<Package className="h-5 w-5" />}
            buckets={closetBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
          />
        </AccordionSection>

        {/* 6. Structural / Complex Work - Collapsed by default */}
        <AccordionSection 
          title="Structural / Complex Work" 
          icon={<HardHat className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Structural / Complex Work"
            description="Major layout changes and relocations."
            icon={<HardHat className="h-5 w-5" />}
            buckets={structuralBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
          />
        </AccordionSection>

        {/* 7. Allowances - Collapsed by default */}
        <AccordionSection 
          title="Allowances (Material Only)" 
          icon={<Palette className="h-5 w-5" />}
          defaultOpen={false}
        >
          <AllowancesCard
            allowances={allowances}
            onChange={handleChange}
          />
        </AccordionSection>
      </div>
    </div>
  );
}
