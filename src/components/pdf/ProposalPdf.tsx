import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';
import { Contractor, Estimate, PricingConfig } from '@/types/database';
import tkbsoLogo from '@/assets/tkbso-logo-full.png';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 10,
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 280,
    height: 'auto',
    marginBottom: 15,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e40af',
    marginVertical: 10,
  },
  titleSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  address: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    fontSize: 9,
    color: '#6b7280',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1e3a8a',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  investmentBox: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  rangeText: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 8,
  },
  recommendedText: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e3a8a',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 9,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 10,
  },
  bullet: {
    width: 15,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
  },
  scopeText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#374151',
    whiteSpace: 'pre-wrap',
  },
  paymentTable: {
    marginTop: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  paymentLabel: {
    flex: 2,
    fontSize: 10,
  },
  paymentPercent: {
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
  },
  paymentAmount: {
    flex: 1,
    fontSize: 10,
    fontWeight: 600,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 1.4,
  },
});

interface ProposalPdfProps {
  contractor: Contractor;
  estimate: Estimate;
  pricingConfig?: PricingConfig;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function parseScopeText(text: string): { intro: string; bullets: string[]; closing: string } {
  const lines = text.split('\n').filter(line => line.trim());
  const bullets: string[] = [];
  let intro = '';
  let closing = '';
  let foundBullet = false;
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
      foundBullet = true;
      bullets.push(trimmed.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, ''));
    } else if (!foundBullet && index < 3) {
      intro += (intro ? ' ' : '') + trimmed;
    } else if (foundBullet && bullets.length > 0) {
      closing += (closing ? ' ' : '') + trimmed;
    }
  });
  
  return { intro, bullets, closing };
}

export function ProposalPdf({ contractor, estimate, pricingConfig }: ProposalPdfProps) {
  const depositSplit = pricingConfig?.payment_split_deposit ?? 0.65;
  const progressSplit = pricingConfig?.payment_split_progress ?? 0.25;
  const finalSplit = pricingConfig?.payment_split_final ?? 0.10;
  
  const depositAmount = Math.round(estimate.final_cp_total * depositSplit);
  const progressAmount = Math.round(estimate.final_cp_total * progressSplit);
  const finalAmount = Math.round(estimate.final_cp_total * finalSplit);
  
  const fullAddress = [
    estimate.property_address,
    estimate.city,
    estimate.state,
    estimate.zip,
  ].filter(Boolean).join(', ');
  
  const scopeParsed = estimate.client_estimate_text
    ? parseScopeText(estimate.client_estimate_text)
    : { intro: '', bullets: [], closing: '' };

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image src={tkbsoLogo} style={styles.logo} />
        </View>
        
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            Proposal for {estimate.client_name || 'Valued Client'}
          </Text>
          <Text style={styles.subTitle}>
            {estimate.job_label || 'Kitchen & Bathroom Remodel Proposal'}
          </Text>
          {fullAddress && (
            <Text style={styles.address}>{fullAddress}</Text>
          )}
          <View style={styles.metadata}>
            <Text>Date: {formatDate(estimate.created_at)}</Text>
          </View>
        </View>
        
        {/* Investment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment Summary</Text>
          <View style={styles.investmentBox}>
            <Text style={styles.rangeText}>
              Estimated investment range: {formatCurrency(estimate.low_estimate_cp)} – {formatCurrency(estimate.high_estimate_cp)}
            </Text>
            <Text style={styles.recommendedText}>
              Recommended TKBSO proposal amount: {formatCurrency(estimate.final_cp_total)}
            </Text>
            <Text style={styles.noteText}>
              Final investment will depend on final material selections and any changes to scope.
            </Text>
          </View>
        </View>
        
        {/* Project Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Overview</Text>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              {estimate.has_bathrooms && estimate.num_bathrooms > 0 && `${estimate.num_bathrooms} bathroom${estimate.num_bathrooms > 1 ? 's' : ''}`}
              {estimate.has_kitchen && estimate.num_kitchens > 0 && `${estimate.has_bathrooms ? ' and ' : ''}${estimate.num_kitchens} kitchen`}
              {estimate.has_closets && estimate.num_closets > 0 && ` plus ${estimate.num_closets} closet${estimate.num_closets > 1 ? 's' : ''}`}
              {!estimate.has_bathrooms && !estimate.has_kitchen && !estimate.has_closets && 'Remodel project'}
            </Text>
          </View>
          {estimate.city && (
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>Located in {estimate.city}, {estimate.state}</Text>
            </View>
          )}
          {scopeParsed.intro && (
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{scopeParsed.intro}</Text>
            </View>
          )}
        </View>
        
        {/* Scope of Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope of Work</Text>
          {scopeParsed.bullets.length > 0 ? (
            scopeParsed.bullets.map((bullet, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.scopeText}>
              {estimate.client_estimate_text || 'Scope details to be finalized.'}
            </Text>
          )}
          {scopeParsed.closing && (
            <Text style={[styles.scopeText, { marginTop: 8 }]}>{scopeParsed.closing}</Text>
          )}
        </View>
        
        {/* Payment Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Schedule</Text>
          <View style={styles.paymentTable}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>1. Deposit (due at contract signing)</Text>
              <Text style={styles.paymentPercent}>{Math.round(depositSplit * 100)}%</Text>
              <Text style={styles.paymentAmount}>{formatCurrency(depositAmount)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>2. Progress payment (rough-in / tile completion)</Text>
              <Text style={styles.paymentPercent}>{Math.round(progressSplit * 100)}%</Text>
              <Text style={styles.paymentAmount}>{formatCurrency(progressAmount)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>3. Final payment (substantial completion)</Text>
              <Text style={styles.paymentPercent}>{Math.round(finalSplit * 100)}%</Text>
              <Text style={styles.paymentAmount}>{formatCurrency(finalAmount)}</Text>
            </View>
          </View>
        </View>
        
        {/* Notes & Assumptions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes & Assumptions</Text>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Pricing is based on TKBSO standard allowances for tile, quartz, plumbing fixtures, and glass unless otherwise noted.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Final investment may adjust if selections exceed allowances or if additional work is requested beyond this scope.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              {estimate.permit_required
                ? 'Permit fees are included as noted in the scope above.'
                : 'Permit fees, if required, will be quoted separately.'}
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Most projects of this scope run approximately 3-4 weeks once started, depending on inspections and material lead times.
            </Text>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {contractor.name}
            {contractor.service_area && ` • Serving ${contractor.service_area}`}
            {contractor.primary_contact_phone && ` • ${contractor.primary_contact_phone}`}
            {contractor.primary_contact_email && ` • ${contractor.primary_contact_email}`}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
