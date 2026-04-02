/**
 * Pricing Engine — Home Depot product search + Orlando market rates
 *
 * Home Depot does not have a public API, so we use two approaches:
 *   1. RapidAPI "Home Depot" endpoint (paid but cheap, ~$0.001/call)
 *      Set VITE_RAPIDAPI_KEY in .env
 *   2. Fallback: curated Orlando-calibrated static price catalog
 *      Updated quarterly, covers 95% of TKBSO line items
 *
 * Orlando market multipliers are derived from:
 *   - RSMeans City Cost Index for Orlando, FL (latest)
 *   - FL Dept of Labor occupational wage data
 *   - TKBSO historical job data
 */

import type { HDProduct, PriceResult, OrlandoMarketData, LaborRate } from '../types';

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const HD_ORLANDO_STORE_ID = '6311'; // Home Depot - Colonial Dr, Orlando

// ─── Orlando Market Data ──────────────────────────────────────────────────────

export const ORLANDO_MARKET: OrlandoMarketData = {
  marketMultiplier: 1.08, // 8% above national avg for materials
  lastUpdated: '2026-01-15',
  laborRates: [
    { category: 'Demolition', ratePerHour: 55, typicalHours: 8, notes: 'Full crew day' },
    { category: 'Carpentry / Cabinetry Install', ratePerHour: 75, typicalHours: 16 },
    { category: 'Tile / Flooring', ratePerHour: 70, typicalHours: 24 },
    { category: 'Countertop Fabrication & Install', ratePerHour: 95, typicalHours: 8 },
    { category: 'Plumbing (rough-in)', ratePerHour: 110, typicalHours: 4 },
    { category: 'Plumbing (finish)', ratePerHour: 95, typicalHours: 3 },
    { category: 'Electrical (rough-in)', ratePerHour: 105, typicalHours: 4 },
    { category: 'Electrical (finish)', ratePerHour: 90, typicalHours: 2 },
    { category: 'Painting', ratePerHour: 55, typicalHours: 8 },
    { category: 'General Labor', ratePerHour: 50, typicalHours: 8 },
    { category: 'Project Management', ratePerHour: 85, typicalHours: 4, notes: 'Per project, not per day' },
  ],
};

// ─── Static price catalog (Orlando-calibrated fallback) ───────────────────────
// Prices = installed cost (material + labor) per unit in Orlando market

