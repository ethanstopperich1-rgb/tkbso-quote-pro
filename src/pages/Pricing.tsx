import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PricingConfig } from '@/types/database';
import { Save, RefreshCw, RotateCcw } from 'lucide-react';
import { Bath, ChefHat, Package, Wrench } from 'lucide-react';
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
import { GlobalSettingsCard } from '@/components/pricing/GlobalSettingsCard';
import { PerSqftReferenceCard } from '@/components/pricing/PerSqftReferenceCard';
import { TradeBucketsCard, TradeBucket } from '@/components/pricing/TradeBucketsCard';
import { AllowancesCard } from '@/components/pricing/AllowancesCard';
import { BathroomPreviewCard } from '@/components/pricing/BathroomPreviewCard';

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
};

// Market description default
const DEFAULT_MARKET_DESCRIPTION = "Orlando metro area, mid-high market, licensed & insured, turnkey kitchen & bath remodels.";

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
      icField: 'plumbing_toilet_ic', // reusing field
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
      icValue: config.closet_ic_per_sqft * 40, // Estimate for typical closet
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
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-display">Pricing Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Configure trade buckets, allowances, and reference rates for TKBSO estimates
          </p>
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
                  This will reset all pricing values to the standard TKBSO rates for the Orlando market. 
                  Your current values will be replaced, but you'll need to click "Save" to persist the changes.
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

      {/* Main Content */}
      <div className="space-y-6">
        {/* 1. Global Settings */}
        <GlobalSettingsCard
          targetMargin={config.target_margin}
          marketDescription={marketDescription}
          onTargetMarginChange={(value) => handleChange('target_margin', value)}
          onMarketDescriptionChange={setMarketDescription}
        />

        {/* 2. Per-Sqft Reference Rates */}
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

        {/* 3. Bathroom Trade Buckets */}
        <TradeBucketsCard
          title="Bathroom Trade Buckets"
          description="The PRIMARY pricing engine for bathroom estimates. Each bucket represents a trade with configurable IC and CP rates."
          icon={<Bath className="h-5 w-5 text-primary" />}
          buckets={bathroomBuckets}
          onChange={handleChange}
          targetMargin={config.target_margin}
        />

        {/* 4. Kitchen & Closet Trade Buckets */}
        <TradeBucketsCard
          title="Kitchen Trade Buckets"
          description="Trade buckets for kitchen remodel estimates."
          icon={<ChefHat className="h-5 w-5 text-primary" />}
          buckets={kitchenBuckets}
          onChange={handleChange}
          targetMargin={config.target_margin}
        />

        <TradeBucketsCard
          title="Closet Trade Buckets"
          description="Trade buckets for closet buildout and expansion estimates."
          icon={<Package className="h-5 w-5 text-primary" />}
          buckets={closetBuckets}
          onChange={handleChange}
          targetMargin={config.target_margin}
        />

        {/* 5. Allowances */}
        <AllowancesCard
          allowances={allowances}
          onChange={handleChange}
        />

        {/* 6. Bathroom Price Preview */}
        <BathroomPreviewCard config={config} />
      </div>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4 flex justify-end gap-2">
        <div className="max-w-6xl mx-auto w-full flex justify-end gap-2">
          <Button variant="outline" onClick={handleResetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Bottom padding for sticky bar */}
      <div className="h-24" />
    </div>
  );
}
