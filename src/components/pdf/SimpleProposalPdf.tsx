import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { Contractor, Estimate } from '@/types/database';
import { ContractorSettings, defaultSettings } from '@/types/settings';
import tkbsoLogo from '@/assets/tkbso-logo-full.png';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 100,
    paddingBottom: 70,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff',
  },
  
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
    marginBottom: 16,
  },
  
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
  
  // Room section styles
  roomSection: {
    marginTop: 12,
    marginBottom: 4,
  },
  roomHeader: {
    flexDirection: 'row',
    backgroundColor: '#0ea5e9',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  roomHeaderText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    flex: 1,
  },
  
  // Scope details label
  scopeLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    marginBottom: 4,
    paddingTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Bullet list styles (no prices)
  bulletList: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletPoint: {
    width: 12,
    fontSize: 9,
    color: '#475569',
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: '#1e293b',
    lineHeight: 1.4,
  },
  
  // Square footage breakdown box
  sqftBox: {
    marginTop: 8,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sqftTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sqftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  sqftLabel: {
    fontSize: 8,
    color: '#64748b',
  },
  sqftValue: {
    fontSize: 8,
    color: '#1e293b',
  },
  sqftTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
  },
  sqftTotalLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  sqftTotalValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  
  // Subtotal row with dual pricing
  subtotalRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e2e8f0',
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
  },
  subtotalLabel: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    textAlign: 'right',
    paddingRight: 10,
  },
  subtotalAmount: {
    width: 90,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  
  // Dual pricing styles
  dualPricingContainer: {
    alignItems: 'flex-end',
    paddingRight: 12,
    paddingBottom: 6,
    backgroundColor: '#e2e8f0',
  },
  marketPrice: {
    fontSize: 9,
    color: '#94a3b8',
    textDecoration: 'line-through',
    marginBottom: 2,
  },
  savingsText: {
    fontSize: 8,
    color: '#10b981',
    fontFamily: 'Helvetica-Bold',
  },
  
  // Summary table
  summarySection: {
    marginTop: 16,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryLabel: {
    flex: 1,
    fontSize: 10,
    color: '#475569',
  },
  summaryAmount: {
    width: 90,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  
  // Total row
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#1e3a8a',
    marginTop: 2,
  },
  totalLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textAlign: 'right',
    paddingRight: 10,
  },
  totalAmount: {
    width: 90,
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textAlign: 'right',
  },
  
  // Market comparison for total
  totalMarketRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1e3a8a',
  },
  totalMarketText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    marginRight: 20,
  },
  totalSavingsText: {
    fontSize: 9,
    color: '#4ade80',
    fontFamily: 'Helvetica-Bold',
  },
  
  // Additionals section
  additionalsSection: {
    marginTop: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 4,
  },
  additionalsTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#92400e',
    marginBottom: 8,
  },
  additionalsSubtitle: {
    fontSize: 8,
    color: '#a16207',
    marginBottom: 10,
    lineHeight: 1.4,
  },
  additionalItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  additionalCheckbox: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: '#d97706',
    marginRight: 8,
    marginTop: 1,
  },
  additionalContent: {
    flex: 1,
  },
  additionalDesc: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#78350f',
  },
  additionalDetails: {
    fontSize: 8,
    color: '#92400e',
    marginTop: 1,
  },
  additionalPrice: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#78350f',
    textAlign: 'right',
    width: 70,
  },
  additionalsTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f59e0b',
  },
  additionalsTotalLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#78350f',
  },
  additionalsTotalValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#78350f',
  },
  
  // Payment section
  paymentSection: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a8a',
    paddingBottom: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  paymentPercent: {
    width: 40,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
  },
  paymentLabel: {
    flex: 1,
    fontSize: 9,
    color: '#475569',
  },
  paymentAmount: {
    width: 80,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  paymentDetails: {
    paddingLeft: 40,
    marginTop: 2,
    marginBottom: 4,
  },
  paymentDetailsText: {
    fontSize: 8,
    color: '#64748b',
    fontStyle: 'italic',
  },
  
  // Signature section (Page 2)
  signatureSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  acceptanceTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a8a',
    paddingBottom: 4,
  },
  acceptanceText: {
    fontSize: 9,
    color: '#475569',
    marginBottom: 20,
    lineHeight: 1.5,
  },
  signatureRow: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 20,
  },
  signatureField: {
    flex: 1,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 4,
    height: 30,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#64748b',
  },
  
  // Notes section
  notesSection: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
  },
  notesTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  noteNumber: {
    width: 50,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
  },
  noteText: {
    flex: 1,
    fontSize: 8,
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
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
});

