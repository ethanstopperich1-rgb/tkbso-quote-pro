// ─────────────────────────────────────────────────────────────
// TKBSO Quote Pro — Chat Flow Engine v2
// Real TKBSO pricing, trade-by-trade IC/CP breakdowns
// Drives the conversational estimator step by step
// ─────────────────────────────────────────────────────────────

import { TKBSO_DEFAULT_PRICING, type TKBSOPricingConfig } from './tkbso-pricing';
import { calculateBurden, getConsumableKit, getTotalBurden, type BurdenLine } from './cost-rules';

// ── Shared Types ──────────────────────────────────────────────

export type MessageRole = 'assistant' | 'user';
export type ChipStyle = 'default' | 'price' | 'warning';

export interface QuickReply {
  label: string;
  value: string;
  style?: ChipStyle;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  quickReplies?: QuickReply[];
  isTyping?: boolean;
}

// ── Flow Steps ────────────────────────────────────────────────

export type FlowStep =
  // Customer info
  | 'customer_name'
  | 'customer_address'
  | 'customer_phone'
  | 'customer_email'
  // Room selection
  | 'room_type'
  | 'room_dimensions'
  // Bathroom flow
  | 'bath_demo'
  | 'bath_shower_type'
  | 'bath_tile_wall_sqft'
  | 'bath_tile_floor_sqft'
  | 'bath_vanity_size'
  | 'bath_countertop'
  | 'bath_glass'
  | 'bath_extras'
  | 'bath_plumbing_extras'
  // Kitchen flow
  | 'kitchen_demo'
  | 'kitchen_cabinets'
  | 'kitchen_cabinet_color'
  | 'kitchen_cabinet_count'
  | 'kitchen_cabinet_addons'
  | 'kitchen_countertop'
  | 'kitchen_countertop_sqft'
  | 'kitchen_backsplash'
  | 'kitchen_flooring'
  | 'kitchen_flooring_sqft'
  | 'kitchen_extras'
  // Shared closing
  | 'pricing_tier'
  | 'total_price'
  | 'payment_schedule'
  | 'confirm'
  | 'done';

// ── Multi-select Steps ────────────────────────────────────────
// Steps that use multi-select chip behavior (toggle + continue)

export const MULTI_SELECT_STEPS: FlowStep[] = [
  'bath_extras',
  'bath_plumbing_extras',
  'kitchen_cabinet_addons',
  'kitchen_extras',
];

export function isMultiSelectStep(step: FlowStep): boolean {
  return MULTI_SELECT_STEPS.includes(step);
}

// ── Estimate State ────────────────────────────────────────────

export interface EstimateState {
  // Customer
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;

  // Room
  roomType: string;       // Kitchen | Primary Bathroom | Guest Bathroom | Tub-to-Shower Conversion | Multiple Rooms
  roomDimensions: string; // raw input, e.g. "165L x 124W"

  // Bathroom scope
  bathDemo: string;
  bathShowerType: string;
  bathTileWallSqft: number;
  bathTileFloorSqft: number;
  bathVanitySize: string;
  bathCountertop: string;
  bathGlass: string;
  bathExtras: string[];           // multi-select values
  bathPlumbingExtras: string[];   // multi-select values

  // Kitchen scope
  kitchenDemo: string;
  kitchenCabinets: string;
  kitchenCabinetColor: string;
  kitchenCabinetCount: number;          // approx total cabinet count
  kitchenCabinetAddons: string[];       // specialty cabs: glass_fronts, spice_rack, lazy_susan, etc.
  kitchenCountertop: string;
  kitchenCountertopSqft: number;
  kitchenBacksplash: string;
  kitchenFlooring: string;
  kitchenFlooringSqft: number;
  kitchenExtras: string[];

  // Pricing
  pricingTier: string;      // Standard | Upgraded | Premium
  totalPriceOverride: number | null;   // manual override, null = use calculated
  paymentSchedule: string;  // "65/25/10" | "35/30/20/15" | "50/25/25"

  // Notes / misc
  notes: string;
}

// ── Trade Breakdown ───────────────────────────────────────────

export interface TradeLine {
  name: string;
  cp: number;
  ic: number;
}

export interface EstimateBreakdown {
  trades: TradeLine[];
  subtotalCp: number;
  subtotalIc: number;
  margin: number;
  marginPercent: number;
  paymentMilestones: { label: string; percent: number; amount: number }[];
}

// ── Helpers ───────────────────────────────────────────────────

function isBathroom(roomType: string): boolean {
  return ['Primary Bathroom', 'Guest Bathroom', 'Tub-to-Shower Conversion'].includes(roomType);
}

function isKitchen(roomType: string): boolean {
  return roomType === 'Kitchen';
}

/** Tier multipliers applied to final CP */
const TIER_MULT: Record<string, number> = {
  Standard: 1.0,
  Upgraded: 1.12,
  Premium: 1.25,
};

// ── Calculate Estimate ────────────────────────────────────────

