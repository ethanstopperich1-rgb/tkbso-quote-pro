/**
 * Layer 1: Project Type Defaults
 * Loads baseline scope with typical line items and allowances when user selects project type.
 * This is the starting point, not the final answer.
 */

export interface TypicalItem {
  key: string;
  name: string;
  defaultAllowance?: number;
  defaultAllowancePerUnit?: number;
  unit?: string;
  defaultType?: string;
  defaultQuantity?: number;
}

export interface LaborRate {
  key: string;
  name: string;
  icPerUnit: number;
  cpPerUnit: number;
  unit: string;
}

export interface TradeDefault {
  tradeId: string;
  tradeName: string;
  tradeOrder: number;
  typicalItems: TypicalItem[];
  laborRates: LaborRate[];
}

export interface ProjectDefaults {
  projectType: 'bathroom' | 'kitchen';
  typicalTrades: string[];
  trades: TradeDefault[];
  defaultMarkup: number;
}

// ============ BATHROOM REMODEL DEFAULTS ============
export const BATHROOM_DEFAULTS: ProjectDefaults = {
  projectType: 'bathroom',
  typicalTrades: ['demo', 'plumbing', 'electrical', 'drywall', 'tile', 'cabinet', 'paint', 'glass'],
  defaultMarkup: 1.4,
  trades: [
    {
      tradeId: 'demo',
      tradeName: 'DEMOLITION',
      tradeOrder: 1,
      typicalItems: [
        { key: 'demo_full', name: 'Full Bathroom Demo', defaultAllowance: 1800 },
        { key: 'dumpster', name: 'Dumpster & Haul', defaultAllowance: 400 },
      ],
      laborRates: [
        { key: 'demo_small_bath', name: 'Demo - Small Bath (<50 sqft)', icPerUnit: 1300, cpPerUnit: 2050, unit: 'ea' },
        { key: 'demo_large_bath', name: 'Demo - Large Bath (50+ sqft)', icPerUnit: 1650, cpPerUnit: 2500, unit: 'ea' },
        { key: 'demo_shower_only', name: 'Demo - Shower Only', icPerUnit: 900, cpPerUnit: 1450, unit: 'ea' },
      ],
    },
    {
      tradeId: 'plumbing',
      tradeName: 'PLUMBING',
      tradeOrder: 2,
      typicalItems: [
        { key: 'toilet', name: 'Toilet', defaultAllowance: 350, defaultType: 'chair height' },
        { key: 'shower_trim', name: 'Shower Trim Kit', defaultAllowance: 350, defaultType: 'with diverter for handheld' },
        { key: 'vanity_faucet', name: 'Vanity Faucet', defaultAllowance: 125 },
        { key: 'plumbing_fixtures', name: 'Plumbing Fixture Package', defaultAllowance: 1350 },
      ],
      laborRates: [
        { key: 'plumbing_shower_standard', name: 'Standard Shower Rough-in', icPerUnit: 2225, cpPerUnit: 3425, unit: 'ea' },
        { key: 'plumbing_extra_head', name: 'Extra Shower Head/Diverter', icPerUnit: 625, cpPerUnit: 1100, unit: 'ea' },
        { key: 'plumbing_toilet', name: 'Toilet Swap', icPerUnit: 350, cpPerUnit: 690, unit: 'ea' },
        { key: 'plumbing_tub_to_shower', name: 'Tub to Shower Conversion', icPerUnit: 2550, cpPerUnit: 4200, unit: 'ea' },
        { key: 'plumbing_freestanding_tub', name: 'Freestanding Tub Install', icPerUnit: 3300, cpPerUnit: 4800, unit: 'ea' },
        { key: 'plumbing_linear_drain', name: 'Linear Drain', icPerUnit: 750, cpPerUnit: 1550, unit: 'ea' },
      ],
    },
    {
      tradeId: 'electrical',
      tradeName: 'ELECTRICAL',
      tradeOrder: 3,
      typicalItems: [
        { key: 'vanity_light', name: 'Vanity Light Fixture', defaultAllowance: 125, defaultQuantity: 1 },
        { key: 'led_mirror', name: 'LED Mirror', defaultAllowance: 250 },
        { key: 'exhaust_fan', name: 'Exhaust Fan', defaultAllowance: 150 },
      ],
      laborRates: [
        { key: 'recessed_can', name: 'Recessed Can Light', icPerUnit: 65, cpPerUnit: 110, unit: 'ea' },
        { key: 'vanity_light_install', name: 'Vanity Light Install', icPerUnit: 200, cpPerUnit: 350, unit: 'ea' },
        { key: 'led_mirror_wiring', name: 'LED Mirror Wiring', icPerUnit: 150, cpPerUnit: 275, unit: 'ea' },
        { key: 'exhaust_fan_install', name: 'Exhaust Fan Install', icPerUnit: 175, cpPerUnit: 300, unit: 'ea' },
        { key: 'electrical_small_package', name: 'Small Electrical Package', icPerUnit: 250, cpPerUnit: 400, unit: 'ea' },
      ],
    },
    {
      tradeId: 'drywall',
      tradeName: 'DRYWALL & FRAMING',
      tradeOrder: 4,
      typicalItems: [],
      laborRates: [
        { key: 'framing_standard', name: 'Standard Framing/Blocking', icPerUnit: 550, cpPerUnit: 1200, unit: 'ea' },
        { key: 'framing_niche', name: 'Shower Niche Framing', icPerUnit: 300, cpPerUnit: 550, unit: 'ea' },
        { key: 'framing_pony_wall', name: 'Pony Wall', icPerUnit: 450, cpPerUnit: 850, unit: 'ea' },
        { key: 'drywall_patch', name: 'Drywall Patch & Repair', icPerUnit: 800, cpPerUnit: 1300, unit: 'ea' },
        { key: 'pocket_door', name: 'Pocket Door Framing', icPerUnit: 850, cpPerUnit: 1400, unit: 'ea' },
      ],
    },
    {
      tradeId: 'tile',
      tradeName: 'TILE WORK',
      tradeOrder: 5,
      typicalItems: [
        { key: 'tile_wall', name: 'Wall Tile Material', defaultAllowancePerUnit: 6.50, unit: 'sqft' },
        { key: 'tile_floor', name: 'Floor Tile Material', defaultAllowancePerUnit: 6.50, unit: 'sqft' },
        { key: 'tile_mosaic', name: 'Mosaic Tile (Shower Floor)', defaultAllowancePerUnit: 15, unit: 'sqft' },
      ],
      laborRates: [
        { key: 'tile_wall', name: 'Wall Tile Installation', icPerUnit: 20, cpPerUnit: 39, unit: 'sqft' },
        { key: 'tile_main_floor', name: 'Floor Tile Installation', icPerUnit: 5.5, cpPerUnit: 12, unit: 'sqft' },
        { key: 'tile_shower_floor', name: 'Shower Floor Tile', icPerUnit: 6, cpPerUnit: 14, unit: 'sqft' },
        { key: 'waterproofing', name: 'Waterproofing', icPerUnit: 6, cpPerUnit: 13, unit: 'sqft' },
        { key: 'cement_board', name: 'Cement Board', icPerUnit: 3, cpPerUnit: 5, unit: 'sqft' },
        { key: 'floor_leveling', name: 'Floor Leveling', icPerUnit: 500, cpPerUnit: 850, unit: 'ea' },
      ],
    },
    {
      tradeId: 'cabinet',
      tradeName: 'CABINET & COUNTERTOP',
      tradeOrder: 6,
      typicalItems: [
        { key: 'quartz_countertop', name: 'Quartz Countertop', defaultAllowance: 1000, defaultType: 'Level 1 3CM' },
        { key: 'cabinet_hardware', name: 'Cabinet Hardware', defaultAllowancePerUnit: 7, unit: 'pull' },
      ],
      laborRates: [
        { key: 'vanity_30', name: '30" Vanity Bundle', icPerUnit: 1100, cpPerUnit: 1800, unit: 'ea' },
        { key: 'vanity_36', name: '36" Vanity Bundle', icPerUnit: 1300, cpPerUnit: 2100, unit: 'ea' },
        { key: 'vanity_48', name: '48" Vanity Bundle', icPerUnit: 1600, cpPerUnit: 2600, unit: 'ea' },
        { key: 'vanity_54', name: '54" Vanity Bundle', icPerUnit: 1900, cpPerUnit: 3000, unit: 'ea' },
        { key: 'vanity_60', name: '60" Double Vanity Bundle', icPerUnit: 2200, cpPerUnit: 3500, unit: 'ea' },
        { key: 'vanity_72', name: '72" Double Vanity Bundle', icPerUnit: 2600, cpPerUnit: 4200, unit: 'ea' },
        { key: 'vanity_84', name: '84" Double Vanity Bundle', icPerUnit: 3200, cpPerUnit: 5000, unit: 'ea' },
        { key: 'quartz_countertop', name: 'Quartz Countertop', icPerUnit: 15, cpPerUnit: 50, unit: 'sqft' },
      ],
    },
    {
      tradeId: 'paint',
      tradeName: 'PAINTING & FINAL TRIMOUT',
      tradeOrder: 7,
      typicalItems: [
        { key: 'towel_bar', name: 'Towel Bar', defaultAllowance: 40 },
        { key: 'towel_ring', name: 'Towel Ring', defaultAllowance: 20 },
        { key: 'tp_holder', name: 'TP Holder', defaultAllowance: 12 },
        { key: 'robe_hook', name: 'Robe Hook', defaultAllowance: 15 },
      ],
      laborRates: [
        { key: 'paint_patch_bath', name: 'Patch & Touch-up Paint', icPerUnit: 800, cpPerUnit: 1300, unit: 'ea' },
        { key: 'paint_full_bath', name: 'Full Bathroom Paint', icPerUnit: 1200, cpPerUnit: 1900, unit: 'ea' },
        { key: 'baseboard_install', name: 'Baseboard Installation', icPerUnit: 2.20, cpPerUnit: 4, unit: 'lf' },
        { key: 'accessory_package', name: 'Accessories Package', icPerUnit: 150, cpPerUnit: 275, unit: 'ea' },
      ],
    },
    {
      tradeId: 'glass',
      tradeName: 'GLASS',
      tradeOrder: 8,
      typicalItems: [],
      laborRates: [
        { key: 'glass_standard', name: 'Standard Glass Door + Panel', icPerUnit: 1200, cpPerUnit: 2100, unit: 'ea' },
        { key: 'glass_panel_only', name: 'Glass Panel Only', icPerUnit: 800, cpPerUnit: 1450, unit: 'ea' },
        { key: 'glass_90_return', name: '90° Glass Return', icPerUnit: 1425, cpPerUnit: 2775, unit: 'ea' },
      ],
    },
  ],
};

