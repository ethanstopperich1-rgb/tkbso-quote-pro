/**
 * Professional line item description generator for contractor proposals
 * 
 * Every description follows the format:
 * "− [Action verb] [specific item] [with specific details]. (Product Allowance $XXX)"
 * 
 * Action verbs: "Supply and install", "Demo and remove", "Patch and repair", "Fabricate and install"
 */

export interface ProfessionalLineItem {
  description: string;
  hasAllowance: boolean;
  allowanceAmount?: number;
  allowanceUnit?: string;
}

// Default product allowances for various items
export const DEFAULT_ALLOWANCES = {
  // Plumbing Fixtures
  toilet: 350,
  showerValve: 450,
  tubFiller: 650,
  faucet: 350,
  showerHead: 175,
  linearDrain: 350,
  
  // Bathroom Fixtures
  vanity30: 1200,
  vanity36: 1400,
  vanity48: 1800,
  vanity60: 2400,
  vanity72: 3200,
  mirror: 250,
  ledMirror: 450,
  medicineCabinet: 350,
  
  // Tile Materials
  tilePerSqft: 6.50,
  showerFloorTilePerSqft: 12,
  
  // Countertops
  quartzPerSqft: 45,
  quartzSlab: 1200,
  
  // Glass
  framelessGlass: 1800,
  showerDoor: 1400,
  
  // Electrical
  recessedCan: 65,
  vanityLight: 175,
  exhaustFan: 125,
  
  // Accessories
  towelBar: 45,
  toiletPaperHolder: 35,
  robeHook: 35,
  grabBar: 125,
  showerShelf: 65,
};

/**
 * Generate a professional description for a demo line item
 */
export function generateDemoDescription(
  projectType: 'bathroom' | 'kitchen',
  itemsList: string[]
): string {
  const items = itemsList.length > 0 
    ? itemsList.join(', ') 
    : projectType === 'bathroom' 
      ? 'existing tile, vanity, shower/tub fixtures, toilet, and all associated debris'
      : 'existing cabinets, countertops, appliances, backsplash, and all associated debris';
  
  return `− Demo and remove all the following items from the remodel area: ${items}. Dispose of all debris and haul away.`;
}

/**
 * Generate professional description for plumbing items
 */
export function generatePlumbingDescription(
  item: string,
  details?: {
    finish?: string;
    quantity?: number;
    allowance?: number;
  }
): ProfessionalLineItem {
  const qty = details?.quantity || 1;
  const qtyText = qty > 1 ? `${qty} ` : '';
  const finish = details?.finish || 'customer selected finish';
  
  const descriptions: Record<string, { desc: string; allowance?: number }> = {
    toilet: {
      desc: `− Supply and install ${qtyText}new chair height toilet with new wax ring, shut-off valve, and braided supply line.`,
      allowance: DEFAULT_ALLOWANCES.toilet,
    },
    toilet_reinstall: {
      desc: `− Remove and reinstall existing toilet with new wax ring and supply line.`,
    },
    shower_valve: {
      desc: `− Supply and install new thermostatic shower valve with pressure-balanced trim kit and diverter in ${finish}.`,
      allowance: DEFAULT_ALLOWANCES.showerValve,
    },
    shower_head: {
      desc: `− Supply and install new showerhead and arm in ${finish}.`,
      allowance: DEFAULT_ALLOWANCES.showerHead,
    },
    handheld_shower: {
      desc: `− Supply and install handheld shower attachment with slide bar in ${finish}.`,
      allowance: 225,
    },
    tub_filler: {
      desc: `− Supply and install freestanding tub filler with hand shower in ${finish}.`,
      allowance: DEFAULT_ALLOWANCES.tubFiller,
    },
    linear_drain: {
      desc: `− Supply and install linear drain with tile-insert cover in ${finish}.`,
      allowance: DEFAULT_ALLOWANCES.linearDrain,
    },
    faucet: {
      desc: `− Supply and install new lavatory faucet in ${finish}.`,
      allowance: DEFAULT_ALLOWANCES.faucet,
    },
    drain_relocate: {
      desc: `− Relocate existing drain line to new position. Includes rough-in and tie-in to existing plumbing.`,
    },
    toilet_relocate: {
      desc: `− Relocate toilet drain and supply lines to new position. Includes rough-in and connection.`,
    },
  };
  
  const match = descriptions[item.toLowerCase().replace(/[^a-z_]/g, '_').replace(/_+/g, '_')];
  
  if (match) {
    return {
      description: match.allowance 
        ? `${match.desc} (Product Allowance $${details?.allowance || match.allowance})`
        : match.desc,
      hasAllowance: !!match.allowance,
      allowanceAmount: details?.allowance || match.allowance,
    };
  }
  
  return {
    description: `− ${item}`,
    hasAllowance: false,
  };
}

