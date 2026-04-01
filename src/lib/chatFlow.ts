// ─────────────────────────────────────────────────────────────
// TKB Quote Pro — Chat Flow Engine
// Drives the conversational estimator step by step
// ─────────────────────────────────────────────────────────────

export type MessageRole = 'assistant' | 'user';
export type ChipStyle = 'default' | 'price' | 'warning';

export interface QuickReply {
  label: string;
  value: string;
  style?: ChipStyle;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  quickReplies?: QuickReply[];
  isTyping?: boolean;
}

export interface EstimateState {
  roomType: string;
  sqFootage: number;
  complexity: string;
  cabinets: string;
  countertops: string;
  flooring: string;
  backsplash: boolean;
  plumbing: boolean;
  electrical: boolean;
  demo: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}

export type FlowStep =
  | 'room'
  | 'sqft'
  | 'complexity'
  | 'cabinets'
  | 'countertops'
  | 'flooring'
  | 'extras'
  | 'contact_name'
  | 'contact_email'
  | 'contact_phone'
  | 'notes'
  | 'confirm'
  | 'done';

const PRICING: Record<string, Record<string, number>> = {
  cabinets: {
    'stock': 85,
    'semi-custom': 155,
    'custom': 285,
    'refacing': 60,
    'none': 0,
  },
  countertops: {
    'laminate': 28,
    'quartz': 72,
    'granite': 68,
    'quartzite': 95,
    'marble': 110,
    'none': 0,
  },
  flooring: {
    'lvp': 8.50,
    'tile': 12,
    'hardwood': 14,
    'none': 0,
  },
};

const COMPLEXITY_MULT: Record<string, number> = {
  'basic': 0.85,
  'standard': 1.0,
  'complex': 1.30,
  'premium': 1.65,
};

const EXTRAS = {
  backsplash: 1400,
  plumbing: 1800,
  electrical: 1200,
  demo: 1100,
};

export function calculateEstimate(state: Partial<EstimateState>): {
  materials: number;
  labor: number;
  extras: number;
  tax: number;
  total: number;
} {
  const sqft = state.sqFootage ?? 0;
  const mult = COMPLEXITY_MULT[state.complexity ?? 'standard'];

  // Cabinets are per linear foot (assume 1.6× sqft → linear ft ratio)
  const linFt = Math.round(sqft * 0.18);
  const cabPrice = (PRICING.cabinets[state.cabinets ?? 'none'] ?? 0) * linFt;
  const ctPrice = (PRICING.countertops[state.countertops ?? 'none'] ?? 0) * (linFt * 2.2);
  const floorPrice = (PRICING.flooring[state.flooring ?? 'none'] ?? 0) * sqft;

  const materials = (cabPrice + ctPrice + floorPrice) * mult;
  const labor = materials * 0.45;

  let extras = 0;
  if (state.backsplash) extras += EXTRAS.backsplash;
  if (state.plumbing) extras += EXTRAS.plumbing;
  if (state.electrical) extras += EXTRAS.electrical;
  if (state.demo) extras += EXTRAS.demo;

  const subtotal = materials + labor + extras;
  const tax = (materials + extras) * 0.065; // FL: tax on materials only
  const total = subtotal + tax;

  return { materials: Math.round(materials), labor: Math.round(labor), extras: Math.round(extras), tax: Math.round(tax), total: Math.round(total) };
}

export function getNextStep(current: FlowStep, state: Partial<EstimateState>): FlowStep {
  const flow: FlowStep[] = [
    'room', 'sqft', 'complexity', 'cabinets', 'countertops', 'flooring',
    'extras', 'contact_name', 'contact_email', 'contact_phone', 'notes', 'confirm', 'done'
  ];
  const idx = flow.indexOf(current);
  return flow[idx + 1] ?? 'done';
}

interface StepConfig {
  message: (state: Partial<EstimateState>) => string;
  quickReplies?: (state: Partial<EstimateState>) => QuickReply[];
  inputType?: 'text' | 'number' | 'email' | 'tel' | 'textarea';
  inputPlaceholder?: string;
  validate?: (value: string) => string | null;
}

