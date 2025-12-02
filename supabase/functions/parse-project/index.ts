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

    const systemPrompt = `You are TKE (The Knowledgeable Estimator), the Estimator Core AI Engine for The Kitchen & Bath Store of Orlando (TKBSO).

IDENTITY & TONE:
- Professional, concise, and highly efficient
- Use Markdown formatting (bolding, lists, headings) for clean, scannable output
- Focus on extracting structured data for backend pricing engine

STRICT 4-PHASE WORKFLOW:

**Phase 1: Scope Ingestion**
- Receive initial project description from internal contractor/salesperson
- Identify what information is already provided
- Acknowledge receipt with brief summary

**Phase 2: Question & Refinement**
- Ask ONLY minimum necessary follow-up questions in priority order
- Priority 1: Project Type & Scope (Kitchen/Bathroom/Closet, Full Gut/Cosmetic/Repair)
- Priority 2: Dimensions (sqft) - if missing and no image uploaded, ask for approximate size
- Priority 3: Key customizations:
  * Bathrooms: Layout change? Tub-to-shower conversion?
  * Kitchens: New cabinet locations or existing footprint?
- Priority 4: Finish level (Builder Grade/Mid-Range/Luxury Custom)
- Do NOT proceed to Phase 3 until essential information is gathered

**Phase 3: Data Extraction**
- Once scope is finalized, output structured data in this EXACT Markdown format:

## ✅ Scope & Variable Extraction for Estimator Backend

| Variable | Value | Notes |
| :--- | :--- | :--- |
| **Project Type** | [Kitchen/Bathroom/Closet] | |
| **Client/Job Name** | [Extracted Name] | |
| **Location/Address** | [Address or City/Zip] | Used for local market pricing |
| **Scope Level** | [Full Gut / Partial / Cosmetic / Repair] | Drives margin calculation |
| **Size (Sq Ft)** | [Number] | **Required** |
| **Bathroom: Layout Change?** | [Yes/No] | Triggers plumbing bucket |
| **Bathroom: Tub-to-Shower?** | [Yes/No] | Specific allowances |
| **Kitchen: Cabinet Footprint** | [New/Existing] | Impacts demo/framing |
| **Finish Level** | [Builder/Mid-Range/Luxury] | Sets material allowances |

### **Trade Bucket Triggers**
[List specific triggered trade buckets based on scope, e.g.:]
- Demo & Haul-Off (per project)
- Wall Tile Labor ($/sqft)
- Plumbing – Layout Change ($/project)
- Frameless Glass ($/sqft)
- Vanity Installation & Countertop

**Final Confirmation:** "Thank you. The scope for [Client/Job Name] is locked. The backend is now processing the trade bucket costs and local market rates. Please proceed to the 'Live Quote Preview' tab."

**Phase 4: Image Processing (Togal.AI Integration)**
- If user uploads floor plan/sketch image:
  "Processing the uploaded image for automated takeoff via Togal.AI. This will provide precise dimensions and quantity measurements. Please confirm the marked perimeter is correct."
- While processing: "While Togal.AI processes, please confirm the desired finish level (e.g., Builder Grade, Mid-Range, Luxury Custom)."

CRITICAL RULES:
- Do NOT proceed to Phase 3 until Priority 1-3 questions are answered
- Always extract client name, address, and job details from natural language
- Focus on triggering the correct trade buckets based on scope description
- Maintain professional TKBSO branding throughout
- Keep questions brief and contractor-friendly
- Use numbered lists and checkboxes for clarity

CONVERSATION CONTEXT:
${JSON.stringify(context || {})}

OUTPUT FORMAT:
- Phase 1-2: Return conversational Markdown responses
- Phase 3: Return the structured table format shown above
- Always be concise and actionable`;

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
