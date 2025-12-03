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
// Returns ic, cp, unit, and whether this is a flat rate (ignore quantity)
function mapCategoryToPricing(
  category: string,
  taskDescription: string,
  config: PricingConfig
): { ic: number; cp: number; unit: string; flatRate?: boolean } | null {
  const categoryLower = category.toLowerCase();
  const taskLower = taskDescription.toLowerCase();

  // Demolition - FLAT RATE (always quantity = 1)
  if (categoryLower.includes('demo')) {
    if (taskLower.includes('shower') && taskLower.includes('only')) {
      return { ic: Number(config.demo_shower_only_ic) || 900, cp: Number(config.demo_shower_only_cp) || 1450, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('small')) {
      return { ic: Number(config.demo_small_bath_ic) || 1300, cp: Number(config.demo_small_bath_cp) || 2050, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('large')) {
      return { ic: Number(config.demo_large_bath_ic) || 1650, cp: Number(config.demo_large_bath_cp) || 2500, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('kitchen')) {
      return { ic: Number(config.demo_kitchen_ic) || 1750, cp: Number(config.demo_kitchen_cp) || 2800, unit: 'ea', flatRate: true };
    }
    return { ic: Number(config.demo_small_bath_ic) || 1300, cp: Number(config.demo_small_bath_cp) || 2050, unit: 'ea', flatRate: true };
  }

  // Plumbing - FLAT RATE packages
  if (categoryLower.includes('plumb')) {
    if (taskLower.includes('reconnect') || taskLower.includes('hook up') || taskLower.includes('hookup')) {
      // Kitchen plumbing reconnect (sink, dishwasher, etc.)
      return { ic: 800, cp: 1400, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('toilet') && taskLower.includes('reloc')) {
      // Toilet relocation - expensive due to drain work
      return { ic: 1100, cp: 2200, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('toilet')) {
      return { ic: Number(config.plumbing_toilet_ic) || 350, cp: Number(config.plumbing_toilet_cp) || 690, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('tub') && taskLower.includes('reloc')) {
      // Tub relocation - major plumbing work
      return { ic: 2800, cp: 4800, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('shower') && taskLower.includes('standard')) {
      return { ic: Number(config.plumbing_shower_standard_ic) || 2225, cp: Number(config.plumbing_shower_standard_cp) || 3425, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('extra head') || taskLower.includes('additional head')) {
      return { ic: Number(config.plumbing_extra_head_ic) || 625, cp: Number(config.plumbing_extra_head_cp) || 1100, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('freestanding')) {
      return { ic: Number(config.plumbing_tub_freestanding_ic) || 3300, cp: Number(config.plumbing_tub_freestanding_cp) || 4800, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('tub to shower') || taskLower.includes('conversion')) {
      return { ic: Number(config.plumbing_tub_to_shower_ic) || 2550, cp: Number(config.plumbing_tub_to_shower_cp) || 4200, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('linear drain')) {
      return { ic: Number(config.plumbing_linear_drain_ic) || 750, cp: Number(config.plumbing_linear_drain_cp) || 1550, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('smart valve')) {
      return { ic: Number(config.plumbing_smart_valve_ic) || 1350, cp: Number(config.plumbing_smart_valve_cp) || 2450, unit: 'ea', flatRate: true };
    }
    return { ic: Number(config.plumbing_shower_standard_ic) || 2225, cp: Number(config.plumbing_shower_standard_cp) || 3425, unit: 'ea', flatRate: true };
  }

  // Tile
  if (categoryLower.includes('tile')) {
    if (taskLower.includes('wall') || taskLower.includes('surround')) {
      return { ic: Number(config.tile_wall_ic_per_sqft) || 20, cp: Number(config.tile_wall_cp_per_sqft) || 39, unit: 'sqft' };
    } else if (taskLower.includes('shower floor')) {
      return { ic: Number(config.tile_shower_floor_ic_per_sqft) || 6, cp: Number(config.tile_shower_floor_cp_per_sqft) || 14, unit: 'sqft' };
    } else if (taskLower.includes('floor') || taskLower.includes('main floor')) {
      return { ic: Number(config.tile_floor_ic_per_sqft) || 5.5, cp: Number(config.tile_floor_cp_per_sqft) || 12, unit: 'sqft' };
    }
    return { ic: Number(config.tile_wall_ic_per_sqft) || 20, cp: Number(config.tile_wall_cp_per_sqft) || 39, unit: 'sqft' };
  }

  // Waterproofing / Support Work
  if (categoryLower.includes('waterproof') || (categoryLower.includes('support') && taskLower.includes('waterproof'))) {
    return { ic: Number(config.waterproofing_ic_per_sqft) || 6, cp: Number(config.waterproofing_cp_per_sqft) || 13, unit: 'sqft' };
  }

  // Cement Board
  if (categoryLower.includes('cement') || (categoryLower.includes('support') && taskLower.includes('cement'))) {
    return { ic: Number(config.cement_board_ic_per_sqft) || 3, cp: Number(config.cement_board_cp_per_sqft) || 5, unit: 'sqft' };
  }

  // Electrical
  if (categoryLower.includes('electric')) {
    if (taskLower.includes('recessed') || taskLower.includes('can')) {
      return { ic: Number(config.recessed_can_ic_each) || 65, cp: Number(config.recessed_can_cp_each) || 110, unit: 'ea' };
    } else if (taskLower.includes('vanity light')) {
      return { ic: Number(config.electrical_vanity_light_ic) || 200, cp: Number(config.electrical_vanity_light_cp) || 350, unit: 'ea' };
    } else if (taskLower.includes('pendant')) {
      // Pendant light installation (kitchen island, bar, etc.)
      return { ic: 150, cp: 275, unit: 'ea' };
    } else if (taskLower.includes('under cabinet') || taskLower.includes('undercabinet')) {
      // Under-cabinet LED lighting package
      return { ic: 350, cp: 600, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('kitchen')) {
      return { ic: Number(config.electrical_kitchen_package_ic) || 950, cp: Number(config.electrical_kitchen_package_cp) || 1750, unit: 'ea' };
    } else if (taskLower.includes('reloc')) {
      // Switch/outlet relocation
      return { ic: 150, cp: 300, unit: 'ea' };
    }
    return { ic: Number(config.electrical_small_package_ic) || 250, cp: Number(config.electrical_small_package_cp) || 400, unit: 'ea' };
  }

  // Framing / Structural - CRITICAL FOR COMPLEX JOBS
  if (categoryLower.includes('fram') || categoryLower.includes('structural')) {
    if (taskLower.includes('niche')) {
      return { ic: Number(config.niche_ic_each) || 300, cp: Number(config.niche_cp_each) || 550, unit: 'ea' };
    } else if (taskLower.includes('pony wall')) {
      return { ic: Number(config.framing_pony_wall_ic) || 450, cp: Number(config.framing_pony_wall_cp) || 850, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('wall remov') || taskLower.includes('remove wall')) {
      // Non-load-bearing wall removal
      return { ic: 1500, cp: 2800, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('wall build') || taskLower.includes('new wall')) {
      // Build new wall (per linear foot)
      return { ic: 35, cp: 65, unit: 'lf' };
    } else if (taskLower.includes('door') && taskLower.includes('reloc')) {
      // Door relocation - framing new opening + closing old
      return { ic: 1200, cp: 2200, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('door') && taskLower.includes('clos')) {
      // Close off existing doorway
      return { ic: 600, cp: 1100, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('door') && taskLower.includes('enlarg')) {
      // Enlarge doorway/entrance
      return { ic: 900, cp: 1700, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('soffit')) {
      // Soffit removal
      return { ic: 800, cp: 1500, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('shower') && taskLower.includes('enlarg')) {
      // Enlarge shower footprint
      return { ic: 1800, cp: 3200, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('alcove') || taskLower.includes('built-in')) {
      // Build alcove/built-in
      return { ic: 900, cp: 1650, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('bench')) {
      // Shower bench framing
      return { ic: 400, cp: 750, unit: 'ea' };
    }
    return { ic: Number(config.framing_standard_ic) || 550, cp: Number(config.framing_standard_cp) || 1200, unit: 'ea', flatRate: true };
  }

  // Glass - FLAT RATE packages
  if (categoryLower.includes('glass')) {
    if (taskLower.includes('90') || taskLower.includes('return')) {
      return { ic: Number(config.glass_90_return_ic) || 1425, cp: Number(config.glass_90_return_cp) || 2775, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('panel only')) {
      return { ic: Number(config.glass_panel_only_ic) || 800, cp: Number(config.glass_panel_only_cp) || 1450, unit: 'ea', flatRate: true };
    }
    return { ic: Number(config.glass_shower_standard_ic) || 1200, cp: Number(config.glass_shower_standard_cp) || 2100, unit: 'ea', flatRate: true };
  }

  // Paint - FLAT RATE packages
  if (categoryLower.includes('paint')) {
    if (taskLower.includes('full')) {
      return { ic: Number(config.paint_full_bath_ic) || 1200, cp: Number(config.paint_full_bath_cp) || 1900, unit: 'ea', flatRate: true };
    }
    return { ic: Number(config.paint_patch_bath_ic) || 800, cp: Number(config.paint_patch_bath_cp) || 1000, unit: 'ea', flatRate: true };
  }

  // Drywall - for structural work
  if (categoryLower.includes('drywall')) {
    if (taskLower.includes('new wall') || taskLower.includes('full wall')) {
      return { ic: 8, cp: 15, unit: 'sqft' };
    } else if (taskLower.includes('patch')) {
      return { ic: 400, cp: 750, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('ceiling')) {
      return { ic: 10, cp: 18, unit: 'sqft' };
    }
    return { ic: 8, cp: 15, unit: 'sqft' };
  }

  // Vanity - FLAT RATE bundles
  if (categoryLower.includes('vanity')) {
    // Check for custom/oversized vanity (100"+)
    if (taskLower.includes('custom') || taskLower.includes('150') || taskLower.includes('120') || taskLower.includes('100')) {
      // Custom oversized vanity - price as double 72" or more
      return { ic: 6500, cp: 10500, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('30')) {
      return { ic: Number(config.vanity_30_bundle_ic) || 1100, cp: Number(config.vanity_30_bundle_cp) || 1800, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('36')) {
      return { ic: Number(config.vanity_36_bundle_ic) || 1300, cp: Number(config.vanity_36_bundle_cp) || 2100, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('48')) {
      return { ic: Number(config.vanity_48_bundle_ic) || 1600, cp: Number(config.vanity_48_bundle_cp) || 2600, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('54')) {
      return { ic: Number(config.vanity_54_bundle_ic) || 1900, cp: Number(config.vanity_54_bundle_cp) || 3000, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('60')) {
      return { ic: Number(config.vanity_60_bundle_ic) || 2200, cp: Number(config.vanity_60_bundle_cp) || 3500, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('72')) {
      return { ic: Number(config.vanity_72_bundle_ic) || 2600, cp: Number(config.vanity_72_bundle_cp) || 4200, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('84')) {
      return { ic: Number(config.vanity_84_bundle_ic) || 3200, cp: Number(config.vanity_84_bundle_cp) || 5000, unit: 'ea', flatRate: true };
    }
    return { ic: Number(config.vanity_48_bundle_ic) || 1600, cp: Number(config.vanity_48_bundle_cp) || 2600, unit: 'ea', flatRate: true };
  }

  // Quartz/Countertops
  if (categoryLower.includes('quartz') || categoryLower.includes('countertop')) {
    return { ic: Number(config.quartz_ic_per_sqft) || 15, cp: Number(config.quartz_cp_per_sqft) || 50, unit: 'sqft' };
  }

  // Cabinets (Kitchen) - Priced per linear foot, NOT per sqft of kitchen floor
  // Typical kitchen: 15-25 LF base + 10-20 LF wall = material + installation
  if (categoryLower.includes('cabinet')) {
    // Check if this is installation labor only or full cabinet package
    if (taskLower.includes('labor') || taskLower.includes('install only')) {
      // Installation labor only - use config values
      return { 
        ic: Number(config.cabinet_install_only_lf_ic) || 50, 
        cp: Number(config.cabinet_install_only_lf_cp) || 85, 
        unit: 'lf' 
      };
    }
    // Full cabinet package (material + labor) - use config values
    return { 
      ic: Number(config.cabinet_lf_ic) || 250, 
      cp: Number(config.cabinet_lf_cp) || 400, 
      unit: 'lf' 
    };
  }

  // Backsplash
  if (categoryLower.includes('backsplash')) {
    return { ic: Number(config.tile_wall_ic_per_sqft) || 20, cp: Number(config.tile_wall_cp_per_sqft) || 39, unit: 'sqft' };
  }

  // Closet work
  if (categoryLower.includes('closet')) {
    if (taskLower.includes('system') || taskLower.includes('organizer')) {
      return { ic: 1800, cp: 3200, unit: 'ea', flatRate: true };
    } else if (taskLower.includes('reframe') || taskLower.includes('square off')) {
      return { ic: 1200, cp: 2200, unit: 'ea', flatRate: true };
    }
    // Basic closet work per sqft
    return { ic: Number(config.closet_ic_per_sqft) || 55, cp: Number(config.closet_cp_per_sqft) || 90, unit: 'sqft' };
  }

  return null;
}

function calculatePricing(tradeBuckets: EstimateData['trade_buckets'], config: PricingConfig) {
  const lineItems: PricingResult[] = [];
  const warnings: string[] = [];

  for (const bucket of tradeBuckets) {
    const mapping = mapCategoryToPricing(bucket.category, bucket.task_description, config);

    if (!mapping) {
      warnings.push(`No pricing found for: ${bucket.category} - ${bucket.task_description}`);
      continue;
    }

    // For flat rate items, force quantity to 1 (these are packages, not per-unit)
    const effectiveQuantity = mapping.flatRate ? 1 : bucket.quantity;
    
    const icTotal = mapping.ic * effectiveQuantity;
    const cpTotal = mapping.cp * effectiveQuantity;
    const marginPercent = cpTotal > 0 ? ((cpTotal - icTotal) / cpTotal) * 100 : 0;

    lineItems.push({
      category: bucket.category,
      task_description: bucket.task_description,
      quantity: effectiveQuantity,
      unit: bucket.unit || mapping.unit,
      ic_per_unit: mapping.ic,
      cp_per_unit: mapping.cp,
      ic_total: icTotal,
      cp_total: cpTotal,
      margin_percent: marginPercent,
    });
  }

  const totalIc = lineItems.reduce((sum, item) => sum + item.ic_total, 0);
  const totalCp = lineItems.reduce((sum, item) => sum + item.cp_total, 0);
  const overallMargin = totalCp > 0 ? ((totalCp - totalIc) / totalCp) * 100 : 0;

  // Apply minimum job pricing
  const minJobCp = Number(config.min_job_cp) || 15000;
  const minJobIc = Number(config.min_job_ic) || 10500;

  let finalTotalCp = totalCp;
  let finalTotalIc = totalIc;

  if (totalCp < minJobCp) {
    finalTotalCp = minJobCp;
    finalTotalIc = Math.max(totalIc, minJobIc);
    warnings.push(`Applied minimum job pricing: $${minJobCp.toLocaleString()}`);
  }

  // Calculate range
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

// JSON Schema for tool calling
const estimateJsonSchema = {
  type: "object",
  properties: {
    project_header: {
      type: "object",
      properties: {
        client_name: { type: ["string", "null"] },
        project_type: { type: "string", enum: ["Kitchen", "Bathroom", "Combination", "Other"] },
        overall_size_sqft: { type: ["number", "null"] }
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

// Conversational analysis schema
const analysisJsonSchema = {
  type: "object",
  properties: {
    action: { 
      type: "string", 
      enum: ["ask_question", "generate_estimate"],
      description: "Whether to ask a follow-up question or generate the estimate"
    },
    project_type: { 
      type: ["string", "null"], 
      enum: ["Kitchen", "Bathroom", "Combination", null],
      description: "Detected project type, or null if unclear"
    },
    has_enough_info: { 
      type: "boolean",
      description: "True if we have enough details to generate a quote"
    },
    missing_info: {
      type: "array",
      items: { type: "string" },
      description: "List of missing information needed"
    },
    follow_up_question: {
      type: ["string", "null"],
      description: "The question to ask if action is ask_question"
    },
    parsed_scope: {
      type: "object",
      description: "What we understood from the user's input",
      properties: {
        demo: { type: ["string", "null"] },
        cabinets: { type: ["string", "null"] },
        countertops: { type: ["string", "null"] },
        backsplash: { type: ["string", "null"] },
        flooring: { type: ["string", "null"] },
        tile: { type: ["string", "null"] },
        plumbing: { type: ["string", "null"] },
        electrical: { type: ["string", "null"] },
        glass: { type: ["string", "null"] },
        vanity: { type: ["string", "null"] },
        paint: { type: ["string", "null"] }
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
        countertop_sqft: { type: ["number", "null"] }
      }
    },
    parsed_client_details: {
      type: "object",
      description: "Client contact information parsed from conversation",
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
    client_details_skipped: {
      type: "boolean",
      description: "True if user said skip/none for client details"
    }
  },
  required: ["action", "has_enough_info", "missing_info"]
};

const conversationalSystemPrompt = `You are a construction estimator assistant helping contractors quickly build quotes. Your job is to:

1. UNDERSTAND the project type (Kitchen or Bathroom)
2. GATHER scope details naturally - LET THE USER FINISH describing the project
3. ASK for dimensions when needed
4. COLLECT client details before generating quote
5. GENERATE quote only when you have enough info

## CRITICAL: BE PATIENT AND FLEXIBLE

**DO NOT repeatedly ask for the same thing.** If the user says "let me get through all of the project first" or continues describing scope, LISTEN AND ACCUMULATE the information. Only ask for dimensions ONCE, after they've finished describing the full scope.

**COMPLEX JOBS**: Contractors may describe complex work like:
- Moving walls, removing walls, enlarging openings
- Relocating bathroom entrances, closing off doorways
- Enlarging showers, relocating tubs
- Soffit removal, framing alcoves
- Closet modifications
- Custom/oversized vanities (100"+)

CAPTURE ALL OF THIS. These are critical for pricing. Do not dismiss or ignore structural work.

## CONVERSATION FLOW

**Step 1 - Identify Project Type**
If unclear, ask: "Is this a kitchen or bathroom project?"

**Step 2 - Understand Scope (Project-Specific)**

FOR BATHROOMS, understand:
- Demo level: full gut, shower only, cosmetic refresh
- Shower/tub: walk-in shower, tub-to-shower conversion, keep tub
- Tile: wall tile height (full height vs wainscot), floor tile areas
- Glass: frameless, framed, curtain
- Vanity: size or custom dimensions
- Toilet: replace, relocate, or keep
- Lighting: recessed cans, vanity light
- STRUCTURAL: wall changes, entrance changes, soffit removal
- PLUMBING RELOCATIONS: tub relocation, toilet relocation, drain changes
- CLOSETS: if mentioned, capture scope

FOR KITCHENS, understand:
- Demo level: full gut, partial, refresh
- Cabinets: new cabinets, reface, paint existing, none
- Countertops: new quartz, keep existing
- Backsplash: full height, standard 4", none
- Flooring: new tile/LVP, keep existing

**Step 3 - Get Dimensions**
Once scope is clear (user has finished describing), ask for dimensions:
- Kitchen: total sqft, countertop linear feet
- Bathroom: room size (LxW or sqft), shower size (LxW or sqft)

If user gives sqft instead of LxW, that's fine - use it.

**Step 4 - Get Client Details**
Before generating the final quote, ask for client information:
"Almost ready to build your quote! Can you give me the client details?
- Client name
- Phone number
- Email
- Property address (street, city, state, zip)"

This can be provided all at once or the contractor can skip with "skip" or "none".

## NATURAL LANGUAGE PARSING

Contractors speak in shorthand. Parse these correctly:
- "full demo tops and cabinets no floor" = full demo, new countertops, new cabinets, NO flooring
- "tile to ceiling" = wall tile from floor to ceiling (usually 8-9ft)
- "3x5 shower" = 3ft x 5ft shower = 15 sqft floor
- "48 vanity" = 48 inch vanity
- "150 inch vanity" or "150in vanity" = CUSTOM oversized vanity, very expensive
- "relocating tub 48 inches" = tub relocation (different from tub-to-shower conversion)
- "linear drain" = linear/trench drain in shower
- "removing soffits" = soffit removal (framing + drywall work)
- "enlarging entrance" = door/entrance expansion (framing work)
- "closing off doorway" = door closure (framing + drywall)
- "move entrance to perpendicular wall" = door relocation (major framing)

## DECISION RULES

**Generate estimate when you have:**
- Project type + demo level + main scope items + room size + client details (or skipped)

**Ask follow-up when missing:**
- Critical dimensions (room size, shower size) - but only ONCE
- Client details (unless skipped)

## RESPONSE STYLE

Keep questions SHORT and SPECIFIC. One question at a time.
If user is still describing the project, acknowledge what you've captured and wait for more.
Good: "Got it - I'll note the soffit removal and entrance relocation. Keep going!"
Bad: "I still need the room dimensions..." (when user said they'll provide them later)`;


serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, contractor_id, conversation_history } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Fetch pricing config for contractor
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

    // Step 2: First, analyze if we have enough info
    console.log("Analyzing conversation for completeness...");
    const analysisResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: conversationalSystemPrompt + `\n\nCURRENT CONTEXT: ${JSON.stringify(context || {})}` },
          ...conversationMessages
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_conversation",
            description: "Analyze the conversation to determine if we have enough info or need to ask more questions",
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
        console.log("AI service temporarily unavailable (503), returning friendly message");
        return new Response(JSON.stringify({
          needsMoreInfo: true,
          followUpQuestion: "I'm experiencing a brief hiccup. Please try sending your message again in a moment."
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

    // If we need more info, return the follow-up question
    if (analysis.action === "ask_question" || !analysis.has_enough_info) {
      return new Response(JSON.stringify({
        needsMoreInfo: true,
        followUpQuestion: analysis.follow_up_question || "Could you provide more details about the project?",
        parsed: {
          project_type: analysis.project_type,
          scope: analysis.parsed_scope,
          dimensions: analysis.parsed_dimensions,
          missing: analysis.missing_info
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 3: We have enough info - generate the estimate
    console.log("Generating estimate with full context...");
    
    const estimateSystemPrompt = `You are a construction estimator. Convert the conversation into a structured estimate.

MEASUREMENT RULES:
- Room floor sqft = length × width
- Shower floor sqft = shower_length × shower_width  
- Shower wall sqft = 2 × (shower_length + shower_width) × ceiling_height
- Default ceiling height: 8ft
- Cabinet linear feet estimation:
  - Small kitchen (<120 sqft): ~15-18 LF
  - Medium kitchen (120-200 sqft): ~20-25 LF
  - Large kitchen (200+ sqft): ~28-35 LF
  - This includes base + wall cabinets combined for pricing

TRADE BUCKET MAPPING:

**Demolition:** demo_shower_only (showers <20 sqft), demo_small_bath (<50 sqft), demo_large_bath (50+ sqft), demo_kitchen

**Plumbing:** 
- Plumbing - Shower Standard, Plumbing - Extra Head, Plumbing - Toilet Swap
- Plumbing - Tub to Shower, Plumbing - Freestanding Tub
- Plumbing - Reconnect (kitchen sink/dishwasher hookup) - unit: ea

**Tile:** Tile - Wall (sqft), Tile - Shower Floor (sqft), Tile - Main Floor (sqft)

**Support:** Waterproofing (=total tile sqft), Cement Board (=total tile sqft)

**Electrical:** 
- Electrical - Recessed Can (ea), Electrical - Vanity Light (ea)
- Electrical - Pendant Light (ea) - for kitchen island/bar pendants
- Electrical - Under Cabinet Lighting (ea) - LED strips/pucks
- Electrical - Kitchen Package (ea) - for comprehensive kitchen electrical

**Glass:** Glass - Shower Standard, Glass - Panel Only, Glass - 90 Return

**Vanity:** Vanity - 30in through Vanity - 84in

**Cabinets (CRITICAL - USE LINEAR FEET, NOT SQFT):**
- Cabinets - Kitchen (LF) - estimate linear feet based on kitchen size
- Example: 12x14 kitchen (168 sqft) ≈ 22-25 LF of cabinets

**Countertops:** Quartz - Countertop (sqft)

**Backsplash:** Backsplash - Tile (sqft)

**Framing:** Framing - Standard, Framing - Niche (ea)

**Paint:** Paint - Patch, Paint - Full Bath

MATERIAL ALLOWANCES (add to allowances array):
- Kitchen with new cabinets → include "Cabinet Materials" allowance
- Kitchen with countertops → include "Countertop Slab" allowance  
- Backsplash → include "Backsplash Tile Material" allowance
- Bathroom tile → include "Tile Material" allowance
- New sink → include "Sink" allowance
- New faucet → include "Faucet" allowance

INFERENCE:
- "Full gut" → Demo + all trades
- "Shower remodel" → Demo + plumbing + tile + waterproofing + cement board + glass
- "Tile to ceiling" or "full height" → Calculate full wall height (8ft)
- Always include waterproofing + cement board = total tile sqft
- "no floor" or "keep floor" → EXCLUDE floor tile from trade_buckets
- "new cabinets" → Cabinets trade bucket (LF) + Cabinet Materials allowance`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: estimateSystemPrompt },
          ...conversationMessages,
          { role: "user", content: `Based on the entire conversation above, generate the structured estimate. Use the parsed data: ${JSON.stringify(analysis.parsed_scope)} and dimensions: ${JSON.stringify(analysis.parsed_dimensions)}` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_estimate",
            description: "Generate a structured construction estimate",
            parameters: estimateJsonSchema
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_estimate" } }
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 503) {
        console.log("AI service temporarily unavailable (503) during estimate generation");
        return new Response(JSON.stringify({
          needsMoreInfo: true,
          followUpQuestion: "I'm experiencing a brief hiccup while generating your estimate. Please try again in a moment."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error(`AI error: ${status}`);
    }

    const aiData = await aiResponse.json();
    console.log("Estimate AI response received");

    // Extract tool call
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const estimateData = JSON.parse(toolCall.function.arguments) as EstimateData;
    
    // Validate with Zod
    const validated = EstimateSchema.safeParse(estimateData);
    if (!validated.success) {
      console.error("Validation failed:", validated.error.issues);
      return new Response(JSON.stringify({
        error: "Invalid AI response",
        needsMoreInfo: true,
        followUpQuestion: "I had trouble generating the estimate. Could you provide the room dimensions again?"
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Step 4: Calculate pricing
    console.log("Calculating pricing for", validated.data.trade_buckets.length, "trade buckets");
    const pricing = calculatePricing(validated.data.trade_buckets, pricingConfig);

    // Step 5: Combine results
    const result = {
      ...validated.data,
      pricing,
      payment_schedule: {
        deposit: Math.round(pricing.totals.total_cp * (Number(pricingConfig.payment_split_deposit) || 0.65)),
        progress: Math.round(pricing.totals.total_cp * (Number(pricingConfig.payment_split_progress) || 0.25)),
        final: Math.round(pricing.totals.total_cp * (Number(pricingConfig.payment_split_final) || 0.10)),
      },
      // Include client details from analysis
      client_details: analysis.parsed_client_details || {}
    };

    console.log("Final result - Total CP:", pricing.totals.total_cp, "Margin:", pricing.totals.overall_margin_percent.toFixed(1) + "%");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in calculate-estimate:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error",
      needsMoreInfo: true,
      followUpQuestion: "I had trouble processing that. What type of project is this - kitchen or bathroom?"
    }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
