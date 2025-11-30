// TKBSO Real Pricing Standards
// This file contains deterministic pricing logic based on actual TKBSO trade costs

export interface TKBSOPricingConfig {
  // Tile rates (per sqft)
  tile_wall_ic: number;
  tile_wall_cp: number;
  tile_floor_ic: number;
  tile_floor_cp: number;
  tile_shower_floor_ic: number;
  tile_shower_floor_cp: number;
  
  // Cement board (per sqft)
  cement_board_ic: number;
  cement_board_cp: number;
  
  // Waterproofing (per sqft)
  waterproofing_ic: number;
  waterproofing_cp: number;
  
  // Demo packages (fixed)
  demo_shower_only_ic: number;
  demo_shower_only_cp: number;
  demo_small_bath_ic: number;
  demo_small_bath_cp: number;
  demo_large_bath_ic: number;
  demo_large_bath_cp: number;
  demo_kitchen_ic: number;
  demo_kitchen_cp: number;
  
  // Plumbing packages (fixed)
  plumbing_shower_standard_ic: number;
  plumbing_shower_standard_cp: number;
  plumbing_extra_head_ic: number;
  plumbing_extra_head_cp: number;
  plumbing_tub_freestanding_ic: number;
  plumbing_tub_freestanding_cp: number;
  plumbing_toilet_ic: number;
  plumbing_toilet_cp: number;
  
  // Electrical packages
  recessed_can_ic: number;
  recessed_can_cp: number;
  electrical_vanity_light_ic: number;
  electrical_vanity_light_cp: number;
  electrical_small_package_ic: number;
  electrical_small_package_cp: number;
  
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
  
  // Vanity bundles
  vanity_48_bundle_ic: number;
  vanity_48_bundle_cp: number;
  vanity_60_bundle_ic: number;
  vanity_60_bundle_cp: number;
  
  // Quartz (per sqft)
  quartz_ic: number;
  quartz_cp: number;
  
  // Minimums
  min_job_ic: number;
  min_job_cp: number;
  
  // Target margins
  target_margin: number;
}

// Default TKBSO pricing - Updated Jan 2025
// No multipliers - use line items for scope variations
export const TKBSO_DEFAULT_PRICING: TKBSOPricingConfig = {
  // Tile rates (per sqft ranges from pricing doc)
  tile_wall_ic: 20,       // $18-22/sqft range
  tile_wall_cp: 39,       // $36-42/sqft range
  tile_floor_ic: 5.5,     // $4.5-6.5/sqft range
  tile_floor_cp: 12,      // $10-14/sqft range
  tile_shower_floor_ic: 6, // $5-7/sqft range
  tile_shower_floor_cp: 14, // $12-16/sqft range
  
  // Cement board / backerboard
  cement_board_ic: 3,
  cement_board_cp: 5,
  
  // Waterproofing system (required)
  waterproofing_ic: 6,    // $6/sqft includes membrane, corners, seam banding
  waterproofing_cp: 13,   // $12-14/sqft range
  
  // Demo packages (fixed - never blend into other categories)
  demo_shower_only_ic: 900,
  demo_shower_only_cp: 1450,
  demo_small_bath_ic: 1300,
  demo_small_bath_cp: 2050,
  demo_large_bath_ic: 1650,
  demo_large_bath_cp: 2500,
  demo_kitchen_ic: 1750,
  demo_kitchen_cp: 2800,
  
  // Plumbing packages (always ask: slab/raised? fixture relocation? diverter count?)
  plumbing_shower_standard_ic: 2225,  // $2,100-2,350 range - drain upgrade, valve move, supply relocation, vent, pan drain, pressure test
  plumbing_shower_standard_cp: 3425,  // $3,250-3,600 range
  plumbing_extra_head_ic: 625,        // $550-700 range
  plumbing_extra_head_cp: 1100,       // $900-1,300 range
  plumbing_tub_freestanding_ic: 3300, // $3,000-3,600 range - includes slab trench if applicable
  plumbing_tub_freestanding_cp: 4800, // $4,400-5,200 range
  plumbing_toilet_ic: 350,
  plumbing_toilet_cp: 690,            // $650-725 swap, $800-1,100 relocation
  
  // Electrical packages
  recessed_can_ic: 65,
  recessed_can_cp: 110,
  electrical_vanity_light_ic: 200,
  electrical_vanity_light_cp: 350,
  electrical_small_package_ic: 250,
  electrical_small_package_cp: 400,
  
  // Paint packages
  paint_patch_bath_ic: 800,
  paint_patch_bath_cp: 1300,
  paint_full_bath_ic: 1200,
  paint_full_bath_cp: 1900,
  
  // Glass packages (never use "$2,000 standard")
  glass_shower_standard_ic: 1200,  // Door + panel
  glass_shower_standard_cp: 2100,
  glass_panel_only_ic: 800,
  glass_panel_only_cp: 1450,
  
  // Vanity bundles (includes quartz top + sink)
  vanity_48_bundle_ic: 1600,
  vanity_48_bundle_cp: 2600,
  vanity_60_bundle_ic: 2200,
  vanity_60_bundle_cp: 3500,
  
  // Quartz (fab + install)
  quartz_ic: 15,
  quartz_cp: 50,  // +$250 sink cutout, +$150 faucet drill
  
  // Minimums (jobs below rejected automatically)
  min_job_ic: 10500,
  min_job_cp: 15000,
  
  // Target margin
  target_margin: 0.38,
};

