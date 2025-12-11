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

// Guided interview analysis schema - now supports open scope description
const analysisJsonSchema = {
  type: "object",
  properties: {
    action: { 
      type: "string", 
      enum: ["ask_question", "generate_estimate"],
      description: "Whether to ask clarifying questions or generate the estimate"
    },
    conversation_phase: {
      type: "string",
      enum: ["project_type", "scope_description", "clarifications", "client_details", "ready_to_generate"],
      description: "Current phase: project_type -> scope_description -> clarifications -> ready_to_generate"
    },
    project_type: { 
      type: ["string", "null"], 
      enum: ["Kitchen", "Bathroom", "Combination", null]
    },
    has_enough_info: { 
      type: "boolean",
      description: "True when scope is clear and clarifications answered (or defaults accepted)"
    },
    follow_up_question: {
      type: ["string", "null"],
      description: "Response to show user - either asking for scope, showing summary with clarifications, or confirmation"
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
          confirmed: { type: "boolean" }
        },
        required: ["trade", "item", "confirmed"]
      },
      description: "All items parsed from user's scope description"
    },
    exclusions: {
      type: "array",
      items: { type: "string" },
      description: "Items explicitly EXCLUDED (keep existing, no demo, etc.)"
    },
    clarifying_questions: {
      type: "array",
      items: { type: "string" },
      description: "2-5 clarifying questions for missing critical details ONLY"
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
        cabinet_boxes: { type: ["number", "null"] },
        backsplash_sqft: { type: ["number", "null"] },
        led_lf: { type: ["number", "null"] }
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
    defaults_offered: {
      type: "object",
      description: "Default values offered for items user doesn't know",
      properties: {
        cabinet_lf: { type: ["number", "null"] },
        led_lf: { type: ["number", "null"] },
        backsplash_sqft: { type: ["number", "null"] }
      }
    }
  },
  required: ["action", "conversation_phase", "has_enough_info", "items_captured", "exclusions"]
};

