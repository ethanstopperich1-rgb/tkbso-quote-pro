import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Zod schema for AI output validation - AI only extracts, NO math
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
      trade_name: z.string(), // Maps to trade_buckets_config.trade_name
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

interface TradeBucketConfig {
  trade_name: string;
  display_name: string;
  unit: string;
  ic_per_unit: number;
  margin_percent: number;
  category: string;
}

interface PricingResult {
  trade_name: string;
  display_name: string;
  category: string;
  quantity: number;
  unit: string;
  ic_per_unit: number;
  ic_total: number;
  cp_total: number;
  margin_percent: number;
}

interface PricingConfig {
  min_job_cp?: number;
  min_job_ic?: number;
  low_range_multiplier?: number;
  high_range_multiplier?: number;
  payment_split_deposit?: number;
  payment_split_progress?: number;
  payment_split_final?: number;
}

// SANITY CHECK THRESHOLD: $320/sqft max
const SANITY_CHECK_THRESHOLD = 320;

/**
 * CORE CALCULATION: CP = IC × Quantity / (1 - Margin)
 * This is the unbreakable pricing formula
 */
function calculateCpFromIc(icPerUnit: number, quantity: number, margin: number): number {
  if (margin >= 1) margin = 0.38; // Fallback if margin is 100%+
  return (icPerUnit * quantity) / (1 - margin);
}

function calculatePricing(
  tradeBuckets: EstimateData['trade_buckets'],
  tradeBucketsConfig: TradeBucketConfig[],
  pricingConfig: PricingConfig,
  totalSqft: number
) {
  const lineItems: PricingResult[] = [];
  const warnings: string[] = [];

  // Build lookup map for O(1) access
  const configMap = new Map<string, TradeBucketConfig>();
  for (const config of tradeBucketsConfig) {
    configMap.set(config.trade_name, config);
  }

  // Process each trade bucket from AI
  for (const bucket of tradeBuckets) {
    const config = configMap.get(bucket.trade_name);

    if (!config) {
      warnings.push(`No pricing config found for trade: ${bucket.trade_name}`);
      continue;
    }

    const icTotal = config.ic_per_unit * bucket.quantity;
    const cpTotal = calculateCpFromIc(config.ic_per_unit, bucket.quantity, config.margin_percent);
    
    lineItems.push({
      trade_name: bucket.trade_name,
      display_name: config.display_name,
      category: config.category,
      quantity: bucket.quantity,
      unit: bucket.unit || config.unit,
      ic_per_unit: config.ic_per_unit,
      ic_total: Math.round(icTotal * 100) / 100,
      cp_total: Math.round(cpTotal * 100) / 100,
      margin_percent: Math.round(config.margin_percent * 100),
    });
  }

  // Calculate totals
  const totalIc = lineItems.reduce((sum, item) => sum + item.ic_total, 0);
  const totalCp = lineItems.reduce((sum, item) => sum + item.cp_total, 0);
  const overallMargin = totalCp > 0 ? ((totalCp - totalIc) / totalCp) * 100 : 0;

  // Apply minimum job pricing
  const minJobCp = pricingConfig.min_job_cp || 15000;
  const minJobIc = pricingConfig.min_job_ic || 10500;

  let finalTotalCp = totalCp;
  let finalTotalIc = totalIc;
  let appliedMinJob = false;

  if (totalCp < minJobCp) {
    finalTotalCp = minJobCp;
    finalTotalIc = Math.max(totalIc, minJobIc);
    appliedMinJob = true;
    warnings.push(`Applied minimum job pricing: $${minJobCp.toLocaleString()}`);
  }

  // SANITY CHECK: Total CP / sqft must not exceed $320
  let sanityCheckFailed = false;
  let pricePerSqft = 0;
  
  if (totalSqft > 0) {
    pricePerSqft = finalTotalCp / totalSqft;
    if (pricePerSqft > SANITY_CHECK_THRESHOLD) {
      sanityCheckFailed = true;
      warnings.push(`⚠️ SANITY CHECK FAILED: Price exceeds $${SANITY_CHECK_THRESHOLD}/sqft threshold (calculated: $${pricePerSqft.toFixed(0)}/sqft). REVIEW LINE ITEMS.`);
    }
  }

  // Calculate range
  const lowMultiplier = pricingConfig.low_range_multiplier || 0.95;
  const highMultiplier = pricingConfig.high_range_multiplier || 1.05;

  return {
    line_items: lineItems,
    totals: {
      total_ic: Math.round(finalTotalIc),
      total_cp: Math.round(finalTotalCp),
      low_estimate: Math.round(finalTotalCp * lowMultiplier),
      high_estimate: Math.round(finalTotalCp * highMultiplier),
      overall_margin_percent: Math.round(overallMargin * 10) / 10,
      price_per_sqft: Math.round(pricePerSqft),
      applied_min_job: appliedMinJob,
    },
    sanity_check: {
      passed: !sanityCheckFailed,
      threshold: SANITY_CHECK_THRESHOLD,
      calculated_per_sqft: Math.round(pricePerSqft),
      total_sqft: totalSqft,
    },
    warnings,
  };
}

