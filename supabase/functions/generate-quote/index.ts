import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Conversation response schema
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
        scope_summary: { type: ["string", "null"] },
        dimensions: {
          type: "object",
          properties: {
            room_sqft: { type: ["number", "null"] },
            shower_dims: { type: ["string", "null"] },
            vanity_size: { type: ["string", "null"] },
            cabinet_lf: { type: ["number", "null"] },
            countertop_sqft: { type: ["number", "null"] }
          }
        }
      }
    }
  },
  required: ["action", "response_text"]
};

// Clean estimate output schema - CONSOLIDATED line items
const estimateSchema = {
  type: "object",
  properties: {
    project_type: { type: "string" },
    project_label: { type: "string" },
    trades: {
      type: "array",
      items: {
        type: "object",
        properties: {
          trade_name: { type: "string" },
          trade_order: { type: "number" },
          line_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                description: { type: "string" },
                internal_cost: { type: "number" },
                customer_price: { type: "number" }
              },
              required: ["description", "internal_cost", "customer_price"]
            }
          }
        },
        required: ["trade_name", "trade_order", "line_items"]
      }
    },
    notes: { type: "array", items: { type: "string" } }
  },
  required: ["project_type", "project_label", "trades"]
};

const conversationalSystemPrompt = `# ESTIMAITE - QUICK SCOPE ESTIMATOR

You're EstimAIte, a pro estimator for kitchen and bathroom remodels. You sound like an experienced contractor who knows exactly what to ask.

## YOUR STYLE
- Quick, conversational, confident
- Get the essentials, don't over-ask
- Sound like a colleague, not a robot
- 2-3 sentences max per response

## CONVERSATION FLOW

**Phase 1: Project Type** (if unclear)
"Kitchen or bathroom remodel?"

**Phase 2: Quick Scope**
"Tell me about the project - what's the vision? What's staying, what's going?"

**Phase 3: Key Measurements** (ask in ONE message)
For BATHROOM: "Quick specs: shower size, vanity size, and rough room sqft?"
For KITCHEN: "Quick specs: linear feet of cabinets and countertop sqft?"

**Phase 4: Generate** (once you have enough)
action: "generate_quote"

## WHAT YOU NEED BEFORE GENERATING

**BATHROOM - need 2 of these 3:**
- Shower dimensions (36x60, 48x72, etc.) OR "no shower work"
- Vanity size (36", 48", 60") OR "no vanity work"  
- Room sqft (for flooring scope)

**KITCHEN - need both:**
- Cabinet linear feet
- Countertop sqft

## SMART DEFAULTS (use when info is missing)
- Vanity not mentioned? Skip it.
- Shower not mentioned? Skip it.
- No room sqft? Use 75 for bathroom, 150 for kitchen.
- No countertop sqft? Calculate from cabinet LF × 2.2

## EXAMPLES

User: "bathroom remodel"
→ action: "ask_question"
→ "Got it. What's the scope - full gut, just the shower, vanity swap? What's the vision?"

User: "full gut, want to do a walk-in shower and new double vanity"
→ action: "ask_question"  
→ "Nice. Quick specs: what size shower and vanity? And roughly how big is the bathroom?"

User: "shower is about 4x5, 60 inch vanity, maybe 80sqft"
→ action: "generate_quote"
→ "Perfect - 4x5 shower, 60\" double vanity, 80sqft bathroom. Generating your estimate..."

User: "just swapping the vanity to a 48 inch"
→ action: "generate_quote"
→ "48\" vanity swap - includes demo, new vanity, countertop, plumbing. Generating now..."`;

