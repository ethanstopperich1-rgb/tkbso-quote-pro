/**
 * Supabase Edge Function: scheduled-followups
 *
 * Triggered by pg_cron every hour.
 * Finds quotes that are 'sent' but unsigned after 3/7/10 days
 * and sends a follow-up email via Resend API.
 *
 * Deploy:
 *   supabase functions deploy scheduled-followups --no-verify-jwt
 *
 * Secrets needed (set via Supabase Dashboard → Settings → Edge Functions):
 *   RESEND_API_KEY   — your Resend.com API key
 *   SITE_URL         — your app URL e.g. https://tkbso-quote-pro.vercel.app
 *
 * pg_cron trigger (run in SQL Editor after deploying):
 *   select cron.schedule(
 *     'hourly-followups',
 *     '0 * * * *',
 *     $$
 *       select net.http_post(
 *         url := 'https://<PROJECT_REF>.supabase.co/functions/v1/scheduled-followups',
 *         headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb
 *       );
 *     $$
 *   );
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://tkbso-quote-pro.vercel.app';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ─── Email templates ──────────────────────────────────────────────────────────

interface TemplateData {
  clientName: string;
  projectType: string;
  estimateAmount: string;
  contractorName: string;
  contractorPhone: string;
  quoteUrl: string;
  expiryDate: string;
}

function getTemplate(
  day: 3 | 7 | 10,
  data: TemplateData
): { subject: string; html: string; text: string } {
  const { clientName, projectType, estimateAmount, contractorName, contractorPhone, quoteUrl, expiryDate } = data;

  const templates = {
    3: {
      subject: `Quick check-in on your ${projectType} estimate — ${contractorName}`,
      text: `Hi ${clientName},\n\nJust wanted to follow up on the ${projectType} estimate we sent you for ${estimateAmount}.\n\nIf you have any questions or want to make any adjustments to the scope, I'm happy to jump on a quick call.\n\nYou can review your estimate here: ${quoteUrl}\n\nBest,\n${contractorName}\n${contractorPhone}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #28251d;">
          <div style="margin-bottom: 32px;">
            <div style="width: 40px; height: 4px; background: #01696f; border-radius: 2px;"></div>
          </div>
          <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">Hi ${clientName},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #4a4845; margin: 0 0 16px;">
            Just wanted to follow up on the <strong>${projectType}</strong> estimate we sent over for <strong>${estimateAmount}</strong>.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #4a4845; margin: 0 0 24px;">
            If you have any questions or want to adjust the scope, I'm happy to jump on a quick call — no pressure at all.
          </p>
          <a href="${quoteUrl}" style="display: inline-block; background: #01696f; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px;">Review Your Estimate</a>
          <p style="font-size: 14px; color: #7a7974; margin: 32px 0 0;">${contractorName} &bull; ${contractorPhone}</p>
        </div>
      `,
    },
    7: {
      subject: `Your estimate expires ${expiryDate} — ${clientName}`,
      text: `Hi ${clientName},\n\nYour ${projectType} estimate for ${estimateAmount} is set to expire on ${expiryDate}.\n\nMaterial prices and labor availability can shift — locking in now guarantees you the pricing we quoted.\n\nReview and approve here: ${quoteUrl}\n\nIf you'd like to talk through any changes, just reply or call me at ${contractorPhone}.\n\n${contractorName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #28251d;">
          <div style="margin-bottom: 32px;">
            <div style="width: 40px; height: 4px; background: #964219; border-radius: 2px;"></div>
          </div>
          <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">Hi ${clientName},</h2>
          <div style="background: #fef3ec; border: 1px solid #f5c99a; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 15px; color: #964219; font-weight: 600;">⏳ Your estimate expires on ${expiryDate}</p>
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #4a4845; margin: 0 0 16px;">
            Your <strong>${projectType}</strong> estimate for <strong>${estimateAmount}</strong> will expire soon. Material prices and labor availability can shift — locking in now guarantees the pricing we quoted.
          </p>
          <a href="${quoteUrl}" style="display: inline-block; background: #01696f; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px;">Approve Your Estimate</a>
          <p style="font-size: 14px; color: #7a7974; margin: 32px 0 0;">
            Questions? Reply to this email or call <strong>${contractorPhone}</strong>.<br/>${contractorName}
          </p>
        </div>
      `,
    },
    10: {
      subject: `Last chance to lock in your ${projectType} pricing — ${contractorName}`,
      text: `Hi ${clientName},\n\nThis is my last check-in on your ${projectType} estimate for ${estimateAmount}.\n\nIf the scope or budget needs adjusting, I'm very open to a conversation — we can revisit the numbers together.\n\nOtherwise, the estimate expires ${expiryDate} and I'll need to re-quote at current pricing.\n\n${quoteUrl}\n\n${contractorName}\n${contractorPhone}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #28251d;">
          <div style="margin-bottom: 32px;">
            <div style="width: 40px; height: 4px; background: #a12c7b; border-radius: 2px;"></div>
          </div>
          <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">Hi ${clientName},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #4a4845; margin: 0 0 16px;">
            This is my final follow-up on your <strong>${projectType}</strong> estimate for <strong>${estimateAmount}</strong>.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #4a4845; margin: 0 0 16px;">
            If the scope or budget needs adjusting, I'm happy to revisit the numbers — just reply and we'll make it work.
          </p>
          <p style="font-size: 15px; color: #7a7974; margin: 0 0 24px;">
            Otherwise, this estimate expires <strong>${expiryDate}</strong> and will need to be re-quoted at current pricing.
          </p>
          <a href="${quoteUrl}" style="display: inline-block; background: #01696f; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 15px;">Review &amp; Approve</a>
          <p style="font-size: 14px; color: #7a7974; margin: 32px 0 0;">${contractorName} &bull; ${contractorPhone}</p>
        </div>
      `,
    },
  };

  return templates[day];
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // Allow manual POST triggers from the dashboard too
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const now = new Date();
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  // Fetch estimates that are sent but not yet approved/declined
  const { data: estimates, error: fetchError } = await supabase
    .from('estimates')
    .select(`
      id,
      client_name,
      client_email,
      job_label,
      has_kitchen,
      has_bathrooms,
      final_cp_total,
      status,
      updated_at,
      contractor_id,
      contractors (
        name,
        primary_contact_name,
        primary_contact_email,
        primary_contact_phone
      )
    `)
    .eq('status', 'sent')
    .not('client_email', 'is', null);

  if (fetchError) {
    console.error('Failed to fetch estimates:', fetchError);
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }

  for (const estimate of estimates ?? []) {
    const sentAt = new Date(estimate.updated_at);
    const daysSinceSent = Math.floor((now.getTime() - sentAt.getTime()) / (1000 * 60 * 60 * 24));

    // Fetch existing follow-ups for this estimate
    const { data: followUps } = await supabase
      .from('follow_ups')
      .select('day_number, sent_at')
      .eq('estimate_id', estimate.id)
      .order('day_number', { ascending: true });

    const sentDays = new Set((followUps ?? []).map((f: { day_number: number }) => f.day_number));

    // Determine which follow-up to send
    let targetDay: 3 | 7 | 10 | null = null;
    if (daysSinceSent >= 3 && !sentDays.has(3)) targetDay = 3;
    else if (daysSinceSent >= 7 && !sentDays.has(7)) targetDay = 7;
    else if (daysSinceSent >= 10 && !sentDays.has(10)) targetDay = 10;

    if (!targetDay) {
      skipped++;
      continue;
    }

    // Build template data
    const contractor = Array.isArray(estimate.contractors)
      ? estimate.contractors[0]
      : estimate.contractors;

    const projectType = estimate.has_kitchen && estimate.has_bathrooms
      ? 'kitchen & bath'
      : estimate.has_kitchen
      ? 'kitchen'
      : 'bathroom';

    const expiryDate = new Date(sentAt.getTime() + 14 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    const templateData: TemplateData = {
      clientName: estimate.client_name ?? 'there',
      projectType,
      estimateAmount: `$${(estimate.final_cp_total ?? 0).toLocaleString()}`,
      contractorName: contractor?.name ?? 'Your contractor',
      contractorPhone: contractor?.primary_contact_phone ?? '',
      quoteUrl: `${SITE_URL}/quote/${estimate.id}`,
      expiryDate,
    };

    const { subject, html, text } = getTemplate(targetDay, templateData);

    // Send via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${contractor?.name ?? 'TKBSO Quote Pro'} <noreply@tkbso.com>`,
        to: [estimate.client_email],
        reply_to: contractor?.primary_contact_email ?? undefined,
        subject,
        html,
        text,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error(`Resend error for estimate ${estimate.id}:`, err);
      errors++;
      continue;
    }

    const resendData = await resendRes.json();

    // Record the follow-up
    await supabase.from('follow_ups').insert({
      estimate_id: estimate.id,
      contractor_id: estimate.contractor_id,
      day_number: targetDay,
      template_key: `followup_day${targetDay}`,
      sent_at: now.toISOString(),
      resend_email_id: resendData?.id ?? null,
      recipient_email: estimate.client_email,
    });

    sent++;
  }

  const summary = { sent, skipped, errors, timestamp: now.toISOString() };
  console.log('Follow-up run complete:', summary);
  return new Response(JSON.stringify(summary), {
    headers: { 'Content-Type': 'application/json' },
  });
});
