import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================
// ZIP-BASED MARGIN CALCULATOR (INLINE)
// ============================================================

interface MarginResult {
  margin_used: number;
  margin_source: string;
  base_margin: number;
  zip_code_applied?: string;
  rule_notes?: string;
}

/**
 * Extract 5-digit zip code from address string
 */
function extractZipCode(address: string | null | undefined): string | null {
  if (!address) return null;
  const zipMatch = address.match(/\b\d{5}\b/);
  return zipMatch ? zipMatch[0] : null;
}

/**
 * Get margin for contractor based on zip code
 */
async function getMarginForZipCode(
  supabase: any,
  contractorId: string | null,
  zipCode: string | null
): Promise<MarginResult> {
  const DEFAULT_MARGIN = 0.42;
  
  if (!contractorId) {
    return {
      margin_used: DEFAULT_MARGIN,
      margin_source: 'Default (no contractor)',
      base_margin: DEFAULT_MARGIN
    };
  }

  try {
    // Get active strategy with its zip rules
    const { data: strategy, error: strategyError } = await supabase
      .from('margin_strategies')
      .select('*, zip_margin_rules(*)')
      .eq('contractor_id', contractorId)
      .eq('is_active', true)
      .maybeSingle();

    if (strategyError) {
      console.error('Error fetching margin strategy:', strategyError);
      return {
        margin_used: DEFAULT_MARGIN,
        margin_source: 'Default (error)',
        base_margin: DEFAULT_MARGIN
      };
    }

    if (!strategy) {
      return {
        margin_used: DEFAULT_MARGIN,
        margin_source: 'Default (no strategy)',
        base_margin: DEFAULT_MARGIN
      };
    }

    // If no zip code, use base margin
    if (!zipCode) {
      return {
        margin_used: strategy.base_margin,
        margin_source: 'Base margin',
        base_margin: strategy.base_margin
      };
    }

    // Check for zip-specific override
    const zipRules = strategy.zip_margin_rules || [];
    const zipRule = zipRules.find((rule: any) => rule.zip_code === zipCode);

    if (zipRule) {
      return {
        margin_used: zipRule.margin_override,
        margin_source: `${zipCode} override`,
        base_margin: strategy.base_margin,
        zip_code_applied: zipCode,
        rule_notes: zipRule.notes || undefined
      };
    }

    // No override found, use base margin
    return {
      margin_used: strategy.base_margin,
      margin_source: `Base margin (no override for ${zipCode})`,
      base_margin: strategy.base_margin
    };

  } catch (error) {
    console.error('Error getting margin:', error);
    return {
      margin_used: DEFAULT_MARGIN,
      margin_source: 'Default (error)',
      base_margin: DEFAULT_MARGIN
    };
  }
}

// ============================================================
// SCHEMAS
// ============================================================

// Conversation response schema - now supports multiple rooms
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
        // Single room dimensions (for backwards compatibility)
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
        // Multi-room support - array of bathrooms
        bathrooms: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              room_sqft: { type: ["number", "null"] },
              room_dims: { type: ["string", "null"] },
              shower_dims: { type: ["string", "null"] },
              shower_sqft: { type: ["number", "null"] },
              vanity_size: { type: ["string", "null"] },
              scope: {
                type: "object",
                properties: {
                  full_gut: { type: ["boolean", "null"] },
                  tub_to_shower: { type: ["boolean", "null"] },
                  tile_to_ceiling: { type: ["boolean", "null"] },
                  ceiling_height: { type: ["string", "null"] },
                  niche_count: { type: ["number", "null"] },
                  has_bench: { type: ["boolean", "null"] },
                  zero_entry: { type: ["boolean", "null"] },
                  linear_drain: { type: ["boolean", "null"] },
                  vanity_work: { type: ["boolean", "null"] },
                  toilet_replace: { type: ["boolean", "null"] },
                  floor_tile: { type: ["boolean", "null"] }
                }
              }
            }
          }
        },
        // Multi-room support - array of kitchens
        kitchens: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              room_sqft: { type: ["number", "null"] },
              cabinet_lf: { type: ["number", "null"] },
              has_island: { type: ["boolean", "null"] },
              scope: {
                type: "object",
                properties: {
                  full_gut: { type: ["boolean", "null"] },
                  cabinet_replacement: { type: ["boolean", "null"] },
                  countertop_material: { type: ["string", "null"] },
                  backsplash: { type: ["boolean", "null"] },
                  floor_replacement: { type: ["boolean", "null"] }
                }
              }
            }
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

