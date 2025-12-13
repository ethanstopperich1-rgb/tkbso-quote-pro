/**
 * Line item rendering utility
 * 
 * Renders line items using the standard format:
 * "− [action_verb] [description]. (suffix) (Product Allowance $XXX)"
 */

export interface ProductAllowance {
  description: string;
  amount: number;
  per_unit?: boolean;
  unit?: string;
}

export interface FormattedLineItem {
  action_verb: string;
  description: string;
  suffix?: string;
  product_allowance?: ProductAllowance;
}

/**
 * Renders a line item to a formatted string
 */
export function renderLineItem(item: FormattedLineItem): string {
  let line = `− ${item.action_verb} ${item.description}`;
  
  if (item.suffix) {
    line += ` (${item.suffix})`;
  }
  
  if (item.product_allowance) {
    if (item.product_allowance.per_unit) {
      line += ` (${item.product_allowance.description} $${item.product_allowance.amount}/${item.product_allowance.unit})`;
    } else {
      line += ` (${item.product_allowance.description} $${item.product_allowance.amount.toLocaleString()})`;
    }
  }
  
  return line;
}

/**
 * Standard allowance amounts
 */
export const ALLOWANCES = {
  // Plumbing
  toilet: 350,
  showerValve: 450,
  tubFiller: 650,
  faucetBathroom: 350,
  faucetKitchen: 450,
  showerHead: 175,
  handheldShower: 225,
  linearDrain: 350,
  garbageDisposal: 175,
  
  // Tile (per sqft)
  tileFloor: 6.50,
  tileWall: 6.50,
  tileShowerFloor: 12,
  tileBacksplash: 8,
  
  // Vanities
  vanity24: 900,
  vanity30: 1200,
  vanity36: 1400,
  vanity48: 1800,
  vanity60: 2400,
  vanity72: 3200,
  
  // Countertops
  quartzSlab: 1200,
  graniteSlab: 1400,
  laminateSlab: 600,
  
  // Glass
  framelessEnclosure: 1800,
  showerDoorPanel: 1400,
  glassPanel: 900,
  
  // Electrical
  recessedCan: 65,
  vanityLight: 175,
  exhaustFan: 125,
  ledMirror: 450,
  
  // Accessories
  towelBar: 45,
  toiletPaperHolder: 35,
  robeHook: 35,
  grabBar: 125,
  mirror: 250,
};

/**
 * Get vanity allowance by size
 */
export function getVanityAllowance(sizeInches: number): number {
  if (sizeInches <= 24) return ALLOWANCES.vanity24;
  if (sizeInches <= 30) return ALLOWANCES.vanity30;
  if (sizeInches <= 36) return ALLOWANCES.vanity36;
  if (sizeInches <= 48) return ALLOWANCES.vanity48;
  if (sizeInches <= 60) return ALLOWANCES.vanity60;
  return ALLOWANCES.vanity72;
}

/**
 * Format quantity text for display
 */
export function formatQuantity(qty: number): string {
  if (qty === 1) return 'one (1)';
  if (qty === 2) return 'two (2)';
  if (qty === 3) return 'three (3)';
  if (qty === 4) return 'four (4)';
  if (qty === 5) return 'five (5)';
  if (qty === 6) return 'six (6)';
  return `${qty}`;
}

/**
 * Parse a task description into a FormattedLineItem
 */
