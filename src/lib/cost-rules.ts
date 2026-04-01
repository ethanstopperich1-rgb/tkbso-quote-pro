// ============================================
// TKB Quote Pro — Cost Rule Engine
// Support materials, consumable kits, and burden rates
// Fed by: past quotes (sell-side), Lowe's/HD receipts (burden), supplier CSVs (direct cost)
// ============================================

// ---- Material Cost Profiles ----
// Each scope type has a default burden rate applied to the trade's base cost

export type CostMethod = 'percent_of_sell' | 'percent_of_cost' | 'fixed_kit' | 'per_sqft' | 'per_fixture';

export interface MaterialCostProfile {
  id: string;
  scopeType: string;
  label: string;
  costMethod: CostMethod;
  defaultValue: number;
  minValue: number;
  maxValue: number;
  notes: string;
  defaultOn: boolean;       // appears automatically when trade is selected
  category: 'kitchen' | 'bathroom' | 'general';
}

// ---- Support Material Burden Rates ----
// These are automatically added to every trade when scope is selected

export const MATERIAL_BURDEN_RATES: MaterialCostProfile[] = [
  // ---- Kitchen ----
  {
    id: 'kitchen_demo_consumables',
    scopeType: 'demo_consumables',
    label: 'Demo Consumables',
    costMethod: 'fixed_kit',
    defaultValue: 150,
    minValue: 100,
    maxValue: 250,
    notes: 'Bags, blades, patch tape, dust barriers, walk paths',
    defaultOn: true,
    category: 'kitchen',
  },
  {
    id: 'kitchen_cabinet_support',
    scopeType: 'cabinet_install_materials',
    label: 'Cabinet Install Materials / Trim / Fillers Misc',
    costMethod: 'percent_of_sell',
    defaultValue: 0.05,    // 5% of cabinet package
    minValue: 0.04,
    maxValue: 0.06,
    notes: 'Shims, screws, wood glue, filler strips, toe kick, rail brackets',
    defaultOn: true,
    category: 'kitchen',
  },
  {
    id: 'kitchen_countertop_support',
    scopeType: 'countertop_support_materials',
    label: 'Countertop Support / Sink Parts / Adhesive / Misc',
    costMethod: 'percent_of_sell',
    defaultValue: 0.03,    // 3% of countertop package
    minValue: 0.02,
    maxValue: 0.04,
    notes: 'Adhesive, clips, sink basket strainer, drain kit, plumbers putty',
    defaultOn: true,
    category: 'kitchen',
  },
  {
    id: 'kitchen_backsplash_support',
    scopeType: 'backsplash_support_materials',
    label: 'Backsplash Support Materials',
    costMethod: 'percent_of_sell',
    defaultValue: 0.12,    // 12% of backsplash sell
    minValue: 0.10,
    maxValue: 0.15,
    notes: 'Thinset, grout, schluter trim, sealant, spacers, backer rod',
    defaultOn: true,
    category: 'kitchen',
  },
  {
    id: 'kitchen_flooring_support',
    scopeType: 'flooring_support_materials',
    label: 'Flooring Support Materials',
    costMethod: 'percent_of_sell',
    defaultValue: 0.10,    // 10% of flooring material+labor base
    minValue: 0.08,
    maxValue: 0.12,
    notes: 'Underlayment, transitions, quarter-round, adhesive, spacers',
    defaultOn: true,
    category: 'kitchen',
  },
  {
    id: 'kitchen_plumbing_misc',
    scopeType: 'plumbing_misc_connections',
    label: 'Plumbing Misc Connections',
    costMethod: 'fixed_kit',
    defaultValue: 225,
    minValue: 150,
    maxValue: 300,
    notes: 'Supply lines, shut-offs, drain fittings, Teflon, pipe clamps',
    defaultOn: true,
    category: 'kitchen',
  },
  {
    id: 'kitchen_electrical_misc',
    scopeType: 'electrical_misc_materials',
    label: 'Electrical Misc Materials',
    costMethod: 'fixed_kit',
    defaultValue: 175,
    minValue: 100,
    maxValue: 250,
    notes: 'Boxes, wire, wire nuts, plates, romex clamps, ground screws',
    defaultOn: true,
    category: 'kitchen',
  },

  // ---- Bathroom ----
  {
    id: 'bath_shower_waterproofing_kit',
    scopeType: 'shower_waterproofing_trim_setting',
    label: 'Shower Waterproofing / Trim / Setting Materials',
    costMethod: 'percent_of_sell',
    defaultValue: 0.15,    // 15% of shower tile + pan scope
    minValue: 0.10,
    maxValue: 0.20,
    notes: 'Schluter Kerdi membrane, corners, bands, drain flange, thinset, grout, sealer, cement board screws',
    defaultOn: true,
    category: 'bathroom',
  },
  {
    id: 'bath_vanity_install_misc',
    scopeType: 'vanity_install_misc',
    label: 'Vanity Install Misc',
    costMethod: 'percent_of_sell',
    defaultValue: 0.05,    // 5% of vanity package
    minValue: 0.03,
    maxValue: 0.07,
    notes: 'Shims, screws, caulk, mounting hardware, supply lines',
    defaultOn: true,
    category: 'bathroom',
  },
  {
    id: 'bath_plumbing_trimout_misc',
    scopeType: 'plumbing_trimout_misc',
    label: 'Plumbing Trim-Out Misc',
    costMethod: 'fixed_kit',
    defaultValue: 250,
    minValue: 150,
    maxValue: 350,
    notes: 'Supply lines, shut-offs, wax ring, toilet bolts, braided lines, drain fittings',
    defaultOn: true,
    category: 'bathroom',
  },
  {
    id: 'bath_accessories_burden',
    scopeType: 'bath_accessories_package',
    label: 'Bath Accessories Package Burden',
    costMethod: 'percent_of_sell',
    defaultValue: 0.08,    // 8%
    minValue: 0.05,
    maxValue: 0.10,
    notes: 'Grab bars, towel bars, TP holder, hooks, mounting hardware, anchors',
    defaultOn: true,
    category: 'bathroom',
  },
  {
    id: 'bath_lighting_electrical_misc',
    scopeType: 'lighting_electrical_misc',
    label: 'Lighting / Electrical Misc',
    costMethod: 'percent_of_sell',
    defaultValue: 0.08,    // 8%
    minValue: 0.05,
    maxValue: 0.10,
    notes: 'Wire, boxes, romex, LED drivers, switch plates, GFCI outlets',
    defaultOn: true,
    category: 'bathroom',
  },
  {
    id: 'bath_drywall_patch',
    scopeType: 'drywall_patch_materials',
    label: 'Drywall Patch Materials',
    costMethod: 'fixed_kit',
    defaultValue: 275,
    minValue: 150,
    maxValue: 400,
    notes: 'Drywall sheets, mud, tape, texture, sandpaper, mesh patches',
    defaultOn: true,
    category: 'bathroom',
  },
  {
    id: 'bath_demo_consumables',
    scopeType: 'demo_consumables',
    label: 'Demo Consumables',
    costMethod: 'fixed_kit',
    defaultValue: 150,
    minValue: 100,
    maxValue: 200,
    notes: 'Contractor bags, blades, dust barriers, walk paths, tape',
    defaultOn: true,
    category: 'bathroom',
  },
  {
    id: 'bath_floor_tile_support',
    scopeType: 'floor_tile_support_materials',
    label: 'Floor Tile Support Materials',
    costMethod: 'percent_of_sell',
    defaultValue: 0.12,    // 12% of floor tile sell
    minValue: 0.10,
    maxValue: 0.15,
    notes: 'Thinset, grout, sealer, schluter trim, threshold, transition strips',
    defaultOn: true,
    category: 'bathroom',
  },

  // ---- General (applies to both) ----
  {
    id: 'general_paint_materials',
    scopeType: 'paint_materials',
    label: 'Paint & Prep Materials',
    costMethod: 'fixed_kit',
    defaultValue: 200,
    minValue: 100,
    maxValue: 400,
    notes: 'Paint, primer, rollers, brushes, tape, drop cloths, caulk',
    defaultOn: true,
    category: 'general',
  },
  {
    id: 'general_contingency',
    scopeType: 'project_contingency',
    label: 'Project Contingency (10%)',
    costMethod: 'percent_of_cost',
    defaultValue: 0.10,    // 10% of total IC
    minValue: 0.05,
    maxValue: 0.15,
    notes: 'Unexpected conditions, material overruns, change orders',
    defaultOn: false,       // NOT on by default — enable per project
    category: 'general',
  },
];

