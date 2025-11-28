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
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 280,
    height: 'auto',
    marginBottom: 15,
  },
  // Title Section
  titleSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 4,
  },
  // Project Snapshot
  snapshotSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  snapshotTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1e3a8a',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  snapshotRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  snapshotLabel: {
    width: 80,
    fontSize: 9,
    fontWeight: 600,
    color: '#64748b',
  },
  snapshotValue: {
    flex: 1,
    fontSize: 9,
    color: '#1e293b',
  },
  // Investment Summary - THE HERO
  investmentSection: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#1e3a8a',
    borderRadius: 6,
    alignItems: 'center',
  },
  investmentTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: '#bfdbfe',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  investmentAmount: {
    fontSize: 28,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 8,
  },
  investmentRange: {
    fontSize: 9,
    color: '#93c5fd',
  },
  // Scope Section
  scopeSection: {
    marginBottom: 20,
  },
  scopeTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1e3a8a',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    textTransform: 'uppercase',
  },
  tradeBlock: {
    marginBottom: 12,
  },
  tradeTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: '#334155',
    marginBottom: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 10,
  },
  bullet: {
    width: 10,
    fontSize: 9,
    color: '#64748b',
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: '#475569',
  },
  // Payment Section
  paymentSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  paymentTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1e3a8a',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  paymentNumber: {
    width: 20,
    fontSize: 10,
    fontWeight: 700,
    color: '#1e3a8a',
  },
  paymentPercent: {
    width: 40,
    fontSize: 10,
    fontWeight: 600,
    color: '#334155',
  },
  paymentDescription: {
    flex: 1,
    fontSize: 9,
    color: '#475569',
  },
  paymentAmount: {
    width: 70,
    fontSize: 10,
    fontWeight: 600,
    color: '#1e3a8a',
    textAlign: 'right',
  },
  // Signature Section
  signatureSection: {
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
  },
  signatureTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: '#1e3a8a',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  signatureLine: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  signatureLabel: {
    fontSize: 9,
    color: '#64748b',
    width: 150,
  },
  signatureBlank: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    height: 1,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#64748b',
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

function getRoomsSummary(estimate: Estimate): string {
  const parts: string[] = [];
  if (estimate.has_bathrooms && estimate.num_bathrooms) {
    parts.push(`${estimate.num_bathrooms} Bathroom${estimate.num_bathrooms > 1 ? 's' : ''}`);
  }
  if (estimate.has_kitchen && estimate.num_kitchens) {
    parts.push(`${estimate.num_kitchens} Kitchen`);
  }
  if (estimate.has_closets && estimate.num_closets) {
    parts.push(`${estimate.num_closets} Closet${estimate.num_closets > 1 ? 's' : ''}`);
  }
  return parts.join(' + ') || 'Remodel Project';
}

function getScopeSummary(estimate: Estimate): string {
  const scope = estimate.bath_scope_level || estimate.kitchen_scope_level || 'full_gut';
  if (scope === 'shower_only') return 'Shower rebuild with full tile and glass';
  if (scope === 'partial') return 'Partial remodel – targeted updates';
  if (scope === 'refresh') return 'Cosmetic refresh – surfaces and fixtures';
  return 'Full remodel with new fixtures, finishes, and layout';
}

interface TradeSection {
  title: string;
  bullets: string[];
}

function parseScopeToTrades(text: string): TradeSection[] {
  if (!text) return getDefaultTrades();
  
  const lines = text.split('\n').filter(line => line.trim());
  const trades: TradeSection[] = [];
  let currentTrade: TradeSection | null = null;
  
  const tradeKeywords = [
    'demo', 'plumbing', 'electrical', 'tile', 'drywall', 'paint', 
    'cabinet', 'countertop', 'glass', 'shower', 'flooring', 'trim', 'final'
  ];
  
  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();
    
    const containsKeyword = tradeKeywords.some(kw => lower.includes(kw));
    const isBullet = /^[•\-*]/.test(trimmed) || /^\d+\./.test(trimmed);
    const isShort = trimmed.length < 60;
    
    if (containsKeyword && !isBullet && isShort) {
      if (currentTrade && currentTrade.bullets.length > 0) {
        trades.push(currentTrade);
      }
      currentTrade = {
        title: trimmed.replace(/:$/, ''),
        bullets: []
      };
    } else if (currentTrade && isBullet) {
      const bulletText = trimmed.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '');
      currentTrade.bullets.push(bulletText);
    } else if (currentTrade && trimmed && !isBullet) {
      currentTrade.bullets.push(trimmed);
    }
  }
  
  if (currentTrade && currentTrade.bullets.length > 0) {
    trades.push(currentTrade);
  }
  
  return trades.length > 0 ? trades : getDefaultTrades();
}

