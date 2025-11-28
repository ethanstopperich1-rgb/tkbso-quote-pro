import { Quote } from "@/types/estimator";
import { 
  calculateBathroomRange, 
  calculateKitchenRange, 
  calculateMargin,
  PRICING 
} from "./pricing";

// Strict 4-stage conversation workflow
type ConversationStage = 'collecting' | 'confirming' | 'client_details' | 'generating';

interface RoomData {
  type: 'kitchen' | 'bathroom' | 'closet';
  name: string;
  sqft: number;
  scopeLevel: 'full_gut' | 'partial' | 'shower_only' | 'refresh';
  features: string[];
}

interface ClientDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface EstimatorState {
  stage: ConversationStage;
  // Project inputs
  projectType?: 'kitchen' | 'bathroom' | 'combination' | 'closet';
  rooms: RoomData[];
  hasGC?: boolean;
  needsPermit?: boolean;
  qualityLevel?: 'basic' | 'mid-range' | 'high-end';
  excludedWork: string[];
  includedWork: string[];
  rawInput: string;
  // Client details
  clientDetails: Partial<ClientDetails>;
  // Tracking
  assumptionsConfirmed: boolean;
  clientDetailsProvided: boolean;
}

const initialState: EstimatorState = {
  stage: 'collecting',
  rooms: [],
  excludedWork: [],
  includedWork: [],
  rawInput: '',
  clientDetails: {},
  assumptionsConfirmed: false,
  clientDetailsProvided: false,
};

let state: EstimatorState = { ...initialState };

export function resetEstimator() {
  state = { ...initialState };
}

export function getEstimatorStage(): ConversationStage {
  return state.stage;
}

// Parse dimensions from various formats
function parseDimensions(text: string): { sqft: number; rawDimensions: string[] } {
  const dimensions: string[] = [];
  let sqft = 0;
  
  // Direct sqft mention
  const sqftMatch = text.match(/(\d+)\s*(sq\.?\s*ft\.?|square\s*feet?|sqft|sf)\b/i);
  if (sqftMatch) {
    sqft = parseInt(sqftMatch[1]);
    dimensions.push(`${sqft} sq ft`);
  }
  
  // Dimension patterns
  const dimPatterns = [
    /(\d+(?:\.\d+)?)\s*['"]?\s*[xX×]\s*(\d+(?:\.\d+)?)\s*['"]?/g,
    /(\d+(?:\.\d+)?)\s*(?:feet|ft|')\s*[xX×by]\s*(\d+(?:\.\d+)?)\s*(?:feet|ft|')?/gi,
  ];
  
  for (const pattern of dimPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const dim1 = parseFloat(match[1]);
      const dim2 = parseFloat(match[2]);
      const multiplier = (dim1 > 20 || dim2 > 20) ? (1/144) : 1;
      const area = dim1 * dim2 * multiplier;
      if (sqft === 0) sqft = Math.round(area);
      dimensions.push(`${match[1]}x${match[2]}`);
    }
  }
  
  return { sqft, rawDimensions: dimensions };
}

