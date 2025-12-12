/**
 * DETERMINISTIC PRICING LOOKUP
 * 
 * This is the single source of truth for line item pricing.
 * The AI conversation extracts what items are needed, then this
 * pricing table calculates the exact costs.
 * 
 * All pricing uses 42% margin formula: CP = IC × 1.724
 */

export interface PricingEntry {
  ic: number;        // Internal Cost
  cp: number;        // Client Price
  unit: 'ea' | 'sqft' | 'lf';
  perUnit: boolean;  // If true, multiply by quantity
  category: string;  // Trade category for grouping
}

export interface ExtractedLineItem {
  name: string;
  quantity: number;
  unit: 'ea' | 'sqft' | 'lf';
  ic: number;
  cp: number;
  category: string;
}

// ============================================================
// COMPREHENSIVE PRICING DATABASE
// IC = Internal Cost, CP = Client Price (42% margin: CP = IC × 1.724)
// ============================================================

export const PRICING_DATABASE: Record<string, PricingEntry> = {
  // ============ DEMOLITION ============
  'demo_shower_only': { ic: 900, cp: 1552, unit: 'ea', perUnit: false, category: 'Demolition' },
  'demo_small_bath': { ic: 1300, cp: 2241, unit: 'ea', perUnit: false, category: 'Demolition' },
  'demo_large_bath': { ic: 1650, cp: 2845, unit: 'ea', perUnit: false, category: 'Demolition' },
  'demo_full_bath': { ic: 1360, cp: 2345, unit: 'ea', perUnit: false, category: 'Demolition' },
  'demo_kitchen': { ic: 1750, cp: 3017, unit: 'ea', perUnit: false, category: 'Demolition' },
  'demo_cast_iron_tub': { ic: 250, cp: 431, unit: 'ea', perUnit: false, category: 'Demolition' },
  'soffit_removal': { ic: 150, cp: 259, unit: 'ea', perUnit: true, category: 'Demolition' },
  'dumpster': { ic: 550, cp: 948, unit: 'ea', perUnit: false, category: 'Demolition' },
  'wall_removal': { ic: 1200, cp: 2069, unit: 'ea', perUnit: false, category: 'Demolition' },
  
  // ============ PLUMBING ============
  'plumbing_shower_standard': { ic: 1800, cp: 3103, unit: 'ea', perUnit: false, category: 'Plumbing' },
  'plumbing_shower_valve': { ic: 1800, cp: 3103, unit: 'ea', perUnit: false, category: 'Plumbing' },
  'plumbing_extra_head': { ic: 625, cp: 1078, unit: 'ea', perUnit: true, category: 'Plumbing' },
  'plumbing_toilet_swap': { ic: 350, cp: 603, unit: 'ea', perUnit: false, category: 'Plumbing' },
  'plumbing_toilet_reinstall': { ic: 150, cp: 259, unit: 'ea', perUnit: false, category: 'Plumbing' },
  'plumbing_toilet_relocation': { ic: 4000, cp: 6897, unit: 'ea', perUnit: false, category: 'Plumbing' },
  'plumbing_tub_drain_relocation': { ic: 2800, cp: 4828, unit: 'ea', perUnit: false, category: 'Plumbing' },
  'plumbing_tub_to_shower': { ic: 2550, cp: 4397, unit: 'ea', perUnit: false, category: 'Plumbing' },
  'plumbing_freestanding_tub': { ic: 4500, cp: 7759, unit: 'ea', perUnit: false, category: 'Plumbing' },
  'plumbing_linear_drain': { ic: 750, cp: 1293, unit: 'ea', perUnit: false, category: 'Plumbing' },
  'plumbing_smart_valve': { ic: 1350, cp: 2328, unit: 'ea', perUnit: false, category: 'Plumbing' },
  'plumbing_curb_liner': { ic: 500, cp: 862, unit: 'ea', perUnit: false, category: 'Plumbing' },
  'plumbing_kitchen_reconnect': { ic: 800, cp: 1379, unit: 'ea', perUnit: false, category: 'Plumbing' },
  
  // ============ FIXTURES (Material Allowances) ============
  'fixture_toilet': { ic: 450, cp: 450, unit: 'ea', perUnit: true, category: 'Fixtures' },
  'fixture_tub_filler': { ic: 500, cp: 862, unit: 'ea', perUnit: true, category: 'Fixtures' },
  'fixture_shower_trim_kit': { ic: 450, cp: 450, unit: 'ea', perUnit: true, category: 'Fixtures' },
  'fixture_faucet': { ic: 350, cp: 350, unit: 'ea', perUnit: true, category: 'Fixtures' },
  'fixture_kitchen_faucet': { ic: 400, cp: 400, unit: 'ea', perUnit: true, category: 'Fixtures' },
  'fixture_sink': { ic: 300, cp: 300, unit: 'ea', perUnit: true, category: 'Fixtures' },
  'fixture_garbage_disposal': { ic: 250, cp: 250, unit: 'ea', perUnit: true, category: 'Fixtures' },
  
  // ============ ELECTRICAL ============
  'electrical_recessed_can': { ic: 65, cp: 112, unit: 'ea', perUnit: true, category: 'Electrical' },
  'electrical_vanity_light': { ic: 225, cp: 388, unit: 'ea', perUnit: true, category: 'Electrical' },
  'electrical_pendant': { ic: 150, cp: 259, unit: 'ea', perUnit: true, category: 'Electrical' },
  'electrical_under_cabinet': { ic: 350, cp: 603, unit: 'ea', perUnit: false, category: 'Electrical' },
  'electrical_outlet': { ic: 85, cp: 147, unit: 'ea', perUnit: true, category: 'Electrical' },
  'electrical_switch': { ic: 65, cp: 112, unit: 'ea', perUnit: true, category: 'Electrical' },
  'electrical_gfci': { ic: 95, cp: 164, unit: 'ea', perUnit: true, category: 'Electrical' },
  'electrical_dimmer': { ic: 85, cp: 147, unit: 'ea', perUnit: true, category: 'Electrical' },
  'electrical_led_mirror': { ic: 100, cp: 172, unit: 'ea', perUnit: true, category: 'Electrical' },
  'electrical_exhaust_fan': { ic: 175, cp: 302, unit: 'ea', perUnit: true, category: 'Electrical' },
  'electrical_small_package': { ic: 250, cp: 431, unit: 'ea', perUnit: false, category: 'Electrical' },
  'electrical_kitchen_package': { ic: 950, cp: 1638, unit: 'ea', perUnit: false, category: 'Electrical' },
  'electrical_220_line': { ic: 450, cp: 776, unit: 'ea', perUnit: false, category: 'Electrical' },
  
  // ============ FRAMING ============
  'framing_standard': { ic: 750, cp: 1293, unit: 'ea', perUnit: false, category: 'Framing' },
  'framing_niche': { ic: 150, cp: 259, unit: 'ea', perUnit: true, category: 'Framing' },
  'framing_bench': { ic: 400, cp: 690, unit: 'ea', perUnit: true, category: 'Framing' },
  'framing_pony_wall': { ic: 450, cp: 776, unit: 'ea', perUnit: true, category: 'Framing' },
  'framing_new_wall': { ic: 1200, cp: 2069, unit: 'ea', perUnit: false, category: 'Framing' },
  'framing_pocket_door': { ic: 650, cp: 1121, unit: 'ea', perUnit: true, category: 'Framing' },
  'framing_door_relocation': { ic: 1200, cp: 2069, unit: 'ea', perUnit: false, category: 'Framing' },
  'framing_door_closure': { ic: 600, cp: 1034, unit: 'ea', perUnit: false, category: 'Framing' },
  'framing_shower_enlargement': { ic: 1800, cp: 3103, unit: 'ea', perUnit: false, category: 'Framing' },
  
  // ============ DRYWALL ============
  'drywall_patch': { ic: 330, cp: 569, unit: 'ea', perUnit: false, category: 'Drywall' },
  'drywall_large': { ic: 13, cp: 22, unit: 'sqft', perUnit: true, category: 'Drywall' },
  'drywall_ceiling': { ic: 8, cp: 14, unit: 'sqft', perUnit: true, category: 'Drywall' },
  
  // ============ TILE & WATERPROOFING ============
  'tile_wall': { ic: 18, cp: 31, unit: 'sqft', perUnit: true, category: 'Tile' },
  'tile_shower_floor': { ic: 5, cp: 9, unit: 'sqft', perUnit: true, category: 'Tile' },
  'tile_main_floor': { ic: 4.5, cp: 8, unit: 'sqft', perUnit: true, category: 'Tile' },
  'tile_backsplash': { ic: 25, cp: 43, unit: 'sqft', perUnit: true, category: 'Tile' },
  'waterproofing': { ic: 2, cp: 3.45, unit: 'sqft', perUnit: true, category: 'Tile' },
  'cement_board': { ic: 3, cp: 5.17, unit: 'sqft', perUnit: true, category: 'Tile' },
  'schluter_profile': { ic: 15, cp: 26, unit: 'lf', perUnit: true, category: 'Tile' },
  
  // ============ MATERIAL ALLOWANCES (Pass-through, CP = IC) ============
  'allowance_tile_main': { ic: 6.5, cp: 6.5, unit: 'sqft', perUnit: true, category: 'Material Allowances' },
  'allowance_tile_shower': { ic: 12, cp: 12, unit: 'sqft', perUnit: true, category: 'Material Allowances' },
  'allowance_tile_wall': { ic: 6.5, cp: 6.5, unit: 'sqft', perUnit: true, category: 'Material Allowances' },
  'allowance_quartz': { ic: 1200, cp: 1200, unit: 'ea', perUnit: false, category: 'Material Allowances' },
  'allowance_plumbing_fixtures': { ic: 1350, cp: 1350, unit: 'ea', perUnit: false, category: 'Material Allowances' },
  'allowance_mirror': { ic: 200, cp: 344, unit: 'ea', perUnit: true, category: 'Material Allowances' },
  'allowance_led_mirror': { ic: 550, cp: 550, unit: 'ea', perUnit: true, category: 'Material Allowances' },
  
  // ============ CABINETRY & VANITIES ============
  'vanity_30': { ic: 1100, cp: 1897, unit: 'ea', perUnit: false, category: 'Cabinetry' },
  'vanity_36': { ic: 1300, cp: 2241, unit: 'ea', perUnit: false, category: 'Cabinetry' },
  'vanity_48': { ic: 2500, cp: 4310, unit: 'ea', perUnit: false, category: 'Cabinetry' },
  'vanity_60': { ic: 2200, cp: 3793, unit: 'ea', perUnit: false, category: 'Cabinetry' },
  'vanity_72': { ic: 2600, cp: 4483, unit: 'ea', perUnit: false, category: 'Cabinetry' },
  'vanity_84': { ic: 3200, cp: 5517, unit: 'ea', perUnit: false, category: 'Cabinetry' },
  'vanity_96': { ic: 3800, cp: 6552, unit: 'ea', perUnit: false, category: 'Cabinetry' },
  'linen_cabinet': { ic: 300, cp: 517, unit: 'ea', perUnit: true, category: 'Cabinetry' },
  'cabinet_kitchen': { ic: 200, cp: 345, unit: 'lf', perUnit: true, category: 'Cabinetry' },
  'medicine_cabinet': { ic: 125, cp: 216, unit: 'ea', perUnit: true, category: 'Cabinetry' },
  
  // ============ COUNTERTOPS ============
  'quartz_fab_install': { ic: 22, cp: 38, unit: 'sqft', perUnit: true, category: 'Countertops' },
  
  // ============ PAINT ============
  'paint_patch': { ic: 500, cp: 862, unit: 'ea', perUnit: false, category: 'Paint' },
  'paint_full_bath': { ic: 1000, cp: 1724, unit: 'ea', perUnit: false, category: 'Paint' },
  'paint_full_kitchen': { ic: 1200, cp: 2069, unit: 'ea', perUnit: false, category: 'Paint' },
  'paint_ceiling': { ic: 250, cp: 431, unit: 'ea', perUnit: false, category: 'Paint' },
  
  // ============ GLASS ============
  'glass_door_panel': { ic: 1350, cp: 2328, unit: 'ea', perUnit: false, category: 'Glass' },
  'glass_panel_only': { ic: 800, cp: 1379, unit: 'ea', perUnit: false, category: 'Glass' },
  'glass_90_return': { ic: 1425, cp: 2457, unit: 'ea', perUnit: false, category: 'Glass' },
  
  // ============ ACCESSORIES ============
  'mirror_standard': { ic: 200, cp: 345, unit: 'ea', perUnit: true, category: 'Accessories' },
  'towel_bar': { ic: 45, cp: 78, unit: 'ea', perUnit: true, category: 'Accessories' },
  'tp_holder': { ic: 12, cp: 21, unit: 'ea', perUnit: true, category: 'Accessories' },
  'robe_hook': { ic: 25, cp: 43, unit: 'ea', perUnit: true, category: 'Accessories' },
  'grab_bar': { ic: 85, cp: 147, unit: 'ea', perUnit: true, category: 'Accessories' },
  'shower_shelf': { ic: 45, cp: 78, unit: 'ea', perUnit: true, category: 'Accessories' },
  
  // ============ FLOORING ============
  'lvp_flooring': { ic: 2.5, cp: 4.31, unit: 'sqft', perUnit: true, category: 'Flooring' },
  'floor_leveling': { ic: 500, cp: 862, unit: 'ea', perUnit: false, category: 'Flooring' },
  
  // ============ SITE PROTECTION ============
  'floor_protection': { ic: 0.5, cp: 0.86, unit: 'sqft', perUnit: true, category: 'Site Protection' },
  'dust_barrier': { ic: 150, cp: 259, unit: 'ea', perUnit: false, category: 'Site Protection' },
};