/**
 * Generate professional description for tile work
 */
export function generateTileDescription(
  tileType: 'wall' | 'floor' | 'shower_floor' | 'shower_wall' | 'backsplash',
  sqft: number,
  options?: {
    tileStyle?: string;
    allowancePerSqft?: number;
  }
): ProfessionalLineItem {
  const style = options?.tileStyle || 'large-format porcelain';
  const allowance = options?.allowancePerSqft || DEFAULT_ALLOWANCES.tilePerSqft;
  const roundedSqft = Math.round(sqft);
  
  const descriptions: Record<string, string> = {
    wall: `− Install ${style} tile to full height around shower area.`,
    floor: `− Install ${style} tile to bathroom floor.`,
    shower_floor: `− Install mosaic tile to shower floor with proper slope to drain.`,
    shower_wall: `− Install ${style} tile to shower walls from floor to ceiling.`,
    backsplash: `− Install ${style} tile backsplash from countertop to upper cabinets.`,
  };
  
  const desc = descriptions[tileType] || `− Install ${style} tile (${roundedSqft} sq ft).`;
  const allowanceText = tileType === 'shower_floor' 
    ? `$${DEFAULT_ALLOWANCES.showerFloorTilePerSqft}/sq ft`
    : `$${allowance}/sq ft`;
  
  return {
    description: `${desc} (Product allowance ${allowanceText}. Includes thinset, grout, and Schluter trim.)`,
    hasAllowance: true,
    allowanceAmount: allowance,
    allowanceUnit: 'sq ft',
  };
}

/**
 * Generate professional description for vanity/cabinet work
 */
export function generateVanityDescription(
  size: number,
  options?: {
    style?: string;
    sinkType?: string;
    allowance?: number;
  }
): ProfessionalLineItem {
  const style = options?.style || 'shaker-style, soft-close';
  const sinkType = options?.sinkType || 'undermount';
  
  // Determine allowance based on size
  let allowance = options?.allowance;
  if (!allowance) {
    if (size <= 30) allowance = DEFAULT_ALLOWANCES.vanity30;
    else if (size <= 36) allowance = DEFAULT_ALLOWANCES.vanity36;
    else if (size <= 48) allowance = DEFAULT_ALLOWANCES.vanity48;
    else if (size <= 60) allowance = DEFAULT_ALLOWANCES.vanity60;
    else allowance = DEFAULT_ALLOWANCES.vanity72;
  }
  
  return {
    description: `− Supply and install one (1) ${size}" ${style} vanity with ${sinkType} sink. (Product Allowance $${allowance.toLocaleString()})`,
    hasAllowance: true,
    allowanceAmount: allowance,
  };
}

/**
 * Generate professional description for countertops
 */
export function generateCountertopDescription(
  material: 'quartz' | 'granite' | 'laminate',
  sqft: number,
  options?: {
    level?: number;
    allowance?: number;
  }
): ProfessionalLineItem {
  const level = options?.level || 1;
  const allowance = options?.allowance || DEFAULT_ALLOWANCES.quartzSlab;
  const roundedSqft = Math.round(sqft);
  
  const materialNames: Record<string, string> = {
    quartz: `Level ${level} Quartz`,
    granite: 'Granite',
    laminate: 'Laminate',
  };
  
  return {
    description: `− Fabricate and install ${materialNames[material]} countertop (${roundedSqft} sq ft) with ${material === 'laminate' ? 'eased' : 'mitered'} edge. Includes undermount sink cutout and faucet holes. (Product Allowance $${allowance.toLocaleString()}/slab)`,
    hasAllowance: true,
    allowanceAmount: allowance,
    allowanceUnit: 'slab',
  };
}

