/**
 * Supabase Edge Function: generate-pdf
 *
 * Accepts a quote ID + contractor ID, fetches the estimate from Supabase,
 * renders an HTML template server-side, converts to PDF via Browserless,
 * uploads to Supabase Storage bucket 'quote-pdfs', and returns a signed URL.
 *
 * Deploy:
 *   supabase functions deploy generate-pdf --no-verify-jwt
 *
 * Secrets needed:
 *   BROWSERLESS_TOKEN   — get free token at browserless.io (1000 free/mo)
 *   SITE_URL            — your app URL for public asset paths
 *
 * Alternatively: if no Browserless token, falls back to returning the
 * HTML itself so the client can use window.print() (CSS @print media).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BROWSERLESS_TOKEN = Deno.env.get('BROWSERLESS_TOKEN') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://tkbso-quote-pro.vercel.app';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ─── HTML template renderer ────────────────────────────────────────────────

function buildHtml(estimate: Record<string, unknown>, contractor: Record<string, unknown>): string {
  const clientName = String(estimate.client_name ?? 'Valued Client');
  const address = [estimate.property_address, estimate.city, estimate.state, estimate.zip]
    .filter(Boolean).join(', ');
  const jobLabel = String(estimate.job_label ?? 'Remodeling Project');
  const lowCp = Number(estimate.low_estimate_cp ?? 0);
  const highCp = Number(estimate.high_estimate_cp ?? 0);
  const finalCp = Number(estimate.final_cp_total ?? 0);
  const contractorName = String(contractor.name ?? 'Your Contractor');
  const contractorPhone = String(contractor.primary_contact_phone ?? '');
  const contractorEmail = String(contractor.primary_contact_email ?? '');
  const logoUrl = contractor.logo_url ? String(contractor.logo_url) : null;
  const createdAt = new Date(String(estimate.created_at)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const expiryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Build line items section from internal_json_payload if present
  const payload = estimate.internal_json_payload as Record<string, unknown> | null;
  const sections: Array<{ title: string; items: Array<{ name: string; qty: number; unit: string; unitPrice: number; total: number }> }> = [];
  if (payload?.sections && Array.isArray(payload.sections)) {
    for (const section of payload.sections as Array<Record<string, unknown>>) {
      if (section.items && Array.isArray(section.items) && section.items.length > 0) {
        sections.push({
          title: String(section.title ?? 'Items'),
          items: (section.items as Array<Record<string, unknown>>).map((item) => ({
            name: String(item.name ?? ''),
            qty: Number(item.quantity ?? 1),
            unit: String(item.unit ?? 'ea'),
            unitPrice: Number(item.unitPrice ?? 0),
            total: Number(item.totalPrice ?? 0),
          })),
        });
      }
    }
  }

  // Fallback: build single section from estimate totals
  if (sections.length === 0) {
    const totalsSection: { title: string; items: Array<{ name: string; qty: number; unit: string; unitPrice: number; total: number }> } = { title: 'Project Summary', items: [] };
    const lineMap: Record<string, number> = {
      'Demo & Haul Away': Number(estimate.demo_cp_total ?? 0),
      'Plumbing': Number(estimate.plumbing_cp_total ?? 0),
      'Tile & Waterproofing': Number((estimate.tile_cp_total as number ?? 0) + (estimate.waterproofing_cp_total as number ?? 0)),
      'Cabinetry': Number(estimate.cabinets_cp_total ?? 0),
      'Countertops': Number(estimate.quartz_cp_total ?? 0),
      'Vanities': Number(estimate.vanities_cp_total ?? 0),
      'Electrical': Number(estimate.lighting_cp_total ?? 0),
      'Glass': Number(estimate.glass_cp_total ?? 0),
      'Paint': Number(estimate.paint_cp_total ?? 0),
    };
    for (const [name, total] of Object.entries(lineMap)) {
      if (total > 0) {
        totalsSection.items.push({ name, qty: 1, unit: 'lot', unitPrice: total, total });
      }
    }
    if (totalsSection.items.length > 0) sections.push(totalsSection);
  }

  const lineItemsHtml = sections.map((section) => `
    <div class="section-block">
      <div class="section-title">${section.title}</div>
      <table class="line-items">
        <thead>
          <tr>
            <th class="col-name">Description</th>
            <th class="col-qty">Qty</th>
            <th class="col-unit">Unit</th>
            <th class="col-price">Unit Price</th>
            <th class="col-total">Total</th>
          </tr>
        </thead>
        <tbody>
          ${section.items.map((item) => `
          <tr>
            <td class="col-name">${item.name}</td>
            <td class="col-qty">${item.qty}</td>
            <td class="col-unit">${item.unit}</td>
            <td class="col-price">$${item.unitPrice.toLocaleString()}</td>
            <td class="col-total">$${item.total.toLocaleString()}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `).join('');

  const rangeHtml = (lowCp > 0 && highCp > 0 && lowCp !== highCp)
    ? `<div class="range-row"><span>Estimate Range</span><span>$${lowCp.toLocaleString()} – $${highCp.toLocaleString()}</span></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${jobLabel} — ${clientName}</title>
  <style>
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-family: 'Satoshi', -apple-system, sans-serif; font-size: 14px; color: #28251d; }
    body { background: #fff; padding: 0; }

    /* Page layout */
    .page { max-width: 780px; margin: 0 auto; padding: 48px 56px; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 32px; border-bottom: 2px solid #01696f; margin-bottom: 32px; }
    .logo-area { display: flex; flex-direction: column; gap: 4px; }
    .logo-img { max-height: 48px; max-width: 160px; object-fit: contain; }
    .company-name { font-size: 20px; font-weight: 700; color: #01696f; letter-spacing: -0.02em; }
    .company-contact { font-size: 11px; color: #7a7974; line-height: 1.6; margin-top: 4px; }
    .doc-meta { text-align: right; }
    .doc-type { font-size: 11px; font-weight: 600; color: #7a7974; text-transform: uppercase; letter-spacing: 0.08em; }
    .doc-number { font-size: 22px; font-weight: 700; color: #28251d; margin-top: 2px; }
    .doc-date { font-size: 11px; color: #7a7974; margin-top: 4px; }

    /* Client info */
    .client-block { display: flex; gap: 48px; margin-bottom: 32px; padding: 20px 24px; background: #f7f6f2; border-radius: 10px; }
    .client-field label { display: block; font-size: 10px; font-weight: 600; color: #7a7974; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
    .client-field .value { font-size: 14px; font-weight: 500; color: #28251d; }

    /* Section block */
    .section-block { margin-bottom: 28px; }
    .section-title { font-size: 11px; font-weight: 700; color: #01696f; text-transform: uppercase; letter-spacing: 0.08em; padding: 6px 0; border-bottom: 1px solid #dcd9d5; margin-bottom: 8px; }

    /* Line items table */
    .line-items { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    .line-items thead tr { background: #f7f6f2; }
    .line-items th { padding: 8px 10px; text-align: right; font-size: 10px; font-weight: 600; color: #7a7974; text-transform: uppercase; letter-spacing: 0.06em; }
    .line-items th.col-name { text-align: left; }
    .line-items td { padding: 8px 10px; text-align: right; border-bottom: 1px solid #f0eeea; }
    .line-items td.col-name { text-align: left; font-weight: 500; }
    .line-items tbody tr:last-child td { border-bottom: none; }
    .col-qty, .col-unit { width: 60px; }
    .col-price, .col-total { width: 90px; }
    .col-total { font-weight: 600; }

    /* Totals */
    .totals-block { margin-left: auto; width: 280px; border-top: 2px solid #dcd9d5; padding-top: 16px; margin-bottom: 32px; }
    .range-row { display: flex; justify-content: space-between; font-size: 12px; color: #7a7974; padding: 4px 0; }
    .total-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-top: 1px solid #dcd9d5; margin-top: 8px; }
    .total-row .label { font-size: 12px; font-weight: 600; }
    .total-row .amount { font-size: 20px; font-weight: 700; color: #01696f; letter-spacing: -0.02em; }

    /* Payment schedule */
    .payment-block { margin-bottom: 32px; }
    .payment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px; }
    .payment-tile { background: #f7f6f2; border-radius: 8px; padding: 14px 16px; }
    .payment-tile .pct { font-size: 18px; font-weight: 700; color: #01696f; }
    .payment-tile .amt { font-size: 12px; color: #7a7974; margin-top: 2px; }
    .payment-tile .when { font-size: 11px; font-weight: 600; color: #28251d; margin-top: 6px; }

    /* Terms */
    .terms-block { border-top: 1px solid #dcd9d5; padding-top: 24px; margin-bottom: 32px; }
    .terms-title { font-size: 11px; font-weight: 700; color: #7a7974; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
    .terms-list { font-size: 11px; color: #7a7974; line-height: 1.7; list-style: none; }
    .terms-list li::before { content: '•\00a0\00a0'; color: #01696f; }

    /* Signature */
    .sig-block { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
    .sig-field label { display: block; font-size: 10px; font-weight: 600; color: #7a7974; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 32px; }
    .sig-line { border-bottom: 1.5px solid #28251d; margin-bottom: 4px; }
    .sig-caption { font-size: 10px; color: #7a7974; }

    /* Footer */
    .footer { border-top: 1px solid #dcd9d5; padding-top: 16px; display: flex; justify-content: space-between; align-items: center; }
    .footer-left { font-size: 10px; color: #bab9b4; }
    .footer-right { font-size: 10px; color: #bab9b4; text-align: right; }
    .expiry-note { font-size: 11px; color: #964219; font-weight: 500; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 32px 40px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="logo-area">
        ${logoUrl
          ? `<img src="${logoUrl}" alt="${contractorName}" class="logo-img" />`
          : `<div class="company-name">${contractorName}</div>`
        }
        <div class="company-contact">
          ${contractorPhone}<br />
          ${contractorEmail}
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-type">Project Estimate</div>
        <div class="doc-number">${String(estimate.id ?? '').slice(0, 8).toUpperCase()}</div>
        <div class="doc-date">Issued ${createdAt}</div>
      </div>
    </div>

    <!-- Client info -->
    <div class="client-block">
      <div class="client-field">
        <label>Prepared for</label>
        <div class="value">${clientName}</div>
      </div>
      ${address ? `<div class="client-field"><label>Property</label><div class="value">${address}</div></div>` : ''}
      <div class="client-field">
        <label>Project</label>
        <div class="value">${jobLabel}</div>
      </div>
    </div>

    <!-- Line items -->
    ${lineItemsHtml}

    <!-- Totals -->
    <div class="totals-block">
      ${rangeHtml}
      <div class="total-row">
        <span class="label">Project Total</span>
        <span class="amount">$${finalCp.toLocaleString()}</span>
      </div>
    </div>

    <!-- Payment schedule -->
    <div class="payment-block">
      <div class="section-title">Payment Schedule</div>
      <div class="payment-grid">
        <div class="payment-tile">
          <div class="pct">33%</div>
          <div class="amt">$${Math.round(finalCp * 0.33).toLocaleString()}</div>
          <div class="when">Deposit — at signing</div>
        </div>
        <div class="payment-tile">
          <div class="pct">33%</div>
          <div class="amt">$${Math.round(finalCp * 0.33).toLocaleString()}</div>
          <div class="when">Progress — midpoint</div>
        </div>
        <div class="payment-tile">
          <div class="pct">34%</div>
          <div class="amt">$${Math.round(finalCp * 0.34).toLocaleString()}</div>
          <div class="when">Final — completion</div>
        </div>
      </div>
    </div>

    <!-- Terms -->
    <div class="terms-block">
      <div class="terms-title">Terms &amp; Conditions</div>
      <ul class="terms-list">
        <li>This estimate is valid for 14 days from the date of issue. Expires ${expiryDate}.</li>
        <li>All materials are subject to availability and current market pricing.</li>
        <li>Scope changes, unforeseen conditions, or permit requirements may affect the final price.</li>
        <li>A signed contract and deposit are required to schedule your project.</li>
        <li>All work is performed by licensed and insured professionals.</li>
      </ul>
    </div>

    <!-- Signature -->
    <div class="sig-block">
      <div class="sig-field">
        <label>Client Signature</label>
        <div class="sig-line"></div>
        <div class="sig-caption">Signature &amp; Date</div>
      </div>
      <div class="sig-field">
        <label>Contractor Signature</label>
        <div class="sig-line"></div>
        <div class="sig-caption">${contractorName} &amp; Date</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-left">${contractorName} &bull; Licensed &amp; Insured</div>
      <div class="footer-right">
        <div class="expiry-note">Estimate expires ${expiryDate}</div>
        <div>Page 1</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const { estimateId } = await req.json();
  if (!estimateId) return new Response('estimateId required', { status: 400 });

  // Fetch estimate + contractor
  const { data: estimate, error: estErr } = await supabase
    .from('estimates')
    .select(`*, contractors(*)`)
    .eq('id', estimateId)
    .single();

  if (estErr || !estimate) {
    return new Response(JSON.stringify({ error: estErr?.message ?? 'Not found' }), { status: 404 });
  }

  const contractor = Array.isArray(estimate.contractors) ? estimate.contractors[0] : estimate.contractors;
  const html = buildHtml(estimate, contractor ?? {});

  // Path for storage
  const storagePath = `pdfs/${estimateId}/estimate-${Date.now()}.pdf`;

  // If no Browserless token: upload HTML and return HTML fallback
  if (!BROWSERLESS_TOKEN) {
    const htmlPath = `pdfs/${estimateId}/estimate-${Date.now()}.html`;
    await supabase.storage.from('quote-pdfs').upload(htmlPath, new Blob([html], { type: 'text/html' }), { upsert: true });
    return new Response(
      JSON.stringify({ mode: 'html_fallback', html }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Convert HTML → PDF via Browserless
  const pdfRes = await fetch(`https://production-sfo.browserless.io/chromium/pdf?token=${BROWSERLESS_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html,
      options: {
        format: 'Letter',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      },
    }),
  });

  if (!pdfRes.ok) {
    return new Response(JSON.stringify({ error: `PDF generation failed: ${pdfRes.status}` }), { status: 500 });
  }

  const pdfBuffer = await pdfRes.arrayBuffer();

  // Upload PDF to Supabase Storage
  const { error: uploadErr } = await supabase.storage
    .from('quote-pdfs')
    .upload(storagePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadErr) {
    return new Response(JSON.stringify({ error: uploadErr.message }), { status: 500 });
  }

  // Return a signed URL (valid 1 hour)
  const { data: signedData, error: signErr } = await supabase.storage
    .from('quote-pdfs')
    .createSignedUrl(storagePath, 3600);

  if (signErr) {
    return new Response(JSON.stringify({ error: signErr.message }), { status: 500 });
  }

  return new Response(
    JSON.stringify({ url: signedData.signedUrl, storagePath }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
