/**
 * INTELLIGENT BUNDLING SYSTEM
 * 
 * When users describe common project types, automatically include all related line items.
 * Bundles detect project intent and derivation rules auto-add related items.
 */

import { ScopeExtractionState, PRICING_DATABASE, ExtractedLineItem } from './deterministic-pricing';
import { PRICING_TABLE, findPricingItem } from './pricing-table-v2';
import { LineItem as V2LineItem } from './line-item-generator-v2';

// ============================================================
// BUNDLE INTERFACES
// ============================================================

export interface BundleItem {
  lineItem: string;
  quantitySource: string;  // which scope field determines qty
  condition?: string;      // optional condition to include
}

export interface Bundle {
  name: string;
  triggers: string[];  // phrases that activate this bundle
  includes: BundleItem[];
  askFor: string[];    // required info to complete bundle
  optional: string[];  // things to ask about
}

export interface DerivedItem {
  lineItem: string;
  pricingKey: string;
  quantity: number;
  reason: string;
}

// ============================================================
// BUNDLE DEFINITIONS
// ============================================================

export const BUNDLES: Record<string, Bundle> = {
  
  // ============ BATHROOM BUNDLES ============
  
  VANITY_SWAP: {
    name: "Vanity Swap",
    triggers: [
      "vanity swap",
      "replace vanity",
      "new vanity",
      "swap out the vanity",
      "demo and install vanity",
      "remove and replace vanity",
      "changing vanity",
      "swap the vanity"
    ],
    includes: [
      { lineItem: "Demo - Vanity", quantitySource: "vanityCount" },
      { lineItem: "Vanity", quantitySource: "vanityCount" },
      { lineItem: "Countertop", quantitySource: "countertopSqft" },
      { lineItem: "Undermount Sink Cutout", quantitySource: "vanityCount", condition: "undermountSinks" },
      { lineItem: "Plumbing - Vanity Connection", quantitySource: "vanityCount" },
      { lineItem: "Faucet", quantitySource: "faucetCount" },
      { lineItem: "Caulking/Sealing Final", quantitySource: "1" }
    ],
    askFor: ["vanitySize", "vanityCount", "countertopMaterial"],
    optional: ["faucetStyle", "sinkType"]
  },

  TOILET_SWAP: {
    name: "Toilet Swap",
    triggers: [
      "toilet swap",
      "replace toilet",
      "new toilet",
      "swap out toilet",
      "change toilet"
    ],
    includes: [
      { lineItem: "Plumbing - Toilet", quantitySource: "toiletCount" },
      { lineItem: "Toilet", quantitySource: "toiletCount" },
      { lineItem: "Caulking/Sealing Final", quantitySource: "1" }
    ],
    askFor: ["toiletCount"],
    optional: ["toiletStyle"]
  },

  SHOWER_REMODEL: {
    name: "Shower Remodel",
    triggers: [
      "shower remodel",
      "redo the shower",
      "new shower",
      "gut the shower",
      "retile shower",
      "shower redo",
      "shower renovation"
    ],
    includes: [
      { lineItem: "Demo - Shower", quantitySource: "1" },
      { lineItem: "Plumbing - Shower Standard", quantitySource: "1" },
      { lineItem: "Waterproofing", quantitySource: "waterproofingSqft" },
      { lineItem: "Cement Board", quantitySource: "waterproofingSqft" },
      { lineItem: "Tile - Wall", quantitySource: "wallTileSqft" },
      { lineItem: "Tile - Shower Floor", quantitySource: "showerFloorSqft" },
      { lineItem: "Shower Trim Kit", quantitySource: "1" },
      { lineItem: "Shower Niche", quantitySource: "nicheCount", condition: "hasNiche" },
      { lineItem: "Glass", quantitySource: "1", condition: "hasGlass" }
    ],
    askFor: ["wallTileSqft", "showerFloorSqft", "glassType"],
    optional: ["nicheCount", "drainType", "tileStyle"]
  },

  TUB_TO_SHOWER: {
    name: "Tub to Shower Conversion",
    triggers: [
      "tub to shower",
      "convert tub to shower",
      "remove tub add shower",
      "get rid of tub",
      "take out tub put in shower",
      "tub conversion"
    ],
    includes: [
      { lineItem: "Demo - Tub", quantitySource: "1" },
      { lineItem: "Plumbing - Tub to Shower Conversion", quantitySource: "1" },
      { lineItem: "Framing - Standard", quantitySource: "1" },
      { lineItem: "Waterproofing", quantitySource: "waterproofingSqft" },
      { lineItem: "Cement Board", quantitySource: "waterproofingSqft" },
      { lineItem: "Tile - Wall", quantitySource: "wallTileSqft" },
      { lineItem: "Tile - Shower Floor", quantitySource: "showerFloorSqft" },
      { lineItem: "Plumbing - Linear Drain", quantitySource: "1", condition: "hasLinearDrain" },
      { lineItem: "Shower Trim Kit", quantitySource: "1" },
      { lineItem: "Glass", quantitySource: "1" }
    ],
    askFor: ["wallTileSqft", "showerFloorSqft", "glassType"],
    optional: ["drainType", "nicheCount"]
  },

  FULL_BATH_GUT: {
    name: "Full Bathroom Gut Remodel",
    triggers: [
      "full gut",
      "gut remodel", 
      "complete remodel",
      "tear it all out",
      "start from scratch",
      "gut the bathroom",
      "full bathroom remodel",
      "full bath remodel",
      "complete bathroom"
    ],
    includes: [
      { lineItem: "Demo - Full Bath", quantitySource: "1" },
      { lineItem: "Dumpster", quantitySource: "1" },
      { lineItem: "Plumbing - Shower Standard", quantitySource: "1", condition: "hasShower" },
      { lineItem: "Plumbing - Toilet", quantitySource: "1" },
      { lineItem: "Plumbing - Vanity Connection", quantitySource: "vanityCount" },
      { lineItem: "Electrical - Small Package", quantitySource: "1" },
      { lineItem: "Waterproofing", quantitySource: "waterproofingSqft" },
      { lineItem: "Cement Board", quantitySource: "waterproofingSqft" },
      { lineItem: "Tile - Wall", quantitySource: "wallTileSqft" },
      { lineItem: "Tile - Main Floor", quantitySource: "floorTileSqft" },
      { lineItem: "Tile - Shower Floor", quantitySource: "showerFloorSqft", condition: "hasShower" },
      { lineItem: "Vanity", quantitySource: "vanityCount" },
      { lineItem: "Countertop", quantitySource: "countertopSqft" },
      { lineItem: "Toilet", quantitySource: "1" },
      { lineItem: "Faucet", quantitySource: "faucetCount" },
      { lineItem: "Shower Trim Kit", quantitySource: "1", condition: "hasShower" },
      { lineItem: "Mirror", quantitySource: "mirrorCount" },
      { lineItem: "Glass", quantitySource: "1", condition: "hasGlass" },
      { lineItem: "Paint - Full Bathroom", quantitySource: "1" },
      { lineItem: "Caulking/Sealing Final", quantitySource: "1" }
    ],
    askFor: ["vanitySize", "wallTileSqft", "floorTileSqft", "showerFloorSqft", "glassType"],
    optional: ["nicheCount", "recessedCans", "heatedFloor"]
  },

  MAJOR_BATH_REMODEL: {
    name: "Major Bathroom Remodel",
    triggers: [
      "major remodel",
      "big project",
      "moving plumbing",
      "layout changes",
      "reconfiguring",
      "major project",
      "major bathroom",
      "large remodel"
    ],
    includes: [
      { lineItem: "Demo - Large Bathroom", quantitySource: "1" },
      { lineItem: "Dumpster", quantitySource: "1" },
      { lineItem: "Framing - Standard", quantitySource: "1" },
      { lineItem: "Plumbing - Shower Standard", quantitySource: "1", condition: "hasShower" },
      { lineItem: "Plumbing - Toilet", quantitySource: "1" },
      { lineItem: "Plumbing - Vanity Connection", quantitySource: "vanityCount" },
      { lineItem: "Electrical - Small Package", quantitySource: "1" },
      { lineItem: "Waterproofing", quantitySource: "waterproofingSqft" },
      { lineItem: "Cement Board", quantitySource: "waterproofingSqft" },
      { lineItem: "Tile - Wall", quantitySource: "wallTileSqft" },
      { lineItem: "Tile - Main Floor", quantitySource: "floorTileSqft" },
      { lineItem: "Tile - Shower Floor", quantitySource: "showerFloorSqft", condition: "hasShower" },
      { lineItem: "Drywall", quantitySource: "drywallSqft" },
      { lineItem: "Vanity", quantitySource: "vanityCount" },
      { lineItem: "Countertop", quantitySource: "countertopSqft" },
      { lineItem: "Toilet", quantitySource: "1" },
      { lineItem: "Faucet", quantitySource: "faucetCount" },
      { lineItem: "Shower Trim Kit", quantitySource: "1", condition: "hasShower" },
      { lineItem: "Mirror", quantitySource: "mirrorCount" },
      { lineItem: "Glass", quantitySource: "1", condition: "hasGlass" },
      { lineItem: "Paint - Full Bathroom", quantitySource: "1" },
      { lineItem: "Caulking/Sealing Final", quantitySource: "1" }
    ],
    askFor: ["vanitySize", "wallTileSqft", "floorTileSqft", "layoutChanges"],
    optional: ["pocketDoors", "closetBuildout", "soffitRemoval", "ceilingTexture"]
  },

  // ============ KITCHEN BUNDLES ============

  KITCHEN_REFRESH: {
    name: "Kitchen Refresh",
    triggers: [
      "kitchen refresh",
      "update kitchen",
      "new countertops and backsplash",
      "counters and backsplash",
      "kitchen update"
    ],
    includes: [
      { lineItem: "Countertop", quantitySource: "countertopSqft" },
      { lineItem: "Tile - Backsplash", quantitySource: "backsplashSqft" },
      { lineItem: "Undermount Sink Cutout", quantitySource: "1" },
      { lineItem: "Cooktop Cutout", quantitySource: "1", condition: "hasCooktop" },
      { lineItem: "Kitchen Faucet", quantitySource: "1" },
      { lineItem: "Kitchen Sink", quantitySource: "1" },
      { lineItem: "Garbage Disposal Install", quantitySource: "1", condition: "hasDisposal" }
    ],
    askFor: ["countertopSqft", "backsplashSqft"],
    optional: ["faucetStyle", "sinkStyle"]
  },

  FULL_KITCHEN_REMODEL: {
    name: "Full Kitchen Remodel",
    triggers: [
      "full kitchen remodel",
      "gut kitchen",
      "new cabinets",
      "all new kitchen",
      "kitchen gut",
      "full kitchen"
    ],
    includes: [
      { lineItem: "Demo - Full Kitchen", quantitySource: "1" },
      { lineItem: "Dumpster", quantitySource: "1" },
      { lineItem: "Kitchen Cabinets", quantitySource: "kitchenCabinetLf" },
      { lineItem: "Countertop", quantitySource: "countertopSqft" },
      { lineItem: "Tile - Backsplash", quantitySource: "backsplashSqft" },
      { lineItem: "Electrical - Kitchen Package", quantitySource: "1" },
      { lineItem: "Kitchen Faucet", quantitySource: "1" },
      { lineItem: "Kitchen Sink", quantitySource: "1" },
      { lineItem: "Garbage Disposal", quantitySource: "1" },
      { lineItem: "Garbage Disposal Install", quantitySource: "1" },
      { lineItem: "Appliance Install - Standard", quantitySource: "1" },
      { lineItem: "Paint - Full Kitchen", quantitySource: "1" }
    ],
    askFor: ["kitchenCabinetLf", "countertopSqft", "backsplashSqft"],
    optional: ["undercabinetLighting", "panelUpgrade"]
  }
};

