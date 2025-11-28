export type ProjectType = 'kitchen' | 'bathroom' | 'closet' | 'combination';
export type ScopeLevel = 'full-gut' | 'partial' | 'cosmetic';
export type QualityLevel = 'basic' | 'mid-range' | 'high-end';

export interface ProjectDetails {
  projectName?: string;
  location: string;
  projectType: ProjectType;
  rooms: RoomDetails[];
  hasGC: boolean;
  needsPermit: boolean;
  qualityLevel: QualityLevel;
  scopeLevel: ScopeLevel;
  customerSuppliedItems: string[];
  specialRequests: string[];
}

export interface RoomDetails {
  id: string;
  type: 'kitchen' | 'bathroom' | 'closet';
  name: string;
  sqft: number;
  features: string[];
}

export interface LineItem {
  category: string;
  description: string;
  qty?: number;
  unit?: string;
  rate?: number;
  total: number;
  isAllowance?: boolean;
  internalCost?: number;
}

export interface QuoteSection {
  title: string;
  items: string[];
}

export interface Quote {
  projectSnapshot: {
    name: string;
    location: string;
    roomsSummary: string;
    scopeSummary: string;
    permitGCSummary: string;
  };
  priceSummary: {
    lowEstimate: number;
    highEstimate: number;
    recommendedPrice: number;
    perSqftNote: string;
  };
  scopeOfWork: QuoteSection[];
  internalBreakdown: {
    internalCost: number;
    clientPrice: number;
    marginPercent: number;
    costBuckets: { name: string; internal: number; client: number }[];
  };
  assumptions: string[];
  openQuestions: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quote?: Quote;
}

export interface ConversationState {
  step: 'initial' | 'gathering' | 'clarifying' | 'generating' | 'complete';
  projectDetails: Partial<ProjectDetails>;
  messages: Message[];
  currentQuote?: Quote;
}
