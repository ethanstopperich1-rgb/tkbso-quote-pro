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

// Extract first name from full name
function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] || fullName;
}

// Generate contact email HTML - World-class conversion-focused template
function generateContactEmailHtml(name: string, message?: string): string {
  const firstName = getFirstName(name);
  const currentYear = new Date().getFullYear();
  const signupUrl = "https://estimaite.lovable.app/signup?ref=contact&early=true";
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to EstimAIte</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0F172A;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
          
          <!-- Logo Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 30px;">
              <img src="https://bepdsritihnkfseurqjl.supabase.co/storage/v1/object/public/assets/estimaite-logo-tm.png" alt="EstimAIte" style="height: 40px; width: auto;" />
            </td>
          </tr>
          
          <!-- Main Content Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1E293B; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 40px 32px;">
                    
                    <!-- Greeting -->
                    <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0 0 24px 0;">
                      Hey ${firstName}! 👋
                    </h1>
                    
                    <!-- Quote their message -->
                    ${message ? `
                    <div style="background: linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%); border-left: 4px solid #00E5FF; padding: 16px 20px; margin: 0 0 24px 0; border-radius: 0 8px 8px 0;">
                      <p style="color: #94A3B8; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Your Message</p>
                      <p style="color: #E2E8F0; font-size: 15px; margin: 0; line-height: 1.5; font-style: italic;">"${message}"</p>
                    </div>
                    ` : ''}
                    
                    <!-- Empathy paragraph -->
                    <p style="color: #CBD5E1; font-size: 16px; line-height: 1.7; margin: 0 0 24px 0;">
                      I hear you. Spending 2-4 hours on each estimate while juggling jobs, managing subs, and putting out fires? It's exhausting. That's exactly why I built EstimAIte.
                    </p>
                    
                    <!-- Value Props Box -->
                    <div style="background: linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%); border-radius: 12px; padding: 24px; margin: 0 0 24px 0;">
                      <p style="color: #00E5FF; font-size: 14px; font-weight: 600; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                        Here's what you can do right now:
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 6px 0; color: #FFFFFF; font-size: 15px;">✓ Create a complete bathroom estimate in under 3 minutes</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #FFFFFF; font-size: 15px;">✓ Generate professional branded PDFs automatically</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #FFFFFF; font-size: 15px;">✓ Track margins so you never leave money on the table</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #FFFFFF; font-size: 15px;">✓ Work from your phone while on-site</td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Credibility -->
                    <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; font-style: italic;">
                      Built by a contractor with 20+ years in kitchen & bath remodeling. Not by Silicon Valley engineers who've never swung a hammer.
                    </p>
                    
                    <!-- Launch Badge -->
                    <div style="text-align: center; margin: 0 0 24px 0;">
                      <span style="display: inline-block; background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); color: #0F172A; font-size: 14px; font-weight: 700; padding: 8px 20px; border-radius: 20px;">
                        🚀 Launching January 1, 2026
                      </span>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 0 0 16px 0;">
                      <a href="${signupUrl}" style="display: inline-block; background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); color: #0F172A; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: 700;">
                        Start Your Free Trial →
                      </a>
                    </div>
                    
                    <!-- Trust badges -->
                    <p style="color: #64748B; font-size: 12px; text-align: center; margin: 0 0 32px 0;">
                      14-day free trial • No credit card required • Cancel anytime
                    </p>
                    
                    <!-- What Happens Next -->
                    <div style="background: #0F172A; border-radius: 12px; padding: 24px; margin: 0 0 24px 0;">
                      <p style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
                        What happens next:
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0; vertical-align: top; width: 36px;">
                            <div style="background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; color: #0F172A; font-weight: 700; font-size: 12px;">1</div>
                          </td>
                          <td style="padding: 8px 0; color: #CBD5E1; font-size: 14px;">
                            <strong style="color: #FFFFFF;">Try it yourself</strong> - Sign up, create your first estimate in 3 minutes
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; vertical-align: top; width: 36px;">
                            <div style="background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; color: #0F172A; font-weight: 700; font-size: 12px;">2</div>
                          </td>
                          <td style="padding: 8px 0; color: #CBD5E1; font-size: 14px;">
                            <strong style="color: #FFFFFF;">We'll reach out</strong> - Within 24 hours to see how it went and answer questions
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; vertical-align: top; width: 36px;">
                            <div style="background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; color: #0F172A; font-weight: 700; font-size: 12px;">3</div>
                          </td>
                          <td style="padding: 8px 0; color: #CBD5E1; font-size: 14px;">
                            <strong style="color: #FFFFFF;">Early access</strong> - Lock in launch pricing before it goes up
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Stats Row -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 24px 0;">
                      <tr>
                        <td style="text-align: center; padding: 16px; background: rgba(0, 229, 255, 0.1); border-radius: 8px 0 0 8px;">
                          <p style="color: #00E5FF; font-size: 24px; font-weight: 700; margin: 0;">3 min</p>
                          <p style="color: #94A3B8; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase;">Avg. Estimate</p>
                        </td>
                        <td style="width: 1px; background: #334155;"></td>
                        <td style="text-align: center; padding: 16px; background: rgba(0, 229, 255, 0.1);">
                          <p style="color: #00E5FF; font-size: 24px; font-weight: 700; margin: 0;">10+ hrs</p>
                          <p style="color: #94A3B8; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase;">Saved/Week</p>
                        </td>
                        <td style="width: 1px; background: #334155;"></td>
                        <td style="text-align: center; padding: 16px; background: rgba(0, 229, 255, 0.1); border-radius: 0 8px 8px 0;">
                          <p style="color: #00E5FF; font-size: 24px; font-weight: 700; margin: 0;">65%+</p>
                          <p style="color: #94A3B8; font-size: 11px; margin: 4px 0 0 0; text-transform: uppercase;">Close Rate</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Reply CTA -->
                    <p style="color: #CBD5E1; font-size: 15px; margin: 0 0 24px 0;">
                      Questions? Just hit reply - I read every email personally.
                    </p>
                    
                    <p style="color: #FFFFFF; font-size: 16px; margin: 0 0 24px 0;">
                      Looking forward to saving you hours every week!
                    </p>
                    
                    <!-- Signature -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td>
                          <p style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 0;">Ethan Stopperich</p>
                          <p style="color: #00E5FF; font-size: 14px; margin: 4px 0;">Founder, EstimAIte</p>
                          <p style="color: #64748B; font-size: 13px; margin: 4px 0;">The Kitchen & Bath Store of Orlando</p>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 0; text-align: center;">
              <p style="color: #64748B; font-size: 13px; margin: 0 0 8px 0;">
                EstimAIte - AI-Powered Estimates That Close Deals
              </p>
              <p style="color: #475569; font-size: 12px; margin: 0 0 16px 0;">
                <a href="https://estimaite.lovable.app" style="color: #00E5FF; text-decoration: none;">estimaite.com</a> • 
                <a href="mailto:support@estimaite.com" style="color: #00E5FF; text-decoration: none;">support@estimaite.com</a>
              </p>
              <p style="color: #475569; font-size: 11px; margin: 0 0 8px 0;">
                <a href="https://estimaite.lovable.app/privacy" style="color: #475569; text-decoration: underline;">Privacy Policy</a>
              </p>
              <p style="color: #475569; font-size: 11px; margin: 0;">
                The Kitchen & Bath Store of Orlando<br/>
                8450 Oak Park Rd, Orlando, FL 32819
              </p>
              <p style="color: #475569; font-size: 11px; margin: 16px 0 0 0;">
                © ${currentYear} EstimAIte™. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Generate plain text version for contact emails
function generateContactEmailText(name: string, message?: string): string {
  const firstName = getFirstName(name);
  const signupUrl = "https://estimaite.lovable.app/signup?ref=contact&early=true";
  
  return `
Hey ${firstName}! 👋

${message ? `I saw your message: "${message}"\n\n` : ''}I hear you. Spending 2-4 hours on each estimate while juggling jobs, managing subs, and putting out fires? It's exhausting. That's exactly why I built EstimAIte.

HERE'S WHAT YOU CAN DO RIGHT NOW:
✓ Create a complete bathroom estimate in under 3 minutes
✓ Generate professional branded PDFs automatically
✓ Track margins so you never leave money on the table
✓ Work from your phone while on-site

Built by a contractor with 20+ years in kitchen & bath remodeling. Not by Silicon Valley engineers who've never swung a hammer.

🚀 LAUNCHING JANUARY 1, 2026

→ START YOUR FREE TRIAL: ${signupUrl}

14-day free trial • No credit card required • Cancel anytime

WHAT HAPPENS NEXT:

1. Try it yourself - Sign up, create your first estimate in 3 minutes
2. We'll reach out - Within 24 hours to see how it went and answer questions
3. Early access - Lock in launch pricing before it goes up

QUICK STATS:
• 3 min - Average Estimate Time
• 10+ hrs - Saved Per Week
• 65%+ - Average Close Rate

Questions? Just hit reply - I read every email personally.

Looking forward to saving you hours every week!

Ethan Stopperich
Founder, EstimAIte
The Kitchen & Bath Store of Orlando

---
EstimAIte - AI-Powered Estimates That Close Deals
https://estimaite.lovable.app | support@estimaite.com

The Kitchen & Bath Store of Orlando
8450 Oak Park Rd, Orlando, FL 32819
  `.trim();
}

// Generate signup welcome email HTML - World-class onboarding template
function generateSignupEmailHtml(name: string): string {
  const firstName = getFirstName(name);
  const currentYear = new Date().getFullYear();
  const dashboardUrl = "https://estimaite.lovable.app/dashboard";
  const settingsUrl = "https://estimaite.lovable.app/settings";
  const helpUrl = "https://estimaite.lovable.app/help";
  const demoVideoUrl = "https://www.loom.com/share/estimaite-demo";
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to EstimAIte</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0F172A;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
          
          <!-- Logo Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 24px;">
              <img src="https://bepdsritihnkfseurqjl.supabase.co/storage/v1/object/public/assets/estimaite-logo-tm.png" alt="EstimAIte" style="height: 40px; width: auto;" />
            </td>
          </tr>
          
          <!-- Celebration Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 24px;">
              <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
              <h1 style="color: #FFFFFF; font-size: 32px; font-weight: 700; margin: 0 0 8px 0;">
                Welcome to EstimAIte!
              </h1>
              <p style="color: #94A3B8; font-size: 16px; margin: 0;">
                Your account is ready. Let's get you set up in 3 minutes.
              </p>
            </td>
          </tr>
          
          <!-- Main Content Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1E293B; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 32px;">
                    
                    <!-- Progress Bar -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                      <tr>
                        <td>
                          <div style="background: #334155; border-radius: 8px; height: 8px; overflow: hidden;">
                            <div style="background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); width: 33%; height: 100%; border-radius: 8px;"></div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 8px;">
                          <p style="color: #00E5FF; font-size: 13px; margin: 0; font-weight: 600;">
                            Step 1 of 3 Complete: Account created ✓
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 2: Quick Setup -->
                    <div style="background: #0F172A; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="vertical-align: top; width: 40px;">
                            <div style="background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #0F172A; font-weight: 700; font-size: 14px;">2</div>
                          </td>
                          <td style="vertical-align: top;">
                            <h3 style="color: #FFFFFF; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">
                              Quick Setup (2 minutes)
                            </h3>
                            <p style="color: #94A3B8; font-size: 14px; margin: 0 0 16px 0; line-height: 1.5;">
                              These settings make your estimates look professional and protect your margins:
                            </p>
                            
                            <!-- Checklist -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 6px 0;">
                                  <span style="color: #64748B; font-size: 14px;">☐</span>
                                  <span style="color: #CBD5E1; font-size: 14px; margin-left: 8px;">Upload your logo</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0;">
                                  <span style="color: #64748B; font-size: 14px;">☐</span>
                                  <span style="color: #CBD5E1; font-size: 14px; margin-left: 8px;">Set your default margin (we recommend 42%)</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 6px 0;">
                                  <span style="color: #64748B; font-size: 14px;">☐</span>
                                  <span style="color: #CBD5E1; font-size: 14px; margin-left: 8px;">Add your contact info</span>
                                </td>
                              </tr>
                            </table>
                            
                            <div style="margin-top: 16px;">
                              <a href="${settingsUrl}" style="display: inline-block; background: transparent; color: #00E5FF; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; border: 1px solid #00E5FF;">
                                Go to Settings →
                              </a>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Step 3: Create First Estimate -->
                    <div style="background: linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(0, 229, 255, 0.3);">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="vertical-align: top; width: 40px;">
                            <div style="background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; color: #0F172A; font-weight: 700; font-size: 14px;">3</div>
                          </td>
                          <td style="vertical-align: top;">
                            <h3 style="color: #FFFFFF; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">
                              Create Your First Estimate
                            </h3>
                            <p style="color: #CBD5E1; font-size: 14px; margin: 0 0 12px 0; line-height: 1.5;">
                              This is where the magic happens. Just describe your project naturally - like you're texting another contractor. We'll handle the rest.
                            </p>
                            <p style="color: #00E5FF; font-size: 13px; margin: 0 0 16px 0; font-style: italic;">
                              💡 Tip: Try a real project you're currently working on. You'll see how fast this is!
                            </p>
                            <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%); color: #0F172A; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 16px; font-weight: 700;">
                              Create First Estimate →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Video Demo Section -->
                    <div style="background: #0F172A; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                      <p style="color: #FFFFFF; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">
                        🎬 Prefer to watch first?
                      </p>
                      <p style="color: #94A3B8; font-size: 13px; margin: 0 0 12px 0;">
                        Watch this 2-minute walkthrough to see EstimAIte in action
                      </p>
                      <a href="${demoVideoUrl}" style="color: #00E5FF; text-decoration: none; font-size: 14px; font-weight: 600;">
                        ▶ Watch Demo (2 min)
                      </a>
                    </div>
                    
                    <!-- Help Section -->
                    <div style="margin-bottom: 24px;">
                      <p style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 0 0 16px 0; text-align: center;">
                        Need Help? We've Got You.
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="width: 50%; padding-right: 8px;">
                            <a href="${helpUrl}" style="display: block; background: #0F172A; border-radius: 8px; padding: 16px; text-decoration: none; text-align: center;">
                              <div style="font-size: 24px; margin-bottom: 8px;">📚</div>
                              <p style="color: #FFFFFF; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">Help Center</p>
                              <p style="color: #64748B; font-size: 12px; margin: 0;">Quick guides and FAQs</p>
                            </a>
                          </td>
                          <td style="width: 50%; padding-left: 8px;">
                            <a href="mailto:support@estimaite.com" style="display: block; background: #0F172A; border-radius: 8px; padding: 16px; text-decoration: none; text-align: center;">
                              <div style="font-size: 24px; margin-bottom: 8px;">💬</div>
                              <p style="color: #FFFFFF; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">Email Support</p>
                              <p style="color: #64748B; font-size: 12px; margin: 0;">Get answers fast</p>
                            </a>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Trial Benefits -->
                    <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%); border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid rgba(16, 185, 129, 0.3);">
                      <p style="color: #10B981; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">
                        ✓ Your 14-Day Free Trial Includes:
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="width: 50%; padding: 4px 0; color: #CBD5E1; font-size: 13px;">✓ Unlimited estimates</td>
                          <td style="width: 50%; padding: 4px 0; color: #CBD5E1; font-size: 13px;">✓ Professional PDF export</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; color: #CBD5E1; font-size: 13px;">✓ Logo & branding</td>
                          <td style="padding: 4px 0; color: #CBD5E1; font-size: 13px;">✓ Margin tracking</td>
                        </tr>
                        <tr>
                          <td style="padding: 4px 0; color: #CBD5E1; font-size: 13px;">✓ Email support</td>
                          <td style="padding: 4px 0; color: #CBD5E1; font-size: 13px;">✓ All features included</td>
                        </tr>
                      </table>
                      <p style="color: #64748B; font-size: 12px; margin: 12px 0 0 0;">
                        No credit card required. Cancel anytime.
                      </p>
                    </div>
                    
                    <!-- Pro Tip -->
                    <div style="background: rgba(251, 191, 36, 0.1); border-left: 4px solid #FBBF24; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                      <p style="color: #FBBF24; font-size: 13px; margin: 0; line-height: 1.5;">
                        <strong>⏰ Pro Tip:</strong> The best way to learn EstimAIte is to use it on a real project. Think of a bathroom you're quoting this week and create the estimate. You'll be amazed how fast it is!
                      </p>
                    </div>
                    
                    <!-- Reply CTA -->
                    <p style="color: #CBD5E1; font-size: 15px; margin: 0 0 24px 0;">
                      Questions? Just hit reply - I read every email personally.
                    </p>
                    
                    <!-- Signature -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td>
                          <p style="color: #FFFFFF; font-size: 15px; margin: 0 0 4px 0;">Welcome aboard!</p>
                          <p style="color: #FFFFFF; font-size: 16px; font-weight: 600; margin: 8px 0 0 0;">Ethan Stopperich</p>
                          <p style="color: #00E5FF; font-size: 14px; margin: 4px 0;">Founder, EstimAIte</p>
                          <p style="color: #64748B; font-size: 13px; margin: 4px 0;">
                            <a href="mailto:ethan@estimaite.com" style="color: #64748B; text-decoration: none;">ethan@estimaite.com</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 0; text-align: center;">
              <p style="color: #64748B; font-size: 13px; margin: 0 0 8px 0;">
                EstimAIte - AI-Powered Estimates That Close Deals
              </p>
              <p style="color: #475569; font-size: 12px; margin: 0 0 16px 0;">
                <a href="https://estimaite.lovable.app" style="color: #00E5FF; text-decoration: none;">estimaite.com</a> • 
                <a href="${helpUrl}" style="color: #00E5FF; text-decoration: none;">Help Center</a> • 
                <a href="https://estimaite.lovable.app/privacy" style="color: #475569; text-decoration: underline;">Unsubscribe</a>
              </p>
              <p style="color: #475569; font-size: 11px; margin: 0;">
                © ${currentYear} EstimAIte™. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Generate plain text version for signup emails