/**
 * Generate professional description for glass work
 */
export function generateGlassDescription(
  glassType: 'frameless_enclosure' | 'door_and_panel' | 'panel_only' | 'door_only',
  options?: {
    hardware?: string;
    allowance?: number;
  }
): ProfessionalLineItem {
  const hardware = options?.hardware || 'brushed nickel';
  const allowance = options?.allowance || DEFAULT_ALLOWANCES.framelessGlass;
  
  const descriptions: Record<string, string> = {
    frameless_enclosure: `− Fabricate and install frameless glass shower enclosure with ${hardware} hardware. Includes tempered glass panels, door, and all mounting hardware.`,
    door_and_panel: `− Fabricate and install frameless glass shower door with fixed panel and ${hardware} hardware.`,
    panel_only: `− Fabricate and install fixed frameless glass panel with ${hardware} hardware.`,
    door_only: `− Fabricate and install frameless glass shower door with ${hardware} hardware.`,
  };
  
  return {
    description: `${descriptions[glassType]} (Product Allowance $${allowance.toLocaleString()})`,
    hasAllowance: true,
    allowanceAmount: allowance,
  };
}

/**
 * Generate professional description for electrical work
 */
export function generateElectricalDescription(
  item: string,
  quantity?: number,
  options?: {
    finish?: string;
    allowance?: number;
  }
): ProfessionalLineItem {
  const qty = quantity || 1;
  const qtyText = qty === 1 ? 'one (1)' : `${qty}`;
  const finish = options?.finish || 'customer selected finish';
  
  const descriptions: Record<string, { desc: string; allowance?: number }> = {
    recessed_can: {
      desc: `− Supply and install ${qtyText} recessed LED can light(s) with IC-rated housing and retrofit trim.`,
      allowance: DEFAULT_ALLOWANCES.recessedCan * qty,
    },
    vanity_light: {
      desc: `− Supply and install ${qtyText} vanity light fixture(s) in ${finish}.`,
      allowance: DEFAULT_ALLOWANCES.vanityLight,
    },
    exhaust_fan: {
      desc: `− Supply and install new bathroom exhaust fan with quiet motor.`,
      allowance: DEFAULT_ALLOWANCES.exhaustFan,
    },
    outlet: {
      desc: `− Install ${qtyText} new GFCI outlet(s) per code.`,
    },
    switch: {
      desc: `− Install ${qtyText} new switch(es) in ${finish}.`,
    },
    led_mirror: {
      desc: `− Supply and install one (1) LED backlit mirror with integrated lighting.`,
      allowance: DEFAULT_ALLOWANCES.ledMirror,
    },
  };
  
  const key = item.toLowerCase().replace(/[^a-z_]/g, '_').replace(/_+/g, '_');
  const match = descriptions[key];
  
  if (match) {
    return {
      description: match.allowance 
        ? `${match.desc} (Product Allowance $${options?.allowance || match.allowance})`
        : match.desc,
      hasAllowance: !!match.allowance,
      allowanceAmount: options?.allowance || match.allowance,
    };
  }
  
  return {
    description: `− ${item}`,
    hasAllowance: false,
  };
}

/**
 * Generate professional description for drywall/framing work
 */
export function generateDrywallDescription(
  item: string,
  sqft?: number
): ProfessionalLineItem {
  const descriptions: Record<string, string> = {
    niche: '− Frame and install one (1) recessed shower niche with waterproof backing.',
    pony_wall: '− Frame and construct pony wall for glass mounting.',
    wall_patch: '− Patch and repair drywall where plumbing/electrical was modified.',
    full_drywall: `− Install new drywall (${sqft ? Math.round(sqft) + ' sq ft' : 'as needed'}), tape, mud, and sand to smooth finish.`,
    texture: '− Apply texture to match existing walls.',
    ceiling_repair: '− Repair and refinish ceiling drywall as needed.',
  };
  
  const key = item.toLowerCase().replace(/[^a-z_]/g, '_').replace(/_+/g, '_');
  const match = descriptions[key];
  
  return {
    description: match || `− ${item}`,
    hasAllowance: false,
  };
}

/**
 * Generate professional description for paint work
 */