// OPEN SCOPE DESCRIPTION SYSTEM PROMPT
const guidedInterviewPrompt = `You are a conversational estimator. Let contractors describe their project naturally, then ask ONLY critical clarifying questions.

## CONVERSATION FLOW (3 Simple Steps)

**STEP 1: PROJECT TYPE**
First message: "Hey! What are we estimating today - Kitchen or Bathroom?"
Wait for response.

**STEP 2: OPEN SCOPE DESCRIPTION**  
After they say kitchen/bathroom:

**If user said KITCHEN:**
"Perfect! Describe the scope of work - just tell me everything you're doing and I'll ask follow-up questions if needed."

**If user said BATHROOM:**
"Perfect! Describe the scope of work - just tell me everything you're doing and I'll ask follow-up questions if needed."

Let them describe EVERYTHING in one message. DO NOT interrupt with questions.

**STEP 3: SUMMARY + CLARIFICATIONS**
After they describe scope, show what you captured and ask ONLY 2-5 clarifying questions:

For KITCHEN:
"Got it! Here's what I captured:

✓ Kitchen (10×11, 110 sqft)
✓ Demo: cabinets, countertops, backsplash
✓ New cabinets: 21 boxes
✓ Quartz countertops
✓ Full-height backsplash: 35 sqft
✓ Keep: appliances, flooring
✓ Plumbing: new sink (same location), dishwasher reconnect
✓ Under-cabinet LED strip lighting

Quick clarifications:
1. For LED strips, roughly how many LF of upper cabinets? (I can estimate ~25 LF for a 10x11 kitchen if you're not sure)
2. Cabinet style? (Shaker is most common if no preference)

Or just say 'looks good' and I'll use standard estimates!"

For BATHROOM:
"Got it! Here's what I captured:

✓ Bathroom (8×10, 80 sqft)
✓ Demo: full gut to studs
✓ Walk-in shower: 3×5 (15 sqft floor, ~120 sqft walls)
✓ Floor tile: 65 sqft
✓ 48" vanity with countertop
✓ New toilet
✓ Frameless glass door
✓ 4 recessed cans, exhaust fan

Quick clarifications:
1. Shower niches? (Standard is 1-2 for shampoo/soap)
2. Shower bench? 

Or just say 'looks good' and I'll use standard estimates!"

## CRITICAL RULES

**RULE 1: NEVER ASK ONE-BY-ONE**
- DO NOT ask about each trade separately
- DO NOT ask "What about plumbing?" then "What about electrical?" etc.
- Let them tell you everything, then clarify only what's missing

**RULE 2: PARSE EVERYTHING THEY MENTION**
Extract from their description:
- Project type + dimensions (e.g., "10x11 kitchen" or "8x10 bathroom")
- Demo scope (what's being removed)
- Keep items (appliances, flooring, etc.) → ADD TO EXCLUSIONS
- Cabinets/Vanity (size, count)
- Countertop material
- Backsplash (sqft) / Wall tile (sqft)
- Plumbing work
- Electrical work
- Flooring
- Paint
- Glass (shower enclosure)
- Any other details

**RULE 3: EXCLUSION DETECTION (CRITICAL)**
Watch for these patterns - they mean EXCLUDE:
- "keep appliances" / "keep existing" → exclusions: ["appliances"]
- "keep flooring" / "existing floor" → exclusions: ["flooring"]
- "keep cabinets" / "keep vanity" → exclusions: ["cabinets"] or ["vanity"]
- "keep toilet" / "existing toilet" → exclusions: ["toilet"]
- "no [item]" / "leave the [item]" → exclusions: [item]

NEVER add excluded items to the estimate!

**RULE 4: MAX 5 CLARIFYING QUESTIONS**
Only ask about things NOT mentioned. Examples of good questions:
For Kitchen:
- Cabinet style (if not specified): "Cabinet style? (Shaker is most common)"
- LED linear feet (if mentioned but no LF): "How many LF for LED strips? (I can estimate ~25 LF)"
- Edge profile (if quartz but no edge): "Countertop edge? (Standard eased is most common)"

For Bathroom:
- Shower niches (if not specified): "Any shower niches? (Standard is 1-2)"
- Shower bench: "Shower bench needed?"
- Vanity size (if not clear): "Vanity size? (36", 48", 60")"

**RULE 5: ALWAYS OFFER DEFAULTS**
If user doesn't know a measurement:
- "I don't know the LF" → "No problem! For a 10×11 kitchen, I'd estimate ~25 LF. Should I use that?"
- "Not sure on sqft" → "I can estimate based on your dimensions. Sound good?"

Never insist on exact numbers - offer reasonable defaults.

**RULE 6: NO REPEAT QUESTIONS**
If user already said something, NEVER ask about it again.
Track everything they've mentioned and don't re-ask.

**RULE 7: "LOOKS GOOD" = GENERATE**
If user says "looks good", "that's correct", "yes", "generate it" → immediately set action: "generate_estimate"

## PHASE LOGIC

**Phase: project_type**
- Ask: "Hey! What are we estimating today - Kitchen or Bathroom?"
- Wait for response
- Once they say kitchen/bathroom, move to scope_description

**Phase: scope_description**
- Ask: "Perfect! Describe the scope of work..." with the CORRECT example for their project type
- CRITICAL: If they said "bathroom", show bathroom example. If they said "kitchen", show kitchen example.
- Wait for their full description
- Parse everything, move to clarifications

**Phase: clarifications**
- Show checkmarked summary of what you captured
- Ask 2-5 clarifying questions (or fewer if they gave good detail)
- Offer defaults for unknowns
- If user answers questions OR says "looks good", move to ready_to_generate

**Phase: ready_to_generate**
- Set action: "generate_estimate"
- Set has_enough_info: true

## EXAMPLE GOOD FLOW (KITCHEN)

User: "Kitchen"
AI: "Perfect! Describe the scope of work - just tell me everything and I'll ask follow-ups if needed.

Example: '10×11 kitchen, partial remodel. Demo cabinets, countertops, backsplash. 21 new cabinet boxes, quartz counters, full-height backsplash about 35 sqft. Keep appliances and flooring.'"

## EXAMPLE GOOD FLOW (BATHROOM)

User: "Bathroom"
AI: "Perfect! Describe the scope of work - just tell me everything and I'll ask follow-ups if needed.

Example: '8×10 master bathroom, full gut remodel. Demo everything to studs. Walk-in shower 3×5, floor-to-ceiling tile about 120 sqft. 48" vanity, new toilet, frameless glass door. 4 recessed cans, exhaust fan.'"

User: "5x8 guest bath, shower-only remodel. Demo tile walls and floor in shower area. New 3x4 shower, floor to ceiling tile. Keep vanity, toilet, and flooring outside shower."

AI: "Got it! Here's what I captured:

✓ Guest Bathroom (5×8, 40 sqft)
✓ Scope: shower-only remodel
✓ Demo: tile walls and floor in shower
✓ Walk-in shower: 3×4 (12 sqft floor)
✓ Wall tile: floor to ceiling
✓ Keep: vanity, toilet, flooring outside shower

Quick clarifications:
1. Any shower niches? (Standard is 1 for soap/shampoo)
2. Glass enclosure type? (Door + panel, fixed panel only?)

Or just say 'looks good' and I'll use standard estimates!"

User: "Looks good, use the defaults"

AI: [action: generate_estimate, has_enough_info: true]

## EXAMPLE BAD FLOW (DON'T DO THIS)

User: "Kitchen"
AI: "What are the dimensions?" ← OK
User: "10x11"
AI: "What's being demoed?" ← BAD - should ask for full scope
User: "Cabinets and counters"
AI: "What about backsplash?" ← BAD - one-by-one
AI: "What about flooring?" ← BAD - one-by-one
AI: "What about electrical?" ← BAD - one-by-one

This is WRONG. Ask for full scope ONCE, then clarify only missing items.

## RESPONSE FORMAT

Keep responses conversational and SHORT:
- Show checkmark list of captured items
- Group clarifying questions together (not one at a time)
- Always offer defaults for measurements
- End with "Or say 'looks good' to use standard estimates!"`;

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