// ============================================================
// SCOPE EXTRACTION STATE
// Tracks all mentioned items during conversation
// ============================================================

export interface ScopeExtractionState {
  // Project basics
  projectType: 'Kitchen' | 'Bathroom' | null;
  roomSqft: number | null;
  
  // Demolition
  demoScope: 'small' | 'medium' | 'large' | 'shower_only' | 'full_gut' | null;
  soffitRemovalCount: number;
  hasCastIronTub: boolean;
  hasWallRemoval: boolean;
  
  // Plumbing
  showerType: 'new' | 'relocate' | 'existing' | null;
  toiletAction: 'new' | 'swap' | 'reinstall' | 'relocate' | null;
  toiletRelocationDistance: number | null;
  tubDrainRelocate: boolean;
  tubDrainDistance: number | null;
  showerDrainType: 'standard' | 'linear' | null;
  vanityPlumbing: 'single' | 'double' | null;
  hasCapOffs: boolean;
  
  // Plumbing fixtures
  hasTubFiller: boolean;
  hasShowerTrimKit: boolean;
  faucetCount: number;
  hasFreestandingTub: boolean;
  hasSmartValve: boolean;
  extraShowerHeads: number;
  
  // Electrical
  recessedCanCount: number;
  vanityLightCount: number;
  outletCount: number;
  switchCount: number;
  hasDimmer: boolean;
  hasExhaustFan: boolean;
  hasUnderCabinetLighting: boolean;
  pendantCount: number;
  has220Line: boolean;
  