const estimateSystemPrompt = `# ESTIMAITE - CLEAN ESTIMATE GENERATOR

Generate a SIMPLE, CLEAN estimate. This is NOT a contract - it's a scannable 1-2 page document.

## OUTPUT RULES

**CONSOLIDATE LINE ITEMS** - Max 2-5 items per trade. Roll details together.

BAD (too granular):
- Supply cement board - $400
- Install cement board - $300
- Waterproofing membrane - $500
- Wall tile labor - $2,000
- Wall tile material - $800
- Shower floor tile labor - $600
- Shower floor tile material - $300

GOOD (consolidated):
- Shower tile (walls, floor, bench) — approx. 225 sq ft - $4,900
  Includes waterproofing, cement board, all tile labor and materials

**LINE ITEM FORMAT:**
[Area/Item] — [brief description or qty] - $X,XXX

## TRADE ORDER

BATHROOM: Demo → Plumbing → Electrical → Framing & Drywall → Tile Work → Cabinetry & Countertops → Glass → Paint & Trim

KITCHEN: Demo → Cabinetry → Countertops → Plumbing → Electrical → Backsplash → Paint & Trim

## PRICING GUIDE (42% margin: CP = IC × 1.724)

**BATHROOM by complexity:**
| Trade | Simple | Standard | Complex |
|-------|--------|----------|---------|
| Demo | $800 | $1,500 | $3,500 |
| Plumbing | $1,500 | $3,000 | $5,000 |
| Electrical | $800 | $1,500 | $3,000 |
| Framing/Drywall | $500 | $1,500 | $4,000 |
| Tile | $2,500 | $5,000 | $12,000 |
| Cabinets/Counter | $2,000 | $4,000 | $8,500 |
| Glass | $800 | $1,500 | $2,500 |
| Paint/Trim | $600 | $1,200 | $2,500 |

**VANITY SWAP (targeted scope):**
- Demo old vanity: $300
- New vanity (48"): $2,800 / (60"): $3,200 / (72"): $3,800
- Countertop: $40-65/sqft
- Plumbing connections: $400-600
- Total typical: $4,000-6,500

**TUB-TO-SHOWER CONVERSION:**
- Demo: $1,200
- Plumbing conversion: $2,500
- Tile + waterproofing: $3,500-5,500
- Glass: $1,500-2,500
- Total typical: $9,000-12,500

**FULL GUT BATHROOM:**
- Small (50sqft): $18,000-25,000
- Standard (75sqft): $28,000-38,000
- Large (100+sqft): $45,000-65,000

## SCOPE MATCHING - BE PRECISE

Only include what's mentioned:
- "Vanity swap" → vanity, countertop, plumbing. NO shower, NO tile, NO paint.
- "Tub to shower" → demo, plumbing, tile, glass. NO vanity work, NO paint.
- "Full gut" → everything.

## NOTES TO INCLUDE
1. Estimate valid for 30 days
2. Permits not included unless noted
3. Final material selections to be confirmed`;

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
    
    const historyMessages = (conversation_history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content
    }));

    // Step 1: Determine if we have enough info
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
          ...historyMessages.slice(-6),
          { role: "user", content: message }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "respond",
              description: "Respond to the user - ask a quick clarifying question or generate the estimate.",
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

    // Step 2: Generate clean estimate
    console.log("Generating estimate...");
    
    const fullContext = historyMessages.map((m: { role: string; content: string }) => 
      `${m.role}: ${m.content}`
    ).join('\n');
    
    const estimatePrompt = `Generate a clean estimate for this project:

CONVERSATION:
${fullContext}
User: ${message}

PARSED SCOPE: ${JSON.stringify(parsedResponse.parsed_data || {})}

Remember: CONSOLIDATE line items (2-5 per trade max). Make it clean and scannable.`;

    const estimateResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: estimateSystemPrompt },
          { role: "user", content: estimatePrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_estimate",
              description: "Generate a clean, consolidated estimate with 2-5 line items per trade.",
              parameters: estimateSchema
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_estimate" } }
      }),
    });

    if (!estimateResponse.ok) {
      throw new Error(`Estimate generation failed: ${estimateResponse.status}`);
    }

    const estimateData = await estimateResponse.json();
    const estimateToolCall = estimateData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!estimateToolCall) {
      throw new Error("No estimate tool call in response");
    }

    let estimate;
    try {
      estimate = JSON.parse(estimateToolCall.function.arguments);
    } catch (e) {
      throw new Error("Invalid estimate JSON");
    }
    
    // Calculate totals
    let grandTotal = 0;
    let subtotalIC = 0;
    
    for (const trade of estimate.trades || []) {
      for (const item of trade.line_items || []) {
        grandTotal += item.customer_price || 0;
        subtotalIC += item.internal_cost || 0;
      }
    }
    
    // Build response in expected format
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
          type: estimate.project_type,
          label: estimate.project_label,
          areas: [{
            area_id: "main",
            area_name: estimate.project_label,
            trades: estimate.trades.map((t: any) => ({
              trade_id: t.trade_name.toLowerCase().replace(/\s+/g, '_'),
              trade_name: t.trade_name,
              trade_order: t.trade_order,
              line_items: t.line_items.map((item: any, idx: number) => ({
                item_id: `${t.trade_name.toLowerCase().replace(/\s+/g, '_')}_${idx}`,
                item_type: "lump_sum",
                description: item.description,
                internal_cost: item.internal_cost,
                customer_price: item.customer_price
              }))
            }))
          }]
        },
        totals: {
          subtotal_labor_materials: subtotalIC,
          grand_total: grandTotal
        },
        payment_schedule: {
          deposit: { percentage: 65, amount: Math.round(grandTotal * 0.65) },
          progress: { percentage: 25, amount: Math.round(grandTotal * 0.25) },
          final: { percentage: 10, amount: Math.round(grandTotal * 0.10) }
        },
        project_notes: (estimate.notes || []).map((note: string, idx: number) => ({
          note_number: idx + 1,
          text: note
        }))
      },
      // Flat pricing structure for consumption
      pricing: {
        total_ic: subtotalIC,
        total_cp: grandTotal,
        low_estimate: Math.round(grandTotal * 0.90),
        high_estimate: Math.round(grandTotal * 1.10),
        overall_margin_percent: subtotalIC > 0 ? ((grandTotal - subtotalIC) / grandTotal) * 100 : 42,
        line_items: estimate.trades.flatMap((trade: any) =>
          trade.line_items.map((item: any) => ({
            category: trade.trade_name,
            task_description: item.description,
            quantity: 1,
            unit: 'ea',
            ic_per_unit: item.internal_cost,
            cp_per_unit: item.customer_price,
            ic_total: item.internal_cost,
            cp_total: item.customer_price,
            margin_percent: item.internal_cost > 0 ? ((item.customer_price - item.internal_cost) / item.customer_price) * 100 : 42
          }))
        )
      },
      project_header: {
        project_type: estimate.project_type === 'bathroom_remodel' ? 'Bathroom' : 'Kitchen',
        project_label: estimate.project_label,
        overall_size_sqft: parsedResponse.parsed_data?.dimensions?.room_sqft || null
      }
    };
    
    console.log("Generated estimate total:", grandTotal);
    
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
