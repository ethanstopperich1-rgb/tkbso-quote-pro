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
  
  // Table styles
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e3a8a',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  tableHeaderDescription: {
    flex: 1,
  },
  tableHeaderQty: {
    width: 60,
    textAlign: 'center',
  },
  tableHeaderPrice: {
    width: 80,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 9,
    color: '#1e293b',
  },
  tableCellDescription: {
    flex: 1,
  },
  tableCellQty: {
    width: 60,
    textAlign: 'center',
  },
  tableCellPrice: {
    width: 80,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
  },
  
  // Total row
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#1e3a8a',
    marginTop: 2,
  },
  totalLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textAlign: 'right',
    paddingRight: 10,
  },
  totalAmount: {
    width: 80,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textAlign: 'right',
  },
  
  // Payment section
  paymentSection: {
    marginTop: 20,
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
    width: 80,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  
  // Signature
  signatureSection: {
    marginTop: 20,
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
  
  // Notes
  notesSection: {
    marginTop: 16,
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

// STRICT PASSTHROUGH LINE ITEM INTERFACE
// This is exactly what the estimator produces - NO modifications allowed
export interface PassthroughLineItem {
  name: string;        // Display name - shown exactly as-is
  quantity: number;    // Quantity
  unit: string;        // Unit (ea, sqft, ls, etc.)
  cost: number;        // Internal cost (not shown to customer)
  price: number;       // Customer price - shown in table
}

export interface SimpleProposalPdfProps {
  contractor: Contractor;
  estimate: Estimate;
  // STRICT PASSTHROUGH: Line items are displayed exactly as provided
  lineItems: PassthroughLineItem[];
  // Total is pre-calculated by estimator - NOT recalculated here
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

  const isKitchenProject = estimate.has_kitchen && !estimate.has_bathrooms;
  const progressLabel = isKitchenProject
    ? (defaults.progressLabelKitchen || 'Due at arrival of cabinetry')
    : (defaults.progressLabelBathroom || 'Due at start of tile installation');

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

  const notes = estimate.job_notes || defaults.termsText || 
    'This estimate is valid for 30 days. Final pricing subject to site conditions and material selections. Permits, if required, are excluded unless noted otherwise.';

  return (
    <Document>
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

        {/* LINE ITEMS TABLE - STRICT PASSTHROUGH */}
        {/* Each line item is displayed exactly as provided - NO modifications */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.tableHeaderDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.tableHeaderQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.tableHeaderPrice]}>Price</Text>
          </View>

          {/* Data Rows - EXACTLY as provided by estimator */}
          {lineItems.map((item, index) => (
            <View 
              key={index} 
              style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
            >
              {/* Name is displayed EXACTLY as provided - no rewriting */}
              <Text style={[styles.tableCell, styles.tableCellDescription]}>
                {item.name}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellQty]}>
                {item.quantity} {item.unit}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellPrice]}>
                {formatCurrency(item.price)}
              </Text>
            </View>
          ))}

          {/* Total Row - uses pre-calculated total, NOT sum of items */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Payment Schedule */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Schedule</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(depositSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>Deposit – Due upon signing</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(depositAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(progressSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>Progress – {progressLabel}</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(progressAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(finalSplit * 100)}%</Text>
            <Text style={styles.paymentLabel}>Final – Due at completion</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(finalAmount)}</Text>
          </View>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
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
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Notes & Terms</Text>
          <Text style={styles.notesText}>{notes}</Text>
        </View>

        {/* Footer */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>© {new Date().getFullYear()} {companyName}</Text>
        </View>
      </Page>
    </Document>
  );
}