// ============ KITCHEN REMODEL DEFAULTS ============
export const KITCHEN_DEFAULTS: ProjectDefaults = {
  projectType: 'kitchen',
  typicalTrades: ['demo', 'plumbing', 'electrical', 'drywall', 'cabinetry', 'countertops', 'backsplash', 'paint', 'appliances', 'final_trimout'],
  defaultMarkup: 1.4,
  trades: [
    {
      tradeId: 'demo',
      tradeName: 'DEMOLITION',
      tradeOrder: 1,
      typicalItems: [
        { key: 'demo_kitchen', name: 'Full Kitchen Demo', defaultAllowance: 1750 },
        { key: 'dumpster', name: 'Dumpster & Haul', defaultAllowance: 825 },
      ],
      laborRates: [
        { key: 'demo_kitchen', name: 'Kitchen Demo', icPerUnit: 1750, cpPerUnit: 2800, unit: 'ea' },
        { key: 'soffit_removal', name: 'Soffit Removal', icPerUnit: 950, cpPerUnit: 1500, unit: 'ea' },
        { key: 'dumpster_kitchen', name: 'Dumpster & Haul', icPerUnit: 825, cpPerUnit: 1400, unit: 'ea' },
      ],
    },
    {
      tradeId: 'plumbing',
      tradeName: 'PLUMBING',
      tradeOrder: 2,
      typicalItems: [
        { key: 'kitchen_sink', name: 'Kitchen Sink', defaultAllowance: 350, defaultType: 'undermount stainless' },
        { key: 'kitchen_faucet', name: 'Kitchen Faucet', defaultAllowance: 275, defaultType: 'pull-down sprayer' },
        { key: 'garbage_disposal', name: 'Garbage Disposal', defaultAllowance: 200 },
      ],
      laborRates: [
        { key: 'sink_faucet_install', name: 'Sink & Faucet Install', icPerUnit: 250, cpPerUnit: 450, unit: 'ea' },
        { key: 'garbage_disposal_install', name: 'Disposal Install', icPerUnit: 125, cpPerUnit: 225, unit: 'ea' },
        { key: 'dishwasher_reconnect', name: 'Dishwasher Reconnect', icPerUnit: 150, cpPerUnit: 275, unit: 'ea' },
        { key: 'fridge_waterline', name: 'Fridge Waterline Reconnect', icPerUnit: 100, cpPerUnit: 175, unit: 'ea' },
        { key: 'shutoff_valves', name: 'Shut-off Valves', icPerUnit: 80, cpPerUnit: 140, unit: 'ea' },
      ],
    },
    {
      tradeId: 'electrical',
      tradeName: 'ELECTRICAL',
      tradeOrder: 3,
      typicalItems: [],
      laborRates: [
        { key: 'under_cabinet_lighting', name: 'Under-Cabinet Lighting Package', icPerUnit: 650, cpPerUnit: 1100, unit: 'lot' },
        { key: 'recessed_can', name: 'Recessed Can Light', icPerUnit: 65, cpPerUnit: 110, unit: 'ea' },
        { key: 'pendant_roughin', name: 'Pendant Rough-in', icPerUnit: 100, cpPerUnit: 175, unit: 'ea' },
        { key: 'range_hood_wiring', name: 'Range Hood Wiring', icPerUnit: 175, cpPerUnit: 300, unit: 'ea' },
        { key: 'outlets_switches', name: 'Outlets & Switches Replace', icPerUnit: 350, cpPerUnit: 600, unit: 'lot' },
        { key: 'microwave_circuit', name: 'Microwave Dedicated Circuit', icPerUnit: 275, cpPerUnit: 475, unit: 'ea' },
        { key: 'electrical_kitchen_package', name: 'Kitchen Electrical Package', icPerUnit: 950, cpPerUnit: 1750, unit: 'ea' },
      ],
    },
    {
      tradeId: 'drywall',
      tradeName: 'DRYWALL & FRAMING',
      tradeOrder: 4,
      typicalItems: [],
      laborRates: [
        { key: 'drywall_patch', name: 'Drywall Patch & Repair', icPerUnit: 450, cpPerUnit: 750, unit: 'ea' },
        { key: 'blocking_cabinets', name: 'Blocking for Upper Cabinets', icPerUnit: 200, cpPerUnit: 350, unit: 'ea' },
      ],
    },
    {
      tradeId: 'cabinetry',
      tradeName: 'CABINETRY',
      tradeOrder: 5,
      typicalItems: [
        { key: 'upper_cabinets', name: 'Upper Cabinets', defaultAllowancePerUnit: 175, unit: 'lf' },
        { key: 'base_cabinets', name: 'Base Cabinets', defaultAllowancePerUnit: 200, unit: 'lf' },
        { key: 'island_cabinet', name: 'Island Cabinet', defaultAllowance: 1200 },
        { key: 'pantry_cabinet', name: 'Pantry Cabinet', defaultAllowance: 800 },
        { key: 'cabinet_hardware', name: 'Cabinet Hardware', defaultAllowancePerUnit: 8, unit: 'piece' },
      ],
      laborRates: [
        { key: 'upper_cabinet_install', name: 'Upper Cabinet Install', icPerUnit: 45, cpPerUnit: 80, unit: 'lf' },
        { key: 'base_cabinet_install', name: 'Base Cabinet Install', icPerUnit: 50, cpPerUnit: 90, unit: 'lf' },
        { key: 'island_install', name: 'Island Cabinet Install', icPerUnit: 300, cpPerUnit: 525, unit: 'ea' },
        { key: 'pantry_install', name: 'Pantry Cabinet Install', icPerUnit: 200, cpPerUnit: 350, unit: 'ea' },
        { key: 'crown_molding', name: 'Crown Molding on Cabinets', icPerUnit: 18, cpPerUnit: 32, unit: 'lf' },
        { key: 'hardware_install', name: 'Hardware Install', icPerUnit: 5, cpPerUnit: 9, unit: 'ea' },
      ],
    },
    {
      tradeId: 'countertops',
      tradeName: 'COUNTERTOPS',
      tradeOrder: 6,
      typicalItems: [
        { key: 'quartz_countertop', name: 'Quartz Countertop', defaultAllowancePerUnit: 55, unit: 'sqft', defaultType: 'Level 1 3CM' },
      ],
      laborRates: [
        { key: 'quartz_template_fabricate', name: 'Quartz Template & Fabricate', icPerUnit: 55, cpPerUnit: 95, unit: 'sqft' },
        { key: 'sink_cutout', name: 'Sink Cutout', icPerUnit: 175, cpPerUnit: 300, unit: 'ea' },
        { key: 'cooktop_cutout', name: 'Cooktop Cutout', icPerUnit: 150, cpPerUnit: 260, unit: 'ea' },
      ],
    },
    {
      tradeId: 'backsplash',
      tradeName: 'BACKSPLASH',
      tradeOrder: 7,
      typicalItems: [
        { key: 'backsplash_tile', name: 'Backsplash Tile', defaultAllowancePerUnit: 12, unit: 'sqft' },
      ],
      laborRates: [
        { key: 'backsplash_install', name: 'Backsplash Tile Install', icPerUnit: 18, cpPerUnit: 32, unit: 'sqft' },
      ],
    },
    {
      tradeId: 'paint',
      tradeName: 'PAINTING',
      tradeOrder: 8,
      typicalItems: [],
      laborRates: [
        { key: 'paint_kitchen', name: 'Paint Kitchen Walls & Ceiling', icPerUnit: 3, cpPerUnit: 5.25, unit: 'sqft' },
        { key: 'paint_trim', name: 'Paint Trim & Door Frames', icPerUnit: 350, cpPerUnit: 610, unit: 'lot' },
      ],
    },
    {
      tradeId: 'appliances',
      tradeName: 'APPLIANCE INSTALLATION',
      tradeOrder: 9,
      typicalItems: [],
      laborRates: [
        { key: 'range_install', name: 'Range/Oven Install', icPerUnit: 175, cpPerUnit: 300, unit: 'ea' },
        { key: 'range_hood_install', name: 'Range Hood Install', icPerUnit: 225, cpPerUnit: 390, unit: 'ea' },
        { key: 'dishwasher_install', name: 'Dishwasher Install', icPerUnit: 150, cpPerUnit: 260, unit: 'ea' },
        { key: 'microwave_install', name: 'Microwave Install', icPerUnit: 125, cpPerUnit: 215, unit: 'ea' },
      ],
    },
    {
      tradeId: 'final_trimout',
      tradeName: 'FINAL TRIMOUT',
      tradeOrder: 10,
      typicalItems: [],
      laborRates: [
        { key: 'baseboard_install', name: 'Baseboard Install', icPerUnit: 3.75, cpPerUnit: 6.50, unit: 'lf' },
        { key: 'toe_kick', name: 'Toe Kick Install', icPerUnit: 150, cpPerUnit: 260, unit: 'lot' },
        { key: 'caulking', name: 'Caulking & Sealing', icPerUnit: 75, cpPerUnit: 130, unit: 'lot' },
        { key: 'final_clean', name: 'Final Clean', icPerUnit: 200, cpPerUnit: 350, unit: 'ea' },
      ],
    },
  ],
};

