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
}

interface LineItem {
  description: string;
  quantity?: number;
  unit?: string;
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

function buildTradeGroups(estimate: Estimate): TradeGroup[] {
  const groups: TradeGroup[] = [];

  const payload = estimate.internal_json_payload as Record<string, unknown> | null;
  const lineItems = (payload?.pricing as Record<string, unknown>)?.line_items as Array<{
    category: string;
    task_description: string;
    cp_total: number;
    quantity?: number;
    unit?: string;
  }> | undefined;

  // Category normalization mapping - combines related trades
  // Also check task description for proper categorization
  const normalizeCategory = (cat: string, taskDescription?: string): string => {
    const lower = cat.toLowerCase();
    const taskLower = (taskDescription || '').toLowerCase();
    
    // LED Mirror is electrical work, not glass - check task description first
    if (taskLower.includes('led mirror') || taskLower.includes('backlit mirror') || 
        (taskLower.includes('mirror') && taskLower.includes('wiring'))) {
      return 'Electrical';
    }
    
    // Vanity Light is electrical, not vanity
    if (taskLower.includes('vanity light') || taskLower.includes('light fixture') ||
        taskLower.includes('recessed') || taskLower.includes('can light')) {
      return 'Electrical';
    }
    
    // Exhaust fan is electrical/mechanical
    if (taskLower.includes('exhaust fan') || taskLower.includes('bath fan') || 
        taskLower.includes('vent fan')) {
      return 'Electrical';
    }
    
    // Bathroom accessories - towel bars, TP holders, robe hooks, etc.
    if (taskLower.includes('towel bar') || taskLower.includes('towel ring') || 
        taskLower.includes('towel rack') || taskLower.includes('toilet paper') ||
        taskLower.includes('tp holder') || taskLower.includes('robe hook') ||
        taskLower.includes('shower shelf') || taskLower.includes('soap dish') ||
        taskLower.includes('grab bar') || taskLower.includes('accessories')) {
      return 'Accessories';
    }
    
    // Mirror (non-LED) goes to Accessories
    if (taskLower.includes('mirror') && !taskLower.includes('led') && !taskLower.includes('backlit')) {
      return 'Accessories';
    }
    
    // Toilet is plumbing
    if (taskLower.includes('toilet') && !taskLower.includes('paper')) {
      return 'Plumbing';
    }
    
    // Shower door/glass enclosure
    if (taskLower.includes('shower door') || taskLower.includes('glass door') ||
        taskLower.includes('frameless glass') || taskLower.includes('glass panel') ||
        taskLower.includes('glass enclosure')) {
      return 'Glass';
    }
    
    // Combine Tile, Support, Waterproofing, Cement Board into single category
    if (lower === 'tile' || lower === 'support' || lower === 'waterproofing' || 
        lower === 'cement board' || lower === 'tile & waterproofing' || 
        lower === 'tile & support' || lower.includes('backer board') ||
        lower.includes('floor tile') || lower.includes('wall tile') ||
        lower.includes('shower floor') || lower.includes('shower wall')) {
      return 'Tile & Support';
    }
    if (lower === 'demo' || lower === 'demolition' || lower.includes('haul')) {
      return 'Demolition';
    }
    if (lower === 'paint' || lower === 'drywall' || lower === 'paint & drywall') {
      return 'Paint & Drywall';
    }
    // Vanity cabinet (not light)
    if (lower === 'vanity' || lower.includes('vanity cabinet')) {
      return 'Vanity';
    }
    // Countertop/Quartz
    if (lower === 'countertop' || lower === 'quartz' || lower.includes('countertops')) {
      return 'Countertop';
    }
    // Cabinetry
    if (lower === 'cabinet' || lower === 'cabinetry' || lower.includes('cabinets')) {
      return 'Cabinetry';
    }
    // Framing/Structural
    if (lower === 'framing' || lower === 'structural' || lower.includes('blocking') ||
        lower.includes('niche')) {
      return 'Framing';
    }
    // Materials categories - group by type
    if (lower.includes('materials') && lower.includes('plumbing')) {
      return 'Materials - Plumbing';
    }
    if (lower.includes('materials') && lower.includes('tile')) {
      return 'Materials - Tile';
    }
    return cat;
  };

  if (lineItems && lineItems.length > 0) {
    // Group line items by category
    const grouped: Record<string, { items: LineItem[]; total: number }> = {};
    
    for (const item of lineItems) {
      const category = normalizeCategory(item.category || 'Other', item.task_description);
      
      if (!grouped[category]) {
        grouped[category] = { items: [], total: 0 };
      }
      
      // Add the actual line item description with quantity/unit
      grouped[category].items.push({
        description: item.task_description,
        quantity: item.quantity,
        unit: item.unit,
      });
      grouped[category].total += item.cp_total || 0;
    }
    
    // Convert to array
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
    // Fallback to legacy estimate fields
    if (estimate.include_demo !== false && (estimate.demo_cp_total || 0) > 0) {
      groups.push({
        trade: 'Demolition',
        items: [{ description: 'Demo, debris removal, and dumpster' }],
        total: estimate.demo_cp_total || 0,
      });
    }

    if (estimate.include_plumbing !== false && (estimate.plumbing_cp_total || 0) > 0) {
      groups.push({
        trade: 'Plumbing',
        items: [{ description: 'Plumbing rough-in and fixture installation' }],
        total: estimate.plumbing_cp_total || 0,
      });
    }

    if ((estimate.tile_cp_total || 0) > 0 || (estimate.waterproofing_cp_total || 0) > 0) {
      const tileTotal = (estimate.tile_cp_total || 0) + (estimate.waterproofing_cp_total || 0);
      groups.push({
        trade: 'Tile & Waterproofing',
        items: [
          { description: 'Tile installation (wall and floor)' },
          { description: 'Waterproofing system' },
        ],
        total: tileTotal,
      });
    }

    if (estimate.include_electrical !== false && ((estimate.lighting_cp_total || 0) > 0 || estimate.num_recessed_cans || estimate.num_vanity_lights)) {
      groups.push({
        trade: 'Electrical',
        items: [{ description: 'Lighting and electrical work' }],
        total: estimate.lighting_cp_total || 0,
      });
    }

    if ((estimate.vanities_cp_total || 0) > 0) {
      groups.push({
        trade: 'Vanity',
        items: [{ description: `Vanity installation${estimate.vanity_size ? ` (${estimate.vanity_size}")` : ''}` }],
        total: estimate.vanities_cp_total || 0,
      });
    }

    if ((estimate.cabinets_cp_total || 0) > 0) {
      groups.push({
        trade: 'Cabinetry',
        items: [{ description: 'Cabinet installation' }],
        total: estimate.cabinets_cp_total || 0,
      });
    }

    if ((estimate.quartz_cp_total || 0) > 0) {
      groups.push({
        trade: 'Countertops',
        items: [{ description: 'Quartz countertop fabrication and installation' }],
        total: estimate.quartz_cp_total || 0,
      });
    }

    if (estimate.include_glass !== false && (estimate.glass_cp_total || 0) > 0) {
      groups.push({
        trade: 'Shower Glass',
        items: [{ description: `Frameless glass${estimate.glass_type ? ` (${estimate.glass_type.replace('_', ' ')})` : ''}` }],
        total: estimate.glass_cp_total || 0,
      });
    }

    if (estimate.include_paint !== false && (estimate.paint_cp_total || 0) > 0) {
      groups.push({
        trade: 'Painting',
        items: [{ description: 'Paint and drywall finish' }],
        total: estimate.paint_cp_total || 0,
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

  return groups;
}

export function ProposalPdf({ contractor, estimate, pricingConfig }: ProposalPdfProps) {
  const settings: ContractorSettings = (contractor.settings as ContractorSettings) || defaultSettings;
  const { companyProfile, branding, defaults } = settings;

  const depositSplit = (defaults.depositPct || pricingConfig?.payment_split_deposit || 65) / 100;
  const progressSplit = (defaults.progressPct || pricingConfig?.payment_split_progress || 25) / 100;
  const finalSplit = (defaults.finalPct || pricingConfig?.payment_split_final || 10) / 100;

  const totalCost = estimate.final_cp_total || 0;
  const depositAmount = Math.round(totalCost * depositSplit);
  const progressAmount = Math.round(totalCost * progressSplit);
  const finalAmount = Math.round(totalCost * finalSplit);

  const addressParts = [estimate.property_address, estimate.city, estimate.state, estimate.zip].filter(Boolean);
  const fullAddress = addressParts.join(', ').replace(/,\s*,/g, ',');

  const clientName = estimate.client_name || 'Valued Customer';
  const companyName = companyProfile.companyName || branding.headerTitle || 'The Kitchen & Bath Store of Orlando';
  const companyPhone = companyProfile.phone || '';
  const companyEmail = companyProfile.email || '';

  const tradeGroups = buildTradeGroups(estimate);

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
              <Text key={itemIdx} style={{ fontSize: 9, color: '#475569', paddingLeft: 4, lineHeight: 1.4, marginBottom: 2 }}>
                • {formatLineItemForPdf(item.description, item.quantity, item.unit)}
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
            <Text style={styles.finalPriceAmount}>{formatCurrency(totalCost)}</Text>
          </View>
        </View>

        {/* Payment Schedule */}
        <View style={styles.paymentSection} wrap={false}>
          <Text style={styles.sectionTitle}>Payment Schedule</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(depositSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>Deposit – Due upon signing</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(depositAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(progressSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>Progress – Due at rough-in</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(progressAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(finalSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>Final – Due at completion</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(finalAmount)}</Text>
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