// STRICT PASSTHROUGH LINE ITEM INTERFACE
export interface PassthroughLineItem {
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  price: number;
  room_label?: string;
}

// Additional item interface
export interface Additional {
  id: string;
  description: string;
  details?: string;
  price: number;
  category?: string;
}

export interface SimpleProposalPdfProps {
  contractor: Contractor;
  estimate: Estimate;
  lineItems: PassthroughLineItem[];
  total: number;
  showDualPricing?: boolean;
  marketPriceMultiplier?: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Group line items by room_label
function groupLineItemsByRoom(lineItems: PassthroughLineItem[]): Map<string, PassthroughLineItem[]> {
  const grouped = new Map<string, PassthroughLineItem[]>();
  
  for (const item of lineItems) {
    const roomKey = item.room_label || '_general';
    if (!grouped.has(roomKey)) {
      grouped.set(roomKey, []);
    }
    grouped.get(roomKey)!.push(item);
  }
  
  return grouped;
}

// Calculate subtotal for a group of items
function calculateSubtotal(items: PassthroughLineItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Parse dimensions from room label (e.g., "Guest Bath 1 (31"x59")" -> { width: 31, length: 59 })
function parseDimensionsFromLabel(roomLabel: string): { width: number; length: number } | null {
  // Try to match patterns like (31"x59"), (3x5), (3'x5'), etc.
  const patterns = [
    /\((\d+)"?\s*x\s*(\d+)"?\)/i,  // (31"x59") or (31x59)
    /\((\d+)'?\s*x\s*(\d+)'?\)/i,   // (3'x5') or (3x5)
  ];
  
  for (const pattern of patterns) {
    const match = roomLabel.match(pattern);
    if (match) {
      return {
        width: parseInt(match[1]),
        length: parseInt(match[2]),
      };
    }
  }
  return null;
}

// Calculate wall tile square footage
function calculateWallTileSqft(showerDims: { width: number; length: number }, ceilingHeight: number = 96): number {
  // Convert to feet if dimensions are in inches (> 20 means inches)
  const widthFt = showerDims.width > 20 ? showerDims.width / 12 : showerDims.width;
  const lengthFt = showerDims.length > 20 ? showerDims.length / 12 : showerDims.length;
  const heightFt = ceilingHeight / 12;
  
  // Calculate three walls (back + two sides)
  const backWall = lengthFt * heightFt;
  const sideWall1 = widthFt * heightFt;
  const sideWall2 = widthFt * heightFt;
  
  // Total minus 15% for door opening
  const totalWallSqft = (backWall + sideWall1 + sideWall2) * 0.85;
  
  return Math.ceil(totalWallSqft);
}

// Calculate shower floor square footage
function calculateShowerFloorSqft(showerDims: { width: number; length: number }): number {
  // Convert to feet if dimensions are in inches
  const widthFt = showerDims.width > 20 ? showerDims.width / 12 : showerDims.width;
  const lengthFt = showerDims.length > 20 ? showerDims.length / 12 : showerDims.length;
  
  // Add 10% for waste and cuts
  const floorSqft = (widthFt * lengthFt) * 1.1;
  
  return Math.ceil(floorSqft);
}

// Calculate market price (typically 23% higher)
function calculateMarketPrice(customerPrice: number, multiplier: number = 1.23): number {
  return Math.round(customerPrice * multiplier);
}

// Determine the most appropriate payment milestone based on scope
interface PaymentMilestone {
  type: 'tile_installation' | 'vanity_installation' | 'cabinet_installation' | 'rough_plumbing' | 'drywall_complete' | 'countertop_installation' | 'mid_project';
  description: string;
  details: string;
}

function determineProgressMilestone(lineItems: PassthroughLineItem[], estimate: Estimate): PaymentMilestone {
  const itemNames = lineItems.map(item => item.name.toLowerCase()).join(' ');
  
  // Priority 1: Tile work (most common for bathroom remodels)
  const hasTileWork = itemNames.includes('tile') || 
                      itemNames.includes('shower') || 
                      itemNames.includes('waterproof') ||
                      estimate.tile_cp_total && estimate.tile_cp_total > 0;
  
  // Priority 2: Vanity/cabinet work
  const hasVanityWork = itemNames.includes('vanity') || 
                        itemNames.includes('cabinet') ||
                        estimate.vanities_cp_total && estimate.vanities_cp_total > 0 ||
                        estimate.cabinets_cp_total && estimate.cabinets_cp_total > 0;
  
  // Priority 3: Plumbing work
  const hasPlumbingWork = itemNames.includes('plumb') || 
                          estimate.plumbing_cp_total && estimate.plumbing_cp_total > 0;
  
  // Priority 4: Framing/Drywall work
  const hasFramingWork = itemNames.includes('fram') || 
                         itemNames.includes('drywall') ||
                         estimate.demo_cp_total && estimate.demo_cp_total > 0;
  
  // Priority 5: Countertop work (kitchens)
  const hasCountertopWork = itemNames.includes('countertop') || 
                            itemNames.includes('quartz') ||
                            estimate.quartz_cp_total && estimate.quartz_cp_total > 0;
  
  // Determine milestone based on what work is most prominent
  if (hasTileWork) {
    return {
      type: 'tile_installation',
      description: 'Due upon tile installation',
      details: 'Rough plumbing and framing substantially complete',
    };
  }
  
  if (hasVanityWork && estimate.has_bathrooms) {
    return {
      type: 'vanity_installation',
      description: 'Due upon vanity installation',
      details: 'Tile work and plumbing rough-in complete',
    };
  }
  
  if (hasVanityWork && estimate.has_kitchen) {
    return {
      type: 'cabinet_installation',
      description: 'Due upon cabinet installation',
      details: 'Demolition and prep work complete',
    };
  }
  
  if (hasCountertopWork) {
    return {
      type: 'countertop_installation',
      description: 'Due upon countertop installation',
      details: 'Cabinets installed and plumbing rough-in complete',
    };
  }
  
  if (hasPlumbingWork) {
    return {
      type: 'rough_plumbing',
      description: 'Due upon rough plumbing completion',
      details: 'Demolition and framing complete',
    };
  }
  
  if (hasFramingWork) {
    return {
      type: 'drywall_complete',
      description: 'Due upon drywall completion',
      details: 'Framing and rough utilities complete',
    };
  }
  
  // Fallback: Generic mid-project
  return {
    type: 'mid_project',
    description: 'Due at project midpoint',
    details: 'Approximately 50% of work complete',
  };
}

// Check if room has tile work
function roomHasTileWork(items: PassthroughLineItem[]): boolean {
  return items.some(item => {
    const name = item.name.toLowerCase();
    return name.includes('tile') || name.includes('waterproof') || name.includes('shower');
  });
}

// Standard project notes
const DEFAULT_NOTES = [
  'Dumpster delivery will be scheduled for the first day of demolition. Please ensure clear access to the work area.',
  'We will take reasonable precautions to minimize dust and disruption, including floor protection, dust barriers, and daily cleanup.',
  'Estimated project timeline is approximately 14 working days from start date, pending material lead times.',
  'Permits, if required, are EXCLUDED from this proposal unless specifically noted otherwise.',
  'This estimate is valid for 30 days. Final pricing subject to site conditions and material selections.',
];

// Get additionals from estimate
function getAdditionals(estimate: Estimate): Additional[] {
  const payload = estimate.internal_json_payload as Record<string, unknown> | null;
  return (payload?.additionals as Additional[]) || [];
}

export function SimpleProposalPdf({ 
  contractor, 
  estimate, 
  lineItems,
  total,
  showDualPricing,
  marketPriceMultiplier = 1.23,
}: SimpleProposalPdfProps) {
  const settings: ContractorSettings = (contractor.settings as ContractorSettings) || defaultSettings;
  const { companyProfile, branding, defaults } = settings;

  // Use setting from contractor defaults, with prop override capability
  const shouldShowDualPricing = showDualPricing !== undefined 
    ? showDualPricing 
    : (defaults.showMarketComparison ?? true);

  // Payment splits
  const depositSplit = (defaults.depositPct || 65) / 100;
  const progressSplit = (defaults.progressPct || 25) / 100;
  const finalSplit = (defaults.finalPct || 10) / 100;

  const depositAmount = Math.round(total * depositSplit);
  const progressAmount = Math.round(total * progressSplit);
  const finalAmount = Math.round(total * finalSplit);

  // Dynamic milestone detection
  const progressMilestone = determineProgressMilestone(lineItems, estimate);

  const addressParts = [estimate.property_address, estimate.city, estimate.state, estimate.zip].filter(Boolean);
  const fullAddress = addressParts.join(', ').replace(/,\s*,/g, ',');

  const clientName = estimate.client_name || 'Valued Customer';
  const companyName = companyProfile.companyName || branding.headerTitle || contractor.name;
  const companyPhone = companyProfile.phone || contractor.primary_contact_phone || '';
  const companyEmail = companyProfile.email || contractor.primary_contact_email || '';

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Group items by room
  const groupedItems = groupLineItemsByRoom(lineItems);
  const roomEntries = Array.from(groupedItems.entries());
  
  // Calculate base total from line items (for scaling when user selects high/low)
  const baseTotal = lineItems.reduce((sum, item) => sum + item.price, 0);
  const scaleFactor = baseTotal > 0 ? total / baseTotal : 1;
  
  // Calculate room subtotals for summary (scaled to match selected price level)
  const roomSubtotals = roomEntries.map(([label, items]) => ({
    label: label === '_general' ? 'General Items' : label,
    subtotal: Math.round(calculateSubtotal(items) * scaleFactor),
  }));

  // Get additionals
  const additionals = getAdditionals(estimate);
  const additionalsTotal = additionals.reduce((sum, a) => sum + a.price, 0);

  // Market price calculations
  const marketPrice = calculateMarketPrice(total, marketPriceMultiplier);
  const savings = marketPrice - total;
  const savingsPercent = Math.round((savings / marketPrice) * 100);

  // Custom notes from estimate
  const customNotes = estimate.job_notes ? [estimate.job_notes] : [];

  return (
    <Document>
      {/* PAGE 1: Quote Details */}
      <Page size="LETTER" style={styles.page} wrap>
        {/* Fixed Header */}
        <View style={styles.headerBanner} fixed>
          <Image src={contractor.logo_url || tkbsoLogo} style={styles.logo} />
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
        <View style={styles.clientSection}>
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

        {/* ROOM SECTIONS - Bullets without prices, subtotals per room */}
        {roomEntries.map(([roomLabel, roomItems], groupIndex) => {
          const rawSubtotal = calculateSubtotal(roomItems);
          const subtotal = Math.round(rawSubtotal * scaleFactor);
          const displayLabel = roomLabel === '_general' ? 'Scope of Work' : roomLabel;
          
          // Parse dimensions for sqft calculation
          const dims = parseDimensionsFromLabel(roomLabel);
          const hasTile = roomHasTileWork(roomItems);
          
          // Calculate sqft if we have dimensions and tile work
          const wallTileSqft = dims && hasTile ? calculateWallTileSqft(dims) : null;
          const showerFloorSqft = dims && hasTile ? calculateShowerFloorSqft(dims) : null;
          const totalTileSqft = wallTileSqft && showerFloorSqft ? wallTileSqft + showerFloorSqft : null;
          
          // Calculate market price for this room
          const roomMarketPrice = shouldShowDualPricing ? calculateMarketPrice(subtotal, marketPriceMultiplier) : null;
          const roomSavings = roomMarketPrice ? roomMarketPrice - subtotal : 0;
          
          return (
            <View key={roomLabel} style={styles.roomSection} wrap={false}>
              {/* Room Header */}
              <View style={styles.roomHeader}>
                <Text style={styles.roomHeaderText}>{displayLabel}</Text>
              </View>
              
              {/* Bullet List (NO PRICES) */}
              <View style={styles.bulletList}>
                <Text style={styles.scopeLabel}>Scope Details</Text>
                {roomItems.map((item, index) => (
                  <View key={`${roomLabel}-${index}`} style={styles.bulletItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{item.name}</Text>
                  </View>
                ))}
              </View>
              
              {/* Square Footage Breakdown (if applicable) */}
              {totalTileSqft && (
                <View style={styles.sqftBox}>
                  <Text style={styles.sqftTitle}>Square Footage Breakdown</Text>
                  {wallTileSqft && (
                    <View style={styles.sqftRow}>
                      <Text style={styles.sqftLabel}>Wall Tile (3 walls to 96"):</Text>
                      <Text style={styles.sqftValue}>{wallTileSqft} sqft</Text>
                    </View>
                  )}
                  {showerFloorSqft && (
                    <View style={styles.sqftRow}>
                      <Text style={styles.sqftLabel}>Shower Floor Tile:</Text>
                      <Text style={styles.sqftValue}>{showerFloorSqft} sqft</Text>
                    </View>
                  )}
                  <View style={styles.sqftTotalRow}>
                    <Text style={styles.sqftTotalLabel}>Total Tile Coverage:</Text>
                    <Text style={styles.sqftTotalValue}>{totalTileSqft} sqft</Text>
                  </View>
                </View>
              )}
              
              {/* Dual Pricing Display */}
              {shouldShowDualPricing && roomMarketPrice && (
                <View style={styles.dualPricingContainer}>
                  <Text style={styles.marketPrice}>Market: {formatCurrency(roomMarketPrice)}</Text>
                  <Text style={styles.savingsText}>Save {formatCurrency(roomSavings)}</Text>
                </View>
              )}
              
              {/* Room Subtotal */}
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>{displayLabel} Subtotal:</Text>
                <Text style={styles.subtotalAmount}>{formatCurrency(subtotal)}</Text>
              </View>
            </View>
          );
        })}

        {/* Additionals Section (if any) */}
        {additionals.length > 0 && (
          <View style={styles.additionalsSection} wrap={false}>
            <Text style={styles.additionalsTitle}>RECOMMENDED ADDITIONALS (Optional)</Text>
            <Text style={styles.additionalsSubtitle}>
              These optional upgrades can enhance your project. Let us know if you would like to include any of these in your final quote.
            </Text>
            
            {additionals.map((item, index) => (
              <View key={item.id || index} style={styles.additionalItem}>
                <View style={styles.additionalCheckbox} />
                <View style={styles.additionalContent}>
                  <Text style={styles.additionalDesc}>{item.description}</Text>
                  {item.details && (
                    <Text style={styles.additionalDetails}>{item.details}</Text>
                  )}
                </View>
                <Text style={styles.additionalPrice}>Add: {formatCurrency(item.price)}</Text>
              </View>
            ))}
            
            <View style={styles.additionalsTotalRow}>
              <Text style={styles.additionalsTotalLabel}>Total if all additionals selected:</Text>
              <Text style={styles.additionalsTotalValue}>{formatCurrency(additionalsTotal)}</Text>
            </View>
          </View>
        )}

        {/* Summary Table (if multiple rooms) */}
        {roomSubtotals.length > 1 && (
          <View style={styles.summarySection}>
            {roomSubtotals.map((room, index) => (
              <View key={index} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{room.label}</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(room.subtotal)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Total Row */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL PROJECT INVESTMENT</Text>
          <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
        </View>
        
        {/* Market comparison for total */}
        {shouldShowDualPricing && (
          <View style={styles.totalMarketRow}>
            <Text style={styles.totalMarketText}>Market Value: {formatCurrency(marketPrice)}</Text>
            <Text style={styles.totalSavingsText}>You Save: {formatCurrency(savings)} ({savingsPercent}%)</Text>
          </View>
        )}

        {/* Payment Schedule with Dynamic Milestones */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>PAYMENT SCHEDULE</Text>
          
          {/* Deposit */}
          <View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentPercent}>{Math.round(depositSplit * 100)}%</Text>
              <Text style={styles.paymentLabel}>Deposit – Due upon contract signing</Text>
              <Text style={styles.paymentAmount}>{formatCurrency(depositAmount)}</Text>
            </View>
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentDetailsText}>
                Includes mobilization, materials ordering, and scheduling
              </Text>
            </View>
          </View>
          
          {/* Progress - DYNAMIC MILESTONE */}
          <View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentPercent}>{Math.round(progressSplit * 100)}%</Text>
              <Text style={styles.paymentLabel}>Progress – {progressMilestone.description}</Text>
              <Text style={styles.paymentAmount}>{formatCurrency(progressAmount)}</Text>
            </View>
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentDetailsText}>{progressMilestone.details}</Text>
            </View>
          </View>
          
          {/* Final */}
          <View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentPercent}>{Math.round(finalSplit * 100)}%</Text>
              <Text style={styles.paymentLabel}>Final – Due at project completion</Text>
              <Text style={styles.paymentAmount}>{formatCurrency(finalAmount)}</Text>
            </View>
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentDetailsText}>
                Final walkthrough and punchlist complete
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>© {new Date().getFullYear()} {companyName}</Text>
        </View>
      </Page>

      {/* PAGE 2: Acceptance & Terms */}
      <Page size="LETTER" style={styles.page}>
        {/* Fixed Header */}
        <View style={styles.headerBanner} fixed>
          <Image src={contractor.logo_url || tkbsoLogo} style={styles.logo} />
          <View style={styles.headerContactRow}>
            {companyPhone && <Text style={styles.headerContactText}>{companyPhone}</Text>}
            {companyEmail && <Text style={styles.headerContactText}>{companyEmail}</Text>}
          </View>
        </View>

        {/* Acceptance Section */}
        <View style={styles.signatureSection}>
          <Text style={styles.acceptanceTitle}>ACCEPTANCE</Text>
          <Text style={styles.acceptanceText}>
            By signing below, I accept this quote and agree to the terms, scope of work, and payment schedule outlined above. 
            I understand that any changes to the scope of work may result in additional charges. 
            Work will commence upon receipt of the signed agreement and initial deposit.
          </Text>
          
          {/* Client Signature */}
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
          
          {/* Contractor Signature */}
          <View style={styles.signatureRow}>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>{companyName}</Text>
            </View>
            <View style={styles.signatureField}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
        </View>

        {/* Project Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>PROJECT NOTES</Text>
          
          {DEFAULT_NOTES.map((note, index) => (
            <View key={index} style={styles.noteItem}>
              <Text style={styles.noteNumber}>Note {index + 1}:</Text>
              <Text style={styles.noteText}>{note}</Text>
            </View>
          ))}
          
          {/* Custom notes from estimate */}
          {customNotes.map((note, index) => (
            <View key={`custom-${index}`} style={styles.noteItem}>
              <Text style={styles.noteNumber}>Note {DEFAULT_NOTES.length + index + 1}:</Text>
              <Text style={styles.noteText}>{note}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} {companyName} | {companyPhone} | {companyEmail}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
