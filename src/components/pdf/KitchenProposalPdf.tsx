import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { Contractor } from '@/types/database';
import { ContractorSettings, defaultSettings } from '@/types/settings';
import tkbsoLogo from '@/assets/tkbso-logo-full.png';
import { 
  QuoteSchema, 
  QuoteLineItem, 
  renderQuoteLineItem, 
  formatQuoteCurrency 
} from '@/types/quote-schema';

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
  
  // Additional Considerations
  considerationsSection: {
    marginTop: 14,
    marginBottom: 14,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  considerationsTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0369a1',
    marginBottom: 8,
  },
  considerationItem: {
    marginBottom: 8,
  },
  considerationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  considerationName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0c4a6e',
  },
  considerationPrice: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0369a1',
  },
  considerationDesc: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.4,
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

interface KitchenProposalPdfProps {
  contractor: Contractor;
  quote: QuoteSchema;
  priceRange?: {
    low: number;
    high: number;
  };
}

export function KitchenProposalPdf({ contractor, quote, priceRange }: KitchenProposalPdfProps) {
  const settings: ContractorSettings = (contractor.settings as ContractorSettings) || defaultSettings;
  const { companyProfile, branding } = settings;

  const showRange = priceRange && priceRange.low > 0 && priceRange.high > 0;
  const grandTotal = quote.totals.grand_total;

  // Build full address
  const addressParts = quote.customer.property_address 
    ? [
        quote.customer.property_address.street,
        quote.customer.property_address.city,
        quote.customer.property_address.state,
        quote.customer.property_address.zip
      ].filter(Boolean)
    : [];
  const fullAddress = addressParts.join(', ');

  const clientName = quote.customer.name || 'Valued Customer';
  const companyName = quote.metadata.company.name || companyProfile.companyName || 'The Kitchen & Bath Store of Orlando';
  const companyPhone = quote.metadata.company.phone || companyProfile.phone || '';
  const companyEmail = quote.metadata.company.email || companyProfile.email || '';

  const currentDate = new Date(quote.metadata.created_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get project type for display
  const projectTypeDisplay = quote.project.type === 'kitchen_remodel' ? 'Kitchen Remodel' : 
    quote.project.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

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
          {quote.customer.phone && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Phone:</Text>
              <Text style={styles.clientValue}>{quote.customer.phone}</Text>
            </View>
          )}
          {quote.customer.email && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Email:</Text>
              <Text style={styles.clientValue}>{quote.customer.email}</Text>
            </View>
          )}
          {fullAddress && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Property:</Text>
              <Text style={styles.clientValue}>{fullAddress}</Text>
            </View>
          )}
        </View>

        {/* Trade Sections with Professional Line Items */}
        {quote.project.areas.map((area) => (
          area.trades
            .sort((a, b) => a.trade_order - b.trade_order)
            .map((trade) => (
              <View key={trade.trade_id} style={styles.tradeSection} wrap={false}>
                <Text style={styles.tradeHeader}>{trade.trade_name}</Text>
                {trade.line_items.map((item: QuoteLineItem) => (
                  <Text key={item.item_id} style={styles.lineItem}>
                    {renderQuoteLineItem(item)}
                  </Text>
                ))}
              </View>
            ))
        ))}

        {/* Additional Considerations (Upsells) */}
        {quote.additional_considerations && quote.additional_considerations.length > 0 && (
          <View style={styles.considerationsSection} wrap={false}>
            <Text style={styles.considerationsTitle}>ADDITIONAL CONSIDERATIONS</Text>
            {quote.additional_considerations.map((item, idx) => (
              <View key={idx} style={styles.considerationItem}>
                <View style={styles.considerationHeader}>
                  <Text style={styles.considerationName}>{item.item_name}</Text>
                  <Text style={styles.considerationPrice}>
                    {formatQuoteCurrency(item.price_range.min)} – {formatQuoteCurrency(item.price_range.max)}
                  </Text>
                </View>
                <Text style={styles.considerationDesc}>{item.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Final Total */}
        <View wrap={false} style={{ marginTop: 10 }}>
          <View style={styles.finalPriceSection}>
            <Text style={styles.finalPriceLabel}>{projectTypeDisplay} Final Cost</Text>
            <Text style={styles.finalPriceAmount}>
              {showRange 
                ? `${formatQuoteCurrency(priceRange.low)} to ${formatQuoteCurrency(priceRange.high)}`
                : formatQuoteCurrency(grandTotal)
              }
            </Text>
          </View>
        </View>

        {/* Payment Milestones */}
        <View style={styles.paymentSection} wrap={false}>
          <Text style={styles.sectionTitle}>PAYMENT MILESTONES</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{quote.payment_schedule.deposit.percentage}%</Text>
            <Text style={styles.paymentLabel}>{quote.payment_schedule.deposit.description}</Text>
            <Text style={styles.paymentAmount}>
              {formatQuoteCurrency(quote.payment_schedule.deposit.amount)}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{quote.payment_schedule.progress.percentage}%</Text>
            <Text style={styles.paymentLabel}>{quote.payment_schedule.progress.description}</Text>
            <Text style={styles.paymentAmount}>
              {formatQuoteCurrency(quote.payment_schedule.progress.amount)}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{quote.payment_schedule.final.percentage}%</Text>
            <Text style={styles.paymentLabel}>{quote.payment_schedule.final.description}</Text>
            <Text style={styles.paymentAmount}>
              {formatQuoteCurrency(quote.payment_schedule.final.amount)}
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
        {quote.project_notes && quote.project_notes.length > 0 && (
          <View style={styles.notesSection} wrap={false}>
            <Text style={styles.notesTitle}>PROJECT NOTES</Text>
            {quote.project_notes.map((note) => (
              <Text key={note.note_number} style={styles.noteItem}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Note {note.note_number}:</Text> {note.text}
              </Text>
            ))}
            {quote.terms && (
              <Text style={styles.noteItem}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>Note {(quote.project_notes.length + 1)}:</Text> {quote.terms.permits_note}
              </Text>
            )}
            <Text style={styles.noteItem}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Note {(quote.project_notes.length + 2)}:</Text> This estimate is valid for {quote.terms?.validity_days || 30} days. Final pricing subject to site conditions and material selections.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>{companyName}</Text>
        </View>
      </Page>
    </Document>
  );
}