  // Framing
  newDoorwayCount: number;
  pocketDoorCount: number;
  wallsAdded: number;
  wallsRemoved: number;
  nicheCount: number;
  benchCount: number;
  hasClosetBuildout: boolean;
  hasDoorRelocation: boolean;
  hasDoorClosure: boolean;
  hasShowerEnlargement: boolean;
  
  // Tile
  wallTileSqft: number | null;
  floorTileSqft: number | null;
  showerFloorSqft: number | null;
  hasTubSurround: boolean;
  tubSurroundSqft: number | null;
  backsplashSqft: number | null;
  
  // Waterproofing
  hasShowerWaterproofing: boolean;
  hasTubWaterproofing: boolean;
  
  // Cabinetry
  vanitySize: number | null; // in inches
  hasLinenCabinet: boolean;
  linenCabinetCount: number;
  hasMedicineCabinet: boolean;
  medicineCabinetCount: number;
  kitchenCabinetLf: number | null;
  
  // Countertops
  countertopMaterial: 'quartz' | 'granite' | 'laminate' | null;
  countertopSqft: number | null;
  
  // Fixtures & Accessories
  mirrorCount: number;
  isLedMirror: boolean;
  hasToilet: boolean;
  tubType: 'freestanding' | 'alcove' | 'none' | null;
  towelBarCount: number;
  tpHolderCount: number;
  robeHookCount: number;
  grabBarCount: number;
  showerShelfCount: number;
  
  // Glass
  glassType: 'full_enclosure' | 'panel_only' | 'door_only' | '90_return' | 'none' | null;
  
  // Paint
  hasPaint: boolean;
  paintScope: 'patch' | 'full' | 'ceiling_only' | null;
  
  // Drywall/Ceiling
  hasCeilingTexture: boolean;
  drywallSqft: number | null;
  
  // Site protection
  hasFloorProtection: boolean;
  hasDustBarrier: boolean;
  
  // Flooring
  lvpSqft: number | null;
  hasFloorLeveling: boolean;
  
  // Custom items (not in pricing table)
  customItems: Array<{ description: string; quantity: number; unit: string; price: number }>;
  
  // Notes
  exclusions: string[];
  warnings: string[];
}

