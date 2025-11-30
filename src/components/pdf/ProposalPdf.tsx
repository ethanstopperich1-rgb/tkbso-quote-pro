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
    fontSize: 11,
    padding: 50,
    backgroundColor: '#ffffff',
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 'auto',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Title Section
  titleSection: {
    marginBottom: 20,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 4,
  },
  // Description Header
  descriptionHeader: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 6,
  },
  // Trade Sections
  tradeSection: {
    marginBottom: 16,
  },
  tradeTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1e3a8a',
    marginBottom: 6,
  },
  tradeSubtitle: {
    fontSize: 10,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 4,
  },
  workDescription: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.5,
    marginBottom: 4,
    paddingLeft: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 8,
  },
  bullet: {
    width: 10,
    fontSize: 10,
    color: '#64748b',
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
    color: '#475569',
  },
  // Cost Section
  costSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#1e3a8a',
  },
  costLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 4,
  },
  costAmount: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1e3a8a',
    marginBottom: 16,
  },
  // Payment Milestones
  milestonesLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 8,
  },
  // Page 2 styles
  paymentScheduleTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  paymentTable: {
    marginBottom: 24,
  },
  paymentRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 10,
  },
  paymentPercent: {
    width: 60,
    fontSize: 14,
    fontWeight: 700,
    color: '#1e3a8a',
  },
  paymentDescription: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
  },
  paymentAmount: {
    width: 100,
    fontSize: 11,
    fontWeight: 600,
    color: '#1e293b',
    textAlign: 'right',
  },
  // Signature Section
  signatureSection: {
    marginTop: 32,
    marginBottom: 32,
  },
  signatureLine: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  signatureLabel: {
    fontSize: 10,
    color: '#475569',
    width: 180,
  },
  signatureBlank: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    height: 1,
    marginRight: 20,
  },
  dateLabel: {
    fontSize: 10,
    color: '#475569',
    width: 40,
  },
  dateBlank: {
    width: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    height: 1,
  },
  // Project Notes
  notesSection: {
    marginTop: 24,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 12,
  },
  noteItem: {
    marginBottom: 10,
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: '#334155',
    marginBottom: 2,
  },
  noteText: {
    fontSize: 10,
    color: '#64748b',
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

function getProjectTypeLabel(estimate: Estimate): string {
  if (estimate.bath_scope_level === 'shower_only') return 'Shower';
  if (estimate.has_bathrooms) return 'Bathroom';
  if (estimate.has_kitchen) return 'Kitchen';
  return 'Remodel';
}

function getDemoScope(estimate: Estimate): string[] {
  const items: string[] = [];
  
  if (estimate.bath_scope_level === 'shower_only') {
    items.push('Remove existing shower fixtures, tile, and substrate');
    items.push('Protect adjacent areas and flooring');
    items.push('Debris removal and disposal');
  } else if (estimate.has_bathrooms) {
    items.push('Remove existing fixtures, tile, vanity, and toilet');
    items.push('Protect adjacent areas and flooring');
    items.push('Debris removal and disposal');
  } else if (estimate.has_kitchen) {
    items.push('Remove existing cabinets, countertops, and appliances as needed');
    items.push('Protect adjacent areas and flooring');
    items.push('Debris removal and disposal');
  }
  
  return items;
}

function getPlumbingScope(estimate: Estimate): string[] {
  const items: string[] = [];
  
  if (estimate.bath_scope_level === 'shower_only') {
    items.push('Rough-in water supply and drain lines for new shower');
    items.push('Install shower valve, trim, and showerhead');
    items.push('Pressure test and leak verification');
  } else if (estimate.has_bathrooms) {
    items.push('Rough-in water supply and drain lines');
    items.push('Install shower valve, trim, and fixtures');
    items.push('Set and connect toilet');
    items.push('Install vanity plumbing and faucet');
    items.push('Final pressure testing and leak check');
  } else if (estimate.has_kitchen) {
    items.push('Install and connect kitchen sink and faucet');
    items.push('Connect dishwasher and disposal if included');
    items.push('Final pressure testing');
  }
  
  return items;
}

function getTileScope(estimate: Estimate): string[] {
  const items: string[] = [];
  
  items.push('Install waterproofing system (Schluter or equivalent)');
  items.push('Level and prep substrate as needed');
  
  if (estimate.bath_wall_tile_sqft && estimate.bath_wall_tile_sqft > 0) {
    items.push(`Install wall tile in shower area (~${Math.round(estimate.bath_wall_tile_sqft)} sq ft)`);
  } else {
    items.push('Install wall tile in shower/wet areas');
  }
  
  if (estimate.bath_shower_floor_tile_sqft && estimate.bath_shower_floor_tile_sqft > 0) {
    items.push(`Install shower floor tile with slope to drain (~${Math.round(estimate.bath_shower_floor_tile_sqft)} sq ft)`);
  } else {
    items.push('Install shower floor tile with proper slope to drain');
  }
  
  if (estimate.bath_floor_tile_sqft && estimate.bath_floor_tile_sqft > 0) {
    items.push(`Install bathroom floor tile (~${Math.round(estimate.bath_floor_tile_sqft)} sq ft)`);
  }
  
  items.push('Grout, clean, and seal all tile');
  items.push('Tile material to be supplied by homeowner');
  
  return items;
}

function getGlassScope(estimate: Estimate): string[] {
  const items: string[] = [];
  
  if (estimate.glass_type === 'standard' || estimate.bath_uses_frameless_glass) {
    items.push('Frameless glass shower enclosure');
    items.push('Field measurement after tile completion');
    items.push('Custom hardware and seals');
    items.push('Professional installation');
  } else if (estimate.glass_type === 'panel_only') {
    items.push('Glass panel installation');
    items.push('Field measurement after tile completion');
  } else if (estimate.glass_type === '90_return') {
    items.push('90-degree return glass enclosure');
    items.push('Field measurement after tile completion');
    items.push('Custom hardware and seals');
  }
  
  return items;
}

export function ProposalPdf({ contractor, estimate, pricingConfig }: ProposalPdfProps) {
  const depositSplit = pricingConfig?.payment_split_deposit ?? 0.65;
  const progressSplit = pricingConfig?.payment_split_progress ?? 0.25;
  const finalSplit = pricingConfig?.payment_split_final ?? 0.10;
  
  const totalCost = estimate.final_cp_total || 0;
  const depositAmount = Math.round(totalCost * depositSplit);
  const progressAmount = Math.round(totalCost * progressSplit);
  const finalAmount = Math.round(totalCost * finalSplit);
  
  // Build address
  const addressParts = [
    estimate.property_address,
    estimate.city,
    estimate.state,
    estimate.zip,
  ].filter(Boolean);
  const fullAddress = addressParts.join(', ').replace(/,\s*,/g, ',');
  
  const clientName = estimate.client_name || 'Customer Name';
  const projectType = getProjectTypeLabel(estimate);
  
  const demoItems = getDemoScope(estimate);
  const plumbingItems = getPlumbingScope(estimate);
  const tileItems = getTileScope(estimate);
  const glassItems = getGlassScope(estimate);
  
  const hasGlass = estimate.include_glass || estimate.bath_uses_frameless_glass || 
                   (estimate.glass_type && estimate.glass_type !== 'none');

  return (
    <Document>
      {/* Page 1 - Quote Details */}
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={tkbsoLogo} style={styles.logo} />
          <Text style={styles.companyName}>THE KITCHEN AND BATH STORE OF ORLANDO</Text>
        </View>
        
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.projectTitle}>Remodel Project For {clientName}</Text>
          {fullAddress && <Text style={styles.addressText}>{fullAddress}</Text>}
        </View>
        
        {/* Description Header */}
        <Text style={styles.descriptionHeader}>Description of work to be completed</Text>
        
        {/* DEMO Section */}
        {estimate.include_demo !== false && (
          <View style={styles.tradeSection}>
            <Text style={styles.tradeTitle}>DEMO:</Text>
            <Text style={styles.tradeSubtitle}>Remodel work to be done:</Text>
            {demoItems.map((item, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* PLUMBING Section */}
        {estimate.include_plumbing !== false && (
          <View style={styles.tradeSection}>
            <Text style={styles.tradeTitle}>PLUMBING:</Text>
            {plumbingItems.map((item, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* TILE WORK Section */}
        <View style={styles.tradeSection}>
          <Text style={styles.tradeTitle}>TILE WORK:</Text>
          {tileItems.map((item, idx) => (
            <View key={idx} style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
        
        {/* SHOWER GLASS Section */}
        {hasGlass && glassItems.length > 0 && (
          <View style={styles.tradeSection}>
            <Text style={styles.tradeTitle}>SHOWER GLASS:</Text>
            {glassItems.map((item, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Final Cost */}
        <View style={styles.costSection}>
          <Text style={styles.costLabel}>{projectType} Final Cost:</Text>
          <Text style={styles.costAmount}>{formatCurrency(totalCost)}</Text>
          
          <Text style={styles.milestonesLabel}>Payment Milestones:</Text>
        </View>
      </Page>
      
      {/* Page 2 - Payment Schedule & Signatures */}
      <Page size="LETTER" style={styles.page}>
        {/* Payment Schedule Title */}
        <Text style={styles.paymentScheduleTitle}>Payment Schedule</Text>
        
        {/* Payment Table */}
        <View style={styles.paymentTable}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(depositSplit * 100)}%</Text>
            <Text style={styles.paymentDescription}>Upon Homeowner Approval of Project</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(depositAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(progressSplit * 100)}%</Text>
            <Text style={styles.paymentDescription}>Upon Completion of tile, rough plumbing & electrical</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(progressAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(finalSplit * 100)}%</Text>
            <Text style={styles.paymentDescription}>Upon Overall Completion of Project</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(finalAmount)}</Text>
          </View>
        </View>
        
        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>Approval (Homeowner):</Text>
            <View style={styles.signatureBlank} />
            <Text style={styles.dateLabel}>Date:</Text>
            <View style={styles.dateBlank} />
          </View>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>Accepted (TKBSO):</Text>
            <View style={styles.signatureBlank} />
            <Text style={styles.dateLabel}>Date:</Text>
            <View style={styles.dateBlank} />
          </View>
        </View>
        
        {/* Project Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Project Notes</Text>
          
          <View style={styles.noteItem}>
            <Text style={styles.noteLabel}>Note I:</Text>
            <Text style={styles.noteText}>
              TKBSO will take reasonable precautions to minimize dust and disruption, including installing floor protection, sealing vents, and maintaining a clean workspace.
            </Text>
          </View>
          
          <View style={styles.noteItem}>
            <Text style={styles.noteLabel}>Note II:</Text>
            <Text style={styles.noteText}>
              All fixtures to be supplied by TKBSO under standard allowance unless specific models are chosen by the homeowner prior to ordering.
            </Text>
          </View>
          
          <View style={styles.noteItem}>
            <Text style={styles.noteLabel}>Note III:</Text>
            <Text style={styles.noteText}>
              Estimated timeline for completion is approximately 10-14 days from project start, pending material lead times.
            </Text>
          </View>
          
          {estimate.job_notes && (
            <View style={styles.noteItem}>
              <Text style={styles.noteLabel}>Additional Notes:</Text>
              <Text style={styles.noteText}>{estimate.job_notes}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
