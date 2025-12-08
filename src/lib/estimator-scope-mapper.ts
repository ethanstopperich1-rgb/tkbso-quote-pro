// Estimator scope-to-line-item mapping and validation

export interface MappedLineItem {
  category: string;
  item: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface ConversationState {
  phase: 'project_type' | 'scope_gathering' | 'materials' | 'client_details' | 'review' | 'complete';
  projectType: 'Kitchen' | 'Bathroom' | null;
  scopeItems: string[];
  materialsConfirmed: boolean;
  questionsAsked: string[];
  readyForQuote: boolean;
  clientDetails: {
    name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  clientDetailsSkipped: boolean;
  dimensions?: {
    roomSqft?: number;
    showerSqft?: number;
    showerWallSqft?: number;
    countertopSqft?: number;
    cabinetLf?: number;
  };
}

export const initialConversationState: ConversationState = {
  phase: 'project_type',
  projectType: null,
  scopeItems: [],
  materialsConfirmed: false,
  questionsAsked: [],
  readyForQuote: false,
  clientDetails: {
    name: null,
    phone: null,
    email: null,
    address: null,
  },
  clientDetailsSkipped: false,
};

// Extract estimated square footage from state or defaults
function estimateSquareFootage(state: ConversationState): number {
  if (state.dimensions?.roomSqft) return state.dimensions.roomSqft;
  if (state.projectType === 'Kitchen') return 150;
  if (state.projectType === 'Bathroom') return 50;
  return 100;
}

// Estimate cabinet linear feet based on kitchen size
function estimateKitchenLinearFeet(state: ConversationState): number {
  if (state.dimensions?.cabinetLf) return state.dimensions.cabinetLf;
  const sqft = state.dimensions?.roomSqft || 150;
  if (sqft < 120) return 18;
  if (sqft < 200) return 24;
  return 32;
}

// Estimate project duration in weeks
function estimateWeeks(state: ConversationState): number {
  if (state.projectType === 'Kitchen') return 4;
  if (state.projectType === 'Bathroom') return 3;
  return 3;
}

// Extract numbers from text
function extractNumber(text: string, context: string): number | null {
  const patterns = [
    new RegExp(`(\\d+)\\s*${context}`, 'i'),
    new RegExp(`${context}[:\\s]*(\\d+)`, 'i'),
    /(\d+)\s*(sqft|sq\s*ft|square\s*feet)/i,
    /(\d+)\s*(lf|linear\s*feet)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Map scope description to line items
 */
export function mapScopeToLineItems(
  scopeDescription: string,
  state: ConversationState
): MappedLineItem[] {
  const lineItems: MappedLineItem[] = [];
  const scope = scopeDescription.toLowerCase();

  // ============ SITE PROTECTION & SETUP ============
  if (scope.includes('floor protection') || scope.includes('protection') || scope.includes('ramboard')) {
    lineItems.push({
      category: 'Site Protection & Setup',
      item: 'Heavy Duty Floor Protection (Ramboard)',
      quantity: estimateSquareFootage(state),
      unit: 'sqft',
    });
  }

  if (scope.includes('air scrubber') || scope.includes('negative air') || scope.includes('hepa')) {
    lineItems.push({
      category: 'Site Protection & Setup',
      item: 'Air Scrubber Rental (HEPA)',
      quantity: estimateWeeks(state),
      unit: 'ea',
      notes: 'Weekly rental',
    });
  }

  if (scope.includes('dust barrier') || scope.includes('zipwall')) {
    lineItems.push({
      category: 'Site Protection & Setup',
      item: 'Dust Barriers (ZipWall)',
      quantity: 1,
      unit: 'ea',
    });
  }

  // ============ DEMOLITION ============
  if (scope.includes('demo') || scope.includes('remove') || scope.includes('tear out') || scope.includes('gut')) {
    if (state.projectType === 'Kitchen') {
      lineItems.push({
        category: 'Standard Demolition',
        item: 'Full Kitchen Gut (Standard)',
        quantity: 1,
        unit: 'ea',
      });
    } else if (state.projectType === 'Bathroom') {
      if (scope.includes('shower') && scope.includes('only')) {
        lineItems.push({
          category: 'Standard Demolition',
          item: 'Selective Demo - Shower Area',
          quantity: 1,
          unit: 'ea',
        });
      } else if (scope.includes('master') || scope.includes('large')) {
        lineItems.push({
          category: 'Standard Demolition',
          item: 'Full Demo - Master Bathroom',
          quantity: 1,
          unit: 'ea',
        });
      } else {
        lineItems.push({
          category: 'Standard Demolition',
          item: 'Full Demo - Standard Bathroom',
          quantity: 1,
          unit: 'ea',
        });
      }
    }
  }

  // ============ CABINETRY & VANITIES ============
  if ((scope.includes('cabinet') && state.projectType === 'Kitchen') || scope.includes('cabinet package')) {
    const lf = extractNumber(scope, 'cabinet') || extractNumber(scope, 'lf') || estimateKitchenLinearFeet(state);
    lineItems.push({
      category: 'Cabinetry & Vanities',
      item: 'Cabinets - Kitchen (LF)',
      quantity: lf,
      unit: 'lf',
    });
  }

  if (scope.includes('vanity')) {
    // Extract vanity size
    const sizeMatch = scope.match(/(\d+)\s*("|in|inch)/i);
    const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 48;
    lineItems.push({
      category: 'Cabinetry & Vanities',
      item: `Vanity - ${size}in`,
      quantity: 1,
      unit: 'ea',
    });
  }

  // Custom Hood - CRITICAL for kitchen
  if (scope.includes('custom') && scope.includes('hood')) {
    lineItems.push({
      category: 'Cabinetry & Vanities',
      item: 'Custom Built-Ins',
      quantity: 1,
      unit: 'ea',
      notes: 'Custom wood hood with recirculating vent',
    });
  }

  // ============ TRIM & MILLWORK ============
  // Crown Molding - CRITICAL
  if (scope.includes('crown') || scope.includes('crown molding')) {
    const lf = extractNumber(scope, 'crown') || estimateKitchenLinearFeet(state) * 1.5;
    lineItems.push({
      category: 'Trim & Millwork',
      item: 'Crown Molding',
      quantity: lf,
      unit: 'lf',
    });
  }

  if (scope.includes('baseboard') || scope.includes('base molding')) {
    const lf = extractNumber(scope, 'baseboard') || estimateKitchenLinearFeet(state) * 2;
    lineItems.push({
      category: 'Trim & Millwork',
      item: 'Baseboard Molding',
      quantity: lf,
      unit: 'lf',
    });
  }

  // ============ MECHANICALS & APPLIANCES ============
  // Microwave Drawer - CRITICAL
  if (scope.includes('microwave') && (scope.includes('drawer') || scope.includes('cabinet') || scope.includes('install'))) {
    lineItems.push({
      category: 'Mechanicals & Appliances',
      item: 'Appliance Install - Standard',
      quantity: 1,
      unit: 'ea',
      notes: 'Microwave drawer installation',
    });
  }

  if (scope.includes('appliance') && scope.includes('install')) {
    lineItems.push({
      category: 'Mechanicals & Appliances',
      item: 'Appliance Install - Standard',
      quantity: 1,
      unit: 'ea',
    });
  }

  // ============ ELECTRICAL ============
  if (scope.includes('220') || (scope.includes('move') && scope.includes('electrical')) || scope.includes('electric line')) {
    lineItems.push({
      category: 'Smart Home / Specialty Electrical',
      item: 'Electrical Line Move/Upgrade',
      quantity: 1,
      unit: 'ea',
      notes: '220V line relocation for range',
    });
  }

  if (scope.includes('under cabinet') && scope.includes('light')) {
    const lf = estimateKitchenLinearFeet(state) * 0.6;
    lineItems.push({
      category: 'Smart Home / Specialty Electrical',
      item: 'Under-Cabinet Lighting',
      quantity: Math.round(lf),
      unit: 'lf',
    });
  }

  if (scope.includes('recessed') || scope.includes('can light')) {
    const count = extractNumber(scope, 'recessed') || extractNumber(scope, 'can') || 4;
    lineItems.push({
      category: 'Electrical',
      item: 'Electrical - Recessed Can',
      quantity: count,
      unit: 'ea',
    });
  }

  if (scope.includes('pendant')) {
    const count = extractNumber(scope, 'pendant') || 3;
    lineItems.push({
      category: 'Electrical',
      item: 'Electrical - Pendant Light',
      quantity: count,
      unit: 'ea',
    });
  }

  // ============ CABINET CUSTOMIZATION ============
  if (scope.includes('hardware') || scope.includes('pulls') || scope.includes('knobs')) {
    const cabinetCount = extractNumber(scope, 'cabinet') || 22;
    lineItems.push({
      category: 'Cabinet Customization',
      item: 'Hardware / Pulls',
      quantity: Math.round(cabinetCount * 1.5),
      unit: 'ea',
      notes: 'Material and installation',
    });
  }

  if (scope.includes('soft close') || scope.includes('soft-close')) {
    const count = extractNumber(scope, 'door') || extractNumber(scope, 'soft') || 20;
    lineItems.push({
      category: 'Cabinet Customization',
      item: 'Soft-Close Hinges',
      quantity: count,
      unit: 'ea',
    });
  }

  // ============ FLOORING ============
  if (scope.includes('floor') && (scope.includes('repair') || scope.includes('patch'))) {
    const sqft = extractNumber(scope, 'floor') || 20;
    lineItems.push({
      category: 'Flooring',
      item: 'LVP Flooring (Repair)',
      quantity: sqft,
      unit: 'sqft',
      notes: 'Floor repair/patch area',
    });
  }

  if ((scope.includes('new floor') || scope.includes('flooring') || scope.includes('lvp')) && !scope.includes('repair')) {
    const sqft = extractNumber(scope, 'floor') || estimateSquareFootage(state);
    lineItems.push({
      category: 'Flooring',
      item: 'LVP Flooring',
      quantity: sqft,
      unit: 'sqft',
    });
  }

  // ============ PAINT & DRYWALL ============
  if (scope.includes('drywall') || scope.includes('texture')) {
    const sqft = extractNumber(scope, 'drywall') || 40;
    lineItems.push({
      category: 'Paint & Drywall',
      item: 'Drywall (Large Area)',
      quantity: sqft,
      unit: 'sqft',
    });
  }

  if (scope.includes('paint')) {
    if (state.projectType === 'Bathroom') {
      lineItems.push({
        category: 'Paint & Drywall',
        item: scope.includes('full') ? 'Paint - Full Bath' : 'Paint - Patch & Touch-up',
        quantity: 1,
        unit: 'ea',
      });
    } else {
      lineItems.push({
        category: 'Paint & Drywall',
        item: 'Paint - Patch & Touch-up',
        quantity: 1,
        unit: 'ea',
      });
    }
  }

  // ============ TILE ============
  if (scope.includes('tile')) {
    if (scope.includes('wall') || scope.includes('shower wall')) {
      const sqft = extractNumber(scope, 'wall') || state.dimensions?.showerWallSqft || 80;
      lineItems.push({
        category: 'Tile',
        item: 'Tile - Wall',
        quantity: sqft,
        unit: 'sqft',
      });
    }
    if (scope.includes('floor') || scope.includes('shower floor')) {
      const sqft = extractNumber(scope, 'floor') || state.dimensions?.showerSqft || 15;
      lineItems.push({
        category: 'Tile',
        item: 'Tile - Shower Floor',
        quantity: sqft,
        unit: 'sqft',
      });
    }
    if (scope.includes('backsplash')) {
      const sqft = extractNumber(scope, 'backsplash') || 30;
      lineItems.push({
        category: 'Tile',
        item: 'Backsplash - Tile',
        quantity: sqft,
        unit: 'sqft',
      });
    }
  }

  // ============ COUNTERTOPS ============
  if (scope.includes('countertop') || scope.includes('counter top') || scope.includes('quartz')) {
    const sqft = extractNumber(scope, 'countertop') || state.dimensions?.countertopSqft || 40;
    lineItems.push({
      category: 'Countertop',
      item: 'Quartz - Countertop',
      quantity: sqft,
      unit: 'sqft',
    });
  }

  // ============ PLUMBING ============
  if (scope.includes('plumb')) {
    if (scope.includes('reconnect') || scope.includes('hook up') || scope.includes('hookup')) {
      lineItems.push({
        category: 'Plumbing',
        item: 'Plumbing - Reconnect',
        quantity: 1,
        unit: 'ea',
        notes: 'Kitchen sink/dishwasher hookup',
      });
    }
    if (scope.includes('shower')) {
      lineItems.push({
        category: 'Plumbing',
        item: 'Plumbing - Shower Standard',
        quantity: 1,
        unit: 'ea',
      });
    }
    if (scope.includes('toilet')) {
      lineItems.push({
        category: 'Plumbing',
        item: 'Plumbing - Toilet Swap',
        quantity: 1,
        unit: 'ea',
      });
    }
  }

  // ============ GLASS ============
  if (scope.includes('glass') || scope.includes('frameless')) {
    if (scope.includes('90') || scope.includes('corner')) {
      lineItems.push({
        category: 'Glass',
        item: 'Glass - 90 Return',
        quantity: 1,
        unit: 'ea',
      });
    } else if (scope.includes('panel only')) {
      lineItems.push({
        category: 'Glass',
        item: 'Glass - Panel Only',
        quantity: 1,
        unit: 'ea',
      });
    } else {
      lineItems.push({
        category: 'Glass',
        item: 'Glass - Shower Standard',
        quantity: 1,
        unit: 'ea',
      });
    }
  }

  // ============ FRAMING & STRUCTURAL ============
  if (scope.includes('niche')) {
    const count = extractNumber(scope, 'niche') || 1;
    lineItems.push({
      category: 'Framing',
      item: 'Framing - Niche',
      quantity: count,
      unit: 'ea',
    });
  }

  if (scope.includes('bench')) {
    lineItems.push({
      category: 'Framing',
      item: 'Framing - Bench',
      quantity: 1,
      unit: 'ea',
    });
  }

  if (scope.includes('soffit') && scope.includes('remov')) {
    lineItems.push({
      category: 'Framing',
      item: 'Soffit Removal',
      quantity: 1,
      unit: 'ea',
    });
  }

  return lineItems;
}

/**
 * Validate quote completeness - check for commonly missed items
 */
export function validateQuoteCompleteness(
  scopeDescription: string,
  generatedLineItems: MappedLineItem[]
): string[] {
  const missingItems: string[] = [];
  const scope = scopeDescription.toLowerCase();
  const itemNames = generatedLineItems.map(i => `${i.category} ${i.item}`.toLowerCase());

  const checks = [
    { keyword: 'crown', itemName: 'Crown Molding', searchTerms: ['crown', 'trim'] },
    { keyword: 'hood', itemName: 'Custom Hood', searchTerms: ['hood', 'built-in'] },
    { keyword: 'hardware', itemName: 'Cabinet Hardware', searchTerms: ['hardware', 'pulls'] },
    { keyword: 'air scrubber', itemName: 'Air Scrubber', searchTerms: ['air scrubber', 'hepa'] },
    { keyword: 'protection', itemName: 'Floor Protection', searchTerms: ['protection', 'ramboard'] },
    { keyword: 'microwave', itemName: 'Microwave Install', searchTerms: ['microwave', 'appliance'] },
    { keyword: '220', itemName: 'Electrical Line Move', searchTerms: ['electrical', '220', 'line'] },
    { keyword: 'under cabinet', itemName: 'Under Cabinet Lighting', searchTerms: ['under cabinet', 'under-cabinet'] },
    { keyword: 'pendant', itemName: 'Pendant Lights', searchTerms: ['pendant'] },
    { keyword: 'soft close', itemName: 'Soft-Close Hinges', searchTerms: ['soft close', 'soft-close'] },
    { keyword: 'niche', itemName: 'Shower Niche', searchTerms: ['niche'] },
    { keyword: 'bench', itemName: 'Shower Bench', searchTerms: ['bench'] },
    { keyword: 'glass', itemName: 'Shower Glass', searchTerms: ['glass', 'frameless'] },
    { keyword: 'tile', itemName: 'Tile Work', searchTerms: ['tile'] },
    { keyword: 'waterproof', itemName: 'Waterproofing', searchTerms: ['waterproof'] },
  ];

  for (const check of checks) {
    if (scope.includes(check.keyword)) {
      const found = check.searchTerms.some(term => 
        itemNames.some(name => name.includes(term))
      );
      if (!found) {
        missingItems.push(check.itemName);
      }
    }
  }

  return missingItems;
}

/**
 * Update conversation state based on message content
 */
export function updateStateFromMessage(
  message: string,
  currentState: ConversationState
): Partial<ConversationState> {
  const msg = message.toLowerCase();
  const updates: Partial<ConversationState> = {};

  // Detect project type
  if (!currentState.projectType) {
    if (msg.includes('kitchen')) {
      updates.projectType = 'Kitchen';
      updates.phase = 'scope_gathering';
    } else if (msg.includes('bathroom') || msg.includes('bath')) {
      updates.projectType = 'Bathroom';
      updates.phase = 'scope_gathering';
    }
  }

  // Extract scope keywords
  const scopeKeywords = [
    'demo', 'remove', 'tear out', 'gut',
    'cabinet', 'vanity', 'hood',
    'plumb', 'sink', 'toilet', 'tub', 'shower',
    'electric', 'outlet', 'light', 'can', 'pendant', '220',
    'tile', 'backsplash', 'floor',
    'paint', 'drywall', 'texture',
    'crown', 'baseboard', 'trim',
    'protection', 'air scrubber', 'barrier',
    'glass', 'frameless',
    'countertop', 'quartz',
    'niche', 'bench',
    'hardware', 'pulls', 'soft close',
  ];

  const newScopeItems = scopeKeywords.filter(keyword => 
    msg.includes(keyword) && !currentState.scopeItems.includes(keyword)
  );

  if (newScopeItems.length > 0) {
    updates.scopeItems = [...currentState.scopeItems, ...newScopeItems];
  }

  return updates;
}

/**
 * Check if we're ready to move to client details phase
 */
export function isReadyForClientDetails(state: ConversationState): boolean {
  // Need project type
  if (!state.projectType) return false;
  
  // Need some scope items
  if (state.scopeItems.length < 2) return false;
  
  // Need dimensions (or at least we should have asked)
  if (state.phase !== 'materials' && state.phase !== 'client_details' && state.phase !== 'review') {
    return false;
  }
  
  return true;
}

/**
 * Check if client details are complete
 */
export function hasCompleteClientDetails(state: ConversationState): boolean {
  const { clientDetails } = state;
  return !!(
    clientDetails.name &&
    clientDetails.phone &&
    clientDetails.email &&
    clientDetails.address
  );
}
