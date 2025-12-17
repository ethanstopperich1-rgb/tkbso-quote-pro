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
        size_category: { type: ["string", "null"], enum: ["small", "standard", "large", "complex", null] },
        scope_summary: { type: ["string", "null"] },
        dimensions: {
          type: "object",
          properties: {
            room_sqft: { type: ["number", "null"] },
            shower_dims: { type: ["string", "null"] },
            shower_sqft: { type: ["number", "null"] },
            vanity_size: { type: ["string", "null"] },
            cabinet_lf: { type: ["number", "null"] },
            countertop_sqft: { type: ["number", "null"] },
            floor_sqft: { type: ["number", "null"] }
          }
        },
        scope_details: {
          type: "object",
          properties: {
            shower_work: { type: ["boolean", "null"] },
            tub_to_shower: { type: ["boolean", "null"] },
            tile_to_ceiling: { type: ["boolean", "null"] },
            niche_count: { type: ["number", "null"] },
            has_bench: { type: ["boolean", "null"] },
            linear_drain: { type: ["boolean", "null"] },
            vanity_work: { type: ["boolean", "null"] },
            toilet_replace: { type: ["boolean", "null"] },
            floor_tile: { type: ["boolean", "null"] },
            recessed_lights: { type: ["number", "null"] },
            exhaust_fan: { type: ["boolean", "null"] },
            full_gut: { type: ["boolean", "null"] }
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
    size_category: { type: "string", enum: ["small", "standard", "large", "complex"] },
    trades: {
      type: "array",
      items: {
        type: "object",
        properties: {
          trade_name: { type: "string" },
          trade_order: { type: "number" },
          scope_narrative: { type: "string" },
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
        required: ["trade_name", "trade_order", "scope_narrative", "line_items"]
      }
    },
    notes: { type: "array", items: { type: "string" } }
  },
  required: ["project_type", "project_label", "size_category", "trades"]
};

const conversationalSystemPrompt = `# ESTIMAITE - V2 CONVERSATIONAL ESTIMATOR

You're EstimAIte, an experienced contractor's estimator. You sound confident and knowledgeable.

## CRITICAL RULE: NEVER ASSUME. ALWAYS ASK.

You MUST gather specific information before generating any quote. Don't guess dimensions or scope.

## CONVERSATION FLOW (STRICT ORDER)

### Phase 1: Project Type
If not clear, ask: "What type of project is this? Kitchen or bathroom remodel?"

### Phase 2: Size & Layout (REQUIRED - ask in ONE message)

**For BATHROOM, ask ALL of these:**
"Got it. Quick specs:
1. How big is the bathroom? (approx. sq ft or dimensions like 5x9)
2. Shower size? (e.g., 3x5, 4x4, tub/shower combo)
3. Vanity size? (e.g., 30", 48", 60" double)"

**For KITCHEN, ask ALL of these:**
"Got it. Quick specs:
1. How big is the kitchen? (approx. sq ft)
2. How many linear feet of cabinets? (uppers and lowers)
3. Island? (yes/no, size)"

### Phase 3: Scope Clarification (REQUIRED)

**For BATHROOM, ask:**
"What's the scope?

SHOWER:
- Tub-to-shower conversion or updating existing shower?
- Tile to ceiling or partial height?
- Niche? (yes/no, how many)
- Bench? (yes/no)

VANITY:
- Replacing in same spot or relocating?
- Countertop material? (quartz, granite, laminate)
- Single or double sink?

TOILET:
- Replacing or keeping existing?

FLOOR:
- Tile throughout?

ELECTRICAL:
- How many recessed lights?
- New exhaust fan?"

**For KITCHEN, ask:**
"What's the scope?

CABINETS:
- Full replacement or reface?
- Style? (shaker, flat panel, etc.)

COUNTERTOPS:
- Material? (quartz, granite, butcher block, laminate)
- Island countertop too?

BACKSPLASH:
- Full backsplash or just behind range?

FLOORING:
- Replacing floor? (tile, LVP, hardwood)

ELECTRICAL:
- Under-cabinet lights?
- How many recessed?"

### Phase 4: Photo Analysis (if uploaded)
If customer uploads photos, analyze for:
- Existing conditions
- Dimensions (use toilet = 28-30" deep, door = 30-32" wide for scale)
- What needs demo
If photos contradict what customer said, ASK to clarify.

### Phase 5: Generate Quote
ONLY generate after you have:
✓ Room size (sqft or dimensions)
✓ Shower/cabinet dimensions
✓ Vanity/countertop specs
✓ What's staying vs. going
✓ Electrical scope

## ACTION RULES

**action: "ask_question"** - Use when you need ANY of the required info above
**action: "generate_quote"** - ONLY use when you have all required dimensions and scope

## BATHROOM SIZE CATEGORIES (set in parsed_data.size_category)
- small: Under 50 sq ft (5x8, 5x9, 6x8)
- standard: 50-80 sq ft (8x10, 9x10, 7x12)
- large: 80-150 sq ft (10x12, 12x14, master bath)
- complex: 150+ sq ft (luxury master, multiple areas)

## EXAMPLES

User: "bathroom remodel"
→ action: "ask_question"
→ "Got it. Quick specs:
1. How big is the bathroom? (approx. sq ft or dimensions like 5x9)
2. Shower size? (e.g., 3x5, 4x4, tub/shower combo)
3. Vanity size? (e.g., 30", 48", 60" double)"

User: "5x9, 3x5 shower, 30 inch vanity"
→ action: "ask_question"
→ "Perfect. What's the scope?

SHOWER: Tub-to-shower conversion or updating existing? Tile to ceiling? Niche? Bench?
VANITY: Replacing in same spot? Countertop material? Single sink?
TOILET: Replacing or keeping?
FLOOR: Tile throughout?
ELECTRICAL: How many recessed lights? New exhaust fan?"

User: "full gut, walk-in shower with tile to ceiling, one niche, quartz top on vanity, new toilet, 3 can lights and new fan"
→ action: "generate_quote"
→ parsed_data.size_category: "small"
→ "Perfect. Full gut of a 5x9 bath with 3x5 walk-in shower, 30\" vanity with quartz, new toilet, 3 recessed lights and exhaust fan. Generating your estimate..."`;

const estimateSystemPrompt = `# ESTIMAITE V2 - SIZE-BASED ESTIMATE GENERATOR

Generate a CLEAN, PROFESSIONAL estimate based on bathroom/kitchen SIZE CATEGORY.

## SIZE-BASED PRICING (use parsed size_category)

### SMALL BATHROOM (Under 50 sq ft)
| Trade | IC Low | IC High |
|-------|--------|---------|
| Demo | $500 | $800 |
| Plumbing | $1,200 | $1,800 |
| Electrical | $600 | $1,000 |
| Framing/Drywall | $400 | $800 |
| Tile (shower + floor) | $2,500 | $4,000 |
| Cabinets/Counter | $800 | $1,500 |
| Glass | $800 | $1,200 |
| Paint/Trim | $400 | $700 |

**Total IC: $7,500 - $12,300**
**Customer Price: $13,000 - $21,500** (at 1.4x-1.75x markup)

### STANDARD BATHROOM (50-80 sq ft)
| Trade | IC Low | IC High |
|-------|--------|---------|
| Demo | $800 | $1,200 |
| Plumbing | $1,800 | $2,800 |
| Electrical | $900 | $1,400 |
| Framing/Drywall | $600 | $1,200 |
| Tile (shower + floor) | $4,000 | $6,000 |
| Cabinets/Counter | $1,500 | $2,800 |
| Glass | $1,000 | $1,600 |
| Paint/Trim | $600 | $1,000 |

**Total IC: $11,700 - $18,800**
**Customer Price: $20,000 - $33,000**

### LARGE BATHROOM (80-150 sq ft)
| Trade | IC Low | IC High |
|-------|--------|---------|
| Demo | $1,200 | $2,000 |
| Plumbing | $2,500 | $4,000 |
| Electrical | $1,200 | $2,200 |
| Framing/Drywall | $1,000 | $2,500 |
| Tile (shower + floor) | $6,000 | $10,000 |
| Cabinets/Counter | $2,500 | $4,500 |
| Glass | $1,400 | $2,200 |
| Paint/Trim | $900 | $1,500 |

**Total IC: $17,500 - $30,100**
**Customer Price: $30,000 - $53,000**

### COMPLEX BATHROOM (150+ sq ft)
| Trade | IC Low | IC High |
|-------|--------|---------|
| Demo | $2,000 | $3,500 |
| Plumbing | $3,500 | $5,500 |
| Electrical | $2,000 | $3,500 |
| Framing/Drywall | $2,500 | $6,500 |
| Tile (shower + floor) | $8,000 | $14,000 |
| Cabinets/Counter | $4,000 | $8,500 |
| Glass | $1,800 | $3,000 |
| Paint/Trim | $1,200 | $2,500 |

**Total IC: $26,000 - $49,000**
**Customer Price: $45,000 - $86,000**

## SCOPE-SPECIFIC ADJUSTMENTS

**Shower add-ons:**
- Niche (each): +$150-250 IC
- Bench: +$400-600 IC
- Tile to ceiling (vs. partial): +$800-1,500 IC
- Linear drain: +$300-450 IC
- Tub-to-shower conversion: +$800 IC (plumbing rework)

**Targeted scope (NOT full gut):**
- Vanity swap only: $4,000-6,500 CP
- Tub-to-shower conversion only: $9,000-12,500 CP
- Shower refresh only: $6,000-9,000 CP

## LINE ITEM FORMAT

**CONSOLIDATE** - Max 2-5 items per trade. Write clean narrative descriptions.

BAD (too granular):
- Supply cement board - $400
- Install cement board - $300  
- Waterproofing - $500
- Wall tile labor - $2,000

GOOD (consolidated):
"Shower walls and floor — approx. 85 sq ft. Includes waterproofing, cement board, thinset, grout, and trim."

## TRADE ORDER

BATHROOM: Demo → Plumbing → Electrical → Framing & Drywall → Tile Work → Cabinetry & Countertops → Glass → Paint & Trim

KITCHEN: Demo → Cabinetry → Countertops → Plumbing → Electrical → Backsplash → Paint & Trim

## scope_narrative FORMAT

Each trade should have a scope_narrative that reads naturally:
"Full gut including shower tile, floor tile, vanity, toilet, and fixtures."
"New shower valve with rain head and handheld. New toilet. Vanity faucet and drain connections."
"Shower walls and floor — approx. 85 sq ft. Main floor — approx. 30 sq ft. Includes waterproofing."

## CRITICAL RULES

1. **Match pricing to size_category** - Don't use LARGE pricing for a SMALL bathroom
2. **Only include scope that was mentioned** - Don't add trades the customer didn't ask for
3. **Calculate customer_price** - Use IC × 1.72 for 42% margin (standard markup)
4. **Include notes:**
   - Estimate valid for 30 days
   - Permits not included unless noted
   - Final material selections to be confirmed`;

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
          ...historyMessages.slice(-8),
          { role: "user", content: message }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "respond",
              description: "Respond to the user - ask required scope/dimension questions OR generate the estimate.",
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
    console.log("Parsed data:", JSON.stringify(parsedResponse.parsed_data || {}));

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
    console.log("Generating estimate with size category:", parsedResponse.parsed_data?.size_category);
    
    const fullContext = historyMessages.map((m: { role: string; content: string }) => 
      `${m.role}: ${m.content}`
    ).join('\n');
    
    const sizeCategory = parsedResponse.parsed_data?.size_category || 'standard';
    const dimensions = parsedResponse.parsed_data?.dimensions || {};
    const scopeDetails = parsedResponse.parsed_data?.scope_details || {};
    
    const estimatePrompt = `Generate a clean estimate for this project:

CONVERSATION:
${fullContext}
User: ${message}

SIZE CATEGORY: ${sizeCategory}
DIMENSIONS: ${JSON.stringify(dimensions)}
SCOPE DETAILS: ${JSON.stringify(scopeDetails)}

CRITICAL: Use the ${sizeCategory.toUpperCase()} baseline pricing from your pricing tables.
CONSOLIDATE line items (2-5 per trade max). Make it clean and scannable.
Include a scope_narrative for each trade that describes the work in plain English.`;

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
              description: "Generate a clean, consolidated estimate with proper size-based pricing.",
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
          size_category: estimate.size_category,
          areas: [{
            area_id: "main",
            area_name: estimate.project_label,
            trades: estimate.trades.map((t: any) => ({
              trade_id: t.trade_name.toLowerCase().replace(/\s+/g, '_'),
              trade_name: t.trade_name,
              trade_order: t.trade_order,
              scope_narrative: t.scope_narrative,
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
        project_type: (estimate.project_type || '').toLowerCase().includes('bathroom') ? 'Bathroom' : 
                      (estimate.project_type || '').toLowerCase().includes('kitchen') ? 'Kitchen' : 'Remodel',
        project_label: estimate.project_label,
        size_category: estimate.size_category,
        overall_size_sqft: dimensions?.room_sqft || null
      },
      // Include scope narratives for clean PDF generation
      trade_narratives: estimate.trades.map((t: any) => ({
        trade_name: t.trade_name,
        scope_narrative: t.scope_narrative
      }))
    };
    
    console.log("Generated estimate - Size:", estimate.size_category, "Total:", grandTotal);
    
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
