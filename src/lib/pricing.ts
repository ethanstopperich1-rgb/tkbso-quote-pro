// TKBSO Pricing Constants and Calculations

export const PRICING = {
  // Per-square-foot client-facing ranges
  perSqFt: {
    bathroom: { low: 360, high: 380 },
    kitchen: { low: 175, high: 195 },
    closet: { low: 45, high: 75 },
  },
  
  // Internal cost defaults (IC)
  internalCosts: {
    tileLabor: {
      showerWalls: 21, // per sq ft
      showerFloor: 5, // per sq ft
      mainFloor: 4.5, // per sq ft
    },
    cementBoard: 3, // per sq ft
    quartzFabInstall: 15, // per sq ft (basic level 1, 3cm)
    recessedCan: 65, // each, install only
    gcPermitFee: 2500, // flat fee
  },
  
  // Markup percentages
  markups: {
    cabinetNoGC: 1.28, // 28% markup when no GC
    targetMargin: 0.38, // 38% target margin
    marginRange: { low: 0.35, high: 0.40 },
  },
  
  // Default allowance rates (client-facing)
  allowances: {
    tileMaterial: 6.20, // per sq ft
    plumbingFixtures: 1500, // per bathroom
    toilet: 450, // each
    sink: 350, // each
    showerGlass: 2200, // per shower
    mirror: 400, // each
    hardware: 15, // per pull
    lightingFixture: 250, // each
  },
};

export function calculateClientPriceFromIC(internalCost: number, targetMargin = 0.38): number {
  // Client Price = Internal Cost / (1 - margin)
  return Math.round(internalCost / (1 - targetMargin));
}

export function calculateMargin(clientPrice: number, internalCost: number): number {
  return (clientPrice - internalCost) / clientPrice;
}

export function calculateBathroomRange(sqft: number): { low: number; high: number; mid: number } {
  const low = sqft * PRICING.perSqFt.bathroom.low;
  const high = sqft * PRICING.perSqFt.bathroom.high;
  const mid = (low + high) / 2;
  return { low: Math.round(low), high: Math.round(high), mid: Math.round(mid) };
}

export function calculateKitchenRange(sqft: number): { low: number; high: number; mid: number } {
  const low = sqft * PRICING.perSqFt.kitchen.low;
  const high = sqft * PRICING.perSqFt.kitchen.high;
  const mid = (low + high) / 2;
  return { low: Math.round(low), high: Math.round(high), mid: Math.round(mid) };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(decimal: number): string {
  return `${(decimal * 100).toFixed(1)}%`;
}
