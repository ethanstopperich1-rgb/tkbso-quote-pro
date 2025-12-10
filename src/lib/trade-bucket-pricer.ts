// Trade Bucket Pricer: Maps AI-extracted trade buckets to pricing_configs and calculates dollar amounts

import { Tables } from '@/integrations/supabase/types';

type PricingConfig = Tables<'pricing_configs'>;

export interface TradeBucket {
  category: string;
  task_description: string;
  quantity: number;
  unit: string;
  margin_override?: string | null;
}

export interface PricingResult {
  category: string;
  task_description: string;
  quantity: number;
  unit: string;
  ic_per_unit: number;
  cp_per_unit: number;
  ic_total: number;
  cp_total: number;
  margin_percent: number;
  notes?: string;
}

export interface ProjectPricing {
  line_items: PricingResult[];
  totals: {
    total_ic: number;
    total_cp: number;
    overall_margin_percent: number;
  };
  warnings: string[];
}

// Map trade bucket categories to pricing_configs fields
function mapCategoryToPricingField(
  category: string,
  taskDescription: string,
  config: PricingConfig
): { ic: number | null; cp: number | null; unit: string } | null {
  const categoryLower = category.toLowerCase();
  const taskLower = taskDescription.toLowerCase();

  // Demolition
  if (categoryLower.includes('demo')) {
    if (taskLower.includes('shower') && taskLower.includes('only')) {
      return { ic: config.demo_shower_only_ic, cp: config.demo_shower_only_cp, unit: 'ea' };
    } else if (taskLower.includes('small') || taskLower.includes('vanity')) {
      return { ic: config.demo_small_bath_ic, cp: config.demo_small_bath_cp, unit: 'ea' };
    } else if (taskLower.includes('large') || taskLower.includes('full bath')) {
      return { ic: config.demo_large_bath_ic, cp: config.demo_large_bath_cp, unit: 'ea' };
    } else if (taskLower.includes('kitchen')) {
      return { ic: config.demo_kitchen_ic, cp: config.demo_kitchen_cp, unit: 'ea' };
    }
    // Default to small bath demo
    return { ic: config.demo_small_bath_ic, cp: config.demo_small_bath_cp, unit: 'ea' };
  }

  // Plumbing
  if (categoryLower.includes('plumb')) {
    if (taskLower.includes('toilet')) {
      return { ic: config.plumbing_toilet_ic, cp: config.plumbing_toilet_cp, unit: 'ea' };
    } else if (taskLower.includes('shower') && taskLower.includes('standard')) {
      return { ic: config.plumbing_shower_standard_ic, cp: config.plumbing_shower_standard_cp, unit: 'ea' };
    } else if (taskLower.includes('extra head') || taskLower.includes('additional')) {
      return { ic: config.plumbing_extra_head_ic, cp: config.plumbing_extra_head_cp, unit: 'ea' };
    } else if (taskLower.includes('tub') && taskLower.includes('freestanding')) {
      return { ic: config.plumbing_tub_freestanding_ic, cp: config.plumbing_tub_freestanding_cp, unit: 'ea' };
    } else if (taskLower.includes('tub to shower') || taskLower.includes('conversion')) {
      return { ic: config.plumbing_tub_to_shower_ic, cp: config.plumbing_tub_to_shower_cp, unit: 'ea' };
    } else if (taskLower.includes('linear drain')) {
      return { ic: config.plumbing_linear_drain_ic, cp: config.plumbing_linear_drain_cp, unit: 'ea' };
    } else if (taskLower.includes('smart valve')) {
      return { ic: config.plumbing_smart_valve_ic, cp: config.plumbing_smart_valve_cp, unit: 'ea' };
    }
    // Default to standard shower plumbing
    return { ic: config.plumbing_shower_standard_ic, cp: config.plumbing_shower_standard_cp, unit: 'ea' };
  }

  // Tile
  if (categoryLower.includes('tile')) {
    if (taskLower.includes('wall') || taskLower.includes('shower wall')) {
      return { ic: config.tile_wall_ic_per_sqft, cp: config.tile_wall_cp_per_sqft, unit: 'sqft' };
    } else if (taskLower.includes('shower floor')) {
      return { ic: config.tile_shower_floor_ic_per_sqft, cp: config.tile_shower_floor_cp_per_sqft, unit: 'sqft' };
    } else if (taskLower.includes('floor') || taskLower.includes('main floor')) {
      return { ic: config.tile_floor_ic_per_sqft, cp: config.tile_floor_cp_per_sqft, unit: 'sqft' };
    }
    // Default to wall tile
    return { ic: config.tile_wall_ic_per_sqft, cp: config.tile_wall_cp_per_sqft, unit: 'sqft' };
  }

  // Waterproofing
  if (categoryLower.includes('waterproof') || categoryLower.includes('schluter')) {
    return { ic: config.waterproofing_ic_per_sqft, cp: config.waterproofing_cp_per_sqft, unit: 'sqft' };
  }

  // Cement Board
  if (categoryLower.includes('cement') || categoryLower.includes('backer')) {
    return { ic: config.cement_board_ic_per_sqft, cp: config.cement_board_cp_per_sqft, unit: 'sqft' };
  }

  // Electrical
  if (categoryLower.includes('electric')) {
    if (taskLower.includes('recessed') || taskLower.includes('can light')) {
      return { ic: config.recessed_can_ic_each, cp: config.recessed_can_cp_each, unit: 'ea' };
    } else if (taskLower.includes('vanity light')) {
      return { ic: config.electrical_vanity_light_ic, cp: config.electrical_vanity_light_cp, unit: 'ea' };
    } else if (taskLower.includes('kitchen package')) {
      return { ic: config.electrical_kitchen_package_ic, cp: config.electrical_kitchen_package_cp, unit: 'ea' };
    } else if (taskLower.includes('small package')) {
      return { ic: config.electrical_small_package_ic, cp: config.electrical_small_package_cp, unit: 'ea' };
    }
  }

  // Framing
  if (categoryLower.includes('fram')) {
    if (taskLower.includes('pony wall')) {
      return { ic: config.framing_pony_wall_ic, cp: config.framing_pony_wall_cp, unit: 'ea' };
    } else if (taskLower.includes('niche')) {
      return { ic: config.niche_ic_each, cp: config.niche_cp_each, unit: 'ea' };
    }
    return { ic: config.framing_standard_ic, cp: config.framing_standard_cp, unit: 'ea' };
  }

  // Glass
  if (categoryLower.includes('glass')) {
    if (taskLower.includes('90') || taskLower.includes('return')) {
      return { ic: config.glass_90_return_ic, cp: config.glass_90_return_cp, unit: 'ea' };
    } else if (taskLower.includes('panel only')) {
      return { ic: config.glass_panel_only_ic, cp: config.glass_panel_only_cp, unit: 'ea' };
    } else if (taskLower.includes('frameless') || taskLower.includes('per sqft')) {
      return { ic: config.frameless_glass_ic_per_sqft, cp: config.frameless_glass_cp_per_sqft, unit: 'sqft' };
    }
    return { ic: config.glass_shower_standard_ic, cp: config.glass_shower_standard_cp, unit: 'ea' };
  }

  // Paint
  if (categoryLower.includes('paint') || categoryLower.includes('drywall')) {
    if (taskLower.includes('full') || taskLower.includes('complete')) {
      return { ic: config.paint_full_bath_ic, cp: config.paint_full_bath_cp, unit: 'ea' };
    }
    return { ic: config.paint_patch_bath_ic, cp: config.paint_patch_bath_cp, unit: 'ea' };
  }

  // Vanity
  if (categoryLower.includes('vanity')) {
    if (taskLower.includes('30')) {
      return { ic: config.vanity_30_bundle_ic, cp: config.vanity_30_bundle_cp, unit: 'ea' };
    } else if (taskLower.includes('36')) {
      return { ic: config.vanity_36_bundle_ic, cp: config.vanity_36_bundle_cp, unit: 'ea' };
    } else if (taskLower.includes('48')) {
      return { ic: config.vanity_48_bundle_ic, cp: config.vanity_48_bundle_cp, unit: 'ea' };
    } else if (taskLower.includes('54')) {
      return { ic: config.vanity_54_bundle_ic, cp: config.vanity_54_bundle_cp, unit: 'ea' };
    } else if (taskLower.includes('60')) {
      return { ic: config.vanity_60_bundle_ic, cp: config.vanity_60_bundle_cp, unit: 'ea' };
    } else if (taskLower.includes('72')) {
      return { ic: config.vanity_72_bundle_ic, cp: config.vanity_72_bundle_cp, unit: 'ea' };
    } else if (taskLower.includes('84')) {
      return { ic: config.vanity_84_bundle_ic, cp: config.vanity_84_bundle_cp, unit: 'ea' };
    }
    // Default to 48" vanity
    return { ic: config.vanity_48_bundle_ic, cp: config.vanity_48_bundle_cp, unit: 'ea' };
  }

  // Quartz/Countertops - IC = material allowance + fabrication IC, CP calculated from margin
  if (categoryLower.includes('quartz') || categoryLower.includes('countertop')) {
    const materialIC = (config as any).quartz_material_allowance_ic ?? 25;
    const fabIC = config.quartz_ic_per_sqft ?? 15;
    const totalIC = materialIC + fabIC;
    const targetMargin = config.target_margin ?? 0.38;
    const calculatedCP = totalIC / (1 - targetMargin);
    return { ic: totalIC, cp: calculatedCP, unit: 'sqft' };
  }

  // Flooring (LVP)
  if (categoryLower.includes('lvp') || categoryLower.includes('vinyl') || categoryLower.includes('flooring')) {
    return { ic: config.lvp_ic_per_sqft, cp: config.lvp_cp_per_sqft, unit: 'sqft' };
  }

  // Floor Leveling
  if (categoryLower.includes('level') || categoryLower.includes('substrate')) {
    if (taskLower.includes('kitchen')) {
      return { ic: config.floor_leveling_kitchen_ic, cp: config.floor_leveling_kitchen_cp, unit: 'ea' };
    } else if (taskLower.includes('bath')) {
      return { ic: config.floor_leveling_bath_ic, cp: config.floor_leveling_bath_cp, unit: 'ea' };
    }
    return { ic: config.floor_leveling_small_ic, cp: config.floor_leveling_small_cp, unit: 'ea' };
  }

  return null;
}

