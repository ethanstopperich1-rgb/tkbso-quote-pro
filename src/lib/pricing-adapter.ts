/**
 * PRICING ADAPTER
 * 
 * Bridges the current estimator scope state to the new v2 pricing table.
 * This allows gradual migration while maintaining compatibility.
 */

import { 
  PRICING_TABLE, 
  findPricingItem, 
  calculateLineItemTotal,
  getVanityTier,
  calculateCountertopSqft,
  PricingItem,
  CATEGORY_CONFIG
} from './pricing-table-v2';

import {
  ScopeState,
  LineItem,
  createInitialScope,
  generateLineItems,
  calculateEstimateTotals,
  formatLineItemsForReview,
  ValidationError,
  validateScope
} from './line-item-generator-v2';

import { ExtractedLineItem } from './deterministic-pricing';

// Re-export everything from v2 modules
export { 
  PRICING_TABLE, 
  findPricingItem, 
  calculateLineItemTotal,
  getVanityTier,
  calculateCountertopSqft,
  CATEGORY_CONFIG,
  createInitialScope,
  generateLineItems,
  calculateEstimateTotals,
  formatLineItemsForReview,
  validateScope
};

export type { PricingItem, ScopeState, LineItem, ValidationError };

// ============================================================================
// LEGACY COMPATIBILITY - Map old ExtractedLineItem to new LineItem
// ============================================================================

export interface LegacyExtractedLineItem {
  name: string;
  quantity: number;
  unit: 'ea' | 'sqft' | 'lf';
  ic: number;
  cp: number;
  category: string;
}

/**
 * Convert new LineItem format to legacy ExtractedLineItem format
 */
export function lineItemToLegacy(item: LineItem): LegacyExtractedLineItem {
  return {
    name: item.name,
    quantity: item.quantity,
    unit: item.unit as 'ea' | 'sqft' | 'lf',
    ic: item.cost,
    cp: item.price,
    category: item.category,
  };
}

/**
 * Convert legacy ExtractedLineItem to new LineItem format
 */
export function legacyToLineItem(item: LegacyExtractedLineItem): LineItem {
  return {
    name: item.name,
    displayName: item.name,
    quantity: item.quantity,
    unit: item.unit,
    cost: item.ic,
    price: item.cp,
    category: item.category,
    isAutoAdded: false,
  };
}

/**
 * Build line items directly from a pricing key and quantity
 */
export function buildLineItem(
  pricingKey: string, 
  quantity: number, 
  isAutoAdded: boolean = false,
  reason?: string
): LineItem | null {
  if (quantity <= 0) return null;
  
  const found = findPricingItem(pricingKey);
  if (!found) {
    console.warn(`Pricing key not found: "${pricingKey}"`);
    return null;
  }
  
  const { key, item } = found;
  const totals = calculateLineItemTotal(key, quantity);
  if (!totals) return null;
  
  return {
    name: key,
    displayName: key,
    quantity,
    unit: item.unit,
    cost: totals.cost,
    price: totals.price,
    category: item.category,
    isAutoAdded,
    reason,
  };
}

/**
 * Build multiple line items from a simple scope description
 * This is the quick-add interface for the estimator chat
 */
export interface QuickAddItem {
  key: string;        // User intent (e.g., "2 vanities", "4 faucets")
  pricingKey: string; // Resolved pricing table key
  quantity: number;
  size?: number;      // For vanities - size in inches
}

/**
 * Parse a quick-add string like "2 vanities 60 inches" into line items
 */
