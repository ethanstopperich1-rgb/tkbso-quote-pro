import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendProposalRequest {
  to: string;
  clientName: string;
  contractorName: string;
  contractorEmail: string;
  contractorPhone: string;
  projectLabel: string;
  customMessage: string;
  investmentAmount: string;
  pdfBase64: string;
  pdfFilename: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      to,
      clientName,
      contractorName,
      contractorEmail,
      contractorPhone,
      projectLabel,
      customMessage,
      investmentAmount,
      pdfBase64,
      pdfFilename,
    }: SendProposalRequest = await req.json();

    console.log("Sending proposal email to:", to);
    console.log("From contractor:", contractorName);
    console.log("Project:", projectLabel);

    // Convert base64 to buffer for attachment
    const pdfBuffer = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
    const pdfBase64Content = btoa(String.fromCharCode(...pdfBuffer));

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${contractorName} <onboarding@resend.dev>`,
        to: [to],
        subject: `Your ${projectLabel} Proposal from ${contractorName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600;">${contractorName}</h1>
              <p style="margin: 8px 0 0; opacity: 0.9; font-size: 14px;">Professional Remodeling Services</p>
            </div>
            
            <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 16px;">Dear ${clientName},</p>
              
              ${customMessage ? `<p style="font-size: 15px; color: #475569; margin-bottom: 24px; white-space: pre-wrap;">${customMessage}</p>` : ''}
              
              <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Your Investment</p>
                <p style="margin: 0; font-size: 32px; font-weight: 700; color: #0f172a;">${investmentAmount}</p>
              </div>
              
              <p style="font-size: 15px; color: #475569; margin-bottom: 24px;">
                Please find your detailed proposal attached to this email. If you have any questions or would like to discuss the project further, don't hesitate to reach out.
              </p>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 24px;">
                <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #0f172a;">Contact Us</p>
                ${contractorPhone ? `<p style="margin: 0 0 4px; font-size: 14px; color: #64748b;">📞 ${contractorPhone}</p>` : ''}
                ${contractorEmail ? `<p style="margin: 0; font-size: 14px; color: #64748b;">✉️ ${contractorEmail}</p>` : ''}
              </div>
            </div>
            
            <div style="background: #f1f5f9; padding: 16px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © ${new Date().getFullYear()} ${contractorName}. All rights reserved.
              </p>
            </div>
          </body>
          </html>
        `,
        attachments: [
          {
            filename: pdfFilename,
            content: pdfBase64Content,
          },
        ],
      }),
    });

    const responseData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", responseData);
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", responseData);

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-proposal-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
