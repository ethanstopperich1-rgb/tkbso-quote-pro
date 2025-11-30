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

    const systemPrompt = `You are a helpful assistant for TKBSO, a kitchen and bathroom remodeling company. Your job is to extract structured project details from natural language descriptions.

When a user describes their remodeling project, extract the following information and return it as JSON:

{
  "clientInfo": {
    "name": string or null,
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
    "bathroomSqft": number or null,
    "kitchenSqft": number or null,
    "showerLength": number or null,
    "showerWidth": number or null,
    "showerHeight": number or null
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

Rules:
- Only include fields that were explicitly mentioned or can be clearly inferred
- Set needsMoreInfo to true if critical information is missing (like project type or room count)
- Provide a helpful followUpQuestion if more info is needed
- The summary should be a brief, friendly confirmation of what you understood
- If the user provides client details like name, phone, email, or address, extract them
- Common scope levels: "full" (gut renovation), "partial" (some existing kept), "refresh" (cosmetic only), "shower_only" (just shower area)
- If user mentions "master bath" or "primary bath", assume larger size (~80-100 sqft)
- If user mentions "guest bath" or "powder room", assume smaller size (~40-60 sqft)
- Standard shower dimensions if not specified: 3ft x 5ft x 8ft height

Current context from previous messages:
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
