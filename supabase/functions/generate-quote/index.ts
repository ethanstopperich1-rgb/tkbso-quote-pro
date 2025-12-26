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
// TILE BREAKDOWN CALCULATOR
// ============================================================

interface TileBreakdown {
  wall_sqft: number;
  shower_floor_sqft: number;
  main_floor_sqft: number;
  total_sqft: number;
}

interface TileMeasurements {
  shower_wall_dims?: string | null;
  ceiling_height?: number | null;
  shower_floor_type?: string | null;
  shower_floor_sqft?: number | null;
  main_floor_tile?: boolean | null;
  room_dims?: string | null;
  room_sqft?: number | null;
  tile_quality?: string | null;
}

/**
 * Parse dimension string like "3x5", "31x59", "3'x5'" into inches
 */
function parseDimensions(dims: string): { width: number; length: number } {
  if (!dims) return { width: 36, length: 60 }; // default 3x5
  
  // Clean and standardize
  const cleaned = dims.replace(/['"ft\s]/gi, '').toLowerCase();
  const parts = cleaned.split(/x|by/).map(p => parseFloat(p.trim()));
  
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
    return { width: 36, length: 60 };
  }
  
  // If numbers are small (< 15), assume feet and convert to inches
  // If numbers are larger, assume already in inches
  const width = parts[0] < 15 ? parts[0] * 12 : parts[0];
  const length = parts[1] < 15 ? parts[1] * 12 : parts[1];
  
  return { width, length };
}

/**
 * Calculate tile breakdown for a bathroom
 * Uses 12% waste factor for wall tile and 18% for shower floor (mosaic)
 */
function calculateTileBreakdown(tile: TileMeasurements): TileBreakdown {
  // Parse shower dimensions
  const showerDims = parseDimensions(tile.shower_wall_dims || "3x5");
  const width_ft = showerDims.width / 12;
  const length_ft = showerDims.length / 12;
  const height_ft = (tile.ceiling_height || 96) / 12;
  
  // Calculate wall sqft (3 walls) with 12% waste factor
  const back_wall = length_ft * height_ft;
  const side_wall_1 = width_ft * height_ft;
  const side_wall_2 = width_ft * height_ft;
  const wall_sqft = (back_wall + side_wall_1 + side_wall_2) * 1.12; // 12% waste factor
  
  // Calculate shower floor sqft with 18% waste factor (mosaic tile has more waste)
  let shower_floor_sqft = 0;
  if (tile.shower_floor_type && tile.shower_floor_type !== 'existing') {
    shower_floor_sqft = tile.shower_floor_sqft || ((width_ft * length_ft) * 1.18);
  }
  
  // Calculate main floor sqft (if applicable) with 15% waste
  let main_floor_sqft = 0;
  if (tile.main_floor_tile) {
    const roomSqft = tile.room_sqft || 40; // default 5x8 bathroom
    const showerFootprint = width_ft * length_ft;
    main_floor_sqft = (roomSqft - showerFootprint) * 1.15;
    if (main_floor_sqft < 0) main_floor_sqft = 0;
  }
  
  return {
    wall_sqft: Math.round(wall_sqft),
    shower_floor_sqft: Math.round(shower_floor_sqft),
    main_floor_sqft: Math.round(main_floor_sqft),
    total_sqft: Math.round(wall_sqft + shower_floor_sqft + main_floor_sqft)
  };
}

// Tile pricing per sqft by quality
const TILE_PRICING = {
  standard: { wall: 14, shower_floor: 45, main_floor: 12 },
  'mid-range': { wall: 18, shower_floor: 55, main_floor: 16 },
  premium: { wall: 25, shower_floor: 70, main_floor: 22 }
};

// IC multiplier (IC is ~58% of CP)
const IC_MULTIPLIER = 0.58;

/**
 * Generate tile line items for a bathroom
 */
function generateTileLineItems(
  roomLabel: string,
  tile: TileMeasurements
): Array<{ room_label: string; description: string; internal_cost: number; customer_price: number }> {
  const breakdown = calculateTileBreakdown(tile);
  const quality = (tile.tile_quality || 'standard') as keyof typeof TILE_PRICING;
  const prices = TILE_PRICING[quality] || TILE_PRICING.standard;
  
  const lineItems: Array<{ room_label: string; description: string; internal_cost: number; customer_price: number }> = [];
  
  // 1. Wall Tile
  if (breakdown.wall_sqft > 0) {
    const wallCP = breakdown.wall_sqft * prices.wall;
    const wallIC = Math.round(wallCP * IC_MULTIPLIER);
    lineItems.push({
      room_label: roomLabel,
      description: `${roomLabel}: Shower wall tile to ${tile.ceiling_height || 96}" ceiling (${breakdown.wall_sqft} sqft) with full waterproofing and one recessed niche`,
      internal_cost: wallIC,
      customer_price: wallCP
    });
  }
  
  // 2. Shower Floor Tile
  if (breakdown.shower_floor_sqft > 0) {
    const floorCP = breakdown.shower_floor_sqft * prices.shower_floor;
    const floorIC = Math.round(floorCP * IC_MULTIPLIER);
    const drainType = tile.shower_floor_type === 'curbless' ? 'curbless with linear drain' : 'tile pan with proper drainage';
    lineItems.push({
      room_label: roomLabel,
      description: `${roomLabel}: Custom ${drainType} shower floor (${breakdown.shower_floor_sqft} sqft) including sloped mud bed`,
      internal_cost: floorIC,
      customer_price: floorCP
    });
  }
  
  // 3. Main Floor Tile
  if (breakdown.main_floor_sqft > 0) {
    const mainCP = breakdown.main_floor_sqft * prices.main_floor;
    const mainIC = Math.round(mainCP * IC_MULTIPLIER);
    lineItems.push({
      room_label: roomLabel,
      description: `${roomLabel}: Bathroom floor tile (${breakdown.main_floor_sqft} sqft) including substrate prep and tile removal`,
      internal_cost: mainIC,
      customer_price: mainCP
    });
  }
  
  return lineItems;
}

// ============================================================
// SCHEMAS
// ============================================================

// Conversation response schema - now supports tile measurements
const conversationSchema = {
  type: "object",
  properties: {
    action: { 
      type: "string", 
      enum: ["ask_question", "show_summary", "generate_quote"],
      description: "ask_question = need more info, show_summary = have all info and showing summary for confirmation, generate_quote = user confirmed summary"
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
        // Multi-room support - array of bathrooms with TILE MEASUREMENTS
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
                  ceiling_height: { type: ["number", "null"] },
                  niche_count: { type: ["number", "null"] },
                  has_bench: { type: ["boolean", "null"] },
                  zero_entry: { type: ["boolean", "null"] },
                  linear_drain: { type: ["boolean", "null"] },
                  vanity_work: { type: ["boolean", "null"] },
                  toilet_replace: { type: ["boolean", "null"] },
                  floor_tile: { type: ["boolean", "null"] }
                }
              },
              // CRITICAL: Tile measurements for accurate pricing
              tile_measurements: {
                type: "object",
                properties: {
                  shower_wall_dims: { type: ["string", "null"] },
                  ceiling_height: { type: ["number", "null"] },
                  shower_wall_sqft: { type: ["number", "null"] },
                  shower_floor_type: { 
                    type: ["string", "null"],
                    enum: ["tile_pan", "existing", "curbless", "curbed", null]
                  },
                  shower_floor_sqft: { type: ["number", "null"] },
                  main_floor_tile: { type: ["boolean", "null"] },
                  room_dims: { type: ["string", "null"] },
                  room_sqft: { type: ["number", "null"] },
                  main_floor_sqft: { type: ["number", "null"] },
                  tile_quality: {
                    type: ["string", "null"],
                    enum: ["standard", "mid-range", "premium", null]
                  }
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
// CONVERSATIONAL SYSTEM PROMPT - V4 WITH TILE BREAKDOWN
// ============================================================

const conversationalSystemPrompt = `# ESTIMAITE - SALES CONSULTANT FOR CONTRACTORS

You are EstimAIte, a professional estimating consultant helping CONTRACTORS create winning estimates for their HOMEOWNER clients.

**Critical Distinction:**
- USER = Contractor (the professional you're talking to)
- CLIENT = Homeowner (the contractor's customer who will receive the estimate)

---

## CRITICAL RULES - MUST FOLLOW

### 1. CONTEXT MEMORY (NEVER ASK TWICE)
When the contractor provides ANY information, store it and NEVER ask again:
- If they said "29x58 shower" → you have shower dimensions, don't ask again
- If they said "bathroom" (singular) → assume 1 bathroom, not 2
- If they mentioned ceiling height → stored, don't re-ask

If you need clarification, acknowledge what they said:
"You mentioned the shower is 29x58. Just to confirm, is that inches?" NOT "What are the shower dimensions?"

### 2. DIMENSION PARSING
- Numbers < 15 → assume feet (e.g., "3x5" = 3ft x 5ft)
- Numbers 20-150 → assume inches, confirm casually in same response
- Numbers > 150 → definitely inches
Example: "Got it, 58" × 119" = 48 sqft for the main floor. (Let me know if you meant feet.)"

### 3. QUANTITY PARSING  
- "bathroom" (singular) → 1 bathroom
- "bathrooms" (plural) or "two", "three", "both" → ask how many
- NEVER interpret singular as plural

### 4. CLIENT NAME CAPTURE
After project type, ask: "What's your client's name for the estimate?"
Store and use throughout. If skipped, ask again before generating: "What name should appear on the estimate?"

### 5. NO EMOJIS
Never use emojis in responses. Professional tone only.

### 6. GROUP QUESTIONS (Max 2 per message)
Ask related questions together:
"What are the shower dimensions and ceiling height?"
NOT separate messages for each.

### 7. BRIEF ERROR ACKNOWLEDGMENT
If you make a mistake: "You're right, my mistake - I have the 29x58 shower. Moving on..."
NOT: "My apologies! You did indeed provide the shower dimensions. I am still learning..."

---

## CONVERSATION FLOW

### Phase 1: Project Discovery
"What type of project are we quoting — kitchen or bathroom?"
Then: "What's your client's name for the estimate?"

### Phase 2: Scope & Dimensions (Group Questions)
Ask 2 related questions at once:
"What are the shower dimensions and ceiling height?"
Then: "Is this a tub-to-shower conversion, and are we tiling the main floor too?"

### Phase 3: Upsell Recommendations (CONVERSATIONAL - not bullet points)
Present naturally:

"Before I build your quote, two features homeowners at this budget almost always add:

**Rainfall showerhead** ($350) - When you tell homeowners 'it costs less than a tile upgrade but you'll notice it every day,' they rarely say no. 78% choose this.

**Built-in bench** ($400) - Great for safety and convenience. 67% at this level include it.

Want these in your base quote, or as optional items?"

### Phase 4: Main Floor Tile Coaching
When user mentions main floor tile, provide sales context:
"Smart move bundling the main floor. When you show homeowners the shower tile and ask 'should we continue this onto the main floor for a complete look?', 85% say yes. What are the floor dimensions?"

### Phase 5: MANDATORY SUMMARY/CONFIRMATION (CRITICAL!)
**You MUST use action: "show_summary" when you have gathered all required information.**
**NEVER skip this phase. NEVER use action: "generate_quote" until after showing summary and receiving explicit confirmation.**

When you have all the scope details, use action: "show_summary" and present this summary:

"═══════════════════════════════════════════════
ESTIMATE SUMMARY - PLEASE REVIEW

CLIENT: [Name or 'Valued Customer']
PROJECT TYPE: [Bathroom/Kitchen] Remodel

SCOPE:
• Shower: [dimensions], tiled to [height]
• Vanity: [size]
• Main floor: [sqft or 'not included']
• Additions: [bench, niche, heated floors, etc.]

ESTIMATED RANGE: $[low] - $[high]

═══════════════════════════════════════════════

Does everything look correct? Reply:
→ 'Looks good' or 'Yes' to generate the full estimate
→ 'Change [item]' to adjust
→ 'Add [item]' to include more"

**ONLY use action: "generate_quote" AFTER the contractor explicitly confirms with "looks good", "perfect", "yes", "generate", "let's do it", or similar confirmation words.**

**Action Flow:**
1. ask_question → still gathering info
2. show_summary → have all info, showing for confirmation
3. generate_quote → ONLY after user confirms the summary

---

## UPSELL LIBRARY (Present Conversationally)

### Bathroom - SELECT TIER ($12-18K)
| Feature | Price | Rate | Quick Pitch |
|---------|-------|------|-------------|
| Heated floors | $1,200 | 94% | "$3/day for warm floors" |
| Rainfall head | $350 | 78% | "Daily spa experience" |
| Built-in bench | $400 | 67% | "Safety + convenience" |
| Second niche | $300 | 55% | "Storage for two" |
| Linear drain | $450 | 45% | "Modern, easier clean" |

### Kitchen
| Feature | Price | Rate | Quick Pitch |
|---------|-------|------|-------------|
| Soft-close | $400 | 88% | "No more slamming" |
| Under-cabinet LED | $350 | 75% | "Task + ambiance" |
| Pull-out trash | $250 | 70% | "Hidden, convenient" |

---

## LANGUAGE GUIDELINES

**DON'T SAY:**
- "Would you like heated floors?" (wrong perspective)
- "My apologies! You did indeed provide..." (too formal)
- Bullet-point lists for upsells
- "What are the dimensions?" (when they already told you)

**DO SAY:**
- "Homeowners love heated floors. Here's how to pitch it..."
- "You're right, my mistake - moving on..."
- Natural, conversational upsell suggestions
- "You mentioned [X], just to confirm..." (when clarifying)

---

## TILE MEASUREMENTS (Required Before Quote)

Before showing summary, ensure you have:
- shower_wall_dims (e.g., "3x5")
- ceiling_height (e.g., 96)
- shower_floor_type (tile_pan, curbless, existing)
- main_floor_tile (true/false)
- tile_quality (standard, mid-range, premium)

---

## ACTION RULES

**action: "ask_question"** — Use when:
- Missing required dimensions/measurements
- Need to clarify scope
- Presenting upsell options
- Showing the MANDATORY SUMMARY for confirmation
- Waiting for contractor to confirm "looks good"

**action: "generate_quote"** — ONLY when:
- All tile measurements collected
- Summary has been shown
- Contractor has EXPLICITLY confirmed ("looks good", "perfect", "yes", etc.)

---

## BATHROOM SIZE CATEGORIES
- small: Under 50 sq ft (5x8, 5x9)
- standard: 50-80 sq ft (8x10, 9x10)
- large: 80-150 sq ft (master bath)
- complex: 150+ sq ft (luxury master)`;

// ============================================================
// ESTIMATE SYSTEM PROMPT - V5 WITH SALES COACHING
// ============================================================

const estimateSystemPrompt = `# ESTIMAITE V5 - ESTIMATE GENERATOR WITH SALES COACHING

Generate a CLEAN, PROFESSIONAL estimate for the CONTRACTOR to present to their HOMEOWNER client.

Your output helps the contractor:
1. Show a professional scope breakdown to the homeowner
2. Track their internal costs and margins
3. Present optional upgrades strategically

---

## CRITICAL: TILE LINE ITEM BREAKDOWN

NEVER create a single "tile installation" line item. ALWAYS break into 3 components:

### WRONG (single bulk item):
Trade: Tile
  - "Shower tile to 96" ceiling + waterproofing + niche" → $3,103

### CORRECT (3 separate items):
Trade: Tile & Waterproofing
  line_items:
    - "Guest Bath 1: Shower wall tile to 96" ceiling (75 sqft) with full waterproofing and one recessed niche" → IC: $750, CP: $1,350
    - "Guest Bath 1: Custom tile shower pan with proper drainage (17 sqft) including sloped mud bed" → IC: $540, CP: $935
    - "Guest Bath 1: Bathroom floor tile (28 sqft) including substrate prep and tile removal" → IC: $260, CP: $464

## TILE PRICING FORMULA (per sqft)

### Wall Tile (vertical surfaces with waterproofing):
- Standard: $14/sqft CP (IC = $8)
- Mid-range: $18/sqft CP (IC = $10.50)
- Premium: $25/sqft CP (IC = $14.50)

### Shower Floor Tile (horizontal, sloped, mud bed):
- Standard: $45/sqft CP (IC = $26)
- Mid-range: $55/sqft CP (IC = $32)
- Premium: $70/sqft CP (IC = $40)
*More expensive due to mud bed work and sloping*

### Main Floor Tile (horizontal, flat):
- Standard: $12/sqft CP (IC = $7)
- Mid-range: $16/sqft CP (IC = $9)
- Premium: $22/sqft CP (IC = $13)

## SQFT CALCULATION

For a 3x5 shower tiled to 96":
- Back wall: 5' x 8' = 40 sqft
- Left wall: 3' x 8' = 24 sqft
- Right wall: 3' x 8' = 24 sqft
- Total walls: 88 sqft x 0.85 (door opening) = ~75 sqft

Shower floor: 3' x 5' x 1.1 (waste) = ~17 sqft

Main floor (if 5x8 bathroom):
- Room total: 40 sqft - 15 sqft (shower) = 25 sqft x 1.15 (waste) = ~29 sqft

## MULTI-ROOM FORMAT

When multiple bathrooms, create SEPARATE line items for EACH bathroom:

Trade: Tile & Waterproofing
  line_items:
    - room_label: "Guest Bath 1"
      description: "Guest Bath 1: Shower wall tile to 96" (75 sqft) with waterproofing and niche"
      internal_cost: 750
      customer_price: 1350
    - room_label: "Guest Bath 1"
      description: "Guest Bath 1: Custom tile shower pan (17 sqft) with mud bed and drainage"
      internal_cost: 540
      customer_price: 935
    - room_label: "Guest Bath 1"
      description: "Guest Bath 1: Bathroom floor tile (29 sqft) with substrate prep"
      internal_cost: 260
      customer_price: 464
    - room_label: "Guest Bath 2"
      description: "Guest Bath 2: Shower wall tile to 96" (75 sqft) with waterproofing and niche"
      internal_cost: 750
      customer_price: 1350
    [... and so on for each bathroom]

---

## SIZE-BASED PRICING (NON-TILE TRADES)

### SMALL BATHROOM (Under 50 sq ft) - TUB-TO-SHOWER CONVERSION
| Trade | IC Range |
|-------|----------|
| Demo (tub/surround) | $400 - $600 |
| Plumbing (conversion) | $2,000 - $2,800 |
| Framing | $300 - $500 |
| Glass (panel or door) | $800 - $1,200 |
| Niche (each) | $150 - $250 |

### SCOPE ADD-ONS (per room)
- Zero-entry/curbless: +$600-800 IC (extra framing + linear drain)
- Bench: +$400-600 IC
- Linear drain: +$300-450 IC

---

## TRADE ORDER

BATHROOM: Demo → Plumbing → Framing → Tile & Waterproofing → Glass → Paint & Trim

---

## CRITICAL RULES

1. **ALWAYS BREAK TILE INTO 3 COMPONENTS** - Wall, shower floor, main floor
2. **Include sqft in descriptions** - "(75 sqft)", "(17 sqft)", etc.
3. **SEPARATE LINE ITEMS PER ROOM** - Never bulk items like "Tile for 3 showers"
4. **Include room_label** - Every line item needs room_label field
5. **Price each component separately** - Use the sqft pricing formula
6. **Return INTERNAL COSTS (IC)** - System applies margin separately
7. **Include notes:** Estimate valid for 30 days, permits not included`;

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, conversation_history, customer, company, contractor_id } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
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

    // Step 1: Determine if we have enough info using Claude
    const conversationResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: conversationalSystemPrompt,
        messages: [
          ...historyMessages.slice(-10).map((m: { role: string; content: string }) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content
          })),
          { role: "user", content: message }
        ],
        tools: [
          {
            name: "respond",
            description: "Respond to the user - ask required scope/dimension/tile measurement questions OR generate the estimate.",
            input_schema: conversationSchema
          }
        ],
        tool_choice: { type: "tool", name: "respond" }
      }),
    });

    if (!conversationResponse.ok) {
      const status = conversationResponse.status;
      const errorText = await conversationResponse.text();
      console.error(`Claude API error (${status}):`, errorText);
      
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402 || status === 400) {
        return new Response(JSON.stringify({ error: "AI quota exceeded or invalid request" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Claude API error: ${status}`);
    }

    const conversationData = await conversationResponse.json();
    console.log("Claude response:", JSON.stringify(conversationData));
    
    // Extract tool use from Claude's response format
    const toolUseBlock = conversationData.content?.find((block: any) => block.type === "tool_use");
    
    if (!toolUseBlock) {
      throw new Error("No tool call in conversation response");
    }

    let parsedResponse;
    try {
      parsedResponse = toolUseBlock.input;
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

    // If showing summary for confirmation, return it and wait for user to confirm
    if (parsedResponse.action === "show_summary") {
      return new Response(JSON.stringify({
        needsMoreInfo: true,
        showingSummary: true,
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
    
    // Pre-calculate tile line items for each bathroom
    const tileLineItemsByRoom: Map<string, any[]> = new Map();
    
    for (const bath of bathrooms) {
      const label = bath.label || `Bathroom ${bath.id}`;
      const tileMeasurements: TileMeasurements = bath.tile_measurements || {
        shower_wall_dims: bath.shower_dims || bath.room_dims,
        ceiling_height: bath.scope?.ceiling_height || 96,
        shower_floor_type: bath.scope?.zero_entry ? 'curbless' : 'tile_pan',
        main_floor_tile: bath.scope?.floor_tile,
        room_sqft: bath.room_sqft,
        tile_quality: bath.tile_measurements?.tile_quality || 'standard'
      };
      
      // Generate tile line items using our calculation
      const tileItems = generateTileLineItems(label, tileMeasurements);
      tileLineItemsByRoom.set(label, tileItems);
      
      console.log(`Tile items for ${label}:`, JSON.stringify(tileItems));
    }
    
    const fullContext = historyMessages.map((m: { role: string; content: string }) => 
      `${m.role}: ${m.content}`
    ).join('\n');
    
    // Build room-specific context for the estimate prompt
    let roomContext = '';
    if (bathrooms.length > 0) {
      roomContext = `\n\nMULTIPLE BATHROOMS (${bathrooms.length} total):\n`;
      bathrooms.forEach((bath: any, idx: number) => {
        const label = bath.label || `Bathroom ${idx + 1}`;
        const tileMeasurements = bath.tile_measurements || {};
        roomContext += `\n${idx + 1}. ${label}:
   - Shower/tub dimensions: ${bath.shower_dims || bath.room_dims || tileMeasurements.shower_wall_dims || 'not specified'}
   - Ceiling height: ${tileMeasurements.ceiling_height || bath.scope?.ceiling_height || 96}"
   - Shower floor type: ${tileMeasurements.shower_floor_type || 'tile_pan'}
   - Main floor tile: ${tileMeasurements.main_floor_tile ? 'Yes' : 'No'}
   - Room sqft: ${tileMeasurements.room_sqft || bath.room_sqft || 40}
   - Tile quality: ${tileMeasurements.tile_quality || 'standard'}
   - Vanity: ${bath.vanity_size || 'not specified'}
   - Scope: ${JSON.stringify(bath.scope || {})}`;
        
        // Include pre-calculated tile pricing
        const preCalcTile = tileLineItemsByRoom.get(label);
        if (preCalcTile && preCalcTile.length > 0) {
          roomContext += `\n   - PRE-CALCULATED TILE LINE ITEMS (USE THESE EXACT VALUES):`;
          preCalcTile.forEach(item => {
            roomContext += `\n     * ${item.description} - IC: $${item.internal_cost}, CP: $${item.customer_price}`;
          });
        }
      });
      roomContext += '\n\nCRITICAL: Use the PRE-CALCULATED TILE LINE ITEMS above. Create SEPARATE line items for EACH tile component (wall, shower floor, main floor).';
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
2. ${bathrooms.length > 1 || kitchens.length > 1 ? 'Create SEPARATE line items for EACH room - DO NOT bulk items' : 'Create room-specific line items'}
3. FOR TILE: Use the PRE-CALCULATED values provided above - break into wall tile, shower floor, main floor
4. Each line item needs room_label field
5. Include scope_narrative for each trade
6. Return INTERNAL COSTS (IC) - system applies margin separately`;

    const estimateResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        system: estimateSystemPrompt,
        messages: [
          { role: "user", content: estimatePrompt }
        ],
        tools: [
          {
            name: "generate_estimate",
            description: "Generate a clean estimate with SEPARATE tile line items (wall, shower floor, main floor) for each room.",
            input_schema: estimateSchema
          }
        ],
        tool_choice: { type: "tool", name: "generate_estimate" }
      }),
    });

    if (!estimateResponse.ok) {
      const errorText = await estimateResponse.text();
      console.error("Estimate generation error:", errorText);
      throw new Error(`Estimate generation failed: ${estimateResponse.status}`);
    }

    const estimateData = await estimateResponse.json();
    console.log("Estimate response:", JSON.stringify(estimateData));
    
    // Extract tool use from Claude's response format
    const estimateToolUseBlock = estimateData.content?.find((block: any) => block.type === "tool_use");
    
    if (!estimateToolUseBlock) {
      throw new Error("No estimate tool call in response");
    }

    let estimate;
    try {
      estimate = estimateToolUseBlock.input;
    } catch (e) {
      throw new Error("Invalid estimate JSON");
    }
    
    // Step 4: Post-process to ensure tile items use our calculated values
    const tradesWithTileOverride = (estimate.trades || []).map((trade: any) => {
      // If this is the Tile trade, replace with our calculated values
      if (trade.trade_name.toLowerCase().includes('tile')) {
        const allTileItems: any[] = [];
        tileLineItemsByRoom.forEach((items, roomLabel) => {
          allTileItems.push(...items);
        });
        
        if (allTileItems.length > 0) {
          return {
            ...trade,
            line_items: allTileItems
          };
        }
      }
      return trade;
    });
    
    // Step 5: Calculate totals with margin applied
    const marginMultiplier = 1 / (1 - marginResult.margin_used); // e.g., 42% margin = 1.724x
    let subtotalIC = 0;
    let grandTotal = 0;
    
    // Apply margin to each line item and calculate totals
    const tradesWithMargin = tradesWithTileOverride.map((trade: any) => ({
      ...trade,
      line_items: (trade.line_items || []).map((item: any) => {
        const ic = item.internal_cost || 0;
        // For tile items, CP is already calculated; for others, apply margin
        const cp = item.customer_price || Math.round(ic * marginMultiplier);
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