export function generatePaintDescription(
  scope: 'full_room' | 'walls_only' | 'ceiling_only' | 'touch_up',
  options?: {
    coats?: number;
    color?: string;
  }
): ProfessionalLineItem {
  const coats = options?.coats || 2;
  const color = options?.color || 'homeowner selected color';
  
  const descriptions: Record<string, string> = {
    full_room: `− Prime and apply ${coats} coats of paint to walls and ceiling in ${color}.`,
    walls_only: `− Prime and apply ${coats} coats of paint to walls only in ${color}.`,
    ceiling_only: `− Prime and apply ${coats} coats of paint to ceiling in ${color}.`,
    touch_up: '− Touch up paint in affected areas to match existing.',
  };
  
  return {
    description: descriptions[scope] || `− Apply paint (${coats} coats).`,
    hasAllowance: false,
  };
}

/**
 * Generate professional description for accessories
 */
export function generateAccessoryDescription(
  accessory: string,
  quantity?: number,
  options?: {
    finish?: string;
    allowance?: number;
  }
): ProfessionalLineItem {
  const qty = quantity || 1;
  const qtyText = qty === 1 ? 'one (1)' : `${qty}`;
  const finish = options?.finish || 'customer selected finish';
  
  const descriptions: Record<string, { desc: string; allowance: number }> = {
    towel_bar: {
      desc: `− Supply and install ${qtyText} towel bar(s) in ${finish}.`,
      allowance: DEFAULT_ALLOWANCES.towelBar,
    },
    toilet_paper_holder: {
      desc: `− Supply and install ${qtyText} toilet paper holder(s) in ${finish}.`,
      allowance: DEFAULT_ALLOWANCES.toiletPaperHolder,
    },
    robe_hook: {
      desc: `− Supply and install ${qtyText} robe hook(s) in ${finish}.`,
      allowance: DEFAULT_ALLOWANCES.robeHook,
    },
    grab_bar: {
      desc: `− Supply and install ${qtyText} ADA-compliant grab bar(s) with blocking.`,
      allowance: DEFAULT_ALLOWANCES.grabBar,
    },
    shower_shelf: {
      desc: `− Supply and install ${qtyText} corner shower shelf/caddy.`,
      allowance: DEFAULT_ALLOWANCES.showerShelf,
    },
    mirror: {
      desc: `− Supply and install ${qtyText} vanity mirror.`,
      allowance: DEFAULT_ALLOWANCES.mirror,
    },
  };
  
  const key = accessory.toLowerCase().replace(/[^a-z_]/g, '_').replace(/_+/g, '_');
  const match = descriptions[key];
  
  if (match) {
    return {
      description: `${match.desc} (Product Allowance $${options?.allowance || match.allowance})`,
      hasAllowance: true,
      allowanceAmount: options?.allowance || match.allowance,
    };
  }
  
  return {
    description: `− Supply and install ${accessory} in ${finish}.`,
    hasAllowance: false,
  };
}

/**
 * Transform a generic task description into a professional format
 * This is the main function that converts existing line items to professional format
 */
