// ============================================
// KCC Catalog — Lookup & Search Helpers
// ============================================

import type { KccColorLine } from './kcc-config';
import { KCC_SUPPLIER, calcDealerCost } from './kcc-config';

// Re-export the product type so consumers only need one import
export interface KccProduct {
  sku: string;
  category: string;
  categoryLabel: string;
  description: string;
  width: number;
  height: number;
  depth: number;
  doors: number;
  drawers: number;
  cabinetType: 'base' | 'wall' | 'tall' | 'vanity' | 'accessory' | 'molding' | 'filler' | 'panel' | 'specialty';
  prices: Record<KccColorLine, number>;
  notes: string;
}

// ---- Lazy catalog loader (avoids importing the huge file until needed) ----

let _catalog: KccProduct[] | null = null;

async function loadCatalog(): Promise<KccProduct[]> {
  if (_catalog) return _catalog;
  const mod = await import('./kcc-catalog');
  _catalog = mod.KCC_CATALOG;
  return _catalog;
}

// Sync version (use after first load, or import directly)
export function getCatalogSync(): KccProduct[] {
  if (!_catalog) {
    // Fallback: dynamic require won't work in browser, but this is for SSR/build
    throw new Error('KCC catalog not loaded yet. Call loadCatalog() first.');
  }
  return _catalog;
}

// ---- Lookup by SKU ----

export async function findBySku(sku: string): Promise<KccProduct | undefined> {
  const catalog = await loadCatalog();
  return catalog.find(p => p.sku.toUpperCase() === sku.toUpperCase());
}

// ---- Search by description or category ----

export async function searchProducts(query: string, filters?: {
  cabinetType?: KccProduct['cabinetType'];
  category?: string;
  minWidth?: number;
  maxWidth?: number;
}): Promise<KccProduct[]> {
  const catalog = await loadCatalog();
  const q = query.toLowerCase();

  return catalog.filter(p => {
    // Text match
    const textMatch = !query ||
      p.sku.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q);

    if (!textMatch) return false;

    // Filters
    if (filters?.cabinetType && p.cabinetType !== filters.cabinetType) return false;
    if (filters?.category && p.category !== filters.category) return false;
    if (filters?.minWidth && p.width < filters.minWidth) return false;
    if (filters?.maxWidth && p.width > filters.maxWidth) return false;

    return true;
  });
}

// ---- Get all products by cabinet type ----

export async function getByType(type: KccProduct['cabinetType']): Promise<KccProduct[]> {
  const catalog = await loadCatalog();
  return catalog.filter(p => p.cabinetType === type);
}

// ---- Get all unique categories ----

export async function getCategories(): Promise<{ category: string; label: string; count: number }[]> {
  const catalog = await loadCatalog();
  const map = new Map<string, { label: string; count: number }>();

  for (const p of catalog) {
    const existing = map.get(p.category);
    if (existing) {
      existing.count++;
    } else {
      map.set(p.category, { label: p.categoryLabel, count: 1 });
    }
  }

  return Array.from(map.entries()).map(([category, { label, count }]) => ({
    category, label, count,
  }));
}

// ---- Price calculation helpers ----

export interface KccPricedItem {
  sku: string;
  description: string;
  color: KccColorLine;
  colorName: string;
  qty: number;
  msrp: number;
  dealerCost: number;      // msrp × multiplier (0.40)
  extendedMsrp: number;    // msrp × qty
  extendedCost: number;    // dealerCost × qty
  assemblyCost: number;    // per unit
  extendedAssembly: number; // assemblyCost × qty
  totalCost: number;       // extendedCost + extendedAssembly
}

export function priceItem(
  product: KccProduct,
  color: KccColorLine,
  qty: number = 1,
): KccPricedItem {
  const msrp = product.prices[color] ?? 0;
  const dealerCost = calcDealerCost(msrp);
  const isLarge = product.cabinetType === 'tall' ||
    product.category.includes('utility') ||
    product.category.includes('oven');
  const assemblyCost = isLarge
    ? KCC_SUPPLIER.assemblyCosts.largeCabinet
    : KCC_SUPPLIER.assemblyCosts.regularCabinet;

  // Accessories, moldings, fillers, panels don't need assembly
  const needsAssembly = ['base', 'wall', 'tall', 'vanity'].includes(product.cabinetType);
  const finalAssembly = needsAssembly ? assemblyCost : 0;

  return {
    sku: product.sku,
    description: product.description,
    color,
    colorName: getColorName(color),
    qty,
    msrp,
    dealerCost,
    extendedMsrp: msrp * qty,
    extendedCost: round(dealerCost * qty),
    assemblyCost: finalAssembly,
    extendedAssembly: round(finalAssembly * qty),
    totalCost: round((dealerCost + finalAssembly) * qty),
  };
}

