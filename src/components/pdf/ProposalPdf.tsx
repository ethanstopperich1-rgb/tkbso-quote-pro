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

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
  },
  
  // Header
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 200,
    height: 'auto',
    marginBottom: 20,
  },
  quoteTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  // Client Info
  clientSection: {
    backgroundColor: '#f8fafc',
    padding: 16,
    marginBottom: 20,
    borderRadius: 4,
  },
  clientName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  clientDetail: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 3,
  },
  
  // Trade Section
  tradeSection: {
    marginBottom: 16,
  },
  tradeHeader: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    backgroundColor: '#f1f5f9',
    padding: 8,
    marginBottom: 8,
  },
  lineItem: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  lineItemText: {
    flex: 1,
    fontSize: 10,
    color: '#475569',
  },
  lineItemPrice: {
    width: 80,
    fontSize: 10,
    color: '#1e293b',
    textAlign: 'right',
  },
  
  // Final Price
  finalPriceSection: {
    backgroundColor: '#1e3a8a',
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  finalPriceLabel: {
    fontSize: 11,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  finalPriceAmount: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  
  // Payment Milestones
  paymentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  paymentRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  paymentPercent: {
    width: 50,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
  },
  paymentLabel: {
    flex: 1,
    fontSize: 10,
    color: '#475569',
  },
  paymentAmount: {
    width: 80,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  
  // Signature Block
  signatureSection: {
    marginBottom: 20,
  },
  acceptanceText: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 16,
    lineHeight: 1.4,
  },
  signatureRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 40,
  },
  signatureField: {
    flex: 1,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 4,
    height: 24,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  printedNameLabel: {
    fontSize: 10,
    color: '#475569',
    marginTop: 8,
  },
  
  // Notes
  notesSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fefce8',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#713f12',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: '#854d0e',
    lineHeight: 1.5,
  },
  
  // Footer
  pageFooter: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 8,
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
  price?: number;
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

  // Check for line items in internal_json_payload
  const payload = estimate.internal_json_payload as Record<string, unknown> | null;
  const lineItems = (payload?.pricing as Record<string, unknown>)?.line_items as Array<{
    category: string;
    task_description: string;
    cp_total: number;
  }> | undefined;

  if (lineItems && lineItems.length > 0) {
    // Group line items by category
    const grouped: Record<string, LineItem[]> = {};
    const totals: Record<string, number> = {};
    
    for (const item of lineItems) {
      const category = item.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
        totals[category] = 0;
      }
      grouped[category].push({
        description: item.task_description,
        price: item.cp_total,
      });
      totals[category] += item.cp_total || 0;
    }
    
    for (const [trade, items] of Object.entries(grouped)) {
      groups.push({ trade, items, total: totals[trade] });
    }
  } else {
    // Build from estimate fields
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

  // Project notes
  const notes = estimate.job_notes || defaults.termsText || 'This estimate is valid for 30 days. Final pricing subject to site conditions and material selections. Permits, if required, are included unless noted otherwise.';

  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        {/* Header with Logo Centered */}
        <View style={styles.headerSection} wrap={false}>
          {branding.logoUrl ? (
            <Image src={branding.logoUrl} style={styles.logo} />
          ) : (
            <Image src={tkbsoLogo} style={styles.logo} />
          )}
          <Text style={styles.quoteTitle}>Quote for {clientName}</Text>
        </View>

        {/* Client Contact Info & Address */}
        <View style={styles.clientSection} wrap={false}>
          <Text style={styles.clientName}>{clientName}</Text>
          {estimate.client_phone && (
            <Text style={styles.clientDetail}>Phone: {estimate.client_phone}</Text>
          )}
          {estimate.client_email && (
            <Text style={styles.clientDetail}>Email: {estimate.client_email}</Text>
          )}
          {fullAddress && (
            <Text style={styles.clientDetail}>Address: {fullAddress}</Text>
          )}
          <Text style={styles.clientDetail}>Date: {currentDate}</Text>
        </View>

        {/* Trade-by-Trade Breakdown */}
        {tradeGroups.map((group, idx) => (
          <View key={idx} style={styles.tradeSection} wrap={false}>
            <Text style={styles.tradeHeader}>{group.trade.toUpperCase()}</Text>
            {group.items.map((item, itemIdx) => (
              <View key={itemIdx} style={styles.lineItem}>
                <Text style={styles.lineItemText}>• {item.description}</Text>
                {item.price !== undefined && item.price > 0 && (
                  <Text style={styles.lineItemPrice}>{formatCurrency(item.price)}</Text>
                )}
              </View>
            ))}
            <View style={[styles.lineItem, { backgroundColor: '#f8fafc' }]}>
              <Text style={[styles.lineItemText, { fontFamily: 'Helvetica-Bold' }]}>
                {group.trade} Total
              </Text>
              <Text style={[styles.lineItemPrice, { fontFamily: 'Helvetica-Bold' }]}>
                {formatCurrency(group.total)}
              </Text>
            </View>
          </View>
        ))}

        {/* Final Price */}
        <View style={styles.finalPriceSection} wrap={false}>
          <Text style={styles.finalPriceLabel}>Total Investment</Text>
          <Text style={styles.finalPriceAmount}>{formatCurrency(totalCost)}</Text>
        </View>

        {/* Payment Milestones */}
        <View style={styles.paymentSection} wrap={false}>
          <Text style={styles.sectionTitle}>Payment Schedule</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(depositSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>Deposit – Due upon contract signing</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(depositAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(progressSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>Progress – Due at rough-in completion</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(progressAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(finalSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>Final – Due at project completion</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(finalAmount)}</Text>
          </View>
        </View>

        {/* Signature Block */}
        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.sectionTitle}>Acceptance</Text>
          <Text style={styles.acceptanceText}>
            By signing below, I accept this quote and agree to the terms and payment schedule outlined above.
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
          <View style={styles.signatureRow}>
            <View style={styles.signatureField}>
              <Text style={styles.printedNameLabel}>Printed Name: _______________________________</Text>
            </View>
          </View>
        </View>

        {/* General Notes */}
        <View style={styles.notesSection} wrap={false}>
          <Text style={styles.notesTitle}>Project Notes</Text>
          <Text style={styles.notesText}>{notes}</Text>
        </View>

        {/* Footer */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>
            {companyName}{companyPhone ? ` | ${companyPhone}` : ''}{companyEmail ? ` | ${companyEmail}` : ''}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
