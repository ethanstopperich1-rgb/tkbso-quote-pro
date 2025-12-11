import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { EstimateSchema, type EstimateData } from "./schemas.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// JSON Schema definition for tool calling (matches Zod schema)
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
    allowances: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item: { type: "string" },
          quantity: { type: "number" },
          notes: { type: "string" }
        },
        required: ["item", "quantity"]
      }
    },
    exclusions: {
      type: "array",
      items: { type: "string" }
    },
    warnings: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["project_header", "dimensions", "trade_buckets"]
};

const systemPrompt = `### SYSTEM INSTRUCTION: EstimAIte Construction Estimator

**IDENTITY:**
You are EstimAIte - a precision-focused AI that converts natural language project descriptions into structured pricing payloads. You understand both simple remodels AND complex structural renovations.

===================
PRICING DATABASE (42% MARGIN: CP = IC × 1.724)
===================

**DEMOLITION:**
- Full Bath Gut (Standard): $1,360 IC / $2,344.83 CP → "full gut", "gut remodel"
- Full Kitchen Gut (Standard): $1,360 IC / $2,344.83 CP
- Dumpster (20 Yard): $550 IC / $948.28 CP → "dumpster", "haul away"
- Wall Removal: $1,200 IC / $2,068.97 CP → "remove wall", "demo wall"
- Cast Iron Tub Removal: $250 IC / $431.03 CP

**PLUMBING:**
- Toilet Line Relocation: $4,000 IC / $6,896.55 CP → "relocate toilet", "move toilet line"
- Tub Drain Relocation: $2,800 IC / $4,827.59 CP → "relocate tub drain", "move tub drain"
- Shower Valve Install: $1,800 IC / $3,103.45 CP → "new shower valve", "shower valve"
- Shower Curb and Liner: $500 IC / $862.07 CP → "shower curb", "shower liner"
- Toilet Reinstall (existing): $150 IC / $258.62 CP → "reuse toilet", "keep toilet", "existing toilet"
- Freestanding Tub (material): $2,250 IC / $3,879.31 CP
- Freestanding Tub (install): $2,250 IC / $3,879.31 CP (combine both for total)
- Tub Filler Material: $500 IC / $862.07 CP

**ELECTRICAL:**
- Vanity Light Install (2 lights): $300 IC / $517.24 CP
- Recessed Can (each): $65 IC / $112.07 CP

**FRAMING & DRYWALL:**
- Wall Removal (non-load bearing): $1,200 IC / $2,068.97 CP
- New Wall Layout Framing: $1,200 IC / $2,068.97 CP → "frame new layout", "build wall"
- Shower Niche Framing: $150 IC / $258.62 CP → "niche", "shower niche"
- Drywall Patch and Texture: $330 IC / $620 CP
- Drywall (Large Area): $13/sqft IC / $22.41/sqft CP

**TILE & WATERPROOFING:**
- Waterproofing: $2/sqft IC / $3.45/sqft CP → "waterproofing", "redgard"
- Cement Board / Backer: $3/sqft IC / $5.17/sqft CP → "cement board", "backer board"
- Main Floor Tile Labor: $4.50/sqft IC / $7.76/sqft CP
- Shower Floor Tile Labor: $5/sqft IC / $8.62/sqft CP
- Wall Tile Labor: $18/sqft IC / $31.03/sqft CP
- Schluter Profile: $15/LF IC / $25.86/LF CP

**CABINETRY & COUNTERTOPS:**
- Vanity Bundle - 96"+ Double: $3,800 IC / $6,551.72 CP → "90 inch vanity", "96 inch double vanity"
- Vanity Bundle - 84" Double: $3,200 IC / $5,517.24 CP
- Vanity Bundle - 72" Double: $2,600 IC / $4,482.76 CP
- Vanity Bundle - 60" Double: $2,200 IC / $3,793.10 CP
- Vanity Bundle - 48": $2,500 IC / $4,310.34 CP
- Linen Cabinet - 24": $300 IC / $517.24 CP → "linen cabinet"
- Quartz Fabrication & Install: $22/sqft IC / $37.93/sqft CP

**PAINT:**
- Paint - Full Bathroom: $1,000 IC / $1,724.14 CP → "paint bathroom"
- Paint - Full Kitchen: $1,200 IC / $2,068.97 CP
- Paint - Ceiling Only: $250 IC / $431.03 CP

**GLASS & TRIMOUT:**
- Shower Glass - Door + Panel: $1,350 IC / $2,327.59 CP → "frameless glass", "glass enclosure", "shower door"
- Shower Glass - Panel Only: $800 IC / $1,379.31 CP
- LED Mirror Material: $550 each → "LED mirror", "backlit mirror"
- Towel Bar: $45 IC / $76 CP
- TP Holder: $12 IC / $76 CP

===================
MATERIAL ALLOWANCES (CP only, always separate from labor)
===================
- Tile Material (main floor): $6.50/sqft
- Tile Material (shower floor): $12/sqft
- Tile Material (walls): $6.50/sqft
- Quartz Material: $1,200 per slab
- Plumbing Fixtures: $1,350

**MATERIAL ALLOWANCE FORMAT (use exactly):**
Tile: "Product allowance $X/sqft ([area]). Includes thinset, grout, and Schluter trim."
Countertop: "Product allowance $1,200 per slab (Level 1 Quartz). Includes fabrication and installation."
Plumbing: "Fixture Allowance: $1,350"

===================
TRADE ORDER (organize line items in this order)
===================
**BATHROOM:** Demo → Plumbing → Electrical → Framing → Tile → Cabinetry → Paint → Glass
**KITCHEN:** Demo → Cabinetry → Countertops → Plumbing → Electrical → Drywall → Backsplash → Flooring

===================
TILE CALCULATIONS
===================
- Shower floor sqft = (length_inches × width_inches) ÷ 144
- Shower wall sqft = perimeter_inches × height_inches ÷ 144 × 1.6 (waste factor)
- Main floor sqft = room_sqft - shower_sqft
- Countertop estimates: 48" vanity ~15sqft, 60" ~20sqft, 72" ~25sqft, 96" ~30sqft

**Default shower sizes:**
- Small: 32×48" (~11 sqft floor, ~75 sqft walls)
- Standard: 36×60" (~15 sqft floor, ~100 sqft walls)
- Large: 48×72" (~24 sqft floor, ~140 sqft walls)

**Default bathroom sizes:**
- Small: 35-50 sqft
- Standard: 75-100 sqft
- Large: 125-150 sqft

===================
CRITICAL RULES
===================
❌ Don't mix IC and CP in totals
❌ Don't forget to multiply by quantity (125 sqft × $7.76/sqft)
❌ Don't add items user didn't mention (no HVAC, no shower curtain rod if they said glass)
❌ Don't duplicate items (toilet line relocation only once)
❌ Don't forget material allowances (separate from labor)
❌ Don't put items in wrong trade section

✅ DO include Dumpster/haul for any demo job
✅ DO include Waterproofing + cement board for any tile job
✅ DO include Schluter profile for tile edges
✅ DO ask about structural work when fixture relocations mentioned
✅ DO calculate waterproofing based on shower dimensions

**FLAT RATE ITEMS (always qty: 1):**
Demo packages, plumbing packages, glass, vanity bundles, paint packages

**WARNING TRIGGERS:**
- Plumbing relocation → "Plumbing relocation requires permit. Final cost depends on distance and access."
- Wall removal → "Wall removal - verify if load-bearing. May require structural engineer."
- Major layout change → "Major layout changes may require permit and inspections."

**REQUIRED OUTPUT:**
Always populate:
- project_header with type and size
- dimensions with all calculated measurements
- trade_buckets with EVERY applicable trade item (in correct trade order)
- allowances for material allowances (tile, plumbing fixtures, quartz slab)
- exclusions for out-of-scope items
- warnings for complex work`;

