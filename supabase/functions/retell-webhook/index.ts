import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RetellWebhookEvent {
  event: string;
  call: {
    call_id: string;
    agent_id: string;
    call_status: string;
    start_timestamp?: number;
    end_timestamp?: number;
    transcript?: string;
    recording_url?: string;
    call_analysis?: {
      call_summary?: string;
      user_sentiment?: string;
      call_successful?: boolean;
      custom_analysis_data?: Record<string, unknown>;
    };
    metadata?: Record<string, unknown>;
    retell_llm_dynamic_variables?: {
      customer_name?: string;
      customer_email?: string;
      lead_source?: string;
      message?: string;
    };
  };
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const event: RetellWebhookEvent = await req.json();
    
    console.log("[retell-webhook] Received event:", event.event);
    console.log("[retell-webhook] Call ID:", event.call?.call_id);
    console.log("[retell-webhook] Call Status:", event.call?.call_status);

    // Handle different event types
    switch (event.event) {
      case "call_started":
        console.log("[retell-webhook] Call started for:", event.call?.retell_llm_dynamic_variables?.customer_name);
        break;

      case "call_ended":
        console.log("[retell-webhook] Call ended");
        console.log("[retell-webhook] Duration:", 
          event.call?.end_timestamp && event.call?.start_timestamp 
            ? Math.round((event.call.end_timestamp - event.call.start_timestamp) / 1000) + "s"
            : "unknown"
        );
        console.log("[retell-webhook] Transcript:", event.call?.transcript?.substring(0, 500));
        
        // Log call analysis if available
        if (event.call?.call_analysis) {
          console.log("[retell-webhook] Call Summary:", event.call.call_analysis.call_summary);
          console.log("[retell-webhook] User Sentiment:", event.call.call_analysis.user_sentiment);
          console.log("[retell-webhook] Call Successful:", event.call.call_analysis.call_successful);
        }

        // You can add database logging here:
        // await supabase.from('call_logs').insert({
        //   call_id: event.call.call_id,
        //   customer_name: event.call.retell_llm_dynamic_variables?.customer_name,
        //   customer_email: event.call.retell_llm_dynamic_variables?.customer_email,
        //   transcript: event.call.transcript,
        //   call_summary: event.call.call_analysis?.call_summary,
        //   sentiment: event.call.call_analysis?.user_sentiment,
        //   successful: event.call.call_analysis?.call_successful,
        //   duration_seconds: Math.round((event.call.end_timestamp - event.call.start_timestamp) / 1000),
        //   recording_url: event.call.recording_url,
        //   created_at: new Date().toISOString()
        // });
        break;

      case "call_analyzed":
        console.log("[retell-webhook] Call analysis complete");
        console.log("[retell-webhook] Summary:", event.call?.call_analysis?.call_summary);
        break;

      default:
        console.log("[retell-webhook] Unknown event type:", event.event);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Webhook received: ${event.event}`,
        call_id: event.call?.call_id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[retell-webhook] Error processing webhook:", error);
    
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