// ============================================================
// BUNDLE DETECTION
// ============================================================

export function detectBundles(userMessage: string): string[] {
  const detectedBundles: string[] = [];
  const messageLower = userMessage.toLowerCase();
  
  for (const [bundleKey, bundle] of Object.entries(BUNDLES)) {
    for (const trigger of bundle.triggers) {
      if (messageLower.includes(trigger)) {
        detectedBundles.push(bundleKey);
        break;  // Only add each bundle once
      }
    }
  }
  
  return detectedBundles;
}

export function getBundleByKey(key: string): Bundle | undefined {
  return BUNDLES[key];
}

// ============================================================
// AUTO-DERIVATION RULES
// ============================================================

interface DerivationRule {
  name: string;
  condition: (scope: ScopeExtractionState) => boolean;
  derive: (scope: ScopeExtractionState) => DerivedItem[];
}

const DERIVATION_RULES: DerivationRule[] = [
  
  // ===== COUNTERTOP DERIVATIONS =====
  {
    name: "Countertop from Vanity Size",
    condition: (scope) => scope.vanityCount > 0 && scope.vanitySize !== null && !scope.countertopSqft,
    derive: (scope) => {
      const vanityLF = (scope.vanitySize || 36) / 12;
      const sqftPerVanity = Math.ceil(vanityLF * 2 * 1.1);  // 22" depth + overhang
      const totalSqft = sqftPerVanity * scope.vanityCount;
      const material = scope.countertopMaterial || 'quartz';
      const pricingKey = material === 'granite' ? 'granite_countertop' : 
                         material === 'quartzite' ? 'quartzite_countertop' : 'quartz_countertop';
      return [{
        lineItem: `${material.charAt(0).toUpperCase() + material.slice(1)} Countertop (${totalSqft} sqft)`,
        pricingKey,
        quantity: totalSqft,
        reason: `Calculated from ${scope.vanityCount}x ${scope.vanitySize}" vanities`
      }];
    }
  },

  // ===== SINK DERIVATIONS =====
  {
    name: "Sink Cutouts from Undermount",
    condition: (scope) => scope.undermountSinks && scope.sinkCount === 0 && scope.vanityCount > 0,
    derive: (scope) => [{
      lineItem: `Undermount Sink Cutout${scope.vanityCount > 1 ? 's' : ''}`,
      pricingKey: 'undermount_sink_cutout',
      quantity: scope.sinkCount || scope.vanityCount,
      reason: "Undermount sinks require cutouts"
    }]
  },

  // ===== PLUMBING DERIVATIONS =====
  {
    name: "Vanity Plumbing from New Vanities",
    condition: (scope) => scope.vanityCount > 0 && !scope.vanityPlumbingConnections,
    derive: (scope) => [{
      lineItem: `Vanity Plumbing Connection${scope.vanityCount > 1 ? 's' : ''}`,
      pricingKey: 'plumbing_vanity_connection',
      quantity: scope.vanityCount,
      reason: "New vanities need plumbing connections"
    }]
  },

  {
    name: "Faucet Count from Vanities",
    condition: (scope) => scope.vanityCount > 0 && scope.faucetCount === 0,
    derive: (scope) => {
      // 60"+ vanities typically get 2 faucets each (double sink)
      const isDouble = scope.vanitySize && scope.vanitySize >= 60;
      const faucetCount = isDouble ? scope.vanityCount * 2 : scope.vanityCount;
      return [{
        lineItem: `Faucet${faucetCount > 1 ? 's' : ''}`,
        pricingKey: 'fixture_faucet',
        quantity: faucetCount,
        reason: `${isDouble ? "Double" : "Single"} vanities need faucets`
      }];
    }
  },

  // ===== WATERPROOFING DERIVATIONS =====
  {
    name: "Waterproofing from Shower Tile",
    condition: (scope) => ((scope.wallTileSqft || 0) > 0 || (scope.showerFloorSqft || 0) > 0) && !scope.hasShowerWaterproofing,
    derive: (scope) => {
      // Waterproof shower walls + floor + curb
      const wpSqft = (scope.wallTileSqft || 0) + (scope.showerFloorSqft || 0) + 10;  // +10 for curb
      return [{
        lineItem: `Waterproofing (${wpSqft} sqft)`,
        pricingKey: 'waterproofing',
        quantity: wpSqft,
        reason: "Shower areas require waterproofing"
      }];
    }
  },

  {
    name: "Cement Board from Shower Tile",
    condition: (scope) => ((scope.wallTileSqft || 0) > 0 || (scope.showerFloorSqft || 0) > 0),
    derive: (scope) => {
      const cbSqft = (scope.wallTileSqft || 0) + (scope.showerFloorSqft || 0);
      if (cbSqft === 0) return [];
      return [{
        lineItem: `Cement Board (${cbSqft} sqft)`,
        pricingKey: 'cement_board',
        quantity: cbSqft,
        reason: "Tile areas need backer board"
      }];
    }
  },

  // ===== ELECTRICAL DERIVATIONS =====
  {
    name: "Vanity Lights from Vanity Count",
    condition: (scope) => scope.vanityCount > 0 && scope.vanityLightCount === 0,
    derive: (scope) => [{
      lineItem: `Vanity Light${scope.vanityCount > 1 ? 's' : ''}`,
      pricingKey: 'electrical_vanity_light',
      quantity: scope.vanityCount,
      reason: "Each vanity typically needs a light"
    }]
  },

  // ===== FIXTURE DERIVATIONS =====
  {
    name: "Mirrors from Vanity Count",
    condition: (scope) => scope.vanityCount > 0 && scope.mirrorCount === 0,
    derive: (scope) => [{
      lineItem: `Mirror${scope.vanityCount > 1 ? 's' : ''}`,
      pricingKey: scope.isLedMirror ? 'mirror_led' : 'mirror_standard',
      quantity: scope.vanityCount,
      reason: "Each vanity typically needs a mirror"
    }]
  },

  {
    name: "Shower Trim from Shower Work",
    condition: (scope) => (scope.showerType === 'new' || scope.showerType === 'relocate') && !scope.hasShowerTrimKit,
    derive: (scope) => [{
      lineItem: "Shower Trim Kit",
      pricingKey: 'fixture_shower_trim_kit',
      quantity: 1,
      reason: "New shower plumbing needs trim kit"
    }]
  },

  // ===== FINISHING DERIVATIONS =====
  {
    name: "Caulking from Wet Areas",
    condition: (scope) => ((scope.wallTileSqft || 0) > 0 || scope.vanityCount > 0),
    derive: (scope) => [{
      lineItem: "Caulking/Sealing Final",
      pricingKey: 'caulking_sealing_final',
      quantity: 1,
      reason: "Wet areas and fixtures need final caulking"
    }]
  },

  // ===== DUMPSTER DERIVATIONS =====
  {
    name: "Dumpster from Demo Scope",
    condition: (scope) => scope.demoScope !== null && scope.demoScope !== 'shower_only',
    derive: (scope) => [{
      lineItem: "Dumpster",
      pricingKey: 'dumpster',
      quantity: 1,
      reason: "Demo work requires debris removal"
    }]
  }
];