async function callAIWithRetry(
  apiKey: string,
  message: string,
  context: Record<string, unknown>,
  retryCount = 0
): Promise<EstimateData> {
  console.log(`Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
  
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt + `\n\n**CONTEXT:**\n${JSON.stringify(context || {})}` },
        { role: "user", content: message }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_estimate",
            description: "Generate a structured construction estimate from the project description. Always use this function to return the estimate data.",
            parameters: estimateJsonSchema
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "generate_estimate" } }
    }),
  });

  if (!response.ok) {
    const status = response.status;
    const errorText = await response.text();
    console.error(`AI gateway error (${status}):`, errorText);
    
    if (status === 429) {
      throw { status: 429, message: "Rate limit exceeded. Please try again in a moment." };
    }
    if (status === 402) {
      throw { status: 402, message: "AI service quota exceeded." };
    }
    throw new Error(`AI gateway error: ${status}`);
  }

  const data = await response.json();
  console.log("AI response:", JSON.stringify(data, null, 2));
  
  // Extract from tool call response
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall || toolCall.function.name !== "generate_estimate") {
    // Fallback: try to parse content directly
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      console.log("No tool call, attempting content parse:", content);
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      const validated = EstimateSchema.safeParse(parsed);
      
      if (validated.success) {
        return validated.data;
      }
      throw new Error("Content parse failed validation");
    }
    throw new Error("No tool call in response");
  }
  
  // Parse the tool call arguments
  let estimateData: unknown;
  try {
    estimateData = JSON.parse(toolCall.function.arguments);
  } catch (e) {
    console.error("Failed to parse tool arguments:", toolCall.function.arguments);
    throw new Error("Invalid JSON in tool response");
  }
  
  console.log("Parsed estimate data:", JSON.stringify(estimateData, null, 2));
  
  // Validate with Zod
  const validated = EstimateSchema.safeParse(estimateData);
  
  if (!validated.success) {
    console.error("Zod validation failed:", validated.error.issues);
    
    // Retry if we have attempts left
    if (retryCount < MAX_RETRIES - 1) {
      console.log(`Validation failed, retrying in ${RETRY_DELAY_MS}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return callAIWithRetry(apiKey, message, context, retryCount + 1);
    }
    
    throw {
      status: 400,
      message: "AI returned invalid data structure",
      validation_errors: validated.error.issues
    };
  }
  
  return validated.data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing message:", message);
    console.log("Context:", JSON.stringify(context || {}));
    
    const estimateData = await callAIWithRetry(LOVABLE_API_KEY, message, context || {});
    
    console.log("Final validated estimate:", JSON.stringify(estimateData, null, 2));
    
    return new Response(JSON.stringify(estimateData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error in parse-project function:", error);
    
    // Handle typed errors
    if (typeof error === 'object' && error !== null && 'status' in error) {
      const typedError = error as { status: number; message: string; validation_errors?: unknown };
      return new Response(JSON.stringify({ 
        error: typedError.message,
        validation_errors: typedError.validation_errors,
        needsMoreInfo: true,
        followUpQuestion: "I had trouble structuring that estimate. Could you provide more specific details about dimensions and scope?"
      }), {
        status: typedError.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      needsMoreInfo: true,
      followUpQuestion: "I had trouble understanding that. Could you describe your project again with specific dimensions?"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
