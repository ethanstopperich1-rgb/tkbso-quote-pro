import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadFollowupRequest {
  name: string;
  email: string;
  phone: string;
  message?: string;
  source: "contact" | "signup";
}

const RETELL_AGENT_ID = "agent_0a4cc74438b79e057e85212f85";

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, message, source }: LeadFollowupRequest = await req.json();

    console.log(`[lead-followup] Processing ${source} lead:`, { name, email, phone });

    // Validate required fields
    if (!name || !email || !phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, and phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { retellCall?: any; email?: any; errors: string[] } = { errors: [] };

    // 1. Trigger Retell AI Call
    const RETELL_API_KEY = Deno.env.get("RETELL_API_KEY");
    if (RETELL_API_KEY) {
      try {
        console.log("[lead-followup] Triggering Retell AI call...");
        
        const retellResponse = await fetch("https://api.retellai.com/v2/create-phone-call", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RETELL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from_number: "+14078195809",
            to_number: phone,
            agent_id: RETELL_AGENT_ID,
            retell_llm_dynamic_variables: {
              customer_name: name,
              customer_email: email,
              lead_source: source,
              message: message || "No message provided",
            },
          }),
        });

        if (retellResponse.ok) {
          results.retellCall = await retellResponse.json();
          console.log("[lead-followup] Retell call initiated:", results.retellCall);
        } else {
          const errorText = await retellResponse.text();
          console.error("[lead-followup] Retell API error:", retellResponse.status, errorText);
          results.errors.push(`Retell call failed: ${errorText}`);
        }
      } catch (retellError: unknown) {
        const errMsg = retellError instanceof Error ? retellError.message : String(retellError);
        console.error("[lead-followup] Retell error:", retellError);
        results.errors.push(`Retell error: ${errMsg}`);
      }
    } else {
      console.warn("[lead-followup] RETELL_API_KEY not configured");
      results.errors.push("Retell API key not configured");
    }

    // 2. Send Follow-up Email via Resend REST API
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      try {
        console.log("[lead-followup] Sending follow-up email...");

        const emailSubject = source === "signup" 
          ? "Welcome to EstimAIte - Let's Get You Started!" 
          : "Thanks for Reaching Out to EstimAIte";

        const emailHtml = source === "signup" 
          ? `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0F172A; font-size: 28px; margin-bottom: 10px;">Welcome to EstimAIte™</h1>
                <p style="color: #64748B; font-size: 16px;">The AI-Powered Estimating Platform for Contractors</p>
              </div>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                Thank you for signing up for EstimAIte! We're excited to help you create professional estimates in minutes, not hours.
              </p>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                <strong>You'll be receiving a call from our team shortly</strong> to walk you through the platform and answer any questions you might have.
              </p>
              
              <div style="background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center;">
                <p style="color: #0F172A; font-size: 18px; font-weight: 600; margin: 0;">Ready to create your first estimate?</p>
                <a href="https://estimaite.lovable.app/dashboard" style="display: inline-block; background: #0F172A; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 16px;">Go to Dashboard →</a>
              </div>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                If you have any questions before we call, feel free to reply to this email or call us at <strong>(407) 819-5809</strong>.
              </p>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                Best regards,<br/>
                <strong>The EstimAIte Team</strong>
              </p>
              
              <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
              
              <p style="color: #94A3B8; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} EstimAIte™. All rights reserved.<br/>
                <a href="https://estimaite.lovable.app/privacy" style="color: #94A3B8;">Privacy Policy</a> | 
                <a href="https://estimaite.lovable.app/terms" style="color: #94A3B8;">Terms of Service</a>
              </p>
            </div>
          `
          : `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0F172A; font-size: 28px; margin-bottom: 10px;">Thanks for Reaching Out!</h1>
                <p style="color: #64748B; font-size: 16px;">We received your message</p>
              </div>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                Thank you for contacting EstimAIte! We've received your message and someone from our team will be reaching out to you shortly.
              </p>
              
              ${message ? `
                <div style="background: #F8FAFC; border-left: 4px solid #00E5FF; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #64748B; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Your Message</p>
                  <p style="color: #334155; font-size: 14px; margin: 0; line-height: 1.5;">${message}</p>
                </div>
              ` : ''}
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                <strong>Expect a call from us soon!</strong> We're excited to learn more about your business and show you how EstimAIte can save you hours every week.
              </p>
              
              <div style="background: #0F172A; border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center;">
                <p style="color: white; font-size: 18px; font-weight: 600; margin: 0;">Want to try EstimAIte now?</p>
                <a href="https://estimaite.lovable.app/signup" style="display: inline-block; background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); color: #0F172A; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 16px;">Start 14-Day Free Trial →</a>
              </div>
              
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                Best regards,<br/>
                <strong>The EstimAIte Team</strong>
              </p>
              
              <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 30px 0;" />
              
              <p style="color: #94A3B8; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} EstimAIte™. All rights reserved.<br/>
                <a href="https://estimaite.lovable.app/privacy" style="color: #94A3B8;">Privacy Policy</a> | 
                <a href="https://estimaite.lovable.app/terms" style="color: #94A3B8;">Terms of Service</a>
              </p>
            </div>
          `;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "EstimAIte <onboarding@resend.dev>",
            to: [email],
            subject: emailSubject,
            html: emailHtml,
          }),
        });

        if (emailResponse.ok) {
          results.email = await emailResponse.json();
          console.log("[lead-followup] Email sent successfully:", results.email);
        } else {
          const errorText = await emailResponse.text();
          console.error("[lead-followup] Resend API error:", emailResponse.status, errorText);
          results.errors.push(`Email failed: ${errorText}`);
        }
      } catch (emailError: unknown) {
        const errMsg = emailError instanceof Error ? emailError.message : String(emailError);
        console.error("[lead-followup] Email error:", emailError);
        results.errors.push(`Email error: ${errMsg}`);
      }
    } else {
      console.warn("[lead-followup] RESEND_API_KEY not configured");
      results.errors.push("Resend API key not configured");
    }

    // Return results
    const success = results.retellCall || results.email;
    
    return new Response(
      JSON.stringify({
        success,
        message: success ? "Lead follow-up initiated" : "Follow-up failed",
        results,
      }),
      {
        status: success ? 200 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[lead-followup] Error:", error);
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