// Parse scope details
function parseScope(text: string): { 
  isPartial: boolean; 
  isShowerOnly: boolean;
  scopeLevel: 'full_gut' | 'partial' | 'shower_only' | 'refresh';
  includedWork: string[];
  excludedWork: string[];
} {
  const lowerText = text.toLowerCase();
  const includedWork: string[] = [];
  const excludedWork: string[] = [];
  
  const isShowerOnly = /shower[\s-]?only|just\s+(the\s+)?shower/i.test(text);
  const isRefresh = /refresh|cosmetic|light\s+update/i.test(lowerText);
  const isPartial = /partial|some\s+work|limited/i.test(lowerText);
  const isFullGut = /full[\s-]?gut|complete|total|everything/i.test(lowerText);
  
  let scopeLevel: 'full_gut' | 'partial' | 'shower_only' | 'refresh' = 'full_gut';
  if (isShowerOnly) scopeLevel = 'shower_only';
  else if (isRefresh) scopeLevel = 'refresh';
  else if (isPartial) scopeLevel = 'partial';
  else if (isFullGut) scopeLevel = 'full_gut';
  
  // Parse inclusions
  if (/demo/i.test(text)) includedWork.push('Demo');
  if (/shower\s*(valve|pan|liner|trim)/i.test(text)) includedWork.push('Shower valve/pan/liner/trim');
  if (/cement\s*board/i.test(text)) includedWork.push('Cement board');
  if (/tile/i.test(text)) includedWork.push('Tile work');
  if (/cabinet/i.test(text)) includedWork.push('Cabinets');
  if (/counter|quartz|granite/i.test(text)) includedWork.push('Countertops');
  if (/glass/i.test(text)) includedWork.push('Shower glass');
  if (/vanit/i.test(text)) includedWork.push('Vanity');
  if (/plumb/i.test(text)) includedWork.push('Plumbing');
  if (/electric/i.test(text)) includedWork.push('Electrical');
  
  // Parse exclusions
  if (/no\s+haul[\s-]?away/i.test(text)) excludedWork.push('Haul away');
  if (/no\s+electrical|without\s+electrical/i.test(text)) excludedWork.push('Electrical');
  if (/no\s+paint|without\s+paint/i.test(text)) excludedWork.push('Paint');
  if (/no\s+cabinet|without\s+cabinet/i.test(text)) excludedWork.push('Cabinets');
  if (/no\s+counter|no\s+tops?|without\s+counter/i.test(text)) excludedWork.push('Countertops');
  
  return { 
    isPartial: isPartial || isShowerOnly || isRefresh, 
    isShowerOnly, 
    scopeLevel,
    includedWork, 
    excludedWork 
  };
}

// Parse room count
function parseRoomCount(text: string): number {
  const match = text.match(/(\d+)\s*(bathroom|bath|room|shower|kitchen)/i);
  if (match) return parseInt(match[1]);
  if (/bathrooms|baths|showers|kitchens/i.test(text)) return 2;
  if (/a\s+(bathroom|bath|shower|kitchen)|one\s+(bathroom|bath|shower|kitchen)|single|1\s+(bath|kitchen)/i.test(text)) return 1;
  return 0;
}

// Check if we have enough inputs to proceed to Stage 2
function hasEnoughInputs(): boolean {
  if (!state.projectType) return false;
  if (state.rooms.length === 0) return false;
  const hasValidRoom = state.rooms.some(r => r.sqft > 0);
  return hasValidRoom;
}

// Build assumption summary
function buildAssumptionSummary(): string {
  const lines: string[] = [];
  
  lines.push('**I have the following details so far:**\n');
  
  // Project type
  const typeLabel = state.projectType === 'combination' ? 'Kitchen + Bathroom' : 
    state.projectType?.charAt(0).toUpperCase() + state.projectType?.slice(1);
  lines.push(`• **Project type:** ${typeLabel} remodel`);
  
  // Rooms
  state.rooms.forEach(room => {
    const scopeLabel = room.scopeLevel === 'full_gut' ? 'Full gut' :
      room.scopeLevel === 'shower_only' ? 'Shower only' :
      room.scopeLevel === 'partial' ? 'Partial' : 'Refresh';
    lines.push(`• **${room.name}:** ${room.sqft} sq ft – ${scopeLabel} scope`);
  });
  
  // Quality
  lines.push(`• **Finish level:** ${state.qualityLevel || 'Mid-range'}`);
  
  // GC/Permit
  if (state.hasGC !== undefined) {
    lines.push(`• **GC involvement:** ${state.hasGC ? 'Yes – GC partner handling permits' : 'No – TKBSO direct'}`);
  } else {
    lines.push('• **GC involvement:** None assumed (TKBSO direct)');
  }
  
  // Included work
  if (state.includedWork.length > 0) {
    lines.push(`• **Includes:** ${state.includedWork.join(', ')}`);
  }
  
  // Excluded work
  if (state.excludedWork.length > 0) {
    lines.push(`• **Excludes:** ${state.excludedWork.join(', ')}`);
  }
  
  lines.push('\n**Please confirm these assumptions are correct, or tell me what to change.**');
  
  return lines.join('\n');
}

