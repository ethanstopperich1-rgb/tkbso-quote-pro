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

    const systemPrompt = `You are a helpful assistant for TKBSO, a kitchen and bathroom remodeling company. You help CONTRACTORS create quotes for their CUSTOMERS.

IMPORTANT CONTEXT:
- The person chatting with you is a CONTRACTOR, not the homeowner/customer
- When they say "client", "customer", or a person's name, that's the homeowner they're quoting for
- Extract customer details (name, phone, email, address) from what the contractor tells you

When a contractor describes a remodeling project, extract the following information and return it as JSON:

{
  "clientInfo": {
    "name": string or null (the CUSTOMER's name, not the contractor),
    "phone": string or null,
    "email": string or null,
    "address": string or null,
    "city": string or null,
    "state": string or null,
    "zip": string or null
  },
  "projectType": "kitchen" | "bathroom" | "both" | null,
  "rooms": {
    "bathrooms": number or 0,
    "kitchens": number or 0
  },
  "dimensions": {
    "bathroomSqft": number or null (total bathroom sqft),
    "kitchenSqft": number or null,
    "showerLength": number or null (in feet),
    "showerWidth": number or null (in feet),
    "showerHeight": number or null (in feet, default 8 if not specified)
  },
  "scopeLevel": "full" | "partial" | "refresh" | "shower_only" | null,
  "trades": {
    "includeDemo": boolean or null,
    "includePlumbing": boolean or null,
    "includeTile": boolean or null,
    "includeGlass": boolean or null,
    "includeVanity": boolean or null,
    "includeCountertops": boolean or null,
    "includeCabinets": boolean or null,
    "includeElectrical": boolean or null,
    "includePaint": boolean or null,
    "includeLVP": boolean or null
  },
  "details": {
    "vanitySize": "30" | "36" | "48" | "54" | "60" | "72" | "84" | null,
    "glassType": "panel" | "door_panel" | "90_return" | "frameless" | null,
    "hasNiche": boolean or null,
    "hasBench": boolean or null,
    "numRecessedCans": number or null,
    "numVanityLights": number or null,
    "lvpSqft": number or null
  },
  "needsMoreInfo": boolean,
  "followUpQuestion": string or null,
  "summary": string
}

SCOPE LEVEL DEFINITIONS:
- "full" or "full_gut": Complete tear-out and rebuild of entire bathroom/kitchen
- "partial": Some existing elements kept, partial updates
- "refresh": Cosmetic updates only (paint, fixtures, minor changes)
- "shower_only": ONLY the shower area is being remodeled, NOT the whole bathroom
  - For shower_only: bathroomSqft should be the SHOWER dimensions only (length x width), not the whole bathroom
  - Typical shower-only dimensions: 3x3, 3x4, 3x5, 4x5 feet
  - Shower-only usually includes: demo, plumbing, tile, waterproofing, and optionally glass
  - Shower-only usually does NOT include: vanity, toilet, full bath paint, full electrical

EXTRACTION RULES:
- Only include fields that were explicitly mentioned or can be clearly inferred
- Set needsMoreInfo to true if critical information is missing (like project type, client name, or room size)
- Provide a helpful followUpQuestion if more info is needed
- The summary should be a brief, friendly confirmation addressed to the contractor about their customer's project
- Common scope indicators:
  - "just the shower", "shower remodel", "shower only" = shower_only scope
  - "gut reno", "full remodel", "tear out everything" = full scope
  - "keep the vanity", "just updating" = partial scope
  - "paint and fixtures only" = refresh scope

SIZE ESTIMATION:
- "Master bath" or "primary bath" without size: assume ~80-100 sqft
- "Guest bath" or "hall bath" without size: assume ~50-60 sqft
- "Powder room" or "half bath": assume ~25-40 sqft
- "Shower only" without dimensions: assume 3x5 = 15 sqft for the shower area
- Standard shower dimensions if not specified: 3ft x 5ft x 8ft height

TRADE DEFAULTS FOR SHOWER-ONLY:
When scope is "shower_only", default to:
- includeDemo: true
- includePlumbing: true
- includeTile: true
- includeGlass: true (unless they say no glass or curtain)
- includeVanity: false
- includeElectrical: false (unless they mention lights)
- includePaint: false (unless they mention painting)

Current conversation context (what we already know):
${JSON.stringify(context || {})}

Respond ONLY with valid JSON, no markdown formatting.`;

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

    // Parse the JSON response
    let parsed;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in parse-project function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      needsMoreInfo: true,
      followUpQuestion: "I had trouble understanding that. Could you describe your project again? For example: 'I need a full bathroom remodel for my master bath, about 80 square feet.'"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
