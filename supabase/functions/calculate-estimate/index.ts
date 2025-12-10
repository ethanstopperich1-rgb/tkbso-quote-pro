import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Zod schema for AI output validation
const EstimateSchema = z.object({
  project_header: z.object({
    client_name: z.string().nullable().optional(),
    project_type: z.enum(["Kitchen", "Bathroom", "Combination", "Other"]),
    overall_size_sqft: z.number().nullable().optional(),
    labor_only: z.boolean().default(false),
  }),
  dimensions: z.object({
    ceiling_height_ft: z.number().default(8),
    room_length_ft: z.number().nullable().optional(),
    room_width_ft: z.number().nullable().optional(),
    shower_length_ft: z.number().nullable().optional(),
    shower_width_ft: z.number().nullable().optional(),
    shower_floor_sqft: z.number().nullable().optional(),
    shower_wall_sqft: z.number().nullable().optional(),
    main_floor_sqft: z.number().nullable().optional(),
    countertop_sqft: z.number().nullable().optional(),
  }),
  trade_buckets: z.array(
    z.object({
      category: z.string(),
      task_description: z.string(),
      quantity: z.number(),
      unit: z.enum(["sqft", "ea", "lf"]),
    })
  ),
  allowances: z.array(
    z.object({
      item: z.string(),
      quantity: z.number(),
      notes: z.string().optional(),
    })
  ).optional().default([]),
  exclusions: z.array(z.string()).optional().default([]),
  warnings: z.array(z.string()).optional().default([]),
});

type EstimateData = z.infer<typeof EstimateSchema>;

interface PricingConfig {
  [key: string]: number | string | null;
}

interface PricingResult {
  category: string;
  task_description: string;
  quantity: number;
  unit: string;
  ic_per_unit: number;
  cp_per_unit: number;
  ic_total: number;
  cp_total: number;
  margin_percent: number;
}

