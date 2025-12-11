import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { PricingConfig } from '@/types/database';
import { Save, RefreshCw, RotateCcw, ChevronDown, Truck, Settings2, Thermometer, Search, X, Filter } from 'lucide-react';
import { Bath, ChefHat, Wrench, HardHat, Palette, Zap, Droplets, Shield, Home, Hammer, Sparkles, AlertCircle, FileText, DoorOpen, Layers, Plug, Flame, Scissors, Info } from 'lucide-react';
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
import { TradeBucketsCard, TradeBucket } from '@/components/pricing/TradeBucketsCard';
import { AllowancesCard } from '@/components/pricing/AllowancesCard';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';


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
  laminate_ic_per_sqft: 2.25,
  laminate_cp_per_sqft: 4,
  hardwood_ic_per_sqft: 6,
  hardwood_cp_per_sqft: 10,
  hardwood_refinish_ic_per_sqft: 3.5,
  hardwood_refinish_cp_per_sqft: 6,
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
  paint_sqft_ic: 1.5,
  paint_sqft_cp: 2.75,
  paint_patch_bath_ic: 400,
  paint_patch_bath_cp: 700,
  paint_postjob_touchup_ic: 150,
  paint_postjob_touchup_cp: 275,
  paint_full_bath_ic: 800,
  paint_full_bath_cp: 1400,
  paint_full_kitchen_ic: 1200,
  paint_full_kitchen_cp: 2000,
  paint_trim_ic: 2,
  paint_trim_cp: 3.5,
  paint_ceiling_ic: 250,
  paint_ceiling_cp: 450,
  paint_door_ic: 75,
  paint_door_cp: 135,
  paint_stair_railing_ic: 350,
  paint_stair_railing_cp: 600,
  paint_cabinets_ic: 45,
  paint_cabinets_cp: 85,
  paint_exterior_siding_ic: 1.75,
  paint_exterior_siding_cp: 3.25,
  paint_exterior_trim_ic: 3,
  paint_exterior_trim_cp: 5.5,
  paint_front_door_ic: 150,
  paint_front_door_cp: 275,
  paint_shutters_ic: 45,
  paint_shutters_cp: 85,
  paint_deck_fence_ic: 2,
  paint_deck_fence_cp: 3.75,
  wallpaper_removal_ic: 1.5,
  wallpaper_removal_cp: 2.75,
  wallpaper_install_ic: 3,
  wallpaper_install_cp: 5.5,
  accent_wall_ic: 125,
  accent_wall_cp: 225,
  
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
  vanity_96_bundle_ic: 3800,
  vanity_96_bundle_cp: 6000,
  
  // Quartz & Counters
  quartz_material_allowance_ic: 25, // Material cost per sqft (IC)
  quartz_ic_per_sqft: 15,           // Fabrication/install cost per sqft (IC)
  quartz_cp_per_sqft: 50,           // Will be calculated from margin
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
  
  // Cabinet pricing (material + install = total IC, CP from margin)
  cabinet_material_allowance_ic: 150, // Material cost per box (IC)
  cabinet_install_only_lf_ic: 50,     // Install labor per box (IC)
  cabinet_lf_ic: 200,                 // Total IC (material + install) - calculated
  cabinet_lf_cp: 322,                 // CP = 200 / (1 - 0.38)
  cabinet_install_only_lf_cp: 85,     // Install only CP
  
  // Tile pricing (material + labor = total IC, CP from margin)
  tile_material_allowance_ic: 5,      // Material cost per sqft (IC)
  
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
  
  // Water Damage & Rot Repair
  subfloor_replacement_ic: 8,
  subfloor_replacement_cp: 15,
  joist_sister_ic: 25,
  joist_sister_cp: 45,
  mold_remediation_ic: 1500,
  mold_remediation_cp: 2800,
  moisture_barrier_upgrade_ic: 2,
  moisture_barrier_upgrade_cp: 4,
  
  // Hidden Structural Issues
  load_bearing_beam_ic: 2500,
  load_bearing_beam_cp: 4500,
  foundation_slab_repair_ic: 3000,
  foundation_slab_repair_cp: 5500,
  engineered_drawings_ic: 800,
  engineered_drawings_cp: 1500,
  temporary_shoring_ic: 600,
  temporary_shoring_cp: 1100,
  
  // Code-Mandated Upgrades
  gfci_outlet_ic: 45,
  gfci_outlet_cp: 85,
  afci_breaker_ic: 150,
  afci_breaker_cp: 280,
  vent_fan_upgrade_ic: 250,
  vent_fan_upgrade_cp: 450,
  tempered_glass_req_ic: 200,
  tempered_glass_req_cp: 380,
  egress_window_ic: 2500,
  egress_window_cp: 4500,
  handrail_install_ic: 350,
  handrail_install_cp: 650,
  
  // Occupied Home Premiums
  daily_cleanup_ic: 75,
  daily_cleanup_cp: 125,
  temp_kitchen_ic: 800,
  temp_kitchen_cp: 1500,
  bathroom_trailer_ic: 400,
  bathroom_trailer_cp: 700,
  quiet_hours_premium_ic: 500,
  quiet_hours_premium_cp: 900,
  weekend_afterhours_ic: 85,
  weekend_afterhours_cp: 150,
  
  // Trim & Millwork (Extended)
  baseboard_custom_ic: 6,
  baseboard_custom_cp: 11,
  chair_rail_ic: 4,
  chair_rail_cp: 8,
  window_casing_ic: 85,
  window_casing_cp: 160,
  door_casing_ic: 75,
  door_casing_cp: 140,
  coffered_ceiling_ic: 35,
  coffered_ceiling_cp: 65,
  custom_builtins_ic: 120,
  custom_builtins_cp: 220,
  floating_shelves_ic: 85,
  floating_shelves_cp: 160,
  
  // Specialty Plumbing Systems
  recirc_pump_ic: 450,
  recirc_pump_cp: 850,
  water_softener_ic: 350,
  water_softener_cp: 650,
  pot_filler_roughin_ic: 400,
  pot_filler_roughin_cp: 750,
  ice_maker_line_ic: 8,
  ice_maker_line_cp: 15,
  gas_line_range_ic: 18,
  gas_line_range_cp: 32,
  pressure_balance_valve_ic: 180,
  pressure_balance_valve_cp: 340,
  steam_roughin_ic: 650,
  steam_roughin_cp: 1200,
  floor_heat_manifold_ic: 550,
  floor_heat_manifold_cp: 1000,
  
  // Smart Home / Specialty Electrical
  toekick_lighting_ic: 12,
  toekick_lighting_cp: 22,
  indrawer_outlet_ic: 150,
  indrawer_outlet_cp: 280,
  usb_outlet_ic: 35,
  usb_outlet_cp: 65,
  smart_switch_ic: 75,
  smart_switch_cp: 140,
  subpanel_install_ic: 1200,
  subpanel_install_cp: 2200,
  ev_charger_circuit_ic: 650,
  ev_charger_circuit_cp: 1200,
  heat_lamp_fan_ic: 350,
  heat_lamp_fan_cp: 650,
  
  // Cabinet Customization
  soft_close_hinge_ic: 8,
  soft_close_hinge_cp: 15,
  pullout_trash_ic: 180,
  pullout_trash_cp: 340,
  lazy_susan_ic: 250,
  lazy_susan_cp: 450,
  spice_rack_pullout_ic: 120,
  spice_rack_pullout_cp: 220,
  tray_divider_ic: 65,
  tray_divider_cp: 120,
  drawer_peg_system_ic: 45,
  drawer_peg_system_cp: 85,
  appliance_garage_ic: 350,
  appliance_garage_cp: 650,
  open_shelving_conv_ic: 200,
  open_shelving_conv_cp: 380,
  glass_door_insert_ic: 120,
  glass_door_insert_cp: 220,
  
  // Tile Specialty Work
  accent_tile_band_ic: 18,
  accent_tile_band_cp: 35,
  herringbone_premium_ic: 8,
  herringbone_premium_cp: 15,
  large_format_premium_ic: 6,
  large_format_premium_cp: 12,
  mosaic_penny_tile_ic: 28,
  mosaic_penny_tile_cp: 52,
  bullnose_trim_ic: 12,
  bullnose_trim_cp: 22,
  shower_curb_cap_ic: 25,
  shower_curb_cap_cp: 45,
  schluter_profile_ic: 15,
  schluter_profile_cp: 28,
  
  // Countertop Fabrication Add-Ons
  undermount_sink_cutout_ic: 150,
  undermount_sink_cutout_cp: 280,
  cooktop_cutout_ic: 200,
  cooktop_cutout_cp: 380,
  edge_profile_upgrade_ic: 18,
  edge_profile_upgrade_cp: 35,
  fullheight_backsplash_ic: 45,
  fullheight_backsplash_cp: 85,
  outlet_cutout_ic: 75,
  outlet_cutout_cp: 140,
  waterfall_mitered_ic: 350,
  waterfall_mitered_cp: 650,
  
  // Decorative Finishes
  accent_shiplap_ic: 18,
  accent_shiplap_cp: 35,
  ceiling_beams_ic: 45,
  ceiling_beams_cp: 85,
  tile_fireplace_ic: 1800,
  tile_fireplace_cp: 3400,
  custom_mirror_frame_ic: 250,
  custom_mirror_frame_cp: 480,
  medicine_cab_recess_ic: 200,
  medicine_cab_recess_cp: 380,
  niche_led_strip_ic: 120,
  niche_led_strip_cp: 220,
  grout_sealing_ic: 2,
  grout_sealing_cp: 4,
  
  // Contingency & Protection
  unforeseen_allowance_pct: 0.05,
  asbestos_testing_ic: 250,
  asbestos_testing_cp: 450,
  lead_paint_testing_ic: 150,
  lead_paint_testing_cp: 280,
  warranty_registration_ic: 50,
  warranty_registration_cp: 100,
  asbuilt_documentation_ic: 300,
  asbuilt_documentation_cp: 550,
  touchup_visit_ic: 150,
  touchup_visit_cp: 280,
  
  // Miscellaneous Always-Needed
  interior_door_ic: 350,
  interior_door_cp: 650,
  door_hardware_ic: 45,
  door_hardware_cp: 85,
  closet_shelving_ic: 400,
  closet_shelving_cp: 750,
  towel_bar_tp_ic: 65,
  towel_bar_tp_cp: 120,
  grab_bar_ic: 120,
  grab_bar_cp: 220,
  shower_rod_curved_ic: 85,
  shower_rod_curved_cp: 160,
  caulking_sealing_ic: 150,
  caulking_sealing_cp: 280,
  touchup_paint_kit_ic: 75,
  touchup_paint_kit_cp: 140,
  walkthrough_punchlist_ic: 85,
  walkthrough_punchlist_cp: 150,
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
  const [searchQuery, setSearchQuery] = useState('');

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
      ['paint_sqft_ic', 'paint_sqft_cp'],
      ['paint_patch_bath_ic', 'paint_patch_bath_cp'],
      ['paint_postjob_touchup_ic', 'paint_postjob_touchup_cp'],
      ['paint_full_bath_ic', 'paint_full_bath_cp'],
      ['paint_full_kitchen_ic', 'paint_full_kitchen_cp'],
      ['paint_trim_ic', 'paint_trim_cp'],
      ['paint_ceiling_ic', 'paint_ceiling_cp'],
      ['paint_door_ic', 'paint_door_cp'],
      ['paint_stair_railing_ic', 'paint_stair_railing_cp'],
      ['paint_cabinets_ic', 'paint_cabinets_cp'],
      ['paint_exterior_siding_ic', 'paint_exterior_siding_cp'],
      ['paint_exterior_trim_ic', 'paint_exterior_trim_cp'],
      ['paint_front_door_ic', 'paint_front_door_cp'],
      ['paint_shutters_ic', 'paint_shutters_cp'],
      ['paint_deck_fence_ic', 'paint_deck_fence_cp'],
      ['wallpaper_removal_ic', 'wallpaper_removal_cp'],
      ['wallpaper_install_ic', 'wallpaper_install_cp'],
      ['accent_wall_ic', 'accent_wall_cp'],
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
      ['vanity_96_bundle_ic', 'vanity_96_bundle_cp'],
      ['quartz_ic_per_sqft', 'quartz_cp_per_sqft'],
      ['framing_standard_ic', 'framing_standard_cp'],
      ['framing_pony_wall_ic', 'framing_pony_wall_cp'],
      ['niche_ic_each', 'niche_cp_each'],
      ['floor_leveling_small_ic', 'floor_leveling_small_cp'],
      ['floor_leveling_bath_ic', 'floor_leveling_bath_cp'],
      ['floor_leveling_kitchen_ic', 'floor_leveling_kitchen_cp'],
      ['floor_leveling_ls_ic', 'floor_leveling_ls_cp'],
      ['lvp_ic_per_sqft', 'lvp_cp_per_sqft'],
      ['laminate_ic_per_sqft', 'laminate_cp_per_sqft'],
      ['hardwood_ic_per_sqft', 'hardwood_cp_per_sqft'],
      ['hardwood_refinish_ic_per_sqft', 'hardwood_refinish_cp_per_sqft'],
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
      // Water Damage & Rot Repair
      ['subfloor_replacement_ic', 'subfloor_replacement_cp'],
      ['joist_sister_ic', 'joist_sister_cp'],
      ['mold_remediation_ic', 'mold_remediation_cp'],
      ['moisture_barrier_upgrade_ic', 'moisture_barrier_upgrade_cp'],
      // Hidden Structural Issues
      ['load_bearing_beam_ic', 'load_bearing_beam_cp'],
      ['foundation_slab_repair_ic', 'foundation_slab_repair_cp'],
      ['engineered_drawings_ic', 'engineered_drawings_cp'],
      ['temporary_shoring_ic', 'temporary_shoring_cp'],
      // Code-Mandated Upgrades
      ['gfci_outlet_ic', 'gfci_outlet_cp'],
      ['afci_breaker_ic', 'afci_breaker_cp'],
      ['vent_fan_upgrade_ic', 'vent_fan_upgrade_cp'],
      ['tempered_glass_req_ic', 'tempered_glass_req_cp'],
      ['egress_window_ic', 'egress_window_cp'],
      ['handrail_install_ic', 'handrail_install_cp'],
      // Occupied Home Premiums
      ['daily_cleanup_ic', 'daily_cleanup_cp'],
      ['temp_kitchen_ic', 'temp_kitchen_cp'],
      ['bathroom_trailer_ic', 'bathroom_trailer_cp'],
      ['quiet_hours_premium_ic', 'quiet_hours_premium_cp'],
      ['weekend_afterhours_ic', 'weekend_afterhours_cp'],
      // Trim & Millwork Extended
      ['baseboard_custom_ic', 'baseboard_custom_cp'],
      ['chair_rail_ic', 'chair_rail_cp'],
      ['window_casing_ic', 'window_casing_cp'],
      ['door_casing_ic', 'door_casing_cp'],
      ['coffered_ceiling_ic', 'coffered_ceiling_cp'],
      ['custom_builtins_ic', 'custom_builtins_cp'],
      ['floating_shelves_ic', 'floating_shelves_cp'],
      // Specialty Plumbing Systems
      ['recirc_pump_ic', 'recirc_pump_cp'],
      ['water_softener_ic', 'water_softener_cp'],
      ['pot_filler_roughin_ic', 'pot_filler_roughin_cp'],
      ['ice_maker_line_ic', 'ice_maker_line_cp'],
      ['gas_line_range_ic', 'gas_line_range_cp'],
      ['pressure_balance_valve_ic', 'pressure_balance_valve_cp'],
      ['steam_roughin_ic', 'steam_roughin_cp'],
      ['floor_heat_manifold_ic', 'floor_heat_manifold_cp'],
      // Smart Home / Specialty Electrical
      ['toekick_lighting_ic', 'toekick_lighting_cp'],
      ['indrawer_outlet_ic', 'indrawer_outlet_cp'],
      ['usb_outlet_ic', 'usb_outlet_cp'],
      ['smart_switch_ic', 'smart_switch_cp'],
      ['subpanel_install_ic', 'subpanel_install_cp'],
      ['ev_charger_circuit_ic', 'ev_charger_circuit_cp'],
      ['heat_lamp_fan_ic', 'heat_lamp_fan_cp'],
      // Cabinet Customization
      ['soft_close_hinge_ic', 'soft_close_hinge_cp'],
      ['pullout_trash_ic', 'pullout_trash_cp'],
      ['lazy_susan_ic', 'lazy_susan_cp'],
      ['spice_rack_pullout_ic', 'spice_rack_pullout_cp'],
      ['tray_divider_ic', 'tray_divider_cp'],
      ['drawer_peg_system_ic', 'drawer_peg_system_cp'],
      ['appliance_garage_ic', 'appliance_garage_cp'],
      ['open_shelving_conv_ic', 'open_shelving_conv_cp'],
      ['glass_door_insert_ic', 'glass_door_insert_cp'],
      // Tile Specialty Work
      ['accent_tile_band_ic', 'accent_tile_band_cp'],
      ['herringbone_premium_ic', 'herringbone_premium_cp'],
      ['large_format_premium_ic', 'large_format_premium_cp'],
      ['mosaic_penny_tile_ic', 'mosaic_penny_tile_cp'],
      ['bullnose_trim_ic', 'bullnose_trim_cp'],
      ['shower_curb_cap_ic', 'shower_curb_cap_cp'],
      ['schluter_profile_ic', 'schluter_profile_cp'],
      // Countertop Fabrication Add-Ons
      ['undermount_sink_cutout_ic', 'undermount_sink_cutout_cp'],
      ['cooktop_cutout_ic', 'cooktop_cutout_cp'],
      ['edge_profile_upgrade_ic', 'edge_profile_upgrade_cp'],
      ['fullheight_backsplash_ic', 'fullheight_backsplash_cp'],
      ['outlet_cutout_ic', 'outlet_cutout_cp'],
      ['waterfall_mitered_ic', 'waterfall_mitered_cp'],
      // Decorative Finishes
      ['accent_shiplap_ic', 'accent_shiplap_cp'],
      ['ceiling_beams_ic', 'ceiling_beams_cp'],
      ['tile_fireplace_ic', 'tile_fireplace_cp'],
      ['custom_mirror_frame_ic', 'custom_mirror_frame_cp'],
      ['medicine_cab_recess_ic', 'medicine_cab_recess_cp'],
      ['niche_led_strip_ic', 'niche_led_strip_cp'],
      ['grout_sealing_ic', 'grout_sealing_cp'],
      // Contingency & Protection
      ['asbestos_testing_ic', 'asbestos_testing_cp'],
      ['lead_paint_testing_ic', 'lead_paint_testing_cp'],
      ['warranty_registration_ic', 'warranty_registration_cp'],
      ['asbuilt_documentation_ic', 'asbuilt_documentation_cp'],
      ['touchup_visit_ic', 'touchup_visit_cp'],
      // Miscellaneous Always-Needed
      ['interior_door_ic', 'interior_door_cp'],
      ['door_hardware_ic', 'door_hardware_cp'],
      ['closet_shelving_ic', 'closet_shelving_cp'],
      ['towel_bar_tp_ic', 'towel_bar_tp_cp'],
      ['grab_bar_ic', 'grab_bar_cp'],
      ['shower_rod_curved_ic', 'shower_rod_curved_cp'],
      ['caulking_sealing_ic', 'caulking_sealing_cp'],
      ['touchup_paint_kit_ic', 'touchup_paint_kit_cp'],
      ['walkthrough_punchlist_ic', 'walkthrough_punchlist_cp'],
    ];
    
    // Default IC values for fields not in the database yet
    const icDefaults: Record<string, number> = {
      ...TKBSO_DEFAULTS as Record<string, number>,
    };

    for (const [icField, cpField] of icCpPairs) {
      // Use config value or fall back to default
      const icValue = (updatedConfig as any)[icField] ?? icDefaults[icField];
      if (icValue != null && icValue > 0) {
        const cpValue = icValue / (1 - margin);
        (updatedConfig as any)[icField] = icValue; // ensure IC is set
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
      unit: 'each',
      icField: 'demo_soffit_lf_ic',
      cpField: 'demo_soffit_lf_cp',
      icValue: (config as any).demo_soffit_lf_ic ?? 150,
      cpValue: (config as any).demo_soffit_lf_cp ?? 300,
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
      key: 'outlet_install',
      name: 'Outlet Install',
      description: 'Install new electrical outlet.',
      unit: 'each',
      icField: 'outlet_install_ic',
      cpField: 'outlet_install_cp',
      icValue: (config as any).outlet_install_ic ?? 65,
      cpValue: (config as any).outlet_install_cp ?? 120,
    },
    {
      key: 'switch_install',
      name: 'Switch Install',
      description: 'Install new light switch.',
      unit: 'each',
      icField: 'switch_install_ic',
      cpField: 'switch_install_cp',
      icValue: (config as any).switch_install_ic ?? 55,
      cpValue: (config as any).switch_install_cp ?? 100,
    },
    {
      key: 'dimmer_upgrade',
      name: 'Dimmer Switch Upgrade',
      description: 'Upgrade standard switch to dimmer.',
      unit: 'each',
      icField: 'dimmer_upgrade_ic',
      cpField: 'dimmer_upgrade_cp',
      icValue: (config as any).dimmer_upgrade_ic ?? 75,
      cpValue: (config as any).dimmer_upgrade_cp ?? 140,
    },
    {
      key: 'new_line_run',
      name: 'New Line Run',
      description: 'Run new electrical line/circuit.',
      unit: 'each',
      icField: 'new_line_run_ic',
      cpField: 'new_line_run_cp',
      icValue: (config as any).new_line_run_ic ?? 250,
      cpValue: (config as any).new_line_run_cp ?? 450,
    },
    {
      key: 'dishwasher_circuit',
      name: 'Dedicated Dishwasher Circuit',
      description: 'Separate circuit for dishwasher.',
      unit: 'each',
      icField: 'dishwasher_circuit_ic',
      cpField: 'dishwasher_circuit_cp',
      icValue: (config as any).dishwasher_circuit_ic ?? 200,
      cpValue: (config as any).dishwasher_circuit_cp ?? 375,
    },
    {
      key: 'breaker_install',
      name: 'Breaker Install',
      description: 'Install new circuit breaker.',
      unit: 'each',
      icField: 'breaker_install_ic',
      cpField: 'breaker_install_cp',
      icValue: (config as any).breaker_install_ic ?? 125,
      cpValue: (config as any).breaker_install_cp ?? 225,
    },
    {
      key: 'gfci_install',
      name: 'GFCI Outlet Install',
      description: 'Install GFCI protected outlet.',
      unit: 'each',
      icField: 'gfci_install_ic',
      cpField: 'gfci_install_cp',
      icValue: (config as any).gfci_install_ic ?? 85,
      cpValue: (config as any).gfci_install_cp ?? 150,
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
      key: 'tile_material',
      name: 'Tile Material Allowance',
      description: 'Material cost per sqft (tile, grout, thinset, sealer).',
      unit: 'per sqft',
      icField: 'tile_material_allowance_ic',
      cpField: 'tile_material_allowance_cp_per_sqft',
      icValue: (config as any).tile_material_allowance_ic ?? 5,
      cpValue: config.tile_material_allowance_cp_per_sqft ?? 8,
    },
    {
      key: 'tile_wall',
      name: 'Wall Tile Labor',
      description: 'Shower walls, vertical tile labor.',
      unit: 'per sqft',
      icField: 'tile_wall_ic_per_sqft',
      cpField: 'tile_wall_cp_per_sqft',
      icValue: config.tile_wall_ic_per_sqft ?? 21,
      cpValue: (config as any).tile_wall_cp_per_sqft ?? 34,
    },
    {
      key: 'tile_shower_floor',
      name: 'Shower Floor Tile Labor',
      description: 'Shower floor tile installation labor.',
      unit: 'per sqft',
      icField: 'tile_shower_floor_ic_per_sqft',
      cpField: 'tile_shower_floor_cp_per_sqft',
      icValue: config.tile_shower_floor_ic_per_sqft ?? 5,
      cpValue: (config as any).tile_shower_floor_cp_per_sqft ?? 8,
    },
    {
      key: 'tile_floor',
      name: 'Main Floor Tile Labor',
      description: 'Main floor tile installation labor.',
      unit: 'per sqft',
      icField: 'tile_floor_ic_per_sqft',
      cpField: 'tile_floor_cp_per_sqft',
      icValue: config.tile_floor_ic_per_sqft ?? 4.5,
      cpValue: (config as any).tile_floor_cp_per_sqft ?? 7,
    },
    {
      key: 'cement_board',
      name: 'Cement Board / Backer',
      description: 'Backer board installation.',
      unit: 'per sqft',
      icField: 'cement_board_ic_per_sqft',
      cpField: 'cement_board_cp_per_sqft',
      icValue: config.cement_board_ic_per_sqft ?? 3,
      cpValue: config.cement_board_cp_per_sqft ?? 5,
    },
    {
      key: 'waterproofing',
      name: 'Waterproofing',
      description: 'Membrane, corners, seam banding.',
      unit: 'per sqft',
      icField: 'waterproofing_ic_per_sqft',
      cpField: 'waterproofing_cp_per_sqft',
      icValue: config.waterproofing_ic_per_sqft ?? 6,
      cpValue: config.waterproofing_cp_per_sqft ?? 10,
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
      key: 'cabinet_material',
      name: 'Cabinet Material Allowance',
      description: 'Material cost per box (cabinet box, hardware, accessories).',
      unit: 'per box',
      icField: 'cabinet_material_allowance_ic',
      cpField: null, // IC only - CP is calculated
      icValue: (config as any).cabinet_material_allowance_ic ?? 150,
      cpValue: null,
    },
    {
      key: 'cabinet_install',
      name: 'Cabinet Install Labor',
      description: 'Installation labor per box (leveling, fastening, adjustments).',
      unit: 'per box',
      icField: 'cabinet_install_only_lf_ic',
      cpField: null, // IC only - CP is calculated
      icValue: config.cabinet_install_only_lf_ic ?? 50,
      cpValue: null,
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
      key: 'vanity_84',
      name: 'Vanity Bundle - 84" Double',
      description: '84" double vanity with top, sinks, faucets, install.',
      unit: 'each',
      icField: 'vanity_84_bundle_ic',
      cpField: 'vanity_84_bundle_cp',
      icValue: config.vanity_84_bundle_ic,
      cpValue: config.vanity_84_bundle_cp,
    },
    {
      key: 'vanity_96',
      name: 'Vanity Bundle - 96"+ Double',
      description: '96"+ oversized double vanity with top, sinks, faucets, install.',
      unit: 'each',
      icField: 'vanity_96_bundle_ic',
      cpField: 'vanity_96_bundle_cp',
      icValue: (config as any).vanity_96_bundle_ic ?? 3800,
      cpValue: (config as any).vanity_96_bundle_cp ?? 6000,
    },
    {
      key: 'quartz_material',
      name: 'Quartz Material Allowance',
      description: 'Material cost per sqft (slab, edges, cutouts).',
      unit: 'per sqft',
      icField: 'quartz_material_allowance_ic',
      cpField: null, // IC only - CP is calculated
      icValue: (config as any).quartz_material_allowance_ic ?? 25,
      cpValue: null,
    },
    {
      key: 'quartz_fab',
      name: 'Quartz Fabrication & Install',
      description: 'Templating, fabrication, and installation labor.',
      unit: 'per sqft',
      icField: 'quartz_ic_per_sqft',
      cpField: null, // IC only - CP is calculated
      icValue: config.quartz_ic_per_sqft,
      cpValue: null,
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
      key: 'paint_sqft',
      name: 'Paint - Per Square Foot',
      description: 'Wall/ceiling painting priced by area.',
      unit: 'per sqft',
      icField: 'paint_sqft_ic',
      cpField: 'paint_sqft_cp',
      icValue: (config as any).paint_sqft_ic ?? 1.5,
      cpValue: (config as any).paint_sqft_cp ?? 2.75,
    },
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
      key: 'paint_postjob_touchup',
      name: 'Paint - Post-Job Touch-ups',
      description: 'Final touch-ups after job completion.',
      unit: 'each',
      icField: 'paint_postjob_touchup_ic',
      cpField: 'paint_postjob_touchup_cp',
      icValue: (config as any).paint_postjob_touchup_ic ?? 150,
      cpValue: (config as any).paint_postjob_touchup_cp ?? 275,
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
      key: 'paint_full_kitchen',
      name: 'Paint - Full Kitchen',
      description: 'Full kitchen paint (walls and ceiling).',
      unit: 'each',
      icField: 'paint_full_kitchen_ic',
      cpField: 'paint_full_kitchen_cp',
      icValue: (config as any).paint_full_kitchen_ic ?? 1200,
      cpValue: (config as any).paint_full_kitchen_cp ?? 2000,
    },
    {
      key: 'paint_trim',
      name: 'Paint - Trim/Baseboards',
      description: 'Trim, baseboards, and molding painting.',
      unit: 'per LF',
      icField: 'paint_trim_ic',
      cpField: 'paint_trim_cp',
      icValue: (config as any).paint_trim_ic ?? 2,
      cpValue: (config as any).paint_trim_cp ?? 3.5,
    },
    {
      key: 'paint_ceiling',
      name: 'Paint - Ceiling Only',
      description: 'Ceiling painting per room.',
      unit: 'each',
      icField: 'paint_ceiling_ic',
      cpField: 'paint_ceiling_cp',
      icValue: (config as any).paint_ceiling_ic ?? 250,
      cpValue: (config as any).paint_ceiling_cp ?? 450,
    },
    {
      key: 'paint_door',
      name: 'Paint - Door (Both Sides)',
      description: 'Interior door painting both sides.',
      unit: 'each',
      icField: 'paint_door_ic',
      cpField: 'paint_door_cp',
      icValue: (config as any).paint_door_ic ?? 75,
      cpValue: (config as any).paint_door_cp ?? 135,
    },
    {
      key: 'paint_stair_railing',
      name: 'Paint - Stair Railing',
      description: 'Stair railing and spindles painting.',
      unit: 'each',
      icField: 'paint_stair_railing_ic',
      cpField: 'paint_stair_railing_cp',
      icValue: (config as any).paint_stair_railing_ic ?? 350,
      cpValue: (config as any).paint_stair_railing_cp ?? 600,
    },
    {
      key: 'paint_cabinets',
      name: 'Paint - Cabinets',
      description: 'Cabinet refinishing/painting.',
      unit: 'per door',
      icField: 'paint_cabinets_ic',
      cpField: 'paint_cabinets_cp',
      icValue: (config as any).paint_cabinets_ic ?? 45,
      cpValue: (config as any).paint_cabinets_cp ?? 85,
    },
    {
      key: 'paint_exterior_siding',
      name: 'Paint - Exterior Siding',
      description: 'Exterior siding painting.',
      unit: 'per sqft',
      icField: 'paint_exterior_siding_ic',
      cpField: 'paint_exterior_siding_cp',
      icValue: (config as any).paint_exterior_siding_ic ?? 1.75,
      cpValue: (config as any).paint_exterior_siding_cp ?? 3.25,
    },
    {
      key: 'paint_exterior_trim',
      name: 'Paint - Exterior Trim',
      description: 'Exterior trim, fascia, soffit painting.',
      unit: 'per LF',
      icField: 'paint_exterior_trim_ic',
      cpField: 'paint_exterior_trim_cp',
      icValue: (config as any).paint_exterior_trim_ic ?? 3,
      cpValue: (config as any).paint_exterior_trim_cp ?? 5.5,
    },
    {
      key: 'paint_front_door',
      name: 'Paint - Front Door',
      description: 'Exterior front door painting.',
      unit: 'each',
      icField: 'paint_front_door_ic',
      cpField: 'paint_front_door_cp',
      icValue: (config as any).paint_front_door_ic ?? 150,
      cpValue: (config as any).paint_front_door_cp ?? 275,
    },
    {
      key: 'paint_shutters',
      name: 'Paint - Shutters',
      description: 'Exterior shutters painting.',
      unit: 'each',
      icField: 'paint_shutters_ic',
      cpField: 'paint_shutters_cp',
      icValue: (config as any).paint_shutters_ic ?? 45,
      cpValue: (config as any).paint_shutters_cp ?? 85,
    },
    {
      key: 'paint_deck_fence',
      name: 'Paint/Stain - Deck or Fence',
      description: 'Deck or fence staining/painting.',
      unit: 'per sqft',
      icField: 'paint_deck_fence_ic',
      cpField: 'paint_deck_fence_cp',
      icValue: (config as any).paint_deck_fence_ic ?? 2,
      cpValue: (config as any).paint_deck_fence_cp ?? 3.75,
    },
    {
      key: 'wallpaper_removal',
      name: 'Wallpaper Removal',
      description: 'Remove existing wallpaper.',
      unit: 'per sqft',
      icField: 'wallpaper_removal_ic',
      cpField: 'wallpaper_removal_cp',
      icValue: (config as any).wallpaper_removal_ic ?? 1.5,
      cpValue: (config as any).wallpaper_removal_cp ?? 2.75,
    },
    {
      key: 'wallpaper_install',
      name: 'Wallpaper Installation',
      description: 'Install new wallpaper.',
      unit: 'per sqft',
      icField: 'wallpaper_install_ic',
      cpField: 'wallpaper_install_cp',
      icValue: (config as any).wallpaper_install_ic ?? 3,
      cpValue: (config as any).wallpaper_install_cp ?? 5.5,
    },
    {
      key: 'accent_wall',
      name: 'Paint - Accent Wall',
      description: 'Single accent wall painting.',
      unit: 'each',
      icField: 'accent_wall_ic',
      cpField: 'accent_wall_cp',
      icValue: (config as any).accent_wall_ic ?? 125,
      cpValue: (config as any).accent_wall_cp ?? 225,
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
      key: 'laminate',
      name: 'Laminate Flooring',
      description: 'Laminate flooring installation.',
      unit: 'per sqft',
      icField: 'laminate_ic_per_sqft',
      cpField: 'laminate_cp_per_sqft',
      icValue: (config as any).laminate_ic_per_sqft ?? 2.25,
      cpValue: (config as any).laminate_cp_per_sqft ?? 4,
    },
    {
      key: 'wood_look_tile',
      name: 'Wood-Look Tile Install',
      description: 'Wood-look porcelain tile flooring.',
      unit: 'per sqft',
      icField: 'wood_look_tile_ic_per_sqft',
      cpField: 'wood_look_tile_cp_per_sqft',
      icValue: (config as any).wood_look_tile_ic_per_sqft ?? 8,
      cpValue: (config as any).wood_look_tile_cp_per_sqft ?? 14,
    },
    {
      key: 'hardwood',
      name: 'Hardwood Flooring',
      description: 'Hardwood flooring installation.',
      unit: 'per sqft',
      icField: 'hardwood_ic_per_sqft',
      cpField: 'hardwood_cp_per_sqft',
      icValue: (config as any).hardwood_ic_per_sqft ?? 6,
      cpValue: (config as any).hardwood_cp_per_sqft ?? 10,
    },
    {
      key: 'hardwood_refinish',
      name: 'Hardwood Refinish',
      description: 'Sand and refinish existing hardwood.',
      unit: 'per sqft',
      icField: 'hardwood_refinish_ic_per_sqft',
      cpField: 'hardwood_refinish_cp_per_sqft',
      icValue: (config as any).hardwood_refinish_ic_per_sqft ?? 3.5,
      cpValue: (config as any).hardwood_refinish_cp_per_sqft ?? 6,
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

  // Build cleaning trade buckets
  const cleaningBuckets: TradeBucket[] = [
    {
      key: 'post_construction_clean',
      name: 'Post-Construction Clean',
      description: 'Professional cleaning after job completion.',
      unit: 'per job',
      icField: 'post_construction_clean_ic',
      cpField: 'post_construction_clean_cp',
      icValue: (config as any).post_construction_clean_ic ?? 350,
      cpValue: (config as any).post_construction_clean_cp ?? 500,
    },
    {
      key: 'daily_cleanup',
      name: 'Daily Cleanup',
      description: 'Daily jobsite cleanup (occupied homes).',
      unit: 'per day',
      icField: 'daily_cleanup_ic',
      cpField: 'daily_cleanup_cp',
      icValue: (config as any).daily_cleanup_ic ?? 75,
      cpValue: (config as any).daily_cleanup_cp ?? 125,
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

  // LUXURY PLUMBING (no gas - gas is separate)
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

  // GAS
  const gasBuckets: TradeBucket[] = [
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
      key: 'gas_line_range',
      name: 'Gas Line for Range',
      description: 'Gas line installation for range.',
      unit: 'per LF',
      icField: 'gas_line_range_ic',
      cpField: 'gas_line_range_cp',
      icValue: (config as any).gas_line_range_ic ?? 18,
      cpValue: (config as any).gas_line_range_cp ?? 32,
    },
  ];

  // LOGISTICS & ADMIN
  const logisticsAdminBuckets: TradeBucket[] = [
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

  // ============ NEW CATEGORIES ============

  // 1. WATER DAMAGE & ROT REPAIR
  const waterDamageBuckets: TradeBucket[] = [
    {
      key: 'subfloor_replacement',
      name: 'Subfloor Replacement',
      description: 'Replace damaged subfloor sections.',
      unit: 'per sqft',
      icField: 'subfloor_replacement_ic',
      cpField: 'subfloor_replacement_cp',
      icValue: (config as any).subfloor_replacement_ic ?? 8,
      cpValue: (config as any).subfloor_replacement_cp ?? 15,
      commonlyForgotten: true,
    },
    {
      key: 'joist_sister',
      name: 'Joist Sister/Reinforcement',
      description: 'Sister or reinforce damaged floor joists.',
      unit: 'per LF',
      icField: 'joist_sister_ic',
      cpField: 'joist_sister_cp',
      icValue: (config as any).joist_sister_ic ?? 25,
      cpValue: (config as any).joist_sister_cp ?? 45,
    },
    {
      key: 'mold_remediation',
      name: 'Mold Remediation',
      description: 'Professional mold treatment and removal.',
      unit: 'per area',
      icField: 'mold_remediation_ic',
      cpField: 'mold_remediation_cp',
      icValue: (config as any).mold_remediation_ic ?? 1500,
      cpValue: (config as any).mold_remediation_cp ?? 2800,
    },
    {
      key: 'moisture_barrier_upgrade',
      name: 'Moisture Barrier Upgrade',
      description: 'Enhanced moisture barrier installation.',
      unit: 'per sqft',
      icField: 'moisture_barrier_upgrade_ic',
      cpField: 'moisture_barrier_upgrade_cp',
      icValue: (config as any).moisture_barrier_upgrade_ic ?? 2,
      cpValue: (config as any).moisture_barrier_upgrade_cp ?? 4,
    },
  ];

  // 2. HIDDEN STRUCTURAL ISSUES
  const hiddenStructuralBuckets: TradeBucket[] = [
    {
      key: 'load_bearing_beam',
      name: 'Load-Bearing Beam Install',
      description: 'Install structural load-bearing beam.',
      unit: 'each',
      icField: 'load_bearing_beam_ic',
      cpField: 'load_bearing_beam_cp',
      icValue: (config as any).load_bearing_beam_ic ?? 2500,
      cpValue: (config as any).load_bearing_beam_cp ?? 4500,
    },
    {
      key: 'foundation_slab_repair',
      name: 'Foundation/Slab Repair',
      description: 'Foundation or slab crack repair.',
      unit: 'each',
      icField: 'foundation_slab_repair_ic',
      cpField: 'foundation_slab_repair_cp',
      icValue: (config as any).foundation_slab_repair_ic ?? 3000,
      cpValue: (config as any).foundation_slab_repair_cp ?? 5500,
    },
    {
      key: 'engineered_drawings',
      name: 'Engineered Drawings/Stamp',
      description: 'Structural engineering drawings and stamp.',
      unit: 'each',
      icField: 'engineered_drawings_ic',
      cpField: 'engineered_drawings_cp',
      icValue: (config as any).engineered_drawings_ic ?? 800,
      cpValue: (config as any).engineered_drawings_cp ?? 1500,
    },
    {
      key: 'temporary_shoring',
      name: 'Temporary Shoring',
      description: 'Temporary structural support during work.',
      unit: 'each',
      icField: 'temporary_shoring_ic',
      cpField: 'temporary_shoring_cp',
      icValue: (config as any).temporary_shoring_ic ?? 600,
      cpValue: (config as any).temporary_shoring_cp ?? 1100,
    },
  ];

  // 3. CODE-MANDATED UPGRADES
  const codeUpgradesBuckets: TradeBucket[] = [
    {
      key: 'gfci_outlet',
      name: 'GFCI Outlet Replacement',
      description: 'Replace standard outlet with GFCI.',
      unit: 'per outlet',
      icField: 'gfci_outlet_ic',
      cpField: 'gfci_outlet_cp',
      icValue: (config as any).gfci_outlet_ic ?? 45,
      cpValue: (config as any).gfci_outlet_cp ?? 85,
      commonlyForgotten: true,
    },
    {
      key: 'afci_breaker',
      name: 'AFCI Breaker Upgrade',
      description: 'Upgrade to arc-fault circuit breaker.',
      unit: 'per circuit',
      icField: 'afci_breaker_ic',
      cpField: 'afci_breaker_cp',
      icValue: (config as any).afci_breaker_ic ?? 150,
      cpValue: (config as any).afci_breaker_cp ?? 280,
      commonlyForgotten: true,
    },
    {
      key: 'vent_fan_upgrade',
      name: 'Vent Fan Upgrade',
      description: 'Upgrade bathroom vent fan to code.',
      unit: 'each',
      icField: 'vent_fan_upgrade_ic',
      cpField: 'vent_fan_upgrade_cp',
      icValue: (config as any).vent_fan_upgrade_ic ?? 250,
      cpValue: (config as any).vent_fan_upgrade_cp ?? 450,
    },
    {
      key: 'tempered_glass_req',
      name: 'Tempered Glass Requirement',
      description: 'Code-required tempered glass replacement.',
      unit: 'each',
      icField: 'tempered_glass_req_ic',
      cpField: 'tempered_glass_req_cp',
      icValue: (config as any).tempered_glass_req_ic ?? 200,
      cpValue: (config as any).tempered_glass_req_cp ?? 380,
    },
    {
      key: 'egress_window',
      name: 'Egress Window Enlargement',
      description: 'Enlarge window to meet egress code.',
      unit: 'each',
      icField: 'egress_window_ic',
      cpField: 'egress_window_cp',
      icValue: (config as any).egress_window_ic ?? 2500,
      cpValue: (config as any).egress_window_cp ?? 4500,
    },
    {
      key: 'handrail_install',
      name: 'Handrail Installation',
      description: 'Code-compliant handrail installation.',
      unit: 'each',
      icField: 'handrail_install_ic',
      cpField: 'handrail_install_cp',
      icValue: (config as any).handrail_install_ic ?? 350,
      cpValue: (config as any).handrail_install_cp ?? 650,
    },
  ];

  // 4. OCCUPIED HOME PREMIUMS
  const occupiedHomeBuckets: TradeBucket[] = [
    {
      key: 'daily_cleanup',
      name: 'Daily Cleanup',
      description: 'End-of-day cleanup for occupied homes.',
      unit: 'per day',
      icField: 'daily_cleanup_ic',
      cpField: 'daily_cleanup_cp',
      icValue: (config as any).daily_cleanup_ic ?? 75,
      cpValue: (config as any).daily_cleanup_cp ?? 125,
    },
  ];

  // 5. TRIM & MILLWORK (Extended)
  const trimMillworkBuckets: TradeBucket[] = [
    {
      key: 'baseboard_custom',
      name: 'Baseboard Custom/Stained',
      description: 'Custom or stained baseboard installation.',
      unit: 'per LF',
      icField: 'baseboard_custom_ic',
      cpField: 'baseboard_custom_cp',
      icValue: (config as any).baseboard_custom_ic ?? 6,
      cpValue: (config as any).baseboard_custom_cp ?? 11,
    },
    {
      key: 'chair_rail',
      name: 'Chair Rail',
      description: 'Chair rail molding installation.',
      unit: 'per LF',
      icField: 'chair_rail_ic',
      cpField: 'chair_rail_cp',
      icValue: (config as any).chair_rail_ic ?? 4,
      cpValue: (config as any).chair_rail_cp ?? 8,
    },
    {
      key: 'window_casing',
      name: 'Window Casing Replacement',
      description: 'Replace window casing/trim.',
      unit: 'per window',
      icField: 'window_casing_ic',
      cpField: 'window_casing_cp',
      icValue: (config as any).window_casing_ic ?? 85,
      cpValue: (config as any).window_casing_cp ?? 160,
    },
    {
      key: 'door_casing',
      name: 'Door Casing Replacement',
      description: 'Replace door casing/trim.',
      unit: 'per door',
      icField: 'door_casing_ic',
      cpField: 'door_casing_cp',
      icValue: (config as any).door_casing_ic ?? 75,
      cpValue: (config as any).door_casing_cp ?? 140,
    },
    {
      key: 'coffered_ceiling',
      name: 'Coffered Ceiling',
      description: 'Coffered ceiling installation.',
      unit: 'per sqft',
      icField: 'coffered_ceiling_ic',
      cpField: 'coffered_ceiling_cp',
      icValue: (config as any).coffered_ceiling_ic ?? 35,
      cpValue: (config as any).coffered_ceiling_cp ?? 65,
    },
    {
      key: 'custom_builtins',
      name: 'Custom Built-Ins',
      description: 'Custom built-in cabinetry/shelving.',
      unit: 'per LF',
      icField: 'custom_builtins_ic',
      cpField: 'custom_builtins_cp',
      icValue: (config as any).custom_builtins_ic ?? 120,
      cpValue: (config as any).custom_builtins_cp ?? 220,
    },
    {
      key: 'floating_shelves',
      name: 'Floating Shelves',
      description: 'Floating shelf installation.',
      unit: 'per shelf',
      icField: 'floating_shelves_ic',
      cpField: 'floating_shelves_cp',
      icValue: (config as any).floating_shelves_ic ?? 85,
      cpValue: (config as any).floating_shelves_cp ?? 160,
    },
  ];

  // 6. SPECIALTY PLUMBING SYSTEMS
  const specialtyPlumbingBuckets: TradeBucket[] = [
    {
      key: 'recirc_pump',
      name: 'Recirculation Pump',
      description: 'Hot water recirculation pump install.',
      unit: 'each',
      icField: 'recirc_pump_ic',
      cpField: 'recirc_pump_cp',
      icValue: (config as any).recirc_pump_ic ?? 450,
      cpValue: (config as any).recirc_pump_cp ?? 850,
    },
    {
      key: 'water_softener',
      name: 'Water Softener Rough-In',
      description: 'Water softener plumbing rough-in.',
      unit: 'each',
      icField: 'water_softener_ic',
      cpField: 'water_softener_cp',
      icValue: (config as any).water_softener_ic ?? 350,
      cpValue: (config as any).water_softener_cp ?? 650,
    },
    {
      key: 'pot_filler_roughin',
      name: 'Pot Filler Rough-In',
      description: 'Pot filler plumbing rough-in only.',
      unit: 'each',
      icField: 'pot_filler_roughin_ic',
      cpField: 'pot_filler_roughin_cp',
      icValue: (config as any).pot_filler_roughin_ic ?? 400,
      cpValue: (config as any).pot_filler_roughin_cp ?? 750,
    },
    {
      key: 'ice_maker_line',
      name: 'Ice Maker Line',
      description: 'Ice maker water line installation.',
      unit: 'per LF',
      icField: 'ice_maker_line_ic',
      cpField: 'ice_maker_line_cp',
      icValue: (config as any).ice_maker_line_ic ?? 8,
      cpValue: (config as any).ice_maker_line_cp ?? 15,
    },
    {
      key: 'pressure_balance_valve',
      name: 'Pressure Balancing Valve',
      description: 'Pressure balancing valve installation.',
      unit: 'each',
      icField: 'pressure_balance_valve_ic',
      cpField: 'pressure_balance_valve_cp',
      icValue: (config as any).pressure_balance_valve_ic ?? 180,
      cpValue: (config as any).pressure_balance_valve_cp ?? 340,
    },
    {
      key: 'steam_roughin',
      name: 'Steam Generator Rough-In',
      description: 'Steam shower generator rough-in.',
      unit: 'each',
      icField: 'steam_roughin_ic',
      cpField: 'steam_roughin_cp',
      icValue: (config as any).steam_roughin_ic ?? 650,
      cpValue: (config as any).steam_roughin_cp ?? 1200,
    },
    {
      key: 'floor_heat_manifold',
      name: 'Floor Heat Manifold',
      description: 'Radiant floor heat manifold install.',
      unit: 'each',
      icField: 'floor_heat_manifold_ic',
      cpField: 'floor_heat_manifold_cp',
      icValue: (config as any).floor_heat_manifold_ic ?? 550,
      cpValue: (config as any).floor_heat_manifold_cp ?? 1000,
    },
  ];

  // 7. SMART HOME / SPECIALTY ELECTRICAL
  const smartElectricalBuckets: TradeBucket[] = [
    {
      key: 'toekick_lighting',
      name: 'Toe-Kick Lighting',
      description: 'LED toe-kick lighting installation.',
      unit: 'per LF',
      icField: 'toekick_lighting_ic',
      cpField: 'toekick_lighting_cp',
      icValue: (config as any).toekick_lighting_ic ?? 12,
      cpValue: (config as any).toekick_lighting_cp ?? 22,
    },
    {
      key: 'indrawer_outlet',
      name: 'In-Drawer Outlets',
      description: 'Outlet installed inside drawer.',
      unit: 'each',
      icField: 'indrawer_outlet_ic',
      cpField: 'indrawer_outlet_cp',
      icValue: (config as any).indrawer_outlet_ic ?? 150,
      cpValue: (config as any).indrawer_outlet_cp ?? 280,
    },
    {
      key: 'usb_outlet',
      name: 'USB Outlet Upgrade',
      description: 'Upgrade outlet to include USB ports.',
      unit: 'per outlet',
      icField: 'usb_outlet_ic',
      cpField: 'usb_outlet_cp',
      icValue: (config as any).usb_outlet_ic ?? 35,
      cpValue: (config as any).usb_outlet_cp ?? 65,
    },
    {
      key: 'smart_switch',
      name: 'Smart Switch',
      description: 'Smart switch/dimmer installation.',
      unit: 'each',
      icField: 'smart_switch_ic',
      cpField: 'smart_switch_cp',
      icValue: (config as any).smart_switch_ic ?? 75,
      cpValue: (config as any).smart_switch_cp ?? 140,
    },
    {
      key: 'subpanel_install',
      name: 'Subpanel Install',
      description: 'Electrical subpanel installation.',
      unit: 'each',
      icField: 'subpanel_install_ic',
      cpField: 'subpanel_install_cp',
      icValue: (config as any).subpanel_install_ic ?? 1200,
      cpValue: (config as any).subpanel_install_cp ?? 2200,
    },
    {
      key: 'ev_charger_circuit',
      name: 'EV Charger Circuit',
      description: 'Electric vehicle charger circuit install.',
      unit: 'each',
      icField: 'ev_charger_circuit_ic',
      cpField: 'ev_charger_circuit_cp',
      icValue: (config as any).ev_charger_circuit_ic ?? 650,
      cpValue: (config as any).ev_charger_circuit_cp ?? 1200,
    },
    {
      key: 'heat_lamp_fan',
      name: 'Bathroom Heat Lamp/Fan Combo',
      description: 'Heat lamp and fan combo installation.',
      unit: 'each',
      icField: 'heat_lamp_fan_ic',
      cpField: 'heat_lamp_fan_cp',
      icValue: (config as any).heat_lamp_fan_ic ?? 350,
      cpValue: (config as any).heat_lamp_fan_cp ?? 650,
    },
  ];

  // 8. CABINET CUSTOMIZATION
  const cabinetCustomBuckets: TradeBucket[] = [
    {
      key: 'soft_close_hinge',
      name: 'Soft-Close Hinge Upgrade',
      description: 'Upgrade to soft-close hinges.',
      unit: 'per door',
      icField: 'soft_close_hinge_ic',
      cpField: 'soft_close_hinge_cp',
      icValue: (config as any).soft_close_hinge_ic ?? 8,
      cpValue: (config as any).soft_close_hinge_cp ?? 15,
      commonlyForgotten: true,
    },
    {
      key: 'pullout_trash',
      name: 'Pull-Out Trash',
      description: 'Pull-out trash cabinet insert.',
      unit: 'per cabinet',
      icField: 'pullout_trash_ic',
      cpField: 'pullout_trash_cp',
      icValue: (config as any).pullout_trash_ic ?? 180,
      cpValue: (config as any).pullout_trash_cp ?? 340,
    },
    {
      key: 'lazy_susan',
      name: 'Lazy Susan Corner',
      description: 'Lazy Susan corner cabinet insert.',
      unit: 'each',
      icField: 'lazy_susan_ic',
      cpField: 'lazy_susan_cp',
      icValue: (config as any).lazy_susan_ic ?? 250,
      cpValue: (config as any).lazy_susan_cp ?? 450,
    },
    {
      key: 'spice_rack_pullout',
      name: 'Spice Rack Pull-Out',
      description: 'Pull-out spice rack insert.',
      unit: 'each',
      icField: 'spice_rack_pullout_ic',
      cpField: 'spice_rack_pullout_cp',
      icValue: (config as any).spice_rack_pullout_ic ?? 120,
      cpValue: (config as any).spice_rack_pullout_cp ?? 220,
    },
    {
      key: 'tray_divider',
      name: 'Tray Divider Insert',
      description: 'Tray divider cabinet insert.',
      unit: 'each',
      icField: 'tray_divider_ic',
      cpField: 'tray_divider_cp',
      icValue: (config as any).tray_divider_ic ?? 65,
      cpValue: (config as any).tray_divider_cp ?? 120,
    },
    {
      key: 'drawer_peg_system',
      name: 'Drawer Peg System',
      description: 'Adjustable peg system for drawers.',
      unit: 'per drawer',
      icField: 'drawer_peg_system_ic',
      cpField: 'drawer_peg_system_cp',
      icValue: (config as any).drawer_peg_system_ic ?? 45,
      cpValue: (config as any).drawer_peg_system_cp ?? 85,
    },
    {
      key: 'appliance_garage',
      name: 'Appliance Garage',
      description: 'Appliance garage cabinet.',
      unit: 'each',
      icField: 'appliance_garage_ic',
      cpField: 'appliance_garage_cp',
      icValue: (config as any).appliance_garage_ic ?? 350,
      cpValue: (config as any).appliance_garage_cp ?? 650,
    },
    {
      key: 'open_shelving_conv',
      name: 'Open Shelving Conversion',
      description: 'Convert cabinet to open shelving.',
      unit: 'per section',
      icField: 'open_shelving_conv_ic',
      cpField: 'open_shelving_conv_cp',
      icValue: (config as any).open_shelving_conv_ic ?? 200,
      cpValue: (config as any).open_shelving_conv_cp ?? 380,
    },
    {
      key: 'glass_door_insert',
      name: 'Glass Door Inserts',
      description: 'Glass insert for cabinet doors.',
      unit: 'per door',
      icField: 'glass_door_insert_ic',
      cpField: 'glass_door_insert_cp',
      icValue: (config as any).glass_door_insert_ic ?? 120,
      cpValue: (config as any).glass_door_insert_cp ?? 220,
    },
  ];

  // 9. TILE SPECIALTY WORK & BACKSPLASH
  const tileSpecialtyBuckets: TradeBucket[] = [
    {
      key: 'tile_backsplash',
      name: 'Tile Backsplash Install',
      description: 'Kitchen or bath tile backsplash installation.',
      unit: 'per sqft',
      icField: 'tile_backsplash_ic_per_sqft',
      cpField: 'tile_backsplash_cp_per_sqft',
      icValue: (config as any).tile_backsplash_ic_per_sqft ?? 18,
      cpValue: (config as any).tile_backsplash_cp_per_sqft ?? 32,
    },
    {
      key: 'accent_tile_band',
      name: 'Accent Tile Band/Border',
      description: 'Decorative accent tile band.',
      unit: 'per LF',
      icField: 'accent_tile_band_ic',
      cpField: 'accent_tile_band_cp',
      icValue: (config as any).accent_tile_band_ic ?? 18,
      cpValue: (config as any).accent_tile_band_cp ?? 35,
    },
    {
      key: 'herringbone_premium',
      name: 'Herringbone Pattern Premium',
      description: 'Premium for herringbone tile pattern.',
      unit: 'per sqft',
      icField: 'herringbone_premium_ic',
      cpField: 'herringbone_premium_cp',
      icValue: (config as any).herringbone_premium_ic ?? 8,
      cpValue: (config as any).herringbone_premium_cp ?? 15,
      isModifier: true,
    },
    {
      key: 'large_format_premium',
      name: 'Large Format Tile Premium',
      description: 'Premium for large format tile installation.',
      unit: 'per sqft',
      icField: 'large_format_premium_ic',
      cpField: 'large_format_premium_cp',
      icValue: (config as any).large_format_premium_ic ?? 6,
      cpValue: (config as any).large_format_premium_cp ?? 12,
      isModifier: true,
    },
    {
      key: 'mosaic_penny_tile',
      name: 'Mosaic/Penny Tile',
      description: 'Mosaic or penny tile installation.',
      unit: 'per sqft',
      icField: 'mosaic_penny_tile_ic',
      cpField: 'mosaic_penny_tile_cp',
      icValue: (config as any).mosaic_penny_tile_ic ?? 28,
      cpValue: (config as any).mosaic_penny_tile_cp ?? 52,
    },
    {
      key: 'bullnose_trim',
      name: 'Bullnose/Trim Tile',
      description: 'Bullnose or trim tile installation.',
      unit: 'per LF',
      icField: 'bullnose_trim_ic',
      cpField: 'bullnose_trim_cp',
      icValue: (config as any).bullnose_trim_ic ?? 12,
      cpValue: (config as any).bullnose_trim_cp ?? 22,
    },
    {
      key: 'shower_curb_cap',
      name: 'Shower Curb Cap',
      description: 'Shower curb cap tile installation.',
      unit: 'per LF',
      icField: 'shower_curb_cap_ic',
      cpField: 'shower_curb_cap_cp',
      icValue: (config as any).shower_curb_cap_ic ?? 25,
      cpValue: (config as any).shower_curb_cap_cp ?? 45,
    },
    {
      key: 'schluter_profile',
      name: 'Schluter Profile',
      description: 'Schluter edge profile installation.',
      unit: 'per LF',
      icField: 'schluter_profile_ic',
      cpField: 'schluter_profile_cp',
      icValue: (config as any).schluter_profile_ic ?? 15,
      cpValue: (config as any).schluter_profile_cp ?? 28,
    },
    {
      key: 'heated_floor_mat',
      name: 'Heated Floor Mat Install',
      description: 'Radiant heated floor mat installation.',
      unit: 'per sqft',
      icField: 'heated_floor_sqft_ic',
      cpField: 'heated_floor_sqft_cp',
      icValue: (config as any).heated_floor_sqft_ic ?? 18,
      cpValue: (config as any).heated_floor_sqft_cp ?? 32,
    },
  ];

  // 10. COUNTERTOP FABRICATION ADD-ONS
  const countertopAddOnsBuckets: TradeBucket[] = [
    {
      key: 'undermount_sink_cutout',
      name: 'Undermount Sink Cutout',
      description: 'Undermount sink cutout fabrication.',
      unit: 'each',
      icField: 'undermount_sink_cutout_ic',
      cpField: 'undermount_sink_cutout_cp',
      icValue: (config as any).undermount_sink_cutout_ic ?? 150,
      cpValue: (config as any).undermount_sink_cutout_cp ?? 280,
    },
    {
      key: 'cooktop_cutout',
      name: 'Cooktop Cutout',
      description: 'Cooktop cutout fabrication.',
      unit: 'each',
      icField: 'cooktop_cutout_ic',
      cpField: 'cooktop_cutout_cp',
      icValue: (config as any).cooktop_cutout_ic ?? 200,
      cpValue: (config as any).cooktop_cutout_cp ?? 380,
    },
    {
      key: 'fullheight_backsplash',
      name: 'Full-Height Backsplash Upgrade',
      description: 'Full-height stone backsplash upgrade.',
      unit: 'LS',
      icField: 'fullheight_backsplash_ic',
      cpField: 'fullheight_backsplash_cp',
      icValue: (config as any).fullheight_backsplash_ic ?? 450,
      cpValue: (config as any).fullheight_backsplash_cp ?? 850,
    },
    {
      key: 'outlet_cutout',
      name: 'Outlet Cutout',
      description: 'Outlet cutout in stone.',
      unit: 'each',
      icField: 'outlet_cutout_ic',
      cpField: 'outlet_cutout_cp',
      icValue: (config as any).outlet_cutout_ic ?? 75,
      cpValue: (config as any).outlet_cutout_cp ?? 140,
    },
    {
      key: 'waterfall_mitered',
      name: 'Waterfall Edge Upgrade',
      description: 'Waterfall or mitered edge fabrication.',
      unit: 'LS',
      icField: 'waterfall_mitered_ic',
      cpField: 'waterfall_mitered_cp',
      icValue: (config as any).waterfall_mitered_ic ?? 650,
      cpValue: (config as any).waterfall_mitered_cp ?? 1200,
    },
  ];

  // 11. DECORATIVE FINISHES
  const decorativeFinishesBuckets: TradeBucket[] = [
    {
      key: 'accent_shiplap',
      name: 'Accent Wall Shiplap/Board & Batten',
      description: 'Shiplap or board & batten accent wall.',
      unit: 'per sqft',
      icField: 'accent_shiplap_ic',
      cpField: 'accent_shiplap_cp',
      icValue: (config as any).accent_shiplap_ic ?? 18,
      cpValue: (config as any).accent_shiplap_cp ?? 35,
    },
    {
      key: 'ceiling_beams',
      name: 'Ceiling Beams',
      description: 'Decorative ceiling beam installation.',
      unit: 'per LF',
      icField: 'ceiling_beams_ic',
      cpField: 'ceiling_beams_cp',
      icValue: (config as any).ceiling_beams_ic ?? 45,
      cpValue: (config as any).ceiling_beams_cp ?? 85,
    },
    {
      key: 'tile_fireplace',
      name: 'Tile Fireplace Surround',
      description: 'Tile fireplace surround installation.',
      unit: 'each',
      icField: 'tile_fireplace_ic',
      cpField: 'tile_fireplace_cp',
      icValue: (config as any).tile_fireplace_ic ?? 1800,
      cpValue: (config as any).tile_fireplace_cp ?? 3400,
    },
    {
      key: 'custom_mirror_frame',
      name: 'Custom Mirror Frame',
      description: 'Custom frame for existing mirror.',
      unit: 'each',
      icField: 'custom_mirror_frame_ic',
      cpField: 'custom_mirror_frame_cp',
      icValue: (config as any).custom_mirror_frame_ic ?? 250,
      cpValue: (config as any).custom_mirror_frame_cp ?? 480,
    },
    {
      key: 'medicine_cab_recess',
      name: 'Medicine Cabinet Recess',
      description: 'Recess opening for medicine cabinet.',
      unit: 'each',
      icField: 'medicine_cab_recess_ic',
      cpField: 'medicine_cab_recess_cp',
      icValue: (config as any).medicine_cab_recess_ic ?? 200,
      cpValue: (config as any).medicine_cab_recess_cp ?? 380,
    },
    {
      key: 'niche_led_strip',
      name: 'Niche Lighting LED Strip',
      description: 'LED strip lighting in niche.',
      unit: 'per niche',
      icField: 'niche_led_strip_ic',
      cpField: 'niche_led_strip_cp',
      icValue: (config as any).niche_led_strip_ic ?? 120,
      cpValue: (config as any).niche_led_strip_cp ?? 220,
    },
    {
      key: 'grout_sealing',
      name: 'Grout Color Sealing',
      description: 'Grout color sealing treatment.',
      unit: 'per sqft',
      icField: 'grout_sealing_ic',
      cpField: 'grout_sealing_cp',
      icValue: (config as any).grout_sealing_ic ?? 2,
      cpValue: (config as any).grout_sealing_cp ?? 4,
      commonlyForgotten: true,
    },
  ];

  // 12. CONTINGENCY & PROTECTION
  const contingencyBuckets: TradeBucket[] = [
    {
      key: 'asbestos_testing',
      name: 'Asbestos Testing',
      description: 'Asbestos testing and report.',
      unit: 'each',
      icField: 'asbestos_testing_ic',
      cpField: 'asbestos_testing_cp',
      icValue: (config as any).asbestos_testing_ic ?? 250,
      cpValue: (config as any).asbestos_testing_cp ?? 450,
    },
    {
      key: 'lead_paint_testing',
      name: 'Lead Paint Testing',
      description: 'Lead paint testing and report.',
      unit: 'each',
      icField: 'lead_paint_testing_ic',
      cpField: 'lead_paint_testing_cp',
      icValue: (config as any).lead_paint_testing_ic ?? 150,
      cpValue: (config as any).lead_paint_testing_cp ?? 280,
    },
    {
      key: 'warranty_registration',
      name: 'Warranty Registration Fee',
      description: 'Product warranty registration.',
      unit: 'per job',
      icField: 'warranty_registration_ic',
      cpField: 'warranty_registration_cp',
      icValue: (config as any).warranty_registration_ic ?? 50,
      cpValue: (config as any).warranty_registration_cp ?? 100,
    },
    {
      key: 'asbuilt_documentation',
      name: 'As-Built Documentation',
      description: 'As-built drawings and documentation.',
      unit: 'per job',
      icField: 'asbuilt_documentation_ic',
      cpField: 'asbuilt_documentation_cp',
      icValue: (config as any).asbuilt_documentation_ic ?? 300,
      cpValue: (config as any).asbuilt_documentation_cp ?? 550,
    },
    {
      key: 'touchup_visit',
      name: 'Post-Project Touch-Up Visit',
      description: 'Post-project touch-up and corrections.',
      unit: 'per visit',
      icField: 'touchup_visit_ic',
      cpField: 'touchup_visit_cp',
      icValue: (config as any).touchup_visit_ic ?? 150,
      cpValue: (config as any).touchup_visit_cp ?? 280,
    },
  ];

  // 13. MISCELLANEOUS ALWAYS-NEEDED
  const miscBuckets: TradeBucket[] = [
    {
      key: 'interior_door',
      name: 'Interior Door Replacement',
      description: 'Replace interior door with jamb.',
      unit: 'per door',
      icField: 'interior_door_ic',
      cpField: 'interior_door_cp',
      icValue: (config as any).interior_door_ic ?? 350,
      cpValue: (config as any).interior_door_cp ?? 650,
    },
    {
      key: 'door_hardware',
      name: 'Door Hardware Upgrade',
      description: 'Upgrade door hardware (knobs, hinges).',
      unit: 'per door',
      icField: 'door_hardware_ic',
      cpField: 'door_hardware_cp',
      icValue: (config as any).door_hardware_ic ?? 45,
      cpValue: (config as any).door_hardware_cp ?? 85,
    },
    {
      key: 'closet_shelving',
      name: 'Closet Shelving System',
      description: 'Closet shelving system installation.',
      unit: 'per closet',
      icField: 'closet_shelving_ic',
      cpField: 'closet_shelving_cp',
      icValue: (config as any).closet_shelving_ic ?? 400,
      cpValue: (config as any).closet_shelving_cp ?? 750,
    },
    {
      key: 'towel_bar_tp',
      name: 'Towel Bar/TP Holder',
      description: 'Towel bar or toilet paper holder install.',
      unit: 'per fixture',
      icField: 'towel_bar_tp_ic',
      cpField: 'towel_bar_tp_cp',
      icValue: (config as any).towel_bar_tp_ic ?? 65,
      cpValue: (config as any).towel_bar_tp_cp ?? 120,
    },
    {
      key: 'grab_bar',
      name: 'Grab Bar Install',
      description: 'Safety grab bar installation.',
      unit: 'each',
      icField: 'grab_bar_ic',
      cpField: 'grab_bar_cp',
      icValue: (config as any).grab_bar_ic ?? 120,
      cpValue: (config as any).grab_bar_cp ?? 220,
    },
    {
      key: 'shower_rod_curved',
      name: 'Shower Rod Curved',
      description: 'Curved shower rod installation.',
      unit: 'each',
      icField: 'shower_rod_curved_ic',
      cpField: 'shower_rod_curved_cp',
      icValue: (config as any).shower_rod_curved_ic ?? 85,
      cpValue: (config as any).shower_rod_curved_cp ?? 160,
    },
    {
      key: 'caulking_sealing',
      name: 'Caulking/Sealing Final',
      description: 'Final caulking and sealing.',
      unit: 'per room',
      icField: 'caulking_sealing_ic',
      cpField: 'caulking_sealing_cp',
      icValue: (config as any).caulking_sealing_ic ?? 150,
      cpValue: (config as any).caulking_sealing_cp ?? 280,
      commonlyForgotten: true,
    },
    {
      key: 'touchup_paint_kit',
      name: 'Touchup Paint Kit',
      description: 'Touch-up paint kit for customer.',
      unit: 'per job',
      icField: 'touchup_paint_kit_ic',
      cpField: 'touchup_paint_kit_cp',
      icValue: (config as any).touchup_paint_kit_ic ?? 75,
      cpValue: (config as any).touchup_paint_kit_cp ?? 140,
    },
    {
      key: 'walkthrough_punchlist',
      name: 'Final Walkthrough Punchlist',
      description: 'Final walkthrough and punchlist labor.',
      unit: 'per hour',
      icField: 'walkthrough_punchlist_ic',
      cpField: 'walkthrough_punchlist_cp',
      icValue: (config as any).walkthrough_punchlist_ic ?? 85,
      cpValue: (config as any).walkthrough_punchlist_cp ?? 150,
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
      key: 'kitchen_sink',
      label: 'Kitchen Sink',
      field: 'kitchen_sink_allowance_cp',
      value: (config as any).kitchen_sink_allowance_cp ?? 450,
      unit: 'each',
      description: 'Kitchen sink allowance.',
    },
    {
      key: 'garbage_disposal',
      label: 'Garbage Disposal',
      field: 'garbage_disposal_allowance_cp',
      value: config.garbage_disposal_allowance_cp,
      unit: 'each',
      description: 'Garbage disposal allowance.',
    },
    {
      key: 'garbage_disposal_install',
      label: 'Garbage Disposal Install',
      field: 'garbage_disposal_install_cp',
      value: (config as any).garbage_disposal_install_cp ?? 150,
      unit: 'each',
      description: 'Garbage disposal installation labor.',
    },
    {
      key: 'laminate_slab',
      label: 'Laminate Slab Material',
      field: 'laminate_slab_allowance_cp',
      value: (config as any).laminate_slab_allowance_cp ?? 400,
      unit: 'per slab',
      description: 'Laminate countertop slab material allowance.',
    },
    {
      key: 'led_mirror',
      label: 'LED Mirror Material',
      field: 'led_mirror_allowance_cp',
      value: (config as any).led_mirror_allowance_cp ?? 350,
      unit: 'each',
      description: 'LED/backlit mirror material allowance.',
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

        {/* Search/Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search line items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 border-slate-200 focus:ring-2 focus:ring-cyan-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Filter className="h-4 w-4" />
              <span>10 categories · 237 line items</span>
            </div>
          </div>
          {searchQuery && (
            <p className="mt-3 text-sm text-slate-600">
              Showing results for "<span className="font-medium">{searchQuery}</span>"
            </p>
          )}
        </div>

        {/* CONSOLIDATED TRADE-BASED SECTIONS (~10 main categories) */}
        
        {/* 1. DEMOLITION & SITE PREP */}
        <AccordionSection 
          title="Demolition & Site Prep" 
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
              title="Heavy/Difficult Demo"
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
            <TradeBucketsCard
              title="Cleaning"
              description="Post-construction and daily cleanup services."
              icon={<Sparkles className="h-5 w-5" />}
              buckets={cleaningBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Occupied Home Premiums"
              description="Services for clients living in home during work."
              icon={<Home className="h-5 w-5" />}
              buckets={occupiedHomeBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
          </div>
        </AccordionSection>

        {/* 2. STRUCTURAL & FRAMING */}
        <AccordionSection 
          title="Structural & Framing" 
          icon={<HardHat className="h-5 w-5" />}
          defaultOpen={false}
        >
          <div className="space-y-4">
            <TradeBucketsCard
              title="Framing"
              description="Standard framing, pony walls, niches."
              icon={<HardHat className="h-5 w-5" />}
              buckets={framingBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Structural / Complex Work"
              description="Wall removal, relocations, major changes."
              icon={<HardHat className="h-5 w-5" />}
              buckets={structuralBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Hidden Structural Issues"
              description="Major discoveries requiring engineer involvement."
              icon={<HardHat className="h-5 w-5" />}
              buckets={hiddenStructuralBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
          </div>
        </AccordionSection>

        {/* 3. PLUMBING & GAS */}
        <AccordionSection 
          title="Plumbing & Gas" 
          icon={<Wrench className="h-5 w-5" />}
          defaultOpen={false}
        >
          <div className="space-y-4">
            <TradeBucketsCard
              title="Standard Plumbing"
              description="Shower rough-in, toilet, tub, drains."
              icon={<Wrench className="h-5 w-5" />}
              buckets={plumbingBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Luxury Plumbing"
              description="Steam, pot fillers, tankless water heaters."
              icon={<Wrench className="h-5 w-5" />}
              buckets={luxuryPlumbingBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Specialty Plumbing Systems"
              description="Recirculation pumps, water softener rough-ins."
              icon={<Wrench className="h-5 w-5" />}
              buckets={specialtyPlumbingBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Gas"
              description="Gas line installation and connections."
              icon={<Flame className="h-5 w-5" />}
              buckets={gasBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
          </div>
        </AccordionSection>

        {/* 4. ELECTRICAL */}
        <AccordionSection 
          title="Electrical" 
          icon={<Settings2 className="h-5 w-5" />}
          defaultOpen={false}
        >
          <div className="space-y-4">
            <TradeBucketsCard
              title="Standard Electrical"
              description="Lighting, cans, switches, outlets."
              icon={<Settings2 className="h-5 w-5" />}
              buckets={electricalBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Systems & Upgrades"
              description="Panel upgrades, 240V circuits, heated floors."
              icon={<Settings2 className="h-5 w-5" />}
              buckets={electricalUpgradesBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Smart Home / Specialty"
              description="Toe-kick lighting, in-drawer outlets, smart switches."
              icon={<Settings2 className="h-5 w-5" />}
              buckets={smartElectricalBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Code Requirements:</span> Items below are legally required once permit is pulled.
              </p>
            </div>
            <TradeBucketsCard
              title="Code-Mandated Upgrades"
              description="GFCI, AFCI, vent fans, tempered glass, egress."
              icon={<AlertCircle className="h-5 w-5" />}
              buckets={codeUpgradesBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
          </div>
        </AccordionSection>

        {/* 5. TILE & FLOORING */}
        <AccordionSection 
          title="Tile & Flooring" 
          icon={<Bath className="h-5 w-5" />}
          defaultOpen={false}
        >
          <div className="space-y-4">
            <TradeBucketsCard
              title="Tile & Waterproofing"
              description="Wall tile, floor tile, cement board, waterproofing."
              icon={<Bath className="h-5 w-5" />}
              buckets={tileBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Tile Specialty Work"
              description="Premium patterns, mosaic, large format, trim."
              icon={<Layers className="h-5 w-5" />}
              buckets={tileSpecialtyBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Flooring"
              description="LVP, laminate, hardwood, underlayment."
              icon={<Bath className="h-5 w-5" />}
              buckets={flooringBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
          </div>
        </AccordionSection>

        {/* 6. CABINETRY & COUNTERTOPS */}
        <AccordionSection 
          title="Cabinetry & Countertops" 
          icon={<ChefHat className="h-5 w-5" />}
          defaultOpen={false}
        >
          <div className="space-y-4">
            <TradeBucketsCard
              title="Cabinetry & Vanities"
              description="Kitchen cabinets, vanity bundles, countertops."
              icon={<ChefHat className="h-5 w-5" />}
              buckets={cabinetryBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Cabinet Customization"
              description="Soft-close, pull-outs, lazy susan, organizers."
              icon={<ChefHat className="h-5 w-5" />}
              buckets={cabinetCustomBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Countertop Fabrication Add-Ons"
              description="Cutouts, edge profiles, waterfall miters."
              icon={<Layers className="h-5 w-5" />}
              buckets={countertopAddOnsBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
          </div>
        </AccordionSection>

        {/* 7. FINISHES */}
        <AccordionSection 
          title="Finishes" 
          icon={<Palette className="h-5 w-5" />}
          defaultOpen={false}
        >
          <div className="space-y-4">
            <TradeBucketsCard
              title="Paint & Drywall"
              description="Interior/exterior paint, wallpaper, drywall."
              icon={<Palette className="h-5 w-5" />}
              buckets={paintBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Glass"
              description="Shower glass doors and panels."
              icon={<Bath className="h-5 w-5" />}
              buckets={glassBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Finish Carpentry & Millwork"
              description="Baseboards, crown molding, wainscoting, casings."
              icon={<HardHat className="h-5 w-5" />}
              buckets={finishCarpentryBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Trim & Millwork (Itemized)"
              description="Custom baseboard, chair rail, coffered ceilings."
              icon={<Scissors className="h-5 w-5" />}
              buckets={trimMillworkBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Decorative Finishes"
              description="Shiplap, beams, tile fireplace, custom mirrors."
              icon={<Palette className="h-5 w-5" />}
              buckets={decorativeFinishesBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
          </div>
        </AccordionSection>

        {/* 8. MECHANICALS & APPLIANCES */}
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

        {/* 9. ADMIN & MISC */}
        <AccordionSection 
          title="Admin & Miscellaneous" 
          icon={<Truck className="h-5 w-5" />}
          defaultOpen={false}
        >
          <div className="space-y-4">
            <TradeBucketsCard
              title="Logistics & Admin"
              description="Portable toilets, engineering stamps, HOA fees."
              icon={<Truck className="h-5 w-5" />}
              buckets={logisticsAdminBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <TradeBucketsCard
              title="Contingency & Protection"
              description="Testing, warranties, documentation, touch-ups."
              icon={<Shield className="h-5 w-5" />}
              buckets={contingencyBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <span className="font-semibold">Commonly Forgotten:</span> These small items add up fast.
              </p>
            </div>
            <TradeBucketsCard
              title="Miscellaneous Always-Needed"
              description="Doors, hardware, accessories, final caulking."
              icon={<Wrench className="h-5 w-5" />}
              buckets={miscBuckets}
              onChange={handleChange}
              targetMargin={config.target_margin}
              pricingMode={pricingMode}
            />
          </div>
        </AccordionSection>

        {/* 10. ALLOWANCES */}
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