// ---- Project Consumable Kits ----
// Fixed material bundles that cover the "noise" purchases

export interface ConsumableKit {
  id: string;
  projectType: 'kitchen' | 'primary_bath' | 'guest_bath' | 'tile_shower' | 'drywall' | 'general';
  label: string;
  defaultCost: number;
  minCost: number;
  maxCost: number;
  includes: string[];
}

export const CONSUMABLE_KITS: ConsumableKit[] = [
  {
    id: 'kit_kitchen',
    projectType: 'kitchen',
    label: 'Kitchen Remodel Consumables Kit',
    defaultCost: 350,
    minCost: 250,
    maxCost: 450,
    includes: [
      'Contractor bags & debris removal supplies',
      'Caulk, adhesive, sealant',
      'Shims, screws, mounting hardware',
      'Protection materials (walk paths, dust barriers)',
      'Touch-up paint & repair supplies',
    ],
  },
  {
    id: 'kit_primary_bath',
    projectType: 'primary_bath',
    label: 'Primary Bath Consumables Kit',
    defaultCost: 500,
    minCost: 350,
    maxCost: 650,
    includes: [
      'Contractor bags & debris removal supplies',
      'Caulk, silicone, sealant',
      'Cement board screws & backer supplies',
      'Protection materials (walk paths, dust barriers, AC vent covers)',
      'Touch-up paint & drywall repair supplies',
      'Plumber\'s putty, Teflon tape, supply line fittings',
    ],
  },
  {
    id: 'kit_guest_bath',
    projectType: 'guest_bath',
    label: 'Guest Bath Consumables Kit',
    defaultCost: 300,
    minCost: 200,
    maxCost: 400,
    includes: [
      'Contractor bags & debris removal supplies',
      'Caulk, silicone, sealant',
      'Protection materials',
      'Touch-up paint supplies',
      'Basic plumbing fittings',
    ],
  },
  {
    id: 'kit_tile_shower',
    projectType: 'tile_shower',
    label: 'Tile Shower Waterproofing / Trim / Setting Kit',
    defaultCost: 850,
    minCost: 500,
    maxCost: 1200,
    includes: [
      'Schluter Kerdi membrane + corners + bands',
      'Drain flange with 2" outlet + stainless steel grate',
      'Pipe & mixing valve seals',
      'Cement board (sheets + screws)',
      'Thinset (modified + unmodified)',
      'Grout + sealer',
      'Schluter trim profiles',
      'Waterproofing tape & corner pieces',
    ],
  },
  {
    id: 'kit_drywall',
    projectType: 'drywall',
    label: 'Drywall Patch & Finish Kit',
    defaultCost: 325,
    minCost: 150,
    maxCost: 500,
    includes: [
      'Drywall sheets (various sizes)',
      'Joint compound (premixed)',
      'Paper tape + mesh tape',
      'Sandpaper (various grits)',
      'Corner bead',
      'Texture spray',
      'Primer',
    ],
  },
];

