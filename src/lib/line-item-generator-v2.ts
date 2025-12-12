// ============================================================================
// TKBSO ESTIMAITE - LINE ITEM GENERATOR v2.0
// ============================================================================
//
// This module handles the conversion from user conversation to line items.
// It uses STRICT MAPPING - no guessing, no substitutions.
//
// ============================================================================

import { 
  PRICING_TABLE, 
  findPricingItem, 
  calculateLineItemTotal,
  getVanityTier,
  calculateCountertopSqft,
  PricingItem 
} from './pricing-table-v2';

// ============================================================================
// TYPES
// ============================================================================

export interface LineItem {
  name: string;           // Exact key from PRICING_TABLE
  displayName: string;    // Same as name (no separate display)
  quantity: number;
  unit: string;
  cost: number;
  price: number;
  category: string;
  isAutoAdded: boolean;   // True if derived, false if explicitly mentioned
  reason?: string;        // Why this was auto-added
}

export interface ScopeState {
  // Project basics
  projectType: 'bathroom' | 'kitchen' | 'both' | null;
  projectSize: 'small' | 'medium' | 'large' | 'major' | null;
  
  // Demo
  demo: {
    fullBathGut: boolean;
    fullKitchenGut: boolean;
    vanityDemo: number;         // Count of vanities to demo
    toiletDemo: number;
    showerDemo: boolean;
    tubDemo: boolean;
    soffitDemo: number;
    cabinetDemo: boolean;
    countertopDemo: boolean;
    backsplashDemo: boolean;
  };
  
  // Plumbing
  plumbing: {
    showerRoughIn: boolean;
    showerExtraHeads: number;
    tubToShower: boolean;
    freestandingTub: boolean;
    toiletInstall: number;      // Count
    toiletRelocate: boolean;
    vanityConnection: number;   // Count - should match vanity count
    linearDrain: boolean;
    tubDrainRelocate: boolean;
    showerDrainRelocate: boolean;
    capOffs: number;
  };
  
  // Electrical
  electrical: {
    recessedLights: number;
    vanityLights: number;
    outlets: number;
    gfciOutlets: number;
    switches: number;
    dimmers: number;
    exhaustFan: number;
    heatedFloorSqft: number;
    usePackage: 'none' | 'small' | 'kitchen';
  };
  
  // Framing
  framing: {
    standardFraming: number;
    ponyWalls: number;
    pocketDoors: number;
    newDoorways: number;
    doorClosures: number;
    showerNiches: number;
    showerBench: boolean;
    closetBuildout: number;
    wallRemoval: boolean;
  };
  
  // Tile
  tile: {
    wallTileSqft: number;
    showerFloorSqft: number;
    mainFloorSqft: number;
    tubSurroundSqft: number;
    backsplashSqft: number;
    // Pattern modifiers
    herringbone: boolean;
    largeFormat: boolean;
    mosaic: boolean;
  };
  
  // Waterproofing
  waterproofing: {
    needed: boolean;
    sqft: number;             // If 0, will be calculated from tile sqft
  };
  
  // Cabinetry
  cabinetry: {
    vanities: Array<{
      sizeInches: number;
      quantity: number;
    }>;
    cabinetBoxes: number;     // For kitchen
    closetShelving: number;   // Count of closets
    closetCabinetry: number;
  };
  
  // Countertops
  countertops: {
    material: 'laminate' | 'quartz1' | 'quartz2' | 'quartz3' | 'granite' | 'quartzite' | 'marble' | null;
    sqft: number;             // If 0, will be calculated from vanity size
    sinkCutouts: number;
    faucetHoles: number;
    cooktopCutout: boolean;
    waterfall: boolean;
  };
  
