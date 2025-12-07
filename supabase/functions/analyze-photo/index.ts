import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VISION_SYSTEM_PROMPT = `You are a construction site visual analyzer for remodeling projects. Analyze this remodeling site image and identify ALL visible trade items.

For each item you detect, categorize it into the appropriate trade bucket:

**DEMOLITION:**
- Existing cabinets, countertops, fixtures to be removed
- Old flooring, tile, drywall to demo
- Estimate demolition scope (small, medium, large)

**PLUMBING:**
- Sinks, faucets, toilets, shower heads, tub fixtures
- Visible plumbing pipes or connections
- Number and type of fixtures

**ELECTRICAL:**
- Light fixtures, outlets, switches
- Recessed cans (count them)
- Vanity lights, under-cabinet lighting

**TILE:**
- Wall tile areas (estimate sqft if possible)
- Floor tile areas
- Shower floor tile
- Note tile type if visible (subway, large format, mosaic)

**CABINETRY:**
- Kitchen cabinets (estimate linear feet or box count)
- Bathroom vanities (estimate size in inches)
- Note style if visible (shaker, flat panel, etc.)

**COUNTERTOPS:**
- Countertop material (quartz, granite, laminate)
- Estimate square footage if possible

**GLASS:**
- Shower glass (frameless, semi-frameless, framed)
- Shower door type (door+panel, panel only, 90° return)

**FLOORING:**
- LVP, tile, hardwood visible
- Estimate room size

**FRAMING/STRUCTURAL:**
- Wall modifications needed
- Niche locations
- Structural changes visible

**ACCESSORIES:**
- Mirrors (count and estimate size if visible)
- Towel bars (count)
- Towel rings (count)
- Toilet paper holders (count)
- Robe hooks
- Shower shelves or niches

Output your analysis as a JSON object with this structure:
{
  "project_type": "Kitchen" | "Bathroom" | "Unknown",
  "confidence": "high" | "medium" | "low",
  "detected_items": [
    {
      "category": "string (Demo, Plumbing, Electrical, Tile, Cabinetry, Countertops, Glass, Flooring, Framing, Accessories)",
      "item": "string description",
      "quantity": number,
      "unit": "ea" | "sqft" | "lf" | "box",
      "notes": "optional details"
    }
  ],
  "estimated_dimensions": {
    "room_length_ft": number | null,
    "room_width_ft": number | null,
    "ceiling_height_ft": number | null,
    "shower_length_ft": number | null,
    "shower_width_ft": number | null
  },
  "observations": "Brief summary of what you see and any recommendations for the contractor"
}

Be thorough but realistic. Only report items you can actually see or reasonably infer from the image.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_base64, image_url, mime_type } = await req.json();

    if (!image_base64 && !image_url) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing image with Gemini Vision...');

    // Build the image content for Gemini
    const imageContent = image_base64 
      ? { type: 'image_url', image_url: { url: `data:${mime_type || 'image/jpeg'};base64,${image_base64}` } }
      : { type: 'image_url', image_url: { url: image_url } };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: VISION_SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: 'Analyze this remodeling site photo and list all visible trade items as structured JSON.' },
              imageContent
            ]
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI quota exceeded. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Vision API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from vision model');
    }

    console.log('Vision analysis complete');

    // Parse the JSON response
    let analysis;
    try {
      // Handle potential markdown code blocks
      let jsonStr = content;
      if (content.includes('```json')) {
        jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (content.includes('```')) {
        jsonStr = content.replace(/```\n?/g, '').trim();
      }
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse vision response:', parseError);
      // Return raw content if parsing fails
      analysis = {
        project_type: 'Unknown',
        confidence: 'low',
        detected_items: [],
        observations: content,
        parse_error: true
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        raw_response: content
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Photo analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to analyze photo',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