export function parseQuickAdd(input: string): QuickAddItem[] {
  const items: QuickAddItem[] = [];
  const normalized = input.toLowerCase().trim();
  
  // Pattern: quantity + item + optional size
  const patterns = [
    // Vanities with size
    { 
      regex: /(\d+)\s*(?:x\s*)?(\d+)(?:"|in|inch)?\s*vanit(?:y|ies)/gi,
      handler: (match: RegExpMatchArray) => ({
        key: `${match[1]} x ${match[2]}" vanity`,
        pricingKey: getVanityTier(parseInt(match[2])),
        quantity: parseInt(match[1]),
        size: parseInt(match[2])
      })
    },
    // Vanities - qty then size
    { 
      regex: /(\d+)\s*vanit(?:y|ies)\s*(?:,?\s*)?(\d+)(?:"|in|inch)?/gi,
      handler: (match: RegExpMatchArray) => ({
        key: `${match[1]} x ${match[2]}" vanity`,
        pricingKey: getVanityTier(parseInt(match[2])),
        quantity: parseInt(match[1]),
        size: parseInt(match[2])
      })
    },
    // Faucets
    { 
      regex: /(\d+)\s*faucets?/gi,
      handler: (match: RegExpMatchArray) => ({
        key: `${match[1]} faucet(s)`,
        pricingKey: 'Faucet - Bathroom',
        quantity: parseInt(match[1])
      })
    },
    // Sinks
    { 
      regex: /(\d+)\s*(?:undermount\s*)?sinks?/gi,
      handler: (match: RegExpMatchArray) => ({
        key: `${match[1]} sink cutout(s)`,
        pricingKey: 'Sink Cutout - Undermount',
        quantity: parseInt(match[1])
      })
    },
    // Toilets
    { 
      regex: /(\d+)\s*toilets?/gi,
      handler: (match: RegExpMatchArray) => ({
        key: `${match[1]} toilet(s)`,
        pricingKey: 'Toilet',
        quantity: parseInt(match[1])
      })
    },
    // Recessed lights
    { 
      regex: /(\d+)\s*(?:recessed|can)\s*lights?/gi,
      handler: (match: RegExpMatchArray) => ({
        key: `${match[1]} recessed light(s)`,
        pricingKey: 'Electrical - Recessed Light',
        quantity: parseInt(match[1])
      })
    },
    // Vanity lights
    { 
      regex: /(\d+)\s*vanity\s*lights?/gi,
      handler: (match: RegExpMatchArray) => ({
        key: `${match[1]} vanity light(s)`,
        pricingKey: 'Electrical - Vanity Light',
        quantity: parseInt(match[1])
      })
    },
    // Mirrors
    { 
      regex: /(\d+)\s*(?:led\s*)?mirrors?/gi,
      handler: (match: RegExpMatchArray) => ({
        key: `${match[1]} mirror(s)`,
        pricingKey: normalized.includes('led') ? 'Mirror - LED' : 'Mirror - Standard',
        quantity: parseInt(match[1])
      })
    },
    // Niches
    { 
      regex: /(\d+)\s*(?:shower\s*)?niches?/gi,
      handler: (match: RegExpMatchArray) => ({
        key: `${match[1]} niche(s)`,
        pricingKey: 'Shower Niche',
        quantity: parseInt(match[1])
      })
    },
  ];
  
  for (const { regex, handler } of patterns) {
    regex.lastIndex = 0;  // Reset regex state
    let match;
    while ((match = regex.exec(normalized)) !== null) {
      items.push(handler(match));
    }
  }
  
  return items;
}

/**
 * Build line items from quick-add items
 */
export function buildFromQuickAdd(items: QuickAddItem[]): LineItem[] {
  const lineItems: LineItem[] = [];
  
  for (const item of items) {
    const lineItem = buildLineItem(item.pricingKey, item.quantity);
    if (lineItem) {
      lineItems.push(lineItem);
    }
  }
  
  return lineItems;
}

// ============================================================================
// CATEGORY HELPERS
// ============================================================================

/**
 * Get sorted categories for display
 */
export function getSortedCategories(): { key: string; label: string }[] {
  return Object.entries(CATEGORY_CONFIG)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key, config]) => ({ key, label: config.label }));
}

/**
 * Get all items grouped by category
 */
export function getItemsByCategory(): Record<string, { key: string; item: PricingItem }[]> {
  const grouped: Record<string, { key: string; item: PricingItem }[]> = {};
  
  for (const [key, item] of Object.entries(PRICING_TABLE)) {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push({ key, item });
  }
  
  return grouped;
}

/**
 * Search pricing table
 */
export function searchPricingItems(query: string): { key: string; item: PricingItem }[] {
  const results: { key: string; item: PricingItem }[] = [];
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return results;
  
  for (const [key, item] of Object.entries(PRICING_TABLE)) {
    // Check key
    if (key.toLowerCase().includes(normalizedQuery)) {
      results.push({ key, item });
      continue;
    }
    
    // Check aliases
    if (item.aliases.some(alias => alias.toLowerCase().includes(normalizedQuery))) {
      results.push({ key, item });
    }
  }
  
  return results;
}

