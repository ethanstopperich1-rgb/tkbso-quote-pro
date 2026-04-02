/**
 * TKBSO Quote Pro — Pre-Built Scope Templates
 * April 2026 — All figures at Standard Tier (1.0×), 38% margin
 *
 * Each template is a complete line-item list that maps to existing
 * system rates from tkbso-pricing.ts and chatFlow.ts calculateEstimate().
 */

export interface ScopeTemplate {
  id: string;
  name: string;
  description: string;
  roomType: string;         // maps to chatFlow roomType
  totalIc: number;
  totalCp: number;
  margin: number;
  tier: 'standard' | 'upgraded' | 'premium';
  /** Pre-filled EstimateState values to inject into chatFlow */
  presets: Record<string, unknown>;
  /** Trade breakdown for display before selection */
  trades: { name: string; ic: number; cp: number }[];
}

export const SCOPE_TEMPLATES: ScopeTemplate[] = [
  // ── 2A. Guest Bathroom — Full Gut (5×8) ──
  {
    id: 'guest-bath-full-gut',
    name: 'Guest Bath — Full Gut',
    description: '5×8 full demo, new shower, toilet swap, 36" vanity, tile walls + floor, glass door, paint, permit',
    roomType: 'Guest Bathroom',
    totalIc: 14362,
    totalCp: 23165,
    margin: 0.38,
    tier: 'standard',
    presets: {
      bathDemo: 'Full Gut',
      bathShowerType: 'Walk-in Shower (new build)',
      bathTileWallSqft: 80,
      bathTileFloorSqft: 31,
      bathVanitySize: '36"',
      bathCountertop: 'Level 1 Quartz',
      bathGlass: 'Standard (door+panel)',
      bathExtras: ['recessed_cans', 'new_toilet', 'led_mirror', 'niche', 'paint_full', 'door_trim'],
      bathPlumbingExtras: [],
      pricingTier: 'Standard',
      paymentSchedule: '65/25/10',
    },
    trades: [
      { name: 'Demo + Dumpster', ic: 1700, cp: 2742 },
      { name: 'Plumbing (shower + toilet)', ic: 3050, cp: 4920 },
      { name: 'Electrical (2 cans + vanity light)', ic: 580, cp: 936 },
      { name: 'Framing + Niche', ic: 1050, cp: 1694 },
      { name: 'Tile (wall + floor + shower floor)', ic: 1816, cp: 2930 },
      { name: 'Waterproofing + Cement Board', ic: 135, cp: 218 },
      { name: 'Vanity 36" Bundle', ic: 1300, cp: 2097 },
      { name: 'Shower Glass (standard)', ic: 1200, cp: 1935 },
      { name: 'Paint Full Bath', ic: 1200, cp: 1935 },
      { name: 'Material Allowances', ic: 825, cp: 1331 },
      { name: 'Support Materials + Consumables', ic: 1156, cp: 0 },
      { name: 'Permit', ic: 350, cp: 565 },
    ],
  },

  // ── 2B. Primary/Master Bath — Full Gut (8×10) ──
  {
    id: 'primary-bath-full-gut',
    name: 'Primary Bath — Full Gut',
    description: '8×10 full demo, walk-in shower, freestanding tub w/ slab trench, pony wall, 2 niches, 72" double vanity, 90° glass, paint, permit',
    roomType: 'Primary Bathroom',
    totalIc: 25190,
    totalCp: 40629,
    margin: 0.38,
    tier: 'standard',
    presets: {
      bathDemo: 'Full Gut',
      bathShowerType: 'Freestanding Tub + Walk-in Shower',
      bathTileWallSqft: 150,
      bathTileFloorSqft: 55,
      bathVanitySize: '72"',
      bathCountertop: 'Level 1 Quartz',
      bathGlass: '90\u00B0 Return (door+2 panels)',
      bathExtras: ['recessed_cans', 'new_toilet', 'led_mirror', 'niche', 'pony_wall', 'paint_full', 'door_trim'],
      bathPlumbingExtras: [],
      pricingTier: 'Standard',
      paymentSchedule: '35/30/20/15',
    },
    trades: [
      { name: 'Demo + Dumpster', ic: 2050, cp: 3306 },
      { name: 'Plumbing (shower + tub + toilet)', ic: 6250, cp: 10081 },
      { name: 'Electrical (4 cans + 2 vanity lights)', ic: 983, cp: 1586 },
      { name: 'Framing + Pony Wall + 2 Niches + Leveling', ic: 2300, cp: 3710 },
      { name: 'Tile (150 wall + 55 floor + 16 shower floor)', ic: 3382, cp: 5455 },
      { name: 'Waterproofing + Cement Board', ic: 225, cp: 363 },
      { name: 'Vanity 72" Bundle (double)', ic: 2600, cp: 4194 },
      { name: 'Shower Glass (90° return)', ic: 1425, cp: 2298 },
      { name: 'Paint Full Bath', ic: 1200, cp: 1935 },
      { name: 'Material Allowances', ic: 2330, cp: 3758 },
      { name: 'Support Materials + Consumables', ic: 1995, cp: 0 },
      { name: 'Permit', ic: 450, cp: 726 },
    ],
  },

  // ── 2C. Tub-to-Shower Conversion (5×8) ──
  {
    id: 'tub-to-shower',
    name: 'Tub-to-Shower Conversion',
    description: '5×8 partial demo (tub surround + tub removal), tub-to-shower plumbing, curb/blocking, niche, tile + glass, drywall, permit',
    roomType: 'Tub-to-Shower Conversion',
    totalIc: 10825,
    totalCp: 17460,
    margin: 0.38,
    tier: 'standard',
    presets: {
      bathDemo: 'Partial Demo',
      bathShowerType: 'Tub-to-Shower Conversion',
      bathTileWallSqft: 90,
      bathTileFloorSqft: 0,
      bathVanitySize: '',
      bathCountertop: 'No Countertop',
      bathGlass: 'Standard (door+panel)',
      bathExtras: ['recessed_cans', 'niche', 'door_trim'],
      bathPlumbingExtras: [],
      pricingTier: 'Standard',
      paymentSchedule: '65/25/10',
    },
    trades: [
      { name: 'Demo (partial) + Dumpster', ic: 1245, cp: 2008 },
      { name: 'Plumbing (tub-to-shower conversion)', ic: 3025, cp: 4879 },
      { name: 'Electrical (2 cans)', ic: 140, cp: 226 },
      { name: 'Framing + Niche', ic: 1050, cp: 1694 },
      { name: 'Tile (90 wall + 16 shower floor)', ic: 1880, cp: 3032 },
      { name: 'Waterproofing + Cement Board', ic: 225, cp: 363 },
      { name: 'Shower Glass (standard)', ic: 1200, cp: 1935 },
      { name: 'Support Materials + Consumables', ic: 1489, cp: 0 },
      { name: 'Material Allowances', ic: 255, cp: 411 },
      { name: 'Permit', ic: 300, cp: 484 },
    ],
  },

  // ── 2D. Kitchen — Low Tier ──
  {
    id: 'kitchen-low',
    name: 'Kitchen — Low Tier',
    description: '10 KCC Brooklyn Gray cabinets, laminate countertops, LVP flooring, kitchen electrical, under-cab lighting, paint, permit',
    roomType: 'Kitchen',
    totalIc: 10156,
    totalCp: 16381,
    margin: 0.38,
    tier: 'standard',
    presets: {
      kitchenDemo: 'Full Gut',
      kitchenCabinets: 'Full Replace (KCC)',
      kitchenCabinetColor: 'Light Gray',
      kitchenCabinetCount: 10,
      kitchenCabinetAddons: ['crown_molding'],
      kitchenCountertop: 'Laminate',
      kitchenCountertopSqft: 25,
      kitchenBacksplash: 'No Backsplash',
      kitchenFlooring: 'LVP',
      kitchenFlooringSqft: 100,
      kitchenExtras: ['under_cabinet_lighting', 'paint'],
      pricingTier: 'Standard',
      paymentSchedule: '65/25/10',
    },
    trades: [
      { name: 'Demo + Dumpster', ic: 2575, cp: 4154 },
      { name: 'KCC Cabinets (10 units, Brooklyn Gray)', ic: 1518, cp: 2448 },
      { name: 'Crown Molding', ic: 180, cp: 290 },
      { name: 'Laminate Countertop (25 sqft)', ic: 300, cp: 484 },
      { name: 'LVP Flooring (100 sqft)', ic: 250, cp: 403 },
      { name: 'Electrical Package', ic: 950, cp: 1532 },
      { name: 'Under-Cabinet Lighting', ic: 350, cp: 565 },
      { name: 'Framing', ic: 750, cp: 1210 },
      { name: 'Paint', ic: 1200, cp: 1935 },
      { name: 'Material Allowances', ic: 380, cp: 613 },
      { name: 'Support Materials + Consumables', ic: 1303, cp: 0 },
      { name: 'Permit', ic: 400, cp: 645 },
    ],
  },

  // ── 2E. Kitchen — Mid Tier ──
  {
    id: 'kitchen-mid',
    name: 'Kitchen — Mid Tier',
    description: '15 KCC Brooklyn Fawn/Slate cabinets + accessories, quartz 30 sqft, backsplash, hardwood, sink relocation, full electrical, paint, permit',
    roomType: 'Kitchen',
    totalIc: 18515,
    totalCp: 29863,
    margin: 0.38,
    tier: 'standard',
    presets: {
      kitchenDemo: 'Full Gut',
      kitchenCabinets: 'Full Replace (KCC)',
      kitchenCabinetColor: 'Shaker White',
      kitchenCabinetCount: 15,
      kitchenCabinetAddons: ['crown_molding', 'pantry_tall', 'glass_fronts', 'lazy_susan', 'spice_rack', 'roll_out_trays', 'light_rail'],
      kitchenCountertop: 'Quartz',
      kitchenCountertopSqft: 30,
      kitchenBacksplash: 'Full Tile Backsplash',
      kitchenFlooring: 'Hardwood',
      kitchenFlooringSqft: 120,
      kitchenExtras: ['plumbing_sink', 'electrical', 'under_cabinet_lighting', 'appliance_circuits', 'paint'],
      pricingTier: 'Standard',
      paymentSchedule: '35/30/20/15',
    },
    trades: [
      { name: 'Demo + Dumpster', ic: 2575, cp: 4154 },
      { name: 'KCC Cabinets (15 units + accessories)', ic: 3824, cp: 6167 },
      { name: 'Quartz Countertop (30 sqft)', ic: 1200, cp: 1935 },
      { name: 'Backsplash Tile (25 sqft)', ic: 500, cp: 806 },
      { name: 'Hardwood Flooring (120 sqft)', ic: 960, cp: 1548 },
      { name: 'Plumbing (sink relocation)', ic: 1800, cp: 2903 },
      { name: 'Electrical (full + microwave + hood + DW)', ic: 2530, cp: 4081 },
      { name: 'Under-Cabinet Lighting', ic: 350, cp: 565 },
      { name: 'Framing', ic: 750, cp: 1210 },
      { name: 'Paint', ic: 1200, cp: 1935 },
      { name: 'Material Allowances', ic: 780, cp: 1258 },
      { name: 'Support Materials + Consumables', ic: 1546, cp: 0 },
      { name: 'Permit', ic: 500, cp: 806 },
    ],
  },

  // ── 2F. Kitchen — High Tier ──
  {
    id: 'kitchen-high',
    name: 'Kitchen — High Tier',
    description: '22 KCC Oslo Walnut at Premium 1.25× + full accessories, quartzite 40 sqft, backsplash, hardwood 150 sqft, sink relocation, full electrical, paint, permit',
    roomType: 'Kitchen',
    totalIc: 27279,
    totalCp: 43998,
    margin: 0.38,
    tier: 'premium',
    presets: {
      kitchenDemo: 'Full Gut',
      kitchenCabinets: 'Full Replace (KCC)',
      kitchenCabinetColor: 'Shaker White',
      kitchenCabinetCount: 22,
      kitchenCabinetAddons: ['crown_molding', 'pantry_tall', 'glass_fronts', 'lazy_susan', 'spice_rack', 'roll_out_trays', 'light_rail', 'oven_tower', 'wine_rack', 'microwave_cab', 'waste_bin', 'fridge_panel'],
      kitchenCountertop: 'Quartzite',
      kitchenCountertopSqft: 40,
      kitchenBacksplash: 'Full Tile Backsplash',
      kitchenFlooring: 'Hardwood',
      kitchenFlooringSqft: 150,
      kitchenExtras: ['plumbing_sink', 'electrical', 'under_cabinet_lighting', 'appliance_circuits', 'paint'],
      pricingTier: 'Premium',
      paymentSchedule: '35/30/20/15',
    },
    trades: [
      { name: 'Demo + Dumpster', ic: 2575, cp: 4154 },
      { name: 'KCC Cabinets (22 units, Oslo Walnut, Premium)', ic: 11868, cp: 19142 },
      { name: 'Quartzite Countertop (40 sqft)', ic: 2200, cp: 3548 },
      { name: 'Backsplash Tile (35 sqft)', ic: 700, cp: 1129 },
      { name: 'Hardwood Flooring (150 sqft)', ic: 1200, cp: 1935 },
      { name: 'Plumbing (sink relocation)', ic: 1800, cp: 2903 },
      { name: 'Electrical (full + circuits)', ic: 2530, cp: 4081 },
      { name: 'Under-Cabinet Lighting', ic: 350, cp: 565 },
      { name: 'Framing', ic: 750, cp: 1210 },
      { name: 'Paint', ic: 1200, cp: 1935 },
      { name: 'Material Allowances', ic: 2060, cp: 3323 },
      { name: 'Support Materials + Consumables', ic: 1696, cp: 0 },
      { name: 'Permit', ic: 650, cp: 1048 },
    ],
  },
];

export function getTemplate(id: string): ScopeTemplate | undefined {
  return SCOPE_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesForRoom(roomType: string): ScopeTemplate[] {
  return SCOPE_TEMPLATES.filter(t => t.roomType === roomType);
}
