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
    marginBottom: 12,
  },
  logo: {
    width: 300,
    height: 'auto',
    marginBottom: 8,
  },
  titleSection: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 4,
  },
  address: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 2,
  },
  contactInfo: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1e3a8a',
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    textTransform: 'uppercase',
  },
  descriptionBox: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 3,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.5,
  },
  tradeRow: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  tradeTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1f2937',
    textTransform: 'uppercase',
  },
  tradePrice: {
    fontSize: 10,
    fontWeight: 600,
    color: '#1e3a8a',
  },
  tradeDescription: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.5,
    marginBottom: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 8,
  },
  bullet: {
    width: 10,
    fontSize: 9,
    color: '#6b7280',
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: '#374151',
  },
  totalBox: {
    backgroundColor: '#1e3a8a',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#ffffff',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 700,
    color: '#ffffff',
  },
  paymentSection: {
    marginTop: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  paymentPercent: {
    width: 35,
    fontSize: 10,
    fontWeight: 600,
    color: '#1e3a8a',
  },
  paymentDescription: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
  },
  paymentAmount: {
    width: 65,
    fontSize: 10,
    fontWeight: 600,
    textAlign: 'right',
    color: '#1f2937',
  },
  notesSection: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 3,
  },
  noteText: {
    fontSize: 8,
    color: '#6b7280',
    lineHeight: 1.4,
    marginBottom: 2,
  },
  approvalSection: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  approvalTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 12,
  },
  signatureLine: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  signatureLabel: {
    fontSize: 9,
    color: '#6b7280',
    width: 140,
  },
  signatureBlank: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#9ca3af',
    height: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
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

function getProjectType(estimate: Estimate): string {
  const types: string[] = [];
  if (estimate.has_kitchen) types.push('Kitchen');
  if (estimate.has_bathrooms) {
    const bathCount = estimate.num_bathrooms || 1;
    if (estimate.bath_scope_level === 'shower_only') {
      types.push(bathCount > 1 ? `${bathCount} Shower` : 'Shower');
    } else {
      types.push(bathCount > 1 ? `${bathCount} Bathroom` : 'Bathroom');
    }
  }
  if (estimate.has_closets) {
    const closetCount = estimate.num_closets || 1;
    types.push(closetCount > 1 ? `${closetCount} Closet` : 'Closet');
  }
  
  if (types.length === 0) return 'Remodel';
  if (types.length === 1) return `${types[0]} Remodel`;
  return types.join(' & ') + ' Remodel';
}

interface TradeSection {
  title: string;
  description: string;
  bullets: string[];
}