// ============================================================================
// SCOPE TO LINE ITEMS - Main conversion function
// ============================================================================

/**
 * Convert a simple scope object to line items using the v2 pricing table
 * This is the main integration point for the estimator chat
 */
export interface SimpleScopeInput {
  // Vanities
  vanityCount?: number;
  vanitySize?: number;  // in inches
  
  // Fixtures
  faucetCount?: number;
  sinkCount?: number;
  toiletCount?: number;
  mirrorCount?: number;
  isLedMirror?: boolean;
  
  // Demo
  demoVanity?: boolean;
  demoToilet?: boolean;
  demoShower?: boolean;
  demoTub?: boolean;
  demoType?: 'half' | 'full' | 'large' | 'shower_only' | 'kitchen';
  
  // Plumbing
  plumbingVanityConnections?: number;
  showerRoughIn?: boolean;
  toiletInstall?: boolean;
  
  // Countertops
  countertopMaterial?: 'laminate' | 'quartz1' | 'quartz2' | 'quartz3' | 'granite' | 'quartzite' | 'marble';
  countertopSqft?: number;
  
  // Glass
  glassType?: 'door' | 'panel' | 'door-panel' | '90-degree' | 'full-enclosure';
  
  // Electrical
  recessedLights?: number;
  vanityLights?: number;
  
  // Paint
  paintBathroom?: 'half' | 'full' | 'large';
  
  // Extras
  niches?: number;
  
  // Raw items (already parsed)
  rawItems?: { pricingKey: string; quantity: number }[];
}

export function buildLineItemsFromSimpleScope(input: SimpleScopeInput): LineItem[] {
  const lineItems: LineItem[] = [];
  
  const addItem = (key: string, qty: number, auto = false, reason?: string) => {
    const item = buildLineItem(key, qty, auto, reason);
    if (item) lineItems.push(item);
  };
  
  // Demo
  if (input.demoType) {
    const demoMap: Record<string, string> = {
      'half': 'Demo - Half Bath',
      'full': 'Demo - Full Bath',
      'large': 'Demo - Large Bathroom',
      'shower_only': 'Demo - Shower',
      'kitchen': 'Demo - Full Kitchen',
    };
    addItem(demoMap[input.demoType], 1);
  } else {
    if (input.demoVanity && input.vanityCount) {
      addItem('Demo - Vanity', input.vanityCount);
    }
    if (input.demoToilet && input.toiletCount) {
      addItem('Demo - Toilet', input.toiletCount || 1);
    }
    if (input.demoShower) addItem('Demo - Shower', 1);
    if (input.demoTub) addItem('Demo - Tub', 1);
  }
  
  // Vanities
  if (input.vanityCount && input.vanitySize) {
    const vanityKey = getVanityTier(input.vanitySize);
    addItem(vanityKey, input.vanityCount);
  }
  
  // Countertops
  if (input.countertopMaterial) {
    let sqft = input.countertopSqft || 0;
    if (sqft === 0 && input.vanityCount && input.vanitySize) {
      sqft = calculateCountertopSqft(input.vanitySize) * input.vanityCount;
    }
    if (sqft > 0) {
      const materialMap: Record<string, string> = {
        'laminate': 'Countertop - Laminate',
        'quartz1': 'Countertop - Quartz Level 1',
        'quartz2': 'Countertop - Quartz Level 2',
        'quartz3': 'Countertop - Quartz Level 3',
        'granite': 'Countertop - Granite',
        'quartzite': 'Countertop - Quartzite',
        'marble': 'Countertop - Marble',
      };
      addItem(materialMap[input.countertopMaterial], sqft, sqft !== input.countertopSqft, 'Calculated from vanity size');
    }
  }
  
  // Sink cutouts
  if (input.sinkCount) {
    addItem('Sink Cutout - Undermount', input.sinkCount);
  }
  
  // Faucets
  if (input.faucetCount) {
    addItem('Faucet - Bathroom', input.faucetCount);
  }
  
  // Plumbing connections
  const plumbingConnections = input.plumbingVanityConnections ?? input.vanityCount ?? 0;
  if (plumbingConnections > 0) {
    addItem('Plumbing - Vanity Connection', plumbingConnections, !input.plumbingVanityConnections, 'One per vanity');
  }
  
  // Shower plumbing
  if (input.showerRoughIn) {
    addItem('Plumbing - Shower Rough-In', 1);
  }
  
  // Toilets
  if (input.toiletCount && input.toiletInstall) {
    addItem('Plumbing - Toilet', input.toiletCount);
  }
  if (input.toiletCount) {
    addItem('Toilet', input.toiletCount);
  }
  
  // Mirrors
  if (input.mirrorCount) {
    addItem(input.isLedMirror ? 'Mirror - LED' : 'Mirror - Standard', input.mirrorCount);
  }
  
  // Electrical
  if (input.recessedLights) {
    addItem('Electrical - Recessed Light', input.recessedLights);
  }
  if (input.vanityLights) {
    addItem('Electrical - Vanity Light', input.vanityLights);
  }
  
  // Glass
  if (input.glassType) {
    const glassMap: Record<string, string> = {
      'door': 'Glass - Door Only',
      'panel': 'Glass - Panel Only',
      'door-panel': 'Glass - Door + Panel',
      '90-degree': 'Glass - 90 Degree Return',
      'full-enclosure': 'Glass - Full Enclosure',
    };
    addItem(glassMap[input.glassType], 1);
  }
  
  // Niches
  if (input.niches) {
    addItem('Shower Niche', input.niches);
  }
  
  // Paint
  if (input.paintBathroom) {
    const paintMap: Record<string, string> = {
      'half': 'Paint - Half Bath',
      'full': 'Paint - Full Bath',
      'large': 'Paint - Large Bath',
    };
    addItem(paintMap[input.paintBathroom], 1);
  }
  
  // Raw items (already parsed)
  if (input.rawItems) {
    for (const raw of input.rawItems) {
      addItem(raw.pricingKey, raw.quantity);
    }
  }
  
  // Auto-add caulking if we have wet work
  const hasWetWork = lineItems.some(i => 
    i.category === 'tile' || 
    i.category === 'cabinetry' || 
    i.category === 'fixtures'
  );
  if (hasWetWork) {
    addItem('Final Caulking', 1, true, 'Final caulking for wet areas');
  }
  
  return lineItems;
}