// Standard TKBSO margins by project type
export const TKBSO_MARGINS = {
  bathroom: { target: 0.38, range: { low: 0.35, high: 0.42 } },
  kitchen: { target: 0.35, range: { low: 0.32, high: 0.40 } },
  closet: { target: 0.32, range: { low: 0.28, high: 0.35 } },
  combination: { target: 0.36, range: { low: 0.33, high: 0.40 } },
};

// Per-sqft sanity check anchors (client-facing)
export const TKBSO_SQFT_ANCHORS = {
  bathroom: { low: 360, high: 380 },  // Full gut with tile, glass, vanity
  kitchen: { low: 175, high: 195 },   // Full gut with cabinets, quartz
};

export interface ShowerDimensions {
  lengthFt: number;
  widthFt: number;
  heightFt: number;
}

export interface BathroomDimensions {
  lengthFt: number;
  widthFt: number;
}

export interface TKBSOJobInputs {
  // Room type
  projectType: 'shower_only' | 'small_bath' | 'large_bath' | 'kitchen' | 'combination';
  
  // Shower dimensions (for calculating tile areas)
  showerDimensions?: ShowerDimensions;
  
  // Main bathroom floor dimensions
  bathroomFloorDimensions?: BathroomDimensions;
  
  // What's included
  includeDemo: boolean;
  includePlumbing: boolean;
  includeTile: boolean;
  includeWaterproofing: boolean;
  includeCementBoard: boolean;
  includeElectrical: boolean;
  includePaint: boolean;
  includeGlass: boolean;
  includeVanity: boolean;
  includeCountertops: boolean;
  
  // Specific counts/sizes
  numToilets: number;
  numRecessedCans: number;
  numVanityLights: number;
  vanitySize: 'none' | '48' | '60';
  glassType: 'none' | 'standard' | 'panel_only';
  paintType: 'none' | 'patch' | 'full';
  countertopSqft: number;
  
  // Override tile sqft (if calculated elsewhere)
  wallTileSqft?: number;
  floorTileSqft?: number;
  showerFloorTileSqft?: number;
}

export interface TKBSOPricingResult {
  // Trade-level IC
  demo_ic: number;
  plumbing_ic: number;
  tile_ic: number;
  cement_board_ic: number;
  waterproofing_ic: number;
  electrical_ic: number;
  paint_ic: number;
  glass_ic: number;
  vanity_ic: number;
  countertop_ic: number;
  