export const initialScopeState: ScopeExtractionState = {
  projectType: null,
  roomSqft: null,
  demoScope: null,
  soffitRemovalCount: 0,
  hasCastIronTub: false,
  hasWallRemoval: false,
  showerType: null,
  toiletAction: null,
  toiletRelocationDistance: null,
  tubDrainRelocate: false,
  tubDrainDistance: null,
  showerDrainType: null,
  vanityPlumbing: null,
  hasCapOffs: false,
  hasTubFiller: false,
  hasShowerTrimKit: false,
  faucetCount: 0,
  hasFreestandingTub: false,
  hasSmartValve: false,
  extraShowerHeads: 0,
  recessedCanCount: 0,
  vanityLightCount: 0,
  outletCount: 0,
  switchCount: 0,
  hasDimmer: false,
  hasExhaustFan: false,
  hasUnderCabinetLighting: false,
  pendantCount: 0,
  has220Line: false,
  newDoorwayCount: 0,
  pocketDoorCount: 0,
  wallsAdded: 0,
  wallsRemoved: 0,
  nicheCount: 0,
  benchCount: 0,
  hasClosetBuildout: false,
  hasDoorRelocation: false,
  hasDoorClosure: false,
  hasShowerEnlargement: false,
  wallTileSqft: null,
  floorTileSqft: null,
  showerFloorSqft: null,
  hasTubSurround: false,
  tubSurroundSqft: null,
  backsplashSqft: null,
  hasShowerWaterproofing: false,
  hasTubWaterproofing: false,
  vanitySize: null,
  hasLinenCabinet: false,
  linenCabinetCount: 0,
  hasMedicineCabinet: false,
  medicineCabinetCount: 0,
  kitchenCabinetLf: null,
  countertopMaterial: null,
  countertopSqft: null,
  mirrorCount: 0,
  isLedMirror: false,
  hasToilet: false,
  tubType: null,
  towelBarCount: 0,
  tpHolderCount: 0,
  robeHookCount: 0,
  grabBarCount: 0,
  showerShelfCount: 0,
  glassType: null,
  hasPaint: false,
  paintScope: null,
  hasCeilingTexture: false,
  drywallSqft: null,
  hasFloorProtection: false,
  hasDustBarrier: false,
  lvpSqft: null,
  hasFloorLeveling: false,
  customItems: [],
  exclusions: [],
  warnings: [],
};

// ============================================================
// EXTRACT SCOPE FROM USER MESSAGE
// Updates state based on keywords in user input
// ============================================================

