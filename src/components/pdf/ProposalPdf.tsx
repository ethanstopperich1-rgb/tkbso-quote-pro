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
import { transformToProDescription } from '@/lib/professional-descriptions';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 100,
    paddingBottom: 70,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff',
  },
  
  // Fixed Header Banner
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
    marginBottom: 14,
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
    width: 70,
    fontSize: 9,
    color: '#64748b',
  },
  clientValue: {
    flex: 1,
    fontSize: 9,
    color: '#1e293b',
  },
  
  // Trade Section - Bold underlined headers
  tradeSection: {
    marginBottom: 10,
  },
  tradeHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    textDecoration: 'underline',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  lineItem: {
    fontSize: 9,
    color: '#475569',
    paddingLeft: 4,
    lineHeight: 1.5,
    marginBottom: 3,
  },
  lineItemAllowance: {
    fontSize: 9,
    color: '#64748b',
    fontStyle: 'italic',
  },
  
  // Final Price Box
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
  
  // Payment Section
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
    paddingVertical: 4,
    alignItems: 'flex-start',
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
    width: 100,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  
  // Signature Block
  signatureSection: {
    marginBottom: 12,
    marginTop: 10,
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
    marginBottom: 10,
  },
  signatureField: {
    flex: 1,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 2,
    height: 20,
  },
  signatureLabel: {
    fontSize: 7,
    color: '#64748b',
  },
  
  // Notes Section
  notesSection: {
    padding: 10,
    backgroundColor: '#fffbeb',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    marginBottom: 10,
  },
  notesTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#92400e',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8,
    color: '#78350f',
    lineHeight: 1.5,
  },
  noteItem: {
    fontSize: 8,
    color: '#78350f',
    lineHeight: 1.5,
    marginBottom: 4,
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
  showTileSqft?: boolean;
}

export interface LineItem {
  description: string;
  quantity?: number;
  unit?: string;
  isMaterialAllowance?: boolean;
}