// ============================================================
// APPLY DERIVATIONS
// ============================================================

export function applyDerivations(scope: ScopeExtractionState): DerivedItem[] {
  const derived: DerivedItem[] = [];
  const addedItems = new Set<string>(); // Prevent duplicates
  
  for (const rule of DERIVATION_RULES) {
    if (rule.condition(scope)) {
      const items = rule.derive(scope);
      for (const item of items) {
        if (!addedItems.has(item.pricingKey) && item.quantity > 0) {
          derived.push(item);
          addedItems.add(item.pricingKey);
        }
      }
    }
  }
  
  return derived;
}

// ============================================================
// CONVERT DERIVED ITEMS TO LINE ITEMS
// ============================================================

export function derivedToLineItems(derived: DerivedItem[]): ExtractedLineItem[] {
  const lineItems: ExtractedLineItem[] = [];
  
  for (const item of derived) {
    const pricing = PRICING_DATABASE[item.pricingKey];
    if (!pricing) {
      console.warn(`Missing pricing for derived item: ${item.pricingKey}`);
      continue;
    }
    
    const ic = pricing.perUnit ? pricing.ic * item.quantity : pricing.ic;
    const cp = pricing.perUnit ? pricing.cp * item.quantity : pricing.cp;
    
    lineItems.push({
      name: item.lineItem,
      quantity: item.quantity,
      unit: pricing.unit,
      ic,
      cp,
      category: pricing.category,
    });
  }
  
  return lineItems;
}