export function extractScopeFromMessage(
  message: string,
  currentState: ScopeExtractionState
): ScopeExtractionState {
  const msg = message.toLowerCase();
  const state = { ...currentState };
  
  // Helper to extract numbers
  const extractNumber = (text: string, ...patterns: string[]): number | null => {
    for (const pattern of patterns) {
      const regex = new RegExp(`(\\d+)\\s*${pattern}`, 'i');
      const match = text.match(regex);
      if (match) return parseInt(match[1], 10);
      
      const reverseRegex = new RegExp(`${pattern}[:\\s]*(\\d+)`, 'i');
      const reverseMatch = text.match(reverseRegex);
      if (reverseMatch) return parseInt(reverseMatch[1], 10);
    }
    return null;
  };
  
  // Project type
  if (msg.includes('kitchen')) state.projectType = 'Kitchen';
  if (msg.includes('bathroom') || msg.includes('bath')) state.projectType = 'Bathroom';
  
  // Demo scope
  if (msg.includes('full gut') || msg.includes('gut it')) state.demoScope = 'full_gut';
  if (msg.includes('shower only') || msg.includes('just the shower')) state.demoScope = 'shower_only';
  if (msg.includes('master') || msg.includes('large bath')) state.demoScope = 'large';
  if (msg.includes('small bath') || msg.includes('guest bath') || msg.includes('half bath')) state.demoScope = 'small';
  
  // Soffit removal
  const soffitCount = extractNumber(msg, 'soffit', 'soffits');
  if (soffitCount) state.soffitRemovalCount = soffitCount;
  else if (msg.includes('soffit')) state.soffitRemovalCount = 1;
  
  // Cast iron tub
  if (msg.includes('cast iron') || msg.includes('castiron')) state.hasCastIronTub = true;
  
  // Wall removal
  if (msg.includes('remove wall') || msg.includes('wall removal') || msg.includes('tear down wall')) {
    state.hasWallRemoval = true;
  }
  
  // Plumbing - shower
  if (msg.includes('new shower')) state.showerType = 'new';
  if (msg.includes('relocate shower') || msg.includes('move shower')) state.showerType = 'relocate';
  
  // Plumbing - toilet
  if (msg.includes('new toilet')) {
    state.toiletAction = 'new';
    state.hasToilet = true;
  }
  if (msg.includes('keep toilet') || msg.includes('reuse toilet') || msg.includes('existing toilet')) {
    state.toiletAction = 'reinstall';
    state.hasToilet = true;
  }
  if (msg.includes('relocate toilet') || msg.includes('move toilet')) {
    state.toiletAction = 'relocate';
    state.hasToilet = true;
    const distance = extractNumber(msg, 'feet', 'ft', 'foot');
    if (distance) state.toiletRelocationDistance = distance;
  }
  if (msg.includes('swap toilet') || msg.includes('replace toilet')) {
    state.toiletAction = 'swap';
    state.hasToilet = true;
  }
  
  // Tub drain relocation
  if (msg.includes('relocate tub') || msg.includes('move tub drain') || msg.includes('tub drain')) {
    state.tubDrainRelocate = true;
    const distance = extractNumber(msg, 'feet', 'ft', 'foot');
    if (distance) state.tubDrainDistance = distance;
  }
  
  // Linear drain
  if (msg.includes('linear drain')) state.showerDrainType = 'linear';
  
  // Smart valve
  if (msg.includes('smart valve') || msg.includes('digital shower')) state.hasSmartValve = true;
  
  // Tub filler - CRITICAL: User specifically mentioned this
  if (msg.includes('tub filler') || msg.includes('tub spout') || msg.includes('filler')) {
    state.hasTubFiller = true;
  }
  
  // Shower trim kit
  if (msg.includes('trim kit') || msg.includes('shower trim')) state.hasShowerTrimKit = true;
  
  // Faucets - CRITICAL: User specifically mentioned this
  const faucetCount = extractNumber(msg, 'faucet', 'faucets');
  if (faucetCount) state.faucetCount = faucetCount;
  else if (msg.includes('faucet') && !msg.includes('no faucet')) state.faucetCount = Math.max(state.faucetCount, 1);
  
  // Extra shower heads
  const headCount = extractNumber(msg, 'head', 'heads', 'shower head');
  if (headCount && headCount > 1) state.extraShowerHeads = headCount - 1;
  if (msg.includes('rain head') || msg.includes('rainhead') || msg.includes('handheld')) {
    state.extraShowerHeads = Math.max(state.extraShowerHeads, 1);
  }
  
  // Freestanding tub
  if (msg.includes('freestanding') || msg.includes('free standing') || msg.includes('soaking tub')) {
    state.hasFreestandingTub = true;
    state.tubType = 'freestanding';
  }
  
  // Alcove tub
  if (msg.includes('alcove tub') || msg.includes('standard tub') || msg.includes('regular tub')) {
    state.tubType = 'alcove';
  }
  
  // Electrical - recessed cans
  const canCount = extractNumber(msg, 'can', 'cans', 'recessed', 'light', 'lights');
  if (canCount && (msg.includes('recessed') || msg.includes('can light'))) {
    state.recessedCanCount = canCount;
  }
  
  // Vanity lights
  const vanityLightCount = extractNumber(msg, 'vanity light', 'vanity lights', 'sconce', 'sconces');
  if (vanityLightCount) state.vanityLightCount = vanityLightCount;
  else if (msg.includes('vanity light') || msg.includes('sconce')) {
    state.vanityLightCount = Math.max(state.vanityLightCount, 2); // Default pair
  }
  
  // Pendants
  const pendantCount = extractNumber(msg, 'pendant', 'pendants');
  if (pendantCount) state.pendantCount = pendantCount;
  else if (msg.includes('pendant')) state.pendantCount = Math.max(state.pendantCount, 1);
  
  // Outlets
  const outletCount = extractNumber(msg, 'outlet', 'outlets');
  if (outletCount) state.outletCount = outletCount;
  else if (msg.includes('outlet') || msg.includes('some outlets')) state.outletCount = Math.max(state.outletCount, 2);
  
  // Exhaust fan
  if (msg.includes('exhaust') || msg.includes('fan') || msg.includes('vent fan')) state.hasExhaustFan = true;
  
  // Under cabinet lighting
  if (msg.includes('under cabinet') || msg.includes('undercabinet')) state.hasUnderCabinetLighting = true;
  
  // 220 line
  if (msg.includes('220') || msg.includes('electric range') || msg.includes('range electric')) state.has220Line = true;
  
  // Framing
  const doorwayCount = extractNumber(msg, 'doorway', 'doorways', 'door opening');
  if (doorwayCount) state.newDoorwayCount = doorwayCount;
  
  const pocketCount = extractNumber(msg, 'pocket door', 'pocket doors');
  if (pocketCount) state.pocketDoorCount = pocketCount;
  else if (msg.includes('pocket door')) state.pocketDoorCount = Math.max(state.pocketDoorCount, 1);
  
  // Niches
  const nicheCount = extractNumber(msg, 'niche', 'niches');
  if (nicheCount) state.nicheCount = nicheCount;
  else if (msg.includes('niche')) state.nicheCount = Math.max(state.nicheCount, 1);
  
  // Bench
  const benchCount = extractNumber(msg, 'bench', 'benches');
  if (benchCount) state.benchCount = benchCount;
  else if (msg.includes('bench') || msg.includes('seat')) state.benchCount = Math.max(state.benchCount, 1);
  
  // Door relocation
  if (msg.includes('move door') || msg.includes('relocate door')) state.hasDoorRelocation = true;
  
  // Door closure
  if (msg.includes('close door') || msg.includes('close off') || msg.includes('close the door')) state.hasDoorClosure = true;
  
  // Shower enlargement
  if (msg.includes('enlarge shower') || msg.includes('bigger shower') || msg.includes('expand shower')) {
    state.hasShowerEnlargement = true;
  }
  
  // Tile dimensions
  const wallTile = extractNumber(msg, 'wall tile', 'shower wall', 'wall sqft');
  if (wallTile) state.wallTileSqft = wallTile;
  
  const floorTile = extractNumber(msg, 'floor tile', 'floor sqft', 'main floor');
  if (floorTile) state.floorTileSqft = floorTile;
  
  const showerFloor = extractNumber(msg, 'shower floor');
  if (showerFloor) state.showerFloorSqft = showerFloor;
  
  // Backsplash
  const backsplash = extractNumber(msg, 'backsplash');
  if (backsplash) state.backsplashSqft = backsplash;
  else if (msg.includes('backsplash')) state.backsplashSqft = 30; // Default
  
  // Tub surround
  if (msg.includes('tub surround') || msg.includes('surround tile')) {
    state.hasTubSurround = true;
    const sqft = extractNumber(msg, 'sqft', 'square');
    if (sqft) state.tubSurroundSqft = sqft;
  }
  
  // Waterproofing
  if (msg.includes('waterproof') || msg.includes('redgard')) {
    state.hasShowerWaterproofing = true;
    if (msg.includes('tub')) state.hasTubWaterproofing = true;
  }
  
  // Vanity size
  const vanitySize = extractNumber(msg, '"', 'inch', 'in', 'vanity');
  if (vanitySize && vanitySize >= 24 && vanitySize <= 120) state.vanitySize = vanitySize;
  if (msg.includes('double vanity') && !state.vanitySize) state.vanitySize = 60;
  if (msg.includes('single vanity') && !state.vanitySize) state.vanitySize = 36;
  
  // Linen cabinet
  const linenCount = extractNumber(msg, 'linen', 'linen cabinet');
  if (linenCount) {
    state.hasLinenCabinet = true;
    state.linenCabinetCount = linenCount;
  } else if (msg.includes('linen cabinet') || msg.includes('linen closet')) {
    state.hasLinenCabinet = true;
    state.linenCabinetCount = 1;
  }
  
  // Medicine cabinet
  const medCount = extractNumber(msg, 'medicine cabinet', 'med cabinet');
  if (medCount) {
    state.hasMedicineCabinet = true;
    state.medicineCabinetCount = medCount;
  } else if (msg.includes('medicine cabinet')) {
    state.hasMedicineCabinet = true;
    state.medicineCabinetCount = 1;
  }
  
  // Kitchen cabinets
  const cabinetLf = extractNumber(msg, 'lf', 'linear feet', 'linear foot');
  if (cabinetLf && state.projectType === 'Kitchen') state.kitchenCabinetLf = cabinetLf;
  
  // Countertops
  if (msg.includes('quartz')) state.countertopMaterial = 'quartz';
  if (msg.includes('granite')) state.countertopMaterial = 'granite';
  if (msg.includes('laminate')) state.countertopMaterial = 'laminate';
  const counterSqft = extractNumber(msg, 'countertop', 'counter');
  if (counterSqft) state.countertopSqft = counterSqft;
  
  // Mirrors - CRITICAL: User specifically mentioned this
  const mirrorCount = extractNumber(msg, 'mirror', 'mirrors');
  if (mirrorCount) state.mirrorCount = mirrorCount;
  else if (msg.includes('mirror') && !msg.includes('no mirror')) state.mirrorCount = Math.max(state.mirrorCount, 1);
  
  // LED mirror
  if (msg.includes('led mirror') || msg.includes('backlit')) {
    state.isLedMirror = true;
    if (!state.mirrorCount) state.mirrorCount = 1;
  }
  
  // Accessories
  const towelCount = extractNumber(msg, 'towel bar', 'towel bars');
  if (towelCount) state.towelBarCount = towelCount;
  else if (msg.includes('towel bar')) state.towelBarCount = Math.max(state.towelBarCount, 1);
  
  const tpCount = extractNumber(msg, 'tp holder', 'toilet paper holder');
  if (tpCount) state.tpHolderCount = tpCount;
  else if (msg.includes('tp holder') || msg.includes('toilet paper')) state.tpHolderCount = Math.max(state.tpHolderCount, 1);
  
  const hookCount = extractNumber(msg, 'robe hook', 'hooks');
  if (hookCount) state.robeHookCount = hookCount;
  
  const grabCount = extractNumber(msg, 'grab bar', 'grab bars');
  if (grabCount) state.grabBarCount = grabCount;
  else if (msg.includes('grab bar')) state.grabBarCount = Math.max(state.grabBarCount, 1);
  
  const shelfCount = extractNumber(msg, 'shelf', 'shelves', 'shower shelf');
  if (shelfCount && msg.includes('shower')) state.showerShelfCount = shelfCount;
  
  // Glass
  if (msg.includes('frameless') || msg.includes('glass enclosure') || msg.includes('shower door')) {
    if (msg.includes('90') || msg.includes('corner')) state.glassType = '90_return';
    else if (msg.includes('panel only')) state.glassType = 'panel_only';
    else state.glassType = 'full_enclosure';
  }
  if (msg.includes('no glass') || msg.includes('shower curtain')) state.glassType = 'none';
  
  // Paint
  if (msg.includes('paint')) {
    state.hasPaint = true;
    if (msg.includes('full') || msg.includes('entire') || msg.includes('whole')) state.paintScope = 'full';
    else if (msg.includes('ceiling only')) state.paintScope = 'ceiling_only';
    else state.paintScope = 'patch';
  }
  
  // Drywall
  const drywallSqft = extractNumber(msg, 'drywall', 'sheetrock');
  if (drywallSqft) state.drywallSqft = drywallSqft;
  
  // Ceiling texture
  if (msg.includes('texture') || msg.includes('knockdown') || msg.includes('popcorn')) state.hasCeilingTexture = true;
  
  // Floor protection
  if (msg.includes('floor protection') || msg.includes('ramboard')) state.hasFloorProtection = true;
  
  // Dust barrier
  if (msg.includes('dust barrier') || msg.includes('zipwall')) state.hasDustBarrier = true;
  
  // LVP Flooring
  const lvpSqft = extractNumber(msg, 'lvp', 'vinyl', 'flooring');
  if (lvpSqft) state.lvpSqft = lvpSqft;
  else if (msg.includes('lvp') || msg.includes('vinyl floor')) state.lvpSqft = state.roomSqft || 50;
  
  // Floor leveling
  if (msg.includes('level floor') || msg.includes('floor leveling') || msg.includes('self level')) state.hasFloorLeveling = true;
  
  return state;
}