  // Fixtures
  fixtures: {
    toilets: number;
    bathroomFaucets: number;
    kitchenFaucets: number;
    showerTrimKits: number;
    tubFillers: number;
    standardTubs: number;
    freestandingTubs: number;
    standardMirrors: number;
    ledMirrors: number;
    medicineCabinets: number;
    kitchenSinks: number;
    garbageDisposals: number;
    towelBars: number;
    tpHolders: number;
    grabBars: number;
  };
  
  // Glass
  glass: {
    type: 'none' | 'door' | 'panel' | 'door-panel' | '90-degree' | 'full-enclosure';
  };
  
  // Paint
  paint: {
    bathroom: 'none' | 'half' | 'full' | 'large';
    kitchen: boolean;
    closets: number;
    ceilingOnly: boolean;
    touchUp: boolean;
    doors: number;
  };
  
  // Drywall
  drywall: {
    patches: number;
    newSqft: number;
    ceilingTexture: boolean;
    smoothCeiling: boolean;
  };
  
  // Admin
  admin: {
    permit: boolean;
    design: boolean;
    hoaFee: boolean;
    asbestosTest: boolean;
    leadTest: boolean;
  };
  
  // Notes (non-priced items)
  notes: string[];
  exclusions: string[];
}

// ============================================================================
// INITIAL STATE
// ============================================================================

export function createInitialScope(): ScopeState {
  return {
    projectType: null,
    projectSize: null,
    demo: {
      fullBathGut: false,
      fullKitchenGut: false,
      vanityDemo: 0,
      toiletDemo: 0,
      showerDemo: false,
      tubDemo: false,
      soffitDemo: 0,
      cabinetDemo: false,
      countertopDemo: false,
      backsplashDemo: false,
    },
    plumbing: {
      showerRoughIn: false,
      showerExtraHeads: 0,
      tubToShower: false,
      freestandingTub: false,
      toiletInstall: 0,
      toiletRelocate: false,
      vanityConnection: 0,
      linearDrain: false,
      tubDrainRelocate: false,
      showerDrainRelocate: false,
      capOffs: 0,
    },
    electrical: {
      recessedLights: 0,
      vanityLights: 0,
      outlets: 0,
      gfciOutlets: 0,
      switches: 0,
      dimmers: 0,
      exhaustFan: 0,
      heatedFloorSqft: 0,
      usePackage: 'none',
    },
    framing: {
      standardFraming: 0,
      ponyWalls: 0,
      pocketDoors: 0,
      newDoorways: 0,
      doorClosures: 0,
      showerNiches: 0,
      showerBench: false,
      closetBuildout: 0,
      wallRemoval: false,
    },
    tile: {
      wallTileSqft: 0,
      showerFloorSqft: 0,
      mainFloorSqft: 0,
      tubSurroundSqft: 0,
      backsplashSqft: 0,
      herringbone: false,
      largeFormat: false,
      mosaic: false,
    },
    waterproofing: {
      needed: false,
      sqft: 0,
    },
    cabinetry: {
      vanities: [],
      cabinetBoxes: 0,
      closetShelving: 0,
      closetCabinetry: 0,
    },
    countertops: {
      material: null,
      sqft: 0,
      sinkCutouts: 0,
      faucetHoles: 0,
      cooktopCutout: false,
      waterfall: false,
    },
    fixtures: {
      toilets: 0,
      bathroomFaucets: 0,
      kitchenFaucets: 0,
      showerTrimKits: 0,
      tubFillers: 0,
      standardTubs: 0,
      freestandingTubs: 0,
      standardMirrors: 0,
      ledMirrors: 0,
      medicineCabinets: 0,
      kitchenSinks: 0,
      garbageDisposals: 0,
      towelBars: 0,
      tpHolders: 0,
      grabBars: 0,
    },
    glass: {
      type: 'none',
    },
    paint: {
      bathroom: 'none',
      kitchen: false,
      closets: 0,
      ceilingOnly: false,
      touchUp: false,
      doors: 0,
    },
    drywall: {
      patches: 0,
      newSqft: 0,
      ceilingTexture: false,
      smoothCeiling: false,
    },
    admin: {
      permit: false,
      design: false,
      hoaFee: false,
      asbestosTest: false,
      leadTest: false,
    },
    notes: [],
    exclusions: [],
  };
}