function parseScopeToTrades(text: string): TradeSection[] {
  if (!text) return [];
  
  const lines = text.split('\n').filter(line => line.trim());
  const trades: TradeSection[] = [];
  let currentTrade: TradeSection | null = null;
  
  const tradeKeywords = [
    'demo', 'demolition', 'framing', 'carpentry', 'plumbing', 'electrical', 
    'lighting', 'tile', 'drywall', 'paint', 'cabinet', 'countertop', 'quartz',
    'glass', 'shower', 'vanit', 'closet', 'flooring', 'trim', 'final', 'rough-in',
    'backsplash', 'soffit', 'appliance'
  ];
  
  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();
    
    // Check if this line is a trade header (contains keyword, short, and not a bullet)
    const containsKeyword = tradeKeywords.some(kw => lower.includes(kw));
    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed);
    const isShort = trimmed.length < 80;
    const looksLikeHeader = trimmed.endsWith(':') || /^[A-Z][A-Z\s&/]+:?$/.test(trimmed);
    
    const isTradeHeader = containsKeyword && !isBullet && isShort && (looksLikeHeader || lower.includes(':'));
    
    if (isTradeHeader) {
      if (currentTrade && (currentTrade.description || currentTrade.bullets.length > 0)) {
        trades.push(currentTrade);
      }
      currentTrade = {
        title: trimmed.replace(/:$/, '').toUpperCase(),
        description: '',
        bullets: []
      };
    } else if (currentTrade) {
      if (isBullet) {
        const bulletText = trimmed.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '');
        currentTrade.bullets.push(bulletText);
      } else if (currentTrade.bullets.length === 0) {
        currentTrade.description += (currentTrade.description ? ' ' : '') + trimmed;
      } else {
        // Continuation of last bullet or general text
        if (currentTrade.bullets.length > 0) {
          currentTrade.bullets[currentTrade.bullets.length - 1] += ' ' + trimmed;
        } else {
          currentTrade.description += ' ' + trimmed;
        }
      }
    } else {
      // No current trade yet - create intro section
      if (!currentTrade) {
        currentTrade = {
          title: 'DESCRIPTION OF WORK',
          description: '',
          bullets: []
        };
      }
      if (isBullet) {
        currentTrade.bullets.push(trimmed.replace(/^[•\-*]\s*/, ''));
      } else {
        currentTrade.description += (currentTrade.description ? ' ' : '') + trimmed;
      }
    }
  }
  
  if (currentTrade && (currentTrade.description || currentTrade.bullets.length > 0)) {
    trades.push(currentTrade);
  }
  
  // If no trades were parsed, create a single scope section
  if (trades.length === 0 && text.trim()) {
    return [{
      title: 'SCOPE OF WORK',
      description: text.trim(),
      bullets: []
    }];
  }
  
  return trades;
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
  
  const projectType = getProjectType(estimate);
  const clientName = estimate.client_name || 'Valued Client';
  const title = `${projectType} Quote for ${clientName}`;
  
  const trades = parseScopeToTrades(estimate.client_estimate_text || '');

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image src={tkbsoLogo} style={styles.logo} />
        </View>
        
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>{title}</Text>
          {fullAddress && <Text style={styles.address}>{fullAddress}</Text>}
          {estimate.client_phone && (
            <Text style={styles.contactInfo}>{estimate.client_phone}</Text>
          )}
        </View>
        
        {/* Description of Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description of Work to be Completed</Text>
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              {estimate.job_label || projectType} – Complete remodel including all labor, materials, and installation as detailed below.
              {estimate.permit_required && ' Permit fees included as noted.'}
            </Text>
          </View>
        </View>
        
        {/* Remodel Work / Scope by Trade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Remodel Work to be Done</Text>
          
          {trades.map((trade, idx) => (
            <View key={idx} style={styles.tradeRow}>
              <View style={styles.tradeHeader}>
                <Text style={styles.tradeTitle}>{trade.title}:</Text>
              </View>
              {trade.description && (
                <Text style={styles.tradeDescription}>{trade.description}</Text>
              )}
              {trade.bullets.map((bullet, bIdx) => (
                <View key={bIdx} style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        
        {/* Total Cost Box */}
        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{projectType} Total:</Text>
            <Text style={styles.totalAmount}>{formatCurrency(estimate.final_cp_total)}</Text>
          </View>
        </View>
        
        {/* Payment Milestones */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Milestones</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(depositSplit * 100)}%</Text>
            <Text style={styles.paymentDescription}>Upon Contract Signing</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(depositAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(progressSplit * 100)}%</Text>
            <Text style={styles.paymentDescription}>Upon Completion of Rough-In / Tile Installation</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(progressAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(finalSplit * 100)}%</Text>
            <Text style={styles.paymentDescription}>Upon Overall Completion of Project</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(finalAmount)}</Text>
          </View>
        </View>
        
        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.noteText}>
            • Pricing is based on TKBSO standard allowances for tile, quartz, plumbing fixtures, and glass unless otherwise noted.
          </Text>
          <Text style={styles.noteText}>
            • Final investment may adjust if selections exceed allowances or if additional work is requested beyond this scope.
          </Text>
          <Text style={styles.noteText}>
            • {estimate.permit_required
              ? 'Permit fees are included as noted in the scope above.'
              : 'Permit fees, if required, will be quoted separately.'}
          </Text>
          <Text style={styles.noteText}>
            • Most projects of this scope run approximately 3-4 weeks once started, depending on inspections and material lead times.
          </Text>
        </View>
        
        {/* Approval Section */}
        <View style={styles.approvalSection}>
          <Text style={styles.approvalTitle}>Approval</Text>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>Homeowner Signature:</Text>
            <View style={styles.signatureBlank} />
          </View>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>Date:</Text>
            <View style={styles.signatureBlank} />
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