export function transformToProDescription(
  taskDescription: string,
  category: string,
  options?: {
    quantity?: number;
    unit?: string;
    finish?: string;
    allowance?: number;
  }
): ProfessionalLineItem {
  const lower = taskDescription.toLowerCase();
  const qty = options?.quantity || 1;
  const finish = options?.finish || 'customer selected finish';
  
  // TOILET
  if (lower.includes('toilet') && !lower.includes('paper')) {
    if (lower.includes('reinstall') || lower.includes('reuse') || lower.includes('existing')) {
      return {
        description: '− Remove and reinstall existing toilet with new wax ring and supply line.',
        hasAllowance: false,
      };
    }
    if (lower.includes('relocat')) {
      return {
        description: '− Relocate toilet drain and supply lines to new position. Includes rough-in and connection.',
        hasAllowance: false,
      };
    }
    return {
      description: `− Supply and install new chair height toilet with new wax ring, shut-off valve, and braided supply line. (Product Allowance $${options?.allowance || DEFAULT_ALLOWANCES.toilet})`,
      hasAllowance: true,
      allowanceAmount: options?.allowance || DEFAULT_ALLOWANCES.toilet,
    };
  }
  
  // SHOWER VALVE
  if (lower.includes('valve') || lower.includes('trim kit')) {
    return {
      description: `− Supply and install new thermostatic shower valve with pressure-balanced trim kit and diverter in ${finish}. (Product Allowance $${options?.allowance || DEFAULT_ALLOWANCES.showerValve})`,
      hasAllowance: true,
      allowanceAmount: options?.allowance || DEFAULT_ALLOWANCES.showerValve,
    };
  }
  
  // LINEAR DRAIN
  if (lower.includes('linear drain')) {
    return {
      description: `− Supply and install linear drain with tile-insert cover in ${finish}. (Product Allowance $${options?.allowance || DEFAULT_ALLOWANCES.linearDrain})`,
      hasAllowance: true,
      allowanceAmount: options?.allowance || DEFAULT_ALLOWANCES.linearDrain,
    };
  }
  
  // TUB FILLER
  if (lower.includes('tub filler') || lower.includes('freestanding') && lower.includes('faucet')) {
    return {
      description: `− Supply and install freestanding tub filler with hand shower in ${finish}. (Product Allowance $${options?.allowance || DEFAULT_ALLOWANCES.tubFiller})`,
      hasAllowance: true,
      allowanceAmount: options?.allowance || DEFAULT_ALLOWANCES.tubFiller,
    };
  }
  
  // FAUCET
  if (lower.includes('faucet') && !lower.includes('tub')) {
    return {
      description: `− Supply and install new lavatory faucet in ${finish}. (Product Allowance $${options?.allowance || DEFAULT_ALLOWANCES.faucet})`,
      hasAllowance: true,
      allowanceAmount: options?.allowance || DEFAULT_ALLOWANCES.faucet,
    };
  }
  
  // VANITY
  if (lower.includes('vanity') && !lower.includes('light')) {
    const sizeMatch = lower.match(/(\d+)["\s-]*(?:inch|in)?/);
    const size = sizeMatch ? parseInt(sizeMatch[1]) : 48;
    let allowance = options?.allowance;
    if (!allowance) {
      if (size <= 30) allowance = DEFAULT_ALLOWANCES.vanity30;
      else if (size <= 36) allowance = DEFAULT_ALLOWANCES.vanity36;
      else if (size <= 48) allowance = DEFAULT_ALLOWANCES.vanity48;
      else if (size <= 60) allowance = DEFAULT_ALLOWANCES.vanity60;
      else allowance = DEFAULT_ALLOWANCES.vanity72;
    }
    return {
      description: `− Supply and install one (1) ${size}" shaker-style, soft-close vanity with undermount sink. (Product Allowance $${allowance.toLocaleString()})`,
      hasAllowance: true,
      allowanceAmount: allowance,
    };
  }
  
  // TILE - WALL
  if (lower.includes('wall') && lower.includes('tile')) {
    const sqftMatch = lower.match(/(\d+)\s*(?:sq\s*ft|sqft)/i);
    const sqft = sqftMatch ? parseInt(sqftMatch[1]) : qty;
    return {
      description: `− Install large-format porcelain tile to full height around shower area. (Product allowance $${DEFAULT_ALLOWANCES.tilePerSqft}/sq ft. Includes thinset, grout, and Schluter trim.)`,
      hasAllowance: true,
      allowanceAmount: DEFAULT_ALLOWANCES.tilePerSqft,
      allowanceUnit: 'sq ft',
    };
  }
  
  // TILE - SHOWER FLOOR
  if (lower.includes('shower') && lower.includes('floor') && lower.includes('tile')) {
    return {
      description: `− Install mosaic tile to shower floor with proper slope to drain. (Product allowance $${DEFAULT_ALLOWANCES.showerFloorTilePerSqft}/sq ft. Includes thinset, grout, and Schluter trim.)`,
      hasAllowance: true,
      allowanceAmount: DEFAULT_ALLOWANCES.showerFloorTilePerSqft,
      allowanceUnit: 'sq ft',
    };
  }
  
  // TILE - MAIN FLOOR
  if (lower.includes('floor') && lower.includes('tile') && !lower.includes('shower')) {
    return {
      description: `− Install large-format porcelain tile to bathroom floor. (Product allowance $${DEFAULT_ALLOWANCES.tilePerSqft}/sq ft. Includes thinset, grout, and Schluter trim.)`,
      hasAllowance: true,
      allowanceAmount: DEFAULT_ALLOWANCES.tilePerSqft,
      allowanceUnit: 'sq ft',
    };
  }
  
  // FRAMELESS GLASS
  if (lower.includes('frameless') || (lower.includes('glass') && lower.includes('shower'))) {
    return {
      description: `− Fabricate and install frameless glass shower enclosure with brushed nickel hardware. Includes tempered glass panels, door, and all mounting hardware. (Product Allowance $${options?.allowance || DEFAULT_ALLOWANCES.framelessGlass})`,
      hasAllowance: true,
      allowanceAmount: options?.allowance || DEFAULT_ALLOWANCES.framelessGlass,
    };
  }
  
  // RECESSED LIGHTS
  if (lower.includes('recessed') || lower.includes('can light')) {
    const lightQty = qty || 1;
    const qtyText = lightQty === 1 ? 'one (1)' : `${lightQty}`;
    return {
      description: `− Supply and install ${qtyText} recessed LED can light(s) with IC-rated housing and retrofit trim. (Product Allowance $${DEFAULT_ALLOWANCES.recessedCan * lightQty})`,
      hasAllowance: true,
      allowanceAmount: DEFAULT_ALLOWANCES.recessedCan * lightQty,
    };
  }
  
  // VANITY LIGHT
  if (lower.includes('vanity light') || (lower.includes('vanity') && lower.includes('light'))) {
    return {
      description: `− Supply and install one (1) vanity light fixture in ${finish}. (Product Allowance $${options?.allowance || DEFAULT_ALLOWANCES.vanityLight})`,
      hasAllowance: true,
      allowanceAmount: options?.allowance || DEFAULT_ALLOWANCES.vanityLight,
    };
  }
  
  // LED MIRROR
  if (lower.includes('led mirror') || lower.includes('backlit mirror')) {
    return {
      description: `− Supply and install one (1) LED backlit mirror with integrated lighting. (Product Allowance $${options?.allowance || DEFAULT_ALLOWANCES.ledMirror})`,
      hasAllowance: true,
      allowanceAmount: options?.allowance || DEFAULT_ALLOWANCES.ledMirror,
    };
  }
  
  // EXHAUST FAN
  if (lower.includes('exhaust') || lower.includes('vent fan') || lower.includes('bath fan')) {
    return {
      description: `− Supply and install new bathroom exhaust fan with quiet motor. (Product Allowance $${options?.allowance || DEFAULT_ALLOWANCES.exhaustFan})`,
      hasAllowance: true,
      allowanceAmount: options?.allowance || DEFAULT_ALLOWANCES.exhaustFan,
    };
  }
  
  // COUNTERTOP
  if (lower.includes('countertop') || lower.includes('quartz') && !lower.includes('tile')) {
    const sqftMatch = lower.match(/(\d+)\s*(?:sq\s*ft|sqft)/i);
    const sqft = sqftMatch ? parseInt(sqftMatch[1]) : 15;
    return {
      description: `− Fabricate and install Level 1 Quartz countertop (${sqft} sq ft) with mitered edge. Includes undermount sink cutout and faucet holes. (Product Allowance $${options?.allowance || DEFAULT_ALLOWANCES.quartzSlab}/slab)`,
      hasAllowance: true,
      allowanceAmount: options?.allowance || DEFAULT_ALLOWANCES.quartzSlab,
      allowanceUnit: 'slab',
    };
  }
  
  // NICHE
  if (lower.includes('niche')) {
    return {
      description: '− Frame and install one (1) recessed shower niche with waterproof backing.',
      hasAllowance: false,
    };
  }
  
  // WATERPROOFING
  if (lower.includes('waterproof') || lower.includes('redgard')) {
    return {
      description: '− Apply waterproofing membrane to all shower/tub wet areas. Includes corners, seams, and fastener penetrations.',
      hasAllowance: false,
    };
  }
  
  // CEMENT BOARD
  if (lower.includes('cement board') || lower.includes('backer')) {
    return {
      description: '− Install cement backer board to wet areas as substrate for tile.',
      hasAllowance: false,
    };
  }
  
  // DRYWALL PATCH
  if (lower.includes('patch') && (lower.includes('drywall') || lower.includes('wall'))) {
    return {
      description: '− Patch and repair drywall where plumbing/electrical was modified. Sand to smooth finish.',
      hasAllowance: false,
    };
  }
  
  // FULL DRYWALL
  if (lower.includes('drywall') && (lower.includes('install') || lower.includes('new') || lower.includes('full'))) {
    return {
      description: '− Install new drywall, tape, mud, and sand to smooth finish ready for paint.',
      hasAllowance: false,
    };
  }
  
  // PAINT
  if (lower.includes('paint')) {
    if (lower.includes('touch') || lower.includes('patch')) {
      return {
        description: '− Touch up paint in affected areas to match existing.',
        hasAllowance: false,
      };
    }
    return {
      description: '− Prime and apply 2 coats of paint to walls and ceiling in homeowner selected color.',
      hasAllowance: false,
    };
  }
  
  // ACCESSORIES
  if (lower.includes('towel bar')) {
    return {
      description: `− Supply and install one (1) towel bar in ${finish}. (Product Allowance $${DEFAULT_ALLOWANCES.towelBar})`,
      hasAllowance: true,
      allowanceAmount: DEFAULT_ALLOWANCES.towelBar,
    };
  }
  if (lower.includes('toilet paper') || lower.includes('tp holder')) {
    return {
      description: `− Supply and install one (1) toilet paper holder in ${finish}. (Product Allowance $${DEFAULT_ALLOWANCES.toiletPaperHolder})`,
      hasAllowance: true,
      allowanceAmount: DEFAULT_ALLOWANCES.toiletPaperHolder,
    };
  }
  if (lower.includes('robe hook')) {
    return {
      description: `− Supply and install one (1) robe hook in ${finish}. (Product Allowance $${DEFAULT_ALLOWANCES.robeHook})`,
      hasAllowance: true,
      allowanceAmount: DEFAULT_ALLOWANCES.robeHook,
    };
  }
  if (lower.includes('grab bar')) {
    return {
      description: `− Supply and install one (1) ADA-compliant grab bar with blocking. (Product Allowance $${DEFAULT_ALLOWANCES.grabBar})`,
      hasAllowance: true,
      allowanceAmount: DEFAULT_ALLOWANCES.grabBar,
    };
  }
  
  // DEMO - pass through with proper formatting
  if (lower.includes('demo') || lower.includes('gut') || lower.includes('remove')) {
    // Clean up and reformat
    let cleaned = taskDescription
      .replace(/^demo\s*/i, 'Demo and remove ')
      .replace(/^gut\s*/i, 'Gut and remove ')
      .replace(/^remove\s*/i, 'Remove ');
    if (!cleaned.startsWith('−')) {
      cleaned = `− ${cleaned}`;
    }
    if (!cleaned.endsWith('.')) {
      cleaned += '.';
    }
    return {
      description: cleaned,
      hasAllowance: false,
    };
  }
  
  // DUMPSTER
  if (lower.includes('dumpster') || lower.includes('haul')) {
    return {
      description: '− Dumpster rental, delivery, pickup, and disposal of all construction debris.',
      hasAllowance: false,
    };
  }
  
  // FLOOR PROTECTION
  if (lower.includes('floor protection') || lower.includes('site protection')) {
    return {
      description: '− Install floor protection, dust barriers, and worksite containment.',
      hasAllowance: false,
    };
  }
  
  // POST-CONSTRUCTION CLEAN
  if (lower.includes('clean') && (lower.includes('post') || lower.includes('final') || lower.includes('construction'))) {
    return {
      description: '− Final post-construction cleaning of all surfaces, fixtures, and flooring.',
      hasAllowance: false,
    };
  }
  
  // Default: clean up and prefix with dash
  let cleaned = taskDescription;
  if (!cleaned.startsWith('−') && !cleaned.startsWith('-')) {
    cleaned = `− ${cleaned}`;
  }
  if (!cleaned.endsWith('.')) {
    cleaned += '.';
  }
  // Capitalize first word after dash
  cleaned = cleaned.replace(/^−\s*([a-z])/, (_, c) => `− ${c.toUpperCase()}`);
  
  return {
    description: cleaned,
    hasAllowance: false,
  };
}
