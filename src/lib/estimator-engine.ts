import { Message, Quote } from "@/types/estimator";
import { 
  calculateBathroomRange, 
  calculateKitchenRange, 
  calculateClientPriceFromIC,
  calculateMargin,
  PRICING 
} from "./pricing";

// Simple state machine for conversation
type ConversationPhase = 'initial' | 'project-type' | 'room-details' | 'scope' | 'gc-permit' | 'quality' | 'generating';

interface EstimatorState {
  phase: ConversationPhase;
  projectType?: 'kitchen' | 'bathroom' | 'combination' | 'closet';
  rooms: Array<{ type: string; name: string; sqft: number; features: string[] }>;
  hasGC?: boolean;
  needsPermit?: boolean;
  qualityLevel?: 'basic' | 'mid-range' | 'high-end';
  scopeLevel?: 'full-gut' | 'partial';
  location: string;
  projectName: string;
  customerSupplied: string[];
  specialRequests: string[];
  rawInput: string;
}

const initialState: EstimatorState = {
  phase: 'initial',
  rooms: [],
  location: 'Orlando, FL',
  projectName: '',
  customerSupplied: [],
  specialRequests: [],
  rawInput: '',
};

let state: EstimatorState = { ...initialState };

export function resetEstimator() {
  state = { ...initialState };
}