export function parseToFormattedLineItem(
  taskDescription: string,
  category: string,
  options?: {
    quantity?: number;
    unit?: string;
    sqft?: number;
    size?: number;
    finish?: string;
    allowanceOverride?: number;
  }
): FormattedLineItem {
  const lower = taskDescription.toLowerCase();
  const qty = options?.quantity || 1;
  const finish = options?.finish || 'customer selected finish';
  const sqft = options?.sqft ? Math.round(options.sqft) : undefined;
  
  // DEMOLITION
  if (lower.includes('demo') || lower.includes('remove') || lower.includes('haul') || lower.includes('dumpster')) {
    if (lower.includes('dumpster') || lower.includes('haul')) {
      return {
        action_verb: 'Provide',
        description: 'dumpster for debris removal. Includes delivery, pickup, and disposal fees',
      };
    }
    return {
      action_verb: 'Demo and remove',
      description: extractDemoItems(taskDescription) || 'all existing fixtures, tile, and debris from remodel area. Dispose of all materials and haul away',
    };
  }
  
  // TOILET
  if (lower.includes('toilet') && !lower.includes('paper')) {
    if (lower.includes('reinstall') || lower.includes('reuse') || lower.includes('existing')) {
      return {
        action_verb: 'Remove and reinstall',
        description: 'existing toilet with new wax ring and supply line',
      };
    }
    if (lower.includes('relocat')) {
      return {
        action_verb: 'Relocate',
        description: 'toilet drain and supply lines to new position. Includes rough-in and connection',
      };
    }
    return {
      action_verb: 'Supply and install',
      description: 'new chair height toilet with new wax ring, shut-off valve, and braided supply line',
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.toilet,
      },
    };
  }
  
  // SHOWER VALVE
  if (lower.includes('valve') || lower.includes('trim kit')) {
    return {
      action_verb: 'Supply and install',
      description: `new thermostatic shower valve with pressure-balanced trim kit and diverter in ${finish}`,
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.showerValve,
      },
    };
  }
  
  // LINEAR DRAIN
  if (lower.includes('linear drain')) {
    return {
      action_verb: 'Supply and install',
      description: `linear drain with tile-insert cover in ${finish}`,
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.linearDrain,
      },
    };
  }
  
  // TUB FILLER
  if (lower.includes('tub filler') || lower.includes('freestanding tub')) {
    return {
      action_verb: 'Supply and install',
      description: `freestanding tub filler with hand shower in ${finish}`,
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.tubFiller,
      },
    };
  }
  
  // FAUCET
  if (lower.includes('faucet')) {
    const isKitchen = lower.includes('kitchen') || category.toLowerCase().includes('kitchen');
    return {
      action_verb: 'Supply and install',
      description: isKitchen ? `new kitchen faucet in ${finish}` : `new lavatory faucet in ${finish}`,
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || (isKitchen ? ALLOWANCES.faucetKitchen : ALLOWANCES.faucetBathroom),
      },
    };
  }
  
  // SHOWER HEAD
  if (lower.includes('shower head') || lower.includes('showerhead')) {
    if (lower.includes('handheld') || lower.includes('hand held')) {
      return {
        action_verb: 'Supply and install',
        description: `handheld shower attachment with slide bar in ${finish}`,
        product_allowance: {
          description: 'Product Allowance',
          amount: options?.allowanceOverride || ALLOWANCES.handheldShower,
        },
      };
    }
    return {
      action_verb: 'Supply and install',
      description: `new showerhead and arm in ${finish}`,
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.showerHead,
      },
    };
  }
  
  // TILE - WALL
  if ((lower.includes('tile') && lower.includes('wall')) || lower.includes('shower wall')) {
    return {
      action_verb: 'Install',
      description: sqft 
        ? `large-format porcelain tile to full height around shower area (${sqft} sq ft)`
        : 'large-format porcelain tile to full height around shower area',
      product_allowance: {
        description: 'Product allowance',
        amount: ALLOWANCES.tileWall,
        per_unit: true,
        unit: 'sq ft',
      },
      suffix: 'Includes thinset, grout, and Schluter trim',
    };
  }
  
  // TILE - SHOWER FLOOR
  if ((lower.includes('tile') && lower.includes('shower') && lower.includes('floor')) || lower.includes('mosaic')) {
    return {
      action_verb: 'Install',
      description: sqft 
        ? `mosaic tile to shower floor with proper slope to drain (${sqft} sq ft)`
        : 'mosaic tile to shower floor with proper slope to drain',
      product_allowance: {
        description: 'Product allowance',
        amount: ALLOWANCES.tileShowerFloor,
        per_unit: true,
        unit: 'sq ft',
      },
      suffix: 'Includes thinset, grout, and Schluter trim',
    };
  }
  
  // TILE - MAIN FLOOR
  if (lower.includes('tile') && lower.includes('floor')) {
    return {
      action_verb: 'Install',
      description: sqft 
        ? `large-format porcelain tile to bathroom floor (${sqft} sq ft)`
        : 'large-format porcelain tile to bathroom floor',
      product_allowance: {
        description: 'Product allowance',
        amount: ALLOWANCES.tileFloor,
        per_unit: true,
        unit: 'sq ft',
      },
      suffix: 'Includes thinset, grout, and Schluter trim',
    };
  }
  
  // BACKSPLASH
  if (lower.includes('backsplash')) {
    return {
      action_verb: 'Install',
      description: sqft 
        ? `tile backsplash from countertop to upper cabinets (${sqft} sq ft)`
        : 'tile backsplash from countertop to upper cabinets',
      product_allowance: {
        description: 'Product allowance',
        amount: ALLOWANCES.tileBacksplash,
        per_unit: true,
        unit: 'sq ft',
      },
      suffix: 'Includes thinset, grout, and Schluter trim',
    };
  }
  
  // WATERPROOFING
  if (lower.includes('waterproof')) {
    return {
      action_verb: 'Apply',
      description: 'waterproofing membrane to all shower/tub wet areas. Includes corners, seams, and fastener penetrations',
    };
  }
  
  // CEMENT BOARD
  if (lower.includes('cement') || lower.includes('backer board')) {
    return {
      action_verb: 'Install',
      description: 'cement backer board to wet areas as substrate for tile',
    };
  }
  
  // VANITY
  if (lower.includes('vanity') && !lower.includes('light')) {
    const size = options?.size || extractSize(taskDescription) || 48;
    const allowance = options?.allowanceOverride || getVanityAllowance(size);
    return {
      action_verb: 'Supply and install',
      description: `one (1) ${size}" shaker-style, soft-close vanity with undermount sink`,
      product_allowance: {
        description: 'Product Allowance',
        amount: allowance,
      },
    };
  }
  
  // COUNTERTOP / QUARTZ
  if (lower.includes('countertop') || lower.includes('quartz') || lower.includes('granite')) {
    const material = lower.includes('granite') ? 'Granite' : lower.includes('laminate') ? 'Laminate' : 'Level 1 Quartz';
    const allowance = options?.allowanceOverride || 
      (lower.includes('granite') ? ALLOWANCES.graniteSlab : 
       lower.includes('laminate') ? ALLOWANCES.laminateSlab : ALLOWANCES.quartzSlab);
    return {
      action_verb: 'Fabricate and install',
      description: sqft 
        ? `${material} countertop (${sqft} sq ft) with mitered edge. Includes undermount sink cutout and faucet holes`
        : `${material} countertop with mitered edge. Includes undermount sink cutout and faucet holes`,
      product_allowance: {
        description: 'Product Allowance',
        amount: allowance,
        per_unit: true,
        unit: 'slab',
      },
    };
  }
  
  // FRAMELESS GLASS
  if (lower.includes('frameless') || lower.includes('glass enclosure') || lower.includes('shower door') || lower.includes('glass door')) {
    if (lower.includes('panel only') || lower.includes('fixed panel')) {
      return {
        action_verb: 'Fabricate and install',
        description: `fixed frameless glass panel with brushed nickel hardware`,
        product_allowance: {
          description: 'Product Allowance',
          amount: options?.allowanceOverride || ALLOWANCES.glassPanel,
        },
      };
    }
    return {
      action_verb: 'Fabricate and install',
      description: 'frameless glass shower enclosure with brushed nickel hardware. Includes tempered glass panels, door, and all mounting hardware',
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.framelessEnclosure,
      },
    };
  }
  
  // RECESSED CAN LIGHTS
  if (lower.includes('recessed') || lower.includes('can light')) {
    const qtyText = formatQuantity(qty);
    return {
      action_verb: 'Supply and install',
      description: `${qtyText} recessed LED can light${qty > 1 ? 's' : ''} with IC-rated housing and retrofit trim`,
      product_allowance: {
        description: 'Product Allowance',
        amount: ALLOWANCES.recessedCan * qty,
      },
    };
  }
  
  // VANITY LIGHT
  if (lower.includes('vanity light') || lower.includes('vanity fixture')) {
    const qtyText = formatQuantity(qty);
    return {
      action_verb: 'Supply and install',
      description: `${qtyText} vanity light fixture${qty > 1 ? 's' : ''} in ${finish}`,
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.vanityLight,
      },
    };
  }
  
  // LED MIRROR
  if (lower.includes('led mirror') || lower.includes('lighted mirror') || lower.includes('backlit mirror')) {
    return {
      action_verb: 'Supply and install',
      description: 'one (1) LED backlit mirror with integrated lighting',
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.ledMirror,
      },
    };
  }
  
  // EXHAUST FAN
  if (lower.includes('exhaust') || lower.includes('bath fan') || lower.includes('ventilation')) {
    return {
      action_verb: 'Supply and install',
      description: 'new bathroom exhaust fan with quiet motor',
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.exhaustFan,
      },
    };
  }
  
  // OUTLET / GFCI
  if (lower.includes('outlet') || lower.includes('gfci')) {
    const qtyText = formatQuantity(qty);
    return {
      action_verb: 'Install',
      description: `${qtyText} new GFCI outlet${qty > 1 ? 's' : ''} per code`,
    };
  }
  
  // SWITCH
  if (lower.includes('switch') && !lower.includes('shut')) {
    const qtyText = formatQuantity(qty);
    return {
      action_verb: 'Install',
      description: `${qtyText} new switch${qty > 1 ? 'es' : ''} in ${finish}`,
    };
  }
  
  // NICHE
  if (lower.includes('niche')) {
    return {
      action_verb: 'Frame and install',
      description: 'one (1) recessed shower niche with waterproof backing',
    };
  }
  
  // DRYWALL / WALL PATCH
  if (lower.includes('drywall') || lower.includes('wall patch') || lower.includes('patch and repair')) {
    return {
      action_verb: 'Patch and repair',
      description: 'drywall where plumbing/electrical was modified. Includes tape, mud, and sand to smooth finish',
    };
  }
  
  // PAINT
  if (lower.includes('paint') || lower.includes('prime')) {
    if (lower.includes('touch')) {
      return {
        action_verb: 'Touch up',
        description: 'paint in affected areas to match existing',
      };
    }
    return {
      action_verb: 'Prime and apply',
      description: '2 coats of paint to walls and ceiling in homeowner selected color',
    };
  }
  
  // ACCESSORIES - TOWEL BAR
  if (lower.includes('towel bar') || lower.includes('towel rack')) {
    const qtyText = formatQuantity(qty);
    return {
      action_verb: 'Supply and install',
      description: `${qtyText} towel bar${qty > 1 ? 's' : ''} in ${finish}`,
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.towelBar,
      },
    };
  }
  
  // ACCESSORIES - TOILET PAPER HOLDER
  if (lower.includes('toilet paper') || lower.includes('tp holder') || lower.includes('paper holder')) {
    const qtyText = formatQuantity(qty);
    return {
      action_verb: 'Supply and install',
      description: `${qtyText} toilet paper holder${qty > 1 ? 's' : ''} in ${finish}`,
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.toiletPaperHolder,
      },
    };
  }
  
  // ACCESSORIES - ROBE HOOK
  if (lower.includes('robe hook') || lower.includes('hook')) {
    const qtyText = formatQuantity(qty);
    return {
      action_verb: 'Supply and install',
      description: `${qtyText} robe hook${qty > 1 ? 's' : ''} in ${finish}`,
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.robeHook,
      },
    };
  }
  
  // ACCESSORIES - GRAB BAR
  if (lower.includes('grab bar')) {
    const qtyText = formatQuantity(qty);
    return {
      action_verb: 'Supply and install',
      description: `${qtyText} ADA-compliant grab bar${qty > 1 ? 's' : ''} with blocking`,
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.grabBar,
      },
    };
  }
  
  // ACCESSORIES - MIRROR
  if (lower.includes('mirror') && !lower.includes('led')) {
    return {
      action_verb: 'Supply and install',
      description: 'one (1) vanity mirror',
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.mirror,
      },
    };
  }
  
  // CABINET (Kitchen)
  if (lower.includes('cabinet')) {
    if (lower.includes('hardware')) {
      return {
        action_verb: 'Supply and install',
        description: 'soft-close cabinet hardware throughout kitchen',
      };
    }
    return {
      action_verb: 'Supply and install',
      description: 'shaker-style, soft-close cabinetry per design layout. Includes all boxes, doors, drawer fronts, and hardware',
    };
  }
  
  // GARBAGE DISPOSAL
  if (lower.includes('garbage disposal') || lower.includes('disposer')) {
    return {
      action_verb: 'Supply and install',
      description: 'new garbage disposal with air switch',
      product_allowance: {
        description: 'Product Allowance',
        amount: options?.allowanceOverride || ALLOWANCES.garbageDisposal,
      },
    };
  }
  
  // FRAMING
  if (lower.includes('fram') || lower.includes('blocking') || lower.includes('pony wall')) {
    if (lower.includes('pony')) {
      return {
        action_verb: 'Frame and construct',
        description: 'pony wall for glass mounting',
      };
    }
    return {
      action_verb: 'Frame and install',
      description: 'blocking for fixtures and accessories as required',
    };
  }
  
  // WALL REMOVAL
  if (lower.includes('wall removal') || lower.includes('remove wall')) {
    return {
      action_verb: 'Remove',
      description: 'existing wall and dispose of debris. Includes temporary support if needed',
    };
  }
  
  // DOOR
  if (lower.includes('door') && !lower.includes('shower')) {
    if (lower.includes('relocat')) {
      return {
        action_verb: 'Relocate',
        description: 'door opening to new position. Includes framing, header, and drywall repair',
      };
    }
    if (lower.includes('close') || lower.includes('fill')) {
      return {
        action_verb: 'Close and fill',
        description: 'existing door opening. Includes framing, drywall, and finish to match existing',
      };
    }
    return {
      action_verb: 'Supply and install',
      description: 'new door with hardware in customer selected finish',
    };
  }
  
  // DEFAULT - Clean up the description and use it directly
  const cleanDesc = cleanTaskDescription(taskDescription);
  const verb = extractActionVerb(lower);
  
  return {
    action_verb: verb,
    description: cleanDesc,
  };
}

