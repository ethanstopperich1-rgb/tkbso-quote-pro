/**
 * AI Engine — Qwen 3 via local Ollama (http://localhost:11434)
 * Powers: voice-to-estimate, scope gap detection, markup prediction
 *
 * No API keys needed — runs entirely local via Ollama.
 * Model: qwen3:8b (5.2GB, fast inference on Apple Silicon)
 */

import type { AIScopeRequest, AIScopeResponse, LineItem, ProjectType } from '../types';

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL = 'qwen3:8b';

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
Do not use thinking tags or reasoning blocks. Output JSON directly.
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

// ─── Ollama API call ─────────────────────────────────────────────────────────
async function callOllama(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 4096,
): Promise<string> {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Ollama error ${response.status}: ${err}`);
    }

    const data = await response.json();
    return data?.message?.content ?? '';
  } catch (error: any) {
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      console.warn('[aiEngine] Ollama not reachable at localhost:11434 — returning mock data');
      return '';
    }
    throw error;
  }
}

// ─── Extract JSON from response (handles thinking tags, code fences) ─────────
function extractJson(raw: string): string {
  // Remove <think>...</think> blocks (Qwen 3 reasoning)
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  // Remove markdown code fences
  cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  // Find the first { and last }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return cleaned.slice(start, end + 1);
  }
  return cleaned;
}

// ─── Main AI call ─────────────────────────────────────────────────────────────
export async function generateEstimateFromScope(
  request: AIScopeRequest
): Promise<AIScopeResponse> {
  const userMessage = buildUserMessage(request);
  const raw = await callOllama(buildSystemPrompt(), userMessage);

  if (!raw) {
    console.warn('[aiEngine] Empty response — returning mock data');
    return getMockEstimate(request.projectType);
  }

  const jsonStr = extractJson(raw);

  try {
    const parsed = JSON.parse(jsonStr) as AIScopeResponse;
    parsed.lineItems = parsed.lineItems.map((item, i) => ({
      ...item,
      id: `ai-${Date.now()}-${i}`,
      source: 'ai_suggested' as LineItem['source'],
    }));
    return parsed;
  } catch {
    console.error('[aiEngine] Failed to parse:', jsonStr.slice(0, 300));
    return getMockEstimate(request.projectType);
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
  const raw = await callOllama(
    `${ORLANDO_CONTEXT}
You are reviewing a contractor's scope list for missing items.
Respond with JSON only: { "gaps": string[] }
Each gap is a short warning string like "Missing backsplash tile — typically needed after countertop install".
Do not use thinking tags.`,
    `Project type: ${projectType}\nCurrent line items:\n${existingItems.join('\n')}\n\nWhat commonly-missed items should be added?`,
    512,
  );

  if (!raw) return [];

  const jsonStr = extractJson(raw);
  try {
    return JSON.parse(jsonStr).gaps ?? [];
  } catch {
    return [];
  }
}

// ─── Predictive markup (pure function, no AI needed) ─────────────────────────
export function predictMarkup(params: {
  projectTotal: number;
  projectType: ProjectType;
  isSeason: 'peak' | 'slow'; // peak = Jan-Apr in Orlando
  winRateLast30?: number; // 0-100
}): number {
  let base = 35; // TKBSO default markup

  if (params.projectTotal < 15000) base = 40;
  if (params.projectTotal > 80000) base = 28;

  if (params.projectType === 'both') base += 3;

  if (params.isSeason === 'peak') base -= 3;
  if (params.isSeason === 'slow') base += 5;

  if (params.winRateLast30 !== undefined) {
    if (params.winRateLast30 > 70) base += 3;
    if (params.winRateLast30 < 30) base -= 5;
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

// ─── Mock data (used when Ollama is not running) ────────────────────────────
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

  const bathroomItems = [
    { category: 'Demolition', name: 'Full bathroom demo', description: 'Remove tile, vanity, toilet, shower, fixtures. Haul away debris.', quantity: 1, unit: 'lot', unitPrice: 2050, totalPrice: 2050, isOptional: false },
    { category: 'Plumbing', name: 'Shower rough-in', description: 'New shower valve, drain relocation, supply lines', quantity: 1, unit: 'lot', unitPrice: 3425, totalPrice: 3425, isOptional: false },
    { category: 'Tile', name: 'Shower wall tile', description: 'Large format porcelain tile, floor to ceiling', quantity: 96, unit: 'sq ft', unitPrice: 39, totalPrice: 3744, isOptional: false },
    { category: 'Tile', name: 'Floor tile', description: 'Porcelain floor tile with waterproofing', quantity: 50, unit: 'sq ft', unitPrice: 12, totalPrice: 600, isOptional: false },
    { category: 'Cabinetry', name: 'Vanity 36" with quartz top', description: 'Shaker-style vanity with Level 1 quartz countertop, undermount sink', quantity: 1, unit: 'each', unitPrice: 2100, totalPrice: 2100, isOptional: false },
    { category: 'Glass', name: 'Frameless shower glass', description: '78"H frameless glass enclosure, 3/8" tempered, door + panel', quantity: 1, unit: 'lot', unitPrice: 2100, totalPrice: 2100, isOptional: false },
    { category: 'Electrical', name: 'Bathroom electrical package', description: '3 recessed cans, vanity light wiring, LED mirror wiring, new switches', quantity: 1, unit: 'lot', unitPrice: 750, totalPrice: 750, isOptional: false },
    { category: 'Paint', name: 'Paint full bathroom', description: 'Walls, ceiling, door, trim. Sherwin Williams, 2 coats.', quantity: 1, unit: 'lot', unitPrice: 1900, totalPrice: 1900, isOptional: false },
  ];

  const items = projectType === 'kitchen' ? kitchenItems : bathroomItems;
  const totalPrice = items.reduce((s, i) => s + i.totalPrice, 0);

  return {
    lineItems: items.map((item, i) => ({ ...item, id: `mock-${i}`, source: 'ai_suggested' })) as AIScopeResponse['lineItems'],
    gapWarnings: projectType === 'kitchen' ? [
      'Permit fees not included — Orlando building permit typically $400-800 for kitchen remodel',
      'Appliances not included — confirm if client is supplying or you are providing',
      'Flooring transition strips not listed — needed where kitchen meets adjacent rooms',
    ] : [
      'Permit fees not included — plumbing/electrical permits required in Orange County',
      'Dumpster rental not listed — typically $750 for bathroom demo',
      'Accessories not listed (towel bar, TP holder, robe hook) — typically $150-300',
    ],
    suggestedMarkup: 35,
    summary: `Mock ${projectType} estimate totaling $${totalPrice.toLocaleString()} using Orlando market rates. ${projectType === 'kitchen' ? 'Permits and appliances excluded.' : 'Permits and accessories excluded.'}`,
  };
}