// ---- Allowance vs Actual Tracking ----
// Each category in a quote should track these for training the estimator over time

export interface AllowanceTracking {
  category: string;
  allowanceSellPrice: number;    // what we quoted the customer
  estimatedCost: number;         // what we expected to pay
  actualReceiptCost: number;     // what we actually paid (from receipts)
  variance: number;              // actual - estimated (positive = over, negative = under)
  variancePercent: number;       // variance / estimated
}

// ---- Default Accessory Items (always-on for bathroom quotes) ----
// These should appear by default and not be forgotten

export interface DefaultAccessory {
  id: string;
  name: string;
  defaultAllowance: number;
  category: 'bathroom' | 'kitchen';
  alwaysInclude: boolean;
}

export const DEFAULT_ACCESSORIES: DefaultAccessory[] = [
  { id: 'acc_toilet_paper_holder', name: 'Toilet Paper Holder', defaultAllowance: 15, category: 'bathroom', alwaysInclude: true },
  { id: 'acc_towel_ring', name: 'Towel Ring', defaultAllowance: 25, category: 'bathroom', alwaysInclude: true },
  { id: 'acc_towel_bar', name: 'Towel Bar (24")', defaultAllowance: 40, category: 'bathroom', alwaysInclude: true },
  { id: 'acc_robe_hook', name: 'Robe Hook', defaultAllowance: 15, category: 'bathroom', alwaysInclude: false },
  { id: 'acc_grab_bar', name: 'Grab Bar', defaultAllowance: 45, category: 'bathroom', alwaysInclude: false },
  { id: 'acc_shower_drain_cover', name: 'Shower Drain Cover', defaultAllowance: 20, category: 'bathroom', alwaysInclude: true },
  { id: 'acc_door_trim', name: 'Door Trim & Baseboards', defaultAllowance: 360, category: 'bathroom', alwaysInclude: true },
  { id: 'acc_cabinet_pulls', name: 'Cabinet Pulls (per pull)', defaultAllowance: 4, category: 'bathroom', alwaysInclude: true },
  { id: 'acc_light_switch_plates', name: 'Switch & Outlet Plates', defaultAllowance: 30, category: 'bathroom', alwaysInclude: true },
];

