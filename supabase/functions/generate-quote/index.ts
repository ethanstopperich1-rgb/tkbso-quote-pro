import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Conversation response schema - for follow-up questions
const conversationSchema = {
  type: "object",
  properties: {
    action: { 
      type: "string", 
      enum: ["ask_question", "generate_quote"] 
    },
    response_text: { type: "string" },
    parsed_data: {
      type: "object",
      properties: {
        project_type: { type: ["string", "null"] },
        scope_items: { type: "array", items: { type: "string" } },
        dimensions: {
          type: "object",
          properties: {
            room_sqft: { type: ["number", "null"] },
            shower_sqft: { type: ["number", "null"] },
            vanity_size: { type: ["string", "null"] }
          }
        }
      }
    }
  },
  required: ["action", "response_text"]
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

const conversationalSystemPrompt = `# ESTIMAITE - PROFESSIONAL ESTIMATOR

You are EstimAIte, a knowledgeable AI estimator for kitchen and bathroom remodels. You sound like an expert contractor who knows exactly what questions to ask.

## CORE PRINCIPLE: GATHER KEY MEASUREMENTS, THEN QUOTE
You must collect the essential measurements before generating. This ensures accurate quotes.

## REQUIRED INFO BEFORE QUOTING

**For BATHROOM projects, you MUST know:**
1. Project type (bathroom) ✓
2. Scope (full gut, shower remodel, vanity swap, etc.)
3. Shower dimensions (e.g., 36x60, 48x72) OR confirm no shower work
4. Vanity size (24", 36", 48", 60", 72") OR confirm no vanity work
5. Room size in sqft (for flooring/paint) OR confirm not needed

**For KITCHEN projects, you MUST know:**
1. Project type (kitchen) ✓
2. Scope (full gut, cabinet refresh, countertops only, etc.)
3. Linear feet of cabinets
4. Countertop sqft

## SCOPE-SPECIFIC INCLUSIONS (be precise!)

**Tub-to-Shower Conversion includes:**
- Demo of existing tub
- Plumbing rough-in conversion
- New shower pan/waterproofing
- Wall tile, shower floor tile
- Glass enclosure
- Shower valve/trim
- Does NOT include: paint (unless bathroom is getting paint work), flooring (unless specified)

**Full Gut Bathroom includes:**
- All demo
- Plumbing, electrical
- Tile (walls, floor, shower)
- Vanity/countertop
- Paint
- Glass

**Vanity Swap includes:**
- Demo old vanity
- Install new vanity
- Countertop
- Plumbing connections
- Does NOT include: tile, shower work, paint (unless specified)

## CONVERSATION STYLE
- Be concise but thorough (2-3 sentences)
- Ask for the specific measurements you need
- Sound knowledgeable - you know what info matters
- Don't over-ask - if they give you shower size, don't ask again

## EXAMPLES

User: "bathroom remodel"
→ action: "ask_question"
→ response_text: "Got it - bathroom remodel. What's the scope? Full gut, shower remodel, or something more targeted like a vanity swap?"

User: "tub to shower conversion"
→ action: "ask_question"
→ response_text: "Tub to shower conversion - nice upgrade. What are the current tub dimensions? And what size vanity is in the bathroom?"

User: "full gut, shower is 36x60, 48 inch vanity, about 75sqft bathroom"
→ action: "generate_quote"
→ response_text: "Perfect - full gut with 36x60 shower, 48\" vanity, 75sqft bathroom. Generating your quote..."

User: "just swapping the vanity to a 60 inch double"
→ action: "generate_quote" (vanity swap doesn't need shower dimensions)
→ response_text: "60\" double vanity swap. I'll include demo, new vanity, countertop, and plumbing connections. Generating now..."`;

const quoteSystemPrompt = `# ESTIMAITE LINE ITEM GENERATION

You are generating a detailed construction quote. Output professional line items organized by trade.

## PRICING (42% margin: CP = IC × 1.724)

**DEMOLITION:**
- Full Bath Gut: $1,360 IC / $2,345 CP
- Full Kitchen Gut: $1,360 IC / $2,345 CP  
- Dumpster: $550 IC / $948 CP

**PLUMBING:**
- Shower Rough-In: $1,800 IC / $3,103 CP
- Toilet Install: $250 IC / $431 CP + allowance
- Vanity Connection: $350 IC / $603 CP
- Freestanding Tub: $1,250 IC / $2,155 CP

**ELECTRICAL:**
- Recessed Can: $65 IC / $112 CP each
- Vanity Light: $225 IC / $388 CP

**TILE:**
- Wall Tile: $18/sqft IC / $31/sqft CP
- Shower Floor: $16.50/sqft IC / $28/sqft CP
- Main Floor: $11.50/sqft IC / $20/sqft CP
- Waterproofing: $3.60/sqft IC / $6.20/sqft CP

**CABINETRY:**
- Vanity 48": $2,500 IC / $4,310 CP (bundle)
- Vanity 60": $2,800 IC / $4,828 CP (bundle)
- Vanity 72": $3,200 IC / $5,517 CP (bundle)

**COUNTERTOPS:**
- Quartz fab/install: $40 IC / $69 CP per sqft

**GLASS:**
- Frameless Door+Panel: $1,350 IC / $2,328 CP
- Panel Only: $800 IC / $1,379 CP

**PAINT:**
- Full Bathroom: $1,000 IC / $1,724 CP

## TRADE ORDER
BATHROOM: Demo → Plumbing → Electrical → Framing → Tile → Cabinetry → Paint → Glass
KITCHEN: Demo → Cabinetry → Countertops → Plumbing → Electrical → Backsplash → Paint`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, conversation_history, customer, company } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing message:", message);
    console.log("Context:", JSON.stringify(context || {}));
    
    // Build conversation messages for context
    const historyMessages = (conversation_history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content
    }));

    // Step 1: Conversational response - decide if we need more info or can generate quote
    const conversationResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: conversationalSystemPrompt },
          ...historyMessages.slice(-6), // Keep last 6 messages for context
          { role: "user", content: message }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "respond",
              description: "Respond to the user - either ask a clarifying question or indicate you're ready to generate a quote.",
              parameters: conversationSchema
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "respond" } }
      }),
    });

    if (!conversationResponse.ok) {
      const status = conversationResponse.status;
      const errorText = await conversationResponse.text();
      console.error(`AI gateway error (${status}):`, errorText);
      
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI quota exceeded" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const conversationData = await conversationResponse.json();
    const toolCall = conversationData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in conversation response");
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Failed to parse conversation response");
      throw new Error("Invalid response format");
    }

    console.log("Conversation action:", parsedResponse.action);

    // If we need more info, return a follow-up question
    if (parsedResponse.action === "ask_question") {
      return new Response(JSON.stringify({
        needsMoreInfo: true,
        followUpQuestion: parsedResponse.response_text,
        parsed: parsedResponse.parsed_data
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Generate the actual quote
    console.log("Generating quote...");
    
    // Combine all conversation context for quote generation
    const fullContext = historyMessages.map((m: { role: string; content: string }) => 
      `${m.role}: ${m.content}`
    ).join('\n');
    
    const quotePrompt = `Based on this conversation, generate a detailed quote:

${fullContext}
${message}

Project context: ${JSON.stringify(parsedResponse.parsed_data || {})}`;

    const quoteResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: quoteSystemPrompt },
          { role: "user", content: quotePrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quote",
              description: "Generate a structured construction quote with professional line items.",
              parameters: lineItemSchema
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_quote" } }
      }),
    });

    if (!quoteResponse.ok) {
      throw new Error(`Quote generation failed: ${quoteResponse.status}`);
    }

    const quoteData = await quoteResponse.json();
    const quoteToolCall = quoteData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!quoteToolCall) {
      throw new Error("No quote tool call in response");
    }

    let quote;
    try {
      quote = JSON.parse(quoteToolCall.function.arguments);
    } catch (e) {
      throw new Error("Invalid quote JSON");
    }
    
    // Calculate totals
    let grandTotal = 0;
    let subtotalIC = 0;
    const areaTotals: Array<{ area_name: string; total: number }> = [];
    
    for (const area of quote.areas || []) {
      let areaTotal = 0;
      for (const trade of area.trades || []) {
        for (const item of trade.line_items || []) {
          areaTotal += item.customer_price || 0;
          subtotalIC += item.internal_cost || 0;
        }
      }
      areaTotals.push({ area_name: area.area_name, total: areaTotal });
      grandTotal += areaTotal;
    }
    
    // Build complete quote response
    const completeQuote = {
      quote: {
        metadata: {
          quote_id: `EST-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          created_date: new Date().toISOString().split('T')[0],
          valid_for_days: 30,
          company: company || { name: "TKBSO" }
        },
        customer: customer || { name: "Valued Customer" },
        project: {
          type: quote.project_type,
          areas: quote.areas
        },
        additional_considerations: quote.additional_considerations || [],
        totals: {
          subtotal_labor_materials: subtotalIC,
          markup_multiplier: 1.724,
          area_totals: areaTotals,
          grand_total: grandTotal
        },
        payment_schedule: {
          deposit: { percentage: 65, amount: Math.round(grandTotal * 0.65) },
          progress: { percentage: 25, amount: Math.round(grandTotal * 0.25) },
          final: { percentage: 10, amount: Math.round(grandTotal * 0.10) }
        },
        project_notes: quote.project_notes || [],
        warnings: quote.warnings || []
      },
      // Also include flat pricing structure for easier consumption
      pricing: {
        total_ic: subtotalIC,
        total_cp: grandTotal,
        low_estimate: Math.round(grandTotal * 0.95),
        high_estimate: Math.round(grandTotal * 1.05),
        overall_margin_percent: subtotalIC > 0 ? ((grandTotal - subtotalIC) / grandTotal) * 100 : 42,
        line_items: (quote.areas || []).flatMap((area: any) => 
          (area.trades || []).flatMap((trade: any) =>
            (trade.line_items || []).map((item: any) => ({
              category: trade.trade_name,
              task_description: item.description,
              quantity: item.quantity || 1,
              unit: item.unit || 'ea',
              ic_per_unit: item.internal_cost,
              cp_per_unit: item.customer_price,
              ic_total: item.internal_cost,
              cp_total: item.customer_price,
              margin_percent: 42
            }))
          )
        )
      },
      project_header: {
        project_type: quote.project_type === 'bathroom_remodel' ? 'Bathroom' : 'Kitchen',
        overall_size_sqft: parsedResponse.parsed_data?.dimensions?.room_sqft || null
      }
    };
    
    console.log("Generated quote total:", grandTotal);
    
    return new Response(JSON.stringify(completeQuote), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error in generate-quote function:", error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      needsMoreInfo: true,
      followUpQuestion: "I had trouble with that. Could you describe your project? Is it a kitchen or bathroom?"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});