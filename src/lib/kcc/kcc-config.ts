// ============================================
// KCC (KitchenCrest Cabinets) — Supplier Configuration
// www.mykitchencrest.com
// Orlando office: orders.orl@mykitchencrest.com | (407) 479-7560
// ============================================

export const KCC_SUPPLIER = {
  name: 'KitchenCrest Cabinets, LLC',
  code: 'KCC',
  website: 'www.mykitchencrest.com',
  locations: {
    orlando: { email: 'orders.orl@mykitchencrest.com', phone: '(407) 479-7560' },
    melrosePark: { email: 'orders@mykitchencrest.com', phone: '(630) 868-0888' },
    sanAntonio: { email: 'orders.sa@mykitchencrest.com', phone: '(210) 774-5446' },
  },
  priceListDate: '2025-10-01',
  priceListVersion: 'October 2025 Revised',
  specBookVersion: '2024',
  /** TKB SO pays 40% of MSRP (60% discount off list) — verified from Sales Order #SO-KCCFL-4844 */
  multiplier: 0.40,
  /** Cabinets ship pre-assembled — assembly charged separately per unit */
  assembled: true,
  /** Assembly costs from Sales Order #SO-KCCFL-4844 */
  assemblyCosts: {
    regularCabinet: 25.00,
    largeCabinet: 20.00,   // pantries, oven cabs
  },
  /** Delivery from KCC Orlando warehouse */
  delivery: {
    outbound2Men: 50.00,
    pickUp: 0,
  },
  /** Prices subject to change without notice */
  pricesGuaranteed: false,
} as const;

// ---- Color Lines ----

export type KccColorLine = 'SW' | 'LG' | 'SN' | 'MW' | 'EB' | 'EW' | 'ES';
export type KccDoorStyle = 'shaker' | 'estate';

export interface KccColorInfo {
  code: KccColorLine;
  name: string;
  doorStyle: KccDoorStyle;
  description: string;
}

export const KCC_COLORS: KccColorInfo[] = [
  { code: 'SW', name: 'Shaker White', doorStyle: 'shaker', description: 'Classic white shaker — most popular' },
  { code: 'LG', name: 'Light Gray', doorStyle: 'shaker', description: 'Soft gray shaker' },
  { code: 'SN', name: 'Sand', doorStyle: 'shaker', description: 'Warm sand/tan shaker' },
  { code: 'MW', name: 'Matte White', doorStyle: 'shaker', description: 'Flat white finish shaker' },
  { code: 'EB', name: 'Estate Brown', doorStyle: 'estate', description: 'Rich brown estate door' },
  { code: 'EW', name: 'Estate White', doorStyle: 'estate', description: 'White estate door' },
  { code: 'ES', name: 'Estate Sage', doorStyle: 'estate', description: 'Sage green estate door' },
];

export const KCC_COLOR_MAP: Record<KccColorLine, string> = {
  SW: 'Shaker White',
  LG: 'Light Gray',
  SN: 'Sand',
  MW: 'Matte White',
  EB: 'Estate Brown',
  EW: 'Estate White',
  ES: 'Estate Sage',
};

// ---- Cabinet Categories ----

export type KccCabinetCategory =
  | 'base_1door'
  | 'base_1door_1drawer'
  | 'base_2door_1drawer'
  | 'base_2door_2drawer'
  | 'drawer_base_2drawer'
  | 'drawer_base_3drawer'
  | 'spice_rack_base'
  | 'waste_bin_base'
  | 'angled_base_end'
  | 'microwave_base'
  | 'easy_reach_base_corner'
  | 'blind_base_corner'
  | 'corner_sink_base'
  | 'sink_base_1fake'
  | 'sink_base_2fake'
  | 'farm_sink_base'
  | 'wall_30h_1door'
  | 'wall_30h_2door'
  | 'wall_36h_1door'
  | 'wall_36h_2door'
  | 'wall_42h_1door'
  | 'wall_42h_2door'
  | 'wall_12h_2door'
  | 'wall_15h_2door'
  | 'wall_18h_1door'
  | 'wall_18h_2door'
  | 'wall_24h_2door'
  | 'wall_12h_24d_2door'
  | 'wall_15h_24d_2door'
  | 'wall_18h_24d_2door'
  | 'wall_24h_24d_2door'
  | 'wall_glass_30h_1routed'
  | 'wall_glass_30h_2routed'
  | 'wall_glass_36h_1routed'
  | 'wall_glass_36h_2routed'
  | 'wall_glass_42h_1routed'
  | 'wall_glass_42h_2routed'
  | 'wall_glass_12h_1routed'
  | 'wall_glass_12h_2routed'
  | 'diagonal_corner_wall'
  | 'diagonal_corner_wall_15d'
  | 'diagonal_corner_wall_glass'
  | 'diagonal_corner_wall_glass_15d'
  | 'wall_blind_corner_30h'
  | 'wall_blind_corner_36h'
  | 'wall_blind_corner_42h'
  | 'wall_easy_reach'
  | 'wall_corner_easy_reach'
  | 'wall_microwave'
  | 'wall_drawer'
  | 'wall_angled'
  | 'wall_open_shelf'
  | 'wine_rack'
  | 'glass_steam_holder'
  | 'utility_2door'
  | 'utility_4door'
  | 'oven_cabinet'
  | 'vanity_sink_base_1fake'
  | 'vanity_sink_base_2fake'
  | 'vanity_drawer_3drawer'
  | 'vanity_combo_1door_2side_1fake'
  | 'vanity_combo_2door_2side_1fake'
  | 'vanity_combo_1door_4side_1fake'
  | 'vanity_combo_2door_4side_1fake'
  | 'vanity_knee_drawer'
  | 'refrigerator_panel'
  | 'dishwasher_panel'
  | 'wall_skin_panel'
  | 'base_skin_panel'
  | 'tall_skin_panel'
  | 'base_decorative_door'
  | 'wall_decorative_door'
  | 'tall_decorative_door'
  | 'crown_molding'
  | 'undercab_molding'
  | 'base_molding'
  | 'molding'
  | 'filler'
  | 'corbel'
  | 'decorative_post'
  | 'valance'
  | 'roll_out_tray'
  | 'touch_up'
  | 'glass_insert'
  | 'glass_shelf'
  | 'trash_bin';

// ---- Spec Dimensions ----

export interface KccCabinetSpec {
  sku: string;
  width: number;
  height: number;
  depth: number;
  doors: number;
  drawers: number;
  shelves: string;
  hingeSpec: string;
  notes: string;
}

// ---- Pricing Helpers ----

/** Calculate dealer cost from MSRP */
export function calcDealerCost(msrp: number): number {
  return Math.round(msrp * KCC_SUPPLIER.multiplier * 100) / 100;
}

/** Get the MSRP for a product in a specific color */
export function getMsrp(
  product: { prices: Record<KccColorLine, number> },
  color: KccColorLine
): number {
  return product.prices[color] ?? 0;
}

/** Get the dealer cost for a product in a specific color */
export function getDealerCost(
  product: { prices: Record<KccColorLine, number> },
  color: KccColorLine
): number {
  return calcDealerCost(getMsrp(product, color));
}