export interface PricingOptions {
  useMarginMultiplier?: boolean;
  targetMarginPct?: number; // e.g., 38 for 38%
}

export function calculateProjectPricing(
  tradeBuckets: TradeBucket[],
  config: PricingConfig,
  options?: PricingOptions
): ProjectPricing {
  const lineItems: PricingResult[] = [];
  const warnings: string[] = [];
  
  const useMarginMode = options?.useMarginMultiplier ?? false;
  const targetMargin = (options?.targetMarginPct ?? 38) / 100; // Convert to decimal

  for (const bucket of tradeBuckets) {
    const mapping = mapCategoryToPricingField(bucket.category, bucket.task_description, config);

    if (!mapping || mapping.ic === null) {
      warnings.push(`No pricing found for: ${bucket.category} - ${bucket.task_description}`);
      continue;
    }

    const icPerUnit = mapping.ic;
    let cpPerUnit: number;
    
    if (useMarginMode) {
      // Calculate CP from IC using margin formula: CP = IC / (1 - margin)
      cpPerUnit = icPerUnit / (1 - targetMargin);
    } else {
      // Use the configured CP value
      cpPerUnit = mapping.cp ?? (icPerUnit / (1 - 0.38)); // Fallback to 38% if no CP
    }
    
    const icTotal = icPerUnit * bucket.quantity;
    const cpTotal = cpPerUnit * bucket.quantity;
    const marginPercent = cpTotal > 0 ? ((cpTotal - icTotal) / cpTotal) * 100 : 0;

    lineItems.push({
      category: bucket.category,
      task_description: bucket.task_description,
      quantity: bucket.quantity,
      unit: bucket.unit || mapping.unit,
      ic_per_unit: icPerUnit,
      cp_per_unit: cpPerUnit,
      ic_total: icTotal,
      cp_total: cpTotal,
      margin_percent: marginPercent,
    });
  }

  // Calculate totals
  const totalIc = lineItems.reduce((sum, item) => sum + item.ic_total, 0);
  const totalCp = lineItems.reduce((sum, item) => sum + item.cp_total, 0);
  const overallMarginPercent = totalCp > 0 ? ((totalCp - totalIc) / totalCp) * 100 : 0;

  // Apply minimum job pricing if needed
  const minJobIc = config.min_job_ic || 10500;
  const minJobCp = config.min_job_cp || 15000;

  let finalTotalIc = totalIc;
  let finalTotalCp = totalCp;
  let finalMarginPercent = overallMarginPercent;

  if (totalCp < minJobCp) {
    finalTotalCp = minJobCp;
    finalTotalIc = Math.max(totalIc, minJobIc);
    finalMarginPercent = finalTotalCp > 0 ? ((finalTotalCp - finalTotalIc) / finalTotalCp) * 100 : 0;
    warnings.push(`Applied minimum job pricing: $${minJobCp.toLocaleString()} (was $${totalCp.toLocaleString()})`);
  }

  return {
    line_items: lineItems,
    totals: {
      total_ic: finalTotalIc,
      total_cp: finalTotalCp,
      overall_margin_percent: finalMarginPercent,
    },
    warnings,
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

export function formatMargin(marginPercent: number): string {
  return `${marginPercent.toFixed(1)}%`;
}