  // Trade-level CP
  demo_cp: number;
  plumbing_cp: number;
  tile_cp: number;
  cement_board_cp: number;
  waterproofing_cp: number;
  electrical_cp: number;
  paint_cp: number;
  glass_cp: number;
  vanity_cp: number;
  countertop_cp: number;
  
  // Totals
  total_ic: number;
  total_cp: number;
  
  // Range
  low_estimate: number;
  high_estimate: number;
  
  // Calculated margin
  margin: number;
  profit: number;
  
  // Tile sqft breakdown
  wall_tile_sqft: number;
  floor_tile_sqft: number;
  shower_floor_sqft: number;
}

/**
 * Calculate tile areas from shower dimensions
 */
export function calculateTileAreas(showerDims?: ShowerDimensions, bathroomFloorDims?: BathroomDimensions): {
  wallTileSqft: number;
  floorTileSqft: number;
  showerFloorSqft: number;
} {
  let wallTileSqft = 0;
  let floorTileSqft = 0;
  let showerFloorSqft = 0;
  
  if (showerDims) {
    // Shower wall tile = perimeter * height
    const perimeter = 2 * (showerDims.lengthFt + showerDims.widthFt);
    wallTileSqft = perimeter * showerDims.heightFt;
    
    // Shower floor tile
    showerFloorSqft = showerDims.lengthFt * showerDims.widthFt;
  }
  
  if (bathroomFloorDims) {
    // Main bathroom floor tile
    floorTileSqft = bathroomFloorDims.lengthFt * bathroomFloorDims.widthFt;
  }
  
  return { wallTileSqft, floorTileSqft, showerFloorSqft };
}

/**
 * Calculate TKBSO estimate from job inputs
 * This is the MAIN pricing function that uses real TKBSO trade allowances
 */