export function calculateEstimate(
  state: Partial<EstimateState>,
  pricing: TKBSOPricingConfig = TKBSO_DEFAULT_PRICING,
): EstimateBreakdown {
  const trades: TradeLine[] = [];
  const room = state.roomType ?? '';
  const tier = state.pricingTier ?? 'Standard';
  const tierMult = TIER_MULT[tier] ?? 1.0;

  // ── Bathroom Pricing ──────────────────────────────────────

  if (isBathroom(room)) {
    const isGuest = room === 'Guest Bathroom';
    const isTubConversion = room === 'Tub-to-Shower Conversion';
    const wallSqft = state.bathTileWallSqft ?? 0;
    const floorSqft = state.bathTileFloorSqft ?? 0;
    const showerFloorSqft = 14; // typical shower floor ~14 sqft
    const extras = state.bathExtras ?? [];
    const plumbExtras = state.bathPlumbingExtras ?? [];

    // Demo
    const demo = state.bathDemo ?? '';
    if (demo && demo !== 'No Demo') {
      let demoIc = 0;
      let demoCp = 0;
      if (demo === 'Shower Only') {
        demoIc = pricing.demo_shower_only_ic;
        demoCp = pricing.demo_shower_only_cp;
      } else if (isGuest) {
        demoIc = pricing.demo_small_bath_ic;
        demoCp = pricing.demo_small_bath_cp;
      } else {
        demoIc = pricing.demo_large_bath_ic;
        demoCp = pricing.demo_large_bath_cp;
      }
      // Partial demo = 60% of full gut
      if (demo === 'Partial Demo') {
        demoIc = Math.round(demoIc * 0.6);
        demoCp = Math.round(demoCp * 0.6);
      }
      trades.push({ name: 'Demo', ic: demoIc, cp: demoCp });
      // Dumpster always included with demo
      trades.push({ name: 'Dumpster/Haul', ic: pricing.dumpster_bath_ic, cp: pricing.dumpster_bath_cp });
    }

    // Plumbing — always included for shower work
    const showerType = state.bathShowerType ?? '';
    if (showerType && showerType !== 'Keep Existing Tub/Shower') {
      let plumbIc = pricing.plumbing_shower_standard_ic;
      let plumbCp = pricing.plumbing_shower_standard_cp;

      if (isTubConversion || showerType === 'Tub-to-Shower Conversion') {
        plumbIc += pricing.plumbing_tub_to_shower_ic;
        plumbCp += pricing.plumbing_tub_to_shower_cp;
      }
      if (showerType === 'Freestanding Tub + Walk-in Shower') {
        plumbIc += pricing.plumbing_tub_freestanding_ic;
        plumbCp += pricing.plumbing_tub_freestanding_cp;
      }

      // Plumbing extras
      if (plumbExtras.includes('linear_drain')) {
        plumbIc += pricing.plumbing_linear_drain_ic;
        plumbCp += pricing.plumbing_linear_drain_cp;
      }
      if (plumbExtras.includes('extra_head')) {
        plumbIc += pricing.plumbing_extra_head_ic;
        plumbCp += pricing.plumbing_extra_head_cp;
      }
      if (plumbExtras.includes('toilet_relocation')) {
        plumbCp += pricing.plumbing_toilet_relocation_cp;
      }
      if (plumbExtras.includes('smart_valve')) {
        plumbIc += pricing.plumbing_smart_valve_ic;
        plumbCp += pricing.plumbing_smart_valve_cp;
      }

      trades.push({ name: 'Plumbing', ic: plumbIc, cp: plumbCp });
      // Fixture allowance always with plumbing
      trades.push({ name: 'Plumbing Fixtures (allowance)', ic: 0, cp: pricing.plumbing_fixture_allowance_cp });
    }

    // Tile (wall + floor + shower floor + waterproofing + cement board)
    if (wallSqft > 0 || floorSqft > 0) {
      const tileIc = wallSqft * pricing.tile_wall_ic
        + floorSqft * pricing.tile_floor_ic
        + showerFloorSqft * pricing.tile_shower_floor_ic;
      const tileCp = wallSqft * pricing.tile_wall_cp
        + floorSqft * pricing.tile_floor_cp
        + showerFloorSqft * pricing.tile_shower_floor_cp;
      trades.push({ name: 'Tile Install', ic: Math.round(tileIc), cp: Math.round(tileCp) });

      // Waterproofing on wall sqft
      if (wallSqft > 0) {
        trades.push({
          name: 'Waterproofing',
          ic: Math.round(wallSqft * pricing.waterproofing_ic),
          cp: Math.round(wallSqft * pricing.waterproofing_cp),
        });
        trades.push({
          name: 'Cement Board',
          ic: Math.round(wallSqft * pricing.cement_board_ic),
          cp: Math.round(wallSqft * pricing.cement_board_cp),
        });
      }

      // Tile material allowance
      const totalTile = wallSqft + floorSqft + showerFloorSqft;
      trades.push({
        name: 'Tile Material (allowance)',
        ic: 0,
        cp: Math.round(totalTile * pricing.tile_material_allowance_cp_per_sqft),
      });
    }

    // Framing — standard blocking always included for shower build
    if (showerType && showerType !== 'Keep Existing Tub/Shower') {
      trades.push({ name: 'Framing/Blocking', ic: pricing.framing_standard_ic, cp: pricing.framing_standard_cp });
    }

    // Vanity
    const vanity = state.bathVanitySize ?? '';
    if (vanity) {
      const vanityMap: Record<string, { ic: number; cp: number }> = {
        '30"': { ic: pricing.vanity_30_bundle_ic, cp: pricing.vanity_30_bundle_cp },
        '36"': { ic: pricing.vanity_36_bundle_ic, cp: pricing.vanity_36_bundle_cp },
        '48"': { ic: pricing.vanity_48_bundle_ic, cp: pricing.vanity_48_bundle_cp },
        '54"': { ic: pricing.vanity_54_bundle_ic, cp: pricing.vanity_54_bundle_cp },
        '60"': { ic: pricing.vanity_60_bundle_ic, cp: pricing.vanity_60_bundle_cp },
        '72"': { ic: pricing.vanity_72_bundle_ic, cp: pricing.vanity_72_bundle_cp },
        '84"': { ic: pricing.vanity_84_bundle_ic, cp: pricing.vanity_84_bundle_cp },
      };
      const v = vanityMap[vanity];
      if (v) trades.push({ name: `Vanity ${vanity} Bundle`, ic: v.ic, cp: v.cp });
    }

    // Bath countertop (separate from vanity bundle for standalone quartz/granite)
    const bathCt = state.bathCountertop ?? '';
    if (bathCt && bathCt !== 'No Countertop') {
      // Countertop priced separately only if quartz/granite/quartzite upgrade beyond vanity bundle
      // For bath, vanity bundle already includes a basic top — this is an upgrade line
      // Skip if vanity bundle already covers it — but include for Granite/Quartzite upgrades
      if (bathCt === 'Granite' || bathCt === 'Quartzite') {
        // Upgrade surcharge: ~$15/sqft over standard quartz included in bundle
        const vanityLinearFt = parseInt(vanity) || 36;
        const ctSqft = Math.round(vanityLinearFt / 12 * 2.2); // ~2.2 sqft per linear ft depth
        trades.push({
          name: `${bathCt} Countertop Upgrade`,
          ic: Math.round(ctSqft * 15),
          cp: Math.round(ctSqft * 28),
        });
      }
    }

    // Glass
    const glass = state.bathGlass ?? '';
    if (glass && glass !== 'No Glass') {
      const glassMap: Record<string, { ic: number; cp: number }> = {
        'Standard (door+panel)': { ic: pricing.glass_shower_standard_ic, cp: pricing.glass_shower_standard_cp },
        'Panel Only': { ic: pricing.glass_panel_only_ic, cp: pricing.glass_panel_only_cp },
        '90\u00B0 Return (door+2 panels)': { ic: pricing.glass_90_return_ic, cp: pricing.glass_90_return_cp },
      };
      const g = glassMap[glass];
      if (g) trades.push({ name: `Shower Glass (${glass})`, ic: g.ic, cp: g.cp });
    }

    // Electrical — base: vanity light always included
    let elecIc = pricing.electrical_vanity_light_ic;
    let elecCp = pricing.electrical_vanity_light_cp;

    if (extras.includes('recessed_cans')) {
      elecIc += pricing.recessed_can_ic * 3; // 3 cans standard
      elecCp += pricing.recessed_can_cp * 3;
    }
    if (elecIc > 0) {
      trades.push({ name: 'Electrical', ic: elecIc, cp: elecCp });
    }

    // Extras — bath general
    if (extras.includes('led_mirror')) {
      trades.push({ name: 'LED Mirror (allowance)', ic: 0, cp: pricing.mirror_allowance_cp });
    }
    if (extras.includes('new_toilet')) {
      trades.push({ name: 'New Toilet (allowance)', ic: pricing.plumbing_toilet_ic, cp: pricing.toilet_allowance_cp });
    }
    if (extras.includes('niche')) {
      trades.push({ name: 'Niche (built-in)', ic: pricing.niche_ic, cp: pricing.niche_cp });
    }
    if (extras.includes('pony_wall')) {
      trades.push({ name: 'Pony Wall', ic: pricing.framing_pony_wall_ic, cp: pricing.framing_pony_wall_cp });
    }
    if (extras.includes('paint_full')) {
      trades.push({ name: 'Paint Full Bath', ic: pricing.paint_full_bath_ic, cp: pricing.paint_full_bath_cp });
    }
    if (extras.includes('paint_patch')) {
      trades.push({ name: 'Paint Patch Only', ic: pricing.paint_patch_bath_ic, cp: pricing.paint_patch_bath_cp });
    }
    if (extras.includes('door_trim')) {
      // Door/trim/baseboards = small package
      trades.push({ name: 'Door/Trim/Baseboards', ic: pricing.electrical_small_package_ic, cp: pricing.electrical_small_package_cp });
    }
  }

  // ── Kitchen Pricing ───────────────────────────────────────

  if (isKitchen(room)) {
    const kExtras = state.kitchenExtras ?? [];

    // Demo
    const kDemo = state.kitchenDemo ?? '';
    if (kDemo && kDemo !== 'No Demo') {
      let demoIc = pricing.demo_kitchen_ic;
      let demoCp = pricing.demo_kitchen_cp;
      if (kDemo === 'Partial (keep floor)') {
        demoIc = Math.round(demoIc * 0.7);
        demoCp = Math.round(demoCp * 0.7);
      }
      trades.push({ name: 'Demo', ic: demoIc, cp: demoCp });
      trades.push({ name: 'Dumpster/Haul', ic: pricing.dumpster_kitchen_ic, cp: pricing.dumpster_kitchen_cp });
    }

    // Cabinets — dynamic pricing based on count + add-ons
    const cabs = state.kitchenCabinets ?? '';
    if (cabs === 'Full Replace (KCC)') {
      const cabCount = state.kitchenCabinetCount || 20;
      // KCC avg per cabinet: ~$350 MSRP × 0.40 multiplier = $140 IC + $25 assembly = $165/unit IC
      // CP per cabinet: $165 / (1 - 0.38) = ~$266/unit CP
      const baseCabIcPerUnit = 165;
      const baseCabCpPerUnit = 266;
      let cabinetIc = cabCount * baseCabIcPerUnit;
      let cabinetCp = cabCount * baseCabCpPerUnit;
      trades.push({ name: `KCC Cabinets (${cabCount} units)`, ic: Math.round(cabinetIc), cp: Math.round(cabinetCp) });

      // Cabinet add-ons pricing
      const addons = state.kitchenCabinetAddons ?? [];
      const addonPricing: Record<string, { label: string; ic: number; cp: number }> = {
        glass_fronts:   { label: 'Glass Front Doors (×2)',    ic: 120, cp: 220 },
        spice_rack:     { label: 'Spice Rack Pullout',        ic: 145, cp: 265 },
        lazy_susan:     { label: 'Lazy Susan Corner',         ic: 200, cp: 370 },
        pantry_tall:    { label: 'Pantry Cabinet (Tall)',      ic: 420, cp: 750 },
        fridge_panel:   { label: 'Refrigerator Panel',        ic: 80,  cp: 150 },
        waste_bin:      { label: 'Waste Bin Pullout',         ic: 210, cp: 380 },
        roll_out_trays: { label: 'Roll-Out Trays (×4)',       ic: 260, cp: 460 },
        wine_rack:      { label: 'Wine Rack Cabinet',         ic: 130, cp: 240 },
        microwave_cab:  { label: 'Microwave Cabinet',         ic: 200, cp: 360 },
        oven_tower:     { label: 'Oven Tower Cabinet',        ic: 560, cp: 1000 },
        crown_molding:  { label: 'Crown Molding Package',     ic: 180, cp: 325 },
        light_rail:     { label: 'Under-Cab Light Rail',      ic: 55,  cp: 100 },
      };

      for (const addon of addons) {
        const p = addonPricing[addon];
        if (p) trades.push({ name: p.label, ic: p.ic, cp: p.cp });
      }
    } else if (cabs === 'Refacing') {
      trades.push({ name: 'Cabinet Refacing', ic: 2800, cp: 4800 });
    }

    // Countertop
    const kCt = state.kitchenCountertop ?? '';
    const kCtSqft = state.kitchenCountertopSqft ?? 0;
    if (kCt && kCt !== 'No Countertop' && kCtSqft > 0) {
      let ctIcRate = pricing.quartz_ic;
      let ctCpRate = pricing.quartz_cp;
      if (kCt === 'Granite') {
        ctIcRate = 35; ctCpRate = 58;
      } else if (kCt === 'Quartzite') {
        ctIcRate = 55; ctCpRate = 90;
      } else if (kCt === 'Laminate') {
        ctIcRate = 12; ctCpRate = 22;
      }
      trades.push({
        name: `${kCt} Countertop`,
        ic: Math.round(kCtSqft * ctIcRate),
        cp: Math.round(kCtSqft * ctCpRate),
      });
    }

    // Backsplash
    const kBs = state.kitchenBacksplash ?? '';
    if (kBs === 'Full Tile Backsplash') {
      // ~30 sqft typical full backsplash
      const bsSqft = 30;
      trades.push({
        name: 'Tile Backsplash',
        ic: Math.round(bsSqft * pricing.tile_wall_ic),
        cp: Math.round(bsSqft * pricing.tile_wall_cp),
      });
      trades.push({
        name: 'Backsplash Material (allowance)',
        ic: 0,
        cp: Math.round(bsSqft * pricing.tile_material_allowance_cp_per_sqft),
      });
    } else if (kBs === 'Partial (behind range)') {
      const bsSqft = 12;
      trades.push({
        name: 'Partial Backsplash',
        ic: Math.round(bsSqft * pricing.tile_wall_ic),
        cp: Math.round(bsSqft * pricing.tile_wall_cp),
      });
    }

    // Flooring
    const kFloor = state.kitchenFlooring ?? '';
    const kFloorSqft = state.kitchenFlooringSqft ?? 0;
    if (kFloor && kFloor !== 'Keep Existing' && kFloorSqft > 0) {
      if (kFloor === 'Tile') {
        trades.push({
          name: 'Floor Tile',
          ic: Math.round(kFloorSqft * pricing.tile_floor_ic),
          cp: Math.round(kFloorSqft * pricing.tile_floor_cp),
        });
        trades.push({
          name: 'Floor Tile Material (allowance)',
          ic: 0,
          cp: Math.round(kFloorSqft * pricing.tile_material_allowance_cp_per_sqft),
        });
      } else if (kFloor === 'LVP') {
        trades.push({
          name: 'LVP Flooring',
          ic: Math.round(kFloorSqft * (pricing.lvp_ic + pricing.barrier_ic)),
          cp: Math.round(kFloorSqft * (pricing.lvp_cp + pricing.barrier_cp)),
        });
      } else if (kFloor === 'Hardwood') {
        // Hardwood: ~$8 IC, ~$14 CP per sqft
        trades.push({
          name: 'Hardwood Flooring',
          ic: Math.round(kFloorSqft * 8),
          cp: Math.round(kFloorSqft * 14),
        });
      }
    }

    // Kitchen extras
    if (kExtras.includes('plumbing_sink')) {
      trades.push({ name: 'Plumbing (sink relocation)', ic: 1800, cp: 3200 });
      trades.push({ name: 'Kitchen Faucet (allowance)', ic: 0, cp: pricing.kitchen_faucet_allowance_cp });
      trades.push({ name: 'Garbage Disposal (allowance)', ic: 0, cp: pricing.garbage_disposal_allowance_cp });
    }
    if (kExtras.includes('electrical')) {
      trades.push({ name: 'Electrical Package', ic: pricing.electrical_kitchen_package_ic, cp: pricing.electrical_kitchen_package_cp });
    }
    if (kExtras.includes('under_cabinet_lighting')) {
      trades.push({ name: 'Under-cabinet Lighting', ic: 350, cp: 650 });
    }
    if (kExtras.includes('appliance_circuits')) {
      trades.push({ name: 'New Appliance Circuits', ic: 400, cp: pricing.electrical_microwave_circuit_cp + pricing.electrical_dishwasher_disposal_cp });
    }
    if (kExtras.includes('paint')) {
      trades.push({ name: 'Paint Kitchen', ic: pricing.paint_full_bath_ic, cp: pricing.paint_full_bath_cp });
    }
  }

  // ── Support Materials & Burden ─────────────────────────────

  // Build trade totals map for burden calculation
  const tradeTotals: Record<string, { ic: number; cp: number }> = {};
  for (const t of trades) {
    const key = t.name.toLowerCase().split(' ')[0]; // first word as key
    if (!tradeTotals[key]) tradeTotals[key] = { ic: 0, cp: 0 };
    tradeTotals[key].ic += t.ic;
    tradeTotals[key].cp += t.cp;
  }

  // Calculate burden lines based on project type
  const projectType = isBathroom(room) ? 'bathroom' : isKitchen(room) ? 'kitchen' : null;
  if (projectType && trades.length > 0) {
    const burdenLines = calculateBurden(projectType, tradeTotals);
    const totalBurden = getTotalBurden(burdenLines);

    // Add consumable kit
    const kit = getConsumableKit(room);
    const kitCost = kit?.defaultCost ?? 0;

    // Add burden as a single hidden IC line (not shown to customer, protects margin)
    if (totalBurden + kitCost > 0) {
      trades.push({
        name: 'Support Materials & Consumables',
        ic: totalBurden + kitCost,
        cp: 0, // burden is absorbed into IC — already covered by trade CP margins
      });
    }
  }

  // ── Compute Totals ────────────────────────────────────────

  const rawIc = trades.reduce((sum, t) => sum + t.ic, 0);
  const rawCp = trades.reduce((sum, t) => sum + t.cp, 0);

  // Apply tier multiplier to CP only (IC is fixed cost)
  const subtotalIc = Math.round(rawIc);
  const subtotalCp = Math.round(rawCp * tierMult);

  // Override total if user manually set it
  const finalCp = state.totalPriceOverride ?? subtotalCp;

  const margin = finalCp > 0 ? finalCp - subtotalIc : 0;
  const marginPercent = finalCp > 0 ? (finalCp - subtotalIc) / finalCp : 0;

  // Payment milestones
  const schedule = state.paymentSchedule ?? '65/25/10';
  const splits = schedule.split('/').map(Number);
  const milestoneLabels = splits.length === 4
    ? ['Deposit', 'Materials On-site', 'Rough-in Complete', 'Final Walk']
    : splits.length === 3
      ? ['Deposit', 'Midpoint', 'Final Walk']
      : ['Deposit', 'Final Walk'];

  const paymentMilestones = splits.map((pct, i) => ({
    label: milestoneLabels[i] ?? `Payment ${i + 1}`,
    percent: pct,
    amount: Math.round(finalCp * (pct / 100)),
  }));

  return {
    trades: trades.map(t => ({
      ...t,
      ic: Math.round(t.ic),
      cp: Math.round(t.cp * tierMult),
    })),
    subtotalCp: finalCp,
    subtotalIc,
    margin,
    marginPercent,
    paymentMilestones,
  };
}

