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
import { generatePaymentMilestones, generateProjectNotes } from '@/lib/pdf-content-generator';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 50,
    backgroundColor: '#ffffff',
  },
  
  // Title banner
  titleBanner: {
    textAlign: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a8a',
  },
  estimateTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    letterSpacing: 4,
    marginBottom: 20,
  },
  
  // Customer info block
  customerBlock: {
    marginBottom: 16,
  },
  customerName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  customerAddress: {
    fontSize: 10,
    color: '#475569',
    marginBottom: 1,
  },
  
  // Project info
  projectInfo: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  projectRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  projectLabel: {
    fontSize: 10,
    color: '#64748b',
    width: 70,
  },
  projectValue: {
    fontSize: 10,
    color: '#1e293b',
  },
  
  // Scope header
  scopeHeader: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 6,
    letterSpacing: 1,
  },
  
  // Trade sections
  tradeSection: {
    marginBottom: 14,
  },
  tradeName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  tradeDescription: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  
  // Divider line
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    marginVertical: 20,
  },
  
  // Pricing section
  pricingSection: {
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  priceRange: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  priceNote: {
    fontSize: 9,
    color: '#64748b',
    fontStyle: 'italic',
  },
  
  // Payment schedule
  paymentSection: {
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
  },
  paymentTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    marginBottom: 10,
    letterSpacing: 1,
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  paymentPercent: {
    width: 40,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
  },
  paymentLabel: {
    flex: 1,
    fontSize: 10,
    color: '#475569',
  },
  
  // Notes section
  notesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
  },
  notesTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    marginBottom: 8,
    letterSpacing: 1,
  },
  noteItem: {
    fontSize: 9,
    color: '#475569',
    marginBottom: 3,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 2,
    borderTopColor: '#1e3a8a',
    paddingTop: 12,
    textAlign: 'center',
  },
  footerCompany: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    marginBottom: 2,
  },
  footerContact: {
    fontSize: 9,
    color: '#475569',
  },
});

export interface TradeScope {
  name: string;
  description: string;
}

export interface CleanEstimatePdfProps {
  contractor: Contractor;
  estimate: Estimate;
  projectLabel: string;
  tradeScopes: TradeScope[];
  priceRange: { low: number; high: number };
  notes?: string[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CleanEstimatePdf({
  contractor,
  estimate,
  projectLabel,
  tradeScopes,
  priceRange,
  notes,
}: CleanEstimatePdfProps) {
  const settings: ContractorSettings = (contractor.settings as ContractorSettings) || defaultSettings;
  const { companyProfile, defaults } = settings;

  const companyName = companyProfile.companyName || contractor.name || 'TKBSO';
  const companyPhone = companyProfile.phone || contractor.primary_contact_phone || '';
  const companyEmail = companyProfile.email || contractor.primary_contact_email || '';

  const clientName = estimate.client_name || 'Valued Customer';
  const addressLine1 = estimate.property_address || '';
  const addressLine2 = [estimate.city, estimate.state, estimate.zip].filter(Boolean).join(', ');

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Generate dynamic notes based on project scope
  const projectNotes = generateProjectNotes(estimate, companyName);
  const displayNotes = notes && notes.length > 0 ? notes : projectNotes;
  
  // Generate dynamic payment milestones
  const paymentMilestones = generatePaymentMilestones(estimate);

  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        {/* ESTIMATE Title */}
        <View style={styles.titleBanner}>
          <Text style={styles.estimateTitle}>ESTIMATE</Text>
        </View>

        {/* Customer Info */}
        <View style={styles.customerBlock}>
          <Text style={styles.customerName}>{clientName}</Text>
          {addressLine1 && <Text style={styles.customerAddress}>{addressLine1}</Text>}
          {addressLine2 && <Text style={styles.customerAddress}>{addressLine2}</Text>}
        </View>

        {/* Project Info */}
        <View style={styles.projectInfo}>
          <View style={styles.projectRow}>
            <Text style={styles.projectLabel}>Project:</Text>
            <Text style={styles.projectValue}>{projectLabel}</Text>
          </View>
          <View style={styles.projectRow}>
            <Text style={styles.projectLabel}>Date:</Text>
            <Text style={styles.projectValue}>{currentDate}</Text>
          </View>
          <View style={styles.projectRow}>
            <Text style={styles.projectLabel}>Valid for:</Text>
            <Text style={styles.projectValue}>30 days</Text>
          </View>
        </View>

        {/* SCOPE OF WORK */}
        <Text style={styles.scopeHeader}>SCOPE OF WORK</Text>

        {/* Trade Sections */}
        {tradeScopes.map((trade, index) => (
          <View key={index} style={styles.tradeSection} wrap={false}>
            <Text style={styles.tradeName}>{trade.name.toUpperCase()}</Text>
            <Text style={styles.tradeDescription}>{trade.description}</Text>
          </View>
        ))}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Price Range */}
        <View style={styles.pricingSection}>
          <Text style={styles.priceRange}>
            ESTIMATED PROJECT RANGE: {formatCurrency(priceRange.low)} – {formatCurrency(priceRange.high)}
          </Text>
          <Text style={styles.priceNote}>
            Final price depends on material selections and site conditions.
          </Text>
          <Text style={styles.priceNote}>
            Includes standard allowances for fixtures and finishes.
          </Text>
        </View>

        {/* Payment Schedule - Dynamic based on project scope */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>PAYMENT SCHEDULE</Text>
          {paymentMilestones.map((milestone, idx) => (
            <View key={idx} style={styles.paymentRow}>
              <Text style={styles.paymentPercent}>{milestone.percent}%</Text>
              <Text style={styles.paymentLabel}>{milestone.label}</Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>NOTES</Text>
          {displayNotes.map((note, index) => (
            <Text key={index} style={styles.noteItem}>
              {index + 1}. {note}
            </Text>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerCompany}>Prepared by: {companyName}</Text>
          <Text style={styles.footerContact}>
            {[companyPhone, companyEmail].filter(Boolean).join(' | ')}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