// ============================================
// CALCULATION ENGINE — Apply burden to trades
// ============================================

export interface BurdenLine {
  id: string;
  label: string;
  scopeType: string;
  costMethod: CostMethod;
  baseAmount: number;        // the trade CP or IC this burden is calculated from
  burdenRate: number;        // the percentage or fixed amount
  burdenCost: number;        // calculated burden in dollars
  editable: boolean;
  visible: boolean;          // show in expanded view
}

/**
 * Calculate burden costs for a project based on trade totals.
 * Returns an array of burden lines that should be added to the internal cost.
 */
export function calculateBurden(
  projectType: 'kitchen' | 'bathroom',
  tradeTotals: Record<string, { ic: number; cp: number }>,
): BurdenLine[] {
  const lines: BurdenLine[] = [];
  const applicableProfiles = MATERIAL_BURDEN_RATES.filter(
    p => p.defaultOn && (p.category === projectType || p.category === 'general')
  );

  for (const profile of applicableProfiles) {
    let baseAmount = 0;
    let burdenCost = 0;

    // Map scope type to the right trade total
    const tradeMap: Record<string, string> = {
      // Kitchen
      'demo_consumables': 'demo',
      'cabinet_install_materials': 'cabinets',
      'countertop_support_materials': 'countertop',
      'backsplash_support_materials': 'backsplash',
      'flooring_support_materials': 'flooring',
      'plumbing_misc_connections': 'plumbing',
      'electrical_misc_materials': 'electrical',
      // Bathroom
      'shower_waterproofing_trim_setting': 'tile',
      'vanity_install_misc': 'vanity',
      'plumbing_trimout_misc': 'plumbing',
      'bath_accessories_package': 'accessories',
      'lighting_electrical_misc': 'electrical',
      'drywall_patch_materials': 'drywall',
      'floor_tile_support_materials': 'tile_floor',
      // General
      'paint_materials': 'paint',
      'project_contingency': '__total__',
    };

    const tradeKey = tradeMap[profile.scopeType] ?? '';
    const trade = tradeTotals[tradeKey];

    switch (profile.costMethod) {
      case 'percent_of_sell':
        baseAmount = trade?.cp ?? 0;
        burdenCost = Math.round(baseAmount * profile.defaultValue);
        break;
      case 'percent_of_cost':
        if (tradeKey === '__total__') {
          baseAmount = Object.values(tradeTotals).reduce((s, t) => s + t.ic, 0);
        } else {
          baseAmount = trade?.ic ?? 0;
        }
        burdenCost = Math.round(baseAmount * profile.defaultValue);
        break;
      case 'fixed_kit':
        baseAmount = 0;
        burdenCost = profile.defaultValue;
        break;
      case 'per_sqft':
      case 'per_fixture':
        baseAmount = trade?.cp ?? 0;
        burdenCost = Math.round(baseAmount * profile.defaultValue);
        break;
    }

    if (burdenCost > 0 || profile.costMethod === 'fixed_kit') {
      lines.push({
        id: profile.id,
        label: profile.label,
        scopeType: profile.scopeType,
        costMethod: profile.costMethod,
        baseAmount,
        burdenRate: profile.defaultValue,
        burdenCost,
        editable: true,
        visible: false,  // collapsed by default — rep can expand
      });
    }
  }

  return lines;
}

/**
 * Get the appropriate consumable kit for a project type.
 */
export function getConsumableKit(
  roomType: string,
): ConsumableKit | undefined {
  const lower = roomType.toLowerCase();
  if (lower.includes('kitchen')) return CONSUMABLE_KITS.find(k => k.projectType === 'kitchen');
  if (lower.includes('primary') || lower.includes('master')) return CONSUMABLE_KITS.find(k => k.projectType === 'primary_bath');
  if (lower.includes('guest') || lower.includes('hall')) return CONSUMABLE_KITS.find(k => k.projectType === 'guest_bath');
  return CONSUMABLE_KITS.find(k => k.projectType === 'guest_bath'); // fallback
}

/**
 * Get total burden cost for a project.
 */
export function getTotalBurden(burdenLines: BurdenLine[]): number {
  return burdenLines.reduce((sum, line) => sum + line.burdenCost, 0);
}
