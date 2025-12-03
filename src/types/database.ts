import { ContractorSettings } from './settings';

// Database types for the TKBSO Estimator
export interface Contractor {
  id: string;
  name: string;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  service_area: string | null;
  logo_url: string | null;
  notes: string | null;
  settings: ContractorSettings | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  contractor_id: string | null;
  name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface PricingConfig {
  id: string;
  contractor_id: string;
  currency: string;
  
  // Kitchen
  kitchen_ic_per_sqft: number;
  kitchen_cp_per_sqft: number;
  kitchen_partial_multiplier: number;
  kitchen_refresh_multiplier: number;
  
  // Bath
  bath_ic_per_sqft: number;
  bath_cp_per_sqft: number;
  bath_shower_only_multiplier: number;
  bath_partial_multiplier: number;
  bath_refresh_multiplier: number;
  
  // Closet
  closet_ic_per_sqft: number;
  closet_cp_per_sqft: number;
  
  // Tile
  tile_wall_ic_per_sqft: number;
  tile_wall_cp_per_sqft: number;
  tile_floor_ic_per_sqft: number;
  tile_floor_cp_per_sqft: number;
  tile_shower_floor_ic_per_sqft: number;
  tile_shower_floor_cp_per_sqft: number;
  
  // Cement board
  cement_board_ic_per_sqft: number;
  cement_board_cp_per_sqft: number;
  
  // Waterproofing
  waterproofing_ic_per_sqft: number;
  waterproofing_cp_per_sqft: number;
  
  // Quartz
  quartz_ic_per_sqft: number;
  quartz_cp_per_sqft: number;
  
  // Lighting
  recessed_can_ic_each: number;
  recessed_can_cp_each: number;
  
  // Glass (legacy - not used in UI)
  frameless_glass_ic_per_sqft: number;
  frameless_glass_cp_per_sqft: number;
  
  // GC/Permits (legacy - not used in UI)
  gc_permit_fee_ic: number;
  gc_permit_fee_cp: number;
  
  // Cabinet markups
  cabinet_markup_multiplier_no_gc: number;
  cabinet_markup_multiplier_with_gc: number;
  
  // Minimums
  min_job_ic: number;
  min_job_cp: number;
  
  // Margins
  target_margin: number;
  low_range_multiplier: number;
  high_range_multiplier: number;
  
  // Management Fee
  management_fee_percent: number;
  
  // Payment splits
  payment_split_deposit: number;
  payment_split_progress: number;
  payment_split_final: number;
  
  // Demo packages
  demo_shower_only_ic: number;
  demo_shower_only_cp: number;
  demo_small_bath_ic: number;
  demo_small_bath_cp: number;
  demo_large_bath_ic: number;
  demo_large_bath_cp: number;
  demo_kitchen_ic: number;
  demo_kitchen_cp: number;
  
  // Plumbing packages
  plumbing_shower_standard_ic: number;
  plumbing_shower_standard_cp: number;
  plumbing_extra_head_ic: number;
  plumbing_extra_head_cp: number;
  plumbing_tub_freestanding_ic: number;
  plumbing_tub_freestanding_cp: number;
  plumbing_toilet_ic: number;
  plumbing_toilet_cp: number;
  
  // Electrical packages
  electrical_vanity_light_ic: number;
  electrical_vanity_light_cp: number;
  electrical_small_package_ic: number;
  electrical_small_package_cp: number;
  electrical_kitchen_package_ic: number;
  electrical_kitchen_package_cp: number;
  
  // Paint packages
  paint_patch_bath_ic: number;
  paint_patch_bath_cp: number;
  paint_full_bath_ic: number;
  paint_full_bath_cp: number;
  
  // Glass packages
  glass_shower_standard_ic: number;
  glass_shower_standard_cp: number;
  glass_panel_only_ic: number;
  glass_panel_only_cp: number;
  
  // Vanity bundles - All sizes
  vanity_30_bundle_ic: number;
  vanity_30_bundle_cp: number;
  vanity_36_bundle_ic: number;
  vanity_36_bundle_cp: number;
  vanity_48_bundle_ic: number;
  vanity_48_bundle_cp: number;
  vanity_54_bundle_ic: number;
  vanity_54_bundle_cp: number;
  vanity_60_bundle_ic: number;
  vanity_60_bundle_cp: number;
  vanity_72_bundle_ic: number;
  vanity_72_bundle_cp: number;
  vanity_84_bundle_ic: number;
  vanity_84_bundle_cp: number;
  
  // Material allowances (client-facing)
  tile_material_allowance_cp_per_sqft: number;
  plumbing_fixture_allowance_cp: number;
  mirror_allowance_cp: number;
  lighting_fixture_allowance_cp: number;
  hardware_allowance_per_pull_cp: number;
  toilet_allowance_cp: number;
  sink_faucet_allowance_cp: number;
  tub_allowance_cp: number;
  shower_trim_kit_allowance_cp: number;
  tub_filler_allowance_cp: number;
  kitchen_faucet_allowance_cp: number;
  garbage_disposal_allowance_cp: number;
  freestanding_tub_allowance_cp: number;
  quartz_slab_level1_allowance_cp: number;
  
  // Dumpster/Haul
  dumpster_bath_ic: number;
  dumpster_bath_cp: number;
  dumpster_kitchen_ic: number;
  dumpster_kitchen_cp: number;
  
  // Additional Plumbing Packages
  plumbing_tub_to_shower_ic: number;
  plumbing_tub_to_shower_cp: number;
  plumbing_smart_valve_ic: number;
  plumbing_smart_valve_cp: number;
  plumbing_linear_drain_ic: number;
  plumbing_linear_drain_cp: number;
  plumbing_toilet_relocation_cp: number;
  
  // Framing & Structure
  framing_standard_ic: number;
  framing_standard_cp: number;
  framing_pony_wall_ic: number;
  framing_pony_wall_cp: number;
  niche_ic_each: number;
  niche_cp_each: number;
  
  // Floor Prep/Leveling
  floor_leveling_small_ic: number;
  floor_leveling_small_cp: number;
  floor_leveling_bath_ic: number;
  floor_leveling_bath_cp: number;
  floor_leveling_kitchen_ic: number;
  floor_leveling_kitchen_cp: number;
  floor_leveling_ls_ic: number;
  floor_leveling_ls_cp: number;
  
  // LVP & Barrier Flooring
  lvp_ic_per_sqft: number;
  lvp_cp_per_sqft: number;
  barrier_ic_per_sqft: number;
  barrier_cp_per_sqft: number;
  
  // Additional Electrical
  electrical_microwave_circuit_cp: number;
  electrical_hood_relocation_cp: number;
  electrical_dishwasher_disposal_cp: number;
  
  // Additional Glass
  glass_90_return_ic: number;
  glass_90_return_cp: number;
  
  // Additional Vanity/Counter (legacy)
  vanity_only_48_cp: number;
  quartz_sink_cutout_cp: number;
  quartz_faucet_drill_cp: number;
  
  // Structural / Complex Work
  wall_removal_ic: number;
  wall_removal_cp: number;
  door_relocation_ic: number;
  door_relocation_cp: number;
  door_closure_ic: number;
  door_closure_cp: number;
  entrance_enlargement_ic: number;
  entrance_enlargement_cp: number;
  soffit_removal_ic: number;
  soffit_removal_cp: number;
  shower_enlargement_ic: number;
  shower_enlargement_cp: number;
  tub_relocation_ic: number;
  tub_relocation_cp: number;
  toilet_relocation_ic: number;
  toilet_relocation_cp: number;
  alcove_builtin_ic: number;
  alcove_builtin_cp: number;
  closet_reframe_ic: number;
  closet_reframe_cp: number;
  drywall_ic_per_sqft: number;
  drywall_cp_per_sqft: number;
  
  // Cabinet pricing (per linear foot)
  cabinet_lf_ic: number;
  cabinet_lf_cp: number;
  cabinet_install_only_lf_ic: number;
  cabinet_install_only_lf_cp: number;
  
  created_at: string;
  updated_at: string;
}

export interface JobState {
  has_kitchen: boolean;
  has_bathrooms: boolean;
  has_closets: boolean;
  
