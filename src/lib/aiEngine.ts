/**
 * AI Engine — Qwen-2.5-72B via Hugging Face Inference API (free tier)
 * Powers: voice-to-estimate, photo analysis, scope gap detection, markup prediction
 *
 * Env vars required:
 *   VITE_HF_TOKEN — HuggingFace API token (free at huggingface.co/settings/tokens)
 */

import type { AIScopeRequest, AIScopeResponse, LineItem, ProjectType } from '../types';

const HF_API_URL =
  'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1/chat/completions';

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

// ─── Orlando-specific market context injected into every prompt ───────────────
const ORLANDO_CONTEXT = `
You are an expert remodeling estimator for The Kitchen & Bath Store Orlando (TKBSO),
a contractor based in the Orlando, FL metro area (Orange, Osceola, Seminole, Lake counties).
Florida-specific considerations:
- High humidity requires moisture-resistant materials (cement board, waterproof membranes)
- Hurricane-rated windows/doors add 15-20% to window/door costs
- No basement, slab-on-grade is standard
- Florida Building Code (FBC) requires permits for structural, electrical, plumbing changes
- Orlando labor rates run ~8% above FL average due to tourism/construction demand
- Material costs run ~3-5% above national average (supply chain / logistics to Central FL)
- Peak season (Jan-April) adds ~10% to labor due to demand
`;

// ─── System prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `${ORLANDO_CONTEXT}

You MUST respond with valid JSON only. No markdown, no explanation outside the JSON.
Your output schema:
{
  "lineItems": [
    {
      "category": string,       // e.g. "Demolition", "Cabinetry", "Countertops", "Tile", "Plumbing", "Electrical", "Labor"
      "name": string,
      "description": string,
      "quantity": number,
      "unit": string,           // "sq ft", "LF", "each", "hour"
      "unitPrice": number,      // USD, Orlando market rate
      "totalPrice": number,
      "isOptional": boolean
    }
  ],
  "gapWarnings": string[],      // items commonly missed for this scope
  "suggestedMarkup": number,    // % e.g. 35
  "summary": string             // 2-3 sentence plain English summary
}`;
}

// ─── Main AI call ─────────────────────────────────────────────────────────────
export async function generateEstimateFromScope(
  request: AIScopeRequest
): Promise<AIScopeResponse> {
  if (!HF_TOKEN) {
    console.warn('[aiEngine] VITE_HF_TOKEN not set — returning mock data');
    return getMockEstimate(request.projectType);
  }

  const userMessage = buildUserMessage(request);

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'Qwen/Qwen2.5-72B-Instruct',
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 4096,
      temperature: 0.3, // low temp = more consistent pricing
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content ?? '';

  // Strip any accidental markdown code fences
  const cleaned = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned) as AIScopeResponse;
    // Attach IDs and source
    parsed.lineItems = parsed.lineItems.map((item, i) => ({
      ...item,
      id: `ai-${Date.now()}-${i}`,
      source: 'ai_suggested' as LineItem['source'],
    }));
    return parsed;
  } catch {
    throw new Error(`Failed to parse AI response: ${cleaned.slice(0, 200)}`);
  }
}

// ─── Voice-to-estimate ────────────────────────────────────────────────────────
export async function generateEstimateFromVoice(
  transcript: string,
  projectType: ProjectType = 'kitchen'
): Promise<AIScopeResponse> {
  return generateEstimateFromScope({
    projectType,
    voiceTranscript: transcript,
  });
}

// ─── Photo description analysis ───────────────────────────────────────────────
export async function analyzePhotoDescriptions(
  descriptions: string[],
  projectType: ProjectType
): Promise<AIScopeResponse> {
  return generateEstimateFromScope({
    projectType,
    photoDescriptions: descriptions,
  });
}

// ─── Scope gap detection only ─────────────────────────────────────────────────
export async function detectScopeGaps(
  existingItems: string[],
  projectType: ProjectType
): Promise<string[]> {
  if (!HF_TOKEN) return [];

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'Qwen/Qwen2.5-72B-Instruct',
      messages: [
        {
          role: 'system',
          content: `${ORLANDO_CONTEXT}