// ============================================================
// GET MISSING BUNDLE INFO
// ============================================================

export function getMissingBundleInfo(
  activeBundles: string[],
  scope: ScopeExtractionState
): string[] {
  const missing: string[] = [];
  
  for (const bundleKey of activeBundles) {
    const bundle = BUNDLES[bundleKey];
    if (!bundle) continue;
    
    for (const required of bundle.askFor) {
      switch (required) {
        case 'vanitySize':
          if (!scope.vanitySize) missing.push('vanity size (e.g., 60", 48")');
          break;
        case 'vanityCount':
          if (scope.vanityCount === 0) missing.push('number of vanities');
          break;
        case 'countertopMaterial':
          if (!scope.countertopMaterial) missing.push('countertop material (quartz, granite, etc.)');
          break;
        case 'wallTileSqft':
          if (!scope.wallTileSqft) missing.push('wall tile square footage');
          break;
        case 'floorTileSqft':
          if (!scope.floorTileSqft) missing.push('floor tile square footage');
          break;
        case 'showerFloorSqft':
          if (!scope.showerFloorSqft) missing.push('shower floor square footage');
          break;
        case 'glassType':
          if (!scope.glassType) missing.push('glass type (full enclosure, panel only, etc.)');
          break;
        case 'countertopSqft':
          if (!scope.countertopSqft && scope.vanityCount === 0) missing.push('countertop square footage');
          break;
        case 'backsplashSqft':
          if (!scope.backsplashSqft) missing.push('backsplash square footage');
          break;
        case 'kitchenCabinetLf':
          if (!scope.kitchenCabinetLf) missing.push('kitchen cabinet linear feet');
          break;
        case 'toiletCount':
          // Default to 1 if not specified
          break;
      }
    }
  }
  
  // Remove duplicates
  return [...new Set(missing)];
}