// Map trade bucket categories to pricing_configs fields
function mapCategoryToPricing(
  category: string,
  taskDescription: string,
  config: PricingConfig,
  laborOnly: boolean = false,
  dimensions?: { shower_wall_sqft?: number | null; shower_floor_sqft?: number | null }
): { ic: number; cp: number; unit: string; flatRate?: boolean } | null {
  const categoryLower = category.toLowerCase();
  const taskLower = taskDescription.toLowerCase();

  // ============ DEMOLITION & HAUL ============
  
  if (categoryLower.includes('site protection') || categoryLower.includes('protection') || categoryLower.includes('setup')) {
    if (taskLower.includes('ramboard') || taskLower.includes('floor protection')) {
      return { ic: Number((config as any).floor_protection_ramboard_sqft_ic) || 0.5, cp: Number((config as any).floor_protection_ramboard_sqft_cp) || 1.0, unit: 'sqft' };
    } else if (taskLower.includes('dust') || taskLower.includes('zipwall') || taskLower.includes('barrier')) {
      return { ic: Number((config as any).dust_barrier_zipwall_ic) || 150, cp: Number((config as any).dust_barrier_zipwall_cp) || 300, unit: 'ea', flatRate: true };
    }
    return { ic: Number((config as any).dust_barrier_zipwall_ic) || 150, cp: Number((config as any).dust_barrier_zipwall_cp) || 300, unit: 'ea', flatRate: true };
  }

  if (categoryLower.includes('disposal') || categoryLower.includes('logistics') || categoryLower.includes('haul')) {
    if (taskLower.includes('dumpster')) {
      return { ic: Number((config as any).dumpster_20yd_ic) || 550, cp: Number((config as any).dumpster_20yd_cp) || 750, unit: 'ea', flatRate: true };
    }
    return { ic: Number((config as any).dumpster_20yd_ic) || 550, cp: Number((config as any).dumpster_20yd_cp) || 750, unit: 'ea', flatRate: true };
  }

  // Standard Demolition - FLAT RATE
  if (categoryLower.includes('demo')) {
    if (taskLower.includes('soffit')) {
      return { ic: Number((config as any).demo_soffit_lf_ic) || 15, cp: Number((config as any).demo_soffit_lf_cp) || 30, unit: 'lf' };
    } else if (taskLower.includes('shower') && taskLower.includes('only')) {
      return { ic: Number(config.demo_shower_only_ic) || 900, cp: Number(config.demo_shower_only_cp) || 1450, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('small') || taskLower.includes('standard bath')) {
      return { ic: Number(config.demo_small_bath_ic) || 600, cp: Number(config.demo_small_bath_cp) || 1200, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('large') || taskLower.includes('full bath') || taskLower.includes('master')) {
      return { ic: Number(config.demo_large_bath_ic) || 1650, cp: Number(config.demo_large_bath_cp) || 2500, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('kitchen')) {
      return { ic: Number(config.demo_kitchen_ic) || 800, cp: Number(config.demo_kitchen_cp) || 1500, unit: 'ea', flatRate: true };
    }
    return { ic: Number(config.demo_small_bath_ic) || 600, cp: Number(config.demo_small_bath_cp) || 1200, unit: 'ea', flatRate: true };
  }

  // ============ PLUMBING ============
  if (categoryLower.includes('plumb')) {
    if (taskLower.includes('kitchen') && (taskLower.includes('reconnect') || taskLower.includes('hook'))) {
      return { ic: 800, cp: 1400, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('reconnect') || taskLower.includes('hook up')) {
      return { ic: 800, cp: 1400, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('drain') && taskLower.includes('reloc')) {
      return { ic: 500, cp: 1200, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('toilet') && taskLower.includes('reloc')) {
      return { ic: 1100, cp: 2200, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('toilet')) {
      return { ic: Number(config.plumbing_toilet_ic) || 350, cp: Number(config.plumbing_toilet_cp) || 690, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('tub') && taskLower.includes('reloc')) {
      return { ic: 2800, cp: 4800, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('shower') && taskLower.includes('standard')) {
      return { ic: Number(config.plumbing_shower_standard_ic) || 2225, cp: Number(config.plumbing_shower_standard_cp) || 3425, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('extra head')) {
      return { ic: Number(config.plumbing_extra_head_ic) || 625, cp: Number(config.plumbing_extra_head_cp) || 1100, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('freestanding')) {
      return { ic: Number(config.plumbing_tub_freestanding_ic) || 3300, cp: Number(config.plumbing_tub_freestanding_cp) || 4800, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('tub to shower') || taskLower.includes('conversion')) {
      return { ic: Number(config.plumbing_tub_to_shower_ic) || 2550, cp: Number(config.plumbing_tub_to_shower_cp) || 4200, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('linear drain')) {
      return { ic: Number(config.plumbing_linear_drain_ic) || 750, cp: Number(config.plumbing_linear_drain_cp) || 1550, unit: 'ea', flatRate: true };
    }
    return { ic: Number(config.plumbing_shower_standard_ic) || 2225, cp: Number(config.plumbing_shower_standard_cp) || 3425, unit: 'ea', flatRate: true };
  }

  // ============ TILE ============
  if (categoryLower.includes('tile')) {
    const materialIc = Number((config as any).tile_material_allowance_ic) || 5;
    const laborIc = taskLower.includes('wall') ? Number(config.tile_wall_ic_per_sqft) || 20 : 
                   taskLower.includes('shower floor') ? Number(config.tile_shower_floor_ic_per_sqft) || 6 :
                   Number(config.tile_floor_ic_per_sqft) || 5.5;
    const totalIc = materialIc + laborIc;
    const targetMargin = Number(config.target_margin) || 0.38;
    const totalCp = totalIc / (1 - targetMargin);
    return { ic: totalIc, cp: totalCp, unit: 'sqft' };
  }

  // ============ WATERPROOFING ============
  if (categoryLower.includes('waterproof') || (categoryLower.includes('support') && taskLower.includes('waterproof'))) {
    const icPerSqft = Number(config.waterproofing_ic_per_sqft) || 6;
    const cpPerSqft = Number(config.waterproofing_cp_per_sqft) || 13;
    if (dimensions && (dimensions.shower_wall_sqft || dimensions.shower_floor_sqft)) {
      const totalShowerSqft = (dimensions.shower_wall_sqft || 0) + (dimensions.shower_floor_sqft || 0);
      if (totalShowerSqft > 0) {
        return { ic: icPerSqft * totalShowerSqft, cp: cpPerSqft * totalShowerSqft, unit: 'ea', flatRate: true };
      }
    }
    return { ic: icPerSqft, cp: cpPerSqft, unit: 'sqft' };
  }

  // ============ CEMENT BOARD ============
  if (categoryLower.includes('cement') || (categoryLower.includes('support') && taskLower.includes('cement'))) {
    return { ic: Number(config.cement_board_ic_per_sqft) || 3, cp: Number(config.cement_board_cp_per_sqft) || 5, unit: 'sqft' };
  }

  // ============ ELECTRICAL ============
  if (categoryLower.includes('electric')) {
    if (taskLower.includes('recessed') || taskLower.includes('can')) {
      return { ic: Number(config.recessed_can_ic_each) || 65, cp: Number(config.recessed_can_cp_each) || 110, unit: 'ea' };
    } else if (taskLower.includes('vanity light')) {
      return { ic: Number(config.electrical_vanity_light_ic) || 200, cp: Number(config.electrical_vanity_light_cp) || 350, unit: 'ea' };
    } else if (taskLower.includes('pendant')) {
      return { ic: 150, cp: 275, unit: 'ea' };
    } else if (taskLower.includes('under cabinet')) {
      return { ic: 350, cp: 600, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('kitchen')) {
      return { ic: Number(config.electrical_kitchen_package_ic) || 950, cp: Number(config.electrical_kitchen_package_cp) || 1750, unit: 'ea' };
    }
    return { ic: Number(config.electrical_small_package_ic) || 250, cp: Number(config.electrical_small_package_cp) || 400, unit: 'ea' };
  }

  // ============ FRAMING / STRUCTURAL ============
  if (categoryLower.includes('fram') || categoryLower.includes('structural')) {
    if (taskLower.includes('niche')) {
      return { ic: Number(config.niche_ic_each) || 300, cp: Number(config.niche_cp_each) || 550, unit: 'ea' };
    } else if (taskLower.includes('pony wall')) {
      return { ic: Number(config.framing_pony_wall_ic) || 450, cp: Number(config.framing_pony_wall_cp) || 850, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('wall remov')) {
      return { ic: 1500, cp: 2800, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('new wall')) {
      return { ic: 35, cp: 65, unit: 'lf' };
    } else if (taskLower.includes('pocket door')) {
      return { ic: 650, cp: 1200, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('door') && taskLower.includes('reloc')) {
      return { ic: 1200, cp: 2200, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('door') && taskLower.includes('clos')) {
      return { ic: 600, cp: 1100, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('entrance') && taskLower.includes('enlarg')) {
      return { ic: 900, cp: 1700, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('shower') && taskLower.includes('enlarg')) {
      return { ic: 1800, cp: 3200, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('bench')) {
      return { ic: 400, cp: 750, unit: 'ea' };
    }
    return { ic: Number(config.framing_standard_ic) || 550, cp: Number(config.framing_standard_cp) || 1200, unit: 'ea', flatRate: true };
  }

  // ============ GLASS ============
  if (categoryLower.includes('glass')) {
    if (taskLower.includes('90') || taskLower.includes('return') || taskLower.includes('corner')) {
      return { ic: Number(config.glass_90_return_ic) || 1425, cp: Number(config.glass_90_return_cp) || 2775, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('panel only') || taskLower.includes('fixed')) {
      return { ic: Number(config.glass_panel_only_ic) || 800, cp: Number(config.glass_panel_only_cp) || 1375, unit: 'ea', flatRate: true };
    }
    return { ic: Number(config.glass_shower_standard_ic) || 1200, cp: Number(config.glass_shower_standard_cp) || 2050, unit: 'ea', flatRate: true };
  }

  // ============ VANITY ============
  if (categoryLower.includes('vanit') && !taskLower.includes('light')) {
    if (taskLower.includes('72') || taskLower.includes('84')) {
      return { ic: Number(config.vanity_72_bundle_ic) || 2400, cp: Number(config.vanity_72_bundle_cp) || 3850, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('60')) {
      return { ic: Number(config.vanity_60_bundle_ic) || 2200, cp: Number(config.vanity_60_bundle_cp) || 3500, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('48')) {
      return { ic: Number(config.vanity_48_bundle_ic) || 1600, cp: Number(config.vanity_48_bundle_cp) || 2600, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('36')) {
      return { ic: Number(config.vanity_36_bundle_ic) || 1300, cp: Number(config.vanity_36_bundle_cp) || 2200, unit: 'ea', flatRate: true };
    }
    return { ic: Number(config.vanity_48_bundle_ic) || 1600, cp: Number(config.vanity_48_bundle_cp) || 2600, unit: 'ea', flatRate: true };
  }

  // ============ CABINETS ============
  if (categoryLower.includes('cabinet') || categoryLower.includes('cabinetry')) {
    const materialIc = Number((config as any).cabinet_material_allowance_ic) || 150;
    const laborIc = Number(config.cabinet_install_only_lf_ic) || 50;
    const totalIc = materialIc + laborIc;
    const targetMargin = Number(config.target_margin) || 0.38;
    const totalCp = totalIc / (1 - targetMargin);
    return { ic: totalIc, cp: totalCp, unit: 'lf' };
  }

  // ============ COUNTERTOPS / QUARTZ ============
  if (categoryLower.includes('quartz') || categoryLower.includes('countertop') || categoryLower.includes('counter')) {
    const materialIc = Number((config as any).quartz_material_allowance_ic) || 25;
    const fabIc = Number(config.quartz_ic_per_sqft) || 15;
    const totalIc = materialIc + fabIc;
    const targetMargin = Number(config.target_margin) || 0.38;
    const totalCp = totalIc / (1 - targetMargin);
    return { ic: totalIc, cp: totalCp, unit: 'sqft' };
  }

  // ============ BACKSPLASH ============
  if (categoryLower.includes('backsplash')) {
    return { ic: Number(config.tile_backsplash_ic) || 12, cp: Number(config.tile_backsplash_cp) || 25, unit: 'sqft' };
  }

  // ============ FLOORING ============
  if (categoryLower.includes('floor') && !categoryLower.includes('tile')) {
    if (taskLower.includes('lvp') || taskLower.includes('vinyl') || taskLower.includes('laminate')) {
      return { ic: Number(config.lvp_ic_per_sqft) || 2.5, cp: Number(config.lvp_cp_per_sqft) || 6, unit: 'sqft' };
    }
    return { ic: Number(config.tile_floor_ic_per_sqft) || 5.5, cp: Number(config.tile_floor_cp_per_sqft) || 12, unit: 'sqft' };
  }

  // ============ PAINT ============
  if (categoryLower.includes('paint')) {
    if (taskLower.includes('full') || taskLower.includes('complete')) {
      return { ic: Number(config.paint_full_bath_ic) || 1200, cp: Number(config.paint_full_bath_cp) || 1900, unit: 'ea', flatRate: true };
    }
    return { ic: Number(config.paint_patch_bath_ic) || 800, cp: Number(config.paint_patch_bath_cp) || 1300, unit: 'ea', flatRate: true };
  }

  // ============ MATERIALS ============
  if (categoryLower.includes('material')) {
    if (taskLower.includes('tile')) {
      return { ic: Number((config as any).tile_material_allowance_ic) || 5, cp: Number(config.tile_material_allowance_cp_per_sqft) || 8, unit: 'sqft' };
    } else if (taskLower.includes('plumbing') || taskLower.includes('fixture')) {
      return { ic: 700, cp: Number(config.plumbing_fixture_allowance_cp) || 1400, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('floor')) {
      return { ic: 3, cp: 5, unit: 'sqft' };
    }
    return { ic: 500, cp: 1000, unit: 'ea', flatRate: true };
  }

  // ============ DRYWALL ============
  if (categoryLower.includes('drywall')) {
    if (taskLower.includes('patch')) {
      return { ic: 200, cp: 400, unit: 'ea' };
    }
    return { ic: 10, cp: 18, unit: 'sqft' };
  }

  // ============ ACCESSORIES ============
  if (categoryLower.includes('accessor') || categoryLower.includes('mirror')) {
    if (taskLower.includes('mirror')) {
      return { ic: 200, cp: Number(config.mirror_allowance_cp) || 450, unit: 'ea' };
    }
    return { ic: 150, cp: 300, unit: 'ea' };
  }

  return null;
}

interface PricingModeOptions {
  useMarginMultiplier: boolean;
  targetMarginPct: number;
}

function calculatePricing(
  tradeBuckets: EstimateData["trade_buckets"],
  config: PricingConfig,
  pricingMode: PricingModeOptions,
  laborOnly: boolean = false,
  dimensions?: { shower_wall_sqft?: number | null; shower_floor_sqft?: number | null }
): { line_items: PricingResult[]; totals: { total_ic: number; total_cp: number; low_estimate: number; high_estimate: number; overall_margin_percent: number }; warnings: string[] } {
  const lineItems: PricingResult[] = [];
  const warnings: string[] = [];
  
  const useMarginMode = pricingMode.useMarginMultiplier;
  const targetMargin = pricingMode.targetMarginPct / 100;

  for (const bucket of tradeBuckets) {
    const mapping = mapCategoryToPricing(bucket.category, bucket.task_description, config, laborOnly, dimensions);

    if (!mapping) {
      warnings.push(`No pricing found for: ${bucket.category} - ${bucket.task_description}`);
      continue;
    }

    const effectiveQuantity = mapping.flatRate ? 1 : bucket.quantity;
    const icPerUnit = mapping.ic;
    let cpPerUnit: number;
    
    if (useMarginMode) {
      cpPerUnit = icPerUnit / (1 - targetMargin);
    } else {
      cpPerUnit = mapping.cp;
    }
    
    const icTotal = icPerUnit * effectiveQuantity;
    const cpTotal = cpPerUnit * effectiveQuantity;
    const marginPercent = cpTotal > 0 ? ((cpTotal - icTotal) / cpTotal) * 100 : 0;

    lineItems.push({
      category: bucket.category,
      task_description: bucket.task_description,
      quantity: effectiveQuantity,
      unit: bucket.unit || mapping.unit,
      ic_per_unit: icPerUnit,
      cp_per_unit: cpPerUnit,
      ic_total: icTotal,
      cp_total: cpTotal,
      margin_percent: marginPercent,
    });
  }

  const totalIc = lineItems.reduce((sum, item) => sum + item.ic_total, 0);
  const totalCp = lineItems.reduce((sum, item) => sum + item.cp_total, 0);

  const minJobCp = Number(config.min_job_cp) || 15000;
  const minJobIc = Number(config.min_job_ic) || 10500;

  let finalTotalCp = totalCp;
  let finalTotalIc = totalIc;

  if (totalCp < minJobCp) {
    finalTotalCp = minJobCp;
    finalTotalIc = Math.max(totalIc, minJobIc);
    warnings.push(`Applied minimum job pricing: $${minJobCp.toLocaleString()}`);
  }

  const lowMultiplier = Number(config.low_range_multiplier) || 0.95;
  const highMultiplier = Number(config.high_range_multiplier) || 1.05;

  return {
    line_items: lineItems,
    totals: {
      total_ic: finalTotalIc,
      total_cp: finalTotalCp,
      low_estimate: Math.round(finalTotalCp * lowMultiplier),
      high_estimate: Math.round(finalTotalCp * highMultiplier),
      overall_margin_percent: finalTotalCp > 0 ? ((finalTotalCp - finalTotalIc) / finalTotalCp) * 100 : 0,
    },
    warnings,
  };
}

function applyManagementFee(
  pricing: ReturnType<typeof calculatePricing>,
  includeManagementFee: boolean,
  managementFeePercent: number
) {
  if (!includeManagementFee || managementFeePercent <= 0) {
    return { ...pricing, management_fee: { ic: 0, cp: 0, percent: 0 } };
  }

  const feeIc = Math.round(pricing.totals.total_ic * managementFeePercent);
  const feeCp = Math.round(pricing.totals.total_cp * managementFeePercent);
  
  const newTotalIc = pricing.totals.total_ic + feeIc;
  const newTotalCp = pricing.totals.total_cp + feeCp;

  return {
    ...pricing,
    totals: {
      ...pricing.totals,
      total_ic: newTotalIc,
      total_cp: newTotalCp,
      low_estimate: Math.round(newTotalCp * 0.95),
      high_estimate: Math.round(newTotalCp * 1.05),
      overall_margin_percent: newTotalCp > 0 ? ((newTotalCp - newTotalIc) / newTotalCp) * 100 : 0,
    },
    management_fee: { ic: feeIc, cp: feeCp, percent: managementFeePercent * 100 },
    warnings: [...pricing.warnings, `Management fee (${(managementFeePercent * 100).toFixed(0)}%) applied: $${feeCp.toLocaleString()}`]
  };
}

// JSON Schema for estimate generation
const estimateJsonSchema = {
  type: "object",
  properties: {
    project_header: {
      type: "object",
      properties: {
        client_name: { type: ["string", "null"] },
        project_type: { type: "string", enum: ["Kitchen", "Bathroom", "Combination", "Other"] },
        overall_size_sqft: { type: ["number", "null"] },
        labor_only: { type: "boolean" }
      },
      required: ["project_type"]
    },
    dimensions: {
      type: "object",
      properties: {
        ceiling_height_ft: { type: "number" },
        room_length_ft: { type: ["number", "null"] },
        room_width_ft: { type: ["number", "null"] },
        shower_length_ft: { type: ["number", "null"] },
        shower_width_ft: { type: ["number", "null"] },
        shower_floor_sqft: { type: ["number", "null"] },
        shower_wall_sqft: { type: ["number", "null"] },
        main_floor_sqft: { type: ["number", "null"] },
        countertop_sqft: { type: ["number", "null"] }
      },
      required: ["ceiling_height_ft"]
    },
    trade_buckets: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          task_description: { type: "string" },
          quantity: { type: "number" },
          unit: { type: "string", enum: ["sqft", "ea", "lf"] }
        },
        required: ["category", "task_description", "quantity", "unit"]
      }
    },
    allowances: { type: "array", items: { type: "object", properties: { item: { type: "string" }, quantity: { type: "number" }, notes: { type: "string" } }, required: ["item", "quantity"] } },
    exclusions: { type: "array", items: { type: "string" } },
    warnings: { type: "array", items: { type: "string" } }
  },
  required: ["project_header", "dimensions", "trade_buckets"]
};

// Guided interview analysis schema
const analysisJsonSchema = {
  type: "object",
  properties: {
    action: { 
      type: "string", 
      enum: ["ask_question", "generate_estimate"],
      description: "Whether to ask a follow-up question or generate the estimate"
    },
    conversation_phase: {
      type: "string",
      enum: ["project_type", "initial_scope", "trade_confirmation", "dimensions", "client_details", "ready_to_generate"],
      description: "Current phase of the guided interview"
    },
    current_trade: {
      type: ["string", "null"],
      enum: ["demo", "plumbing", "electrical", "tile", "cabinets", "countertops", "glass", "vanity", "paint", "flooring", "backsplash", "accessories", "structural", null],
      description: "Which trade we are currently asking about"
    },
    project_type: { 
      type: ["string", "null"], 
      enum: ["Kitchen", "Bathroom", "Combination", null]
    },
    has_enough_info: { 
      type: "boolean",
      description: "True ONLY if ALL required info is captured and confirmed"
    },
    follow_up_question: {
      type: ["string", "null"],
      description: "The targeted question to ask next"
    },
    items_captured: {
      type: "array",
      items: {
        type: "object",
        properties: {
          trade: { type: "string" },
          item: { type: "string" },
          quantity: { type: ["number", "null"] },
          unit: { type: ["string", "null"] },
          confirmed: { type: "boolean" },
          needs_clarification: { type: ["string", "null"] }
        },
        required: ["trade", "item", "confirmed"]
      },
      description: "Running list of ALL items captured from conversation"
    },
    exclusions: {
      type: "array",
      items: { type: "string" },
      description: "Items explicitly EXCLUDED (keep existing, no demo, etc.)"
    },
    trades_confirmed: {
      type: "object",
      description: "Track which trades have been discussed and confirmed",
      properties: {
        demo: { type: "boolean" },
        plumbing: { type: "boolean" },
        electrical: { type: "boolean" },
        tile: { type: "boolean" },
        cabinets: { type: "boolean" },
        countertops: { type: "boolean" },
        glass: { type: "boolean" },
        vanity: { type: "boolean" },
        paint: { type: "boolean" },
        flooring: { type: "boolean" },
        backsplash: { type: "boolean" },
        appliances: { type: "boolean" },
        accessories: { type: "boolean" },
        structural: { type: "boolean" }
      }
    },
    parsed_dimensions: {
      type: "object",
      properties: {
        room_sqft: { type: ["number", "null"] },
        room_length: { type: ["number", "null"] },
        room_width: { type: ["number", "null"] },
        shower_length: { type: ["number", "null"] },
        shower_width: { type: ["number", "null"] },
        countertop_sqft: { type: ["number", "null"] },
        cabinet_lf: { type: ["number", "null"] },
        backsplash_sqft: { type: ["number", "null"] }
      }
    },
    parsed_client_details: {
      type: "object",
      properties: {
        client_name: { type: ["string", "null"] },
        client_phone: { type: ["string", "null"] },
        client_email: { type: ["string", "null"] },
        property_address: { type: ["string", "null"] },
        city: { type: ["string", "null"] },
        state: { type: ["string", "null"] },
        zip: { type: ["string", "null"] }
      }
    },
    client_details_skipped: { type: "boolean" },
    labor_only: { type: "boolean" },
    ready_for_summary: { type: "boolean", description: "True when all trades discussed and ready to show summary" }
  },
  required: ["action", "conversation_phase", "has_enough_info", "items_captured", "exclusions", "trades_confirmed"]
};

// GUIDED INTERVIEW SYSTEM PROMPT
const guidedInterviewPrompt = `You are an expert estimator conducting a GUIDED INTERVIEW. Your job is to ASK QUESTIONS, not guess.

## CORE PHILOSOPHY
- NEVER guess quantities, materials, or details - ALWAYS ASK
- Ask about ONE trade at a time
- Confirm understanding before moving to next trade
- Keep a running list of "Items Captured" 
- Show the user what you've captured so they can track progress

## KEYWORD → QUESTION MAPPING (CRITICAL)

When user says these keywords, you MUST ask the follow-up question:

**PLUMBING:**
- "reconnect" / "hookup" → "Is this reconnect for KITCHEN (sink/dishwasher) or BATHROOM (vanity/shower/tub)?"
- "relocate sink" → "How far from current location (in feet)?"
- "move toilet" → "How far from existing location?"
- "pot filler" → "Above the stove location?"

**ELECTRICAL:**
- "lights" / "recessed" → "How many lights total?"
- "pendant" → "How many pendant lights?"
- "under cabinet" → "LED strip or puck lights? Approximately how many linear feet?"
- "outlet" → "How many outlets? New location or upgrade existing?"

**CABINETRY:**
- "cabinets" / "new cabinets" → "Do you know the linear footage or number of boxes?"
- "two-tone" → "Which cabinets are Color A vs Color B?"

**TILE:**
- "tile" → "What size tile? (12x24, subway 3x6, large format, etc.)"
- "backsplash" → "Full wall height or standard 4-inch? Approximately how many sqft?"

**FLOORING:**
- "flooring" / "new floor" → "What material? (LVP, tile, hardwood?)"
- "LVP" → "What's the total sqft? Does it need subfloor prep?"

**DEMO:**
- "demo" / "gut" → "Full demo (everything to studs) or selective demo (specific items)?"
- "full demo" but kitchen → "Does full demo include: cabinets, countertops, appliances, backsplash, flooring? Which of these are you KEEPING?"

**STRUCTURAL:**
- "wall removal" → "Is it load-bearing? Will it need an engineer/beam?"
- "door" → "New door, relocate existing, or close up doorway?"

## EXCLUSION DETECTION (CRITICAL - PREVENTS BUGS!)

Watch for these patterns - they mean EXCLUDE that item:
- "keep appliances" / "keep existing appliances" → ADD "appliances" to exclusions
- "keep cabinets" / "keep existing cabinets" → ADD "cabinets" to exclusions  
- "keep flooring" / "existing floor" / "no flooring" → ADD "flooring" to exclusions
- "keep countertops" / "existing counters" → ADD "countertops" to exclusions
- "leave the [item]" / "[item] stays" → ADD that item to exclusions

When you detect exclusion language:
1. IMMEDIATELY add to exclusions array
2. CONFIRM: "Got it - keeping existing [item], won't include that in scope."
3. NEVER add excluded items to estimate later!

## DUPLICATE PREVENTION

Before adding ANY item, check items_captured for similar items:
- "plumbing reconnect" + later "hook up the sink" = SAME THING, don't add twice
- If duplicate detected, say: "I already have '[existing item]' which covers that. Did you mean something different?"

## CONVERSATION PHASES

**Phase 1: PROJECT TYPE & SIZE**
Ask: "What type of project - kitchen or bathroom?"
Then: "What are the approximate dimensions (length x width)?"
Confirm: "Got it - [type] remodel, [L]x[W] ([sqft] sqft). Full remodel or partial?"

**Phase 2: TRADE-BY-TRADE QUESTIONING**

FOR KITCHENS, ask in this order:
1. DEMO: "Let's start with demo. Full gut, or are we keeping anything? (cabinets, flooring, appliances?)"
2. CABINETS: "New cabinets? If so, do you know linear feet or box count?"
3. COUNTERTOPS: "New countertops? What material - quartz, granite, laminate?"
4. BACKSPLASH: "New backsplash? Full height or 4-inch? Approx sqft?"
5. FLOORING: "New flooring or keeping existing?"
6. APPLIANCES: "Are we disconnecting/reconnecting appliances, or keeping in place?"
7. PLUMBING: "Any plumbing work - new sink location, faucet, dishwasher hookup?"
8. ELECTRICAL: "Any electrical - outlets, under-cabinet lighting, pendants?"

FOR BATHROOMS, ask in this order:
1. DEMO: "What are we demoing? Full gut, shower only, or selective? What size bath (small/large/master)?"
2. PLUMBING: "Plumbing scope - new shower rough-in, toilet swap, tub-to-shower conversion? Any relocations?"
3. TILE: "Wall tile - how many sqft and what height? Shower floor sqft? Main floor sqft?"
4. ELECTRICAL: "How many recessed cans? Vanity lights? Exhaust fan?"
5. VANITY: "What size vanity? Single or double sink?"
6. COUNTERTOPS: "Vanity top - quartz included in bundle or separate slab?"
7. GLASS: "Shower enclosure - frameless door+panel, panel only, or shower curtain?"
8. PAINT: "Full room paint or patch only?"
9. ACCESSORIES: "Mirrors, towel bars, TP holder included?"

**Phase 3: CONFIRMATION SUMMARY**

Before generating, show this summary:
"Let me confirm what I've captured:

📦 **PROJECT:** [Type] Remodel ([L]x[W], [sqft] sqft)

**INCLUDED:**
✓ DEMO: [scope]
✓ PLUMBING: [scope]  
✓ TILE: [sqft] wall, [sqft] shower floor
✓ ELECTRICAL: [count] recessed, [count] vanity lights
✓ VANITY: [size]
✓ GLASS: [type]
✓ PAINT: [scope]

**NOT INCLUDED / KEEPING EXISTING:**
🚫 [list exclusions]

**DIMENSIONS USED:**
- Room: [L]x[W] = [sqft] sqft
- Shower: [L]x[W] = [sqft] sqft

Does this look right? [Everything looks good] [I need to add something] [Change a detail]"

**Phase 4: CLIENT DETAILS**
"Great! Before I generate the final quote, who is this for?"
- Client name
- Phone
- Email  
- Property address

## DECISION RULES

Set action = "generate_estimate" ONLY when:
- Project type is confirmed
- ALL relevant trades have been discussed (trades_confirmed shows which)
- Quantities are confirmed (not guessed!)
- Dimensions are captured
- Exclusions are identified
- User approved the summary OR client details collected

Set action = "ask_question" when:
- Any trade needs clarification
- Missing quantities (NEVER guess!)
- Missing dimensions
- Need to confirm exclusions
- Haven't shown summary yet

## RESPONSE FORMAT

Keep responses SHORT and FOCUSED:
- Ask ONE question at a time
- Acknowledge what you captured
- Show running progress periodically

GOOD: "Got it - full gut kitchen, keeping existing flooring and appliances. ✓

Moving to cabinets - are we doing new cabinets? If so, do you know the linear footage?"

BAD: Long paragraphs with multiple questions`;

// Estimate generation system prompt
const estimateGenerationPrompt = `You are a construction estimator. Convert the CONFIRMED scope into a structured estimate.

## MEASUREMENT RULES
- Room floor sqft = length × width
- Shower floor sqft = shower_length × shower_width  
- Shower wall sqft = 2 × (shower_length + shower_width) × ceiling_height
- Default ceiling height: 8ft
- Kitchen cabinets: estimate LF from kitchen size (small <120sqft: 15-18 LF, medium 120-200sqft: 20-25 LF, large 200+sqft: 28-35 LF)

## CRITICAL: RESPECT EXCLUSIONS
Items in the exclusions array must NOT appear in trade_buckets.
- If "appliances" in exclusions → NO appliance demo, NO appliance reconnect
- If "flooring" in exclusions → NO flooring work
- If "cabinets" in exclusions → NO cabinet work

## TRADE BUCKET CATEGORIES

**Demo:** "Demo - Shower Only", "Demo - Small Bathroom", "Demo - Large Bathroom", "Demo - Kitchen"
**Plumbing:** "Plumbing - Shower Standard", "Plumbing - Kitchen Reconnect", "Plumbing - Toilet", "Plumbing - Extra Head"
**Tile:** "Tile - Wall" (sqft), "Tile - Shower Floor" (sqft), "Tile - Main Floor" (sqft)
**Waterproofing:** "Waterproofing" (ea, lump sum)
**Electrical:** "Electrical - Recessed Can" (ea), "Electrical - Vanity Light" (ea), "Electrical - Kitchen Package" (ea)
**Glass:** "Glass - Shower Standard", "Glass - Panel Only", "Glass - 90 Return" (ea)
**Vanity:** "Vanity - 30in" through "Vanity - 84in" (ea)
**Cabinets:** "Cabinets - Kitchen" (lf)
**Countertops:** "Quartz - Countertop" (sqft)
**Backsplash:** "Backsplash - Tile" (sqft)
**Flooring:** "Flooring - LVP" (sqft)
**Paint:** "Paint - Patch", "Paint - Full Bath" (ea)
**Framing:** "Framing - Standard", "Framing - Niche" (ea)

## BUNDLES (already include materials - DO NOT add separate material lines)
- Glass bundles include glass
- Vanity bundles include cabinet + top
- Cabinet pricing includes materials + labor
- Countertop pricing includes slab + fab + install
- Paint includes paint/primer
- Electrical includes fixtures

## MATERIALS NEEDED SEPARATELY
- "Materials - Tile" (sqft) - when tile is in scope
- "Materials - Plumbing" (ea) - plumbing fixtures allowance
- "Materials - Flooring" (sqft) - for LVP/flooring material`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, contractor_id, conversation_history, conversation_state } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("Fetching pricing config for contractor:", contractor_id);
    const { data: pricingConfig, error: configError } = await supabase
      .from('pricing_configs')
      .select('*')
      .eq('contractor_id', contractor_id)
      .single();

    if (configError) {
      console.error("Error fetching pricing config:", configError);
      throw new Error("Failed to fetch pricing configuration");
    }

    const targetMarginDecimal = Number(pricingConfig.target_margin) || 0.38;
    const pricingModeSettings: PricingModeOptions = {
      useMarginMultiplier: true,
      targetMarginPct: targetMarginDecimal * 100,
    };
    console.log("Using target margin:", targetMarginDecimal * 100, "%");

    // Build conversation messages
    const conversationMessages = [];
    if (conversation_history && Array.isArray(conversation_history)) {
      for (const msg of conversation_history) {
        conversationMessages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      }
    }
    conversationMessages.push({ role: 'user', content: message });

    // Build context with conversation state
    const fullContext = {
      ...context,
      conversation_phase: conversation_state?.phase || 'project_type',
      project_type: conversation_state?.projectType,
      items_captured: conversation_state?.itemsCaptured || [],
      exclusions: conversation_state?.exclusions || [],
      trades_confirmed: conversation_state?.tradesConfirmed || {},
      dimensions: conversation_state?.dimensions || {},
    };

    console.log("Analyzing conversation with guided interview...");
    
    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: guidedInterviewPrompt + `\n\nCURRENT STATE:\n${JSON.stringify(fullContext, null, 2)}` },
          ...conversationMessages
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_conversation",
            description: "Analyze conversation to determine next question or if ready to generate",
            parameters: analysisJsonSchema
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_conversation" } }
      }),
    });

    if (!analysisResponse.ok) {
      const status = analysisResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI quota exceeded" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (status === 503) {
        return new Response(JSON.stringify({
          needsMoreInfo: true,
          followUpQuestion: "I'm experiencing a brief hiccup. Please try again in a moment."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error(`AI error: ${status}`);
    }

    const analysisData = await analysisResponse.json();
    const analysisToolCall = analysisData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!analysisToolCall) {
      throw new Error("No analysis tool call in AI response");
    }

    const analysis = JSON.parse(analysisToolCall.function.arguments);
    console.log("Analysis result:", JSON.stringify(analysis, null, 2));

    // Return follow-up question if not ready to generate
    if (analysis.action === "ask_question" || !analysis.has_enough_info) {
      return new Response(JSON.stringify({
        needsMoreInfo: true,
        followUpQuestion: analysis.follow_up_question || "Could you tell me more about the project?",
        parsed: {
          project_type: analysis.project_type,
          items_captured: analysis.items_captured,
          exclusions: analysis.exclusions,
          trades_confirmed: analysis.trades_confirmed,
          dimensions: analysis.parsed_dimensions,
          conversation_phase: analysis.conversation_phase,
          current_trade: analysis.current_trade
        },
        conversation_state: {
          phase: analysis.conversation_phase,
          projectType: analysis.project_type,
          itemsCaptured: analysis.items_captured,
          exclusions: analysis.exclusions,
          tradesConfirmed: analysis.trades_confirmed,
          dimensions: analysis.parsed_dimensions
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate estimate
    console.log("Generating estimate from confirmed scope...");
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: estimateGenerationPrompt },
          ...conversationMessages,
          { 
            role: "user", 
            content: `Generate structured estimate from this CONFIRMED scope:

PROJECT TYPE: ${analysis.project_type}
LABOR ONLY: ${analysis.labor_only || false}

ITEMS CAPTURED:
${JSON.stringify(analysis.items_captured, null, 2)}

EXCLUSIONS (DO NOT INCLUDE THESE):
${JSON.stringify(analysis.exclusions)}

DIMENSIONS:
${JSON.stringify(analysis.parsed_dimensions, null, 2)}

Generate the trade_buckets array. Remember: items in exclusions must NOT appear in trade_buckets.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_estimate",
            description: "Generate structured construction estimate",
            parameters: estimateJsonSchema
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_estimate" } }
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 503) {
        return new Response(JSON.stringify({
          needsMoreInfo: true,
          followUpQuestion: "I'm having trouble generating the estimate. Please try again."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error(`AI error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const estimateData = JSON.parse(toolCall.function.arguments) as EstimateData;
    
    // Validate with Zod
    const validated = EstimateSchema.safeParse(estimateData);
    if (!validated.success) {
      console.error("Validation failed:", validated.error.issues);
      return new Response(JSON.stringify({
        error: "Invalid estimate data",
        needsMoreInfo: true,
        followUpQuestion: "I had trouble generating the estimate. Could you confirm the dimensions again?"
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("Estimate validated, calculating pricing...");
    
    // Calculate pricing
    const laborOnly = validated.data.project_header.labor_only;
    const dimensions = {
      shower_wall_sqft: validated.data.dimensions.shower_wall_sqft,
      shower_floor_sqft: validated.data.dimensions.shower_floor_sqft,
    };
    
    let pricing = calculatePricing(
      validated.data.trade_buckets,
      pricingConfig,
      pricingModeSettings,
      laborOnly,
      dimensions
    );

    // Apply management fee if needed
    const includeManagementFee = context?.includeManagementFee || false;
    const managementFeePercent = Number(pricingConfig.management_fee_percent) || 0.1;
    
    if (includeManagementFee) {
      pricing = applyManagementFee(pricing, true, managementFeePercent);
    }

    // Build response
    const response = {
      estimate: validated.data,
      pricing: {
        line_items: pricing.line_items,
        ...pricing.totals,
        management_fee: (pricing as any).management_fee || { ic: 0, cp: 0, percent: 0 },
      },
      exclusions: analysis.exclusions || [],
      items_captured: analysis.items_captured || [],
      client_details: analysis.parsed_client_details || null,
      warnings: [...(validated.data.warnings || []), ...pricing.warnings],
      conversation_state: {
        phase: 'complete',
        projectType: analysis.project_type,
        itemsCaptured: analysis.items_captured,
        exclusions: analysis.exclusions,
        tradesConfirmed: analysis.trades_confirmed,
        dimensions: analysis.parsed_dimensions
      }
    };

    console.log("Estimate complete:", {
      total_ic: pricing.totals.total_ic,
      total_cp: pricing.totals.total_cp,
      exclusions: analysis.exclusions,
      line_items_count: pricing.line_items.length
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in calculate-estimate:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ 
      error: errorMessage,
      needsMoreInfo: true,
      followUpQuestion: "I encountered an error. Please try rephrasing your request."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