export function calculateTKBSOEstimate(
  inputs: TKBSOJobInputs,
  pricing: TKBSOPricingConfig = TKBSO_DEFAULT_PRICING
): TKBSOPricingResult {
  // Calculate tile areas if not provided
  const tileAreas = calculateTileAreas(inputs.showerDimensions, inputs.bathroomFloorDimensions);
  const wallTileSqft = inputs.wallTileSqft ?? tileAreas.wallTileSqft;
  const floorTileSqft = inputs.floorTileSqft ?? tileAreas.floorTileSqft;
  const showerFloorSqft = inputs.showerFloorTileSqft ?? tileAreas.showerFloorSqft;
  
  // Total tile area for cement board and waterproofing
  const totalTileSqft = wallTileSqft + floorTileSqft + showerFloorSqft;
  
  // Demo IC/CP based on project type
  let demo_ic = 0;
  let demo_cp = 0;
  if (inputs.includeDemo) {
    switch (inputs.projectType) {
      case 'shower_only':
        demo_ic = pricing.demo_shower_only_ic;
        demo_cp = pricing.demo_shower_only_cp;
        break;
      case 'small_bath':
        demo_ic = pricing.demo_small_bath_ic;
        demo_cp = pricing.demo_small_bath_cp;
        break;
      case 'large_bath':
        demo_ic = pricing.demo_large_bath_ic;
        demo_cp = pricing.demo_large_bath_cp;
        break;
      case 'kitchen':
        demo_ic = pricing.demo_kitchen_ic;
        demo_cp = pricing.demo_kitchen_cp;
        break;
      case 'combination':
        demo_ic = pricing.demo_small_bath_ic + pricing.demo_kitchen_ic;
        demo_cp = pricing.demo_small_bath_cp + pricing.demo_kitchen_cp;
        break;
    }
  }
  
  // Plumbing IC/CP
  let plumbing_ic = 0;
  let plumbing_cp = 0;
  if (inputs.includePlumbing) {
    // Base shower plumbing package
    if (inputs.projectType === 'shower_only' || inputs.projectType === 'small_bath' || inputs.projectType === 'large_bath') {
      plumbing_ic += pricing.plumbing_shower_standard_ic;
      plumbing_cp += pricing.plumbing_shower_standard_cp;
    }
    
    // Toilets
    plumbing_ic += inputs.numToilets * pricing.plumbing_toilet_ic;
    plumbing_cp += inputs.numToilets * pricing.plumbing_toilet_cp;
  }
  
  // Tile IC/CP
  let tile_ic = 0;
  let tile_cp = 0;
  if (inputs.includeTile) {
    tile_ic = wallTileSqft * pricing.tile_wall_ic +
              floorTileSqft * pricing.tile_floor_ic +
              showerFloorSqft * pricing.tile_shower_floor_ic;
    tile_cp = wallTileSqft * pricing.tile_wall_cp +
              floorTileSqft * pricing.tile_floor_cp +
              showerFloorSqft * pricing.tile_shower_floor_cp;
  }
  
  // Cement board IC/CP
  let cement_board_ic = 0;
  let cement_board_cp = 0;
  if (inputs.includeCementBoard && totalTileSqft > 0) {
    cement_board_ic = totalTileSqft * pricing.cement_board_ic;
    cement_board_cp = totalTileSqft * pricing.cement_board_cp;
  }
  
  // Waterproofing IC/CP
  let waterproofing_ic = 0;
  let waterproofing_cp = 0;
  if (inputs.includeWaterproofing && totalTileSqft > 0) {
    waterproofing_ic = totalTileSqft * pricing.waterproofing_ic;
    waterproofing_cp = totalTileSqft * pricing.waterproofing_cp;
  }
  
  // Electrical IC/CP
  let electrical_ic = 0;
  let electrical_cp = 0;
  if (inputs.includeElectrical) {
    electrical_ic = inputs.numRecessedCans * pricing.recessed_can_ic +
                    inputs.numVanityLights * pricing.electrical_vanity_light_ic;
    electrical_cp = inputs.numRecessedCans * pricing.recessed_can_cp +
                    inputs.numVanityLights * pricing.electrical_vanity_light_cp;
    
    // Add small package if any electrical work
    if (electrical_ic === 0 && inputs.includeElectrical) {
      electrical_ic = pricing.electrical_small_package_ic;
      electrical_cp = pricing.electrical_small_package_cp;
    }
  }
  
  // Paint IC/CP
  let paint_ic = 0;
  let paint_cp = 0;
  if (inputs.includePaint) {
    switch (inputs.paintType) {
      case 'patch':
        paint_ic = pricing.paint_patch_bath_ic;
        paint_cp = pricing.paint_patch_bath_cp;
        break;
      case 'full':
        paint_ic = pricing.paint_full_bath_ic;
        paint_cp = pricing.paint_full_bath_cp;
        break;
    }
  }
  
  // Glass IC/CP
  let glass_ic = 0;
  let glass_cp = 0;
  if (inputs.includeGlass) {
    switch (inputs.glassType) {
      case 'standard':
        glass_ic = pricing.glass_shower_standard_ic;
        glass_cp = pricing.glass_shower_standard_cp;
        break;
      case 'panel_only':
        glass_ic = pricing.glass_panel_only_ic;
        glass_cp = pricing.glass_panel_only_cp;
        break;
    }
  }
  
  // Vanity IC/CP
  let vanity_ic = 0;
  let vanity_cp = 0;
  if (inputs.includeVanity) {
    switch (inputs.vanitySize) {
      case '48':
        vanity_ic = pricing.vanity_48_bundle_ic;
        vanity_cp = pricing.vanity_48_bundle_cp;
        break;
      case '60':
        vanity_ic = pricing.vanity_60_bundle_ic;
        vanity_cp = pricing.vanity_60_bundle_cp;
        break;
    }
  }
  
  // Countertop IC/CP (for kitchen or separate bath counters)
  let countertop_ic = 0;
  let countertop_cp = 0;
  if (inputs.includeCountertops && inputs.countertopSqft > 0) {
    countertop_ic = inputs.countertopSqft * pricing.quartz_ic;
    countertop_cp = inputs.countertopSqft * pricing.quartz_cp;
  }
  
  // Sum totals
  const total_ic = demo_ic + plumbing_ic + tile_ic + cement_board_ic + 
                   waterproofing_ic + electrical_ic + paint_ic + 
                   glass_ic + vanity_ic + countertop_ic;
  
  const total_cp = demo_cp + plumbing_cp + tile_cp + cement_board_cp + 
                   waterproofing_cp + electrical_cp + paint_cp + 
                   glass_cp + vanity_cp + countertop_cp;
  
  // Apply minimums
  const final_ic = Math.max(total_ic, pricing.min_job_ic);
  const final_cp = Math.max(total_cp, pricing.min_job_cp);
  
  // Calculate margin
  const margin = final_cp > 0 ? (final_cp - final_ic) / final_cp : 0;
  const profit = final_cp - final_ic;
  
  // Range (±5%)
  const low_estimate = Math.round(final_cp * 0.95);
  const high_estimate = Math.round(final_cp * 1.05);
  
  return {
    demo_ic: Math.round(demo_ic),
    plumbing_ic: Math.round(plumbing_ic),
    tile_ic: Math.round(tile_ic),
    cement_board_ic: Math.round(cement_board_ic),
    waterproofing_ic: Math.round(waterproofing_ic),
    electrical_ic: Math.round(electrical_ic),
    paint_ic: Math.round(paint_ic),
    glass_ic: Math.round(glass_ic),
    vanity_ic: Math.round(vanity_ic),
    countertop_ic: Math.round(countertop_ic),
    
    demo_cp: Math.round(demo_cp),
    plumbing_cp: Math.round(plumbing_cp),
    tile_cp: Math.round(tile_cp),
    cement_board_cp: Math.round(cement_board_cp),
    waterproofing_cp: Math.round(waterproofing_cp),
    electrical_cp: Math.round(electrical_cp),
    paint_cp: Math.round(paint_cp),
    glass_cp: Math.round(glass_cp),
    vanity_cp: Math.round(vanity_cp),
    countertop_cp: Math.round(countertop_cp),
    
    total_ic: Math.round(final_ic),
    total_cp: Math.round(final_cp),
    low_estimate,
    high_estimate,
    margin,
    profit: Math.round(profit),
    
    wall_tile_sqft: Math.round(wallTileSqft),
    floor_tile_sqft: Math.round(floorTileSqft),
    shower_floor_sqft: Math.round(showerFloorSqft),
  };
}

