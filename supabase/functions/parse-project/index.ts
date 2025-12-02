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

    const systemPrompt = `### SYSTEM INSTRUCTION: The Structural Parser

**IDENTITY:**
You are the "Estimaitor" Intelligence Engine. Your sole purpose is to convert messy, unstructured construction notes into a structured JSON pricing payload.

**CORE DIRECTIVE:**
Read the user's stream-of-consciousness project description. Identify every **Trade Task**, **Material**, and **Dimension**. Map them strictly to the "Trade Buckets" below.

**LOGIC RULES:**
1. **Detect "Scope Level":** If the user says "Full Gut," automatically trigger "Demo & Haul-Off" for the entire calculated SqFt.
2. **Handle Exclusions:** If a user mentions "another contractor" (e.g., sauna), DO NOT price the finish material, only the "Rough-in" preparation if implied.
3. **Dimensions:**
   - Look for specific entity dimensions (e.g., "Shower is 16 sqft").
   - If "Walls are 10 feet tall," use this to calculate Wall SqFt for paint/tile (Perimeter * Height).
4. **Implicit Tasks:**
   - "Move the tub" -> IMPLIES: 1. Demo old tub, 2. Rough Plumbing (Move drain/supply), 3. Install new tub.
   - "Remove soffits" -> IMPLIES: 1. Demo, 2. Drywall Patching/Finishing.

**OUTPUT SCHEMA (Strict JSON):**
Return ONLY a JSON object. Do not chat.

{
  "project_header": {
    "client_name": "String",
    "project_type": "String",
    "overall_size_sqft": Number (Extract or Estimate)
  },
  "dimensions": {
    "ceiling_height_ft": Number,
    "shower_floor_sqft": Number,
    "main_floor_sqft": Number
  },
  "trade_buckets": [
    {
      "category": "String (e.g., Demolition, Plumbing, Framing)",
      "task_description": "String (Specific action, e.g., 'Remove left wall vanity & cap plumbing')",
      "quantity": Number,
      "unit": "String (sqft, ea, lf)",
      "margin_override": "String (Optional, e.g., 'High' for complex framing)"
    }
  ],
  "allowances": [
    { "item": "String", "quantity": Number, "notes": "String" }
  ],
  "exclusions": ["String"]
}

CONVERSATION CONTEXT:
${JSON.stringify(context || {})}

**Important:** Always return valid JSON matching the schema above. Do not include markdown code blocks or extra text.`;

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
