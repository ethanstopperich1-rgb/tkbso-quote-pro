// ─── Core Quote Types ────────────────────────────────────────────────────────

export type ProjectType = 'kitchen' | 'bathroom' | 'both' | 'other';

export type QuoteStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'approved'
  | 'declined'
  | 'expired';

export interface LineItem {
  id: string;
  category: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  source: 'manual' | 'homedepot' | 'ai_suggested' | 'supplier';
  hdProductId?: string;
  hdProductUrl?: string;
  isOptional?: boolean;
  photos?: string[]; // storage URLs
}

export interface QuoteSection {
  id: string;
  title: string;
  items: LineItem[];
  subtotal: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface Quote {
  id: string;
  quoteNumber: string; // e.g. TKBSO-2026-0042
  client: Client;
  projectType: ProjectType;
  projectAddress: string;
  sections: QuoteSection[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  markup: number; // percentage
  notes?: string;
  terms?: string;
  status: QuoteStatus;
  validUntil: string; // ISO date
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  viewedAt?: string;
  approvedAt?: string;
  signatureDataUrl?: string;
  followUpScheduled?: string; // ISO datetime
  followUpCount: number;
  // AI metadata
  aiGeneratedScope?: string;
  aiSuggestedItems?: LineItem[];
  aiGapWarnings?: string[];
  // Pricing metadata
  marketMultiplier: number; // Orlando market adjustment
  priceLastSyncedAt?: string;
}

// ─── AI Engine Types ──────────────────────────────────────────────────────────

export interface AIScopeRequest {
  projectType: ProjectType;
  voiceTranscript?: string;
  photoDescriptions?: string[];
  manualNotes?: string;
  squareFootage?: number;
  budget?: number;
}

export interface AIScopeResponse {
  lineItems: Omit<LineItem, 'id' | 'source'>[];
  gapWarnings: string[];
  suggestedMarkup: number;
  summary: string;
}

// ─── Pricing Engine Types ─────────────────────────────────────────────────────

export interface HDProduct {
  itemId: string;
  name: string;
  brand: string;
  price: number;
  unit: string;
  url: string;
  imageUrl?: string;
  inStock: boolean;
  storeId?: string; // Home Depot store ID for Orlando
}

export interface PriceResult {
  keyword: string;
  products: HDProduct[];
  bestMatch?: HDProduct;
  orlandoAdjustedPrice: number;
  lastFetched: string;
}

// ─── Orlando Market Rates ─────────────────────────────────────────────────────

export interface LaborRate {
  category: string;
  ratePerHour: number; // USD
  typicalHours?: number;
  notes?: string;
}

export interface OrlandoMarketData {
  marketMultiplier: number; // vs national avg
  laborRates: LaborRate[];
  lastUpdated: string;
}

// ─── Follow-up Types ──────────────────────────────────────────────────────────

export interface FollowUp {
  id: string;
  quoteId: string;
  scheduledAt: string; // ISO datetime
  sentAt?: string;
  channel: 'email' | 'sms';
  templateKey: string;
  status: 'pending' | 'sent' | 'failed';
}

// ─── Offline Sync Types ───────────────────────────────────────────────────────

export type SyncStatus = 'synced' | 'pending' | 'conflict';

export interface OfflineQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
}
