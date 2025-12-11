import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { Contractor, Estimate, PricingConfig } from '@/types/database';
import { ContractorSettings, defaultSettings } from '@/types/settings';
import tkbsoLogo from '@/assets/tkbso-logo-full.png';
import { formatLineItemForPdf } from '@/lib/line-item-descriptions';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 100, // Space for fixed header
    paddingBottom: 70,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff',
  },
  
  // Fixed Header with large logo banner (appears on every page)
  headerBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 50,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logo: {
    width: 200,
    height: 'auto',
    marginBottom: 6,
  },
  headerContactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 6,
  },
  headerContactText: {
    fontSize: 9,
    color: '#1e3a8a',
  },
  quoteTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginTop: 16,
  },
  quoteDate: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  
  // Client Info
  clientSection: {
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  clientRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  clientLabel: {
    width: 60,
    fontSize: 9,
    color: '#64748b',
  },
  clientValue: {
    flex: 1,
    fontSize: 9,
    color: '#1e293b',
  },
  
  // Trade Section
  tradeSection: {
    marginBottom: 8,
  },
  tradeHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e3a8a',
    paddingBottom: 2,
    marginBottom: 4,
  },
  lineItem: {
    flexDirection: 'row',
    paddingVertical: 2,
    paddingLeft: 6,
  },
  lineItemText: {
    flex: 1,
    fontSize: 9,
    color: '#475569',
  },
  lineItemPrice: {
    width: 65,
    fontSize: 9,
    color: '#1e293b',
    textAlign: 'right',
  },
  tradeTotalRow: {
    flexDirection: 'row',
    paddingTop: 2,
    paddingLeft: 6,
  },
  tradeTotalText: {
    flex: 1,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
    paddingRight: 6,
  },
  tradeTotalPrice: {
    width: 65,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  
  // Final Price
  finalPriceSection: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finalPriceLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  finalPriceAmount: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  
  // Payment Milestones
  paymentSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 3,
  },
  paymentRow: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  paymentPercent: {
    width: 35,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
  },
  paymentLabel: {
    flex: 1,
    fontSize: 9,
    color: '#475569',
  },
  paymentAmount: {
    width: 65,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  
  // Signature Block
  signatureSection: {
    marginBottom: 12,
  },
  acceptanceText: {
    fontSize: 8,
    color: '#475569',
    marginBottom: 10,
    lineHeight: 1.4,
  },
  signatureRow: {
    flexDirection: 'row',
    gap: 24,
  },
  signatureField: {
    flex: 1,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 2,
    height: 18,
  },
  signatureLabel: {
    fontSize: 7,
    color: '#64748b',
  },
  printedNameRow: {
    marginTop: 8,
  },
  printedNameLabel: {
    fontSize: 8,
    color: '#475569',
  },
  
  // Notes
  notesSection: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: '#1e3a8a',
  },
  notesTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 3,
  },
  notesText: {
    fontSize: 7,
    color: '#475569',
    lineHeight: 1.5,
  },
  
  // Footer
  pageFooter: {
    position: 'absolute',
    bottom: 25,
    left: 50,
    right: 50,
    textAlign: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  },
});

interface ProposalPdfProps {
  contractor: Contractor;
  estimate: Estimate;
  pricingConfig?: PricingConfig;
  priceRange?: {
    low: number;
    high: number;
  };
}

interface LineItem {
  description: string;
  quantity?: number;
  unit?: string;
  isMaterialAllowance?: boolean;
}

