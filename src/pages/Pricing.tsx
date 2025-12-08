import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PricingConfig } from '@/types/database';
import { Save, RefreshCw, RotateCcw, ChevronDown, Truck, Settings2, Thermometer } from 'lucide-react';
import { Bath, ChefHat, Wrench, HardHat, Palette } from 'lucide-react';
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
const TKBSO_DEFAULTS: Partial<PricingConfig> & Record<string, any> = {
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
  
  // Site Protection & Setup
  floor_protection_ramboard_sqft_ic: 0.5,
  floor_protection_ramboard_sqft_cp: 1.0,
  dust_barrier_zipwall_ic: 150,
  dust_barrier_zipwall_cp: 300,
  air_scrubber_weekly_ic: 200,
  air_scrubber_weekly_cp: 350,
  furniture_moving_hourly_ic: 45,
  furniture_moving_hourly_cp: 85,
  
  // Standard Demolition
  demo_kitchen_standard_ic: 800,
  demo_kitchen_standard_cp: 1500,
  demo_bath_standard_ic: 600,
  demo_bath_standard_cp: 1200,
  demo_soffit_lf_ic: 15,
  demo_soffit_lf_cp: 30,
  demo_cabinet_deconstruct_ic: 500,
  demo_cabinet_deconstruct_cp: 900,
  
  // Heavy/Difficult Demo (Surcharges)
  demo_tile_mudset_sqft_ic: 6,
  demo_tile_mudset_sqft_cp: 12,
  demo_castiron_tub_ic: 250,
  demo_castiron_tub_cp: 500,
  demo_glueddown_sqft_ic: 4,
  demo_glueddown_sqft_cp: 8,
  demo_popcorn_ceiling_sqft_ic: 3.5,
  demo_popcorn_ceiling_sqft_cp: 7,
  
  // Disposal & Logistics
  dumpster_20yd_ic: 550,
  dumpster_20yd_cp: 750,
  liveload_haul_ic: 400,
  liveload_haul_cp: 700,
  difficult_access_fee_ic: 300,
  difficult_access_fee_cp: 600,
  
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
  
  // Site Prep & General Conditions
  floor_protection_ic: 150,
  floor_protection_cp: 250,
  dust_barriers_ic: 100,
  dust_barriers_cp: 200,
  post_construction_clean_ic: 350,
  post_construction_clean_cp: 500,
  permit_admin_fee_ic: 300,
  permit_admin_fee_cp: 600,
  
  // Mechanicals & Appliances
  hvac_vent_relocate_ic: 250,
  hvac_vent_relocate_cp: 450,
  range_hood_ducting_ic: 450,
  range_hood_ducting_cp: 850,
  appliance_install_standard_ic: 350,
  appliance_install_standard_cp: 650,
  appliance_install_pro_ic: 800,
  appliance_install_pro_cp: 1400,
  
  // Granite & Quartzite
  granite_slab_allowance_cp: 1200,
  quartzite_slab_allowance_cp: 1800,
  
  // Finish Carpentry & Millwork
  baseboard_install_lf_ic: 3.5,
  baseboard_install_lf_cp: 6.5,
  crown_molding_lf_ic: 6,
  crown_molding_lf_cp: 12,
  window_door_casing_ic: 75,
  window_door_casing_cp: 150,
  shoe_molding_lf_ic: 2,
  shoe_molding_lf_cp: 4,
  wainscoting_sqft_ic: 12,
  wainscoting_sqft_cp: 22,
  
  // Electrical Systems & Upgrades
  panel_upgrade_200a_ic: 2500,
  panel_upgrade_200a_cp: 3800,
  dedicated_circuit_240v_ic: 450,
  dedicated_circuit_240v_cp: 850,
  undercab_led_ic: 400,
  undercab_led_cp: 750,
  heated_floor_sqft_ic: 18,
  heated_floor_sqft_cp: 32,
  
  // Luxury Plumbing & Gas
  steam_generator_ic: 1200,
  steam_generator_cp: 2200,
  gas_line_new_ic: 800,
  gas_line_new_cp: 1500,
  pot_filler_ic: 550,
  pot_filler_cp: 950,
  tankless_water_heater_ic: 1800,
  tankless_water_heater_cp: 3200,
  
  // Logistics & Admin
  portable_toilet_ic: 150,
  portable_toilet_cp: 250,
  engineering_stamp_ic: 800,
  engineering_stamp_cp: 1500,
  hoa_access_fee_ic: 0,
  hoa_access_fee_cp: 500,
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
  const [pricingMode, setPricingMode] = useState<'margin_mode' | 'manual_mode'>('margin_mode');
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

  // Apply target margin to all CP values
  const handleApplyMarginToAll = () => {
    if (!config) return;
    const margin = config.target_margin || 0.38;
    
    // Get all IC fields and calculate their corresponding CP values
    const updatedConfig = { ...config };
    
    // List of IC/CP field pairs
    const icCpPairs = [
      // Site Protection & Setup
      ['floor_protection_ramboard_sqft_ic', 'floor_protection_ramboard_sqft_cp'],
      ['dust_barrier_zipwall_ic', 'dust_barrier_zipwall_cp'],
      ['air_scrubber_weekly_ic', 'air_scrubber_weekly_cp'],
      ['furniture_moving_hourly_ic', 'furniture_moving_hourly_cp'],
      // Standard Demolition
      ['demo_kitchen_standard_ic', 'demo_kitchen_standard_cp'],
      ['demo_bath_standard_ic', 'demo_bath_standard_cp'],
      ['demo_soffit_lf_ic', 'demo_soffit_lf_cp'],
      ['demo_cabinet_deconstruct_ic', 'demo_cabinet_deconstruct_cp'],
      // Heavy/Difficult Demo
      ['demo_tile_mudset_sqft_ic', 'demo_tile_mudset_sqft_cp'],
      ['demo_castiron_tub_ic', 'demo_castiron_tub_cp'],
      ['demo_glueddown_sqft_ic', 'demo_glueddown_sqft_cp'],
      ['demo_popcorn_ceiling_sqft_ic', 'demo_popcorn_ceiling_sqft_cp'],
      // Disposal & Logistics
      ['dumpster_20yd_ic', 'dumpster_20yd_cp'],
      ['liveload_haul_ic', 'liveload_haul_cp'],
      ['difficult_access_fee_ic', 'difficult_access_fee_cp'],
      // Tile & Waterproofing
      ['tile_wall_ic_per_sqft', 'tile_wall_cp_per_sqft'],
      ['tile_floor_ic_per_sqft', 'tile_floor_cp_per_sqft'],
      ['tile_shower_floor_ic_per_sqft', 'tile_shower_floor_cp_per_sqft'],
      ['cement_board_ic_per_sqft', 'cement_board_cp_per_sqft'],
      ['waterproofing_ic_per_sqft', 'waterproofing_cp_per_sqft'],
      ['plumbing_shower_standard_ic', 'plumbing_shower_standard_cp'],
      ['plumbing_extra_head_ic', 'plumbing_extra_head_cp'],
      ['plumbing_tub_to_shower_ic', 'plumbing_tub_to_shower_cp'],
      ['plumbing_tub_freestanding_ic', 'plumbing_tub_freestanding_cp'],
      ['plumbing_toilet_ic', 'plumbing_toilet_cp'],
      ['plumbing_smart_valve_ic', 'plumbing_smart_valve_cp'],
      ['plumbing_linear_drain_ic', 'plumbing_linear_drain_cp'],
      ['electrical_vanity_light_ic', 'electrical_vanity_light_cp'],
      ['electrical_small_package_ic', 'electrical_small_package_cp'],
      ['electrical_kitchen_package_ic', 'electrical_kitchen_package_cp'],
      ['recessed_can_ic_each', 'recessed_can_cp_each'],
      ['paint_patch_bath_ic', 'paint_patch_bath_cp'],
      ['paint_full_bath_ic', 'paint_full_bath_cp'],
      ['glass_shower_standard_ic', 'glass_shower_standard_cp'],
      ['glass_panel_only_ic', 'glass_panel_only_cp'],
      ['glass_90_return_ic', 'glass_90_return_cp'],
      ['vanity_30_bundle_ic', 'vanity_30_bundle_cp'],
      ['vanity_36_bundle_ic', 'vanity_36_bundle_cp'],
      ['vanity_48_bundle_ic', 'vanity_48_bundle_cp'],
      ['vanity_54_bundle_ic', 'vanity_54_bundle_cp'],
      ['vanity_60_bundle_ic', 'vanity_60_bundle_cp'],
      ['vanity_72_bundle_ic', 'vanity_72_bundle_cp'],
      ['vanity_84_bundle_ic', 'vanity_84_bundle_cp'],
      ['quartz_ic_per_sqft', 'quartz_cp_per_sqft'],
      ['framing_standard_ic', 'framing_standard_cp'],
      ['framing_pony_wall_ic', 'framing_pony_wall_cp'],
      ['niche_ic_each', 'niche_cp_each'],
      ['floor_leveling_small_ic', 'floor_leveling_small_cp'],
      ['floor_leveling_bath_ic', 'floor_leveling_bath_cp'],
      ['floor_leveling_kitchen_ic', 'floor_leveling_kitchen_cp'],
      ['floor_leveling_ls_ic', 'floor_leveling_ls_cp'],
      ['lvp_ic_per_sqft', 'lvp_cp_per_sqft'],
      ['barrier_ic_per_sqft', 'barrier_cp_per_sqft'],
      ['cabinet_lf_ic', 'cabinet_lf_cp'],
      ['cabinet_install_only_lf_ic', 'cabinet_install_only_lf_cp'],
      ['wall_removal_ic', 'wall_removal_cp'],
      ['door_relocation_ic', 'door_relocation_cp'],
      ['door_closure_ic', 'door_closure_cp'],
      ['entrance_enlargement_ic', 'entrance_enlargement_cp'],
      ['soffit_removal_ic', 'soffit_removal_cp'],
      ['shower_enlargement_ic', 'shower_enlargement_cp'],
      ['tub_relocation_ic', 'tub_relocation_cp'],
      ['toilet_relocation_ic', 'toilet_relocation_cp'],
      ['alcove_builtin_ic', 'alcove_builtin_cp'],
      ['closet_reframe_ic', 'closet_reframe_cp'],
      ['drywall_ic_per_sqft', 'drywall_cp_per_sqft'],
      ['floor_protection_ic', 'floor_protection_cp'],
      ['dust_barriers_ic', 'dust_barriers_cp'],
      ['post_construction_clean_ic', 'post_construction_clean_cp'],
      ['permit_admin_fee_ic', 'permit_admin_fee_cp'],
      ['hvac_vent_relocate_ic', 'hvac_vent_relocate_cp'],
      ['range_hood_ducting_ic', 'range_hood_ducting_cp'],
      ['appliance_install_standard_ic', 'appliance_install_standard_cp'],
      ['appliance_install_pro_ic', 'appliance_install_pro_cp'],
      // Finish Carpentry
      ['baseboard_install_lf_ic', 'baseboard_install_lf_cp'],
      ['crown_molding_lf_ic', 'crown_molding_lf_cp'],
      ['window_door_casing_ic', 'window_door_casing_cp'],
      ['shoe_molding_lf_ic', 'shoe_molding_lf_cp'],
      ['wainscoting_sqft_ic', 'wainscoting_sqft_cp'],
      // Electrical Systems & Upgrades
      ['panel_upgrade_200a_ic', 'panel_upgrade_200a_cp'],
      ['dedicated_circuit_240v_ic', 'dedicated_circuit_240v_cp'],
      ['undercab_led_ic', 'undercab_led_cp'],
      ['heated_floor_sqft_ic', 'heated_floor_sqft_cp'],
      // Luxury Plumbing & Gas
      ['steam_generator_ic', 'steam_generator_cp'],
      ['gas_line_new_ic', 'gas_line_new_cp'],
      ['pot_filler_ic', 'pot_filler_cp'],
      ['tankless_water_heater_ic', 'tankless_water_heater_cp'],
      // Logistics & Admin
      ['portable_toilet_ic', 'portable_toilet_cp'],
      ['engineering_stamp_ic', 'engineering_stamp_cp'],
      ['hoa_access_fee_ic', 'hoa_access_fee_cp'],
    ];
    
    for (const [icField, cpField] of icCpPairs) {
      const icValue = (updatedConfig as any)[icField];
      if (icValue != null && icValue > 0) {
        const cpValue = icValue / (1 - margin);
        (updatedConfig as any)[cpField] = Math.round(cpValue * 100) / 100;
      }
    }
    
    setConfig(updatedConfig);
    toast.success(`Applied ${Math.round(margin * 100)}% margin to all trade buckets. Remember to save!`);
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

  // ============ TRADE-BASED ORGANIZATION ============
  
  // 1. SITE PROTECTION & SETUP
  const siteProtectionBuckets: TradeBucket[] = [
    {
      key: 'floor_protection_ramboard',
      name: 'Heavy Duty Floor Protection (Ramboard)',
      description: 'Ramboard floor protection for high-traffic areas.',
      unit: 'per sqft',
      icField: 'floor_protection_ramboard_sqft_ic',
      cpField: 'floor_protection_ramboard_sqft_cp',
      icValue: (config as any).floor_protection_ramboard_sqft_ic ?? 0.5,
      cpValue: (config as any).floor_protection_ramboard_sqft_cp ?? 1.0,
    },
    {
      key: 'dust_barrier_zipwall',
      name: 'Dust Barrier / ZipWall Setup',
      description: 'ZipWall dust barrier containment per room.',
      unit: 'per room',
      icField: 'dust_barrier_zipwall_ic',
      cpField: 'dust_barrier_zipwall_cp',
      icValue: (config as any).dust_barrier_zipwall_ic ?? 150,
      cpValue: (config as any).dust_barrier_zipwall_cp ?? 300,
    },
    {
      key: 'air_scrubber',
      name: 'Air Scrubber Rental (HEPA)',
      description: 'HEPA air scrubber rental for dust control.',
      unit: 'per week',
      icField: 'air_scrubber_weekly_ic',
      cpField: 'air_scrubber_weekly_cp',
      icValue: (config as any).air_scrubber_weekly_ic ?? 200,
      cpValue: (config as any).air_scrubber_weekly_cp ?? 350,
    },
    {
      key: 'furniture_moving',
      name: 'Furniture/Content Moving',
      description: 'Moving furniture and contents for access.',
      unit: 'per hour',
      icField: 'furniture_moving_hourly_ic',
      cpField: 'furniture_moving_hourly_cp',
      icValue: (config as any).furniture_moving_hourly_ic ?? 45,
      cpValue: (config as any).furniture_moving_hourly_cp ?? 85,
    },
  ];

  // 2. STANDARD DEMOLITION
  const standardDemoBuckets: TradeBucket[] = [
    {
      key: 'demo_kitchen_standard',
      name: 'Full Kitchen Gut (Standard)',
      description: 'Standard kitchen demo: cabinets, counters, backsplash.',
      unit: 'each',
      icField: 'demo_kitchen_standard_ic',
      cpField: 'demo_kitchen_standard_cp',
      icValue: (config as any).demo_kitchen_standard_ic ?? 800,
      cpValue: (config as any).demo_kitchen_standard_cp ?? 1500,
    },
    {
      key: 'demo_bath_standard',
      name: 'Full Bath Gut (Standard)',
      description: 'Standard bathroom demo: fixtures, tile, vanity.',
      unit: 'each',
      icField: 'demo_bath_standard_ic',
      cpField: 'demo_bath_standard_cp',
      icValue: (config as any).demo_bath_standard_ic ?? 600,
      cpValue: (config as any).demo_bath_standard_cp ?? 1200,
    },
    {
      key: 'demo_soffit',
      name: 'Soffit Demolition',
      description: 'Remove existing soffits.',
      unit: 'per LF',
      icField: 'demo_soffit_lf_ic',
      cpField: 'demo_soffit_lf_cp',
      icValue: (config as any).demo_soffit_lf_ic ?? 15,
      cpValue: (config as any).demo_soffit_lf_cp ?? 30,
    },
    {
      key: 'demo_cabinet_deconstruct',
      name: 'Cabinet Deconstruction (Save for Reuse)',
      description: 'Careful removal of cabinets for donor reuse.',
      unit: 'per kitchen',
      icField: 'demo_cabinet_deconstruct_ic',
      cpField: 'demo_cabinet_deconstruct_cp',
      icValue: (config as any).demo_cabinet_deconstruct_ic ?? 500,
      cpValue: (config as any).demo_cabinet_deconstruct_cp ?? 900,
    },
  ];

  // 3. HEAVY/DIFFICULT DEMO (Surcharges)
  const heavyDemoBuckets: TradeBucket[] = [
    {
      key: 'demo_tile_mudset',
      name: 'Tile Removal (Mud-Set/Concrete Bed)',
      description: 'Remove mud-set or concrete bed tile.',
      unit: 'per sqft',
      icField: 'demo_tile_mudset_sqft_ic',
      cpField: 'demo_tile_mudset_sqft_cp',
      icValue: (config as any).demo_tile_mudset_sqft_ic ?? 6,
      cpValue: (config as any).demo_tile_mudset_sqft_cp ?? 12,
    },
    {
      key: 'demo_castiron_tub',
      name: 'Cast Iron Tub Smash/Removal',
      description: 'Break up and remove cast iron tub.',
      unit: 'each',
      icField: 'demo_castiron_tub_ic',
      cpField: 'demo_castiron_tub_cp',
      icValue: (config as any).demo_castiron_tub_ic ?? 250,
      cpValue: (config as any).demo_castiron_tub_cp ?? 500,
    },
    {
      key: 'demo_glueddown',
      name: 'Glued-Down Wood/Tile Removal',
      description: 'Remove glued-down flooring.',
      unit: 'per sqft',
      icField: 'demo_glueddown_sqft_ic',
      cpField: 'demo_glueddown_sqft_cp',
      icValue: (config as any).demo_glueddown_sqft_ic ?? 4,
      cpValue: (config as any).demo_glueddown_sqft_cp ?? 8,
    },
    {
      key: 'demo_popcorn_ceiling',
      name: 'Popcorn Ceiling Removal (Scrape & Skim)',
      description: 'Scrape popcorn ceiling and skim coat.',
      unit: 'per sqft',
      icField: 'demo_popcorn_ceiling_sqft_ic',
      cpField: 'demo_popcorn_ceiling_sqft_cp',
      icValue: (config as any).demo_popcorn_ceiling_sqft_ic ?? 3.5,
      cpValue: (config as any).demo_popcorn_ceiling_sqft_cp ?? 7,
    },
  ];

  // 4. DISPOSAL & LOGISTICS
  const disposalBuckets: TradeBucket[] = [
    {
      key: 'dumpster_20yd',
      name: 'Dumpster (20 Yard)',
      description: '20 yard dumpster rental and pickup.',
      unit: 'each',
      icField: 'dumpster_20yd_ic',
      cpField: 'dumpster_20yd_cp',
      icValue: (config as any).dumpster_20yd_ic ?? 550,
      cpValue: (config as any).dumpster_20yd_cp ?? 750,
    },
    {
      key: 'liveload_haul',
      name: 'Live Load / Truck Haul-Away',
      description: 'Live load debris into truck and haul away.',
      unit: 'per load',
      icField: 'liveload_haul_ic',
      cpField: 'liveload_haul_cp',
      icValue: (config as any).liveload_haul_ic ?? 400,
      cpValue: (config as any).liveload_haul_cp ?? 700,
    },
    {
      key: 'difficult_access_fee',
      name: 'Difficult Access / Stair Carry Fee',
      description: 'Surcharge for difficult access (stairs, elevator, distance).',
      unit: 'per job',
      icField: 'difficult_access_fee_ic',
      cpField: 'difficult_access_fee_cp',
      icValue: (config as any).difficult_access_fee_ic ?? 300,
      cpValue: (config as any).difficult_access_fee_cp ?? 600,
    },
  ];

  // PLUMBING
  const plumbingBuckets: TradeBucket[] = [
    {
      key: 'plumbing_shower_standard',
      name: 'Standard Shower Rough-In',
      description: 'Replace shower valve/trim, no layout change.',
      unit: 'each',
      icField: 'plumbing_shower_standard_ic',
      cpField: 'plumbing_shower_standard_cp',
      icValue: config.plumbing_shower_standard_ic,
      cpValue: config.plumbing_shower_standard_cp,
    },
    {
      key: 'plumbing_extra_head',
      name: 'Extra Head / Diverter',
      description: 'Additional shower head or body spray.',
      unit: 'each',
      icField: 'plumbing_extra_head_ic',
      cpField: 'plumbing_extra_head_cp',
      icValue: config.plumbing_extra_head_ic,
      cpValue: config.plumbing_extra_head_cp,
    },
    {
      key: 'plumbing_tub_to_shower',
      name: 'Tub to Shower Conversion',
      description: 'Convert tub to shower, relocate drains.',
      unit: 'each',
      icField: 'plumbing_tub_to_shower_ic',
      cpField: 'plumbing_tub_to_shower_cp',
      icValue: config.plumbing_tub_to_shower_ic,
      cpValue: config.plumbing_tub_to_shower_cp,
    },
    {
      key: 'plumbing_tub_freestanding',
      name: 'Freestanding Tub Install',
      description: 'Freestanding tub plumbing and installation.',
      unit: 'each',
      icField: 'plumbing_tub_freestanding_ic',
      cpField: 'plumbing_tub_freestanding_cp',
      icValue: config.plumbing_tub_freestanding_ic,
      cpValue: config.plumbing_tub_freestanding_cp,
    },
    {
      key: 'plumbing_toilet',
      name: 'Toilet Swap',
      description: 'Remove old toilet, install new (no relocation).',
      unit: 'each',
      icField: 'plumbing_toilet_ic',
      cpField: 'plumbing_toilet_cp',
      icValue: config.plumbing_toilet_ic,
      cpValue: config.plumbing_toilet_cp,
    },
    {
      key: 'plumbing_smart_valve',
      name: 'Smart Valve System',
      description: 'Digital/smart shower valve system.',
      unit: 'each',
      icField: 'plumbing_smart_valve_ic',
      cpField: 'plumbing_smart_valve_cp',
      icValue: config.plumbing_smart_valve_ic,
      cpValue: config.plumbing_smart_valve_cp,
    },
    {
      key: 'plumbing_linear_drain',
      name: 'Linear Drain Install',
      description: 'Linear/trench drain installation.',
      unit: 'each',
      icField: 'plumbing_linear_drain_ic',
      cpField: 'plumbing_linear_drain_cp',
      icValue: config.plumbing_linear_drain_ic,
      cpValue: config.plumbing_linear_drain_cp,
    },
  ];

  // ELECTRICAL
  const electricalBuckets: TradeBucket[] = [
    {
      key: 'recessed_can',
      name: 'Recessed Can Light',
      description: 'Install recessed can light fixture.',
      unit: 'each',
      icField: 'recessed_can_ic_each',
      cpField: 'recessed_can_cp_each',
      icValue: config.recessed_can_ic_each,
      cpValue: config.recessed_can_cp_each,
    },
    {
      key: 'vanity_light',
      name: 'Vanity Light Install',
      description: 'Install vanity light fixture.',
      unit: 'each',
      icField: 'electrical_vanity_light_ic',
      cpField: 'electrical_vanity_light_cp',
      icValue: config.electrical_vanity_light_ic,
      cpValue: config.electrical_vanity_light_cp,
    },
    {
      key: 'electrical_small_package',
      name: 'Small Electrical Package',
      description: 'Bathroom: 2-4 cans, vanity light, fan.',
      unit: 'each',
      icField: 'electrical_small_package_ic',
      cpField: 'electrical_small_package_cp',
      icValue: config.electrical_small_package_ic,
      cpValue: config.electrical_small_package_cp,
    },
    {
      key: 'electrical_kitchen_package',
      name: 'Kitchen Electrical Package',
      description: 'Kitchen: 5-6 cans, under-cab, switches.',
      unit: 'each',
      icField: 'electrical_kitchen_package_ic',
      cpField: 'electrical_kitchen_package_cp',
      icValue: config.electrical_kitchen_package_ic,
      cpValue: config.electrical_kitchen_package_cp,
    },
  ];

  // TILE & WATERPROOFING
  const tileBuckets: TradeBucket[] = [
    {
      key: 'tile_wall',
      name: 'Wall Tile Labor',
      description: 'Shower walls, vertical tile (excludes material).',
      unit: 'per sqft',
      icField: 'tile_wall_ic_per_sqft',
      cpField: 'tile_wall_cp_per_sqft',
      icValue: config.tile_wall_ic_per_sqft,
      cpValue: config.tile_wall_cp_per_sqft,
    },
    {
      key: 'tile_shower_floor',
      name: 'Shower Floor Tile Labor',
      description: 'Shower floor tile installation.',
      unit: 'per sqft',
      icField: 'tile_shower_floor_ic_per_sqft',
      cpField: 'tile_shower_floor_cp_per_sqft',
      icValue: config.tile_shower_floor_ic_per_sqft,
      cpValue: config.tile_shower_floor_cp_per_sqft,
    },
    {
      key: 'tile_floor',
      name: 'Main Floor Tile Labor',
      description: 'Main floor tile installation.',
      unit: 'per sqft',
      icField: 'tile_floor_ic_per_sqft',
      cpField: 'tile_floor_cp_per_sqft',
      icValue: config.tile_floor_ic_per_sqft,
      cpValue: config.tile_floor_cp_per_sqft,
    },
    {
      key: 'cement_board',
      name: 'Cement Board / Backer',
      description: 'Backer board installation.',
      unit: 'per sqft',
      icField: 'cement_board_ic_per_sqft',
      cpField: 'cement_board_cp_per_sqft',
      icValue: config.cement_board_ic_per_sqft,
      cpValue: config.cement_board_cp_per_sqft,
    },
    {
      key: 'waterproofing',
      name: 'Waterproofing',
      description: 'Membrane, corners, seam banding.',
      unit: 'per sqft',
      icField: 'waterproofing_ic_per_sqft',
      cpField: 'waterproofing_cp_per_sqft',
      icValue: config.waterproofing_ic_per_sqft,
      cpValue: config.waterproofing_cp_per_sqft,
    },
    {
      key: 'floor_leveling_ls',
      name: 'Floor Leveling (Lump Sum)',
      description: 'Self-leveling compound for uneven floors.',
      unit: 'each',
      icField: 'floor_leveling_ls_ic',
      cpField: 'floor_leveling_ls_cp',
      icValue: config.floor_leveling_ls_ic ?? 500,
      cpValue: config.floor_leveling_ls_cp ?? 850,
    },
  ];

  // CABINETRY & VANITIES
  const cabinetryBuckets: TradeBucket[] = [
    {
      key: 'cabinet_box',
      name: 'Cabinets (Material + Install)',
      description: 'Stock/semi-custom cabinets with installation.',
      unit: 'per box',
      icField: 'cabinet_lf_ic',
      cpField: 'cabinet_lf_cp',
      icValue: config.cabinet_lf_ic ?? 250,
      cpValue: config.cabinet_lf_cp ?? 400,
    },
    {
      key: 'cabinet_install_only',
      name: 'Cabinet Install Only',
      description: 'Labor only for customer-supplied cabinets.',
      unit: 'per box',
      icField: 'cabinet_install_only_lf_ic',
      cpField: 'cabinet_install_only_lf_cp',
      icValue: config.cabinet_install_only_lf_ic ?? 50,
      cpValue: config.cabinet_install_only_lf_cp ?? 85,
    },
    {
      key: 'vanity_30',
      name: 'Vanity Bundle - 30"',
      description: '30" vanity with top, sink, faucet, install.',
      unit: 'each',
      icField: 'vanity_30_bundle_ic',
      cpField: 'vanity_30_bundle_cp',
      icValue: config.vanity_30_bundle_ic,
      cpValue: config.vanity_30_bundle_cp,
    },
    {
      key: 'vanity_36',
      name: 'Vanity Bundle - 36"',
      description: '36" vanity with top, sink, faucet, install.',
      unit: 'each',
      icField: 'vanity_36_bundle_ic',
      cpField: 'vanity_36_bundle_cp',
      icValue: config.vanity_36_bundle_ic,
      cpValue: config.vanity_36_bundle_cp,
    },
    {
      key: 'vanity_48',
      name: 'Vanity Bundle - 48"',
      description: '48" vanity with top, sink, faucet, install.',
      unit: 'each',
      icField: 'vanity_48_bundle_ic',
      cpField: 'vanity_48_bundle_cp',
      icValue: config.vanity_48_bundle_ic,
      cpValue: config.vanity_48_bundle_cp,
    },
    {
      key: 'vanity_60',
      name: 'Vanity Bundle - 60" Double',
      description: '60" double vanity with top, sinks, faucets, install.',
      unit: 'each',
      icField: 'vanity_60_bundle_ic',
      cpField: 'vanity_60_bundle_cp',
      icValue: config.vanity_60_bundle_ic,
      cpValue: config.vanity_60_bundle_cp,
    },
    {
      key: 'vanity_72',
      name: 'Vanity Bundle - 72" Double',
      description: '72" double vanity with top, sinks, faucets, install.',
      unit: 'each',
      icField: 'vanity_72_bundle_ic',
      cpField: 'vanity_72_bundle_cp',
      icValue: config.vanity_72_bundle_ic,
      cpValue: config.vanity_72_bundle_cp,
    },
    {
      key: 'quartz_countertop',
      name: 'Quartz Countertop',
      description: 'Quartz fabrication and install.',
      unit: 'per sqft',
      icField: 'quartz_ic_per_sqft',
      cpField: 'quartz_cp_per_sqft',
      icValue: config.quartz_ic_per_sqft,
      cpValue: config.quartz_cp_per_sqft,
    },
  ];

  // GLASS
  const glassBuckets: TradeBucket[] = [
    {
      key: 'glass_shower_standard',
      name: 'Shower Glass - Door + Panel',
      description: 'Frameless shower door with side panel.',
      unit: 'each',
      icField: 'glass_shower_standard_ic',
      cpField: 'glass_shower_standard_cp',
      icValue: config.glass_shower_standard_ic,
      cpValue: config.glass_shower_standard_cp,
    },
    {
      key: 'glass_panel_only',
      name: 'Shower Glass - Panel Only',
      description: 'Fixed glass panel only (no door).',
      unit: 'each',
      icField: 'glass_panel_only_ic',
      cpField: 'glass_panel_only_cp',
      icValue: config.glass_panel_only_ic,
      cpValue: config.glass_panel_only_cp,
    },
    {
      key: 'glass_90_return',
      name: 'Shower Glass - 90° Return',
      description: '90 degree glass return configuration.',
      unit: 'each',
      icField: 'glass_90_return_ic',
      cpField: 'glass_90_return_cp',
      icValue: config.glass_90_return_ic,
      cpValue: config.glass_90_return_cp,
    },
  ];

  // PAINT & DRYWALL
  const paintBuckets: TradeBucket[] = [
    {
      key: 'paint_patch',
      name: 'Paint - Patch & Touch-up',
      description: 'Drywall patch and touch-up for disturbed areas.',
      unit: 'each',
      icField: 'paint_patch_bath_ic',
      cpField: 'paint_patch_bath_cp',
      icValue: config.paint_patch_bath_ic ?? 400,
      cpValue: config.paint_patch_bath_cp ?? 700,
    },
    {
      key: 'paint_full_bath',
      name: 'Paint - Full Bathroom',
      description: 'Full bathroom paint (walls and ceiling).',
      unit: 'each',
      icField: 'paint_full_bath_ic',
      cpField: 'paint_full_bath_cp',
      icValue: config.paint_full_bath_ic ?? 800,
      cpValue: config.paint_full_bath_cp ?? 1400,
    },
    {
      key: 'drywall',
      name: 'Drywall (Large Area)',
      description: 'Drywall installation and finishing.',
      unit: 'per sqft',
      icField: 'drywall_ic_per_sqft',
      cpField: 'drywall_cp_per_sqft',
      icValue: config.drywall_ic_per_sqft ?? 9,
      cpValue: config.drywall_cp_per_sqft ?? 15,
    },
  ];

  // FRAMING
  const framingBuckets: TradeBucket[] = [
    {
      key: 'framing_standard',
      name: 'Framing - Standard',
      description: 'Standard framing/blocking package.',
      unit: 'each',
      icField: 'framing_standard_ic',
      cpField: 'framing_standard_cp',
      icValue: config.framing_standard_ic ?? 900,
      cpValue: config.framing_standard_cp ?? 1400,
    },
    {
      key: 'framing_pony_wall',
      name: 'Framing - Pony Wall',
      description: 'Pony wall/knee wall construction.',
      unit: 'each',
      icField: 'framing_pony_wall_ic',
      cpField: 'framing_pony_wall_cp',
      icValue: config.framing_pony_wall_ic ?? 450,
      cpValue: config.framing_pony_wall_cp ?? 850,
    },
    {
      key: 'niche',
      name: 'Shower Niche',
      description: 'Framed shower niche.',
      unit: 'each',
      icField: 'niche_ic_each',
      cpField: 'niche_cp_each',
      icValue: config.niche_ic_each ?? 300,
      cpValue: config.niche_cp_each ?? 550,
    },
  ];

  // FLOORING
  const flooringBuckets: TradeBucket[] = [
    {
      key: 'lvp',
      name: 'LVP Flooring',
      description: 'Luxury vinyl plank installation.',
      unit: 'per sqft',
      icField: 'lvp_ic_per_sqft',
      cpField: 'lvp_cp_per_sqft',
      icValue: config.lvp_ic_per_sqft ?? 2.5,
      cpValue: config.lvp_cp_per_sqft ?? 4.5,
    },
    {
      key: 'barrier',
      name: 'Flooring Barrier/Underlayment',
      description: 'Moisture barrier or underlayment.',
      unit: 'per sqft',
      icField: 'barrier_ic_per_sqft',
      cpField: 'barrier_cp_per_sqft',
      icValue: config.barrier_ic_per_sqft ?? 1.0,
      cpValue: config.barrier_cp_per_sqft ?? 2.0,
    },
  ];

  // Build structural / complex work trade buckets
  const structuralBuckets: TradeBucket[] = [
    {
      key: 'wall_removal',
      name: 'Wall Removal / Rebuild',
      description: 'Remove or relocate interior walls.',
      unit: 'each',
      icField: 'wall_removal_ic',
      cpField: 'wall_removal_cp',
      icValue: config.wall_removal_ic ?? 1800,
      cpValue: config.wall_removal_cp ?? 2800,
    },
    {
      key: 'door_relocation',
      name: 'Door Relocation',
      description: 'Move doorway to new location.',
      unit: 'each',
      icField: 'door_relocation_ic',
      cpField: 'door_relocation_cp',
      icValue: config.door_relocation_ic ?? 1400,
      cpValue: config.door_relocation_cp ?? 2200,
    },
    {
      key: 'door_closure',
      name: 'Door Closure',
      description: 'Close/seal existing doorway.',
      unit: 'each',
      icField: 'door_closure_ic',
      cpField: 'door_closure_cp',
      icValue: config.door_closure_ic ?? 700,
      cpValue: config.door_closure_cp ?? 1100,
    },
    {
      key: 'shower_enlargement',
      name: 'Shower Enlargement',
      description: 'Expand shower footprint.',
      unit: 'each',
      icField: 'shower_enlargement_ic',
      cpField: 'shower_enlargement_cp',
      icValue: config.shower_enlargement_ic ?? 2000,
      cpValue: config.shower_enlargement_cp ?? 3200,
    },
    {
      key: 'tub_relocation',
      name: 'Tub Relocation',
      description: 'Move tub to new location.',
      unit: 'each',
      icField: 'tub_relocation_ic',
      cpField: 'tub_relocation_cp',
      icValue: config.tub_relocation_ic ?? 3000,
      cpValue: config.tub_relocation_cp ?? 4800,
    },
    {
      key: 'toilet_relocation',
      name: 'Toilet Relocation',
      description: 'Move toilet to new location.',
      unit: 'each',
      icField: 'toilet_relocation_ic',
      cpField: 'toilet_relocation_cp',
      icValue: config.toilet_relocation_ic ?? 1400,
      cpValue: config.toilet_relocation_cp ?? 2200,
    },
  ];

  // Build site prep & general conditions trade buckets
  const sitePrepBuckets: TradeBucket[] = [
    {
      key: 'floor_protection',
      name: 'Floor Protection',
      description: 'Protective floor covering.',
      unit: 'per room',
      icField: 'floor_protection_ic',
      cpField: 'floor_protection_cp',
      icValue: (config as any).floor_protection_ic ?? 150,
      cpValue: (config as any).floor_protection_cp ?? 250,
    },
    {
      key: 'dust_barriers',
      name: 'Dust Barriers',
      description: 'Dust containment barriers.',
      unit: 'each',
      icField: 'dust_barriers_ic',
      cpField: 'dust_barriers_cp',
      icValue: (config as any).dust_barriers_ic ?? 100,
      cpValue: (config as any).dust_barriers_cp ?? 200,
    },
    {
      key: 'post_construction_clean',
      name: 'Post-Construction Clean',
      description: 'Professional cleaning.',
      unit: 'per job',
      icField: 'post_construction_clean_ic',
      cpField: 'post_construction_clean_cp',
      icValue: (config as any).post_construction_clean_ic ?? 350,
      cpValue: (config as any).post_construction_clean_cp ?? 500,
    },
    {
      key: 'permit_admin_fee',
      name: 'Permit & Admin Fee',
      description: 'Permit acquisition and admin.',
      unit: 'per job',
      icField: 'permit_admin_fee_ic',
      cpField: 'permit_admin_fee_cp',
      icValue: (config as any).permit_admin_fee_ic ?? 300,
      cpValue: (config as any).permit_admin_fee_cp ?? 600,
    },
  ];

  // FINISH CARPENTRY & MILLWORK
  const finishCarpentryBuckets: TradeBucket[] = [
    {
      key: 'baseboard_install',
      name: 'Baseboard Install (Labor)',
      description: 'Install baseboard molding.',
      unit: 'per LF',
      icField: 'baseboard_install_lf_ic',
      cpField: 'baseboard_install_lf_cp',
      icValue: (config as any).baseboard_install_lf_ic ?? 3.5,
      cpValue: (config as any).baseboard_install_lf_cp ?? 6.5,
    },
    {
      key: 'crown_molding',
      name: 'Crown Molding Install',
      description: 'Install crown molding.',
      unit: 'per LF',
      icField: 'crown_molding_lf_ic',
      cpField: 'crown_molding_lf_cp',
      icValue: (config as any).crown_molding_lf_ic ?? 6,
      cpValue: (config as any).crown_molding_lf_cp ?? 12,
    },
    {
      key: 'window_door_casing',
      name: 'Window/Door Casing',
      description: 'Install casing around window or door.',
      unit: 'per opening',
      icField: 'window_door_casing_ic',
      cpField: 'window_door_casing_cp',
      icValue: (config as any).window_door_casing_ic ?? 75,
      cpValue: (config as any).window_door_casing_cp ?? 150,
    },
    {
      key: 'shoe_molding',
      name: 'Shoe Molding / Quarter Round',
      description: 'Install shoe molding or quarter round.',
      unit: 'per LF',
      icField: 'shoe_molding_lf_ic',
      cpField: 'shoe_molding_lf_cp',
      icValue: (config as any).shoe_molding_lf_ic ?? 2,
      cpValue: (config as any).shoe_molding_lf_cp ?? 4,
    },
    {
      key: 'wainscoting',
      name: 'Wainscoting / Shiplap',
      description: 'Install wainscoting or shiplap.',
      unit: 'per sqft',
      icField: 'wainscoting_sqft_ic',
      cpField: 'wainscoting_sqft_cp',
      icValue: (config as any).wainscoting_sqft_ic ?? 12,
      cpValue: (config as any).wainscoting_sqft_cp ?? 22,
    },
  ];

  // ELECTRICAL SYSTEMS & UPGRADES
  const electricalUpgradesBuckets: TradeBucket[] = [
    {
      key: 'panel_upgrade_200a',
      name: 'Main Panel Upgrade (200A)',
      description: 'Upgrade main electrical panel to 200 amp.',
      unit: 'each',
      icField: 'panel_upgrade_200a_ic',
      cpField: 'panel_upgrade_200a_cp',
      icValue: (config as any).panel_upgrade_200a_ic ?? 2500,
      cpValue: (config as any).panel_upgrade_200a_cp ?? 3800,
    },
    {
      key: 'dedicated_circuit_240v',
      name: 'Dedicated Circuit (240V)',
      description: 'Install dedicated 240V circuit.',
      unit: 'each',
      icField: 'dedicated_circuit_240v_ic',
      cpField: 'dedicated_circuit_240v_cp',
      icValue: (config as any).dedicated_circuit_240v_ic ?? 450,
      cpValue: (config as any).dedicated_circuit_240v_cp ?? 850,
    },
    {
      key: 'undercab_led',
      name: 'Under-Cabinet LED Tape Light',
      description: 'Install LED tape lighting under cabinets.',
      unit: 'per cabinet run',
      icField: 'undercab_led_ic',
      cpField: 'undercab_led_cp',
      icValue: (config as any).undercab_led_ic ?? 400,
      cpValue: (config as any).undercab_led_cp ?? 750,
    },
    {
      key: 'heated_floor',
      name: 'Heated Floor System (Mat + Stat)',
      description: 'Electric radiant floor heating with thermostat.',
      unit: 'per sqft',
      icField: 'heated_floor_sqft_ic',
      cpField: 'heated_floor_sqft_cp',
      icValue: (config as any).heated_floor_sqft_ic ?? 18,
      cpValue: (config as any).heated_floor_sqft_cp ?? 32,
    },
  ];

  // LUXURY PLUMBING & GAS
  const luxuryPlumbingBuckets: TradeBucket[] = [
    {
      key: 'steam_generator',
      name: 'Steam Generator Install',
      description: 'Install steam generator for shower.',
      unit: 'each',
      icField: 'steam_generator_ic',
      cpField: 'steam_generator_cp',
      icValue: (config as any).steam_generator_ic ?? 1200,
      cpValue: (config as any).steam_generator_cp ?? 2200,
    },
    {
      key: 'gas_line_new',
      name: 'Gas Line Run (New)',
      description: 'Run new gas line.',
      unit: 'each',
      icField: 'gas_line_new_ic',
      cpField: 'gas_line_new_cp',
      icValue: (config as any).gas_line_new_ic ?? 800,
      cpValue: (config as any).gas_line_new_cp ?? 1500,
    },
    {
      key: 'pot_filler',
      name: 'Pot Filler Rough + Trim',
      description: 'Install pot filler faucet.',
      unit: 'each',
      icField: 'pot_filler_ic',
      cpField: 'pot_filler_cp',
      icValue: (config as any).pot_filler_ic ?? 550,
      cpValue: (config as any).pot_filler_cp ?? 950,
    },
    {
      key: 'tankless_water_heater',
      name: 'Tankless Water Heater Install',
      description: 'Install tankless water heater.',
      unit: 'each',
      icField: 'tankless_water_heater_ic',
      cpField: 'tankless_water_heater_cp',
      icValue: (config as any).tankless_water_heater_ic ?? 1800,
      cpValue: (config as any).tankless_water_heater_cp ?? 3200,
    },
  ];

  // LOGISTICS & ADMIN
  const logisticsAdminBuckets: TradeBucket[] = [
    {
      key: 'portable_toilet',
      name: 'Portable Toilet Rental',
      description: 'Portable toilet rental for job site.',
      unit: 'per month',
      icField: 'portable_toilet_ic',
      cpField: 'portable_toilet_cp',
      icValue: (config as any).portable_toilet_ic ?? 150,
      cpValue: (config as any).portable_toilet_cp ?? 250,
    },
    {
      key: 'engineering_stamp',
      name: 'Engineering / Architect Stamp',
      description: 'Engineering or architectural review and stamp.',
      unit: 'per job',
      icField: 'engineering_stamp_ic',
      cpField: 'engineering_stamp_cp',
      icValue: (config as any).engineering_stamp_ic ?? 800,
      cpValue: (config as any).engineering_stamp_cp ?? 1500,
    },
    {
      key: 'hoa_access_fee',
      name: 'Condo/HOA Access Fee',
      description: 'Building access/elevator reservation fees.',
      unit: 'per job',
      icField: 'hoa_access_fee_ic',
      cpField: 'hoa_access_fee_cp',
      icValue: (config as any).hoa_access_fee_ic ?? 0,
      cpValue: (config as any).hoa_access_fee_cp ?? 500,
    },
  ];

  // Build mechanicals & appliances trade buckets
  const mechanicalsBuckets: TradeBucket[] = [
    {
      key: 'hvac_vent_relocate',
      name: 'HVAC Vent Relocation',
      description: 'Move existing HVAC vent.',
      unit: 'each',
      icField: 'hvac_vent_relocate_ic',
      cpField: 'hvac_vent_relocate_cp',
      icValue: (config as any).hvac_vent_relocate_ic ?? 250,
      cpValue: (config as any).hvac_vent_relocate_cp ?? 450,
    },
    {
      key: 'range_hood_ducting',
      name: 'Range Hood Ducting',
      description: 'New ductwork for range hood.',
      unit: 'each',
      icField: 'range_hood_ducting_ic',
      cpField: 'range_hood_ducting_cp',
      icValue: (config as any).range_hood_ducting_ic ?? 450,
      cpValue: (config as any).range_hood_ducting_cp ?? 850,
    },
    {
      key: 'appliance_install_standard',
      name: 'Appliance Install - Standard',
      description: 'Standard appliance package.',
      unit: 'per kitchen',
      icField: 'appliance_install_standard_ic',
      cpField: 'appliance_install_standard_cp',
      icValue: (config as any).appliance_install_standard_ic ?? 350,
      cpValue: (config as any).appliance_install_standard_cp ?? 650,
    },
    {
      key: 'appliance_install_pro',
      name: 'Appliance Install - Pro/Built-in',
      description: 'Pro or built-in appliance install.',
      unit: 'per kitchen',
      icField: 'appliance_install_pro_ic',
      cpField: 'appliance_install_pro_cp',
      icValue: (config as any).appliance_install_pro_ic ?? 800,
      cpValue: (config as any).appliance_install_pro_cp ?? 1400,
    },
  ];

  // Build allowances
  const allowances = [
    {
      key: 'tile_material',
      label: 'Wall Tile Material',
      field: 'tile_material_allowance_cp_per_sqft',
      value: config.tile_material_allowance_cp_per_sqft,
      unit: 'per sqft',
      description: 'Includes wall tile material, thin-set, grout, and sealer.',
    },
    {
      key: 'floor_tile_material',
      label: 'Floor Tile Material',
      field: 'tile_floor_ic_per_sqft',
      value: config.tile_floor_ic_per_sqft ?? 4.5,
      unit: 'per sqft',
      description: 'Floor tile material cost per square foot.',
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
      key: 'granite_slab',
      label: 'Granite Slab',
      field: 'granite_slab_allowance_cp',
      value: (config as any).granite_slab_allowance_cp ?? 1200,
      unit: 'per slab',
      description: 'Granite slab material allowance.',
    },
    {
      key: 'quartzite_slab',
      label: 'Quartzite Slab',
      field: 'quartzite_slab_allowance_cp',
      value: (config as any).quartzite_slab_allowance_cp ?? 1800,
      unit: 'per slab',
      description: 'Quartzite slab material allowance (premium natural stone).',
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
          pricingMode={pricingMode}
          onTargetMarginChange={(value) => handleChange('target_margin', value)}
          onManagementFeeChange={(value) => handleChange('management_fee_percent', value)}
          onMarketDescriptionChange={setMarketDescription}
          onPricingModeChange={setPricingMode}
          onApplyMarginToAll={handleApplyMarginToAll}
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

        {/* TRADE-BASED SECTIONS */}
        
        {/* Demo Section - 4 Sub-Categories */}
        <AccordionSection 
          title="Demolition & Haul" 
          icon={<HardHat className="h-5 w-5" />}
          defaultOpen={true}
        >
          <div className="space-y-4">
            <TradeBucketsCard
              title="Site Protection & Setup"
              description="Floor protection, dust barriers, air scrubbers, moving."
              icon={<HardHat className="h-5 w-5" />}
              buckets={siteProtectionBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Standard Demolition"
              description="Kitchen and bath gut, soffit demo, cabinet deconstruction."
              icon={<HardHat className="h-5 w-5" />}
              buckets={standardDemoBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Heavy/Difficult Demo (Surcharges)"
              description="Mud-set tile, cast iron tub, glued-down, popcorn ceiling."
              icon={<HardHat className="h-5 w-5" />}
              buckets={heavyDemoBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Disposal & Logistics"
              description="Dumpsters, haul-away, difficult access fees."
              icon={<Truck className="h-5 w-5" />}
              buckets={disposalBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
          </div>
        </AccordionSection>

        {/* Plumbing */}
        <AccordionSection 
          title="Plumbing" 
          icon={<Wrench className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Plumbing"
            description="Shower rough-in, toilet, tub, drains."
            icon={<Wrench className="h-5 w-5" />}
            buckets={plumbingBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* Electrical */}
        <AccordionSection 
          title="Electrical" 
          icon={<Settings2 className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Electrical"
            description="Lighting, cans, switches, outlets."
            icon={<Settings2 className="h-5 w-5" />}
            buckets={electricalBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* Tile & Waterproofing */}
        <AccordionSection 
          title="Tile & Waterproofing" 
          icon={<Bath className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Tile & Waterproofing"
            description="Wall tile, floor tile, cement board, waterproofing."
            icon={<Bath className="h-5 w-5" />}
            buckets={tileBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* Cabinetry & Vanities */}
        <AccordionSection 
          title="Cabinetry & Vanities" 
          icon={<ChefHat className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Cabinetry & Vanities"
            description="Kitchen cabinets, vanity bundles, countertops."
            icon={<ChefHat className="h-5 w-5" />}
            buckets={cabinetryBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* Glass */}
        <AccordionSection 
          title="Glass" 
          icon={<Bath className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Glass"
            description="Shower glass doors and panels."
            icon={<Bath className="h-5 w-5" />}
            buckets={glassBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* Paint & Drywall */}
        <AccordionSection 
          title="Paint & Drywall" 
          icon={<Palette className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Paint & Drywall"
            description="Paint touch-up, full paint, drywall."
            icon={<Palette className="h-5 w-5" />}
            buckets={paintBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* Framing */}
        <AccordionSection 
          title="Framing" 
          icon={<HardHat className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Framing"
            description="Standard framing, pony walls, niches."
            icon={<HardHat className="h-5 w-5" />}
            buckets={framingBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* Flooring */}
        <AccordionSection 
          title="Flooring" 
          icon={<Bath className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Flooring"
            description="LVP, underlayment, barriers."
            icon={<Bath className="h-5 w-5" />}
            buckets={flooringBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* Structural / Complex Work */}
        <AccordionSection 
          title="Structural / Complex Work" 
          icon={<HardHat className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Structural / Complex Work"
            description="Wall removal, relocations, major changes."
            icon={<HardHat className="h-5 w-5" />}
            buckets={structuralBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* Site Prep & General Conditions */}
        <AccordionSection 
          title="Site Prep & General Conditions" 
          icon={<Truck className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Site Prep & General Conditions"
            description="Protection, cleaning, permits."
            icon={<Truck className="h-5 w-5" />}
            buckets={sitePrepBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* Mechanicals & Appliances */}
        <AccordionSection 
          title="Mechanicals & Appliances" 
          icon={<Thermometer className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Mechanicals & Appliances"
            description="HVAC, range hood, appliance install."
            icon={<Thermometer className="h-5 w-5" />}
            buckets={mechanicalsBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* Finish Carpentry & Millwork */}
        <AccordionSection 
          title="Finish Carpentry & Millwork" 
          icon={<HardHat className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Finish Carpentry & Millwork"
            description="Baseboards, crown molding, wainscoting, casings."
            icon={<HardHat className="h-5 w-5" />}
            buckets={finishCarpentryBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* Electrical Systems & Upgrades */}
        <AccordionSection 
          title="Electrical Systems & Upgrades" 
          icon={<Settings2 className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Electrical Systems & Upgrades"
            description="Panel upgrades, 240V circuits, heated floors, LED tape."
            icon={<Settings2 className="h-5 w-5" />}
            buckets={electricalUpgradesBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* Luxury Plumbing & Gas */}
        <AccordionSection 
          title="Luxury Plumbing & Gas" 
          icon={<Wrench className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Luxury Plumbing & Gas"
            description="Steam, gas lines, pot fillers, tankless water heaters."
            icon={<Wrench className="h-5 w-5" />}
            buckets={luxuryPlumbingBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* Logistics & Admin */}
        <AccordionSection 
          title="Logistics & Admin" 
          icon={<Truck className="h-5 w-5" />}
          defaultOpen={false}
        >
          <TradeBucketsCard
            title="Logistics & Admin"
            description="Portable toilets, engineering stamps, HOA fees."
            icon={<Truck className="h-5 w-5" />}
            buckets={logisticsAdminBuckets}
            onChange={handleChange}
            targetMargin={config.target_margin}
            pricingMode={pricingMode}
          />
        </AccordionSection>

        {/* 9. Allowances - Collapsed by default */}
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