// JSON Schema for tool calling - AI extracts trade_name, quantity, unit ONLY
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
          trade_name: { type: "string", description: "Must match exactly: demo_shower_only, demo_small_bath, demo_large_bath, demo_kitchen, dumpster_bath, dumpster_kitchen, framing_standard, framing_niche, framing_pony_wall, tile_wall, tile_shower_floor, tile_main_floor, waterproofing, cement_board, floor_leveling, plumbing_shower_standard, plumbing_extra_head, plumbing_toilet, plumbing_tub_to_shower, plumbing_freestanding_tub, plumbing_linear_drain, plumbing_smart_valve, electrical_recessed_can, electrical_vanity_light, electrical_small_package, electrical_kitchen_package, paint_patch, paint_full_bath, glass_shower_standard, glass_panel_only, glass_90_return, vanity_30, vanity_36, vanity_48, vanity_54, vanity_60, vanity_72, vanity_84, quartz_countertop" },
          quantity: { type: "number" },
          unit: { type: "string", enum: ["sqft", "ea", "lf"] }
        },
        required: ["trade_name", "quantity", "unit"]
      }
    },
    allowances: { type: "array", items: { type: "object", properties: { item: { type: "string" }, quantity: { type: "number" }, notes: { type: "string" } }, required: ["item", "quantity"] } },
    exclusions: { type: "array", items: { type: "string" } },
    warnings: { type: "array", items: { type: "string" } }
  },
  required: ["project_header", "dimensions", "trade_buckets"]
};