// ── Flow Navigation ───────────────────────────────────────────

const BATH_FLOW: FlowStep[] = [
  'bath_demo', 'bath_shower_type', 'bath_tile_wall_sqft', 'bath_tile_floor_sqft',
  'bath_vanity_size', 'bath_countertop', 'bath_glass', 'bath_extras', 'bath_plumbing_extras',
];

const KITCHEN_FLOW: FlowStep[] = [
  'kitchen_demo', 'kitchen_cabinets', 'kitchen_cabinet_color', 'kitchen_cabinet_count', 'kitchen_cabinet_addons',
  'kitchen_countertop', 'kitchen_countertop_sqft',
  'kitchen_backsplash', 'kitchen_flooring', 'kitchen_flooring_sqft', 'kitchen_extras',
];

const SHARED_CLOSE: FlowStep[] = [
  'pricing_tier', 'total_price', 'payment_schedule', 'confirm', 'done',
];

const CUSTOMER_FLOW: FlowStep[] = [
  'customer_name', 'customer_address', 'customer_phone', 'customer_email',
  'room_type', 'room_dimensions',
];

export function getNextStep(current: FlowStep, state: Partial<EstimateState>): FlowStep {
  const room = state.roomType ?? '';

  // Customer info sequence
  const custIdx = CUSTOMER_FLOW.indexOf(current);
  if (custIdx >= 0 && custIdx < CUSTOMER_FLOW.length - 1) {
    return CUSTOMER_FLOW[custIdx + 1];
  }

  // After room_dimensions, branch by room type
  if (current === 'room_dimensions') {
    if (isBathroom(room)) return 'bath_demo';
    if (isKitchen(room)) return 'kitchen_demo';
    // Multiple Rooms / fallback — start with bathroom
    return 'bath_demo';
  }

  // Bathroom flow
  if (isBathroom(room) || (!isKitchen(room) && BATH_FLOW.includes(current))) {
    const bathIdx = BATH_FLOW.indexOf(current);
    if (bathIdx >= 0) {
      // Skip kitchen_cabinet_color equivalent — handle conditional skips
      if (bathIdx < BATH_FLOW.length - 1) {
        return BATH_FLOW[bathIdx + 1];
      }
      // End of bath flow -> shared close
      return SHARED_CLOSE[0];
    }
  }

  // Kitchen flow
  if (isKitchen(room) || KITCHEN_FLOW.includes(current)) {
    const kitIdx = KITCHEN_FLOW.indexOf(current);
    if (kitIdx >= 0) {
      const nextKitIdx = kitIdx + 1;

      // Skip cabinet detail steps if not Full Replace
      if (KITCHEN_FLOW[nextKitIdx] === 'kitchen_cabinet_color' ||
          KITCHEN_FLOW[nextKitIdx] === 'kitchen_cabinet_count' ||
          KITCHEN_FLOW[nextKitIdx] === 'kitchen_cabinet_addons') {
        if (state.kitchenCabinets !== 'Full Replace (KCC)') {
          // Find the next non-cabinet step
          let skipIdx = nextKitIdx;
          while (skipIdx < KITCHEN_FLOW.length &&
            ['kitchen_cabinet_color', 'kitchen_cabinet_count', 'kitchen_cabinet_addons'].includes(KITCHEN_FLOW[skipIdx])) {
            skipIdx++;
          }
          return KITCHEN_FLOW[skipIdx] ?? SHARED_CLOSE[0];
        }
      }

      // Skip kitchen_flooring_sqft if Keep Existing
      if (KITCHEN_FLOW[nextKitIdx] === 'kitchen_flooring_sqft') {
        if (state.kitchenFlooring === 'Keep Existing') {
          return KITCHEN_FLOW[nextKitIdx + 1]; // skip sqft, go to extras
        }
      }

      if (nextKitIdx < KITCHEN_FLOW.length) {
        return KITCHEN_FLOW[nextKitIdx];
      }
      // End of kitchen flow -> shared close
      return SHARED_CLOSE[0];
    }
  }

  // Shared closing sequence
  const closeIdx = SHARED_CLOSE.indexOf(current);
  if (closeIdx >= 0 && closeIdx < SHARED_CLOSE.length - 1) {
    return SHARED_CLOSE[closeIdx + 1];
  }

  return 'done';
}