function generateSignupEmailText(name: string): string {
  const firstName = getFirstName(name);
  
  return `
🎉 WELCOME TO ESTIMAITE!

Your account is ready. Let's get you set up in 3 minutes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ STEP 1 OF 3 COMPLETE: Account Created

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 2: QUICK SETUP (2 MINUTES)

These settings make your estimates look professional and protect your margins:

☐ Upload your logo
☐ Set your default margin (we recommend 42%)
☐ Add your contact info

→ Go to Settings: https://estimaite.lovable.app/settings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 3: CREATE YOUR FIRST ESTIMATE

This is where the magic happens. Just describe your project naturally - like you're texting another contractor. We'll handle the rest.

💡 TIP: Try a real project you're currently working on. You'll see how fast this is!

→ Create First Estimate: https://estimaite.lovable.app/dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎬 PREFER TO WATCH FIRST?

Watch this 2-minute walkthrough to see EstimAIte in action

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEED HELP? WE'VE GOT YOU.

📚 Help Center: https://estimaite.lovable.app/help
💬 Email Support: support@estimaite.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ YOUR 14-DAY FREE TRIAL INCLUDES:

• Unlimited estimates
• Professional PDF export
• Logo & branding customization
• Margin tracking & intelligence
• Email support
• Full access to all features

No credit card required. Cancel anytime.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ PRO TIP: The best way to learn EstimAIte is to use it on a real project. Think of a bathroom you're quoting this week and create the estimate. You'll be amazed how fast it is!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Just hit reply - I read every email personally.

Welcome aboard!

Ethan Stopperich
Founder, EstimAIte
ethan@estimaite.com

---
EstimAIte - AI-Powered Estimates That Close Deals
https://estimaite.lovable.app | https://estimaite.lovable.app/help
`.trim();
}

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

    const firstName = getFirstName(name);
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

        // Dynamic subject lines based on source
        const emailSubject = source === "signup" 
          ? `Welcome to EstimAIte, ${firstName}! 🎉` 
          : `${firstName}, here's what happens next... 👷`;

        const emailHtml = source === "signup" 
          ? generateSignupEmailHtml(name)
          : generateContactEmailHtml(name, message);

        const emailText = source === "signup"
          ? generateSignupEmailText(name)
          : generateContactEmailText(name, message);

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Ethan at EstimAIte <onboarding@resend.dev>",
            to: [email],
            reply_to: "ethan@estimaite.com",
            subject: emailSubject,
            html: emailHtml,
            text: emailText,
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
