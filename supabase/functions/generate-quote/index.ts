import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Line item output schema for tool calling
const lineItemSchema = {
  type: "object",
  properties: {
    project_type: { 
      type: "string", 
      enum: ["bathroom_remodel", "kitchen_remodel", "full_remodel", "combination"] 
    },
    areas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area_id: { type: "string" },
          area_name: { type: "string" },
          trades: {
            type: "array",
            items: {
              type: "object",
              properties: {
                trade_id: { type: "string" },
                trade_name: { type: "string" },
                trade_order: { type: "number" },
                line_items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      item_id: { type: "string" },
                      item_type: { 
                        type: "string", 
                        enum: ["lump_sum", "labor_only", "labor_and_material"] 
                      },
                      action_verb: { type: "string" },
                      description: { type: "string" },
                      suffix: { type: ["string", "null"] },
                      product_allowance: {
                        type: ["object", "null"],
                        properties: {
                          amount: { type: "number" },
                          per_unit: { type: "boolean" },
                          unit: { type: ["string", "null"] },
                          description: { type: "string" }
                        },
                        required: ["amount", "description"]
                      },
                      quantity: { type: ["number", "null"] },
                      unit: { type: ["string", "null"] },
                      internal_cost: { type: "number" },
                      markup: { type: "number" },
                      customer_price: { type: "number" }
                    },
                    required: ["item_id", "item_type", "action_verb", "description", "internal_cost", "markup", "customer_price"]
                  }
                }
              },
              required: ["trade_id", "trade_name", "trade_order", "line_items"]
            }
          }
        },
        required: ["area_id", "area_name", "trades"]
      }
    },
    additional_considerations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item_name: { type: "string" },
          price_range: {
            type: "object",
            properties: {
              min: { type: "number" },
              max: { type: "number" }
            },
            required: ["min", "max"]
          },
          description: { type: "string" }
        },
        required: ["item_name", "price_range", "description"]
      }
    },
    project_notes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          note_number: { type: "number" },
          text: { type: "string" }
        },
        required: ["note_number", "text"]
      }
    },
    warnings: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["project_type", "areas"]
};