/**
 * Recalculate CP given IC and a target margin
 * Formula: CP = IC / (1 - margin)
 */
export function calculateCPFromIC(ic: number, targetMargin: number): number {
  if (targetMargin >= 1 || targetMargin < 0) return ic;
  return Math.round(ic / (1 - targetMargin));
}

/**
 * Recalculate margin given IC and selling price
 * Formula: margin = 1 - (IC / CP)
 */
export function calculateMarginFromPrices(ic: number, cp: number): number {
  if (cp === 0) return 0;
  return 1 - (ic / cp);
}

/**
 * Get margin status for display
 */
export function getMarginStatus(margin: number): {
  status: 'low' | 'healthy' | 'good' | 'high';
  message: string;
  color: 'red' | 'yellow' | 'green' | 'orange';
} {
  if (margin < 0.30) {
    return {
      status: 'low',
      message: 'Margin under 30%. TKBSO typically wants 35-40% on bathrooms.',
      color: 'yellow',
    };
  }
  if (margin >= 0.30 && margin < 0.35) {
    return {
      status: 'healthy',
      message: 'Margin is acceptable but below TKBSO target (35-40%).',
      color: 'yellow',
    };
  }
  if (margin >= 0.35 && margin <= 0.45) {
    return {
      status: 'good',
      message: 'TKBSO Standard Margin – Good',
      color: 'green',
    };
  }
  // margin > 0.45
  return {
    status: 'high',
    message: 'Margin over 45% is unusual. Check that IC assumptions are correct.',
    color: 'orange',
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(decimal: number): string {
  return `${(decimal * 100).toFixed(1)}%`;
}
