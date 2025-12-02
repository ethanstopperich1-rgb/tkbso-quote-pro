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
function mapCategoryToPricing(
  category: string,
  taskDescription: string,
  config: PricingConfig
): { ic: number; cp: number; unit: string } | null {
  const categoryLower = category.toLowerCase();
  const taskLower = taskDescription.toLowerCase();

  // Demolition
  if (categoryLower.includes('demo')) {
    if (taskLower.includes('shower') && taskLower.includes('only')) {
      return { ic: Number(config.demo_shower_only_ic) || 900, cp: Number(config.demo_shower_only_cp) || 1450, unit: 'ea' };
    } else if (taskLower.includes('small')) {
      return { ic: Number(config.demo_small_bath_ic) || 1300, cp: Number(config.demo_small_bath_cp) || 2050, unit: 'ea' };
    } else if (taskLower.includes('large')) {
      return { ic: Number(config.demo_large_bath_ic) || 1650, cp: Number(config.demo_large_bath_cp) || 2500, unit: 'ea' };
    } else if (taskLower.includes('kitchen')) {
      return { ic: Number(config.demo_kitchen_ic) || 1750, cp: Number(config.demo_kitchen_cp) || 2800, unit: 'ea' };
    }
    return { ic: Number(config.demo_small_bath_ic) || 1300, cp: Number(config.demo_small_bath_cp) || 2050, unit: 'ea' };
  }

  // Plumbing
  if (categoryLower.includes('plumb')) {
    if (taskLower.includes('toilet') && !taskLower.includes('relocation')) {
      return { ic: Number(config.plumbing_toilet_ic) || 350, cp: Number(config.plumbing_toilet_cp) || 690, unit: 'ea' };
    } else if (taskLower.includes('shower') && taskLower.includes('standard')) {
      return { ic: Number(config.plumbing_shower_standard_ic) || 2225, cp: Number(config.plumbing_shower_standard_cp) || 3425, unit: 'ea' };
    } else if (taskLower.includes('extra head') || taskLower.includes('additional head')) {
      return { ic: Number(config.plumbing_extra_head_ic) || 625, cp: Number(config.plumbing_extra_head_cp) || 1100, unit: 'ea' };
    } else if (taskLower.includes('freestanding')) {
      return { ic: Number(config.plumbing_tub_freestanding_ic) || 3300, cp: Number(config.plumbing_tub_freestanding_cp) || 4800, unit: 'ea' };
    } else if (taskLower.includes('tub to shower') || taskLower.includes('conversion')) {
      return { ic: Number(config.plumbing_tub_to_shower_ic) || 2550, cp: Number(config.plumbing_tub_to_shower_cp) || 4200, unit: 'ea' };
    } else if (taskLower.includes('linear drain')) {
      return { ic: Number(config.plumbing_linear_drain_ic) || 750, cp: Number(config.plumbing_linear_drain_cp) || 1550, unit: 'ea' };
    } else if (taskLower.includes('smart valve')) {
      return { ic: Number(config.plumbing_smart_valve_ic) || 1350, cp: Number(config.plumbing_smart_valve_cp) || 2450, unit: 'ea' };
    }
    return { ic: Number(config.plumbing_shower_standard_ic) || 2225, cp: Number(config.plumbing_shower_standard_cp) || 3425, unit: 'ea' };
  }

  // Tile
  if (categoryLower.includes('tile')) {
    if (taskLower.includes('wall')) {
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
    } else if (taskLower.includes('kitchen')) {
      return { ic: Number(config.electrical_kitchen_package_ic) || 950, cp: Number(config.electrical_kitchen_package_cp) || 1750, unit: 'ea' };
    }
    return { ic: Number(config.electrical_small_package_ic) || 250, cp: Number(config.electrical_small_package_cp) || 400, unit: 'ea' };
  }

  // Framing
  if (categoryLower.includes('fram')) {
    if (taskLower.includes('niche')) {
      return { ic: Number(config.niche_ic_each) || 300, cp: Number(config.niche_cp_each) || 550, unit: 'ea' };
    } else if (taskLower.includes('pony wall')) {
      return { ic: Number(config.framing_pony_wall_ic) || 450, cp: Number(config.framing_pony_wall_cp) || 850, unit: 'ea' };
    }
    return { ic: Number(config.framing_standard_ic) || 550, cp: Number(config.framing_standard_cp) || 1200, unit: 'ea' };
  }

  // Glass
  if (categoryLower.includes('glass')) {
    if (taskLower.includes('90') || taskLower.includes('return')) {
      return { ic: Number(config.glass_90_return_ic) || 1425, cp: Number(config.glass_90_return_cp) || 2775, unit: 'ea' };
    } else if (taskLower.includes('panel only')) {
      return { ic: Number(config.glass_panel_only_ic) || 800, cp: Number(config.glass_panel_only_cp) || 1450, unit: 'ea' };
    }
    return { ic: Number(config.glass_shower_standard_ic) || 1200, cp: Number(config.glass_shower_standard_cp) || 2100, unit: 'ea' };
  }

  // Paint
  if (categoryLower.includes('paint')) {
    if (taskLower.includes('full')) {
      return { ic: Number(config.paint_full_bath_ic) || 1200, cp: Number(config.paint_full_bath_cp) || 1900, unit: 'ea' };
    }
    return { ic: Number(config.paint_patch_bath_ic) || 800, cp: Number(config.paint_patch_bath_cp) || 1000, unit: 'ea' };
  }

  // Vanity
  if (categoryLower.includes('vanity')) {
    if (taskLower.includes('30')) {
      return { ic: Number(config.vanity_30_bundle_ic) || 1100, cp: Number(config.vanity_30_bundle_cp) || 1800, unit: 'ea' };
    } else if (taskLower.includes('36')) {
      return { ic: Number(config.vanity_36_bundle_ic) || 1300, cp: Number(config.vanity_36_bundle_cp) || 2100, unit: 'ea' };
    } else if (taskLower.includes('48')) {
      return { ic: Number(config.vanity_48_bundle_ic) || 1600, cp: Number(config.vanity_48_bundle_cp) || 2600, unit: 'ea' };
    } else if (taskLower.includes('54')) {
      return { ic: Number(config.vanity_54_bundle_ic) || 1900, cp: Number(config.vanity_54_bundle_cp) || 3000, unit: 'ea' };
    } else if (taskLower.includes('60')) {
      return { ic: Number(config.vanity_60_bundle_ic) || 2200, cp: Number(config.vanity_60_bundle_cp) || 3500, unit: 'ea' };
    } else if (taskLower.includes('72')) {
      return { ic: Number(config.vanity_72_bundle_ic) || 2600, cp: Number(config.vanity_72_bundle_cp) || 4200, unit: 'ea' };
    } else if (taskLower.includes('84')) {
      return { ic: Number(config.vanity_84_bundle_ic) || 3200, cp: Number(config.vanity_84_bundle_cp) || 5000, unit: 'ea' };
    }
    return { ic: Number(config.vanity_48_bundle_ic) || 1600, cp: Number(config.vanity_48_bundle_cp) || 2600, unit: 'ea' };
  }

  // Quartz/Countertops
  if (categoryLower.includes('quartz') || categoryLower.includes('countertop')) {
    return { ic: Number(config.quartz_ic_per_sqft) || 15, cp: Number(config.quartz_cp_per_sqft) || 50, unit: 'sqft' };
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

    const icTotal = mapping.ic * bucket.quantity;
    const cpTotal = mapping.cp * bucket.quantity;
    const marginPercent = cpTotal > 0 ? ((cpTotal - icTotal) / cpTotal) * 100 : 0;

    lineItems.push({
      category: bucket.category,
      task_description: bucket.task_description,
      quantity: bucket.quantity,
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

const systemPrompt = `### SYSTEM: Construction Estimator AI (TKE)

You convert natural language project descriptions into structured pricing payloads.

**MEASUREMENT RULES:**
- Room floor sqft = length × width
- Shower floor sqft = shower_length × shower_width  
- Shower wall sqft = 2 × (shower_length + shower_width) × ceiling_height
- Default ceiling height: 8ft

**TRADE BUCKET MAPPING:**

**Demolition:** demo_shower_only (showers <20 sqft), demo_small_bath (<50 sqft), demo_large_bath (50+ sqft), demo_kitchen

**Plumbing:** Plumbing - Shower Standard, Plumbing - Extra Head, Plumbing - Toilet Swap, Plumbing - Tub to Shower, Plumbing - Freestanding Tub

**Tile:** Tile - Wall (sqft), Tile - Shower Floor (sqft), Tile - Main Floor (sqft)

**Support:** Waterproofing (=total tile sqft), Cement Board (=total tile sqft)

**Electrical:** Electrical - Recessed Can (ea), Electrical - Vanity Light (ea)

**Glass:** Glass - Shower Standard, Glass - Panel Only, Glass - 90 Return

**Vanity:** Vanity - 30in through Vanity - 84in

**Framing:** Framing - Standard, Framing - Niche (ea)

**Paint:** Paint - Patch, Paint - Full Bath

**INFERENCE:**
- "Full gut" → Demo + all trades
- "Shower remodel" → Demo + plumbing + tile + waterproofing + cement board + glass
- "Tile to ceiling" → Calculate full wall height
- Always include waterproofing + cement board = total tile sqft`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, contractor_id } = await req.json();
    
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

    // Step 2: Call AI to parse project description
    console.log("Calling AI with message:", message);
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt + `\n\nCONTEXT: ${JSON.stringify(context || {})}` },
          { role: "user", content: message }
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
      throw new Error(`AI error: ${status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");

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
        followUpQuestion: "Could you provide more details about dimensions and scope?"
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Step 3: Calculate pricing
    console.log("Calculating pricing for", validated.data.trade_buckets.length, "trade buckets");
    const pricing = calculatePricing(validated.data.trade_buckets, pricingConfig);

    // Step 4: Combine results
    const result = {
      ...validated.data,
      pricing,
      payment_schedule: {
        deposit: Math.round(pricing.totals.total_cp * (Number(pricingConfig.payment_split_deposit) || 0.65)),
        progress: Math.round(pricing.totals.total_cp * (Number(pricingConfig.payment_split_progress) || 0.25)),
        final: Math.round(pricing.totals.total_cp * (Number(pricingConfig.payment_split_final) || 0.10)),
      }
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
      followUpQuestion: "I had trouble processing that. Could you describe the project again?"
    }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