// ============================================================================
// TOTALS - Accepts both LineItem[] and ExtractedLineItem[]
// ============================================================================

export interface TotalsResult {
  totalIC: number;
  totalCP: number;
  margin: number;
  marginPercent: number;
  lowEstimate: number;
  highEstimate: number;
}

/**
 * Calculate totals - accepts both new LineItem[] and legacy ExtractedLineItem[]
 */
export function calculateTotals(lineItems: (LineItem | LegacyExtractedLineItem)[]): TotalsResult {
  // Convert legacy items to new format if needed
  const normalizedItems: LineItem[] = lineItems.map(item => {
    // Check if it's already a LineItem (has 'cost' property)
    if ('cost' in item && 'displayName' in item) {
      return item as LineItem;
    }
    // Convert legacy ExtractedLineItem
    const legacyItem = item as LegacyExtractedLineItem;
    return {
      name: legacyItem.name,
      displayName: legacyItem.name,
      quantity: legacyItem.quantity,
      unit: legacyItem.unit,
      cost: legacyItem.ic,
      price: legacyItem.cp,
      category: legacyItem.category,
      isAutoAdded: false,
    };
  });
  
  const totals = calculateEstimateTotals(normalizedItems);
  
  return {
    totalIC: totals.totalCost,
    totalCP: totals.totalPrice,
    margin: totals.margin,
    marginPercent: totals.marginPercent,
    lowEstimate: Math.round(totals.totalPrice * 0.95),
    highEstimate: Math.round(totals.totalPrice * 1.1),
  };
}

/**
 * Convert legacy ExtractedLineItem[] to new LineItem[] format
 */
export function convertLegacyLineItems(items: LegacyExtractedLineItem[]): LineItem[] {
  return items.map(item => ({
    name: item.name,
    displayName: item.name,
    quantity: item.quantity,
    unit: item.unit,
    cost: item.ic,
    price: item.cp,
    category: item.category,
    isAutoAdded: false,
  }));
}