// ============================================================
// BUILD LINE ITEMS FROM SCOPE STATE
// This is the deterministic builder - no AI creativity here
// ============================================================

export function buildLineItemsFromScope(state: ScopeExtractionState): ExtractedLineItem[] {
  const lineItems: ExtractedLineItem[] = [];
  
  const addItem = (key: string, quantity: number, nameOverride?: string) => {
    const pricing = PRICING_DATABASE[key];
    if (!pricing || quantity <= 0) return;
    
    const name = nameOverride || formatItemName(key);
    const qty = pricing.perUnit ? quantity : 1;
    const ic = pricing.perUnit ? pricing.ic * quantity : pricing.ic;
    const cp = pricing.perUnit ? pricing.cp * quantity : pricing.cp;
    
    lineItems.push({
      name,
      quantity: qty,
      unit: pricing.unit,
      ic,
      cp,
      category: pricing.category,
    });
  };
  
  // ============ DEMOLITION ============
  if (state.demoScope) {
    switch (state.demoScope) {
      case 'shower_only':
        addItem('demo_shower_only', 1);
        break;
      case 'small':
        addItem('demo_small_bath', 1);
        break;
      case 'large':
        addItem('demo_large_bath', 1);
        break;
      case 'full_gut':
        if (state.projectType === 'Kitchen') addItem('demo_kitchen', 1);
        else addItem('demo_full_bath', 1);
        break;
      default:
        if (state.projectType === 'Kitchen') addItem('demo_kitchen', 1);
        else addItem('demo_small_bath', 1);
    }
    addItem('dumpster', 1);
  }
  
  if (state.soffitRemovalCount > 0) addItem('soffit_removal', state.soffitRemovalCount);
  if (state.hasCastIronTub) addItem('demo_cast_iron_tub', 1);
  if (state.hasWallRemoval) addItem('wall_removal', 1);
  
  // ============ PLUMBING ============
  if (state.showerType === 'new' || state.showerType === 'relocate') {
    addItem('plumbing_shower_standard', 1);
  }
  
  if (state.toiletAction === 'new' || state.toiletAction === 'swap') {
    addItem('plumbing_toilet_swap', 1);
  } else if (state.toiletAction === 'reinstall') {
    addItem('plumbing_toilet_reinstall', 1);
  } else if (state.toiletAction === 'relocate') {
    addItem('plumbing_toilet_relocation', 1);
  }
  
  if (state.tubDrainRelocate) addItem('plumbing_tub_drain_relocation', 1);
  if (state.showerDrainType === 'linear') addItem('plumbing_linear_drain', 1);
  if (state.hasSmartValve) addItem('plumbing_smart_valve', 1);
  if (state.hasFreestandingTub) addItem('plumbing_freestanding_tub', 1);
  if (state.extraShowerHeads > 0) addItem('plumbing_extra_head', state.extraShowerHeads);
  
  // ============ FIXTURES ============
  if (state.hasToilet && state.toiletAction !== 'reinstall') addItem('fixture_toilet', 1);
  if (state.hasTubFiller) addItem('fixture_tub_filler', 1, 'Tub Filler');
  if (state.hasShowerTrimKit) addItem('fixture_shower_trim_kit', 1);
  if (state.faucetCount > 0) addItem('fixture_faucet', state.faucetCount, `Faucet${state.faucetCount > 1 ? 's' : ''}`);
  
  // ============ ELECTRICAL ============
  if (state.recessedCanCount > 0) addItem('electrical_recessed_can', state.recessedCanCount);
  if (state.vanityLightCount > 0) addItem('electrical_vanity_light', state.vanityLightCount);
  if (state.pendantCount > 0) addItem('electrical_pendant', state.pendantCount);
  if (state.outletCount > 0) addItem('electrical_outlet', state.outletCount);
  if (state.hasExhaustFan) addItem('electrical_exhaust_fan', 1);
  if (state.hasUnderCabinetLighting) addItem('electrical_under_cabinet', 1);
  if (state.has220Line) addItem('electrical_220_line', 1);
  
  // ============ FRAMING ============
  if (state.nicheCount > 0) addItem('framing_niche', state.nicheCount, `Shower Niche${state.nicheCount > 1 ? 's' : ''}`);
  if (state.benchCount > 0) addItem('framing_bench', state.benchCount);
  if (state.pocketDoorCount > 0) addItem('framing_pocket_door', state.pocketDoorCount);
  if (state.hasDoorRelocation) addItem('framing_door_relocation', 1);
  if (state.hasDoorClosure) addItem('framing_door_closure', 1);
  if (state.hasShowerEnlargement) addItem('framing_shower_enlargement', 1);
  if (state.wallsAdded > 0) addItem('framing_new_wall', state.wallsAdded);
  
  // ============ TILE ============
  if (state.wallTileSqft && state.wallTileSqft > 0) {
    addItem('tile_wall', state.wallTileSqft, `Wall Tile (${state.wallTileSqft} sqft)`);
    addItem('allowance_tile_wall', state.wallTileSqft, `Tile Material - Walls ($6.50/sqft)`);
  }
  if (state.showerFloorSqft && state.showerFloorSqft > 0) {
    addItem('tile_shower_floor', state.showerFloorSqft, `Shower Floor Tile (${state.showerFloorSqft} sqft)`);
    addItem('allowance_tile_shower', state.showerFloorSqft, `Tile Material - Shower Floor ($12/sqft)`);
  }
  if (state.floorTileSqft && state.floorTileSqft > 0) {
    addItem('tile_main_floor', state.floorTileSqft, `Main Floor Tile (${state.floorTileSqft} sqft)`);
    addItem('allowance_tile_main', state.floorTileSqft, `Tile Material - Floor ($6.50/sqft)`);
  }
  if (state.backsplashSqft && state.backsplashSqft > 0) {
    addItem('tile_backsplash', state.backsplashSqft);
  }
  
  // Add waterproofing/cement board if tile work
  const totalTileSqft = (state.wallTileSqft || 0) + (state.showerFloorSqft || 0);
  if (totalTileSqft > 0 || state.hasShowerWaterproofing) {
    const sqft = totalTileSqft || 100;
    addItem('waterproofing', sqft, `Waterproofing (${sqft} sqft)`);
    addItem('cement_board', sqft, `Cement Board (${sqft} sqft)`);
  }
  
  // ============ CABINETRY ============
  if (state.vanitySize) {
    const sizeKey = state.vanitySize >= 96 ? '96' :
                    state.vanitySize >= 84 ? '84' :
                    state.vanitySize >= 72 ? '72' :
                    state.vanitySize >= 60 ? '60' :
                    state.vanitySize >= 48 ? '48' :
                    state.vanitySize >= 36 ? '36' : '30';
    addItem(`vanity_${sizeKey}`, 1, `${state.vanitySize}" Vanity`);
  }
  if (state.hasLinenCabinet) addItem('linen_cabinet', state.linenCabinetCount || 1);
  if (state.hasMedicineCabinet) addItem('medicine_cabinet', state.medicineCabinetCount || 1);
  if (state.kitchenCabinetLf && state.kitchenCabinetLf > 0) {
    addItem('cabinet_kitchen', state.kitchenCabinetLf, `Kitchen Cabinets (${state.kitchenCabinetLf} LF)`);
  }
  
  // ============ COUNTERTOPS ============
  if (state.countertopSqft && state.countertopSqft > 0) {
    addItem('quartz_fab_install', state.countertopSqft, `Quartz Countertop (${state.countertopSqft} sqft)`);
    addItem('allowance_quartz', 1, 'Quartz Material Allowance ($1,200/slab)');
  }
  
  // ============ ACCESSORIES ============
  if (state.mirrorCount > 0) {
    if (state.isLedMirror) {
      addItem('allowance_led_mirror', state.mirrorCount, `LED Mirror${state.mirrorCount > 1 ? 's' : ''}`);
      addItem('electrical_led_mirror', state.mirrorCount, 'LED Mirror Electrical');
    } else {
      addItem('mirror_standard', state.mirrorCount, `Mirror${state.mirrorCount > 1 ? 's' : ''}`);
    }
  }
  if (state.towelBarCount > 0) addItem('towel_bar', state.towelBarCount);
  if (state.tpHolderCount > 0) addItem('tp_holder', state.tpHolderCount);
  if (state.robeHookCount > 0) addItem('robe_hook', state.robeHookCount);
  if (state.grabBarCount > 0) addItem('grab_bar', state.grabBarCount);
  if (state.showerShelfCount > 0) addItem('shower_shelf', state.showerShelfCount);
  
  // ============ GLASS ============
  if (state.glassType && state.glassType !== 'none') {
    switch (state.glassType) {
      case 'full_enclosure':
        addItem('glass_door_panel', 1, 'Frameless Glass - Door + Panel');
        break;
      case 'panel_only':
        addItem('glass_panel_only', 1, 'Frameless Glass - Panel Only');
        break;
      case '90_return':
        addItem('glass_90_return', 1, 'Frameless Glass - 90° Return');
        break;
    }
  }
  
  // ============ PAINT ============
  if (state.hasPaint) {
    if (state.paintScope === 'full') {
      if (state.projectType === 'Kitchen') addItem('paint_full_kitchen', 1);
      else addItem('paint_full_bath', 1);
    } else if (state.paintScope === 'ceiling_only') {
      addItem('paint_ceiling', 1);
    } else {
      addItem('paint_patch', 1);
    }
  }
  
  // ============ DRYWALL ============
  if (state.drywallSqft && state.drywallSqft > 0) {
    addItem('drywall_large', state.drywallSqft);
  }
  
  // ============ FLOORING ============
  if (state.lvpSqft && state.lvpSqft > 0) {
    addItem('lvp_flooring', state.lvpSqft, `LVP Flooring (${state.lvpSqft} sqft)`);
  }
  if (state.hasFloorLeveling) addItem('floor_leveling', 1);
  
  // ============ SITE PROTECTION ============
  if (state.hasFloorProtection) {
    const sqft = state.roomSqft || 100;
    addItem('floor_protection', sqft);
  }
  if (state.hasDustBarrier) addItem('dust_barrier', 1);
  
  // ============ CUSTOM ITEMS ============
  for (const custom of state.customItems) {
    lineItems.push({
      name: custom.description,
      quantity: custom.quantity,
      unit: custom.unit as 'ea' | 'sqft' | 'lf',
      ic: custom.price * 0.58, // Estimate IC at 58%
      cp: custom.price,
      category: 'Custom',
    });
  }
  
  return lineItems;
}