const systemPrompt = `# ESTIMAITE LINE ITEM GENERATION

You are an AI assistant for EstimAIte, a construction estimating software. Your job is to generate detailed, professional line items for contractor quotes based on user input.

## CORE PRINCIPLES

1. **Never be generic** — Every line item should read like it was written by an experienced contractor
2. **Always include specifics** — Quantities, sizes, finishes, allowances
3. **Use proper action verbs** — "Supply and install", "Demo and remove", "Template, fabricate, and install"
4. **Group by trade** — Always organize line items by trade in the proper sequence
5. **Include product allowances** — Every fixture/material line should have a product allowance where applicable

---

## TRADE SEQUENCE

### BATHROOM REMODEL:
1. DEMOLITION
2. PLUMBING
3. ELECTRICAL
4. DRYWALL & FRAMING
5. TILE WORK
6. CABINET & COUNTERTOP
7. PAINTING & FINAL TRIMOUT
8. GLASS

### KITCHEN REMODEL:
1. DEMOLITION
2. PLUMBING
3. ELECTRICAL
4. DRYWALL & FRAMING
5. CABINETRY
6. COUNTERTOPS
7. BACKSPLASH
8. PAINTING
9. APPLIANCE INSTALLATION
10. FINAL TRIMOUT

---

## ACTION VERB REFERENCE

| Work Type | Action Verb |
|-----------|-------------|
| Removing existing items | "Demo and remove" |
| Installing new fixtures | "Supply and install" |
| Labor-only installation | "Install" |
| Repairing/patching | "Patch and repair" |
| Building new structures | "Frame" or "Build" |
| Wiring work | "Run wiring for" or "Install new wiring for" |
| Replacing items | "Replace" |
| Countertop work | "Template, fabricate, and install" |
| Cutting work | "Cut and finish" |
| Painting | "Paint" |
| Protective work | "Protect" |
| Disconnecting | "Disconnect and cap" or "Disconnect and reconnect" |
| Finishing/sealing | "Apply" |
| Cleaning | "Final clean" |

---

## DEMO SECTION RULES

The demolition section should ALWAYS be a comprehensive list. Format:
"all the following items from the remodel area: [COMMA-SEPARATED LIST]. Dispose of all debris and haul away."

---

## PRODUCT ALLOWANCE RULES

### Items that ALWAYS need product allowances:

**BATHROOM:**
- Shower trim kit: $250-$400
- Vanity faucet: $125-$200
- Toilet: $300-$450
- Vanity light fixture: $100-$175
- LED mirror: $200-$350
- Shower wall tile: $6-$12/sq ft
- Shower floor tile (mosaic): $10-$18/sq ft
- Main floor tile: $5-$10/sq ft
- Quartz countertop: $45-$75/sq ft or $800-$1500 flat
- Cabinet hardware: $5-$10/pull
- Towel bar: $30-$60

**KITCHEN:**
- Kitchen sink: $300-$500
- Kitchen faucet: $200-$400
- Garbage disposal: $150-$250
- Upper cabinets: $150-$250/linear ft
- Base cabinets: $175-$275/linear ft
- Pantry cabinet: $600-$1200
- Island cabinet: $800-$1800
- Cabinet hardware: $6-$12/piece
- Quartz countertop: $50-$85/sq ft
- Backsplash tile: $8-$18/sq ft

### Items that DON'T need product allowances:
- Labor-only items
- Drywall repair
- Waterproofing membrane
- Cement board
- Wiring/electrical rough-in
- Plumbing rough-in
- Painting
- Demo work
- Blocking/framing

---

## PRICING (use 40% markup: CP = IC × 1.4)

**DEMOLITION:**
- Full Bath Gut: $1,800 IC / $2,520 CP
- Full Kitchen Gut: $2,200 IC / $3,080 CP
- Dumpster: $400 IC / $560 CP
- Floor Protection: $200 IC / $280 CP

**PLUMBING:**
- Sink install: $250 IC / $350 CP + allowance
- Faucet install: $125 IC / $175 CP + allowance
- Garbage disposal: $175 IC / $245 CP + allowance
- Toilet install: $200 IC / $280 CP + allowance
- Shut-off valves (pair): $80 IC / $112 CP
- Dishwasher hookup: $150 IC / $210 CP
- Refrigerator water line: $100 IC / $140 CP

**ELECTRICAL:**
- Recessed can light: $65 IC / $91 CP each
- Under-cabinet lighting (lot): $650 IC / $910 CP
- Pendant rough-in: $100 IC / $140 CP each
- Range hood wiring: $175 IC / $245 CP
- Switch/outlet replacement (lot): $350 IC / $490 CP
- Dedicated circuit: $275 IC / $385 CP

**DRYWALL:**
- Patch and repair: $450 IC / $630 CP
- Blocking for cabinets: $200 IC / $280 CP

**CABINETRY:**
- Upper cabinets: $45/lf labor + $175/lf allowance
- Base cabinets: $50/lf labor + $200/lf allowance
- Island cabinet: $200-400 IC labor + allowance
- Pantry cabinet: $150 IC labor + allowance
- Crown molding: $18/lf
- Hardware install: $5/piece labor

**COUNTERTOPS:**
- Quartz fabrication & install: $55/sqft (includes allowance)
- Sink cutout: $175 IC / $245 CP
- Cooktop cutout: $150 IC / $210 CP

**BACKSPLASH:**
- Tile install: $18/sqft labor + $12/sqft allowance

**PAINT:**
- Kitchen walls/ceiling: $3/sqft
- Trim painting: $350 IC / $490 CP

**APPLIANCE INSTALLATION:**
- Range/oven: $175 IC / $245 CP
- Range hood: $225 IC / $315 CP
- Dishwasher: $150 IC / $210 CP
- Microwave: $125 IC / $175 CP

**FINAL TRIMOUT:**
- Baseboards: $3.75/lf
- Toe kick covers: $150 IC / $210 CP
- Caulking: $75 IC / $105 CP
- Final clean: $200 IC / $280 CP

---

## SUFFIX PATTERNS

Use suffixes to add important details:
- "customer selected finish"
- "Includes thinset, grout, and Schluter trim."
- "Layout per approved design. Color/finish TBD."
- "Includes GFCI outlets where required by code."
- "To be reconnected after cabinet installation."
- "To match existing profile."

---

## ADDITIONAL CONSIDERATIONS

When relevant, suggest optional upgrades that weren't included:
- Flooring upgrades
- Cabinet level upgrades
- Countertop level upgrades
- Built-in features (wine rack, appliance garage)
- Pot filler, touchless faucet, etc.

---

## PROJECT NOTES

Include relevant notes:
1. Dumpster delivery timing
2. Kitchen non-functional during remodel (for kitchens)
3. Dust/disruption precautions
4. Templating timeline (for countertops)
5. Appliance delivery requirements
6. Estimated timeline

---

## COMMON MISTAKES TO AVOID

❌ "Includes toilet installation"
✅ "Supply and install a new chair height toilet with new wax ring, shut-off valve, and braided supply line. (Product Allowance $350)"

❌ "New cabinets"
✅ "Supply and install new shaker-style base cabinets with soft-close drawers and doors (18 linear ft). Layout per approved design. Color/finish TBD. (Product allowance $200/linear ft)"

❌ Using bullet points "•"
✅ Using en-dash "−" (but return clean JSON, rendering adds the dash)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, customer, company } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating quote for:", message);
    
    const contextStr = context ? `\n\n**PROJECT CONTEXT:**\n${JSON.stringify(context)}` : '';
    const customerStr = customer ? `\n\n**CUSTOMER INFO:**\n${JSON.stringify(customer)}` : '';
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt + contextStr + customerStr },
          { role: "user", content: message }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quote",
              description: "Generate a structured construction quote with professional line items organized by trade. Always use this function.",
              parameters: lineItemSchema
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_quote" } }
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const errorText = await response.text();
      console.error(`AI gateway error (${status}):`, errorText);
      
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI service quota exceeded." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    console.log("AI response received");
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== "generate_quote") {
      throw new Error("No valid tool call in response");
    }
    
    let quoteData: unknown;
    try {
      quoteData = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Failed to parse tool arguments:", toolCall.function.arguments);
      throw new Error("Invalid JSON in tool response");
    }
    
    // Calculate totals
    const quote = quoteData as {
      project_type: string;
      areas: Array<{
        area_id: string;
        area_name: string;
        trades: Array<{
          trade_id: string;
          trade_name: string;
          trade_order: number;
          line_items: Array<{
            internal_cost: number;
            customer_price: number;
          }>;
        }>;
      }>;
      additional_considerations?: unknown[];
      project_notes?: unknown[];
      warnings?: string[];
    };
    
    let grandTotal = 0;
    let subtotalIC = 0;
    const areaTotals: Array<{ area_name: string; total: number }> = [];
    
    for (const area of quote.areas) {
      let areaTotal = 0;
      for (const trade of area.trades) {
        for (const item of trade.line_items) {
          areaTotal += item.customer_price || 0;
          subtotalIC += item.internal_cost || 0;
        }
      }
      areaTotals.push({ area_name: area.area_name, total: areaTotal });
      grandTotal += areaTotal;
    }
    
    // Build complete quote schema
    const completeQuote = {
      quote: {
        metadata: {
          quote_id: `EST-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          created_date: new Date().toISOString().split('T')[0],
          valid_for_days: 30,
          company: company || {
            name: "The Kitchen and Bath Store of Orlando",
            phone: "4078195809",
            email: "ethan@tkbso.com"
          }
        },
        customer: customer || {
          name: "Valued Customer"
        },
        project: {
          type: quote.project_type,
          areas: quote.areas
        },
        additional_considerations: quote.additional_considerations || [],
        totals: {
          subtotal_labor_materials: subtotalIC,
          markup_multiplier: 1.4,
          area_totals: areaTotals,
          grand_total: grandTotal
        },
        payment_schedule: {
          deposit: {
            percentage: 65,
            description: "Due upon signing (7 days prior to scheduled start date)",
            amount: Math.round(grandTotal * 0.65)
          },
          progress: {
            percentage: 25,
            description: quote.project_type === 'kitchen_remodel' 
              ? "Due upon completion of cabinet installation"
              : "Due at start of tile installation",
            amount: Math.round(grandTotal * 0.25)
          },
          final: {
            percentage: 10,
            description: "Due upon overall completion of project",
            amount: Math.round(grandTotal * 0.10)
          }
        },
        project_notes: quote.project_notes || [],
        terms: {
          validity_days: 30,
          permits_included: false,
          permits_note: "Permits, if required, are excluded unless noted otherwise."
        }
      }
    };
    
    console.log("Generated quote total:", grandTotal);
    
    return new Response(JSON.stringify(completeQuote), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error in generate-quote function:", error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