// ---- Cabinet Order Builder ----

export interface KccCabinetOrder {
  color: KccColorLine;
  colorName: string;
  items: KccPricedItem[];
  subtotalMsrp: number;
  subtotalCost: number;
  totalAssembly: number;
  deliveryCost: number;
  totalBeforeTax: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
}

export function buildCabinetOrder(
  items: { product: KccProduct; qty: number }[],
  color: KccColorLine,
  options?: {
    delivery?: boolean;
    taxRate?: number;
  }
): KccCabinetOrder {
  const pricedItems = items.map(({ product, qty }) => priceItem(product, color, qty));

  const subtotalCost = pricedItems.reduce((sum, i) => sum + i.extendedCost, 0);
  const totalAssembly = pricedItems.reduce((sum, i) => sum + i.extendedAssembly, 0);
  const deliveryCost = options?.delivery ? KCC_SUPPLIER.delivery.outbound2Men : 0;
  const totalBeforeTax = round(subtotalCost + totalAssembly + deliveryCost);
  const taxRate = options?.taxRate ?? 6.5; // FL sales tax
  const taxAmount = round(totalBeforeTax * (taxRate / 100));
  const grandTotal = round(totalBeforeTax + taxAmount);

  return {
    color,
    colorName: getColorName(color),
    items: pricedItems,
    subtotalMsrp: pricedItems.reduce((sum, i) => sum + i.extendedMsrp, 0),
    subtotalCost,
    totalAssembly,
    deliveryCost,
    totalBeforeTax,
    taxRate,
    taxAmount,
    grandTotal,
  };
}

// ---- Common vanity configurations for bathroom quotes ----

export const COMMON_VANITY_CONFIGS = {
  '24_single_sink': { sku: 'VS24', label: '24" Single Sink Vanity' },
  '27_single_sink': { sku: 'VS27', label: '27" Single Sink Vanity' },
  '30_single_sink': { sku: 'VS30', label: '30" Single Sink Vanity' },
  '36_double_fake': { sku: 'VS36', label: '36" Double Fake Drawer Vanity' },
  '30_combo_drawers_left': { sku: 'V3021DL', label: '30" Combo w/ Drawers Left' },
  '30_combo_drawers_right': { sku: 'V3021DR', label: '30" Combo w/ Drawers Right' },
  '36_combo_drawers_left': { sku: 'V3621DL', label: '36" Combo w/ Drawers Left' },
  '36_combo_drawers_right': { sku: 'V3621DR', label: '36" Combo w/ Drawers Right' },
  '42_combo_4drawer': { sku: 'VSD42-4', label: '42" Combo w/ 4 Side Drawers' },
  '48_combo_4drawer': { sku: 'VSD48-4', label: '48" Combo w/ 4 Side Drawers' },
  '12_drawer_stack': { sku: '3VDB12', label: '12" 3-Drawer Stack' },
  '15_drawer_stack': { sku: '3VDB15', label: '15" 3-Drawer Stack' },
  '18_drawer_stack': { sku: '3VDB18', label: '18" 3-Drawer Stack' },
  '30_knee_drawer': { sku: 'VKD30', label: '30" Knee Drawer' },
  '36_knee_drawer': { sku: 'VKD36', label: '36" Knee Drawer' },
} as const;

// ---- Helpers ----

function getColorName(code: KccColorLine): string {
  const names: Record<KccColorLine, string> = {
    SW: 'Shaker White', LG: 'Light Gray', SN: 'Sand', MW: 'Matte White',
    EB: 'Estate Brown', EW: 'Estate White', ES: 'Estate Sage',
  };
  return names[code];
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