/**
 * Extract specific items from demo description
 */
function extractDemoItems(desc: string): string | null {
  // Check if description already lists items
  const lower = desc.toLowerCase();
  if (lower.includes(':')) {
    const afterColon = desc.split(':')[1]?.trim();
    if (afterColon) return afterColon;
  }
  return null;
}

/**
 * Extract size from description (e.g., "48" vanity" -> 48)
 */
function extractSize(desc: string): number | null {
  const match = desc.match(/(\d+)["'"\s]*(?:inch|in|"|vanity)/i);
  return match ? parseInt(match[1]) : null;
}

/**
 * Clean up task description for display
 */
function cleanTaskDescription(desc: string): string {
  return desc
    .replace(/^[-−•]\s*/, '')
    .replace(/^\s*(includes?|supply|install|demo)\s+/i, '')
    .trim();
}

/**
 * Extract action verb from description
 */
function extractActionVerb(lower: string): string {
  if (lower.includes('supply') || lower.includes('install')) return 'Supply and install';
  if (lower.includes('demo') || lower.includes('remove')) return 'Demo and remove';
  if (lower.includes('patch') || lower.includes('repair')) return 'Patch and repair';
  if (lower.includes('fabricate')) return 'Fabricate and install';
  if (lower.includes('paint') || lower.includes('prime')) return 'Prime and apply';
  if (lower.includes('relocat')) return 'Relocate';
  if (lower.includes('frame') || lower.includes('construct')) return 'Frame and install';
  return 'Provide';
}
