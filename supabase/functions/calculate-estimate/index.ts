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

// ============================================================
// COMPREHENSIVE PRICING DATABASE - Updated 2025-06-11
// IC = Internal Cost, CP = Client Price (42% margin: CP = IC * 1.724)
// ============================================================

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

  // ============ DEMOLITION ============
  if (categoryLower.includes('demo')) {
    if (taskLower.includes('full') && taskLower.includes('gut') && taskLower.includes('bath')) {
      return { ic: 1360, cp: 2344.83, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('full') && taskLower.includes('gut') && taskLower.includes('kitchen')) {
      return { ic: 1360, cp: 2344.83, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('cast iron') || taskLower.includes('castiron') || taskLower.includes('iron tub')) {
      return { ic: 250, cp: 431.03, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('soffit')) {
      return { ic: 15, cp: 25.86, unit: 'lf' };
    }
    if (taskLower.includes('shower') && taskLower.includes('only')) {
      return { ic: 900, cp: 1551.72, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('small') || taskLower.includes('standard bath')) {
      return { ic: 1300, cp: 2241.38, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('large') || taskLower.includes('full bath') || taskLower.includes('master')) {
      return { ic: 1650, cp: 2844.83, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('kitchen')) {
      return { ic: 1750, cp: 3017.24, unit: 'ea', flatRate: true };
    }
    // Default demo
    return { ic: 1360, cp: 2344.83, unit: 'ea', flatRate: true };
  }

  // ============ DUMPSTER & HAUL ============
  if (categoryLower.includes('disposal') || categoryLower.includes('logistics') || categoryLower.includes('haul') || categoryLower.includes('dumpster')) {
    if (taskLower.includes('dumpster') || taskLower.includes('20 yard') || taskLower.includes('20yd')) {
      return { ic: 550, cp: 948.28, unit: 'ea', flatRate: true };
    }
    return { ic: 550, cp: 948.28, unit: 'ea', flatRate: true };
  }

  // ============ SITE PROTECTION ============
  if (categoryLower.includes('site protection') || categoryLower.includes('protection') || categoryLower.includes('setup')) {
    if (taskLower.includes('ramboard') || taskLower.includes('floor protection')) {
      return { ic: 0.5, cp: 0.86, unit: 'sqft' };
    }
    if (taskLower.includes('dust') || taskLower.includes('zipwall') || taskLower.includes('barrier')) {
      return { ic: 150, cp: 258.62, unit: 'ea', flatRate: true };
    }
    return { ic: 150, cp: 258.62, unit: 'ea', flatRate: true };
  }

  // ============ PLUMBING (COMPREHENSIVE) ============
  if (categoryLower.includes('plumb')) {
    // Toilet relocations - MOST EXPENSIVE
    if (taskLower.includes('toilet') && (taskLower.includes('line') || taskLower.includes('reloc') || taskLower.includes('move'))) {
      return { ic: 4000, cp: 6896.55, unit: 'ea', flatRate: true };
    }
    // Tub drain relocation
    if (taskLower.includes('tub') && (taskLower.includes('drain') || taskLower.includes('reloc'))) {
      return { ic: 2800, cp: 4827.59, unit: 'ea', flatRate: true };
    }
    // Shower valve install
    if (taskLower.includes('shower') && taskLower.includes('valve')) {
      return { ic: 1800, cp: 3103.45, unit: 'ea', flatRate: true };
    }
    // Shower curb and liner
    if (taskLower.includes('curb') || taskLower.includes('liner')) {
      return { ic: 500, cp: 862.07, unit: 'ea', flatRate: true };
    }
    // Toilet reinstall (existing)
    if (taskLower.includes('toilet') && (taskLower.includes('reinstall') || taskLower.includes('reuse') || taskLower.includes('existing'))) {
      return { ic: 150, cp: 258.62, unit: 'ea', flatRate: true };
    }
    // Freestanding tub (material + install combined)
    if (taskLower.includes('freestanding')) {
      if (taskLower.includes('material')) {
        return { ic: 2250, cp: 3879.31, unit: 'ea', flatRate: true };
      }
      if (taskLower.includes('install')) {
        return { ic: 2250, cp: 3879.31, unit: 'ea', flatRate: true };
      }
      // Combined
      return { ic: 4500, cp: 7758.62, unit: 'ea', flatRate: true };
    }
    // Tub filler
    if (taskLower.includes('tub filler') || taskLower.includes('tub fill')) {
      return { ic: 500, cp: 862.07, unit: 'ea', flatRate: true };
    }
    // Standard shower rough-in
    if (taskLower.includes('shower') && taskLower.includes('standard')) {
      return { ic: 2225, cp: 3836.21, unit: 'ea', flatRate: true };
    }
    // Extra head
    if (taskLower.includes('extra head') || taskLower.includes('additional head')) {
      return { ic: 625, cp: 1077.59, unit: 'ea', flatRate: true };
    }
    // Tub to shower conversion
    if (taskLower.includes('tub to shower') || taskLower.includes('conversion')) {
      return { ic: 2550, cp: 4396.55, unit: 'ea', flatRate: true };
    }
    // Linear drain
    if (taskLower.includes('linear drain')) {
      return { ic: 750, cp: 1293.10, unit: 'ea', flatRate: true };
    }
    // Smart valve
    if (taskLower.includes('smart') && taskLower.includes('valve')) {
      return { ic: 1350, cp: 2327.59, unit: 'ea', flatRate: true };
    }
    // Toilet swap (same location)
    if (taskLower.includes('toilet') && !taskLower.includes('reloc')) {
      return { ic: 350, cp: 603.45, unit: 'ea', flatRate: true };
    }
    // Kitchen reconnect
    if (taskLower.includes('kitchen') && (taskLower.includes('reconnect') || taskLower.includes('hook'))) {
      return { ic: 800, cp: 1379.31, unit: 'ea', flatRate: true };
    }
    // Default plumbing
    return { ic: 2225, cp: 3836.21, unit: 'ea', flatRate: true };
  }

  // ============ ELECTRICAL ============
  if (categoryLower.includes('electric')) {
    if (taskLower.includes('recessed') || taskLower.includes('can')) {
      return { ic: 65, cp: 112.07, unit: 'ea' };
    }
    if (taskLower.includes('vanity light') || taskLower.includes('vanity lights')) {
      return { ic: 300, cp: 517.24, unit: 'ea' };
    }
    if (taskLower.includes('pendant')) {
      return { ic: 150, cp: 258.62, unit: 'ea' };
    }
    if (taskLower.includes('under cabinet')) {
      return { ic: 350, cp: 603.45, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('kitchen')) {
      return { ic: 950, cp: 1637.93, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('led') && taskLower.includes('mirror')) {
      return { ic: 100, cp: 172.41, unit: 'ea' }; // Just electrical for LED mirror
    }
    return { ic: 250, cp: 431.03, unit: 'ea', flatRate: true };
  }

  // ============ FRAMING & DRYWALL ============
  if (categoryLower.includes('fram') || categoryLower.includes('structural')) {
    if (taskLower.includes('wall remov') || taskLower.includes('remove wall')) {
      return { ic: 1200, cp: 2068.97, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('new wall') || taskLower.includes('build wall') || taskLower.includes('frame new')) {
      return { ic: 1200, cp: 2068.97, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('niche')) {
      return { ic: 150, cp: 258.62, unit: 'ea' };
    }
    if (taskLower.includes('pony wall')) {
      return { ic: 450, cp: 775.86, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('pocket door')) {
      return { ic: 650, cp: 1120.69, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('door') && taskLower.includes('reloc')) {
      return { ic: 1200, cp: 2068.97, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('door') && taskLower.includes('clos')) {
      return { ic: 600, cp: 1034.48, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('shower') && taskLower.includes('enlarg')) {
      return { ic: 1800, cp: 3103.45, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('bench')) {
      return { ic: 400, cp: 689.66, unit: 'ea' };
    }
    // Standard framing
    return { ic: 550, cp: 948.28, unit: 'ea', flatRate: true };
  }

  // ============ DRYWALL ============
  if (categoryLower.includes('drywall')) {
    if (taskLower.includes('patch') || taskLower.includes('texture')) {
      return { ic: 330, cp: 568.97, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('large')) {
      return { ic: 13, cp: 22.41, unit: 'sqft' };
    }
    return { ic: 330, cp: 568.97, unit: 'ea', flatRate: true };
  }

  // ============ TILE & WATERPROOFING ============
  if (categoryLower.includes('tile')) {
    // Wall tile
    if (taskLower.includes('wall')) {
      return { ic: 18, cp: 31.03, unit: 'sqft' };
    }
    // Shower floor tile
    if (taskLower.includes('shower') && taskLower.includes('floor')) {
      return { ic: 5, cp: 8.62, unit: 'sqft' };
    }
    // Main floor tile
    if (taskLower.includes('main') || taskLower.includes('floor')) {
      return { ic: 4.5, cp: 7.76, unit: 'sqft' };
    }
    // Default to wall tile
    return { ic: 18, cp: 31.03, unit: 'sqft' };
  }

  // ============ WATERPROOFING ============
  if (categoryLower.includes('waterproof') || (categoryLower.includes('support') && taskLower.includes('waterproof'))) {
    return { ic: 2, cp: 3.45, unit: 'sqft' };
  }

  // ============ CEMENT BOARD ============
  if (categoryLower.includes('cement') || (categoryLower.includes('support') && taskLower.includes('cement'))) {
    return { ic: 3, cp: 5.17, unit: 'sqft' };
  }

  // ============ SCHLUTER PROFILE ============
  if (taskLower.includes('schluter') || taskLower.includes('profile') || taskLower.includes('edge')) {
    return { ic: 15, cp: 25.86, unit: 'lf' };
  }

  // ============ CABINETRY & VANITIES ============
  if (categoryLower.includes('vanit') && !taskLower.includes('light')) {
    if (taskLower.includes('96') || taskLower.includes('90')) {
      return { ic: 3800, cp: 6551.72, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('84')) {
      return { ic: 3200, cp: 5517.24, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('72')) {
      return { ic: 2600, cp: 4482.76, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('60')) {
      return { ic: 2200, cp: 3793.10, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('48')) {
      return { ic: 2500, cp: 4310.34, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('36')) {
      return { ic: 1300, cp: 2241.38, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('30')) {
      return { ic: 1100, cp: 1896.55, unit: 'ea', flatRate: true };
    }
    // Linen cabinet
    if (taskLower.includes('linen')) {
      return { ic: 300, cp: 517.24, unit: 'ea', flatRate: true };
    }
    // Default 48" vanity
    return { ic: 2500, cp: 4310.34, unit: 'ea', flatRate: true };
  }

  // ============ CABINETS (Kitchen) ============
  if (categoryLower.includes('cabinet') || categoryLower.includes('cabinetry')) {
    const materialIc = 150;
    const laborIc = 50;
    const totalIc = materialIc + laborIc;
    return { ic: totalIc, cp: totalIc * 1.724, unit: 'lf' };
  }

  // ============ COUNTERTOPS / QUARTZ ============
  if (categoryLower.includes('quartz') || categoryLower.includes('countertop') || categoryLower.includes('counter')) {
    // Quartz fabrication & install
    if (taskLower.includes('fab') || taskLower.includes('install') || taskLower.includes('labor')) {
      return { ic: 22, cp: 37.93, unit: 'sqft' };
    }
    // Quartz material allowance (slab)
    if (taskLower.includes('material') || taskLower.includes('slab') || taskLower.includes('allowance')) {
      return { ic: 1200, cp: 1200, unit: 'ea', flatRate: true }; // Material allowance = pass-through
    }
    // Combined quartz
    return { ic: 22, cp: 37.93, unit: 'sqft' };
  }

  // ============ BACKSPLASH ============
  if (categoryLower.includes('backsplash')) {
    return { ic: 25, cp: 43.10, unit: 'sqft' };
  }

  // ============ FLOORING (non-tile) ============
  if (categoryLower.includes('floor') && !categoryLower.includes('tile')) {
    if (taskLower.includes('lvp') || taskLower.includes('vinyl') || taskLower.includes('laminate')) {
      return { ic: 2.5, cp: 4.31, unit: 'sqft' };
    }
    return { ic: 4.5, cp: 7.76, unit: 'sqft' };
  }

  // ============ PAINT ============
  if (categoryLower.includes('paint')) {
    if (taskLower.includes('ceiling')) {
      return { ic: 250, cp: 431.03, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('full') || taskLower.includes('complete') || taskLower.includes('bathroom')) {
      return { ic: 1000, cp: 1724.14, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('kitchen')) {
      return { ic: 1200, cp: 2068.97, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('trim') || taskLower.includes('baseboard')) {
      return { ic: 2, cp: 3.45, unit: 'lf' };
    }
    // Patch & repair
    return { ic: 500, cp: 862.07, unit: 'ea', flatRate: true };
  }

  // ============ GLASS ============
  if (categoryLower.includes('glass')) {
    if (taskLower.includes('90') || taskLower.includes('return') || taskLower.includes('corner')) {
      return { ic: 1425, cp: 2456.90, unit: 'ea', flatRate: true };
    }
    if (taskLower.includes('panel only') || taskLower.includes('fixed')) {
      return { ic: 800, cp: 1379.31, unit: 'ea', flatRate: true };
    }
    // Door + panel (standard)
    return { ic: 1350, cp: 2327.59, unit: 'ea', flatRate: true };
  }

  // ============ MATERIALS / ALLOWANCES ============
  if (categoryLower.includes('material') || categoryLower.includes('allowance')) {
    // Tile material allowances
    if (taskLower.includes('tile') && taskLower.includes('main')) {
      return { ic: 6.50, cp: 6.50, unit: 'sqft' }; // Pass-through allowance
    }
    if (taskLower.includes('tile') && taskLower.includes('shower') && taskLower.includes('floor')) {
      return { ic: 12, cp: 12, unit: 'sqft' }; // Pass-through allowance
    }
    if (taskLower.includes('tile') && (taskLower.includes('wall') || !taskLower.includes('floor'))) {
      return { ic: 6.50, cp: 6.50, unit: 'sqft' }; // Pass-through allowance
    }
    // Plumbing fixtures
    if (taskLower.includes('plumbing') || taskLower.includes('fixture')) {
      return { ic: 1350, cp: 1350, unit: 'ea', flatRate: true };
    }
    // LED Mirror material
    if (taskLower.includes('led') && taskLower.includes('mirror')) {
      return { ic: 550, cp: 550, unit: 'ea' };
    }
    return { ic: 500, cp: 862.07, unit: 'ea', flatRate: true };
  }

  // ============ ACCESSORIES / TRIMOUT ============
  if (categoryLower.includes('accessor') || categoryLower.includes('trimout') || categoryLower.includes('final')) {
    if (taskLower.includes('led') && taskLower.includes('mirror')) {
      return { ic: 550, cp: 550, unit: 'ea' }; // Material allowance
    }
    if (taskLower.includes('mirror')) {
      return { ic: 200, cp: 344.83, unit: 'ea' };
    }
    if (taskLower.includes('towel') && taskLower.includes('bar')) {
      return { ic: 45, cp: 77.59, unit: 'ea' };
    }
    if (taskLower.includes('tp') || taskLower.includes('toilet paper')) {
      return { ic: 12, cp: 20.69, unit: 'ea' };
    }
    return { ic: 150, cp: 258.62, unit: 'ea' };
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

// CONVERSATIONAL ESTIMATOR SYSTEM PROMPT
const guidedInterviewPrompt = `You are EstimAIte, an AI assistant helping contractors create estimates for kitchen and bathroom remodels. Your goal is to feel like texting a smart colleague, not filling out a form.

## CORE RULES
1. Max 2 questions per message - never more
2. NEVER use numbered lists when asking questions
3. Always acknowledge what they said before asking next question
4. Sound like a human contractor, not a robot
5. Keep messages short and conversational
6. NEVER repeat the same question twice
7. NEVER ask "Could you tell me more about the project?" - be specific about what you need

## CONVERSATION FLOW

**STEP 1 - PROJECT TYPE:**
"Hey! What project are we estimating today?

📷 Upload a photo or 🎥 Record a video walk-through for instant AI detection, or just tell me:

Kitchen or Bathroom?"

**STEP 2 - GET FULL SCOPE:**
"Perfect! Describe the scope of work - just tell me everything and I'll ask follow-up questions if needed."

**STEP 3 - PARSE & RESPOND:**
After they describe scope:
- Show you understand the complexity
- Acknowledge what they said naturally
- Ask ONLY what's missing (max 2 questions)
- Group related questions together
- Track what they've already told you
- NEVER repeat a question

## HANDLING ADDITIONS
When user adds more items after initial scope:
- Acknowledge the additions
- Update your understanding
- DON'T ask questions you already asked
- Only ask about NEW missing information

Example:
User adds: "new shower valve, curb, liner, waterproofing, tile materials"
You: "Perfect - adding shower valve, curb, liner, waterproofing, and tile materials.

For the shower walls, how many sqft are we tiling?"

DO NOT ask about flooring sqft again if they already told you.

## CALCULATING SQUARE FOOTAGE
- Main bathroom floor: what they tell you
- Shower floor: separate (they'll specify)
- Shower walls: you need to ask OR calculate (64x33 shower = ~35 sqft walls typical)

If they say "125 sqft excludes shower":
- 125 sqft = main bathroom floor
- Shower floor = 64x33 = ~14 sqft
- Shower walls = you need to ask OR estimate

## MEMORY TRACKING
Keep track of what you know. Example:
- ✓ Bathroom size: 125 sqft (main floor only)
- ✓ Shower size: 64x33
- ✓ Vanity: 90" double, quartz top
- ✓ Tile: porcelain, $6.50/sqft main floor, $12/sqft shower floor, $6.50/sqft walls
- ✓ No electrical updates
- ? Shower wall sqft - NEED THIS

## NEVER RE-ASK
✗ "Is it 125 sqft for the entire bathroom?" - if they already answered
✗ "Any electrical updates?" - if they already said no
✗ "What countertop material?" - if they already said quartz

## WHEN TO GENERATE ESTIMATE
Generate the estimate when you have:
1. All major line items identified
2. Dimensions for pricing
3. Material selections made
4. Only minor details might be missing (use defaults)

If you're only missing shower wall sqft - CALCULATE IT or ask once:
"Got it! Last thing - for the shower walls (64x33 shower), are we tiling full height? That's usually about 90 sqft for walls. Sound right?"

THEN GENERATE THE ESTIMATE. Don't keep asking.

## GOOD RESPONSE EXAMPLES

User: "125 sqft bathroom, relocate toilet 8ft, swap with tub, new shower, 90" vanity"

You: "Got it - that's a major layout change! Moving the toilet 8 feet means new drain lines and supply. 

For the new shower - what size are we looking at? And tile or acrylic walls?"

## BAD RESPONSE - NEVER DO THIS
❌ "Quick clarifications:
1. Shower dimensions?
2. Tile type?
3. Glass enclosure?
4. Countertop material?
5. Electrical updates?"

THIS IS TOO FORMAL. NEVER USE NUMBERED LISTS FOR QUESTIONS.

## HANDLING "I DON'T KNOW"
If user says "I don't know" or "not sure":
- Offer a standard estimate
- Don't keep pushing for exact numbers

Example:
User: "idk the shower size"
You: "No problem! For a standard bathroom that size, I'll estimate a 60x32 shower. Sound good?"

## NEVER SAY
✗ "Could you tell me more about the project?"
✗ "I see you mentioned..."
✗ "According to your input..."
✗ "Quick clarifications:"
✗ "Could you please provide..."

## ALWAYS SAY
✓ "Got it - full gut to the studs!"
✓ "Perfect - adding those to the estimate"
✓ "Last thing - what's the shower wall sqft?"
✓ "Awesome, I've got everything I need!"

## EXCLUSION DETECTION (CRITICAL)
Watch for these patterns - they mean EXCLUDE:
- "keep appliances" / "keep existing" → exclusions: ["appliances"]
- "keep flooring" / "existing floor" → exclusions: ["flooring"]
- "keep cabinets" / "keep vanity" → exclusions: ["cabinets"] or ["vanity"]
- "keep toilet" / "existing toilet" → exclusions: ["toilet"]
- "no [item]" / "leave the [item]" → exclusions: [item]

NEVER add excluded items to the estimate!

## FINAL SUMMARY FORMAT
After all info gathered:

"Perfect! Here's your complete scope:

📋 BATHROOM REMODEL - 125 sqft

DEMO & FRAMING
- Full gut to studs
- Remove toilet room wall/entry
- Remove halfwall between shower and vanity
- Frame new layout

PLUMBING  
- Relocate toilet line 8ft
- Relocate tub to old toilet location
- New shower valve, curb, liner
- New tub filler
- Reinstall toilet (new wax ring, supply lines)

WATERPROOFING
- Full shower waterproofing system

TILE (Materials + Install)
- Main floor: 125 sqft porcelain @ $6.50/sqft
- Shower floor: 14 sqft porcelain @ $12/sqft  
- Shower walls: 90 sqft porcelain @ $6.50/sqft

FIXTURES
- 90" double vanity with quartz countertop
- Frameless glass shower enclosure (64x33)
- New freestanding tub with filler

Ready to generate your estimate?"

## PHASE LOGIC

**Phase: project_type**
- Ask the opening question with photo/video option
- Wait for response
- Once they say kitchen/bathroom, move to scope_description

**Phase: scope_description**
- Ask: "Perfect! Describe the scope of work..."
- Wait for their full description
- Parse everything, move to clarifications

**Phase: clarifications**
- Acknowledge what they said naturally
- Ask max 2 clarifying questions (conversationally, no numbered lists)
- Offer defaults for unknowns
- If user answers questions OR says "looks good" / "sounds right", move to ready_to_generate

**Phase: ready_to_generate**
- Set action: "generate_estimate"
- Set has_enough_info: true

## WHEN TO STOP ASKING
- If you have 90% of info → use defaults for the rest
- If user seems frustrated → stop asking, generate estimate
- If you've asked 5+ questions → wrap it up
- Never ask more than 8 total questions

## KEY PRINCIPLE
Better to generate an estimate with reasonable assumptions than to interrogate the user to death. You can always adjust after.

## END GOAL
User should feel like they just texted a contractor friend who "gets it" and can run with their description.`;

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
