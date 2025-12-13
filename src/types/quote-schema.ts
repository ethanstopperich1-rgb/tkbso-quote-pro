/**
 * Comprehensive quote schema for professional contractor proposals
 */

export interface ProductAllowance {
  amount: number;
  description: string;
  per_unit?: boolean;
  unit?: string;
}

export interface QuoteLineItem {
  item_id: string;
  item_type: 'lump_sum' | 'labor_only' | 'labor_and_material';
  action_verb: string;
  description: string;
  suffix?: string | null;
  product_allowance?: ProductAllowance | null;
  quantity?: number | null;
  unit?: string | null;
  internal_cost: number;
  markup: number;
  customer_price: number;
}

export interface QuoteTrade {
  trade_id: string;
  trade_name: string;
  trade_order: number;
  line_items: QuoteLineItem[];
}

export interface QuoteArea {
  area_id: string;
  area_name: string;
  area_total: number;
  trades: QuoteTrade[];
}

export interface AdditionalConsideration {
  item_name: string;
  price_range: {
    min: number;
    max: number;
  };
  description: string;
}

export interface MaterialsOverhead {
  dumpster?: number;
  floor_protection?: number;
  plastic_sheeting?: number;
  blue_tape?: number;
  plumbing_materials?: number;
  electrical_materials?: number;
  drywall_materials?: number;
  tile_consumables?: number;
  paint_materials?: number;
  caulk_adhesives?: number;
  general_overhead?: number;
  total_materials_overhead: number;
}

export interface PaymentMilestone {
  percentage: number;
  description: string;
  amount: number;
}

export interface PaymentSchedule {
  deposit: PaymentMilestone;
  progress: PaymentMilestone;
  final: PaymentMilestone;
}

export interface ProjectNote {
  note_number: number;
  text: string;
}

export interface QuoteTerms {
  validity_days: number;
  permits_included: boolean;
  permits_note: string;
}

export interface QuoteCustomer {
  name: string;
  phone?: string;
  email?: string;
  property_address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface QuoteCompany {
  name: string;
  phone?: string;
  email?: string;
  logo_url?: string;
}

export interface QuoteMetadata {
  quote_id: string;
  created_date: string;
  valid_for_days: number;
  company: QuoteCompany;
}

export interface QuoteTotals {
  subtotal_labor_materials: number;
  markup_multiplier: number;
  area_totals: Array<{
    area_name: string;
    total: number;
  }>;
  grand_total: number;
}

export interface QuoteProject {
  type: string;
  areas: QuoteArea[];
}

export interface QuoteSchema {
  metadata: QuoteMetadata;
  customer: QuoteCustomer;
  project: QuoteProject;
  additional_considerations?: AdditionalConsideration[];
  materials_overhead?: MaterialsOverhead;
  totals: QuoteTotals;
  payment_schedule: PaymentSchedule;
  project_notes?: ProjectNote[];
  terms?: QuoteTerms;
}

/**
 * Render a line item to display string
 */
export function renderQuoteLineItem(item: QuoteLineItem): string {
  let line = `− ${item.action_verb} ${item.description}`;
  
  if (item.suffix) {
    line += ` (${item.suffix})`;
  }
  
  if (item.product_allowance) {
    if (item.product_allowance.per_unit && item.product_allowance.unit) {
      line += ` (${item.product_allowance.description} $${item.product_allowance.amount}/${item.product_allowance.unit})`;
    } else {
      line += ` (${item.product_allowance.description} $${item.product_allowance.amount.toLocaleString()})`;
    }
  }
  
  return line;
}

/**
 * Format currency for display
 */
export function formatQuoteCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Check if the payload matches the new quote schema
 */
export function isNewQuoteSchema(payload: unknown): payload is { quote: QuoteSchema } {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  return p.quote !== undefined && 
         typeof p.quote === 'object' && 
         p.quote !== null &&
         'project' in (p.quote as Record<string, unknown>) &&
         'totals' in (p.quote as Record<string, unknown>);
}