// Clean estimate output schema - supports room-specific line items
const estimateSchema = {
  type: "object",
  properties: {
    project_type: { type: "string" },
    project_label: { type: "string" },
    size_category: { type: "string", enum: ["small", "standard", "large", "complex"] },
    room_count: { type: "number" },
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
                room_label: { type: ["string", "null"] },
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

// ============================================================
// CONVERSATIONAL SYSTEM PROMPT - V3 WITH MULTI-ROOM SUPPORT
// ============================================================

const conversationalSystemPrompt = `# ESTIMAITE - V3 CONVERSATIONAL ESTIMATOR

You're EstimAIte, an experienced contractor's estimator. You sound confident and knowledgeable.

## CRITICAL RULE: NEVER ASSUME. ALWAYS ASK.

You MUST gather specific information before generating any quote. Don't guess dimensions or scope.

---

## HANDLING MULTIPLE ROOMS (CRITICAL)

When a user mentions multiple bathrooms or kitchens (e.g., "3 bathrooms", "2 master baths and a guest bath"), you MUST:

### Step 1: Clarify Scope Per Room
Ask: "Got it, [NUMBER] bathrooms. Are they all the same scope, or do I need details for each one separately?"

### Step 2: Gather Dimensions Per Room
For EACH bathroom, get:
- Room size / shower dimensions
- Vanity size
- Unique features (niches, benches, zero-entry)

**Example Flow:**
User: "3 bathrooms"
AI: "Got it, 3 bathrooms. Are they all identical, or different scopes?"

User: "2 are the same, third is bigger"
AI: "Perfect. Let's start with the 2 that are the same:
• Shower/tub size? (e.g., 31x59 tub, 3x5 shower)
• What's the scope? (tub-to-shower conversion, tile to ceiling, etc.)"

[Get details]

AI: "Great. Now for the third larger bathroom:
• Shower/tub size?
• Any different features? (zero-entry, bench, bigger niche?)"

### Step 3: Track in parsed_data
Store each bathroom separately in the "bathrooms" array:
{
  "bathrooms": [
    { "id": "bath_1", "label": "Guest Bath 1", "shower_dims": "31x59", "scope": { "tub_to_shower": true, "tile_to_ceiling": true, "ceiling_height": "96", "niche_count": 1 } },
    { "id": "bath_2", "label": "Guest Bath 2", "shower_dims": "31x59", "scope": { "tub_to_shower": true, "tile_to_ceiling": true, "ceiling_height": "96", "niche_count": 1 } },
    { "id": "bath_3", "label": "Master Bath", "shower_dims": "54x40", "scope": { "tub_to_shower": true, "tile_to_ceiling": true, "ceiling_height": "96", "niche_count": 1, "zero_entry": true } }
  ]
}

### Step 4: Generate Separate Estimates
When action = "generate_quote" with multiple bathrooms, the estimate generator will create SEPARATE line items for EACH bathroom.

---

## CONVERSATION FLOW (STRICT ORDER)

### Phase 1: Project Type
If not clear, ask: "What type of project is this? Kitchen or bathroom remodel?"

### Phase 2: Detect Multiple Rooms
If user says "3 bathrooms", "2 kitchens", "multiple baths", etc.:
1. Acknowledge the count
2. Ask if they're all the same or different
3. Gather details for each group

### Phase 3: Size & Layout (REQUIRED for each room)

**For BATHROOM, ask:**
"Quick specs:
1. Shower/tub size? (e.g., 31"x59" tub, 3x5 walk-in)
2. Vanity size? (e.g., 30", 48", 60" double)"

**For KITCHEN, ask:**
"Quick specs:
1. How big is the kitchen? (approx. sq ft)
2. How many linear feet of cabinets?
3. Island? (yes/no)"

### Phase 4: Scope Clarification (REQUIRED)

**For BATHROOM, ask:**
"What's the scope?
- Tub-to-shower conversion?
- Tile to ceiling? (what height?)
- Niche? (how many)
- Bench?
- Zero-entry/curbless?"

**For KITCHEN, ask:**
"What's the scope?
- Full cabinet replacement or reface?
- Countertop material?
- Backsplash?
- Floor replacement?"

### Phase 5: Generate Quote
ONLY generate after you have:
✓ Room count confirmed
✓ Dimensions for each room (or confirmation they're identical)
✓ Scope details for each room/group
✓ Vanity/countertop specs

## ACTION RULES

**action: "ask_question"** - Use when you need ANY required info
**action: "generate_quote"** - ONLY when you have all dimensions and scope for ALL rooms

## BATHROOM SIZE CATEGORIES
- small: Under 50 sq ft (5x8, 5x9, 6x8)
- standard: 50-80 sq ft (8x10, 9x10)
- large: 80-150 sq ft (10x12, master bath)
- complex: 150+ sq ft (luxury master)

## EXAMPLES

**Multi-room example:**
User: "4 bathrooms"
→ action: "ask_question"
→ "Got it, 4 bathrooms. Are they all the same scope, or do I need details for each one separately?"

User: "actually 3. two are 31x59 tub to shower, one is 54x40 walk-in"
→ action: "ask_question"
→ "Perfect, 3 bathrooms:
• Two with 31\"x59\" tub-to-shower conversions
• One with 54\"x40\" walk-in shower

For all three:
- Tile to ceiling? (what height?)
- Niches? (how many per shower)
- Bench in any?
- Is the larger one zero-entry?"

User: "all tile to ceiling at 96 inches. one niche each. no benches. the bigger one is zero-entry."
→ action: "generate_quote"
→ Store in bathrooms array:
  - bath_1: 31x59, tub-to-shower, tile to 96", 1 niche
  - bath_2: 31x59, tub-to-shower, tile to 96", 1 niche  
  - bath_3: 54x40, zero-entry walk-in, tile to 96", 1 niche
→ "Perfect. Generating your estimate for 3 bathrooms..."

**Single room example:**
User: "bathroom remodel"
→ action: "ask_question"
→ "Got it. Quick specs:
1. How big is the bathroom? (approx. sq ft or dimensions)
2. Shower size? (e.g., 3x5, 4x4, tub/shower combo)
3. Vanity size? (e.g., 30", 48", 60" double)"`;

// ============================================================
// ESTIMATE SYSTEM PROMPT - V3 WITH MULTI-ROOM LINE ITEMS
// ============================================================

const estimateSystemPrompt = `# ESTIMAITE V3 - SIZE-BASED ESTIMATE GENERATOR WITH MULTI-ROOM SUPPORT

Generate a CLEAN, PROFESSIONAL estimate. When multiple rooms are specified, create SEPARATE line items for EACH room.

## CRITICAL: MULTI-ROOM ESTIMATE FORMAT

When there are multiple bathrooms/kitchens, DO NOT create bulk line items.

### WRONG (bulk items):
Trade: Tile
  - "Tile installation for three showers" → $4,310

### CORRECT (per-room items):
Trade: Tile
  - "Guest Bath 1: Shower tile to 96\" ceiling (31\"x59\" area)" → $1,437
  - "Guest Bath 2: Shower tile to 96\" ceiling (31\"x59\" area)" → $1,437
  - "Master Bath: Shower tile to 96\" ceiling (54\"x40\" area, zero-entry)" → $1,800

Each line item MUST include the room_label prefix (e.g., "Guest Bath 1:", "Master Bath:").

---

## SIZE-BASED PRICING (use for each room)

### SMALL BATHROOM (Under 50 sq ft) - TUB-TO-SHOWER CONVERSION
| Trade | IC Range |
|-------|----------|
| Demo (tub/surround) | $400 - $600 |
| Plumbing (conversion) | $2,000 - $2,800 |
| Framing | $300 - $500 |
| Tile (shower walls + floor) | $1,200 - $1,800 |
| Waterproofing | $400 - $600 |
| Glass (panel or door) | $800 - $1,200 |
| Niche (each) | $150 - $250 |

**Per-room IC for small tub-to-shower: $5,000 - $7,500**

### STANDARD/LARGE BATHROOM
Multiply small pricing by:
- Standard (50-80 sqft): 1.3x - 1.5x
- Large (80-150 sqft): 1.6x - 2.0x
- Complex (150+ sqft): 2.0x - 2.5x

### SCOPE ADD-ONS (per room)
- Zero-entry/curbless: +$600-800 IC (extra framing + linear drain)
- Tile to ceiling (vs. partial): +$400-800 IC
- Bench: +$400-600 IC
- Linear drain: +$300-450 IC

---

## LINE ITEM FORMAT FOR MULTI-ROOM

For each trade, create separate line items per room:

**Example with 3 bathrooms:**

Trade: Demolition
  line_items:
    - room_label: "Guest Bath 1"
      description: "Guest Bath 1: Demo existing tub and surround (31\"x59\")"
      internal_cost: 500
    - room_label: "Guest Bath 2"
      description: "Guest Bath 2: Demo existing tub and surround (31\"x59\")"
      internal_cost: 500
    - room_label: "Master Bath"
      description: "Master Bath: Demo existing tub and surround (54\"x40\")"
      internal_cost: 600

Trade: Plumbing
  line_items:
    - room_label: "Guest Bath 1"
      description: "Guest Bath 1: Tub-to-shower conversion plumbing"
      internal_cost: 2200
    - room_label: "Guest Bath 2"
      description: "Guest Bath 2: Tub-to-shower conversion plumbing"
      internal_cost: 2200
    - room_label: "Master Bath"
      description: "Master Bath: Tub-to-shower conversion with linear drain for zero-entry"
      internal_cost: 2800

Trade: Tile
  line_items:
    - room_label: "Guest Bath 1"
      description: "Guest Bath 1: Shower tile to 96\" ceiling (31\"x59\" area)"
      internal_cost: 1400
    - room_label: "Guest Bath 2"
      description: "Guest Bath 2: Shower tile to 96\" ceiling (31\"x59\" area)"
      internal_cost: 1400
    - room_label: "Master Bath"
      description: "Master Bath: Shower tile to 96\" ceiling (54\"x40\" area)"
      internal_cost: 2200

---

## TRADE ORDER

BATHROOM: Demo → Plumbing → Framing → Tile & Waterproofing → Glass → Paint & Trim

---

## SCOPE NARRATIVE FORMAT

For multi-room projects, the scope_narrative should mention all rooms:
"Three tub-to-shower conversions: two 31\"x59\" guest baths and one 54\"x40\" master with zero-entry. All with tile to 96\" ceiling and one niche each."

---

## CRITICAL RULES

1. **SEPARATE LINE ITEMS PER ROOM** - Never bulk items like "Tile for 3 showers"
2. **Include room_label** - Every line item needs room_label field
3. **Price each room appropriately** - Larger rooms cost more
4. **Match pricing to dimensions** - 54x40 is bigger than 31x59
5. **Return INTERNAL COSTS (IC)** - System applies margin separately
6. **Include notes:** Estimate valid for 30 days, permits not included`;

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, conversation_history, customer, company, contractor_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client for margin lookup
    const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY 
      ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      : null;

    console.log("Processing message:", message);
    console.log("Context:", JSON.stringify(context || {}));
    console.log("Contractor ID:", contractor_id);
    
    // Extract zip code from customer address for margin calculation
    const customerAddress = customer?.address || customer?.property_address || context?.property_address || '';
    const zipCode = extractZipCode(customerAddress);
    console.log("Extracted zip code:", zipCode);

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
          ...historyMessages.slice(-10),
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

    // Step 2: Get margin for this project
    const marginResult = supabase 
      ? await getMarginForZipCode(supabase, contractor_id, zipCode)
      : { margin_used: 0.42, margin_source: 'Default (no DB)', base_margin: 0.42 };
    
    console.log("Margin result:", JSON.stringify(marginResult));

    // Step 3: Generate clean estimate
    const sizeCategory = parsedResponse.parsed_data?.size_category || 'standard';
    const dimensions = parsedResponse.parsed_data?.dimensions || {};
    const scopeDetails = parsedResponse.parsed_data?.scope_details || {};
    const bathrooms = parsedResponse.parsed_data?.bathrooms || [];
    const kitchens = parsedResponse.parsed_data?.kitchens || [];
    
    console.log("Generating estimate with size category:", sizeCategory);
    console.log("Bathrooms:", JSON.stringify(bathrooms));
    
    const fullContext = historyMessages.map((m: { role: string; content: string }) => 
      `${m.role}: ${m.content}`
    ).join('\n');
    
    // Build room-specific context for the estimate prompt
    let roomContext = '';
    if (bathrooms.length > 0) {
      roomContext = `\n\nMULTIPLE BATHROOMS (${bathrooms.length} total):\n`;
      bathrooms.forEach((bath: any, idx: number) => {
        roomContext += `\n${idx + 1}. ${bath.label || `Bathroom ${idx + 1}`}:
   - Shower/tub dimensions: ${bath.shower_dims || bath.room_dims || 'not specified'}
   - Vanity: ${bath.vanity_size || 'not specified'}
   - Scope: ${JSON.stringify(bath.scope || {})}`;
      });
      roomContext += '\n\nCRITICAL: Create SEPARATE line items for EACH bathroom. Do NOT create bulk items.';
    }
    if (kitchens.length > 0) {
      roomContext += `\n\nMULTIPLE KITCHENS (${kitchens.length} total):\n`;
      kitchens.forEach((kitchen: any, idx: number) => {
        roomContext += `\n${idx + 1}. ${kitchen.label || `Kitchen ${idx + 1}`}:
   - Size: ${kitchen.room_sqft || 'not specified'} sqft
   - Cabinets: ${kitchen.cabinet_lf || 'not specified'} LF
   - Island: ${kitchen.has_island ? 'Yes' : 'No'}
   - Scope: ${JSON.stringify(kitchen.scope || {})}`;
      });
      roomContext += '\n\nCRITICAL: Create SEPARATE line items for EACH kitchen. Do NOT create bulk items.';
    }
    
    const estimatePrompt = `Generate a clean estimate for this project:

CONVERSATION:
${fullContext}
User: ${message}

SIZE CATEGORY: ${sizeCategory}
DIMENSIONS: ${JSON.stringify(dimensions)}
SCOPE DETAILS: ${JSON.stringify(scopeDetails)}
${roomContext}

CRITICAL INSTRUCTIONS:
1. Use the ${sizeCategory.toUpperCase()} baseline pricing
2. ${bathrooms.length > 1 || kitchens.length > 1 ? 'Create SEPARATE line items for EACH room - DO NOT bulk items' : 'Consolidate line items (2-5 per trade max)'}
3. Each line item needs room_label field if multiple rooms
4. Include scope_narrative for each trade
5. Return INTERNAL COSTS (IC) - system applies margin separately`;

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
              description: "Generate a clean estimate with separate line items per room when multiple rooms specified.",
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
    
    // Step 4: Calculate totals with margin applied
    const marginMultiplier = 1 / (1 - marginResult.margin_used); // e.g., 42% margin = 1.724x
    let subtotalIC = 0;
    let grandTotal = 0;
    
    // Apply margin to each line item and calculate totals
    const tradesWithMargin = (estimate.trades || []).map((trade: any) => ({
      ...trade,
      line_items: (trade.line_items || []).map((item: any) => {
        const ic = item.internal_cost || 0;
        const cp = Math.round(ic * marginMultiplier);
        subtotalIC += ic;
        grandTotal += cp;
        return {
          ...item,
          internal_cost: ic,
          customer_price: cp
        };
      })
    }));
    
    // Determine room count
    const roomCount = bathrooms.length || kitchens.length || 1;
    
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
          room_count: roomCount,
          areas: [{
            area_id: "main",
            area_name: estimate.project_label,
            trades: tradesWithMargin.map((t: any) => ({
              trade_id: t.trade_name.toLowerCase().replace(/\s+/g, '_'),
              trade_name: t.trade_name,
              trade_order: t.trade_order,
              scope_narrative: t.scope_narrative,
              line_items: t.line_items.map((item: any, idx: number) => ({
                item_id: `${t.trade_name.toLowerCase().replace(/\s+/g, '_')}_${idx}`,
                item_type: "lump_sum",
                room_label: item.room_label || null,
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
        overall_margin_percent: marginResult.margin_used * 100,
        line_items: tradesWithMargin.flatMap((trade: any) =>
          trade.line_items.map((item: any) => ({
            category: trade.trade_name,
            room_label: item.room_label || null,
            task_description: item.description,
            quantity: 1,
            unit: 'ea',
            ic_per_unit: item.internal_cost,
            cp_per_unit: item.customer_price,
            ic_total: item.internal_cost,
            cp_total: item.customer_price,
            margin_percent: marginResult.margin_used * 100
          }))
        )
      },
      project_header: {
        project_type: (estimate.project_type || '').toLowerCase().includes('bathroom') ? 'Bathroom' : 
                      (estimate.project_type || '').toLowerCase().includes('kitchen') ? 'Kitchen' : 'Remodel',
        project_label: estimate.project_label,
        size_category: estimate.size_category,
        room_count: roomCount,
        overall_size_sqft: dimensions?.room_sqft || null
      },
      // Include scope narratives for clean PDF generation
      trade_narratives: tradesWithMargin.map((t: any) => ({
        trade_name: t.trade_name,
        scope_narrative: t.scope_narrative
      })),
      // Margin info for display
      margin_info: {
        margin_percentage: Math.round(marginResult.margin_used * 100),
        margin_source: marginResult.margin_source,
        base_margin: Math.round(marginResult.base_margin * 100),
        zip_code: marginResult.zip_code_applied || null,
        notes: marginResult.rule_notes || null
      }
    };
    
    console.log("Generated estimate - Size:", estimate.size_category, "Total:", grandTotal, "Margin:", marginResult.margin_used);
    
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
