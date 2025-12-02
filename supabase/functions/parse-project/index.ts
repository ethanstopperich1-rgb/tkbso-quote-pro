import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const systemPrompt = `### SYSTEM INSTRUCTION: Construction Estimator AI

**IDENTITY:**
You are the "Estimaitor" Intelligence Engine. Convert natural language project descriptions into structured JSON pricing payloads with accurate dimensions and quantities.

**CRITICAL MEASUREMENT EXTRACTION RULES:**

1. **Bathroom Dimensions:**
   - Extract room dimensions (length × width) to calculate floor_sqft
   - Extract ceiling height (default 8 ft if not mentioned)
   - For showers: Extract shower dimensions separately (e.g., "3x5 shower" = 15 sqft floor, ~64 sqft walls at 8ft height)
   - Calculate wall tile area: (2 × (length + width)) × height_ft
   - Calculate shower floor tile separately from main bathroom floor
   - Example: "5x8 bathroom with 3x5 shower" = 40 sqft room, 15 sqft shower floor, 64 sqft shower walls

2. **Kitchen Dimensions:**
   - Extract total kitchen size in sqft
   - Extract countertop linear feet or sqft (typical depth 2ft, so 10 LF = ~20 sqft)
   - Extract backsplash area if mentioned (typical 18" high behind counters)

3. **Scope Detection & Trade Buckets:**
   - **Demo:** ALWAYS include for "full gut", "remodel", "renovation". Match to project size:
     - "demo_shower_only" (showers under 20 sqft)
     - "demo_small_bath" (bathrooms under 50 sqft)
     - "demo_large_bath" (bathrooms 50+ sqft)
     - "demo_kitchen" (kitchens)
   
   - **Plumbing:** Extract each fixture type and count:
     - "Standard shower plumbing" (1 head, standard valve)
     - "Extra shower head" (additional heads beyond 1)
     - "Toilet swap" (toilet mentioned, not relocated)
     - "Freestanding tub plumbing" (if freestanding tub mentioned)
     - "Tub to shower conversion" (if converting tub to shower)
   
   - **Tile Work:** Calculate exact sqft for EACH surface:
     - Wall tile: Calculate from shower/bathroom perimeter × height
     - Shower floor tile: Shower floor area only
     - Main floor tile: Bathroom floor area minus shower area
   
   - **Electrical:** Count each fixture:
     - "Recessed can light" (count each can mentioned, default 2-3 for bathroom)
     - "Vanity light fixture" (count each vanity)
   
   - **Glass:** Detect glass type from description:
     - "frameless glass shower" or "glass enclosure" → "Glass Shower Standard"
     - "glass panel only" → "Glass Panel Only"
     - "90 degree return" → "Glass 90 Return"
   
   - **Vanity:** Extract size from description:
     - "30", "36", "48", "54", "60", "72", "84" inch vanity
     - Default to 48" if size not mentioned
   
   - **Framing:** Look for:
     - "niche" → quantity count
     - "blocking" or "framing" → "Standard Framing"
   
   - **Waterproofing:** Include for ALL tile work, match total tile area
   
   - **Cement Board:** Include for ALL tile work, match total tile area
   
   - **Paint:** Detect from keywords:
     - "paint" mentioned → "Paint - Patch & Touch-up"
     - "full paint" or "complete painting" → "Paint - Full Bathroom"

4. **Quantity Calculation Logic:**
   - If user says "3x5 shower": shower_floor_sqft = 15, shower_wall_sqft = 64 (perimeter 16 × 8ft height)
   - If user says "tile entire bathroom": Include both shower walls AND main floor
   - If user says "2 recessed lights": quantity = 2
   - Always calculate waterproofing & cement board as same sqft as tile

5. **Implicit Task Inference:**
   - "Full gut" → Demo + all utilities (plumbing, electrical)
   - "Shower remodel" → Demo shower + plumbing + tile + waterproofing + cement board + glass
   - "Move toilet" → Toilet relocation plumbing (not just swap)
   - "Add vanity light" → Electrical vanity light install

**OUTPUT SCHEMA (STRICT JSON):**
Return ONLY valid JSON. No markdown, no code blocks, no extra text.

{
  "project_header": {
    "client_name": "string or null",
    "project_type": "Bathroom|Kitchen|Combination",
    "overall_size_sqft": number
  },
  "dimensions": {
    "ceiling_height_ft": number,
    "room_length_ft": number,
    "room_width_ft": number,
    "shower_length_ft": number,
    "shower_width_ft": number,
    "shower_floor_sqft": number,
    "shower_wall_sqft": number,
    "main_floor_sqft": number,
    "countertop_sqft": number
  },
  "trade_buckets": [
    {
      "category": "Demolition|Plumbing|Tile|Waterproofing|Cement Board|Electrical|Glass|Vanity|Framing|Paint",
      "task_description": "Specific action (e.g., 'Remove shower fixture and tile to studs')",
      "quantity": number,
      "unit": "sqft|ea|lf"
    }
  ],
  "allowances": [
    { "item": "string", "quantity": number, "notes": "string" }
  ],
  "exclusions": ["string"]
}

**CONVERSATION CONTEXT:**
${JSON.stringify(context || {})}

**CRITICAL:** 
- Always calculate wall tile area from dimensions (not just room sqft)
- Always separate shower floor tile from main floor tile
- Always include waterproofing + cement board equal to total tile sqft
- Count each electrical fixture explicitly
- Match demo scope to project size (shower_only vs small_bath vs large_bath)

Return ONLY the JSON object. No explanations, no markdown.`;

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
          { role: "user", content: message }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service quota exceeded." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    // TKE can return either Markdown (Phases 1-2) or structured data (Phase 3)
    // Try to detect which format we received
    let parsed;
    
    // Check if response contains the structured table format (Phase 3)
    if (content.includes("✅ Scope & Variable Extraction") || content.includes("Trade Bucket Triggers")) {
      // This is Phase 3 Markdown output - return as-is for display
      return new Response(JSON.stringify({ 
        content: content,
        isMarkdown: true,
        phase: 3
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Try to parse as JSON (legacy format or structured data)
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleanContent);
      
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      // Not JSON - treat as Markdown response (Phases 1-2)
      return new Response(JSON.stringify({ 
        content: content,
        isMarkdown: true,
        phase: content.toLowerCase().includes("thank you") ? 3 : 1
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error in parse-project function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      needsMoreInfo: true,
      followUpQuestion: "I had trouble understanding that. Could you describe your project again?"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