  total_kitchen_sqft: number;
  num_kitchens: number;
  kitchen_scope_level: 'none' | 'full_gut' | 'partial' | 'refresh';
  kitchen_countertop_sqft: number;
  kitchen_uses_tkbso_cabinets: boolean;
  kitchen_cabinet_supplier_cost_ic: number;
  
  total_bathroom_sqft: number;
  num_bathrooms: number;
  bath_scope_level: 'none' | 'full_gut' | 'partial' | 'shower_only' | 'refresh';
  bath_shower_only_sqft: number;
  bath_wall_tile_sqft: number;
  bath_floor_tile_sqft: number;
  bath_shower_floor_tile_sqft: number;
  bath_countertop_sqft: number;
  bath_uses_tkbso_vanities: boolean;
  bath_vanity_supplier_cost_ic: number;
  bath_uses_frameless_glass: boolean;
  bath_frameless_glass_sqft: number;
  
  total_closet_sqft: number;
  num_closets: number;
  closet_scope_level: 'none' | 'framing_only' | 'shelves_only' | 'full';
  
  num_recessed_cans: number;
  needs_gc_partner: boolean;
  permit_required: boolean;
  job_notes: string;
  
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  property_address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface Estimate {
  id: string;
  contractor_id: string;
  created_by_profile_id: string | null;
  
  job_label: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  property_address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  
  has_kitchen: boolean;
  has_bathrooms: boolean;
  has_closets: boolean;
  
  total_kitchen_sqft: number;
  num_kitchens: number;
  kitchen_scope_level: string;
  kitchen_countertop_sqft: number;
  kitchen_uses_tkbso_cabinets: boolean;
  kitchen_cabinet_supplier_cost_ic: number;
  
  total_bathroom_sqft: number;
  num_bathrooms: number;
  bath_scope_level: string;
  bath_shower_only_sqft: number;
  bath_wall_tile_sqft: number;
  bath_floor_tile_sqft: number;
  bath_shower_floor_tile_sqft: number;
  bath_countertop_sqft: number;
  bath_uses_tkbso_vanities: boolean;
  bath_vanity_supplier_cost_ic: number;
  bath_uses_frameless_glass: boolean;
  bath_frameless_glass_sqft: number;
  
  total_closet_sqft: number;
  num_closets: number;
  closet_scope_level: string;
  
  num_recessed_cans: number;
  num_toilets: number;
  num_vanity_lights: number;
  needs_gc_partner: boolean;
  permit_required: boolean;
  job_notes: string | null;
  
  // Trade toggles
  include_demo: boolean;
  include_plumbing: boolean;
  include_electrical: boolean;
  include_paint: boolean;
  include_glass: boolean;
  include_waterproofing: boolean;
  
  // Type selections
  glass_type: string;
  vanity_size: string;
  
  // IC totals
  demo_ic_total: number;
  plumbing_ic_total: number;
  waterproofing_ic_total: number;
  paint_ic_total: number;
  kitchen_ic_total: number;
  baths_ic_total: number;
  closets_ic_total: number;
  tile_ic_total: number;
  cement_board_ic_total: number;
  quartz_ic_total: number;
  cabinets_ic_total: number;
  vanities_ic_total: number;
  glass_ic_total: number;
  lighting_ic_total: number;
  gc_permit_ic_total: number;
  other_ic_total: number;
  subtotal_ic_before_min_job: number;
  final_ic_total: number;
  
  // CP totals
  demo_cp_total: number;
  plumbing_cp_total: number;
  waterproofing_cp_total: number;
  paint_cp_total: number;
  kitchen_cp_total: number;
  baths_cp_total: number;
  closets_cp_total: number;
  tile_cp_total: number;
  cement_board_cp_total: number;
  quartz_cp_total: number;
  cabinets_cp_total: number;
  vanities_cp_total: number;
  glass_cp_total: number;
  lighting_cp_total: number;
  gc_permit_cp_total: number;
  other_cp_total: number;
  subtotal_cp_before_min_job: number;
  final_cp_total: number;
  low_estimate_cp: number;
  high_estimate_cp: number;
  
  client_estimate_text: string | null;
  internal_json_payload: Record<string, unknown> | null;
  status: 'draft' | 'sent' | 'won' | 'lost';
  
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  contractor_id: string;
  created_by_profile_id: string | null;
  job_label: string | null;
  status: 'in_progress' | 'completed' | 'archived';
  current_job_state: Partial<JobState>;
  linked_estimate_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_session_id: string;
  sender_type: 'user' | 'assistant';
  sender_profile_id: string | null;
  content: string;
  role: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export const DEFAULT_JOB_STATE: JobState = {
  has_kitchen: false,
  has_bathrooms: false,
  has_closets: false,
  total_kitchen_sqft: 0,
  num_kitchens: 0,
  kitchen_scope_level: 'none',
  kitchen_countertop_sqft: 0,
  kitchen_uses_tkbso_cabinets: false,
  kitchen_cabinet_supplier_cost_ic: 0,
  total_bathroom_sqft: 0,
  num_bathrooms: 0,
  bath_scope_level: 'none',
  bath_shower_only_sqft: 0,
  bath_wall_tile_sqft: 0,
  bath_floor_tile_sqft: 0,
  bath_shower_floor_tile_sqft: 0,
  bath_countertop_sqft: 0,
  bath_uses_tkbso_vanities: false,
  bath_vanity_supplier_cost_ic: 0,
  bath_uses_frameless_glass: false,
  bath_frameless_glass_sqft: 0,
  total_closet_sqft: 0,
  num_closets: 0,
  closet_scope_level: 'none',
  num_recessed_cans: 0,
  needs_gc_partner: false,
  permit_required: false,
  job_notes: '',
};