interface TradeGroup {
  trade: string;
  items: LineItem[];
  total: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Define the exact trade order for bathroom estimates
const BATHROOM_TRADE_ORDER = [
  'Demolition',
  'Plumbing',
  'Electrical',
  'Framing & Drywall',
  'Tile & Waterproofing',
  'Cabinetry & Countertops',
  'Paint',
  'Glass & Final Trimout',
];

// Define the exact trade order for kitchen estimates
const KITCHEN_TRADE_ORDER = [
  'Demolition',
  'Cabinetry Package',
  'Countertops',
  'Plumbing',
  'Electrical',
  'Drywall',
  'Backsplash',
  'Flooring',
  'Paint',
];

// Normalize category for BATHROOM estimates - PRIORITY ORDER MATTERS
function normalizeBathroomCategory(cat: string, taskDescription?: string): string {
  const lower = cat.toLowerCase();
  const taskLower = (taskDescription || '').toLowerCase();
  
  // === PRIORITY 1: ELECTRICAL (check specific electrical items FIRST) ===
  // Vanity lights, recessed cans, exhaust fans, outlets, switches
  if (taskLower.includes('vanity light') || taskLower.includes('light fixture') ||
      taskLower.includes('recessed') || taskLower.includes('can light') ||
      taskLower.includes('exhaust fan') || taskLower.includes('bath fan') || 
      taskLower.includes('vent fan') || taskLower.includes('outlet') ||
      taskLower.includes('switch') || taskLower.includes('under-cabinet') ||
      taskLower.includes('gfci') ||
      lower === 'electrical' || lower.includes('electric') || lower.includes('lighting')) {
    return 'Electrical';
  }
  
  // === PRIORITY 2: GLASS & FINAL TRIMOUT ===
  // Glass, mirrors (including LED mirrors), towel bars, toilet paper holders, accessories
  if (taskLower.includes('frameless glass') || taskLower.includes('glass panel') ||
      taskLower.includes('glass enclosure') || taskLower.includes('shower door') ||
      taskLower.includes('glass door') ||
      taskLower.includes('mirror') || taskLower.includes('led mirror') || 
      taskLower.includes('backlit mirror') ||
      taskLower.includes('towel bar') || taskLower.includes('towel ring') || 
      taskLower.includes('towel rack') || taskLower.includes('toilet paper') ||
      taskLower.includes('tp holder') || taskLower.includes('robe hook') ||
      taskLower.includes('shower shelf') || taskLower.includes('soap dish') ||
      taskLower.includes('grab bar') || taskLower.includes('accessories') ||
      taskLower.includes('touch-up') || taskLower.includes('final') ||
      lower === 'glass' || lower === 'accessories' || lower.includes('glass') ||
      lower.includes('trimout') || lower.includes('final')) {
    return 'Glass & Final Trimout';
  }
  
  // === PRIORITY 3: DEMOLITION ===
  // Demo, gut, dumpster, haul, debris removal
  if (taskLower.includes('demo') || taskLower.includes('gut') || 
      taskLower.includes('dumpster') || taskLower.includes('haul') || 
      taskLower.includes('debris') || taskLower.includes('tearout') ||
      (taskLower.includes('remove') && !taskLower.includes('removal of tile')) ||
      lower === 'demo' || lower === 'demolition' || lower.includes('haul') ||
      lower.includes('dumpster') || lower.includes('tearout') || lower.includes('removal')) {
    return 'Demolition';
  }
  
  // === PRIORITY 4: PLUMBING ===
  // Shower valves, drains, tub fillers, toilet line, freestanding tub, relocate plumbing
  // NOTE: Do NOT include HVAC here - HVAC goes to separate section
  if (taskLower.includes('valve') || taskLower.includes('shower valve') ||
      taskLower.includes('drain') || taskLower.includes('tub drain') ||
      taskLower.includes('tub filler') || taskLower.includes('freestanding tub') ||
      taskLower.includes('toilet line') || taskLower.includes('relocate toilet') ||
      taskLower.includes('toilet install') || taskLower.includes('toilet reconnect') ||
      taskLower.includes('wax ring') || taskLower.includes('supply line') ||
      taskLower.includes('rough-in') || taskLower.includes('plumb') ||
      taskLower.includes('curb') || taskLower.includes('liner') ||
      (taskLower.includes('toilet') && !taskLower.includes('paper') && !taskLower.includes('walls')) ||
      (taskLower.includes('tub') && !taskLower.includes('bathtub tile')) ||
      lower === 'plumbing' || lower.includes('plumbing')) {
    return 'Plumbing';
  }
  
  // === PRIORITY 5: FRAMING & DRYWALL ===
  // Wall framing, niche, drywall, door work, wall removal, relocate walls
  if (taskLower.includes('niche') || taskLower.includes('blocking') ||
      taskLower.includes('fram') || taskLower.includes('framing') ||
      taskLower.includes('drywall') || taskLower.includes('tape') ||
      taskLower.includes('mud') || taskLower.includes('finish drywall') ||
      taskLower.includes('wall removal') || taskLower.includes('new wall') ||
      taskLower.includes('relocate') && taskLower.includes('wall') ||
      taskLower.includes('toilet walls') || taskLower.includes('toilet room') ||
      taskLower.includes('halfwall') || taskLower.includes('half wall') ||
      taskLower.includes('door') ||
      lower === 'framing' || lower === 'structural' || lower === 'drywall' ||
      lower.includes('framing') || lower.includes('drywall')) {
    return 'Framing & Drywall';
  }
  
  // === PRIORITY 6: TILE & WATERPROOFING ===
  // Tile installation, waterproofing, cement board, grout, seal
  if (taskLower.includes('tile') || taskLower.includes('waterproof') ||
      taskLower.includes('redgard') || taskLower.includes('cement board') ||
      taskLower.includes('backer board') || taskLower.includes('grout') ||
      taskLower.includes('seal') ||
      lower === 'tile' || lower === 'support' || lower === 'waterproofing' || 
      lower === 'cement board' || lower === 'tile & waterproofing' || 
      lower === 'tile & support' || lower.includes('backer board') ||
      lower.includes('floor tile') || lower.includes('wall tile') ||
      lower.includes('shower floor') || lower.includes('shower wall')) {
    return 'Tile & Waterproofing';
  }
  
  // === PRIORITY 7: CABINETRY & COUNTERTOPS ===
  // Vanity cabinet, linen cabinet, countertops, quartz (but NOT vanity light)
  if ((taskLower.includes('vanity') && !taskLower.includes('light')) ||
      taskLower.includes('cabinet') || taskLower.includes('linen') ||
      taskLower.includes('countertop') || taskLower.includes('quartz') ||
      taskLower.includes('hardware') ||
      lower === 'vanity' || lower === 'countertop' || lower === 'quartz' || 
      lower === 'cabinet' || lower === 'cabinetry' ||
      lower.includes('vanity') || lower.includes('countertop') || 
      lower.includes('cabinet') || lower.includes('quartz')) {
    return 'Cabinetry & Countertops';
  }
  
  // === PRIORITY 8: PAINT ===
  // Paint, primer, ceiling paint
  if (taskLower.includes('paint') || taskLower.includes('primer') ||
      (taskLower.includes('ceiling') && !taskLower.includes('tile')) ||
      lower === 'paint' || lower === 'painting' || lower === 'paint & drywall') {
    return 'Paint';
  }
  
  return 'Other';
}

// Normalize category for KITCHEN estimates
function normalizeKitchenCategory(cat: string, taskDescription?: string): string {
  const lower = cat.toLowerCase();
  const taskLower = (taskDescription || '').toLowerCase();
  
  // === DEMOLITION ===
  if (lower === 'demo' || lower === 'demolition' || lower.includes('haul') ||
      lower.includes('dumpster') || lower.includes('tearout') || lower.includes('removal') ||
      taskLower.includes('demo') || taskLower.includes('gut') || taskLower.includes('remove') ||
      taskLower.includes('dumpster') || taskLower.includes('haul') || taskLower.includes('debris') ||
      taskLower.includes('disconnect')) {
    return 'Demolition';
  }
  
  // === CABINETRY PACKAGE ===
  if (lower === 'cabinet' || lower === 'cabinetry' || lower.includes('cabinet') ||
      taskLower.includes('cabinet') || taskLower.includes('pantry') ||
      taskLower.includes('pull') || taskLower.includes('knob') ||
      (taskLower.includes('hardware') && !taskLower.includes('plumb'))) {
    return 'Cabinetry Package';
  }
  
  // === COUNTERTOPS ===
  if (lower === 'countertop' || lower === 'quartz' || lower === 'granite' || lower === 'laminate' ||
      lower.includes('countertop') || lower.includes('quartz') ||
      taskLower.includes('countertop') || taskLower.includes('quartz') ||
      taskLower.includes('granite') || taskLower.includes('laminate') ||
      taskLower.includes('sink cutout') || taskLower.includes('cooktop cutout') ||
      taskLower.includes('fabrication')) {
    return 'Countertops';
  }
  
  // === PLUMBING ===
  if (lower === 'plumbing' || lower.includes('plumbing') ||
      taskLower.includes('plumb') || taskLower.includes('sink') ||
      taskLower.includes('faucet') || taskLower.includes('disposal') ||
      taskLower.includes('dishwasher') || taskLower.includes('ice maker') ||
      taskLower.includes('gas line') || taskLower.includes('hookup') ||
      taskLower.includes('rough-in') || taskLower.includes('drain')) {
    return 'Plumbing';
  }
  
  // === ELECTRICAL ===
  if (lower === 'electrical' || lower.includes('electric') || lower.includes('lighting') ||
      taskLower.includes('outlet') || taskLower.includes('switch') ||
      taskLower.includes('under-cabinet') || taskLower.includes('undercabinet') ||
      taskLower.includes('pendant') || taskLower.includes('recessed') ||
      taskLower.includes('can light') || taskLower.includes('range hood') ||
      taskLower.includes('gfci') || taskLower.includes('electrical')) {
    return 'Electrical';
  }
  
  // === DRYWALL ===
  if (lower === 'drywall' || lower === 'framing' || lower === 'structural' ||
      lower.includes('drywall') || lower.includes('framing') ||
      taskLower.includes('drywall') || taskLower.includes('tape') ||
      taskLower.includes('mud') || taskLower.includes('texture') ||
      taskLower.includes('ceiling') && !taskLower.includes('paint') ||
      taskLower.includes('repair') && !taskLower.includes('appliance')) {
    return 'Drywall';
  }
  
  // === BACKSPLASH ===
  if (lower === 'backsplash' || lower.includes('backsplash') ||
      taskLower.includes('backsplash') || taskLower.includes('back splash') ||
      (taskLower.includes('tile') && (taskLower.includes('wall') || taskLower.includes('full-height')))) {
    return 'Backsplash';
  }
  
  // === FLOORING ===
  if (lower === 'flooring' || lower === 'floor' || lower === 'lvp' || lower === 'hardwood' ||
      lower.includes('flooring') || lower.includes('floor') ||
      taskLower.includes('flooring') || taskLower.includes('floor') ||
      taskLower.includes('lvp') || taskLower.includes('hardwood') ||
      taskLower.includes('underlayment') || taskLower.includes('transition') ||
      taskLower.includes('baseboard') || taskLower.includes('leveling')) {
    return 'Flooring';
  }
  
  // === PAINT ===
  if (lower === 'paint' || lower === 'painting' ||
      taskLower.includes('paint') || taskLower.includes('primer') ||
      taskLower.includes('prime')) {
    return 'Paint';
  }
  
  return 'Other';
}

function buildTradeGroups(estimate: Estimate, pricingConfig?: PricingConfig): TradeGroup[] {
  const groups: TradeGroup[] = [];

  const payload = estimate.internal_json_payload as Record<string, unknown> | null;
  const lineItems = (payload?.pricing as Record<string, unknown>)?.line_items as Array<{
    category: string;
    task_description: string;
    cp_total: number;
    quantity?: number;
    unit?: string;
  }> | undefined;

  // Determine project type - Kitchen vs Bathroom
  const isKitchen = estimate.has_kitchen && !estimate.has_bathrooms;
  const normalizeCategory = isKitchen ? normalizeKitchenCategory : normalizeBathroomCategory;
  const TRADE_ORDER = isKitchen ? KITCHEN_TRADE_ORDER : BATHROOM_TRADE_ORDER;

  // Helper to check if a line item is a tile sqft item
  const isTileSqftItem = (taskDescription: string): boolean => {
    const lower = taskDescription.toLowerCase();
    return (lower.includes('floor tile') || lower.includes('wall tile') || 
            lower.includes('shower floor') || lower.includes('shower wall') ||
            lower.includes('main floor') || lower.includes('bathroom floor') ||
            lower.includes('backsplash')) &&
           !lower.includes('material');
  };

  // Helper to format tile description with sqft
  const formatTileDescription = (description: string, quantity?: number, unit?: string): string => {
    if (quantity && unit?.toLowerCase() === 'sqft' && quantity > 0) {
      const sqft = Math.round(quantity);
      if (!description.includes('sqft') && !description.includes('sq ft')) {
        return `${description} (${sqft} sqft)`;
      }
    }
    return description;
  };

  // Helper to check if item should be EXCLUDED (not user-specified scope)
  const shouldExcludeItem = (taskDescription: string, allItems: typeof lineItems): boolean => {
    const lower = taskDescription.toLowerCase();
    
    // EXCLUDE ANY shower curtain rod mention - ALWAYS filter out if glass is present
    if (lower.includes('curtain') || lower.includes('shower rod') || lower.includes('curtain rod')) {
      const hasFramelessGlass = allItems?.some(item => {
        const itemLower = item.task_description.toLowerCase();
        return itemLower.includes('frameless') || itemLower.includes('glass enclosure') ||
               itemLower.includes('shower door') || itemLower.includes('glass door') ||
               itemLower.includes('glass panel') || itemLower.includes('glass shower');
      });
      if (hasFramelessGlass) return true;
    }
    
    // EXCLUDE HVAC-related items unless user explicitly mentioned HVAC
    if (lower.includes('hvac') || lower.includes('supply vent') || lower.includes('return vent') ||
        lower.includes('air vent') || lower.includes('relocating hvac') || lower.includes('adjusting hvac')) {
      const hasExplicitHvac = allItems?.some(item => {
        const itemLower = item.task_description.toLowerCase();
        return (itemLower.includes('hvac') || itemLower.includes('vent relocat')) &&
               !itemLower.includes('includes adjusting') && !itemLower.includes('includes relocating hvac');
      });
      if (!hasExplicitHvac && (lower.includes('includes adjusting') || lower.includes('includes relocating hvac'))) {
        return true;
      }
    }
    
    // EXCLUDE items with wrong category placement (vanity in electrical, toilet in demo, countertop in plumbing)
    if (lower.includes('vanity cabinet') || lower.includes('vanity countertop') || lower.includes('sink') && lower.includes('plumbing preparation')) {
      // These should NOT appear in electrical
      return false; // Let categorization handle placement
    }
    
    return false;
  };

  // Helper to clean item description (remove auto-added HVAC text and wrong descriptions)
  const cleanDescription = (description: string): string => {
    // Remove auto-added HVAC phrases
    let cleaned = description
      .replace(/\s*Includes adjusting or relocating HVAC supply or return vent to fit revised layout\.?\s*/gi, '')
      .replace(/\s*Includes HVAC vent adjustment\.?\s*/gi, '')
      .replace(/\s*Includes installation of shower curtain rod with secure wall mounting\.?\s*/gi, '')
      .replace(/\s*Includes vanity cabinet, countertop, sink, and basic plumbing preparation for installation\.?\s*/gi, '')
      .trim();
    
    // Clean up any double periods or trailing commas
    cleaned = cleaned.replace(/\.\./g, '.').replace(/,\s*$/g, '').replace(/\s+/g, ' ');
    
    return cleaned;
  };

  // Helper to determine correct category for misplaced items
  const getCorrectCategory = (taskDescription: string, originalCategory: string): string => {
    const lower = taskDescription.toLowerCase();
    
    // Vanity-related items should go to Cabinetry & Countertops, NOT electrical
    // But vanity LIGHTS should stay in Electrical
    if ((lower.includes('vanity') && !lower.includes('vanity light') && !lower.includes('light')) || 
        (lower.includes('cabinet') && !lower.includes('medicine'))) {
      return 'Cabinetry & Countertops';
    }
    
    // Countertop items should go to Cabinetry & Countertops
    if (lower.includes('countertop') || lower.includes('quartz') || lower.includes('granite')) {
      return 'Cabinetry & Countertops';
    }
    
    // Toilet reinstall/installation should go to Plumbing, NOT demolition
    if ((lower.includes('toilet') && (lower.includes('reinstall') || lower.includes('install'))) ||
        lower.includes('wax ring') || lower.includes('supply line')) {
      if (!lower.includes('demo') && !lower.includes('removal')) {
        return 'Plumbing';
      }
    }
    
    // LED mirrors, mirrors, towel bars, accessories should go to Glass & Final Trimout
    // NOT electrical - the mirror itself is a fixture, wiring is separate
    if (lower.includes('led mirror') || (lower.includes('mirror') && !lower.includes('wiring'))) {
      return 'Glass & Final Trimout';
    }
    
    // Towel bars, TP holders, accessories should also go to Glass & Final Trimout
    if (lower.includes('towel bar') || lower.includes('toilet paper') || 
        lower.includes('tp holder') || lower.includes('robe hook') ||
        lower.includes('grab bar') || lower.includes('soap dish')) {
      return 'Glass & Final Trimout';
    }
    
    return originalCategory;
  };

  // Track seen descriptions to remove duplicates
  const seenDescriptions = new Set<string>();

  if (lineItems && lineItems.length > 0) {
    // Group line items by category, filtering out items that shouldn't be included
    const grouped: Record<string, { items: LineItem[]; total: number }> = {};
    
    for (const item of lineItems) {
      // Skip items that should be excluded
      if (shouldExcludeItem(item.task_description, lineItems)) {
        continue;
      }
      
      // Get normalized category first, then check for corrections
      let category = normalizeCategory(item.category || 'Other', item.task_description);
      category = getCorrectCategory(item.task_description, category);
      
      if (!grouped[category]) {
        grouped[category] = { items: [], total: 0 };
      }
      
      // Clean and format description
      let description = cleanDescription(item.task_description);
      
      // Skip if description is empty after cleaning
      if (!description || description.length < 3) {
        continue;
      }
      
      // Create a normalized key for duplicate detection
      const normalizedKey = description.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
      if (seenDescriptions.has(normalizedKey)) {
        continue; // Skip duplicate
      }
      seenDescriptions.add(normalizedKey);
      
      // Format tile items with sqft in description
      if (isTileSqftItem(description)) {
        description = formatTileDescription(description, item.quantity, item.unit);
      }
      
      // Add the actual line item description with quantity/unit
      grouped[category].items.push({
        description,
        quantity: item.quantity,
        unit: item.unit,
      });
      grouped[category].total += item.cp_total || 0;
    }
    
    // Add material allowances based on project type with NEW FORMAT
    if (isKitchen) {
      // Kitchen-specific material allowances
      if (grouped['Countertops'] && pricingConfig?.quartz_slab_level1_allowance_cp) {
        grouped['Countertops'].items.push({
          description: `Product allowance $${pricingConfig.quartz_slab_level1_allowance_cp.toLocaleString()} per slab (Level 1 Quartz). Includes fabrication and installation.`,
          isMaterialAllowance: true,
        });
      }
      if (grouped['Cabinetry Package']) {
        grouped['Cabinetry Package'].items.push({
          description: `Cabinet Material Allowance: Painted shaker style`,
          isMaterialAllowance: true,
        });
      }
      if (grouped['Plumbing'] && pricingConfig?.plumbing_fixture_allowance_cp) {
        grouped['Plumbing'].items.push({
          description: `Fixture Allowance: ${formatCurrency(pricingConfig.plumbing_fixture_allowance_cp)}`,
          isMaterialAllowance: true,
        });
      }
      if (grouped['Backsplash'] && pricingConfig?.tile_material_allowance_cp_per_sqft) {
        grouped['Backsplash'].items.push({
          description: `Product allowance $${pricingConfig.tile_material_allowance_cp_per_sqft.toFixed(2)}/sqft. Includes thinset, grout, and Schluter trim.`,
          isMaterialAllowance: true,
        });
      }
      if (grouped['Flooring'] && pricingConfig?.lvp_cp_per_sqft) {
        grouped['Flooring'].items.push({
          description: `Product allowance $${pricingConfig.lvp_cp_per_sqft.toFixed(2)}/sqft (LVP/Tile). Includes underlayment and transitions.`,
          isMaterialAllowance: true,
        });
      }
    } else {
      // Bathroom-specific material allowances - NEW FORMAT with separate allowances
      if (grouped['Tile & Waterproofing']) {
        // Don't add generic allowance - the line items should already have specific allowances
        // Only add if there are no existing allowance items
        const hasAllowance = grouped['Tile & Waterproofing'].items.some(i => 
          i.description.toLowerCase().includes('allowance') || i.description.toLowerCase().includes('product'));
        if (!hasAllowance && pricingConfig?.tile_material_allowance_cp_per_sqft) {
          grouped['Tile & Waterproofing'].items.push({
            description: `Product allowance $${pricingConfig.tile_material_allowance_cp_per_sqft.toFixed(2)}/sqft. Includes thinset, grout, and Schluter trim.`,
            isMaterialAllowance: true,
          });
        }
      }
      if (grouped['Cabinetry & Countertops'] && pricingConfig?.quartz_slab_level1_allowance_cp) {
        const hasAllowance = grouped['Cabinetry & Countertops'].items.some(i => 
          i.description.toLowerCase().includes('allowance') || i.description.toLowerCase().includes('product'));
        if (!hasAllowance) {
          grouped['Cabinetry & Countertops'].items.push({
            description: `Product allowance $${pricingConfig.quartz_slab_level1_allowance_cp.toLocaleString()} per slab (Level 1 Quartz). Includes fabrication and installation.`,
            isMaterialAllowance: true,
          });
        }
      }
      // REMOVED: Fixture allowance for plumbing - user requested this not appear on PDF
    }
    
    // Convert to array with proper ordering
    for (const [trade, data] of Object.entries(grouped)) {
      if (data.total > 0) {
        groups.push({
          trade,
          items: data.items,
          total: data.total,
        });
      }
    }
  } else {
    // Fallback to legacy estimate fields - build in correct order
    if (estimate.include_demo !== false && (estimate.demo_cp_total || 0) > 0) {
      groups.push({
        trade: 'Demolition',
        items: [{ description: 'Demo, debris removal, and dumpster' }],
        total: estimate.demo_cp_total || 0,
      });
    }

    if (estimate.include_plumbing !== false && (estimate.plumbing_cp_total || 0) > 0) {
      const plumbingItems: LineItem[] = [{ description: 'Plumbing rough-in and fixture installation' }];
      
      if (pricingConfig?.plumbing_fixture_allowance_cp) {
        plumbingItems.push({
          description: `Fixture Allowance: ${formatCurrency(pricingConfig.plumbing_fixture_allowance_cp)}`,
          isMaterialAllowance: true,
        });
      }
      
      groups.push({
        trade: 'Plumbing',
        items: plumbingItems,
        total: estimate.plumbing_cp_total || 0,
      });
    }

    if (estimate.include_electrical !== false && ((estimate.lighting_cp_total || 0) > 0 || estimate.num_recessed_cans || estimate.num_vanity_lights)) {
      groups.push({
        trade: 'Electrical',
        items: [{ description: 'Lighting and electrical work' }],
        total: estimate.lighting_cp_total || 0,
      });
    }

    if ((estimate.tile_cp_total || 0) > 0 || (estimate.waterproofing_cp_total || 0) > 0) {
      const tileTotal = (estimate.tile_cp_total || 0) + (estimate.waterproofing_cp_total || 0);
      const tileItems: LineItem[] = [];
      
      if (estimate.bath_wall_tile_sqft && estimate.bath_wall_tile_sqft > 0) {
        tileItems.push({ description: `Wall tile installation (${Math.round(estimate.bath_wall_tile_sqft)} sqft)` });
      } else {
        tileItems.push({ description: 'Tile installation (wall and floor)' });
      }
      
      if (estimate.bath_floor_tile_sqft && estimate.bath_floor_tile_sqft > 0) {
        tileItems.push({ description: `Main floor tile installation (${Math.round(estimate.bath_floor_tile_sqft)} sqft)` });
      }
      
      if (estimate.bath_shower_floor_tile_sqft && estimate.bath_shower_floor_tile_sqft > 0) {
        tileItems.push({ description: `Shower floor tile installation (${Math.round(estimate.bath_shower_floor_tile_sqft)} sqft)` });
      }
      
      tileItems.push({ description: 'Waterproofing system' });
      
      if (pricingConfig?.tile_material_allowance_cp_per_sqft) {
        tileItems.push({ 
          description: `Material Allowance: $${pricingConfig.tile_material_allowance_cp_per_sqft.toFixed(2)}/sqft`,
          isMaterialAllowance: true,
        });
      }
      
      groups.push({
        trade: isKitchen ? 'Backsplash' : 'Tile & Waterproofing',
        items: tileItems,
        total: tileTotal,
      });
    }

    // Cabinetry & Countertops - combine vanity, cabinets, and countertops
    const cabinetryTotal = (estimate.vanities_cp_total || 0) + (estimate.cabinets_cp_total || 0) + (estimate.quartz_cp_total || 0);
    if (cabinetryTotal > 0) {
      if (isKitchen) {
        // Kitchen: separate Cabinetry Package and Countertops
        if ((estimate.cabinets_cp_total || 0) > 0) {
          groups.push({
            trade: 'Cabinetry Package',
            items: [{ description: 'Cabinet delivery, installation, and hardware' }],
            total: estimate.cabinets_cp_total || 0,
          });
        }
        if ((estimate.quartz_cp_total || 0) > 0) {
          groups.push({
            trade: 'Countertops',
            items: [{ description: 'Countertop measurement, fabrication, and installation' }],
            total: estimate.quartz_cp_total || 0,
          });
        }
      } else {
        // Bathroom: combined Cabinetry & Countertops
        const cabinetryItems: LineItem[] = [];
        
        if ((estimate.vanities_cp_total || 0) > 0) {
          cabinetryItems.push({ description: `Vanity installation${estimate.vanity_size ? ` (${estimate.vanity_size}")` : ''}` });
        }
        if ((estimate.cabinets_cp_total || 0) > 0) {
          cabinetryItems.push({ description: 'Cabinet installation' });
        }
        if ((estimate.quartz_cp_total || 0) > 0) {
          cabinetryItems.push({ description: 'Quartz countertop fabrication and installation' });
        }
        
        if (pricingConfig?.quartz_slab_level1_allowance_cp) {
          cabinetryItems.push({
            description: `Countertop Material Allowance: $${pricingConfig.quartz_slab_level1_allowance_cp.toFixed(2)}/sqft`,
            isMaterialAllowance: true,
          });
        }
        
        groups.push({
          trade: 'Cabinetry & Countertops',
          items: cabinetryItems,
          total: cabinetryTotal,
        });
      }
    }

    if (estimate.include_paint !== false && (estimate.paint_cp_total || 0) > 0) {
      groups.push({
        trade: 'Paint',
        items: [{ description: 'Paint and drywall finish' }],
        total: estimate.paint_cp_total || 0,
      });
    }

    if (estimate.include_glass !== false && (estimate.glass_cp_total || 0) > 0) {
      groups.push({
        trade: 'Glass & Final Trimout',
        items: [{ description: `Frameless glass${estimate.glass_type ? ` (${estimate.glass_type.replace('_', ' ')})` : ''}` }],
        total: estimate.glass_cp_total || 0,
      });
    }

    if ((estimate.other_cp_total || 0) > 0) {
      groups.push({
        trade: 'Other',
        items: [{ description: 'Additional work' }],
        total: estimate.other_cp_total || 0,
      });
    }
  }

  // Sort groups according to the defined trade order
  groups.sort((a, b) => {
    const indexA = TRADE_ORDER.indexOf(a.trade);
    const indexB = TRADE_ORDER.indexOf(b.trade);
    
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.trade.localeCompare(b.trade);
  });

  return groups;
}

export function ProposalPdf({ contractor, estimate, pricingConfig, priceRange }: ProposalPdfProps) {
  const settings: ContractorSettings = (contractor.settings as ContractorSettings) || defaultSettings;
  const { companyProfile, branding, defaults } = settings;

  const depositSplit = (defaults.depositPct || pricingConfig?.payment_split_deposit || 65) / 100;
  const progressSplit = (defaults.progressPct || pricingConfig?.payment_split_progress || 25) / 100;
  const finalSplit = (defaults.finalPct || pricingConfig?.payment_split_final || 10) / 100;

  // Determine project type for milestone label
  const isKitchenProject = estimate.has_kitchen && !estimate.has_bathrooms;
  const progressLabel = isKitchenProject
    ? (defaults.progressLabelKitchen || 'Due at arrival of cabinetry')
    : (defaults.progressLabelBathroom || 'Due at start of tile installation');

  const showRange = priceRange && priceRange.low > 0 && priceRange.high > 0;
  const totalCost = estimate.final_cp_total || 0;
  
  // Calculate payment amounts - use midpoint for range display
  const baseAmount = showRange ? Math.round((priceRange.low + priceRange.high) / 2) : totalCost;
  const depositAmount = Math.round(baseAmount * depositSplit);
  const progressAmount = Math.round(baseAmount * progressSplit);
  const finalAmount = Math.round(baseAmount * finalSplit);
  
  // Range amounts for payment milestones
  const depositAmountLow = showRange ? Math.round(priceRange.low * depositSplit) : depositAmount;
  const depositAmountHigh = showRange ? Math.round(priceRange.high * depositSplit) : depositAmount;
  const progressAmountLow = showRange ? Math.round(priceRange.low * progressSplit) : progressAmount;
  const progressAmountHigh = showRange ? Math.round(priceRange.high * progressSplit) : progressAmount;
  const finalAmountLow = showRange ? Math.round(priceRange.low * finalSplit) : finalAmount;
  const finalAmountHigh = showRange ? Math.round(priceRange.high * finalSplit) : finalAmount;

  const addressParts = [estimate.property_address, estimate.city, estimate.state, estimate.zip].filter(Boolean);
  const fullAddress = addressParts.join(', ').replace(/,\s*,/g, ',');

  const clientName = estimate.client_name || 'Valued Customer';
  const companyName = companyProfile.companyName || branding.headerTitle || 'The Kitchen & Bath Store of Orlando';
  const companyPhone = companyProfile.phone || '';
  const companyEmail = companyProfile.email || '';

  const tradeGroups = buildTradeGroups(estimate, pricingConfig);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const notes = estimate.job_notes || defaults.termsText || 'This estimate is valid for 30 days. Final pricing subject to site conditions and material selections. Permits, if required, are excluded unless noted otherwise.';

  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        {/* Fixed Header Banner with Logo + Contact Info (appears on every page) */}
        <View style={styles.headerBanner} fixed>
          <Image src={tkbsoLogo} style={styles.logo} />
          <View style={styles.headerContactRow}>
            {companyPhone && <Text style={styles.headerContactText}>{companyPhone}</Text>}
            {companyEmail && <Text style={styles.headerContactText}>{companyEmail}</Text>}
          </View>
        </View>

        {/* Quote Title */}
        <View wrap={false}>
          <Text style={styles.quoteTitle}>Quote for {clientName}</Text>
          <Text style={styles.quoteDate}>{currentDate}</Text>
        </View>

        {/* Client Info */}
        <View style={styles.clientSection} wrap={false}>
          {estimate.client_phone && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Phone:</Text>
              <Text style={styles.clientValue}>{estimate.client_phone}</Text>
            </View>
          )}
          {estimate.client_email && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Email:</Text>
              <Text style={styles.clientValue}>{estimate.client_email}</Text>
            </View>
          )}
          {fullAddress && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Property:</Text>
              <Text style={styles.clientValue}>{fullAddress}</Text>
            </View>
          )}
        </View>

        {/* Trade Breakdown - NO per-trade pricing, just scope items with professional descriptions */}
        {tradeGroups.map((group, idx) => (
          <View key={idx} style={styles.tradeSection} wrap={false}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1e3a8a', borderBottomWidth: 1, borderBottomColor: '#1e3a8a', paddingBottom: 2, marginBottom: 4 }}>{group.trade}</Text>
            {group.items.map((item, itemIdx) => (
              <Text key={itemIdx} style={{ 
                fontSize: 9, 
                color: item.isMaterialAllowance ? '#64748b' : '#475569', 
                paddingLeft: 4, 
                lineHeight: 1.4, 
                marginBottom: 2,
                fontStyle: item.isMaterialAllowance ? 'italic' : 'normal',
              }}>
                • {item.isMaterialAllowance ? item.description : formatLineItemForPdf(item.description, item.quantity, item.unit)}
              </Text>
            ))}
          </View>
        ))}

        {/* Subtotal + Management Fee + Total */}
        <View wrap={false} style={{ marginTop: 8 }}>
          {/* Show subtotal if there's a management fee */}
          {estimate.include_management_fee && (estimate.management_fee_cp || 0) > 0 && (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
                <Text style={{ fontSize: 10, color: '#475569' }}>Subtotal</Text>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1e293b' }}>{formatCurrency(totalCost - (estimate.management_fee_cp || 0))}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ fontSize: 10, color: '#475569' }}>Project Management Fee ({((estimate.management_fee_percent || 0) * 100).toFixed(0)}%)</Text>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1e293b' }}>{formatCurrency(estimate.management_fee_cp)}</Text>
              </View>
            </>
          )}

          {/* Final Total */}
          <View style={styles.finalPriceSection}>
            <Text style={styles.finalPriceLabel}>Total Investment</Text>
            <Text style={styles.finalPriceAmount}>
              {showRange 
                ? `${formatCurrency(priceRange.low)} to ${formatCurrency(priceRange.high)}`
                : formatCurrency(totalCost)
              }
            </Text>
          </View>
        </View>

        {/* Payment Schedule */}
        <View style={styles.paymentSection} wrap={false}>
          <Text style={styles.sectionTitle}>Payment Schedule</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(depositSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>Deposit – Due upon signing</Text>
            <Text style={styles.paymentAmount}>
              {showRange 
                ? `${formatCurrency(depositAmountLow)} to ${formatCurrency(depositAmountHigh)}`
                : formatCurrency(depositAmount)
              }
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(progressSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>Progress – {progressLabel}</Text>
            <Text style={styles.paymentAmount}>
              {showRange 
                ? `${formatCurrency(progressAmountLow)} to ${formatCurrency(progressAmountHigh)}`
                : formatCurrency(progressAmount)
              }
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(finalSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>Final – Due at completion</Text>
            <Text style={styles.paymentAmount}>
              {showRange 
                ? `${formatCurrency(finalAmountLow)} to ${formatCurrency(finalAmountHigh)}`
                : formatCurrency(finalAmount)
              }
            </Text>
          </View>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.sectionTitle}>Acceptance</Text>
          <Text style={styles.acceptanceText}>
            By signing below, I accept this quote and agree to the terms and payment schedule.
          </Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Client Signature</Text>
            </View>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
          <View style={styles.printedNameRow}>
            <Text style={styles.printedNameLabel}>Print Name: _________________________________</Text>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.notesSection} wrap={false}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>{notes}</Text>
        </View>

        {/* Footer - minimal since contact info is in header */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>{companyName}</Text>
        </View>
      </Page>
    </Document>
  );
}
