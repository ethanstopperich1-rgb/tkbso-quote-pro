import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CATEGORIES = [
  'Demo', 'Dumpster/Haul', 'Wall Removal', 'New Wall', 'Door Relocation', 'Door Closure', 
  'Pocket Door', 'New Doorway', 'Soffit Removal', 'Entrance Enlargement', 'Shower Enlargement', 
  'Alcove/Built-In', 'Framing', 'Niche', 'Blocking', 'Plumbing', 'Drain Relocation', 
  'Toilet Relocation', 'Tub Relocation', 'Electrical', 'Recessed Can', 'Vanity Light', 
  'Exhaust Fan', 'Tile - Wall', 'Tile - Floor', 'Tile - Shower Floor', 'Waterproofing', 
  'Cement Board', 'Glass - Shower', 'Glass - Panel', 'Glass - 90° Return', 'Mirror', 
  'Cabinets', 'Vanity', 'Closet Shelving', 'Floating Shelves', 'Countertop - Quartz', 
  'Countertop - Granite', 'Countertop - Other', 'Paint', 'Drywall', 'Ceiling Work', 
  'Texture', 'Flooring - LVP', 'Flooring - Tile', 'Floor Leveling', 'Materials - Tile', 
  'Materials - Plumbing', 'Materials - Cabinets', 'Materials - Countertop', 
  'Materials - Flooring', 'Other', 'Management Fee', 'Post-Construction Clean'
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

Available categories: ${CATEGORIES.join(', ')}

Units: ea (each), sqft (square feet), lf (linear feet), hr (hour), ls (lump sum)

Examples:
- "add demo for $1500" → Demo, qty 1, ls, $1500 CP
- "tile wall 128 sqft at $39/sqft" → Tile - Wall, qty 128, sqft, $39/sqft CP
- "3 recessed cans at $110 each" → Recessed Can, qty 3, ea, $110 CP
- "vanity 48 for $2600" → Vanity, qty 1, ea, $2600 CP
- "waterproofing 64 sqft $13/sqft" → Waterproofing, qty 64, sqft, $13/sqft CP

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
                  description: "The trade category",
                  enum: CATEGORIES
                },
                task_description: { 
                  type: "string", 
                  description: "Brief description of the work"
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