// Parse client details from message
function parseClientDetails(text: string): Partial<ClientDetails> {
  const details: Partial<ClientDetails> = {};
  
  // Name patterns
  const nameMatch = text.match(/(?:name(?:\s+is)?|client|customer|for)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+(?:and|&)\s+)?[A-Z][a-z]*(?:\s+[A-Z][a-z]+)?)/i);
  if (nameMatch) details.name = nameMatch[1].trim();
  
  // Phone patterns
  const phoneMatch = text.match(/(?:phone|cell|mobile|tel|#)?[:\s]*(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/);
  if (phoneMatch) details.phone = phoneMatch[1];
  
  // Email patterns
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) details.email = emailMatch[1];
  
  // Address - look for street number + street name
  const addressMatch = text.match(/(\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Way|Court|Ct|Boulevard|Blvd|Circle|Cir|Place|Pl)\.?)/i);
  if (addressMatch) details.address = addressMatch[1].trim();
  
  // City, State, ZIP
  const cityStateZip = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?/);
  if (cityStateZip) {
    details.city = cityStateZip[1];
    details.state = cityStateZip[2];
    if (cityStateZip[3]) details.zip = cityStateZip[3];
  }
  
  // Standalone zip
  const zipMatch = text.match(/\b(\d{5}(?:-\d{4})?)\b/);
  if (zipMatch && !details.zip) details.zip = zipMatch[1];
  
  return details;
}

// Check if client details are complete
function hasCompleteClientDetails(): boolean {
  const d = state.clientDetails;
  return !!(d.name && d.address && d.city && d.state);
}

// Get missing client detail fields
function getMissingClientFields(): string[] {
  const missing: string[] = [];
  const d = state.clientDetails;
  if (!d.name) missing.push('Client name');
  if (!d.phone) missing.push('Phone number');
  if (!d.email) missing.push('Email');
  if (!d.address) missing.push('Property address');
  if (!d.city || !d.state) missing.push('City/State/ZIP');
  return missing;
}