// ── Step Configs ──────────────────────────────────────────────

interface StepConfig {
  message: (state: Partial<EstimateState>) => string;
  quickReplies?: (state: Partial<EstimateState>) => QuickReply[];
  inputType?: 'text' | 'number' | 'email' | 'tel' | 'textarea';
  inputPlaceholder?: string;
  validate?: (value: string) => string | null;
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

export const FLOW_STEPS: Record<FlowStep, StepConfig> = {

  // ── Customer Info ─────────────────────────────────────────

  customer_name: {
    message: () => "What's the customer's name?",
    inputType: 'text',
    inputPlaceholder: 'Full name',
    validate: (v) => v.trim().length < 2 ? 'Enter the customer name.' : null,
  },

  customer_address: {
    message: (s) => `Got it \u2014 ${s.customerName}. Property address?`,
    inputType: 'text',
    inputPlaceholder: '123 Main St, Orlando, FL',
    validate: (v) => v.trim().length < 5 ? 'Enter a valid address.' : null,
  },

  customer_phone: {
    message: () => "Phone number?",
    inputType: 'tel',
    inputPlaceholder: '(407) 555-1234',
    validate: (v) => v.replace(/\D/g, '').length < 10 ? 'Enter a valid 10-digit phone number.' : null,
  },

  customer_email: {
    message: () => "Email? (optional \u2014 press enter to skip)",
    inputType: 'email',
    inputPlaceholder: 'customer@email.com',
  },

  // ── Room Selection ────────────────────────────────────────

  room_type: {
    message: () => "What are we remodeling?",
    quickReplies: () => [
      { label: 'Kitchen', value: 'Kitchen' },
      { label: 'Primary Bathroom', value: 'Primary Bathroom' },
      { label: 'Guest Bathroom', value: 'Guest Bathroom' },
      { label: 'Tub-to-Shower Conversion', value: 'Tub-to-Shower Conversion' },
      { label: 'Multiple Rooms', value: 'Multiple Rooms' },
    ],
  },

  room_dimensions: {
    message: (s) => `${s.roomType} \u2014 got it. Room dimensions? (optional \u2014 press enter to skip)`,
    inputType: 'text',
    inputPlaceholder: '165L x 124W  or  180 sq ft',
  },

  // ── Bathroom Flow ─────────────────────────────────────────

  bath_demo: {
    message: () => "Demo scope?",
    quickReplies: () => [
      { label: 'Full Gut (walls, floor, shower, vanity)', value: 'Full Gut' },
      { label: 'Shower Only', value: 'Shower Only' },
      { label: 'Partial Demo', value: 'Partial Demo' },
      { label: 'No Demo', value: 'No Demo' },
    ],
  },

  bath_shower_type: {
    message: () => "Shower configuration?",
    quickReplies: () => [
      { label: 'Walk-in Shower (new build)', value: 'Walk-in Shower' },
      { label: 'Tub-to-Shower Conversion', value: 'Tub-to-Shower Conversion' },
      { label: 'Keep Existing Tub/Shower', value: 'Keep Existing Tub/Shower' },
      { label: 'Freestanding Tub + Walk-in Shower', value: 'Freestanding Tub + Walk-in Shower' },
    ],
  },

  bath_tile_wall_sqft: {
    message: () => "Approx shower wall tile square footage?",
    inputType: 'number',
    inputPlaceholder: '80-120 sq ft typical',
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0 || n > 500) return 'Enter a number between 0 and 500.';
      return null;
    },
  },

  bath_tile_floor_sqft: {
    message: () => "Main floor tile square footage?",
    inputType: 'number',
    inputPlaceholder: '40-80 sq ft typical',
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0 || n > 500) return 'Enter a number between 0 and 500.';
      return null;
    },
  },

  bath_vanity_size: {
    message: () => "Vanity size?",
    quickReplies: () => [
      { label: '30"', value: '30"' },
      { label: '36"', value: '36"' },
      { label: '48"', value: '48"' },
      { label: '54"', value: '54"' },
      { label: '60"', value: '60"', style: 'price' },
      { label: '72"', value: '72"', style: 'price' },
      { label: '84"', value: '84"', style: 'price' },
    ],
  },

  bath_countertop: {
    message: () => "Countertop material?",
    quickReplies: () => [
      { label: 'Level 1 Quartz', value: 'Quartz', style: 'price' },
      { label: 'Granite', value: 'Granite', style: 'price' },
      { label: 'Quartzite', value: 'Quartzite', style: 'price' },
      { label: 'No Countertop', value: 'No Countertop' },
    ],
  },

  bath_glass: {
    message: () => "Shower glass?",
    quickReplies: () => [
      { label: 'Standard (door+panel)', value: 'Standard (door+panel)', style: 'price' },
      { label: 'Panel Only', value: 'Panel Only' },
      { label: '90\u00B0 Return (door+2 panels)', value: '90\u00B0 Return (door+2 panels)', style: 'price' },
      { label: 'No Glass', value: 'No Glass' },
    ],
  },

  bath_extras: {
    message: () => "Additional items? Select all that apply.",
    quickReplies: () => [
      { label: 'LED Mirror ($500)', value: 'led_mirror', style: 'price' },
      { label: 'Recessed Can Lights', value: 'recessed_cans' },
      { label: 'New Toilet ($450)', value: 'new_toilet', style: 'price' },
      { label: 'Niche (built-in)', value: 'niche' },
      { label: 'Pony Wall', value: 'pony_wall' },
      { label: 'Paint Full Bath', value: 'paint_full' },
      { label: 'Paint Patch Only', value: 'paint_patch' },
      { label: 'Door/Trim/Baseboards', value: 'door_trim' },
      { label: '\u2192 Continue', value: '__continue__', style: 'price' },
    ],
  },

  bath_plumbing_extras: {
    message: () => "Any plumbing add-ons?",
    quickReplies: () => [
      { label: 'Linear Drain', value: 'linear_drain', style: 'price' },
      { label: 'Extra Shower Head', value: 'extra_head', style: 'price' },
      { label: 'Toilet Relocation', value: 'toilet_relocation', style: 'price' },
      { label: 'Smart Valve System', value: 'smart_valve', style: 'price' },
      { label: '\u2192 Continue', value: '__continue__', style: 'price' },
    ],
  },

  // ── Kitchen Flow ──────────────────────────────────────────

  kitchen_demo: {
    message: () => "Demo scope?",
    quickReplies: () => [
      { label: 'Full Gut', value: 'Full Gut' },
      { label: 'Partial (keep floor)', value: 'Partial (keep floor)' },
      { label: 'No Demo', value: 'No Demo' },
    ],
  },

  kitchen_cabinets: {
    message: () => "Cabinet approach?",
    quickReplies: () => [
      { label: 'Full Replace (KCC)', value: 'Full Replace (KCC)', style: 'price' },
      { label: 'Refacing', value: 'Refacing' },
      { label: 'Keep Existing', value: 'Keep Existing' },
      { label: 'No Cabinets', value: 'No Cabinets' },
    ],
  },

  kitchen_cabinet_color: {
    message: () => "Cabinet color line?",
    quickReplies: () => [
      { label: 'Shaker White', value: 'Shaker White' },
      { label: 'Light Gray', value: 'Light Gray' },
      { label: 'Sand', value: 'Sand' },
      { label: 'Matte White', value: 'Matte White' },
      { label: 'Estate Brown', value: 'Estate Brown' },
      { label: 'Estate White', value: 'Estate White' },
      { label: 'Estate Sage', value: 'Estate Sage' },
    ],
  },

  kitchen_cabinet_count: {
    message: () => "Approximately how many cabinets total? (uppers + lowers + tall)",
    inputType: 'number',
    inputPlaceholder: 'e.g. 20 (typical kitchen is 15-25)',
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 1 || n > 80) return 'Enter a number between 1 and 80.';
      return null;
    },
  },

  kitchen_cabinet_addons: {
    message: () => "Any specialty cabinets or add-ons? Select all that apply.",
    quickReplies: () => [
      { label: 'Glass Front Doors', value: 'glass_fronts', style: 'price' },
      { label: 'Spice Rack Pullout', value: 'spice_rack' },
      { label: 'Lazy Susan Corner', value: 'lazy_susan', style: 'price' },
      { label: 'Pantry Cabinet (Tall)', value: 'pantry_tall', style: 'price' },
      { label: 'Fridge Panel/Garage', value: 'fridge_panel' },
      { label: 'Waste Bin Pullout', value: 'waste_bin' },
      { label: 'Roll-Out Trays', value: 'roll_out_trays' },
      { label: 'Wine Rack', value: 'wine_rack' },
      { label: 'Microwave Base/Wall', value: 'microwave_cab' },
      { label: 'Oven Tower', value: 'oven_tower', style: 'price' },
      { label: 'Crown Molding', value: 'crown_molding' },
      { label: 'Under-Cab Light Rail', value: 'light_rail' },
      { label: '\u2192 Continue', value: '__continue__', style: 'price' },
    ],
  },

  kitchen_countertop: {
    message: () => "Countertop material?",
    quickReplies: () => [
      { label: 'Quartz', value: 'Quartz', style: 'price' },
      { label: 'Granite', value: 'Granite', style: 'price' },
      { label: 'Quartzite', value: 'Quartzite', style: 'price' },
      { label: 'Laminate', value: 'Laminate' },
      { label: 'No Countertop', value: 'No Countertop' },
    ],
  },

  kitchen_countertop_sqft: {
    message: () => "Approx countertop square footage?",
    inputType: 'number',
    inputPlaceholder: '25-50 sq ft typical',
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0 || n > 200) return 'Enter a number between 0 and 200.';
      return null;
    },
  },

  kitchen_backsplash: {
    message: () => "Backsplash?",
    quickReplies: () => [
      { label: 'Full Tile Backsplash', value: 'Full Tile Backsplash', style: 'price' },
      { label: 'Partial (behind range)', value: 'Partial (behind range)' },
      { label: 'No Backsplash', value: 'No Backsplash' },
    ],
  },

  kitchen_flooring: {
    message: () => "Flooring?",
    quickReplies: () => [
      { label: 'Tile', value: 'Tile', style: 'price' },
      { label: 'LVP', value: 'LVP' },
      { label: 'Hardwood', value: 'Hardwood', style: 'price' },
      { label: 'Keep Existing', value: 'Keep Existing' },
    ],
  },

  kitchen_flooring_sqft: {
    message: () => "Floor square footage?",
    inputType: 'number',
    inputPlaceholder: '100-250 sq ft typical',
    validate: (v) => {
      const n = parseFloat(v);
      if (isNaN(n) || n < 0 || n > 1000) return 'Enter a number between 0 and 1000.';
      return null;
    },
  },

  kitchen_extras: {
    message: () => "Additional items? Select all that apply.",
    quickReplies: () => [
      { label: 'Plumbing (sink relocation)', value: 'plumbing_sink', style: 'price' },
      { label: 'Electrical Package', value: 'electrical', style: 'price' },
      { label: 'Under-cabinet Lighting', value: 'under_cabinet_lighting' },
      { label: 'New Appliance Circuits', value: 'appliance_circuits', style: 'price' },
      { label: 'Paint', value: 'paint' },
      { label: '\u2192 Continue', value: '__continue__', style: 'price' },
    ],
  },

  // ── Shared Closing ────────────────────────────────────────

  pricing_tier: {
    message: () => "What pricing tier?",
    quickReplies: () => [
      { label: 'Standard', value: 'Standard' },
      { label: 'Upgraded (+12%)', value: 'Upgraded', style: 'price' },
      { label: 'Premium (+25%)', value: 'Premium', style: 'price' },
    ],
  },

  total_price: {
    message: (s) => {
      const est = calculateEstimate(s);
      return `Calculated CP total: ${fmt(est.subtotalCp)}\n\nEnter a custom total project price, or type 'auto' to use the calculated price.`;
    },
    inputType: 'text',
    inputPlaceholder: "e.g. 18500 or 'auto'",
  },

  payment_schedule: {
    message: () => "Payment schedule?",
    quickReplies: () => [
      { label: '65 / 25 / 10', value: '65/25/10' },
      { label: '35 / 30 / 20 / 15', value: '35/30/20/15' },
      { label: '50 / 25 / 25', value: '50/25/25' },
    ],
  },

  confirm: {
    message: (s) => {
      const est = calculateEstimate(s);
      const room = s.roomType ?? 'Project';
      const lines: string[] = [];

      lines.push(`QUOTE SUMMARY \u2014 ${s.customerName}`);
      lines.push(`${room} at ${s.customerAddress}`);
      lines.push('');

      // Trade breakdown
      lines.push('TRADE BREAKDOWN:');
      for (const t of est.trades) {
        if (t.cp > 0) {
          lines.push(`  ${t.name}: ${fmt(t.cp)} (IC: ${fmt(t.ic)})`);
        }
      }
      lines.push('');
      lines.push(`Total CP: ${fmt(est.subtotalCp)}`);
      lines.push(`Total IC: ${fmt(est.subtotalIc)}`);
      lines.push(`Margin: ${fmt(est.margin)} (${(est.marginPercent * 100).toFixed(1)}%)`);
      lines.push('');

      // Payment milestones
      lines.push('PAYMENT SCHEDULE:');
      for (const m of est.paymentMilestones) {
        lines.push(`  ${m.label}: ${fmt(m.amount)} (${m.percent}%)`);
      }
      lines.push('');
      lines.push('Save this quote?');

      return lines.join('\n');
    },
    quickReplies: () => [
      { label: 'Save Quote', value: 'submit', style: 'price' },
      { label: 'Start Over', value: 'restart' },
    ],
  },

  done: {
    message: (s) => `Quote saved for ${s.customerName}. Ready for PDF generation and Supabase sync.`,
  },
};

// ── Greeting ─────────────────────────────────────────────────

export function getGreeting(): ChatMessage {
  return {
    id: 'greeting',
    role: 'assistant',
    text: "TKBSO Quote Pro \u2014 Let's build a quote for a customer. This tool uses real TKBSO trade pricing to generate accurate IC/CP breakdowns.",
    timestamp: new Date(),
    quickReplies: [{ label: "Let's go \u2192", value: '__start__', style: 'price' }],
  };
}