export interface TradeGroup {
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

// Trade order for bathroom estimates
const BATHROOM_TRADE_ORDER = [
  'DEMOLITION',
  'PLUMBING',
  'ELECTRICAL',
  'DRYWALL & FRAMING',
  'TILE WORK',
  'CABINET & COUNTERTOP',
  'PAINTING & FINAL TRIMOUT',
  'GLASS',
];

// Trade order for kitchen estimates
const KITCHEN_TRADE_ORDER = [
  'DEMOLITION',
  'CABINETRY PACKAGE',
  'COUNTERTOPS',
  'PLUMBING',
  'ELECTRICAL',
  'DRYWALL',
  'BACKSPLASH',
  'FLOORING',
  'PAINT',
];

// Normalize category to uppercase trade names
function normalizeBathroomCategory(cat: string, taskDescription?: string): string {
  const lower = cat.toLowerCase();
  const taskLower = (taskDescription || '').toLowerCase();
  
  // ELECTRICAL
  const isVanityOrCabinetItem = (taskLower.includes('vanity') || taskLower.includes('cabinet')) && 
                                 !taskLower.includes('vanity light') && !taskLower.includes('light');
  if (!isVanityOrCabinetItem && (
      taskLower.includes('vanity light') || taskLower.includes('light fixture') ||
      taskLower.includes('recessed') || taskLower.includes('can light') ||
      taskLower.includes('exhaust fan') || taskLower.includes('bath fan') || 
      taskLower.includes('outlet') || taskLower.includes('switch') ||
      taskLower.includes('gfci') ||
      lower === 'electrical' || lower.includes('electric') || lower.includes('lighting'))) {
    return 'ELECTRICAL';
  }
  
  // GLASS
  if (taskLower.includes('frameless') || taskLower.includes('glass panel') ||
      taskLower.includes('glass enclosure') || taskLower.includes('shower door') ||
      taskLower.includes('glass door') ||
      lower === 'glass' || lower.includes('glass')) {
    return 'GLASS';
  }
  
  // PAINTING & FINAL TRIMOUT (accessories, mirrors, touch-up)
  if (taskLower.includes('mirror') || taskLower.includes('led mirror') ||
      taskLower.includes('towel bar') || taskLower.includes('towel ring') || 
      taskLower.includes('toilet paper') || taskLower.includes('tp holder') || 
      taskLower.includes('robe hook') || taskLower.includes('grab bar') ||
      taskLower.includes('accessories') || taskLower.includes('touch-up') ||
      taskLower.includes('paint') || taskLower.includes('primer') ||
      lower === 'accessories' || lower.includes('trimout') || 
      lower === 'paint' || lower === 'painting') {
    return 'PAINTING & FINAL TRIMOUT';
  }
  
  // PLUMBING
  if (taskLower.includes('valve') || taskLower.includes('drain') ||
      taskLower.includes('tub filler') || taskLower.includes('freestanding tub') ||
      taskLower.includes('toilet') && !taskLower.includes('paper') ||
      taskLower.includes('faucet') || taskLower.includes('shower') && !taskLower.includes('tile') ||
      taskLower.includes('rough-in') || taskLower.includes('plumb') ||
      lower === 'plumbing' || lower.includes('plumbing')) {
    return 'PLUMBING';
  }
  
  // DEMOLITION
  const isInstallation = taskLower.includes('install') && !taskLower.includes('uninstall');
  if (!isInstallation && (
      taskLower.includes('demo') || taskLower.includes('gut') || 
      taskLower.includes('dumpster') || taskLower.includes('haul') || 
      taskLower.includes('debris') || taskLower.includes('remove') ||
      lower === 'demo' || lower === 'demolition' || lower.includes('haul'))) {
    return 'DEMOLITION';
  }
  
  // DRYWALL & FRAMING
  if (taskLower.includes('niche') || taskLower.includes('blocking') ||
      taskLower.includes('fram') || taskLower.includes('drywall') ||
      taskLower.includes('wall removal') || taskLower.includes('door') ||
      lower === 'framing' || lower === 'drywall' || lower.includes('framing')) {
    return 'DRYWALL & FRAMING';
  }
  
  // TILE WORK
  if (taskLower.includes('tile') || taskLower.includes('waterproof') ||
      taskLower.includes('cement board') || taskLower.includes('grout') ||
      lower === 'tile' || lower.includes('tile') || lower.includes('waterproof')) {
    return 'TILE WORK';
  }
  
  // CABINET & COUNTERTOP
  if ((taskLower.includes('vanity') && !taskLower.includes('light')) ||
      taskLower.includes('cabinet') || taskLower.includes('countertop') || 
      taskLower.includes('quartz') ||
      lower === 'vanity' || lower === 'countertop' || lower === 'cabinet') {
    return 'CABINET & COUNTERTOP';
  }
  
  return 'OTHER';
}

function normalizeKitchenCategory(cat: string, taskDescription?: string): string {
  const lower = cat.toLowerCase();
  const taskLower = (taskDescription || '').toLowerCase();
  
  if (lower === 'demo' || lower === 'demolition' || 
      taskLower.includes('demo') || taskLower.includes('remove') || taskLower.includes('dumpster')) {
    return 'DEMOLITION';
  }
  if (lower === 'cabinet' || lower === 'cabinetry' || 
      taskLower.includes('cabinet') || taskLower.includes('hardware')) {
    return 'CABINETRY PACKAGE';
  }
  if (lower === 'countertop' || lower === 'quartz' || 
      taskLower.includes('countertop') || taskLower.includes('fabrication')) {
    return 'COUNTERTOPS';
  }
  if (lower === 'plumbing' || taskLower.includes('sink') || taskLower.includes('faucet') || 
      taskLower.includes('disposal') || taskLower.includes('dishwasher')) {
    return 'PLUMBING';
  }
  if (lower === 'electrical' || taskLower.includes('outlet') || taskLower.includes('switch') ||
      taskLower.includes('recessed') || taskLower.includes('under-cabinet')) {
    return 'ELECTRICAL';
  }
  if (lower === 'drywall' || taskLower.includes('drywall') || taskLower.includes('patch')) {
    return 'DRYWALL';
  }
  if (lower === 'backsplash' || taskLower.includes('backsplash') || taskLower.includes('tile')) {
    return 'BACKSPLASH';
  }
  if (lower === 'flooring' || taskLower.includes('floor') || taskLower.includes('lvp')) {
    return 'FLOORING';
  }
  if (lower === 'paint' || taskLower.includes('paint')) {
    return 'PAINT';
  }
  
  return 'OTHER';
}

export function buildTradeGroups(estimate: Estimate, pricingConfig?: PricingConfig, showTileSqft: boolean = true): TradeGroup[] {
  const groups: TradeGroup[] = [];

  const payload = estimate.internal_json_payload as Record<string, unknown> | null;
  const lineItems = (payload?.pricing as Record<string, unknown>)?.line_items as Array<{
    category: string;
    task_description: string;
    cp_total: number;
    quantity?: number;
    unit?: string;
  }> | undefined;

  const isKitchen = estimate.has_kitchen && !estimate.has_bathrooms;
  const normalizeCategory = isKitchen ? normalizeKitchenCategory : normalizeBathroomCategory;
  const TRADE_ORDER = isKitchen ? KITCHEN_TRADE_ORDER : BATHROOM_TRADE_ORDER;

  // Track seen items to prevent duplicates
  const seenDescriptions = new Set<string>();

  if (lineItems && lineItems.length > 0) {
    const grouped: Record<string, { items: LineItem[]; total: number }> = {};
    
    for (const item of lineItems) {
      const category = normalizeCategory(item.category || 'Other', item.task_description);
      
      if (!grouped[category]) {
        grouped[category] = { items: [], total: 0 };
      }
      
      // Transform to professional description
      const proDesc = transformToProDescription(
        item.task_description,
        category,
        {
          quantity: item.quantity,
          unit: item.unit,
        }
      );
      
      // Skip duplicates
      const descKey = proDesc.description.toLowerCase().substring(0, 60);
      if (seenDescriptions.has(descKey)) continue;
      seenDescriptions.add(descKey);
      
      grouped[category].items.push({
        description: proDesc.description,
        quantity: item.quantity,
        unit: item.unit,
      });
      grouped[category].total += item.cp_total || 0;
    }
    
    // Convert to array
    for (const [trade, data] of Object.entries(grouped)) {
      if (data.items.length > 0) {
        groups.push({
          trade,
          items: data.items,
          total: data.total,
        });
      }
    }
  } else {
    // Fallback for legacy estimates
    if (estimate.include_demo !== false && (estimate.demo_cp_total || 0) > 0) {
      groups.push({
        trade: 'DEMOLITION',
        items: [{ 
          description: '− Demo and remove all existing fixtures, tile, vanity, and debris. Dispose of all materials and haul away.' 
        }],
        total: estimate.demo_cp_total || 0,
      });
    }

    if (estimate.include_plumbing !== false && (estimate.plumbing_cp_total || 0) > 0) {
      const plumbingItems: LineItem[] = [];
      plumbingItems.push({ 
        description: `− Supply and install new thermostatic shower valve with pressure-balanced trim kit and diverter in customer selected finish. (Product Allowance $${pricingConfig?.plumbing_fixture_allowance_cp || 450})` 
      });
      if (estimate.num_toilets && estimate.num_toilets > 0) {
        plumbingItems.push({ 
          description: `− Supply and install new chair height toilet with new wax ring, shut-off valve, and braided supply line. (Product Allowance $350)` 
        });
      }
      groups.push({
        trade: 'PLUMBING',
        items: plumbingItems,
        total: estimate.plumbing_cp_total || 0,
      });
    }

    if (estimate.include_electrical !== false && ((estimate.lighting_cp_total || 0) > 0)) {
      const electricalItems: LineItem[] = [];
      if (estimate.num_recessed_cans && estimate.num_recessed_cans > 0) {
        const qty = estimate.num_recessed_cans;
        electricalItems.push({ 
          description: `− Supply and install ${qty === 1 ? 'one (1)' : qty} recessed LED can light(s) with IC-rated housing and retrofit trim. (Product Allowance $${65 * qty})` 
        });
      }
      if (estimate.num_vanity_lights && estimate.num_vanity_lights > 0) {
        electricalItems.push({ 
          description: `− Supply and install vanity light fixture in customer selected finish. (Product Allowance $175)` 
        });
      }
      electricalItems.push({ description: '− Supply and install new bathroom exhaust fan with quiet motor. (Product Allowance $125)' });
      groups.push({
        trade: 'ELECTRICAL',
        items: electricalItems,
        total: estimate.lighting_cp_total || 0,
      });
    }

    if ((estimate.tile_cp_total || 0) > 0 || (estimate.waterproofing_cp_total || 0) > 0) {
      const tileTotal = (estimate.tile_cp_total || 0) + (estimate.waterproofing_cp_total || 0);
      const tileItems: LineItem[] = [];
      
      if (estimate.bath_wall_tile_sqft && estimate.bath_wall_tile_sqft > 0) {
        tileItems.push({ 
          description: `− Install large-format porcelain tile to full height around shower area. (Product allowance $6.50/sq ft. Includes thinset, grout, and Schluter trim.)` 
        });
      }
      if (estimate.bath_floor_tile_sqft && estimate.bath_floor_tile_sqft > 0) {
        tileItems.push({ 
          description: `− Install large-format porcelain tile to bathroom floor. (Product allowance $6.50/sq ft. Includes thinset, grout, and Schluter trim.)` 
        });
      }
      if (estimate.bath_shower_floor_tile_sqft && estimate.bath_shower_floor_tile_sqft > 0) {
        tileItems.push({ 
          description: `− Install mosaic tile to shower floor with proper slope to drain. (Product allowance $12/sq ft. Includes thinset, grout, and Schluter trim.)` 
        });
      }
      tileItems.push({ description: '− Apply waterproofing membrane to all shower/tub wet areas. Includes corners, seams, and fastener penetrations.' });
      tileItems.push({ description: '− Install cement backer board to wet areas as substrate for tile.' });
      
      groups.push({
        trade: isKitchen ? 'BACKSPLASH' : 'TILE WORK',
        items: tileItems,
        total: tileTotal,
      });
    }

    const cabinetryTotal = (estimate.vanities_cp_total || 0) + (estimate.cabinets_cp_total || 0) + (estimate.quartz_cp_total || 0);
    if (cabinetryTotal > 0) {
      const cabinetryItems: LineItem[] = [];
      
      if ((estimate.vanities_cp_total || 0) > 0) {
        const size = estimate.vanity_size || '48';
        let allowance = 1800;
        if (parseInt(size) <= 30) allowance = 1200;
        else if (parseInt(size) <= 36) allowance = 1400;
        else if (parseInt(size) <= 60) allowance = 2400;
        else allowance = 3200;
        
        cabinetryItems.push({ 
          description: `− Supply and install one (1) ${size}" shaker-style, soft-close vanity with undermount sink. (Product Allowance $${allowance.toLocaleString()})` 
        });
      }
      if ((estimate.quartz_cp_total || 0) > 0) {
        cabinetryItems.push({ 
          description: `− Fabricate and install Level 1 Quartz countertop with mitered edge. Includes undermount sink cutout and faucet holes. (Product Allowance $${pricingConfig?.quartz_slab_level1_allowance_cp || 1200}/slab)` 
        });
      }
      
      groups.push({
        trade: isKitchen ? 'COUNTERTOPS' : 'CABINET & COUNTERTOP',
        items: cabinetryItems,
        total: cabinetryTotal,
      });
    }

    if (estimate.include_paint !== false && (estimate.paint_cp_total || 0) > 0) {
      groups.push({
        trade: 'PAINTING & FINAL TRIMOUT',
        items: [
          { description: '− Prime and apply 2 coats of paint to walls and ceiling in homeowner selected color.' },
          { description: '− Supply and install one (1) towel bar in customer selected finish. (Product Allowance $45)' },
          { description: '− Supply and install one (1) toilet paper holder in customer selected finish. (Product Allowance $35)' },
        ],
        total: estimate.paint_cp_total || 0,
      });
    }

    if (estimate.include_glass !== false && (estimate.glass_cp_total || 0) > 0) {
      groups.push({
        trade: 'GLASS',
        items: [{ 
          description: `− Fabricate and install frameless glass shower enclosure with brushed nickel hardware. Includes tempered glass panels, door, and all mounting hardware. (Product Allowance $1,800)` 
        }],
        total: estimate.glass_cp_total || 0,
      });
    }
  }

  // Sort by defined trade order
  groups.sort((a, b) => {
    const indexA = TRADE_ORDER.indexOf(a.trade);
    const indexB = TRADE_ORDER.indexOf(b.trade);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.trade.localeCompare(b.trade);
  });

  return groups;
}

export function ProposalPdf({ contractor, estimate, pricingConfig, priceRange, showTileSqft = true }: ProposalPdfProps) {
  const settings: ContractorSettings = (contractor.settings as ContractorSettings) || defaultSettings;
  const { companyProfile, branding, defaults } = settings;

  const depositSplit = (defaults.depositPct || pricingConfig?.payment_split_deposit || 65) / 100;
  const progressSplit = (defaults.progressPct || pricingConfig?.payment_split_progress || 25) / 100;
  const finalSplit = (defaults.finalPct || pricingConfig?.payment_split_final || 10) / 100;

  const isKitchenProject = estimate.has_kitchen && !estimate.has_bathrooms;
  const progressLabel = isKitchenProject
    ? (defaults.progressLabelKitchen || 'Due at arrival of cabinetry')
    : (defaults.progressLabelBathroom || 'Due at start of tile installation');

  const showRange = priceRange && priceRange.low > 0 && priceRange.high > 0;
  const totalCost = estimate.final_cp_total || 0;
  
  const baseAmount = showRange ? Math.round((priceRange.low + priceRange.high) / 2) : totalCost;
  const depositAmount = Math.round(baseAmount * depositSplit);
  const progressAmount = Math.round(baseAmount * progressSplit);
  const finalAmount = Math.round(baseAmount * finalSplit);
  
  const depositAmountLow = showRange ? Math.round(priceRange.low * depositSplit) : depositAmount;
  const depositAmountHigh = showRange ? Math.round(priceRange.high * depositSplit) : depositAmount;
  const progressAmountLow = showRange ? Math.round(priceRange.low * progressSplit) : progressAmount;
  const progressAmountHigh = showRange ? Math.round(priceRange.high * progressSplit) : progressAmount;
  const finalAmountLow = showRange ? Math.round(priceRange.low * finalSplit) : finalAmount;
  const finalAmountHigh = showRange ? Math.round(priceRange.high * finalSplit) : finalAmount;

  // Build full address
  const addressParts = [
    estimate.property_address, 
    estimate.city, 
    estimate.state, 
    estimate.zip
  ].filter(Boolean);
  const fullAddress = addressParts.join(', ').replace(/,\s*,/g, ',');

  const clientName = estimate.client_name || 'Valued Customer';
  const companyName = companyProfile.companyName || branding.headerTitle || 'The Kitchen & Bath Store of Orlando';
  const companyPhone = companyProfile.phone || '';
  const companyEmail = companyProfile.email || '';

  const tradeGroups = buildTradeGroups(estimate, pricingConfig, showTileSqft);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Determine project type description
  const projectType = isKitchenProject ? 'Kitchen' : 
    (estimate.num_bathrooms === 1 ? 'Primary Bathroom' : 
     estimate.num_bathrooms && estimate.num_bathrooms > 1 ? `${estimate.num_bathrooms} Bathroom` : 'Bathroom');

  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        {/* Fixed Header Banner with Logo + Contact Info */}
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

        {/* Client Info Section */}
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

        {/* Trade Sections with Professional Descriptions */}
        {tradeGroups.map((group, idx) => (
          <View key={idx} style={styles.tradeSection} wrap={false}>
            <Text style={styles.tradeHeader}>{group.trade}</Text>
            {group.items.map((item, itemIdx) => (
              <Text key={itemIdx} style={styles.lineItem}>
                {item.description}
              </Text>
            ))}
          </View>
        ))}

        {/* Subtotal + Management Fee + Total */}
        <View wrap={false} style={{ marginTop: 10 }}>
          {estimate.include_management_fee && (estimate.management_fee_cp || 0) > 0 && (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#e2e8f0' }}>
                <Text style={{ fontSize: 10, color: '#475569' }}>{projectType} Subtotal</Text>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1e293b' }}>
                  {formatCurrency(totalCost - (estimate.management_fee_cp || 0))}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                <Text style={{ fontSize: 10, color: '#475569' }}>
                  Project Management ({((estimate.management_fee_percent || 0) * 100).toFixed(0)}%)
                </Text>
                <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1e293b' }}>
                  {formatCurrency(estimate.management_fee_cp)}
                </Text>
              </View>
            </>
          )}

          {/* Final Total */}
          <View style={styles.finalPriceSection}>
            <Text style={styles.finalPriceLabel}>{projectType} Final Cost</Text>
            <Text style={styles.finalPriceAmount}>
              {showRange 
                ? `${formatCurrency(priceRange.low)} to ${formatCurrency(priceRange.high)}`
                : formatCurrency(totalCost)
              }
            </Text>
          </View>
        </View>

        {/* Payment Milestones */}
        <View style={styles.paymentSection} wrap={false}>
          <Text style={styles.sectionTitle}>PAYMENT MILESTONES</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(depositSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>Upon Contract Signing – Includes mobilization, materials ordering, and scheduling.</Text>
            <Text style={styles.paymentAmount}>
              {showRange 
                ? `${formatCurrency(depositAmountLow)} – ${formatCurrency(depositAmountHigh)}`
                : formatCurrency(depositAmount)
              }
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(progressSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>{progressLabel} – Rough plumbing and tile work substantially complete.</Text>
            <Text style={styles.paymentAmount}>
              {showRange 
                ? `${formatCurrency(progressAmountLow)} – ${formatCurrency(progressAmountHigh)}`
                : formatCurrency(progressAmount)
              }
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(finalSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>Upon Overall Completion of Project – Final walkthrough and punchlist complete.</Text>
            <Text style={styles.paymentAmount}>
              {showRange 
                ? `${formatCurrency(finalAmountLow)} – ${formatCurrency(finalAmountHigh)}`
                : formatCurrency(finalAmount)
              }
            </Text>
          </View>
        </View>

        {/* Signature Blocks */}
        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.sectionTitle}>ACCEPTANCE</Text>
          <Text style={styles.acceptanceText}>
            By signing below, I accept this quote and agree to the terms, scope of work, and payment schedule outlined above.
          </Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Approval (Homeowner)</Text>
            </View>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
          <View style={styles.signatureRow}>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Accepted ({companyName})</Text>
            </View>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
        </View>

        {/* Project Notes */}
        <View style={styles.notesSection} wrap={false}>
          <Text style={styles.notesTitle}>PROJECT NOTES</Text>
          <Text style={styles.noteItem}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Note I:</Text> Dumpster delivery will be scheduled for the first day of demolition. Please ensure clear access to the driveway or designated area.
          </Text>
          <Text style={styles.noteItem}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Note II:</Text> {companyName} will take reasonable precautions to minimize dust and disruption, including floor protection, dust barriers, and daily cleanup.
          </Text>
          <Text style={styles.noteItem}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Note III:</Text> Estimated project timeline is approximately 14 working days from start date, pending material lead times.
          </Text>
          <Text style={styles.noteItem}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Note IV:</Text> Permits, if required, are EXCLUDED from this proposal unless noted otherwise.
          </Text>
          <Text style={styles.noteItem}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Note V:</Text> This estimate is valid for 30 days. Final pricing subject to site conditions and material selections.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>{companyName}</Text>
        </View>
      </Page>
    </Document>
  );
}
