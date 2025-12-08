import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VideoAnalysisResult {
  project_summary: string;
  line_items: Array<{
    category: string;
    item: string;
    quantity: number;
    unit: string;
    confidence: number;
    source: string;
  }>;
  timeline_notes: string | null;
  special_requests: string[];
  concerns_flagged: string[];
  transcript: string;
  room_dimensions: {
    length_ft: number | null;
    width_ft: number | null;
    confidence: number;
  } | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { videoFrames, audioTranscript, projectType } = await req.json();

    if (!videoFrames || !Array.isArray(videoFrames) || videoFrames.length === 0) {
      throw new Error('Video frames are required');
    }

    console.log(`Processing video with ${videoFrames.length} frames`);
    console.log(`Audio transcript length: ${audioTranscript?.length || 0} characters`);

    // Build the analysis prompt
    const systemPrompt = `You are an expert Kitchen & Bath remodeling estimator analyzing a contractor's video walkthrough. Your job is to extract scope details and map them to specific line items.

AVAILABLE TRADE CATEGORIES:
- Site Protection & Setup
- Standard Demolition
- Heavy/Difficult Demo
- Disposal & Logistics
- Water Damage & Rot Repair
- Hidden Structural Issues
- Code-Mandated Upgrades
- Plumbing
- Specialty Plumbing Systems
- Electrical
- Smart Home / Specialty Electrical
- Tile & Waterproofing
- Tile Specialty Work
- Cabinetry & Vanities
- Cabinet Customization
- Glass
- Paint & Drywall
- Trim & Millwork
- Framing
- Flooring
- Structural / Complex Work
- Countertop Fabrication Add-Ons
- Decorative Finishes
- Mechanicals & Appliances
- Miscellaneous Always-Needed
- Allowances

EXTRACTION RULES:
1. Cross-reference narration with visual elements
2. Use narration for client intent/preferences
3. Use video frames for quantities (count fixtures, estimate dimensions)
4. Flag any discrepancies between narration and visuals
5. Identify concerns mentioned or visible (water damage, mold, structural issues)
6. Extract timeline hints if mentioned
7. Suggest commonly forgotten items based on scope

For dimensions:
- Use standard reference objects (doors are 80" tall, outlets are 4.5" wide, standard counters are 36" high)
- If a person is visible, average adult height is 5'7"

OUTPUT MUST BE VALID JSON matching this schema:
{
  "project_summary": "Brief summary of the project scope",
  "line_items": [
    {
      "category": "Category Name",
      "item": "Line Item Name",
      "quantity": 1,
      "unit": "each|per sqft|per LF|per room",
      "confidence": 0.85,
      "source": "Description of where this was detected"
    }
  ],
  "timeline_notes": "Any timeline requirements mentioned or null",
  "special_requests": ["Array of specific client requests"],
  "concerns_flagged": ["Array of concerns identified"],
  "transcript": "The provided transcript",
  "room_dimensions": {
    "length_ft": 10,
    "width_ft": 8,
    "confidence": 0.7
  }
}`;

    const userPrompt = `Analyze this ${projectType || 'remodeling'} video walkthrough.

${audioTranscript ? `CONTRACTOR'S NARRATION TRANSCRIPT:
"${audioTranscript}"

` : ''}I am providing ${videoFrames.length} frames from the video. Analyze them to:
1. Identify all fixtures, materials, and finishes visible
2. Estimate room dimensions using visual references
3. Cross-reference with the narration to understand scope
4. Flag any concerns (water damage, mold, structural issues, code violations)
5. Generate a comprehensive list of line items for the estimate

Be thorough - contractors often forget items like:
- Floor protection during demo
- Permit fees
- Final caulking/sealing
- Soft-close hinge upgrades
- Code-required GFCI outlets
- Waterproofing for wet areas`;

    // Build message content with frames
    const messageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: 'text', text: userPrompt }
    ];

    // Add frames as images (limit to 10 frames to stay within token limits)
    const framesToAnalyze = videoFrames.slice(0, 10);
    for (const frame of framesToAnalyze) {
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: frame.startsWith('data:') ? frame : `data:image/jpeg;base64,${frame}`
        }
      });
    }

    console.log(`Sending ${framesToAnalyze.length} frames to Gemini for analysis`);

    // Call Lovable AI Gateway with Gemini Flash for vision
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messageContent }
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI response received, parsing...');

    // Parse the JSON response
    let analysisResult: VideoAnalysisResult;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      const jsonString = jsonMatch[1] || content;
      analysisResult = JSON.parse(jsonString.trim());
      
      // Ensure transcript is included
      if (audioTranscript && !analysisResult.transcript) {
        analysisResult.transcript = audioTranscript;
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw response:', content);
      
      // Return a structured error response
      return new Response(
        JSON.stringify({
          error: 'Failed to parse analysis results',
          raw_response: content,
          project_summary: 'Analysis completed but results could not be parsed',
          line_items: [],
          timeline_notes: null,
          special_requests: [],
          concerns_flagged: ['Unable to parse AI response - manual review required'],
          transcript: audioTranscript || '',
          room_dimensions: null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and enhance the response
    const enhancedResult = {
      ...analysisResult,
      line_items: (analysisResult.line_items || []).map(item => ({
        ...item,
        confidence: Math.min(1, Math.max(0, item.confidence || 0.5)),
        quantity: Math.max(1, item.quantity || 1),
        unit: item.unit || 'each'
      })),
      special_requests: analysisResult.special_requests || [],
      concerns_flagged: analysisResult.concerns_flagged || [],
      frames_analyzed: framesToAnalyze.length,
      total_frames_received: videoFrames.length
    };

    console.log(`Analysis complete: ${enhancedResult.line_items.length} line items detected`);

    return new Response(
      JSON.stringify(enhancedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing video:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        line_items: [],
        project_summary: '',
        transcript: '',
        special_requests: [],
        concerns_flagged: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