// ============================================================================
// LINE ITEM GENERATION
// ============================================================================

export function generateLineItems(scope: ScopeState): LineItem[] {
  const lineItems: LineItem[] = [];
  
  // Helper to add a line item
  const add = (
    pricingKey: string, 
    quantity: number, 
    isAutoAdded: boolean = false,
    reason?: string
  ) => {
    if (quantity <= 0) return;
    
    const found = findPricingItem(pricingKey);
    if (!found) {
      console.warn(`PRICING KEY NOT FOUND: "${pricingKey}"`);
      return;
    }
    
    const { key, item } = found;
    const totals = calculateLineItemTotal(key, quantity);
    if (!totals) return;
    
    lineItems.push({
      name: key,
      displayName: key,  // Same as name - no separate display
      quantity,
      unit: item.unit,
      cost: totals.cost,
      price: totals.price,
      category: item.category,
      isAutoAdded,
      reason,
    });
  };
  
  // ========================================================================
  // DEMOLITION
  // ========================================================================
  
  // Full gut demos (mutually exclusive with individual demos)
  if (scope.demo.fullBathGut) {
    if (scope.projectSize === 'major' || scope.projectSize === 'large') {
      add("Demo - Large Bathroom", 1);
    } else if (scope.projectSize === 'small') {
      add("Demo - Half Bath", 1);
    } else {
      add("Demo - Full Bath", 1);
    }
  } else {
    // Individual demos
    if (scope.demo.vanityDemo > 0) {
      add("Demo - Vanity", scope.demo.vanityDemo);
    }
    if (scope.demo.toiletDemo > 0) {
      add("Demo - Toilet", scope.demo.toiletDemo);
    }
    if (scope.demo.showerDemo) {
      add("Demo - Shower", 1);
    }
    if (scope.demo.tubDemo) {
      add("Demo - Tub", 1);
    }
  }
  
  if (scope.demo.fullKitchenGut) {
    add("Demo - Full Kitchen", 1);
  } else {
    if (scope.demo.cabinetDemo) {
      add("Demo - Cabinets Only", 1);
    }
    if (scope.demo.countertopDemo) {
      add("Demo - Countertops Only", 1);
    }
    if (scope.demo.backsplashDemo) {
      add("Demo - Backsplash", 1);
    }
  }
  
  if (scope.demo.soffitDemo > 0) {
    add("Demo - Soffits", scope.demo.soffitDemo);
  }
  
  // ========================================================================
  // PLUMBING
  // ========================================================================
  
  if (scope.plumbing.showerRoughIn) {
    add("Plumbing - Shower Rough-In", 1);
  }
  if (scope.plumbing.showerExtraHeads > 0) {
    add("Plumbing - Shower Valve Extra", scope.plumbing.showerExtraHeads);
  }
  if (scope.plumbing.tubToShower) {
    add("Plumbing - Tub to Shower Conversion", 1);
  }
  if (scope.plumbing.freestandingTub) {
    add("Plumbing - Freestanding Tub", 1);
  }
  if (scope.plumbing.toiletInstall > 0) {
    add("Plumbing - Toilet", scope.plumbing.toiletInstall);
  }
  if (scope.plumbing.toiletRelocate) {
    add("Plumbing - Toilet Relocation", 1);
  }
  if (scope.plumbing.vanityConnection > 0) {
    add("Plumbing - Vanity Connection", scope.plumbing.vanityConnection);
  }
  if (scope.plumbing.linearDrain) {
    add("Plumbing - Linear Drain", 1);
  }
  if (scope.plumbing.tubDrainRelocate) {
    add("Plumbing - Tub Drain Relocation", 1);
  }
  if (scope.plumbing.showerDrainRelocate) {
    add("Plumbing - Shower Drain Relocation", 1);
  }
  if (scope.plumbing.capOffs > 0) {
    add("Plumbing - Cap Off", scope.plumbing.capOffs);
  }
  
  // ========================================================================
  // ELECTRICAL
  // ========================================================================
  
  if (scope.electrical.usePackage === 'small') {
    add("Electrical - Small Bathroom Package", 1);
  } else if (scope.electrical.usePackage === 'kitchen') {
    add("Electrical - Kitchen Package", 1);
  } else {
    // Individual electrical items
    if (scope.electrical.recessedLights > 0) {
      add("Electrical - Recessed Light", scope.electrical.recessedLights);
    }
    if (scope.electrical.vanityLights > 0) {
      add("Electrical - Vanity Light", scope.electrical.vanityLights);
    }
    if (scope.electrical.outlets > 0) {
      add("Electrical - Outlet", scope.electrical.outlets);
    }
    if (scope.electrical.gfciOutlets > 0) {
      add("Electrical - GFCI Outlet", scope.electrical.gfciOutlets);
    }
    if (scope.electrical.switches > 0) {
      add("Electrical - Switch", scope.electrical.switches);
    }
    if (scope.electrical.dimmers > 0) {
      add("Electrical - Dimmer", scope.electrical.dimmers);
    }
  }
  if (scope.electrical.exhaustFan > 0) {
    add("Electrical - Exhaust Fan", scope.electrical.exhaustFan);
  }
  if (scope.electrical.heatedFloorSqft > 0) {
    add("Electrical - Heated Floor", scope.electrical.heatedFloorSqft);
  }
  
  // ========================================================================
  // FRAMING
  // ========================================================================
  
  if (scope.framing.standardFraming > 0) {
    add("Framing - Standard", scope.framing.standardFraming);
  }
  if (scope.framing.ponyWalls > 0) {
    add("Framing - Pony Wall", scope.framing.ponyWalls);
  }
  if (scope.framing.pocketDoors > 0) {
    add("Framing - Pocket Door", scope.framing.pocketDoors);
  }
  if (scope.framing.newDoorways > 0) {
    add("Framing - New Doorway", scope.framing.newDoorways);
  }
  if (scope.framing.doorClosures > 0) {
    add("Framing - Door Closure", scope.framing.doorClosures);
  }
  if (scope.framing.showerNiches > 0) {
    add("Shower Niche", scope.framing.showerNiches);
  }
  if (scope.framing.showerBench) {
    add("Shower Bench", 1);
  }
  if (scope.framing.closetBuildout > 0) {
    add("Closet Buildout", scope.framing.closetBuildout);
  }
  if (scope.framing.wallRemoval) {
    add("Wall Removal", 1);
  }
  
  // ========================================================================
  // TILE
  // ========================================================================
  
  if (scope.tile.wallTileSqft > 0) {
    add("Tile - Wall", scope.tile.wallTileSqft);
  }
  if (scope.tile.showerFloorSqft > 0) {
    add("Tile - Shower Floor", scope.tile.showerFloorSqft);
  }
  if (scope.tile.mainFloorSqft > 0) {
    add("Tile - Main Floor", scope.tile.mainFloorSqft);
  }
  if (scope.tile.tubSurroundSqft > 0) {
    add("Tile - Tub Surround", scope.tile.tubSurroundSqft);
  }
  if (scope.tile.backsplashSqft > 0) {
    add("Tile - Backsplash", scope.tile.backsplashSqft);
  }
  
  // Pattern modifiers (add to existing tile sqft)
  if (scope.tile.herringbone) {
    const totalTileSqft = scope.tile.wallTileSqft + scope.tile.mainFloorSqft;
    if (totalTileSqft > 0) {
      add("Tile - Herringbone Pattern", totalTileSqft, true, "Herringbone pattern premium");
    }
  }
  if (scope.tile.largeFormat) {
    const totalTileSqft = scope.tile.mainFloorSqft;
    if (totalTileSqft > 0) {
      add("Tile - Large Format", totalTileSqft, true, "Large format tile premium");
    }
  }
  
  // ========================================================================
  // WATERPROOFING
  // ========================================================================
  
  // Auto-calculate waterproofing if shower/tub work is being done
  if (scope.waterproofing.needed || scope.tile.wallTileSqft > 0 || scope.tile.showerFloorSqft > 0) {
    let wpSqft = scope.waterproofing.sqft;
    if (wpSqft === 0) {
      // Calculate from tile areas
      wpSqft = scope.tile.wallTileSqft + scope.tile.showerFloorSqft;
      if (wpSqft > 0) {
        wpSqft += 10; // Add for curb/transitions
      }
    }
    if (wpSqft > 0) {
      add("Waterproofing", wpSqft, scope.waterproofing.sqft === 0, "Waterproofing for wet areas");
    }
  }
  
  // ========================================================================
  // CABINETRY
  // ========================================================================
  
  // Vanities
  for (const vanity of scope.cabinetry.vanities) {
    const tierName = getVanityTier(vanity.sizeInches);
    add(tierName, vanity.quantity);
  }
  
  // Kitchen cabinets
  if (scope.cabinetry.cabinetBoxes > 0) {
    add("Cabinet - Per Box", scope.cabinetry.cabinetBoxes);
    add("Cabinet Install Labor", scope.cabinetry.cabinetBoxes, true, "Cabinet installation labor");
  }
  
  // Closet
  if (scope.cabinetry.closetShelving > 0) {
    add("Closet Shelving", scope.cabinetry.closetShelving);
  }
  if (scope.cabinetry.closetCabinetry > 0) {
    add("Closet Cabinetry", scope.cabinetry.closetCabinetry);
  }
  
  // ========================================================================
  // COUNTERTOPS
  // ========================================================================
  
  if (scope.countertops.material) {
    // Calculate sqft if not provided
    let ctSqft = scope.countertops.sqft;
    if (ctSqft === 0 && scope.cabinetry.vanities.length > 0) {
      // Calculate from vanity sizes
      for (const vanity of scope.cabinetry.vanities) {
        ctSqft += calculateCountertopSqft(vanity.sizeInches) * vanity.quantity;
      }
    }
    
    if (ctSqft > 0) {
      const materialMap: Record<string, string> = {
        'laminate': 'Countertop - Laminate',
        'quartz1': 'Countertop - Quartz Level 1',
        'quartz2': 'Countertop - Quartz Level 2',
        'quartz3': 'Countertop - Quartz Level 3',
        'granite': 'Countertop - Granite',
        'quartzite': 'Countertop - Quartzite',
        'marble': 'Countertop - Marble',
      };
      const ctKey = materialMap[scope.countertops.material];
      if (ctKey) {
        add(ctKey, ctSqft, scope.countertops.sqft === 0, `Calculated from vanity sizes`);
      }
    }
  }
  
  // Countertop add-ons
  if (scope.countertops.sinkCutouts > 0) {
    add("Sink Cutout - Undermount", scope.countertops.sinkCutouts);
  }
  if (scope.countertops.faucetHoles > 0) {
    add("Faucet Hole", scope.countertops.faucetHoles);
  }
  if (scope.countertops.cooktopCutout) {
    add("Cooktop Cutout", 1);
  }
  if (scope.countertops.waterfall) {
    add("Waterfall Edge", 1);
  }
  
  // ========================================================================
  // FIXTURES
  // ========================================================================
  
  if (scope.fixtures.toilets > 0) {
    add("Toilet", scope.fixtures.toilets);
  }
  if (scope.fixtures.bathroomFaucets > 0) {
    add("Faucet - Bathroom", scope.fixtures.bathroomFaucets);
  }
  if (scope.fixtures.kitchenFaucets > 0) {
    add("Faucet - Kitchen", scope.fixtures.kitchenFaucets);
  }
  if (scope.fixtures.showerTrimKits > 0) {
    add("Shower Trim Kit", scope.fixtures.showerTrimKits);
  }
  if (scope.fixtures.tubFillers > 0) {
    add("Tub Filler", scope.fixtures.tubFillers);
  }
  if (scope.fixtures.standardTubs > 0) {
    add("Tub - Standard", scope.fixtures.standardTubs);
  }
  if (scope.fixtures.freestandingTubs > 0) {
    add("Tub - Freestanding", scope.fixtures.freestandingTubs);
  }
  if (scope.fixtures.standardMirrors > 0) {
    add("Mirror - Standard", scope.fixtures.standardMirrors);
  }
  if (scope.fixtures.ledMirrors > 0) {
    add("Mirror - LED", scope.fixtures.ledMirrors);
  }
  if (scope.fixtures.medicineCabinets > 0) {
    add("Medicine Cabinet", scope.fixtures.medicineCabinets);
  }
  if (scope.fixtures.kitchenSinks > 0) {
    add("Kitchen Sink", scope.fixtures.kitchenSinks);
  }
  if (scope.fixtures.garbageDisposals > 0) {
    add("Garbage Disposal", scope.fixtures.garbageDisposals);
    add("Garbage Disposal Install", scope.fixtures.garbageDisposals, true, "Disposal installation");
  }
  if (scope.fixtures.towelBars > 0) {
    add("Towel Bar", scope.fixtures.towelBars);
  }
  if (scope.fixtures.tpHolders > 0) {
    add("Toilet Paper Holder", scope.fixtures.tpHolders);
  }
  if (scope.fixtures.grabBars > 0) {
    add("Grab Bar", scope.fixtures.grabBars);
  }
  
  // ========================================================================
  // GLASS
  // ========================================================================
  
  switch (scope.glass.type) {
    case 'door':
      add("Glass - Door Only", 1);
      break;
    case 'panel':
      add("Glass - Panel Only", 1);
      break;
    case 'door-panel':
      add("Glass - Door + Panel", 1);
      break;
    case '90-degree':
      add("Glass - 90 Degree Return", 1);
      break;
    case 'full-enclosure':
      add("Glass - Full Enclosure", 1);
      break;
  }
  
  // ========================================================================
  // PAINT
  // ========================================================================
  
  switch (scope.paint.bathroom) {
    case 'half':
      add("Paint - Half Bath", 1);
      break;
    case 'full':
      add("Paint - Full Bath", 1);
      break;
    case 'large':
      add("Paint - Large Bath", 1);
      break;
  }
  
  if (scope.paint.kitchen) {
    add("Paint - Kitchen", 1);
  }
  if (scope.paint.closets > 0) {
    add("Paint - Closet", scope.paint.closets);
  }
  if (scope.paint.ceilingOnly) {
    add("Paint - Ceiling", 1);
  }
  if (scope.paint.touchUp) {
    add("Paint - Touch Up", 1);
  }
  if (scope.paint.doors > 0) {
    add("Paint - Door", scope.paint.doors);
  }
  
  // ========================================================================
  // DRYWALL
  // ========================================================================
  
  if (scope.drywall.patches > 0) {
    add("Drywall - Patch", scope.drywall.patches);
  }
  if (scope.drywall.newSqft > 0) {
    add("Drywall - New", scope.drywall.newSqft);
  }
  if (scope.drywall.ceilingTexture) {
    add("Ceiling Texture", 1);
  }
  if (scope.drywall.smoothCeiling) {
    add("Ceiling Texture - Smooth", 1);
  }
  
  // ========================================================================
  // ADMIN
  // ========================================================================
  
  if (scope.admin.permit) {
    add("Permit Fee", 1);
  }
  if (scope.admin.design) {
    add("Design Fee", 1);
  }
  if (scope.admin.hoaFee) {
    add("HOA Approval Fee", 1);
  }
  if (scope.admin.asbestosTest) {
    add("Asbestos Test", 1);
  }
  if (scope.admin.leadTest) {
    add("Lead Paint Test", 1);
  }
  
  // ========================================================================
  // AUTO-ADD FINAL CAULKING
  // ========================================================================
  
  // If any wet area work is being done, add final caulking
  const hasWetWork = scope.tile.wallTileSqft > 0 || 
                     scope.tile.showerFloorSqft > 0 || 
                     scope.cabinetry.vanities.length > 0 ||
                     scope.fixtures.toilets > 0;
  
  if (hasWetWork) {
    add("Final Caulking", 1, true, "Final caulking for wet areas");
  }
  
  return lineItems;
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  severity: 'warning' | 'error';
}