// Helper to format item names
function formatItemName(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace('Sqft', '(sqft)')
    .replace('Lf', '(LF)');
}

// ============================================================
// CALCULATE TOTALS
// ============================================================

export function calculateTotals(lineItems: ExtractedLineItem[]): {
  totalIC: number;
  totalCP: number;
  margin: number;
  lowEstimate: number;
  highEstimate: number;
} {
  const totalIC = lineItems.reduce((sum, item) => sum + item.ic, 0);
  const totalCP = lineItems.reduce((sum, item) => sum + item.cp, 0);
  const margin = totalCP > 0 ? (totalCP - totalIC) / totalCP : 0;
  const lowEstimate = Math.round(totalCP * 0.95);
  const highEstimate = Math.round(totalCP * 1.10);
  
  return { totalIC, totalCP, margin, lowEstimate, highEstimate };
}

// ============================================================
// VERIFY COMPLETENESS
// Check if any mentioned items might be missing
// ============================================================

export function verifyCompleteness(
  userMessages: string[],
  state: ScopeExtractionState
): { missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];
  const allText = userMessages.join(' ').toLowerCase();
  
  // Check for mentioned items that might not be captured
  if (allText.includes('mirror') && state.mirrorCount === 0) {
    missing.push('Mirror(s) - mentioned but not captured');
  }
  if (allText.includes('tub filler') && !state.hasTubFiller) {
    missing.push('Tub filler - mentioned but not captured');
  }
  if (allText.includes('faucet') && state.faucetCount === 0) {
    missing.push('Faucet(s) - mentioned but not captured');
  }
  if ((allText.includes('move') || allText.includes('relocate')) && allText.includes('toilet') && state.toiletAction !== 'relocate') {
    warnings.push('Toilet relocation mentioned but not marked');
  }
  if (allText.includes('niche') && state.nicheCount === 0) {
    missing.push('Shower niche - mentioned but not captured');
  }
  if (allText.includes('bench') && state.benchCount === 0) {
    missing.push('Shower bench - mentioned but not captured');
  }
  
  return { missing, warnings };
}