// ============================================================
// GENERATE BUNDLE ACKNOWLEDGMENT
// ============================================================

export function generateBundleAcknowledgment(bundleKeys: string[]): string {
  const bundleNames = bundleKeys.map(key => BUNDLES[key]?.name || key).join(' and ');
  
  const bundleDetails: string[] = [];
  for (const key of bundleKeys) {
    const bundle = BUNDLES[key];
    if (!bundle) continue;
    
    const items = bundle.includes.slice(0, 5).map(i => i.lineItem.toLowerCase()).join(', ');
    bundleDetails.push(`${bundle.name} includes ${items}${bundle.includes.length > 5 ? ', and more' : ''}`);
  }
  
  return `Got it - ${bundleNames}! ${bundleDetails.join('. ')}.`;
}

// ============================================================
// FORMAT LINE ITEMS FOR PREVIEW
// ============================================================

export function formatLineItemsPreview(
  lineItems: ExtractedLineItem[],
  derived: DerivedItem[]
): string {
  const categories: Record<string, ExtractedLineItem[]> = {};
  
  // Group by category
  for (const item of lineItems) {
    const cat = item.category || 'Other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  }
  
  const categoryOrder = [
    'Demolition', 'Site Protection', 'Framing', 'Plumbing', 'Electrical',
    'Tile', 'Flooring', 'Cabinetry', 'Countertops', 'Glass',
    'Fixtures', 'Paint', 'Drywall', 'Finish Carpentry', 'Accessories',
    'Material Allowances', 'Admin', 'Custom', 'Other'
  ];
  
  let preview = '';
  const total = lineItems.reduce((sum, item) => sum + item.cp, 0);
  
  for (const cat of categoryOrder) {
    const items = categories[cat];
    if (!items || items.length === 0) continue;
    
    preview += `\n**${cat}**\n`;
    for (const item of items) {
      const unitDisplay = item.quantity > 1 ? ` (${item.quantity} ${item.unit})` : '';
      preview += `• ${item.name}${unitDisplay} - $${item.cp.toLocaleString()}\n`;
    }
  }
  
  preview += `\n---\n**Total: $${total.toLocaleString()}**\n`;
  
  if (derived.length > 0) {
    preview += '\n*Auto-included:*\n';
    for (const d of derived) {
      preview += `• ${d.lineItem} - ${d.reason}\n`;
    }
  }
  
  return preview;
}