// Helper function to get defaults by project type
export function getProjectDefaults(projectType: 'bathroom' | 'kitchen'): ProjectDefaults {
  return projectType === 'kitchen' ? KITCHEN_DEFAULTS : BATHROOM_DEFAULTS;
}

// Helper to find a labor rate by key across all trades
export function findLaborRate(defaults: ProjectDefaults, key: string): LaborRate | undefined {
  for (const trade of defaults.trades) {
    const rate = trade.laborRates.find(r => r.key === key);
    if (rate) return rate;
  }
  return undefined;
}

// Helper to find a typical item by key across all trades
export function findTypicalItem(defaults: ProjectDefaults, key: string): TypicalItem | undefined {
  for (const trade of defaults.trades) {
    const item = trade.typicalItems.find(i => i.key === key);
    if (item) return item;
  }
  return undefined;
}

// Get all labor rates for a trade
export function getTradeLabor(defaults: ProjectDefaults, tradeId: string): LaborRate[] {
  const trade = defaults.trades.find(t => t.tradeId === tradeId);
  return trade?.laborRates || [];
}

// Get all typical items for a trade
export function getTradeItems(defaults: ProjectDefaults, tradeId: string): TypicalItem[] {
  const trade = defaults.trades.find(t => t.tradeId === tradeId);
  return trade?.typicalItems || [];
}