export function validateScope(scope: ScopeState, userMessages: string[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const allUserText = userMessages.join(' ').toLowerCase();
  
  // Check: If user mentioned quantities, are they in scope?
  const quantityPatterns = [
    { pattern: /(\d+)\s*vanit(?:y|ies)/gi, field: 'cabinetry.vanities' },
    { pattern: /(\d+)\s*toilet/gi, field: 'fixtures.toilets' },
    { pattern: /(\d+)\s*faucet/gi, field: 'fixtures.bathroomFaucets' },
    { pattern: /(\d+)\s*sink/gi, field: 'countertops.sinkCutouts' },
    { pattern: /(\d+)\s*mirror/gi, field: 'fixtures.standardMirrors' },
    { pattern: /(\d+)\s*(?:can|recessed)/gi, field: 'electrical.recessedLights' },
  ];
  
  for (const { pattern, field } of quantityPatterns) {
    const match = allUserText.match(pattern);
    if (match) {
      const num = parseInt(match[0]);
      if (!isNaN(num) && num > 0) {
        // Check if this quantity is captured
        const fieldValue = getNestedValue(scope, field);
        if (fieldValue === 0 || fieldValue === undefined) {
          errors.push({
            field,
            message: `User mentioned "${match[0]}" but this wasn't captured in scope`,
            severity: 'error'
          });
        }
      }
    }
  }
  
  // Check: Did we add items the user never mentioned?
  const itemChecks = [
    { keyword: 'toilet', fields: ['fixtures.toilets', 'plumbing.toiletInstall', 'demo.toiletDemo'] },
    { keyword: 'shower', fields: ['plumbing.showerRoughIn', 'demo.showerDemo', 'tile.wallTileSqft'] },
    { keyword: 'tub', fields: ['fixtures.standardTubs', 'fixtures.freestandingTubs', 'demo.tubDemo'] },
  ];
  
  for (const { keyword, fields } of itemChecks) {
    const userMentioned = allUserText.includes(keyword);
    const scopeHasValue = fields.some(f => {
      const val = getNestedValue(scope, f);
      return val && val !== 0 && val !== false;
    });
    
    if (scopeHasValue && !userMentioned) {
      errors.push({
        field: fields[0],
        message: `Scope includes "${keyword}" but user never mentioned it`,
        severity: 'error'
      });
    }
  }
  
  // Check: Vanity count should match plumbing connections
  const totalVanities = scope.cabinetry.vanities.reduce((sum, v) => sum + v.quantity, 0);
  if (totalVanities > 0 && scope.plumbing.vanityConnection === 0) {
    errors.push({
      field: 'plumbing.vanityConnection',
      message: `${totalVanities} vanities but no plumbing connections specified`,
      severity: 'warning'
    });
  }
  
  // Check: Countertop sqft should be reasonable for vanity size
  if (scope.countertops.sqft > 0 && scope.cabinetry.vanities.length > 0) {
    let expectedSqft = 0;
    for (const v of scope.cabinetry.vanities) {
      expectedSqft += calculateCountertopSqft(v.sizeInches) * v.quantity;
    }
    if (Math.abs(scope.countertops.sqft - expectedSqft) > expectedSqft * 0.3) {
      errors.push({
        field: 'countertops.sqft',
        message: `Countertop sqft (${scope.countertops.sqft}) seems off for vanity sizes (expected ~${expectedSqft})`,
        severity: 'warning'
      });
    }
  }
  
  return errors;
}

// Helper to get nested object value
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// ============================================================================
// CALCULATE TOTALS
// ============================================================================

export function calculateEstimateTotals(lineItems: LineItem[]): {
  totalCost: number;
  totalPrice: number;
  margin: number;
  marginPercent: number;
} {
  const totalCost = lineItems.reduce((sum, item) => sum + item.cost, 0);
  const totalPrice = lineItems.reduce((sum, item) => sum + item.price, 0);
  const margin = totalPrice - totalCost;
  const marginPercent = totalPrice > 0 ? (margin / totalPrice) * 100 : 0;
  
  return {
    totalCost: Math.round(totalCost * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    margin: Math.round(margin * 100) / 100,
    marginPercent: Math.round(marginPercent * 10) / 10,
  };
}

// ============================================================================
// FORMAT FOR DISPLAY
// ============================================================================

export function formatLineItemsForReview(lineItems: LineItem[]): string {
  const totals = calculateEstimateTotals(lineItems);
  
  // Group by category
  const byCategory: Record<string, LineItem[]> = {};
  for (const item of lineItems) {
    if (!byCategory[item.category]) {
      byCategory[item.category] = [];
    }
    byCategory[item.category].push(item);
  }
  
  const categoryOrder = ['demo', 'framing', 'plumbing', 'electrical', 'tile', 'cabinetry', 'countertops', 'fixtures', 'glass', 'paint', 'trim', 'doors', 'mechanical', 'admin', 'allowance'];
  const categoryLabels: Record<string, string> = {
    demo: 'Demolition & Prep',
    framing: 'Framing & Structural',
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    tile: 'Tile & Flooring',
    cabinetry: 'Cabinetry & Vanities',
    countertops: 'Countertops',
    fixtures: 'Fixtures & Accessories',
    glass: 'Glass',
    paint: 'Paint & Drywall',
    trim: 'Trim & Millwork',
    doors: 'Doors',
    mechanical: 'Mechanicals',
    admin: 'Admin & Fees',
    allowance: 'Material Allowances',
  };
  
  let output = `📋 **Estimate Review - ${lineItems.length} line items**\n\n`;
  
  for (const cat of categoryOrder) {
    if (byCategory[cat] && byCategory[cat].length > 0) {
      output += `**${categoryLabels[cat] || cat}**\n`;
      for (const item of byCategory[cat]) {
        const qtyStr = `${item.quantity} ${item.unit}`;
        const priceStr = `$${item.price.toLocaleString()}`;
        const autoTag = item.isAutoAdded ? ' *(auto)*' : '';
        output += `• ${item.displayName} (${qtyStr}) - ${priceStr}${autoTag}\n`;
      }
      output += '\n';
    }
  }
  
  output += `---\n`;
  output += `**Total: $${totals.totalPrice.toLocaleString()}**\n`;
  output += `Internal Cost: $${totals.totalCost.toLocaleString()} | Margin: ${totals.marginPercent}%\n`;
  
  // Show auto-added items explanation
  const autoItems = lineItems.filter(i => i.isAutoAdded);
  if (autoItems.length > 0) {
    output += `\n*Automatically included:*\n`;
    for (const item of autoItems) {
      output += `• ${item.displayName}: ${item.reason}\n`;
    }
  }
  
  return output;
}

// Re-export from pricing table
export { PRICING_TABLE, findPricingItem, calculateLineItemTotal, getVanityTier, calculateCountertopSqft } from './pricing-table-v2';
export type { PricingItem } from './pricing-table-v2';
