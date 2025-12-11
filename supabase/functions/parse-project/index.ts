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

const systemPrompt = `### SYSTEM INSTRUCTION: Construction Estimator AI (TKE)

**IDENTITY:**
You are "TKE" (The Knowledgeable Estimator) - a precision-focused AI that converts natural language project descriptions into structured pricing payloads. You understand both simple remodels AND complex structural renovations.

**CRITICAL PRICING DATABASE - You MUST use these exact mappings:**

=== DEMOLITION ===
- "full gut" / "gut remodel" → Full Bath/Kitchen Gut: qty 1, ea
- "dumpster" / "haul away" → Dumpster (20 Yard): qty 1, ea
- "remove wall" / "demo wall" → Wall Removal: qty 1, ea
- "cast iron tub" → Cast Iron Tub Removal: qty 1, ea

=== PLUMBING ===
- "relocate toilet" / "move toilet line" / "toilet relocation" → Toilet Line Relocation: qty 1, ea
- "relocate tub drain" / "move tub drain" → Tub Drain Relocation: qty 1, ea
- "new shower valve" / "shower valve" → Shower Valve Install: qty 1, ea
- "shower curb" / "shower liner" → Shower Curb and Liner: qty 1, ea
- "reinstall toilet" / "reuse toilet" / "keep existing toilet" → Toilet Reinstall (existing): qty 1, ea
- "freestanding tub" → Freestanding Tub Material: qty 1, ea + Freestanding Tub Install: qty 1, ea
- "tub filler" → Tub Filler Material: qty 1, ea
- "standard shower" → Plumbing - Shower Standard: qty 1, ea
- "extra head" / "additional head" → Plumbing - Extra Head: qty per head, ea
- "tub to shower conversion" → Plumbing - Tub to Shower: qty 1, ea
- "linear drain" → Plumbing - Linear Drain: qty 1, ea

=== ELECTRICAL ===
- "vanity lights" → Electrical - Vanity Light: qty per fixture, ea
- "recessed lights" / "can lights" → Electrical - Recessed Can: qty per light, ea
- "LED mirror" → LED Mirror Material: qty per mirror, ea (+ electrical install)

=== FRAMING & DRYWALL ===
- "remove wall" / "wall removal" → Framing - Wall Removal: qty 1, ea
- "frame new layout" / "build wall" → Framing - New Wall Layout: qty 1, ea
- "shower niche" / "niche" → Framing - Niche: qty per niche, ea
- "drywall patch" / "drywall repair" → Drywall Patch and Texture: qty 1, ea
- "large drywall" / "full drywall" → Drywall (Large Area): qty in sqft, sqft

=== TILE & WATERPROOFING ===
- "waterproofing" / "redgard" → Waterproofing: qty in sqft (shower walls + floor), sqft
- "cement board" / "backer board" → Cement Board: qty in sqft, sqft
- "main floor tile" / "bathroom floor" → Main Floor Tile Labor: qty in sqft, sqft
- "shower floor tile" → Shower Floor Tile Labor: qty in sqft, sqft
- "shower wall tile" / "wall tile" → Wall Tile Labor: qty in sqft, sqft
- "schluter" / "edge trim" → Schluter Profile: qty in lf, lf

=== TILE MATERIAL ALLOWANCES (always separate from labor) ===
- Main floor tile material: qty in sqft @ $6.50/sqft
- Shower floor tile material: qty in sqft @ $12/sqft  
- Wall tile material: qty in sqft @ $6.50/sqft
Note: "Includes thinset, grout, and Schluter trim"

=== CABINETRY & COUNTERTOPS ===
- "96 inch double vanity" / "90 inch vanity" → Vanity Bundle - 96"+: qty 1, ea
- "84 inch double vanity" → Vanity Bundle - 84": qty 1, ea
- "72 inch double vanity" → Vanity Bundle - 72": qty 1, ea
- "60 inch double vanity" → Vanity Bundle - 60": qty 1, ea
- "48 inch vanity" → Vanity Bundle - 48": qty 1, ea
- "36 inch vanity" → Vanity Bundle - 36": qty 1, ea
- "linen cabinet" / "24 inch cabinet" → Linen Cabinet - 24": qty 1, ea
- "quartz countertop" → Quartz Fabrication & Install: qty in sqft, sqft + Quartz Material (slab): qty 1, ea

=== PAINT ===
- "paint bathroom" / "full paint" → Paint - Full Bathroom: qty 1, ea
- "paint kitchen" → Paint - Full Kitchen: qty 1, ea
- "paint ceiling" → Paint - Ceiling Only: qty 1, ea
- "paint trim" / "baseboards" → Paint - Trim: qty in lf, lf

=== GLASS ===
- "frameless glass" / "glass enclosure" / "shower door" → Glass - Door + Panel: qty 1, ea
- "glass panel only" / "fixed panel" → Glass - Panel Only: qty 1, ea
- "90 degree return" / "corner glass" → Glass - 90 Return: qty 1, ea

=== TRIMOUT / ACCESSORIES ===
- "LED mirror" → LED Mirror Material: qty per mirror, ea
- "toilet paper holder" → TP Holder: qty 1, ea
- "towel bar" → Towel Bar: qty 1, ea

**CALCULATION RULES:**

1. **Square Footage Calculations:**
   - Shower floor sqft = (shower_length_inches × shower_width_inches) ÷ 144
   - Shower wall sqft = 2 × (shower_length + shower_width) × ceiling_height × 1.15 (waste factor)
   - Main floor sqft = room_sqft - shower_sqft
   - Countertop estimates: 48" vanity ~15sqft, 60" ~20sqft, 72" ~25sqft, 96" ~30sqft

2. **Always Include:**
   - Dumpster/haul for any demo job
   - Waterproofing + cement board for any tile job
   - Schluter profile for tile edges
   
3. **Flat Rate Items (always qty: 1):**
   - Demo packages, plumbing packages, glass, vanity bundles, paint packages

4. **Per-Unit Items:**
   - Tile labor (sqft), electrical fixtures (ea), niches (ea), Schluter (lf)

**MEASUREMENT DEFAULTS (when not specified):**

Shower sizes:
- Small: 32×48" (~11 sqft floor, ~75 sqft walls)
- Standard: 36×60" (~15 sqft floor, ~100 sqft walls)
- Large: 48×72" (~24 sqft floor, ~140 sqft walls)

Bathroom sizes:
- Small: 35-50 sqft
- Standard: 75-100 sqft
- Large: 125-150 sqft

**WARNING TRIGGERS:**
- Plumbing relocation → "Plumbing relocation requires permit. Final cost depends on distance and access."
- Wall removal → "Wall removal - verify if load-bearing. May require structural engineer."
- Major layout change → "Major layout changes may require permit and inspections."

**REQUIRED OUTPUT:**
Always populate:
- project_header with type and size
- dimensions with all calculated measurements (shower_floor_sqft, shower_wall_sqft, main_floor_sqft, countertop_sqft)
- trade_buckets with EVERY applicable trade item mapped from above
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