export function processUserMessage(userMessage: string): { response: string; quote?: Quote } {
  const lowerMessage = userMessage.toLowerCase();
  state.rawInput += ' ' + userMessage;
  
  // Extract any numbers that might be square footage
  const sqftMatch = userMessage.match(/(\d+)\s*(sq\.?\s*ft\.?|square\s*feet?|sqft|sf)/i);
  const roomSqft = sqftMatch ? parseInt(sqftMatch[1]) : 0;
  
  // Check for project type mentions
  const hasBathroom = /bath(room)?|shower|tub|vanit/i.test(lowerMessage);
  const hasKitchen = /kitchen/i.test(lowerMessage);
  const hasCloset = /closet/i.test(lowerMessage);
  
  // Check for GC/permit mentions
  const mentionsGC = /\b(gc|general\s*contractor|contractor)\b/i.test(lowerMessage);
  const mentionsPermit = /permit/i.test(lowerMessage);
  const hasGC = /\b(with|have|using|yes)\b.*\b(gc|contractor)\b/i.test(lowerMessage) || 
                /\b(gc|contractor)\b.*\b(involved|handling|pulling)\b/i.test(lowerMessage);
  const noGC = /\b(no|without|don'?t have)\b.*\b(gc|contractor)\b/i.test(lowerMessage);
  
  // Check quality mentions
  const highEnd = /high[\s-]?end|premium|luxury|custom|top/i.test(lowerMessage);
  const basic = /basic|budget|simple|standard/i.test(lowerMessage);
  
  // Check scope mentions
  const fullGut = /full|gut|complete|everything|total/i.test(lowerMessage);
  const partial = /partial|some|just|only|cosmetic/i.test(lowerMessage);

  // Update state based on message content
  if (hasBathroom && hasKitchen) {
    state.projectType = 'combination';
  } else if (hasBathroom) {
    state.projectType = 'bathroom';
  } else if (hasKitchen) {
    state.projectType = 'kitchen';
  }
  
  if (hasCloset) {
    state.specialRequests.push('closet buildout/reconfiguration');
  }
  
  if (hasGC) state.hasGC = true;
  if (noGC) state.hasGC = false;
  if (mentionsPermit) state.needsPermit = true;
  
  if (highEnd) state.qualityLevel = 'high-end';
  else if (basic) state.qualityLevel = 'basic';
  
  if (fullGut) state.scopeLevel = 'full-gut';
  else if (partial) state.scopeLevel = 'partial';
  
  // Extract room details if sqft provided
  if (roomSqft > 0) {
    const roomType = hasKitchen ? 'kitchen' : 'bathroom';
    state.rooms.push({
      type: roomType,
      name: roomType === 'kitchen' ? 'Kitchen' : `Bathroom ${state.rooms.filter(r => r.type === 'bathroom').length + 1}`,
      sqft: roomSqft,
      features: [],
    });
  }

  // Determine what info we still need
  const needsProjectType = !state.projectType;
  const needsRoomDetails = state.rooms.length === 0;
  const needsGCInfo = state.hasGC === undefined;
  const needsScope = !state.scopeLevel;
  
  // Generate response based on what we know and need
  if (needsProjectType) {
    return {
      response: `I'd be happy to help you get a quote ready! To get started, could you tell me:\n\n1. **What type of project** is this? (Kitchen, bathroom, or both?)\n2. **Approximate room size** (square feet if you have it)\n3. **Location** (I'll assume Orlando area unless you tell me otherwise)\n\nFeel free to include any other details you have – the more info, the better the estimate!`
    };
  }
  
  if (needsRoomDetails) {
    const projectLabel = state.projectType === 'combination' ? 'kitchen and bathroom(s)' : state.projectType;
    return {
      response: `Got it, a ${projectLabel} project. To give you accurate numbers, I need:\n\n1. **Room dimensions** – What's the approximate square footage? (Even a rough estimate like "8x10" or "about 80 sq ft" works)\n2. **How many rooms?** – If multiple bathrooms, how many?\n3. **Scope level** – Is this a full gut remodel or more of a refresh/partial update?`
    };
  }
  
  if (needsGCInfo) {
    return {
      response: `Thanks for those details! One important question for pricing:\n\n**Is a General Contractor involved and pulling permits, or is TKBSO handling this without a GC?**\n\nThis affects how we structure the quote – if there's a GC, we'll include their permit & oversight fee. If not, we may need to account for permits and cabinet markup differently.`
    };
  }
  
  if (needsScope && state.scopeLevel === undefined) {
    state.scopeLevel = 'full-gut'; // Default assumption
  }
  
  // We have enough info – generate the quote
  return generateQuote();
}

function generateQuote(): { response: string; quote: Quote } {
  // Calculate totals based on rooms
  let totalLow = 0;
  let totalHigh = 0;
  let totalSqft = 0;
  
  const bathroomRooms = state.rooms.filter(r => r.type === 'bathroom');
  const kitchenRooms = state.rooms.filter(r => r.type === 'kitchen');
  
  // If no specific rooms, make assumptions based on project type
  if (state.rooms.length === 0) {
    if (state.projectType === 'bathroom' || state.projectType === 'combination') {
      state.rooms.push({ type: 'bathroom', name: 'Bathroom', sqft: 75, features: [] });
    }
    if (state.projectType === 'kitchen' || state.projectType === 'combination') {
      state.rooms.push({ type: 'kitchen', name: 'Kitchen', sqft: 150, features: [] });
    }
  }
  
  // Calculate ranges
  state.rooms.forEach(room => {
    totalSqft += room.sqft;
    if (room.type === 'bathroom') {
      const range = calculateBathroomRange(room.sqft);
      totalLow += range.low;
      totalHigh += range.high;
    } else if (room.type === 'kitchen') {
      const range = calculateKitchenRange(room.sqft);
      totalLow += range.low;
      totalHigh += range.high;
    }
  });
  
  // Add GC fee if applicable
  if (state.hasGC) {
    totalLow += PRICING.internalCosts.gcPermitFee;
    totalHigh += PRICING.internalCosts.gcPermitFee;
  }
  
  // Quality adjustment
  if (state.qualityLevel === 'high-end') {
    totalLow *= 1.15;
    totalHigh *= 1.20;
  } else if (state.qualityLevel === 'basic') {
    totalLow *= 0.90;
    totalHigh *= 0.95;
  }
  
  const recommendedPrice = Math.round((totalLow + totalHigh) / 2 / 100) * 100;
  const internalCost = Math.round(recommendedPrice * (1 - PRICING.markups.targetMargin));
  const margin = calculateMargin(recommendedPrice, internalCost);
  
  // Build room summary
  const roomsSummary = state.rooms.map(r => `${r.name} (${r.sqft} sq ft)`).join(' + ');
  
  // Generate scope of work
  const scopeOfWork = generateScopeOfWork();
  
  // Per sq ft note
  const bathSqft = state.rooms.filter(r => r.type === 'bathroom').reduce((sum, r) => sum + r.sqft, 0);
  const kitchenSqft = state.rooms.filter(r => r.type === 'kitchen').reduce((sum, r) => sum + r.sqft, 0);
  
  let perSqftNote = 'Based on ';
  const notes: string[] = [];
  if (bathSqft > 0) notes.push(`~$${PRICING.perSqFt.bathroom.low}-$${PRICING.perSqFt.bathroom.high}/sq ft for ${bathSqft} sq ft of bathroom`);
  if (kitchenSqft > 0) notes.push(`~$${PRICING.perSqFt.kitchen.low}-$${PRICING.perSqFt.kitchen.high}/sq ft for ${kitchenSqft} sq ft of kitchen`);
  perSqftNote += notes.join(' and ') + '.';
  
  const quote: Quote = {
    projectSnapshot: {
      name: state.projectName || `${state.projectType?.charAt(0).toUpperCase()}${state.projectType?.slice(1)} Remodel Project`,
      location: state.location,
      roomsSummary,
      scopeSummary: state.scopeLevel === 'full-gut' ? 'Full gut remodel' : 'Partial update/refresh',
      permitGCSummary: state.hasGC 
        ? 'GC involved – permit handled by partnered contractor' 
        : 'No GC – TKBSO to handle permitting if required',
    },
    priceSummary: {
      lowEstimate: Math.round(totalLow / 100) * 100,
      highEstimate: Math.round(totalHigh / 100) * 100,
      recommendedPrice,
      perSqftNote,
    },
    scopeOfWork,
    internalBreakdown: {
      internalCost,
      clientPrice: recommendedPrice,
      marginPercent: margin,
      costBuckets: generateCostBuckets(internalCost),
    },
    assumptions: [
      state.qualityLevel ? `${state.qualityLevel} finish level assumed` : 'Mid-range finish level assumed',
      'Standard tile material allowance at ~$6.20/sq ft',
      'Single niche per shower assumed',
      state.hasGC ? 'GC permit fee of $2,500 included' : 'Permit allowance may be needed',
    ],
    openQuestions: [
      'Confirm exact room dimensions on site visit',
      state.hasGC === undefined ? 'Confirm if GC is involved or not' : '',
      'Review client fixture/tile selections vs allowances',
      'Verify any structural or layout changes needed',
    ].filter(Boolean),
  };
  
  const response = `I've put together a quote based on what you've shared. Here's the breakdown:`;
  
  return { response, quote };
}

function generateScopeOfWork() {
  const sections = [];
  
  sections.push({
    title: 'Demo',
    items: [
      'Remove and dispose of existing fixtures, cabinets, and finishes',
      'Protect adjacent areas during demolition',
      'Haul away all debris',
    ],
  });
  
  if (state.rooms.some(r => r.type === 'bathroom')) {
    sections.push({
      title: 'Plumbing',
      items: [
        'Rough-in for new fixture locations (if applicable)',
        'Install new shower valve, trim, and head',
        'Install new vanity faucet and drain',
        'Install new toilet',
        'Plumbing fixture allowance included',
      ],
    });
  }
  
  sections.push({
    title: 'Electrical / Lighting',
    items: [
      'Install recessed can lights as specified',
      'Install vanity/decorative lighting',
      'Add GFCI outlets as required by code',
      'Exhaust fan installation',
    ],
  });
  
  sections.push({
    title: 'Tile',
    items: [
      'Install cement board/backer on shower walls and floor',
      'Tile shower walls to ceiling height',
      'Tile shower floor with proper slope to drain',
      'Install floor tile throughout',
      'Tile material allowance: ~$6.20/sq ft (includes tile, thin-set, grout, sealer)',
    ],
  });
  
  if (state.rooms.some(r => r.type === 'kitchen') || state.rooms.some(r => r.type === 'bathroom')) {
    sections.push({
      title: 'Countertops',
      items: [
        'Fabricate and install quartz countertops',
        'Include sink cutout and edge profile',
        'Quartz allowance based on level 1, 3cm material',
      ],
    });
  }
  
  sections.push({
    title: 'Cabinets',
    items: [
      'Supply and install vanity cabinet(s)',
      state.rooms.some(r => r.type === 'kitchen') ? 'Supply and install kitchen cabinetry' : '',
      'Hardware allowance included',
    ].filter(Boolean),
  });
  
  if (state.rooms.some(r => r.type === 'bathroom')) {
    sections.push({
      title: 'Shower Glass',
      items: [
        'Measure and install frameless shower glass enclosure',
        'Glass allowance included',
      ],
    });
  }
  
  sections.push({
    title: 'Paint / Drywall',
    items: [
      'Repair/patch drywall as needed',
      'Prime and paint walls (2 coats)',
      'Paint trim and doors as specified',
    ],
  });
  
  sections.push({
    title: 'Miscellaneous / Cleanup',
    items: [
      'Install mirrors',
      'Install toilet paper holders, towel bars, etc.',
      'Final cleaning and touch-ups',
      'Project management and coordination',
    ],
  });
  
  return sections;
}

function generateCostBuckets(totalIC: number) {
  // Rough allocation percentages
  return [
    { name: 'Demo & Haul', internal: Math.round(totalIC * 0.08), client: Math.round(totalIC * 0.08 / 0.62) },
    { name: 'Plumbing', internal: Math.round(totalIC * 0.15), client: Math.round(totalIC * 0.15 / 0.62) },
    { name: 'Electrical', internal: Math.round(totalIC * 0.10), client: Math.round(totalIC * 0.10 / 0.62) },
    { name: 'Tile Labor + Material', internal: Math.round(totalIC * 0.25), client: Math.round(totalIC * 0.25 / 0.62) },
    { name: 'Cabinets & Counters', internal: Math.round(totalIC * 0.22), client: Math.round(totalIC * 0.22 / 0.62) },
    { name: 'Glass & Fixtures', internal: Math.round(totalIC * 0.12), client: Math.round(totalIC * 0.12 / 0.62) },
    { name: 'Paint & Finish', internal: Math.round(totalIC * 0.08), client: Math.round(totalIC * 0.08 / 0.62) },
  ];
}