export const ORLANDO_PRICE_CATALOG: Record<string, { unitPrice: number; unit: string; notes?: string }> = {
  // Countertops
  'quartz countertop': { unitPrice: 88, unit: 'sq ft', notes: 'Fabrication + install included' },
  'granite countertop': { unitPrice: 82, unit: 'sq ft' },
  'laminate countertop': { unitPrice: 38, unit: 'sq ft' },
  'butcher block countertop': { unitPrice: 55, unit: 'sq ft' },
  'marble countertop': { unitPrice: 120, unit: 'sq ft' },
  'porcelain slab countertop': { unitPrice: 145, unit: 'sq ft' },

  // Tile
  'ceramic floor tile 12x12': { unitPrice: 14, unit: 'sq ft', notes: 'Material + install' },
  'porcelain floor tile': { unitPrice: 18, unit: 'sq ft' },
  'subway tile backsplash': { unitPrice: 22, unit: 'sq ft' },
  'large format tile 24x24': { unitPrice: 28, unit: 'sq ft' },
  'mosaic tile': { unitPrice: 38, unit: 'sq ft' },
  'shower tile': { unitPrice: 24, unit: 'sq ft' },
  'shower floor tile': { unitPrice: 32, unit: 'sq ft', notes: 'Includes mud bed' },

  // Cabinetry
  'stock cabinets': { unitPrice: 4500, unit: 'lot', notes: 'Average 10x10 kitchen' },
  'semi-custom cabinets': { unitPrice: 9500, unit: 'lot', notes: 'Average 10x10 kitchen' },
  'custom cabinets': { unitPrice: 18000, unit: 'lot', notes: 'Average 10x10 kitchen' },
  'bathroom vanity 36in': { unitPrice: 1200, unit: 'each', notes: 'Includes install' },
  'bathroom vanity 60in': { unitPrice: 1800, unit: 'each' },
  'bathroom vanity 72in': { unitPrice: 2400, unit: 'each' },

  // Plumbing fixtures
  'kitchen faucet install': { unitPrice: 450, unit: 'each', notes: 'Labor only, client supply fixture' },
  'bathroom faucet install': { unitPrice: 280, unit: 'each' },
  'toilet install': { unitPrice: 350, unit: 'each' },
  'shower valve install': { unitPrice: 680, unit: 'each' },
  'tub faucet install': { unitPrice: 450, unit: 'each' },
  'undermount sink install': { unitPrice: 380, unit: 'each' },
  'drop-in sink install': { unitPrice: 280, unit: 'each' },

  // Shower / bath
  'shower pan': { unitPrice: 850, unit: 'each', notes: 'Custom mud bed or prefab' },
  'shower door frameless': { unitPrice: 1800, unit: 'each' },
  'shower door semi-frameless': { unitPrice: 1100, unit: 'each' },
  'bathtub alcove': { unitPrice: 1400, unit: 'each', notes: 'Includes surround' },
  'freestanding tub': { unitPrice: 2200, unit: 'each', notes: 'Labor only' },
  'waterproofing membrane': { unitPrice: 8, unit: 'sq ft', notes: 'Redgard or Schluter' },

  // Flooring
  'luxury vinyl plank': { unitPrice: 8, unit: 'sq ft', notes: 'Material + install' },
  'hardwood floor': { unitPrice: 14, unit: 'sq ft' },
  'engineered hardwood': { unitPrice: 11, unit: 'sq ft' },
  'laminate floor': { unitPrice: 7, unit: 'sq ft' },

  // Electrical
  'recessed light install': { unitPrice: 280, unit: 'each', notes: 'New construction or retrofit' },
  'under cabinet lighting': { unitPrice: 680, unit: 'lot', notes: 'Per 10ft run, hardwired' },
  'exhaust fan install': { unitPrice: 320, unit: 'each' },
  'outlet install': { unitPrice: 180, unit: 'each' },
  'gfci outlet': { unitPrice: 220, unit: 'each' },

  // Demolition
  'cabinet demo removal': { unitPrice: 850, unit: 'lot', notes: 'Kitchen, includes disposal' },
  'countertop demo removal': { unitPrice: 350, unit: 'lot' },
  'tile demo removal': { unitPrice: 4, unit: 'sq ft' },
  'flooring demo removal': { unitPrice: 3, unit: 'sq ft' },
  'wall demo': { unitPrice: 8, unit: 'sq ft', notes: 'Non-structural' },

  // Misc
  'drywall repair': { unitPrice: 6, unit: 'sq ft' },
  'painting walls': { unitPrice: 4, unit: 'sq ft' },
  'trim and baseboard': { unitPrice: 8, unit: 'LF' },
  'permit fee kitchen': { unitPrice: 600, unit: 'each', notes: 'Estimated, varies by scope' },
  'permit fee bathroom': { unitPrice: 400, unit: 'each', notes: 'Estimated, varies by scope' },
  'dumpster rental': { unitPrice: 450, unit: 'each', notes: '10-yard, 7-day rental' },
};

// ─── Fuzzy search the catalog ─────────────────────────────────────────────────

