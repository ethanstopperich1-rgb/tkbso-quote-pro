import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main trade categories (parent buckets)
const TRADE_CATEGORIES = [
  'Demo', 'Framing', 'Plumbing', 'Electrical', 'Tile', 'Waterproofing', 
  'Glass', 'Vanity', 'Paint', 'Drywall', 'Cabinets', 'Countertop', 
  'Flooring', 'Structural', 'Materials', 'Other'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a line item parser for construction estimates. Parse the user's natural language into a structured line item.

CATEGORY MAPPING RULES (CRITICAL):
- Drain relocation, toilet relocation, tub relocation, shower rough-in, extra head, linear drain → "Plumbing"
- Pony wall, niche, blocking, framing → "Framing"  
- Wall removal, door relocation, door closure, soffit removal, entrance work → "Structural"
- Recessed can, vanity light, exhaust fan → "Electrical"
- Wall tile, floor tile, shower floor tile → "Tile"
- Shower glass, glass panel, mirror → "Glass"
- Vanity (any size) → "Vanity"
- Quartz, granite, countertop → "Countertop"
- Demo, dumpster, haul-off → "Demo"
- Paint, ceiling paint, touch-up → "Paint"
- Drywall, ceiling drywall, patch → "Drywall"
- LVP, floor leveling → "Flooring"
- Tile material, plumbing fixtures, allowances → "Materials"

Units: ea (each), sqft (square feet), lf (linear feet), hr (hour), ls (lump sum)

Examples:
- "drain relocation $1200" → category: Plumbing, description: "Drain Relocation", qty 1, ls, $1200 CP
- "pony wall $850" → category: Framing, description: "Pony Wall", qty 1, ea, $850 CP
- "demo for $1500" → category: Demo, description: "Full Demo", qty 1, ls, $1500 CP
- "tile wall 128 sqft at $39/sqft" → category: Tile, description: "Wall Tile", qty 128, sqft, $39/sqft CP
- "3 recessed cans at $110 each" → category: Electrical, description: "Recessed Cans", qty 3, ea, $110 CP
- "vanity 48 for $2600" → category: Vanity, description: "48\" Vanity Bundle", qty 1, ea, $2600 CP
- "waterproofing 64 sqft $13/sqft" → category: Waterproofing, description: "Shower Waterproofing", qty 64, sqft, $13/sqft CP
- "toilet relocation $950" → category: Plumbing, description: "Toilet Relocation", qty 1, ea, $950 CP
- "wall removal $2500" → category: Structural, description: "Wall Removal", qty 1, ea, $2500 CP

Parse the input and return a line item. If IC (internal cost) is not specified, estimate it at 60% of CP.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input }
        ],
        tools: [{
          type: "function",
          function: {
            name: "create_line_item",
            description: "Create a construction estimate line item",
            parameters: {
              type: "object",
              properties: {
                category: { 
                  type: "string", 
                  description: "The parent trade category",
                  enum: TRADE_CATEGORIES
                },
                task_description: { 
                  type: "string", 
                  description: "Specific description of the work (e.g., 'Drain Relocation', 'Pony Wall', '48\" Vanity')"
                },
                quantity: { 
                  type: "number", 
                  description: "Quantity of units"
                },
                unit: { 
                  type: "string", 
                  enum: ["ea", "sqft", "lf", "hr", "ls"],
                  description: "Unit of measurement"
                },
                ic_per_unit: { 
                  type: "number", 
                  description: "Internal cost per unit"
                },
                cp_per_unit: { 
                  type: "number", 
                  description: "Client price per unit"
                }
              },
              required: ["category", "task_description", "quantity", "unit", "cp_per_unit"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "create_line_item" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("Failed to parse line item");
    }

    const lineItem = JSON.parse(toolCall.function.arguments);
    
    // Default IC to 60% of CP if not provided
    if (!lineItem.ic_per_unit) {
      lineItem.ic_per_unit = Math.round(lineItem.cp_per_unit * 0.6 * 100) / 100;
    }

    console.log("Parsed line item:", lineItem);

    return new Response(JSON.stringify({ lineItem }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("parse-line-item error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