// System prompt - AI does NO math, only extraction
const systemPrompt = `### SYSTEM: Construction Estimator AI (TKE)

You EXTRACT structured data from natural language project descriptions. You do NO pricing math - that happens in code.

**YOUR ONLY JOB**: Extract trade_name, quantity, and unit for each task.

**VALID TRADE NAMES** (use EXACTLY these values):
- demo_shower_only, demo_small_bath, demo_large_bath, demo_kitchen
- dumpster_bath, dumpster_kitchen  
- framing_standard, framing_niche, framing_pony_wall
- tile_wall (sqft), tile_shower_floor (sqft), tile_main_floor (sqft)
- waterproofing (sqft), cement_board (sqft), floor_leveling (ea)
- plumbing_shower_standard, plumbing_extra_head, plumbing_toilet, plumbing_tub_to_shower, plumbing_freestanding_tub, plumbing_linear_drain, plumbing_smart_valve
- electrical_recessed_can (ea), electrical_vanity_light (ea), electrical_small_package, electrical_kitchen_package
- paint_patch, paint_full_bath
- glass_shower_standard, glass_panel_only, glass_90_return
- vanity_30, vanity_36, vanity_48, vanity_54, vanity_60, vanity_72, vanity_84
- quartz_countertop (sqft)

**MEASUREMENT RULES (for dimensions + sqft calculations):**
- Room floor sqft = room_length × room_width
- Shower floor sqft = shower_length × shower_width  
- Shower wall sqft = 2 × (shower_length + shower_width) × ceiling_height
- Main floor sqft = room_floor_sqft - shower_floor_sqft
- Default ceiling height: 8ft
- Waterproofing sqft = tile_wall_sqft + tile_shower_floor_sqft
- Cement board sqft = tile_wall_sqft + tile_shower_floor_sqft

**SCOPE INFERENCE:**
- "Full gut" → Demo + all typical trades for room type
- "Shower remodel" → demo_shower_only + plumbing_shower_standard + tile_wall + tile_shower_floor + waterproofing + cement_board + glass
- "48in vanity" → vanity_48
- Always include waterproofing and cement_board when there's tile work
- Include dumpster_bath or dumpster_kitchen for demolition jobs

**DEMO SIZE RULES:**
- Shower only (<20 sqft room or "shower remodel") → demo_shower_only
- Small bath (<50 sqft) → demo_small_bath
- Large bath (50+ sqft) → demo_large_bath

IMPORTANT: Output trade_name values EXACTLY as listed above. Code will match these to database.`;

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

    // Step 1: Fetch trade buckets config for contractor
    console.log("Fetching trade_buckets_config for contractor:", contractor_id);
    const { data: tradeBucketsConfig, error: bucketsError } = await supabase
      .from('trade_buckets_config')
      .select('trade_name, display_name, unit, ic_per_unit, margin_percent, category')
      .eq('contractor_id', contractor_id)
      .eq('is_active', true);

    if (bucketsError) {
      console.error("Error fetching trade buckets config:", bucketsError);
      throw new Error("Failed to fetch trade buckets configuration");
    }

    if (!tradeBucketsConfig || tradeBucketsConfig.length === 0) {
      throw new Error("No trade buckets configured for this contractor");
    }

    // Step 2: Fetch pricing config for min job, payment splits
    const { data: pricingConfig, error: configError } = await supabase
      .from('pricing_configs')
      .select('min_job_cp, min_job_ic, low_range_multiplier, high_range_multiplier, payment_split_deposit, payment_split_progress, payment_split_final')
      .eq('contractor_id', contractor_id)
      .single();

    if (configError) {
      console.error("Error fetching pricing config:", configError);
    }

    // Step 3: Call AI to extract structured data (NO PRICING MATH)
    console.log("Calling AI for data extraction:", message);
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
            description: "Extract structured construction estimate data",
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
    console.log("AI extraction complete");

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

    // Calculate total sqft for sanity check
    const dims = validated.data.dimensions;
    const roomSqft = (dims.room_length_ft && dims.room_width_ft) 
      ? dims.room_length_ft * dims.room_width_ft 
      : validated.data.project_header.overall_size_sqft || 0;
    const totalSqft = roomSqft || (dims.main_floor_sqft || 0) + (dims.shower_floor_sqft || 0);

    // Step 4: Calculate pricing using database-driven rates
    console.log("Calculating pricing for", validated.data.trade_buckets.length, "trade buckets, total sqft:", totalSqft);
    const pricing = calculatePricing(
      validated.data.trade_buckets, 
      tradeBucketsConfig as TradeBucketConfig[],
      pricingConfig || {},
      totalSqft
    );

    // Step 5: Build payment schedule
    const paymentSchedule = {
      deposit: Math.round(pricing.totals.total_cp * (pricingConfig?.payment_split_deposit || 0.65)),
      progress: Math.round(pricing.totals.total_cp * (pricingConfig?.payment_split_progress || 0.25)),
      final: Math.round(pricing.totals.total_cp * (pricingConfig?.payment_split_final || 0.10)),
    };

    // Step 6: Combine results
    const result = {
      ...validated.data,
      pricing,
      payment_schedule: paymentSchedule,
    };

    console.log("Final result - Total CP:", pricing.totals.total_cp, 
      "Margin:", pricing.totals.overall_margin_percent + "%",
      "$/sqft:", pricing.totals.price_per_sqft,
      "Sanity check:", pricing.sanity_check.passed ? "PASSED" : "FAILED");

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