export const FLOW_STEPS: Record<FlowStep, StepConfig> = {
  room: {
    message: () => "What room are we remodeling? Pick one to get started.",
    quickReplies: () => [
      { label: 'Kitchen', value: 'Kitchen' },
      { label: 'Master Bath', value: 'Master Bath' },
      { label: 'Guest Bath', value: 'Guest Bath' },
      { label: 'Laundry Room', value: 'Laundry Room' },
      { label: 'Multiple Rooms', value: 'Multiple Rooms' },
    ],
  },
  sqft: {
    message: (s) => `Got it — a ${s.roomType} remodel. What's the approximate square footage of the space?`,
    inputType: 'number',
    inputPlaceholder: 'Enter sq ft (e.g. 180)',
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 20 || n > 5000) return 'Please enter a number between 20 and 5,000 sq ft.';
      return null;
    },
  },
  complexity: {
    message: (s) => `${s.sqFootage} sq ft — noted. How would you describe the project scope?`,
    quickReplies: () => [
      { label: '🟢 Basic — straight swap, no layout changes', value: 'basic' },
      { label: '🔵 Standard — some new features, minor layout', value: 'standard' },
      { label: '🟡 Complex — layout changes, custom details', value: 'complex' },
      { label: '🔴 Premium — full gut, high-end finishes', value: 'premium' },
    ],
  },
  cabinets: {
    message: () => "What cabinet level are you thinking?",
    quickReplies: () => [
      { label: 'Stock (economy)', value: 'stock', style: 'price' },
      { label: 'Semi-Custom', value: 'semi-custom', style: 'price' },
      { label: 'Full Custom', value: 'custom', style: 'price' },
      { label: 'Refacing only', value: 'refacing' },
      { label: 'No cabinets', value: 'none' },
    ],
  },
  countertops: {
    message: () => "Countertop material?",
    quickReplies: () => [
      { label: 'Laminate', value: 'laminate' },
      { label: 'Quartz', value: 'quartz', style: 'price' },
      { label: 'Granite', value: 'granite', style: 'price' },
      { label: 'Quartzite', value: 'quartzite', style: 'price' },
      { label: 'Marble', value: 'marble', style: 'price' },
      { label: 'Skip for now', value: 'none' },
    ],
  },
  flooring: {
    message: () => "And the flooring?",
    quickReplies: () => [
      { label: 'Luxury Vinyl Plank', value: 'lvp' },
      { label: 'Tile', value: 'tile' },
      { label: 'Hardwood', value: 'hardwood' },
      { label: 'No flooring', value: 'none' },
    ],
  },
  extras: {
    message: () => "Any add-ons? Select all that apply, then tap Continue.",
    quickReplies: () => [
      { label: 'Backsplash tile', value: 'backsplash' },
      { label: 'Plumbing work', value: 'plumbing' },
      { label: 'Electrical / lighting', value: 'electrical' },
      { label: 'Demo & haul-out', value: 'demo' },
      { label: '→ Continue', value: '__continue__', style: 'price' },
    ],
  },
  contact_name: {
    message: () => "Looking good — the estimate is taking shape. What's your name?",
    inputType: 'text',
    inputPlaceholder: 'Full name',
    validate: (v) => v.trim().length < 2 ? 'Please enter your full name.' : null,
  },
  contact_email: {
    message: (s) => `Nice to meet you, ${s.customerName}! What's the best email to send your quote to?`,
    inputType: 'email',
    inputPlaceholder: 'your@email.com',
    validate: (v) => !v.includes('@') ? 'Please enter a valid email address.' : null,
  },
  contact_phone: {
    message: () => "And a phone number in case we need to follow up?",
    inputType: 'tel',
    inputPlaceholder: '(407) 555-1234',
    validate: (v) => v.replace(/\D/g, '').length < 10 ? 'Please enter a valid 10-digit phone number.' : null,
  },
  notes: {
    message: () => "Anything specific we should know? Special requests, existing issues, or materials you already have? (Optional)",
    inputType: 'textarea',
    inputPlaceholder: 'e.g. keeping existing appliances, want soft-close drawers...',
  },
  confirm: {
    message: (s) => {
      const est = calculateEstimate(s);
      return `Here's your estimate summary:\n\n📐 ${s.roomType} · ${s.sqFootage} sq ft · ${s.complexity} scope\n🗂 Cabinets: ${s.cabinets} · Countertops: ${s.countertops} · Flooring: ${s.flooring}\n\n💰 Total Estimate: $${est.total.toLocaleString()}\n\nShall I save this and prepare a formal PDF quote?`;
    },
    quickReplies: () => [
      { label: '✅ Yes, send my quote', value: 'submit', style: 'price' },
      { label: '✏️ Make changes', value: 'restart' },
    ],
  },
  done: {
    message: (s) => `You're all set, ${s.customerName}! Your quote has been saved. The TKB SO team will reach out within 1 business day to schedule a free on-site consultation. 🏠`,
  },
};

export function getGreeting(): ChatMessage {
  return {
    id: 'greeting',
    role: 'assistant',
    text: "Hey there 👋 I'm the TKB Quote Pro estimator. I'll walk you through a few quick questions and build you an instant kitchen or bath estimate — takes about 2 minutes.",
    timestamp: new Date(),
    quickReplies: [{ label: "Let's go →", value: '__start__', style: 'price' }],
  };
}
