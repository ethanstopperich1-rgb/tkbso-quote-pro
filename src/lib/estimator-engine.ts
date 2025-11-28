import { Quote } from "@/types/estimator";
import { 
  calculateBathroomRange, 
  calculateKitchenRange, 
  calculateMargin,
  PRICING 
} from "./pricing";

// Simple state machine for conversation
type ConversationPhase = 'initial' | 'gathering' | 'clarifying' | 'generating';

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
  excludedWork: string[];
  rawInput: string;
  turnCount: number; // Track conversation turns to avoid loops
  askedQuestionBlock: boolean; // Track if we've already asked the full question block
}

const initialState: EstimatorState = {
  phase: 'initial',
  rooms: [],
  location: 'Orlando, FL',
  projectName: '',
  customerSupplied: [],
  specialRequests: [],
  excludedWork: [],
  rawInput: '',
  turnCount: 0,
  askedQuestionBlock: false,
};

let state: EstimatorState = { ...initialState };

export function resetEstimator() {
  state = { ...initialState };
}

// Parse dimensions from various formats: "36x58", "8' x 10'", "8x10", "103\"H", etc.
function parseDimensions(text: string): { sqft: number; rawDimensions: string[] } {
  const dimensions: string[] = [];
  let sqft = 0;
  
  // Direct sqft mention: "80 sq ft", "85 sqft", "100 square feet"
  const sqftMatch = text.match(/(\d+)\s*(sq\.?\s*ft\.?|square\s*feet?|sqft|sf)\b/i);
  if (sqftMatch) {
    sqft = parseInt(sqftMatch[1]);
    dimensions.push(`${sqft} sq ft`);
  }
  
  // Dimension patterns like "36x58", "8'x10'", "8 x 10", "36 x 58"
  const dimPatterns = [
    /(\d+(?:\.\d+)?)\s*['"]?\s*[xX×]\s*(\d+(?:\.\d+)?)\s*['"]?/g, // 36x58, 8'x10'
    /(\d+(?:\.\d+)?)\s*(?:feet|ft|')\s*[xX×by]\s*(\d+(?:\.\d+)?)\s*(?:feet|ft|')?/gi, // 8 feet x 10 feet
  ];
  
  for (const pattern of dimPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const dim1 = parseFloat(match[1]);
      const dim2 = parseFloat(match[2]);
      // If dimensions are small (under 20), assume feet; otherwise assume inches
      const multiplier = (dim1 > 20 || dim2 > 20) ? (1/144) : 1; // inches to sqft or feet to sqft
      const area = dim1 * dim2 * multiplier;
      if (sqft === 0) sqft = Math.round(area);
      dimensions.push(`${match[1]}x${match[2]}`);
    }
  }
  
  // Height patterns: "103\"H", "103" high", "8' walls"
  const heightMatch = text.match(/(\d+(?:\.\d+)?)\s*["']?\s*(?:H|high|height|walls?|ceilings?|tall)/i);
  if (heightMatch) {
    dimensions.push(`${heightMatch[1]}" height`);
  }
  
  return { sqft, rawDimensions: dimensions };
}

// Parse scope details from freeform text
function parseScope(text: string): { 
  isPartial: boolean; 
  isShowerOnly: boolean;
  includedWork: string[];
  excludedWork: string[];
} {
  const lowerText = text.toLowerCase();
  const includedWork: string[] = [];
  const excludedWork: string[] = [];
  
  // Check for partial/shower-only indicators
  const isShowerOnly = /shower[\s-]?only|just\s+(the\s+)?shower/i.test(text);
  const isPartial = isShowerOnly || /partial|some|just|only|cosmetic|refresh/i.test(lowerText);
  
  // Parse what's included
  if (/demo/i.test(text)) includedWork.push('Demo');
  if (/no\s+haul[\s-]?away/i.test(text)) excludedWork.push('Haul away');
  if (/shower\s*(valve|pan|liner|trim)/i.test(text)) includedWork.push('Shower valve/pan/liner/trim');
  if (/cement\s*board/i.test(text)) includedWork.push('Cement board');
  if (/tile/i.test(text)) includedWork.push('Tile work');
  if (/floor\s*tile/i.test(text)) includedWork.push('Floor tile');
  if (/wall\s*tile/i.test(text)) includedWork.push('Wall tile');
  
  // Parse what's excluded
  if (/no\s+electrical|without\s+electrical/i.test(text)) excludedWork.push('Electrical');
  if (/no\s+paint|without\s+paint/i.test(text)) excludedWork.push('Paint');
  if (/no\s+cabinet|without\s+cabinet/i.test(text)) excludedWork.push('Cabinets');
  if (/no\s+counter|no\s+tops?|without\s+counter/i.test(text)) excludedWork.push('Countertops');
  if (/no\s+flooring|without\s+flooring/i.test(text)) excludedWork.push('Flooring outside shower');
  
  return { isPartial, isShowerOnly, includedWork, excludedWork };
}

// Extract number of rooms from text
function parseRoomCount(text: string): number {
  const match = text.match(/(\d+)\s*(bathroom|bath|room|shower)/i);
  if (match) return parseInt(match[1]);
  
  // Check for plural indicators
  if (/bathrooms|baths|showers/i.test(text)) return 2; // Assume at least 2 if plural
  
  // Single room indicators
  if (/a\s+(bathroom|bath|shower)|one\s+(bathroom|bath|shower)|single|1\s+bath/i.test(text)) return 1;
  
  return 0; // Unknown
}

export function processUserMessage(userMessage: string): { response: string; quote?: Quote } {
  const lowerMessage = userMessage.toLowerCase();
  state.rawInput += ' ' + userMessage;
  state.turnCount++;
  
  // Parse dimensions from the message
  const { sqft: parsedSqft, rawDimensions } = parseDimensions(userMessage);
  
  // Parse scope details
  const scopeDetails = parseScope(userMessage);
  
  // Check for project type mentions
  const hasBathroom = /bath(room)?|shower|tub|vanit/i.test(lowerMessage);
  const hasKitchen = /kitchen/i.test(lowerMessage);
  const hasCloset = /closet/i.test(lowerMessage);
  
  // Check for GC/permit mentions
  const hasGC = /\b(with|have|using|yes)\b.*\b(gc|contractor)\b/i.test(lowerMessage) || 
                /\b(gc|contractor)\b.*\b(involved|handling|pulling)\b/i.test(lowerMessage);
  const noGC = /\b(no|without|don'?t have)\b.*\b(gc|contractor)\b/i.test(lowerMessage) ||
               /tkbso\s+(handling|pulling|doing)/i.test(lowerMessage);
  
  // Check quality mentions
  const highEnd = /high[\s-]?end|premium|luxury|custom|top/i.test(lowerMessage);
  const basic = /basic|budget|simple|standard|builder/i.test(lowerMessage);
  
  // Check scope mentions
  const fullGut = /full|gut|complete|everything|total|whole/i.test(lowerMessage) && !scopeDetails.isPartial;
  
  // Parse room count
  const roomCount = parseRoomCount(userMessage);

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
  
  if (highEnd) state.qualityLevel = 'high-end';
  else if (basic) state.qualityLevel = 'basic';
  else if (!state.qualityLevel) state.qualityLevel = 'mid-range'; // Default
  
  if (fullGut) state.scopeLevel = 'full-gut';
  else if (scopeDetails.isPartial || scopeDetails.isShowerOnly) state.scopeLevel = 'partial';
  
  // Store excluded work
  if (scopeDetails.excludedWork.length > 0) {
    state.excludedWork = [...new Set([...state.excludedWork, ...scopeDetails.excludedWork])];
  }
  
  // Add special requests for included work
  if (scopeDetails.includedWork.length > 0) {
    state.specialRequests = [...new Set([...state.specialRequests, ...scopeDetails.includedWork])];
  }
  
  // Extract room details if sqft provided or we can estimate
  if (parsedSqft > 0 && state.rooms.length === 0) {
    const roomType = hasKitchen && !hasBathroom ? 'kitchen' : 'bathroom';
    const count = roomCount || 1;
    for (let i = 0; i < count; i++) {
      state.rooms.push({
        type: roomType,
        name: roomType === 'kitchen' ? 'Kitchen' : (count > 1 ? `Bathroom ${i + 1}` : 'Bathroom'),
        sqft: Math.round(parsedSqft / count),
        features: rawDimensions,
      });
    }
  } else if (rawDimensions.length > 0 && state.rooms.length === 0 && scopeDetails.isShowerOnly) {
    // Shower-only with dimensions but no sqft calculated - estimate shower area
    // Typical shower is ~15-20 sqft, bathroom ~50-80 sqft
    const estimatedSqft = parsedSqft || 50; // Default bathroom size for shower-only
    state.rooms.push({
      type: 'bathroom',
      name: 'Bathroom (Shower Only)',
      sqft: estimatedSqft,
      features: rawDimensions,
    });
  }
  
  // CRITICAL: After 2+ turns with enough info, generate quote with assumptions
  const hasEnoughToQuote = state.projectType && (state.rooms.length > 0 || state.turnCount >= 2);
  
  // If this is the first message and we don't know the project type, ask initial question
  if (state.turnCount === 1 && !state.projectType) {
    state.askedQuestionBlock = true;
    return {
      response: `I'd be happy to help you get a quote ready! Could you tell me:\n\n1. **What type of project?** (Kitchen, bathroom, or both?)\n2. **Approximate room size** (rough dimensions or sq ft)\n3. **Scope** – Full gut remodel or partial/cosmetic update?\n\nFeel free to describe it in your own words – I'll parse the details!`
    };
  }
  
  // If we just learned project type but have NO size info at all, ask ONE short follow-up
  if (state.projectType && state.rooms.length === 0 && rawDimensions.length === 0 && state.turnCount < 3 && !state.askedQuestionBlock) {
    state.askedQuestionBlock = true;
    const projectLabel = state.projectType === 'combination' ? 'kitchen and bathroom' : state.projectType;
    
    // Acknowledge what we understood first
    let acknowledgment = `Got it`;
    if (scopeDetails.isShowerOnly) {
      acknowledgment = `Got it, shower-only remodel`;
    } else if (state.scopeLevel === 'partial') {
      acknowledgment = `Got it, partial ${projectLabel} remodel`;
    } else {
      acknowledgment = `Got it, ${projectLabel} remodel`;
    }
    
    if (state.excludedWork.length > 0) {
      acknowledgment += ` (no ${state.excludedWork.join(', ').toLowerCase()})`;
    }
    
    return {
      response: `${acknowledgment}. Quick question: **About how big is the space?** (rough sq ft or dimensions like "8x10" work fine)`
    };
  }
  
  // If we have project type but no rooms after multiple turns, make reasonable assumptions
  if (state.projectType && state.rooms.length === 0) {
    // Make assumptions based on project type
    if (state.projectType === 'bathroom') {
      const assumedSqft = scopeDetails.isShowerOnly ? 50 : 75;
      state.rooms.push({ 
        type: 'bathroom', 
        name: scopeDetails.isShowerOnly ? 'Bathroom (Shower Only)' : 'Bathroom', 
        sqft: assumedSqft, 
        features: ['Assumed standard size'] 
      });
    } else if (state.projectType === 'kitchen') {
      state.rooms.push({ type: 'kitchen', name: 'Kitchen', sqft: 150, features: ['Assumed standard size'] });
    } else if (state.projectType === 'combination') {
      state.rooms.push({ type: 'bathroom', name: 'Bathroom', sqft: 75, features: ['Assumed standard size'] });
      state.rooms.push({ type: 'kitchen', name: 'Kitchen', sqft: 150, features: ['Assumed standard size'] });
    }
  }
  
  // Default GC assumption if not specified
  if (state.hasGC === undefined) {
    state.hasGC = false; // Assume no GC by default
  }
  
  // Generate the quote
  return generateQuote();
}

function generateQuote(): { response: string; quote: Quote } {
  // Calculate totals based on rooms
  let totalLow = 0;
  let totalHigh = 0;
  let totalSqft = 0;
  
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
  
  // Adjust for partial/shower-only scope
  if (state.scopeLevel === 'partial') {
    totalLow *= 0.55; // Partial is roughly 55-65% of full gut
    totalHigh *= 0.65;
  }
  
  // Adjust for excluded work
  if (state.excludedWork.includes('Electrical')) {
    totalLow *= 0.92;
    totalHigh *= 0.92;
  }
  if (state.excludedWork.includes('Paint')) {
    totalLow *= 0.95;
    totalHigh *= 0.95;
  }
  if (state.excludedWork.includes('Cabinets')) {
    totalLow *= 0.85;
    totalHigh *= 0.85;
  }
  if (state.excludedWork.includes('Countertops')) {
    totalLow *= 0.90;
    totalHigh *= 0.90;
  }
  if (state.excludedWork.includes('Haul away')) {
    totalLow -= 500;
    totalHigh -= 500;
  }
  
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
  
  // Build scope summary
  let scopeSummary = state.scopeLevel === 'full-gut' ? 'Full gut remodel' : 'Partial remodel';
  if (state.rooms.some(r => r.name.includes('Shower Only'))) {
    scopeSummary = 'Shower-only remodel';
  }
  if (state.excludedWork.length > 0) {
    scopeSummary += ` (excludes: ${state.excludedWork.join(', ')})`;
  }
  
  const quote: Quote = {
    projectSnapshot: {
      name: state.projectName || `${state.projectType?.charAt(0).toUpperCase()}${state.projectType?.slice(1)} Remodel Project`,
      location: state.location,
      roomsSummary,
      scopeSummary,
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
    assumptions: buildAssumptions(),
    openQuestions: buildOpenQuestions(),
  };
  
  // Build acknowledgment response
  let response = `Here's the TKBSO quote based on what you've described:`;
  
  // If we made assumptions, mention them briefly
  const hasAssumedSize = state.rooms.some(r => r.features.includes('Assumed standard size'));
  if (hasAssumedSize) {
    response = `I've put together a quote using standard sizing assumptions. Please verify dimensions on site:`;
  }
  
  return { response, quote };
}

function buildAssumptions(): string[] {
  const assumptions: string[] = [];
  
  // Scope assumptions
  if (state.scopeLevel === 'partial') {
    assumptions.push('Partial remodel scope – not a full gut renovation');
  }
  
  // Size assumptions
  const hasAssumedSize = state.rooms.some(r => r.features.includes('Assumed standard size'));
  if (hasAssumedSize) {
    assumptions.push('Room dimensions assumed – verify on site visit');
  }
  
  // Quality assumptions
  if (state.qualityLevel) {
    assumptions.push(`${state.qualityLevel.charAt(0).toUpperCase() + state.qualityLevel.slice(1)} finish level`);
  }
  
  // Standard assumptions
  assumptions.push('Standard tile material allowance at ~$6.20/sq ft');
  assumptions.push('Single niche per shower assumed');
  
  // GC assumption
  if (state.hasGC) {
    assumptions.push('GC permit fee of $2,500 included');
  } else {
    assumptions.push('No GC involved – TKBSO direct');
  }
  
  // Excluded work
  if (state.excludedWork.length > 0) {
    assumptions.push(`Excludes: ${state.excludedWork.join(', ')}`);
  }
  
  return assumptions;
}

function buildOpenQuestions(): string[] {
  const questions: string[] = [];
  
  const hasAssumedSize = state.rooms.some(r => r.features.includes('Assumed standard size'));
  if (hasAssumedSize) {
    questions.push('Confirm exact room dimensions');
  }
  
  questions.push('Review client fixture/tile selections vs allowances');
  questions.push('Verify any structural or layout changes needed');
  
  if (!state.hasGC && state.needsPermit !== false) {
    questions.push('Confirm if permits are required');
  }
  
  return questions;
}

function generateScopeOfWork() {
  const sections = [];
  const isPartial = state.scopeLevel === 'partial';
  const isShowerOnly = state.rooms.some(r => r.name.includes('Shower Only'));
  const excludes = new Set(state.excludedWork.map(w => w.toLowerCase()));
  
  // Demo
  if (!excludes.has('demo')) {
    sections.push({
      title: 'Demo',
      items: [
        isShowerOnly ? 'Remove existing shower fixtures and finishes' : 'Remove and dispose of existing fixtures, cabinets, and finishes',
        'Protect adjacent areas during demolition',
        excludes.has('haul away') ? 'Demo debris left on site (no haul away)' : 'Haul away all debris',
      ],
    });
  }
  
  // Plumbing
  if (state.rooms.some(r => r.type === 'bathroom') && !excludes.has('plumbing')) {
    const plumbingItems = isShowerOnly 
      ? [
          'Install new shower valve, trim kit, and head',
          'New shower pan and liner',
          'Plumbing fixture allowance included',
        ]
      : [
          'Rough-in for new fixture locations (if applicable)',
          'Install new shower valve, trim, and head',
          'Install new vanity faucet and drain',
          'Install new toilet',
          'Plumbing fixture allowance included',
        ];
    sections.push({
      title: 'Plumbing',
      items: plumbingItems,
    });
  }
  
  // Electrical
  if (!excludes.has('electrical')) {
    sections.push({
      title: 'Electrical / Lighting',
      items: isShowerOnly 
        ? ['Verify/update GFCI as required by code']
        : [
            'Install recessed can lights as specified',
            'Install vanity/decorative lighting',
            'Add GFCI outlets as required by code',
            'Exhaust fan installation',
          ],
    });
  }
  
  // Tile
  if (!excludes.has('tile')) {
    sections.push({
      title: 'Tile',
      items: [
        'Install cement board/backer on shower walls and floor',
        'Tile shower walls to ceiling height',
        'Tile shower floor with proper slope to drain',
        !isShowerOnly && !excludes.has('flooring') ? 'Install floor tile throughout' : '',
        'Tile material allowance: ~$6.20/sq ft (includes tile, thin-set, grout, sealer)',
      ].filter(Boolean),
    });
  }
  
  // Countertops
  if (!isShowerOnly && !excludes.has('countertops') && (state.rooms.some(r => r.type === 'kitchen') || state.rooms.some(r => r.type === 'bathroom'))) {
    sections.push({
      title: 'Countertops',
      items: [
        'Fabricate and install quartz countertops',
        'Include sink cutout and edge profile',
        'Quartz allowance based on level 1, 3cm material',
      ],
    });
  }
  
  // Cabinets
  if (!isShowerOnly && !excludes.has('cabinets')) {
    sections.push({
      title: 'Cabinets',
      items: [
        'Supply and install vanity cabinet(s)',
        state.rooms.some(r => r.type === 'kitchen') ? 'Supply and install kitchen cabinetry' : '',
        'Hardware allowance included',
      ].filter(Boolean),
    });
  }
  
  // Shower Glass
  if (state.rooms.some(r => r.type === 'bathroom')) {
    sections.push({
      title: 'Shower Glass',
      items: [
        'Measure and install frameless shower glass enclosure',
        'Glass allowance included',
      ],
    });
  }
  
  // Paint / Drywall
  if (!excludes.has('paint')) {
    sections.push({
      title: 'Paint / Drywall',
      items: isShowerOnly
        ? ['Patch/repair drywall around shower area as needed']
        : [
            'Repair/patch drywall as needed',
            'Prime and paint walls (2 coats)',
            'Paint trim and doors as specified',
          ],
    });
  }
  
  // Miscellaneous
  sections.push({
    title: 'Miscellaneous / Cleanup',
    items: [
      !isShowerOnly ? 'Install mirrors' : '',
      !isShowerOnly ? 'Install toilet paper holders, towel bars, etc.' : '',
      'Final cleaning and touch-ups',
      'Project management and coordination',
    ].filter(Boolean),
  });
  
  return sections;
}

function generateCostBuckets(totalIC: number) {
  const isShowerOnly = state.rooms.some(r => r.name.includes('Shower Only'));
  
  if (isShowerOnly) {
    return [
      { name: 'Demo', internal: Math.round(totalIC * 0.10), client: Math.round(totalIC * 0.10 / 0.62) },
      { name: 'Plumbing', internal: Math.round(totalIC * 0.25), client: Math.round(totalIC * 0.25 / 0.62) },
      { name: 'Tile Labor + Material', internal: Math.round(totalIC * 0.40), client: Math.round(totalIC * 0.40 / 0.62) },
      { name: 'Glass', internal: Math.round(totalIC * 0.18), client: Math.round(totalIC * 0.18 / 0.62) },
      { name: 'Finish & Cleanup', internal: Math.round(totalIC * 0.07), client: Math.round(totalIC * 0.07 / 0.62) },
    ];
  }
  
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
