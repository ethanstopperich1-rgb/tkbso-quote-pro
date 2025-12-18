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
  
  // Subtotal row
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

export interface SimpleProposalPdfProps {
  contractor: Contractor;
  estimate: Estimate;
  lineItems: PassthroughLineItem[];
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

// Standard project notes
const DEFAULT_NOTES = [
  'Dumpster delivery will be scheduled for the first day of demolition. Please ensure clear access to the work area.',
  'We will take reasonable precautions to minimize dust and disruption, including floor protection, dust barriers, and daily cleanup.',
  'Estimated project timeline is approximately 14 working days from start date, pending material lead times.',
  'Permits, if required, are EXCLUDED from this proposal unless specifically noted otherwise.',
  'This estimate is valid for 30 days. Final pricing subject to site conditions and material selections.',
];

export function SimpleProposalPdf({ 
  contractor, 
  estimate, 
  lineItems,
  total,
}: SimpleProposalPdfProps) {
  const settings: ContractorSettings = (contractor.settings as ContractorSettings) || defaultSettings;
  const { companyProfile, branding, defaults } = settings;

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
          const subtotal = Math.round(rawSubtotal * scaleFactor); // Scale to match selected price level
          const displayLabel = roomLabel === '_general' ? 'Scope of Work' : roomLabel;
          
          return (
            <View key={roomLabel} style={styles.roomSection} wrap={false}>
              {/* Room Header */}
              <View style={styles.roomHeader}>
                <Text style={styles.roomHeaderText}>{displayLabel}</Text>
              </View>
              
              {/* Bullet List (NO PRICES) */}
              <View style={styles.bulletList}>
                {roomItems.map((item, index) => (
                  <View key={`${roomLabel}-${index}`} style={styles.bulletItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{item.name}</Text>
                  </View>
                ))}
              </View>
              
              {/* Room Subtotal */}
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>{displayLabel} Subtotal:</Text>
                <Text style={styles.subtotalAmount}>{formatCurrency(subtotal)}</Text>
              </View>
            </View>
          );
        })}

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