You are reviewing a contractor's scope list for missing items.
Respond with JSON only: { "gaps": string[] }
Each gap is a short warning string like "Missing backsplash tile — typically needed after countertop install".`,
        },
        {
          role: 'user',
          content: `Project type: ${projectType}\nCurrent line items:\n${existingItems.join('\n')}\n\nWhat commonly-missed items should be added?`,
        },
      ],
      max_tokens: 512,
      temperature: 0.2,
      stream: false,
    }),
  });

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content ?? '{"gaps":[]}';
  const cleaned = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned).gaps ?? [];
  } catch {
    return [];
  }
}

// ─── Predictive markup ────────────────────────────────────────────────────────
export function predictMarkup(params: {
  projectTotal: number;
  projectType: ProjectType;
  isSeason: 'peak' | 'slow'; // peak = Jan-Apr in Orlando
  winRateLast30?: number; // 0-100
}): number {
  let base = 35; // TKBSO default markup

  if (params.projectTotal < 15000) base = 40; // small jobs need higher margin
  if (params.projectTotal > 80000) base = 28; // large jobs win on lower margin

  if (params.projectType === 'both') base += 3; // full remodel complexity premium

  if (params.isSeason === 'peak') base -= 3; // busy season — can be slightly less aggressive
  if (params.isSeason === 'slow') base += 5; // slow season — protect margin

  if (params.winRateLast30 !== undefined) {
    if (params.winRateLast30 > 70) base += 3; // closing well → push margin up
    if (params.winRateLast30 < 30) base -= 5; // losing too much → need to price sharper
  }

  return Math.max(15, Math.min(55, Math.round(base)));
}

// ─── User message builder ─────────────────────────────────────────────────────
function buildUserMessage(req: AIScopeRequest): string {
  const parts: string[] = [];

  parts.push(`Project type: ${req.projectType}`);

  if (req.squareFootage) parts.push(`Square footage: ${req.squareFootage} sq ft`);
  if (req.budget) parts.push(`Client budget: $${req.budget.toLocaleString()}`);

  if (req.voiceTranscript) {
    parts.push(`\nContractor voice note (transcribed):\n"${req.voiceTranscript}"`);
  }

  if (req.photoDescriptions?.length) {
    parts.push(`\nPhoto analysis observations:\n${req.photoDescriptions.map((d, i) => `${i + 1}. ${d}`).join('\n')}`);
  }

  if (req.manualNotes) {
    parts.push(`\nAdditional notes:\n${req.manualNotes}`);
  }

  parts.push('\nGenerate a complete, itemized estimate in JSON.');
  return parts.join('\n');
}

// ─── Mock data (used when no API token) ──────────────────────────────────────
function getMockEstimate(projectType: ProjectType): AIScopeResponse {
  const kitchenItems = [
    { category: 'Demolition', name: 'Cabinet removal', description: 'Remove and dispose of existing upper and lower cabinets', quantity: 1, unit: 'lot', unitPrice: 850, totalPrice: 850, isOptional: false },
    { category: 'Demolition', name: 'Countertop removal', description: 'Remove existing laminate countertops', quantity: 1, unit: 'lot', unitPrice: 350, totalPrice: 350, isOptional: false },
    { category: 'Cabinetry', name: 'Semi-custom shaker cabinets', description: 'White shaker style, soft-close hinges and drawer guides', quantity: 1, unit: 'lot', unitPrice: 8500, totalPrice: 8500, isOptional: false },
    { category: 'Countertops', name: 'Quartz countertops', description: 'Carrara white quartz, 3cm thick, eased edge profile', quantity: 45, unit: 'sq ft', unitPrice: 85, totalPrice: 3825, isOptional: false },
    { category: 'Countertops', name: 'Backsplash tile', description: '3x6 subway tile, standard installation', quantity: 28, unit: 'sq ft', unitPrice: 22, totalPrice: 616, isOptional: false },
    { category: 'Plumbing', name: 'Kitchen faucet and sink installation', description: 'Install client-supplied single-bowl undermount sink and faucet', quantity: 1, unit: 'each', unitPrice: 450, totalPrice: 450, isOptional: false },
    { category: 'Electrical', name: 'Under-cabinet LED lighting', description: 'Install hardwired LED strip lights under upper cabinets', quantity: 1, unit: 'lot', unitPrice: 680, totalPrice: 680, isOptional: true },
    { category: 'Labor', name: 'Installation labor', description: 'Full installation crew, estimated 5 days', quantity: 40, unit: 'hour', unitPrice: 75, totalPrice: 3000, isOptional: false },
  ];

  const totalPrice = kitchenItems.reduce((s, i) => s + i.totalPrice, 0);

  return {
    lineItems: kitchenItems.map((item, i) => ({ ...item, id: `mock-${i}`, source: 'ai_suggested' })) as AIScopeResponse['lineItems'],
    gapWarnings: [
      'Permit fees not included — Orlando building permit typically $400-800 for kitchen remodel',
      'Appliances not included — confirm if client is supplying or you are providing',
      'Flooring transition strips not listed — needed where kitchen meets adjacent rooms',
    ],
    suggestedMarkup: 35,
    summary: `Mock kitchen estimate totaling $${totalPrice.toLocaleString()} covering demo, cabinetry, countertops, backsplash, plumbing, and labor. Orlando market rates applied. Permits and appliances excluded.`,
  };
}