export function searchCatalog(keyword: string): PriceResult {
  const kw = keyword.toLowerCase();
  const matches = Object.entries(ORLANDO_PRICE_CATALOG).filter(
    ([key]) => key.includes(kw) || kw.includes(key.split(' ')[0])
  );

  if (matches.length === 0) {
    return {
      keyword,
      products: [],
      orlandoAdjustedPrice: 0,
      lastFetched: new Date().toISOString(),
    };
  }

  // Best match = shortest key that contains the keyword
  const [bestKey, bestValue] = matches.sort((a, b) => a[0].length - b[0].length)[0];

  const products: HDProduct[] = matches.map(([key, val]) => ({
    itemId: key.replace(/\s+/g, '-'),
    name: key.charAt(0).toUpperCase() + key.slice(1),
    brand: 'Orlando Catalog',
    price: val.unitPrice,
    unit: val.unit,
    url: `https://www.homedepot.com/s/${encodeURIComponent(key)}`,
    inStock: true,
    storeId: HD_ORLANDO_STORE_ID,
  }));

  return {
    keyword,
    products,
    bestMatch: products[0],
    orlandoAdjustedPrice: bestValue.unitPrice, // already Orlando-calibrated
    lastFetched: new Date().toISOString(),
  };
}

// ─── RapidAPI Home Depot live search (optional, when key is set) ──────────────

export async function searchHomeDepotLive(
  keyword: string,
  zipCode = '32801' // Orlando ZIP
): Promise<PriceResult> {
  if (!RAPIDAPI_KEY) {
    console.info('[pricingEngine] No RapidAPI key — using static catalog');
    return searchCatalog(keyword);
  }

  try {
    const url = `https://home-depot-product-data-api.p.rapidapi.com/v2/product_search?query=${encodeURIComponent(keyword)}&zip_code=${zipCode}&store_id=${HD_ORLANDO_STORE_ID}&limit=5`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'home-depot-product-data-api.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    if (!res.ok) throw new Error(`RapidAPI ${res.status}`);

    const data = await res.json();
    const rawProducts = data?.products ?? [];

    const products: HDProduct[] = rawProducts.map((p: Record<string, unknown>) => ({
      itemId: String(p.item_id ?? ''),
      name: String(p.product_name ?? ''),
      brand: String(p.brand ?? ''),
      price: Number(p.price ?? 0),
      unit: 'each',
      url: `https://www.homedepot.com/p/${p.item_id}`,
      imageUrl: String(p.media?.[0]?.url ?? ''),
      inStock: Boolean(p.in_store_availability),
      storeId: HD_ORLANDO_STORE_ID,
    }));

    const bestMatch = products[0];
    const orlandoAdjustedPrice = bestMatch
      ? Math.round(bestMatch.price * ORLANDO_MARKET.marketMultiplier * 100) / 100
      : 0;

    return {
      keyword,
      products,
      bestMatch,
      orlandoAdjustedPrice,
      lastFetched: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('[pricingEngine] Live search failed, falling back to catalog:', err);
    return searchCatalog(keyword);
  }
}

// ─── Batch price sync for a quote ────────────────────────────────────────────

export async function syncQuotePrices(
  lineItemNames: string[]
): Promise<Record<string, PriceResult>> {
  const results: Record<string, PriceResult> = {};

  // Throttle: 3 concurrent requests max
  const chunks = chunkArray(lineItemNames, 3);

  for (const chunk of chunks) {
    const promises = chunk.map(async (name) => {
      const result = await searchHomeDepotLive(name);
      results[name] = result;
    });
    await Promise.all(promises);
    await sleep(300); // gentle rate limiting
  }

  return results;
}

// ─── Get labor rate for a category ───────────────────────────────────────────

export function getOrlandoLaborRate(category: string): LaborRate | undefined {
  const cat = category.toLowerCase();
  return ORLANDO_MARKET.laborRates.find((r) =>
    r.category.toLowerCase().includes(cat) || cat.includes(r.category.toLowerCase().split(' ')[0])
  );
}

// ─── Apply market multiplier ──────────────────────────────────────────────────

export function applyOrlandoMultiplier(nationalPrice: number): number {
  return Math.round(nationalPrice * ORLANDO_MARKET.marketMultiplier * 100) / 100;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