function getDefaultTrades(): TradeSection[] {
  return [
    { title: 'Demolition & Prep', bullets: ['Remove existing fixtures and finishes', 'Protect work areas', 'Haul away debris'] },
    { title: 'Plumbing', bullets: ['Install new fixtures and valves', 'Rough-in as needed', 'Final connections'] },
    { title: 'Electrical', bullets: ['Lighting installation', 'GFCI outlets per code', 'Exhaust ventilation'] },
    { title: 'Tile & Surfaces', bullets: ['Waterproofing and backer', 'Wall and floor tile installation', 'Grouting and sealing'] },
    { title: 'Cabinetry & Tops', bullets: ['Vanity/cabinet installation', 'Countertop fabrication and install', 'Hardware'] },
    { title: 'Glass & Finishes', bullets: ['Frameless shower glass', 'Mirrors and accessories', 'Final paint and touch-ups'] },
  ];
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
        </View>
        
        {/* Project Snapshot - Clean, human language */}
        <View style={styles.snapshotSection}>
          <Text style={styles.snapshotTitle}>Project Snapshot</Text>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Client:</Text>
            <Text style={styles.snapshotValue}>{clientName}</Text>
          </View>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Location:</Text>
            <Text style={styles.snapshotValue}>{fullAddress || 'To be confirmed'}</Text>
          </View>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Rooms:</Text>
            <Text style={styles.snapshotValue}>{getRoomsSummary(estimate)}</Text>
          </View>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Scope:</Text>
            <Text style={styles.snapshotValue}>{getScopeSummary(estimate)}</Text>
          </View>
          <View style={styles.snapshotRow}>
            <Text style={styles.snapshotLabel}>Permit:</Text>
            <Text style={styles.snapshotValue}>
              {estimate.permit_required 
                ? 'Required – TKBSO to coordinate' 
                : estimate.needs_gc_partner 
                  ? 'GC partner handling permits'
                  : 'Standard scope – no permit expected'}
            </Text>
          </View>
        </View>
        
        {/* Investment Summary - THE HERO - One clean number */}
        <View style={styles.investmentSection}>
          <Text style={styles.investmentTitle}>Recommended TKBSO Quote</Text>
          <Text style={styles.investmentAmount}>{formatCurrency(estimate.final_cp_total)}</Text>
          {estimate.low_estimate_cp && estimate.high_estimate_cp && (
            <Text style={styles.investmentRange}>
              Based on similar projects: {formatCurrency(estimate.low_estimate_cp)} – {formatCurrency(estimate.high_estimate_cp)}
            </Text>
          )}
        </View>
        
        {/* Scope of Work - NO PRICES, just scope */}
        <View style={styles.scopeSection}>
          <Text style={styles.scopeTitle}>Scope of Work</Text>
          {trades.map((trade, idx) => (
            <View key={idx} style={styles.tradeBlock}>
              <Text style={styles.tradeTitle}>{trade.title}</Text>
              {trade.bullets.map((bullet, bIdx) => (
                <View key={bIdx} style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        
        {/* Payment Milestones - Closes deals */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Payment Milestones</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentNumber}>1.</Text>
            <Text style={styles.paymentPercent}>{Math.round(depositSplit * 100)}%</Text>
            <Text style={styles.paymentDescription}>Deposit – lock materials, schedule trades</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(depositAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentNumber}>2.</Text>
            <Text style={styles.paymentPercent}>{Math.round(progressSplit * 100)}%</Text>
            <Text style={styles.paymentDescription}>Progress – rough-in complete, tile installed</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(progressAmount)}</Text>
          </View>
          <View style={[styles.paymentRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.paymentNumber}>3.</Text>
            <Text style={styles.paymentPercent}>{Math.round(finalSplit * 100)}%</Text>
            <Text style={styles.paymentDescription}>Final – completion + punch list</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(finalAmount)}</Text>
          </View>
        </View>
        
        {/* Signature / Acceptance */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>Acceptance</Text>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>Client Signature:</Text>
            <View style={styles.signatureBlank} />
          </View>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>Date:</Text>
            <View style={styles.signatureBlank} />
          </View>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>TKBSO Representative:</Text>
            <View style={styles.signatureBlank} />
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {contractor.name}
            {contractor.service_area && ` • Serving ${contractor.service_area}`}
            {contractor.primary_contact_phone && ` • ${contractor.primary_contact_phone}`}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