export function processUserMessage(userMessage: string): { response: string; quote?: Quote } {
  const lowerMessage = userMessage.toLowerCase();
  state.rawInput += ' ' + userMessage;
  
  // Check for confirmation keywords
  const isConfirmation = /^(yes|confirm|correct|looks?\s+good|that'?s?\s+(right|correct)|approved?|go\s+ahead)/i.test(userMessage.trim());
  const isEdit = /^(no|change|edit|update|wrong|incorrect|fix|actually)/i.test(userMessage.trim());
  
  // ==================== STAGE 1: COLLECTING ====================
  if (state.stage === 'collecting') {
    // Parse all input data
    const { sqft: parsedSqft, rawDimensions } = parseDimensions(userMessage);
    const scopeDetails = parseScope(userMessage);
    
    const hasBathroom = /bath(room)?|shower|tub|vanit/i.test(lowerMessage);
    const hasKitchen = /kitchen/i.test(lowerMessage);
    const hasCloset = /closet/i.test(lowerMessage);
    
    // Update project type
    if (hasBathroom && hasKitchen) state.projectType = 'combination';
    else if (hasBathroom) state.projectType = 'bathroom';
    else if (hasKitchen) state.projectType = 'kitchen';
    else if (hasCloset) state.projectType = 'closet';
    
    // GC/Permit
    if (/\b(with|have|using|yes)\b.*\b(gc|contractor)\b/i.test(lowerMessage)) state.hasGC = true;
    if (/\b(no|without)\b.*\b(gc|contractor)\b/i.test(lowerMessage)) state.hasGC = false;
    if (/permit/i.test(lowerMessage)) state.needsPermit = true;
    
    // Quality
    if (/high[\s-]?end|premium|luxury|custom/i.test(lowerMessage)) state.qualityLevel = 'high-end';
    else if (/basic|budget|simple|builder/i.test(lowerMessage)) state.qualityLevel = 'basic';
    else if (!state.qualityLevel) state.qualityLevel = 'mid-range';
    
    // Store excluded/included work
    state.excludedWork = [...new Set([...state.excludedWork, ...scopeDetails.excludedWork])];
    state.includedWork = [...new Set([...state.includedWork, ...scopeDetails.includedWork])];
    
    // Parse room count
    const roomCount = parseRoomCount(userMessage);
    
    // Add room data if we have sqft
    if (parsedSqft > 0) {
      const roomType = hasKitchen && !hasBathroom ? 'kitchen' : 'bathroom';
      const count = roomCount || 1;
      state.rooms = []; // Reset rooms
      for (let i = 0; i < count; i++) {
        state.rooms.push({
          type: roomType,
          name: roomType === 'kitchen' ? 'Kitchen' : (count > 1 ? `Bathroom ${i + 1}` : 'Bathroom'),
          sqft: Math.round(parsedSqft / count),
          scopeLevel: scopeDetails.scopeLevel,
          features: rawDimensions,
        });
      }
    }
    
    // If adding closet separately
    if (hasCloset && !state.rooms.some(r => r.type === 'closet')) {
      const closetSqft = parsedSqft > 0 ? Math.round(parsedSqft * 0.2) : 40;
      // Only add if it seems to be mentioned as separate
      if (/closet/i.test(userMessage) && state.rooms.length > 0) {
        state.rooms.push({
          type: 'closet',
          name: 'Closet',
          sqft: closetSqft,
          scopeLevel: 'full_gut',
          features: [],
        });
      }
    }
    
    // Check if we have enough to move to Stage 2
    if (hasEnoughInputs()) {
      state.stage = 'confirming';
      return {
        response: buildAssumptionSummary()
      };
    }
    
    // Ask for missing information
    const missing: string[] = [];
    if (!state.projectType) missing.push('project type (kitchen, bathroom, or both)');
    if (state.rooms.length === 0 || !state.rooms.some(r => r.sqft > 0)) {
      missing.push('room dimensions or square footage');
    }
    if (state.projectType && !state.rooms.some(r => r.scopeLevel)) {
      missing.push('scope level (full gut, partial, or shower-only)');
    }
    
    if (missing.length > 0) {
      return {
        response: `I need a bit more info to build your quote:\n\n• ${missing.join('\n• ')}\n\nJust describe it in your own words – I'll parse the details.`
      };
    }
    
    // Generic collection prompt
    return {
      response: `Tell me more about this project. What's the approximate size, and is this a full gut remodel or partial update?`
    };
  }
  
  // ==================== STAGE 2: CONFIRMING ====================
  if (state.stage === 'confirming') {
    // User wants to edit assumptions
    if (isEdit) {
      state.stage = 'collecting';
      return {
        response: `No problem – what would you like to change? You can update the room size, scope level, or any other details.`
      };
    }
    
    // User confirms assumptions
    if (isConfirmation) {
      state.assumptionsConfirmed = true;
      state.stage = 'client_details';
      return {
        response: `Great! Now I need the client information for the quote:\n\n• **Client name**\n• **Phone number**\n• **Email**\n• **Property address** (street, city, state, ZIP)\n\nYou can provide all at once or one at a time.`
      };
    }
    
    // User provides additional project info – update and re-summarize
    const { sqft: parsedSqft } = parseDimensions(userMessage);
    const scopeDetails = parseScope(userMessage);
    
    if (parsedSqft > 0 && state.rooms.length > 0) {
      state.rooms[0].sqft = parsedSqft;
    }
    if (scopeDetails.scopeLevel) {
      state.rooms.forEach(r => r.scopeLevel = scopeDetails.scopeLevel);
    }
    if (scopeDetails.excludedWork.length > 0) {
      state.excludedWork = [...new Set([...state.excludedWork, ...scopeDetails.excludedWork])];
    }
    if (scopeDetails.includedWork.length > 0) {
      state.includedWork = [...new Set([...state.includedWork, ...scopeDetails.includedWork])];
    }
    
    // Re-show assumptions
    return {
      response: buildAssumptionSummary()
    };
  }
  
  // ==================== STAGE 3: CLIENT DETAILS ====================
  if (state.stage === 'client_details') {
    // Parse client details from message
    const newDetails = parseClientDetails(userMessage);
    state.clientDetails = { ...state.clientDetails, ...newDetails };
    
    // Also check for plain text client name if nothing parsed
    if (!state.clientDetails.name && userMessage.length < 50 && !/\d/.test(userMessage)) {
      // Might be just a name
      const words = userMessage.trim().split(/\s+/);
      if (words.length <= 4 && words.every(w => /^[A-Z]/i.test(w))) {
        state.clientDetails.name = userMessage.trim();
      }
    }
    
    // Check if we have enough
    if (hasCompleteClientDetails()) {
      state.clientDetailsProvided = true;
      state.stage = 'generating';
      return generateQuote();
    }
    
    // Ask for missing fields
    const missingFields = getMissingClientFields();
    if (missingFields.length > 0) {
      // Acknowledge what we got
      const received: string[] = [];
      if (state.clientDetails.name) received.push(`Client: ${state.clientDetails.name}`);
      if (state.clientDetails.phone) received.push(`Phone: ${state.clientDetails.phone}`);
      if (state.clientDetails.email) received.push(`Email: ${state.clientDetails.email}`);
      if (state.clientDetails.address) received.push(`Address: ${state.clientDetails.address}`);
      if (state.clientDetails.city) received.push(`City: ${state.clientDetails.city}, ${state.clientDetails.state || ''} ${state.clientDetails.zip || ''}`);
      
      let response = '';
      if (received.length > 0) {
        response = `Got it:\n${received.map(r => `• ${r}`).join('\n')}\n\n`;
      }
      response += `I still need:\n• ${missingFields.join('\n• ')}`;
      
      return { response };
    }
    
    return {
      response: `Please provide the client's name, phone, email, and property address to generate the quote.`
    };
  }
  
  // ==================== STAGE 4: GENERATING ====================
  if (state.stage === 'generating') {
    // Quote already generated, user might want to edit or start over
    if (/new|start\s+over|reset|different/i.test(lowerMessage)) {
      resetEstimator();
      return {
        response: `Starting fresh! Tell me about your next project.`
      };
    }
    
    return {
      response: `The quote has been generated! You can:\n• Click "Download PDF" to get the client-ready proposal\n• Click "Start New Quote" to begin a new estimate\n\nIs there anything you'd like to adjust?`
    };
  }
  
  return {
    response: `I'm not sure what you mean. Could you clarify?`
  };
}

function generateQuote(): { response: string; quote: Quote } {
  // Calculate totals based on rooms
  let totalLow = 0;
  let totalHigh = 0;
  let totalSqft = 0;
  
  state.rooms.forEach(room => {
    totalSqft += room.sqft;
    
    // Scope multiplier
    let scopeMultiplier = 1.0;
    if (room.scopeLevel === 'partial') scopeMultiplier = 0.75;
    else if (room.scopeLevel === 'shower_only') scopeMultiplier = 0.60;
    else if (room.scopeLevel === 'refresh') scopeMultiplier = 0.50;
    
    if (room.type === 'bathroom') {
      const range = calculateBathroomRange(room.sqft);
      totalLow += range.low * scopeMultiplier;
      totalHigh += range.high * scopeMultiplier;
    } else if (room.type === 'kitchen') {
      const range = calculateKitchenRange(room.sqft);
      totalLow += range.low * scopeMultiplier;
      totalHigh += range.high * scopeMultiplier;
    } else if (room.type === 'closet') {
      totalLow += room.sqft * PRICING.perSqFt.closet.low;
      totalHigh += room.sqft * PRICING.perSqFt.closet.high;
    }
  });
  
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
  const primaryScope = state.rooms[0]?.scopeLevel || 'full_gut';
  let scopeSummary = primaryScope === 'full_gut' ? 'Full gut remodel' :
    primaryScope === 'shower_only' ? 'Shower-only remodel' :
    primaryScope === 'partial' ? 'Partial remodel' : 'Refresh/cosmetic update';
  
  if (state.excludedWork.length > 0) {
    scopeSummary += ` (excludes: ${state.excludedWork.join(', ')})`;
  }
  
  // Client info
  const clientName = state.clientDetails.name || 'TBD';
  const fullAddress = [
    state.clientDetails.address,
    state.clientDetails.city,
    state.clientDetails.state,
    state.clientDetails.zip
  ].filter(Boolean).join(', ');
  
  const quote: Quote = {
    projectSnapshot: {
      name: `${state.projectType?.charAt(0).toUpperCase()}${state.projectType?.slice(1)} Remodel – ${clientName}`,
      location: fullAddress || 'Orlando, FL',
      roomsSummary,
      scopeSummary,
      permitGCSummary: state.hasGC 
        ? 'GC involved – permit handled by partnered contractor' 
        : 'No GC – TKBSO to handle permitting if required',
    },
    clientInfo: {
      name: state.clientDetails.name || '',
      phone: state.clientDetails.phone || '',
      email: state.clientDetails.email || '',
      address: state.clientDetails.address || '',
      city: state.clientDetails.city || '',
      state: state.clientDetails.state || '',
      zip: state.clientDetails.zip || '',
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
  
  const response = `**Quote Generated for ${clientName}**\n\n` +
    `📍 ${fullAddress}\n` +
    `📱 ${state.clientDetails.phone || 'No phone'} | ✉️ ${state.clientDetails.email || 'No email'}\n\n` +
    `The estimate is ready! Review the details below and click **Download PDF** when ready.`;
  
  return { response, quote };
}

function buildAssumptions(): string[] {
  const assumptions: string[] = [];
  
  state.rooms.forEach(room => {
    const scopeLabel = room.scopeLevel === 'full_gut' ? 'Full gut' :
      room.scopeLevel === 'shower_only' ? 'Shower only' :
      room.scopeLevel === 'partial' ? 'Partial' : 'Refresh';
    assumptions.push(`${room.name}: ${room.sqft} sq ft, ${scopeLabel} scope`);
  });
  
  assumptions.push(`${(state.qualityLevel || 'mid-range').charAt(0).toUpperCase() + (state.qualityLevel || 'mid-range').slice(1)} finish level`);
  assumptions.push('Standard tile material allowance at ~$6.20/sq ft');
  
  if (state.hasGC) {
    assumptions.push('GC permit fee of $2,500 included');
  } else {
    assumptions.push('No GC involved – TKBSO direct');
  }
  
  if (state.excludedWork.length > 0) {
    assumptions.push(`Excludes: ${state.excludedWork.join(', ')}`);
  }
  
  return assumptions;
}

function buildOpenQuestions(): string[] {
  return [
    'Confirm exact room dimensions on site',
    'Review client fixture/tile selections vs allowances',
    'Verify any structural or layout changes needed',
    !state.hasGC ? 'Confirm if permits are required' : '',
  ].filter(Boolean);
}

function generateScopeOfWork() {
  const sections = [];
  const primaryScope = state.rooms[0]?.scopeLevel || 'full_gut';
  const isShowerOnly = primaryScope === 'shower_only';
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
    sections.push({
      title: 'Plumbing',
      items: isShowerOnly 
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
          ],
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
        !isShowerOnly ? 'Install floor tile throughout' : '',
        'Tile material allowance: ~$6.20/sq ft (includes tile, thin-set, grout, sealer)',
      ].filter(Boolean),
    });
  }
  
  // Countertops
  if (!isShowerOnly && !excludes.has('countertops')) {
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
  const primaryScope = state.rooms[0]?.scopeLevel || 'full_gut';
  const isShowerOnly = primaryScope === 'shower_only';
  
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
