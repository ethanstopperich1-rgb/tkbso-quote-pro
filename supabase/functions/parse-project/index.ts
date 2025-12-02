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

**PROJECT COMPLEXITY LEVELS:**

1. **Simple Remodel** - Same footprint, fixture-for-fixture replacement
2. **Moderate Remodel** - Minor layout tweaks, adding niches/benches, upgrading fixtures
3. **Complex Renovation** - Moving walls, relocating plumbing, changing room layouts, structural modifications

**CRITICAL: DETECTING COMPLEX WORK**

Listen for these keywords/phrases that indicate complex structural work:
- "move the wall", "relocate wall", "remove wall", "open up", "knock down"
- "bigger shower", "enlarge shower", "expand bathroom", "make room larger"
- "move the tub", "relocate toilet", "move plumbing", "change layout"
- "move entrance", "relocate door", "new doorway", "close off door"
- "build out closet", "expand closet", "convert closet"
- "reconfigure", "completely gut", "down to studs", "start fresh"
- "add bathroom", "convert bedroom", "new bathroom where"

**CRITICAL MEASUREMENT RULES:**

1. **Bathroom Calculations:**
   - Room floor sqft = length × width
   - Shower floor sqft = shower_length × shower_width
   - Shower wall sqft = 2 × (shower_length + shower_width) × ceiling_height
   - Example: "5x8 bathroom with 3x5 shower at 8ft ceiling"
     → room: 40 sqft, shower floor: 15 sqft, shower walls: 128 sqft

2. **Always Extract:**
   - Ceiling height (default 8ft if not mentioned)
   - Room dimensions (length × width)
   - Shower dimensions separately from room
   - Fixture counts (lights, heads, niches)
   - WHETHER LAYOUT IS CHANGING (critical for pricing)

3. **Trade Bucket Mapping:**
   
   **Demolition:**
   - "demo_shower_only" → showers < 20 sqft, qty: 1
   - "demo_small_bath" → bathrooms < 50 sqft, qty: 1
   - "demo_large_bath" → bathrooms 50+ sqft, qty: 1
   - "demo_kitchen" → kitchens, qty: 1
   - "Dumpster + Haul Away" → all demo jobs, qty: 1
   
   **STRUCTURAL / FRAMING (Complex Work):**
   - "Framing - Wall Removal" → removing non-load-bearing wall, qty: per wall
   - "Framing - Wall Build" → building new wall, qty: linear feet
   - "Framing - Header Install" → opening in load-bearing wall, qty: 1 (add warning: needs engineer)
   - "Framing - Door Relocation" → moving/adding doorway, qty: per door
   - "Framing - Door Closure" → closing existing doorway, qty: per door
   - "Framing - Shower Enlarge" → expanding shower footprint, qty: 1
   - "Framing - Pony Wall" → half wall/knee wall, qty: linear feet
   - "Framing - Standard" → blocking/backing for fixtures, qty: 1
   - "Framing - Niche" → qty: each niche
   - "Framing - Bench" → shower bench framing, qty: each
   
   **PLUMBING (Including Relocations):**
   - "Plumbing - Shower Standard" → base shower rough-in (same location), qty: 1
   - "Plumbing - Shower Relocate" → moving shower to new location, qty: 1 (more expensive)
   - "Plumbing - Extra Head" → each additional head beyond 1, qty: count
   - "Plumbing - Toilet Swap" → toilet replacement same location, qty: count
   - "Plumbing - Toilet Relocate" → moving toilet to new location, qty: 1 (expensive - moving drain)
   - "Plumbing - Tub to Shower" → conversion, qty: 1
   - "Plumbing - Tub Relocate" → moving tub to new location, qty: 1
   - "Plumbing - Freestanding Tub" → freestanding tub install, qty: 1
   - "Plumbing - Vanity Relocate" → moving sink/vanity location, qty: 1
   - "Plumbing - Add Fixture" → adding new fixture location, qty: each
   - "Plumbing - Linear Drain" → linear/trench drain, qty: 1
   - "Plumbing - Smart Valve" → digital/smart shower system, qty: 1
   
   **Tile:**
   - "Tile - Wall" → shower/tub walls, qty: exact sqft
   - "Tile - Shower Floor" → shower pan area, qty: exact sqft
   - "Tile - Main Floor" → bathroom floor (minus shower), qty: exact sqft
   
   **Support Work:**
   - "Waterproofing" → qty: total tile sqft
   - "Cement Board" → qty: total tile sqft
   
   **Electrical (Including Modifications):**
   - "Electrical - Recessed Can" → qty: each light
   - "Electrical - Vanity Light" → qty: each fixture
   - "Electrical - Relocate Switch" → moving switch location, qty: each
   - "Electrical - Relocate Outlet" → moving outlet location, qty: each
   - "Electrical - Add Circuit" → new dedicated circuit, qty: each
   - "Electrical - GFCI" → GFCI outlet install, qty: each
   
   **Glass:**
   - "Glass - Shower Standard" → door + panel, qty: 1
   - "Glass - Panel Only" → fixed panel, qty: 1
   - "Glass - 90 Return" → corner enclosure, qty: 1
   
   **Vanity:**
   - "Vanity - 30in" through "Vanity - 84in", qty: 1
   - Include quartz countertop sqft if vanity mentioned
   
   **Paint:**
   - "Paint - Patch" → touch-up work, qty: 1
   - "Paint - Full Bath" → complete paint, qty: 1
   - "Paint - Full Room" → for major work affecting all walls, qty: 1
   
   **HVAC (if mentioned):**
   - "HVAC - Vent Relocate" → moving vent/register, qty: each
   - "HVAC - Add Exhaust Fan" → bathroom exhaust, qty: each
   
   **Drywall (for structural work):**
   - "Drywall - Patch" → small repairs, qty: sqft
   - "Drywall - New Wall" → full wall finishing, qty: sqft
   - "Drywall - Ceiling Repair" → ceiling work, qty: sqft

4. **Inference Rules:**
   - "Full gut remodel" → Demo + all trades
   - "Down to studs" → Full demo, likely framing work
   - "Shower remodel" → Demo + plumbing + tile + waterproofing + cement board + glass
   - "Move the [fixture]" → Add relocation trade bucket + structural warning
   - "Make shower bigger" → Framing - Shower Enlarge + possible wall work
   - "Open up the bathroom" → Wall removal + drywall + paint
   - "Convert tub to shower" → Tub to shower plumbing + demo + framing
   - "Move entrance" → Door relocation + framing + drywall + paint
   - "Tile to ceiling" → Calculate full wall height
   - No glass mentioned in shower → Still include if frameless/glass keywords present

5. **WARNINGS to Add:**
   When complex structural work is detected, add warnings:
   - Wall removal: "Wall removal detected - verify if load-bearing. May require structural engineer."
   - Plumbing relocation: "Plumbing relocation involves moving supply and drain lines. May require permit."
   - Door relocation: "Door relocation requires framing, drywall, and may affect HVAC."
   - Major layout change: "Major layout changes may require permit and inspections."

6. **Required Output:**
   Always populate:
   - project_header with type and size
   - dimensions with all calculated measurements
   - trade_buckets with EVERY applicable trade item (including structural/relocation work!)
   - allowances for fixtures/materials
   - exclusions for out-of-scope items
   - warnings for complex work that needs verification`;

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
