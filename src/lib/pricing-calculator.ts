import { PricingConfig, JobState } from '@/types/database';

export interface CalculatedTotals {
  // IC totals
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
  
  // Margin
  margin_percent: number;
}

export function calculateEstimate(
  jobState: JobState,
  pricingConfig: PricingConfig
): CalculatedTotals {
  // Kitchen IC/CP
  let kitchen_scope_multiplier = 1.0;
  if (jobState.kitchen_scope_level === 'partial') {
    kitchen_scope_multiplier = pricingConfig.kitchen_partial_multiplier;
  } else if (jobState.kitchen_scope_level === 'refresh') {
    kitchen_scope_multiplier = pricingConfig.kitchen_refresh_multiplier;
  }
  
  const kitchen_ic_total = jobState.has_kitchen
    ? jobState.total_kitchen_sqft * pricingConfig.kitchen_ic_per_sqft * kitchen_scope_multiplier
    : 0;
  
  const kitchen_cp_total = jobState.has_kitchen
    ? jobState.total_kitchen_sqft * pricingConfig.kitchen_cp_per_sqft * kitchen_scope_multiplier
    : 0;

  // Bathroom IC/CP
  let bath_scope_multiplier = 1.0;
  if (jobState.bath_scope_level === 'partial') {
    bath_scope_multiplier = pricingConfig.bath_partial_multiplier;
  } else if (jobState.bath_scope_level === 'shower_only') {
    bath_scope_multiplier = pricingConfig.bath_shower_only_multiplier;
  } else if (jobState.bath_scope_level === 'refresh') {
    bath_scope_multiplier = pricingConfig.bath_refresh_multiplier;
  }
  
  const baths_ic_total = jobState.has_bathrooms
    ? jobState.total_bathroom_sqft * pricingConfig.bath_ic_per_sqft * bath_scope_multiplier
    : 0;
  
  const baths_cp_total = jobState.has_bathrooms
    ? jobState.total_bathroom_sqft * pricingConfig.bath_cp_per_sqft * bath_scope_multiplier
    : 0;

  // Closet IC/CP
  const closets_ic_total = jobState.has_closets
    ? jobState.total_closet_sqft * pricingConfig.closet_ic_per_sqft
    : 0;
  
  const closets_cp_total = jobState.has_closets
    ? jobState.total_closet_sqft * pricingConfig.closet_cp_per_sqft
    : 0;

  // Tile IC/CP
  const tile_ic_total =
    jobState.bath_wall_tile_sqft * pricingConfig.tile_wall_ic_per_sqft +
    jobState.bath_floor_tile_sqft * pricingConfig.tile_floor_ic_per_sqft +
    jobState.bath_shower_floor_tile_sqft * pricingConfig.tile_shower_floor_ic_per_sqft;
  
  const tile_cp_total =
    jobState.bath_wall_tile_sqft * pricingConfig.tile_wall_cp_per_sqft +
    jobState.bath_floor_tile_sqft * pricingConfig.tile_floor_cp_per_sqft +
    jobState.bath_shower_floor_tile_sqft * pricingConfig.tile_shower_floor_cp_per_sqft;

  // Cement board IC/CP
  const total_tile_sqft =
    jobState.bath_wall_tile_sqft +
    jobState.bath_floor_tile_sqft +
    jobState.bath_shower_floor_tile_sqft;
  
  const cement_board_ic_total = total_tile_sqft * pricingConfig.cement_board_ic_per_sqft;
  const cement_board_cp_total = total_tile_sqft * pricingConfig.cement_board_cp_per_sqft;

  // Quartz IC/CP
  const total_counter_sqft = jobState.kitchen_countertop_sqft + jobState.bath_countertop_sqft;
  const quartz_ic_total = total_counter_sqft * pricingConfig.quartz_ic_per_sqft;
  const quartz_cp_total = total_counter_sqft * pricingConfig.quartz_cp_per_sqft;

  // Lighting IC/CP
  const lighting_ic_total = jobState.num_recessed_cans * pricingConfig.recessed_can_ic_each;
  const lighting_cp_total = jobState.num_recessed_cans * pricingConfig.recessed_can_cp_each;

  // Cabinets/Vanities IC/CP
  const cabinets_ic_total = jobState.kitchen_cabinet_supplier_cost_ic;
  const vanities_ic_total = jobState.bath_vanity_supplier_cost_ic;
  
  const cabinet_multiplier = jobState.needs_gc_partner
    ? pricingConfig.cabinet_markup_multiplier_with_gc
    : pricingConfig.cabinet_markup_multiplier_no_gc;
  
  const cabinets_cp_total = jobState.kitchen_cabinet_supplier_cost_ic * cabinet_multiplier;
  const vanities_cp_total = jobState.bath_vanity_supplier_cost_ic * cabinet_multiplier;

  // Glass IC/CP
  const glass_ic_total = jobState.bath_uses_frameless_glass
    ? jobState.bath_frameless_glass_sqft * pricingConfig.frameless_glass_ic_per_sqft
    : 0;
  
  const glass_cp_total = jobState.bath_uses_frameless_glass
    ? jobState.bath_frameless_glass_sqft * pricingConfig.frameless_glass_cp_per_sqft
    : 0;

  // GC/Permit IC/CP
  const gc_permit_ic_total = jobState.needs_gc_partner && jobState.permit_required
    ? pricingConfig.gc_permit_fee_ic
    : 0;
  
  const gc_permit_cp_total = jobState.needs_gc_partner && jobState.permit_required
    ? pricingConfig.gc_permit_fee_cp
    : 0;

  // Other (placeholder)
  const other_ic_total = 0;
  const other_cp_total = 0;

  // Subtotals
  const subtotal_ic_before_min_job =
    kitchen_ic_total +
    baths_ic_total +
    closets_ic_total +
    tile_ic_total +
    cement_board_ic_total +
    quartz_ic_total +
    cabinets_ic_total +
    vanities_ic_total +
    glass_ic_total +
    lighting_ic_total +
    gc_permit_ic_total +
    other_ic_total;

  const subtotal_cp_before_min_job =
    kitchen_cp_total +
    baths_cp_total +
    closets_cp_total +
    tile_cp_total +
    cement_board_cp_total +
    quartz_cp_total +
    cabinets_cp_total +
    vanities_cp_total +
    glass_cp_total +
    lighting_cp_total +
    gc_permit_cp_total +
    other_cp_total;

  // Apply minimums
  const final_ic_total = Math.max(subtotal_ic_before_min_job, pricingConfig.min_job_ic);
  const final_cp_total = Math.max(subtotal_cp_before_min_job, pricingConfig.min_job_cp);

  // Range
  const low_estimate_cp = Math.round(final_cp_total * pricingConfig.low_range_multiplier);
  const high_estimate_cp = Math.round(final_cp_total * pricingConfig.high_range_multiplier);

  // Margin
  const margin_percent = final_cp_total > 0
    ? (final_cp_total - final_ic_total) / final_cp_total
    : 0;

  return {
    kitchen_ic_total: Math.round(kitchen_ic_total),
    baths_ic_total: Math.round(baths_ic_total),
    closets_ic_total: Math.round(closets_ic_total),
    tile_ic_total: Math.round(tile_ic_total),
    cement_board_ic_total: Math.round(cement_board_ic_total),
    quartz_ic_total: Math.round(quartz_ic_total),
    cabinets_ic_total: Math.round(cabinets_ic_total),
    vanities_ic_total: Math.round(vanities_ic_total),
    glass_ic_total: Math.round(glass_ic_total),
    lighting_ic_total: Math.round(lighting_ic_total),
    gc_permit_ic_total: Math.round(gc_permit_ic_total),
    other_ic_total: Math.round(other_ic_total),
    subtotal_ic_before_min_job: Math.round(subtotal_ic_before_min_job),
    final_ic_total: Math.round(final_ic_total),
    
    kitchen_cp_total: Math.round(kitchen_cp_total),
    baths_cp_total: Math.round(baths_cp_total),
    closets_cp_total: Math.round(closets_cp_total),
    tile_cp_total: Math.round(tile_cp_total),
    cement_board_cp_total: Math.round(cement_board_cp_total),
    quartz_cp_total: Math.round(quartz_cp_total),
    cabinets_cp_total: Math.round(cabinets_cp_total),
    vanities_cp_total: Math.round(vanities_cp_total),
    glass_cp_total: Math.round(glass_cp_total),
    lighting_cp_total: Math.round(lighting_cp_total),
    gc_permit_cp_total: Math.round(gc_permit_cp_total),
    other_cp_total: Math.round(other_cp_total),
    subtotal_cp_before_min_job: Math.round(subtotal_cp_before_min_job),
    final_cp_total: Math.round(final_cp_total),
    low_estimate_cp,
    high_estimate_cp,
    margin_percent,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(decimal: number): string {
  return `${(decimal * 100).toFixed(1)}%`;
}
