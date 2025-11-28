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
    paddingBottom: 70,
  },
  // Header - Centered
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 220,
    height: 'auto',
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 6,
  },
  addressLine: {
    fontSize: 10,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 3,
  },
  dateLine: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
    marginBottom: 16,
  },
  // Section headers
  sectionHeader: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 10,
    marginTop: 16,
  },
  // Project Summary
  summarySection: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  summaryLabel: {
    width: 85,
    fontSize: 10,
    fontWeight: 600,
    color: '#334155',
  },
  summaryValue: {
    flex: 1,
    fontSize: 10,
    color: '#475569',
  },
  // Investment Box
  investmentBox: {
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  investmentLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: '#bfdbfe',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  investmentRange: {
    fontSize: 11,
    color: '#93c5fd',
    marginBottom: 6,
  },
  investmentAmount: {
    fontSize: 28,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 8,
  },
  investmentNote: {
    fontSize: 8,
    color: '#93c5fd',
    textAlign: 'center',
    maxWidth: 350,
  },
  // Scope of Work
  tradeBlock: {
    marginBottom: 12,
  },
  tradeTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#1e3a8a',
    marginBottom: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 8,
  },
  bullet: {
    width: 12,
    fontSize: 9,
    color: '#64748b',
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: '#475569',
  },
  // Two column section
  twoColumn: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  columnHalf: {
    flex: 1,
    paddingRight: 10,
  },
  subSectionTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: '#334155',
    marginBottom: 6,
  },
  // Payment Section
  paymentSection: {
    marginBottom: 16,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  paymentBullet: {
    width: 12,
    fontSize: 9,
    color: '#1e3a8a',
  },
  paymentText: {
    flex: 1,
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.4,
  },
  // Timeline
  timelineText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
    marginBottom: 16,
  },
  // Notes
  notesSection: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.5,
  },
  // Next Steps
  nextStepsSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
  },
  nextStepsText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
    marginBottom: 16,
  },
  signatureLine: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  signatureLabel: {
    fontSize: 9,
    color: '#64748b',
    width: 140,
  },
  signatureBlank: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    height: 1,
    marginRight: 20,
  },
  signatureDate: {
    fontSize: 9,
    color: '#64748b',
    width: 50,
  },
  signatureDateBlank: {
    width: 100,
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

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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
    const sqft = estimate.total_bathroom_sqft ? ` (${estimate.total_bathroom_sqft} sq ft)` : '';
    parts.push(`Bathroom${estimate.num_bathrooms > 1 ? ` x${estimate.num_bathrooms}` : ''}${sqft}`);
  }
  if (estimate.has_kitchen && estimate.num_kitchens) {
    const sqft = estimate.total_kitchen_sqft ? ` (${estimate.total_kitchen_sqft} sq ft)` : '';
    parts.push(`Kitchen${sqft}`);
  }
  if (estimate.has_closets && estimate.num_closets) {
    const sqft = estimate.total_closet_sqft ? ` (${estimate.total_closet_sqft} sq ft)` : '';
    parts.push(`Closet${estimate.num_closets > 1 ? ` x${estimate.num_closets}` : ''}${sqft}`);
  }
  return parts.join(', ') || 'Remodel Project';
}

function getScopeSummary(estimate: Estimate): string {
  const scope = estimate.bath_scope_level || estimate.kitchen_scope_level || 'full_gut';
  if (scope === 'shower_only') return 'Shower conversion with mid-range finishes';
  if (scope === 'partial') return 'Partial remodel with targeted updates';
  if (scope === 'refresh') return 'Cosmetic refresh with updated surfaces and fixtures';
  return 'Full remodel with new fixtures, finishes, and layout';
}

function getPermitSummary(estimate: Estimate): string {
  if (estimate.permit_required && estimate.needs_gc_partner) {
    return "Permit required – handled by TKBSO's GC partner";
  }
  if (estimate.permit_required) {
    return 'Permit required – TKBSO to coordinate';
  }
  if (estimate.needs_gc_partner) {
    return 'GC partner involved – permits as needed';
  }
  return 'None required for this scope';
}

interface TradeSection {
  title: string;
  bullets: string[];
}

function getTradesForEstimate(estimate: Estimate): TradeSection[] {
  const trades: TradeSection[] = [];
  
  // Demo always first
  trades.push({
    title: 'Demolition & Site Prep',
    bullets: [
      'Protect adjacent areas and flooring before work begins',
      'Remove existing fixtures, tile, and finishes down to suitable substrate',
      'Disconnect plumbing and electrical as needed for new layout',
      'Daily debris removal and disposal throughout project',
      'Final cleanup upon completion',
    ],
  });
  
  // Plumbing
  if (estimate.has_bathrooms || estimate.has_kitchen) {
    const plumbingBullets = [
      'Rough-in water supply and drain lines for new fixture locations',
      'Relocate supply and return lines as needed for the new layout',
    ];
    if (estimate.has_bathrooms) {
      plumbingBullets.push('Install and connect shower valve, trim, and fixtures');
      plumbingBullets.push('Set and connect toilet, vanity, and faucet');
    }
    if (estimate.has_kitchen) {
      plumbingBullets.push('Install and connect kitchen sink and faucet');
      plumbingBullets.push('Connect dishwasher and disposal if included');
    }
    plumbingBullets.push('Final pressure testing, leak check, and fixture function verification');
    plumbingBullets.push('All plumbing to be code-compliant and inspected if required');
    
    trades.push({ title: 'Plumbing', bullets: plumbingBullets });
  }
  
  // Electrical
  trades.push({
    title: 'Electrical',
    bullets: [
      'Install GFCI-protected outlets in wet areas per code',
      estimate.num_recessed_cans && estimate.num_recessed_cans > 0 
        ? `Install ${estimate.num_recessed_cans} recessed can lights`
        : 'Lighting connections for new fixtures',
      'Exhaust fan installation and venting as required',
      'Final trim-out of switches, outlets, and fixtures',
      'All electrical work to be code-compliant and inspected if required',
    ].filter(Boolean),
  });
  
  // Tile & Flooring
  if (estimate.has_bathrooms) {
    const tileBullets = [
      'Install Schluter waterproofing system on shower walls and pan',
      'Level and prep substrate as needed prior to tile installation',
    ];
    if (estimate.bath_wall_tile_sqft) {
      tileBullets.push('Install full-height wall tile in shower wet areas');
    }
    if (estimate.bath_floor_tile_sqft) {
      tileBullets.push('Install floor tile throughout bathroom');
    }
    if (estimate.bath_shower_floor_tile_sqft) {
      tileBullets.push('Install shower floor tile with proper slope to drain');
    }
    tileBullets.push('Grout, clean, and seal all tile as appropriate');
    tileBullets.push('Tile material supplied by homeowner unless otherwise noted');
    
    trades.push({ title: 'Tile & Flooring', bullets: tileBullets });
  }
  
  // Cabinetry
  if ((estimate.has_bathrooms && estimate.bath_uses_tkbso_vanities) || 
      (estimate.has_kitchen && estimate.kitchen_uses_tkbso_cabinets)) {
    const cabinetBullets = [];
    if (estimate.has_kitchen && estimate.kitchen_uses_tkbso_cabinets) {
      cabinetBullets.push('TKBSO-supplied kitchen cabinetry');
      cabinetBullets.push('Professional cabinet installation and leveling');
    }
    if (estimate.has_bathrooms && estimate.bath_uses_tkbso_vanities) {
      cabinetBullets.push('TKBSO-supplied vanity installation');
    }
    cabinetBullets.push('Hardware installation per client selection');
    cabinetBullets.push('Final adjustments and alignment');
    
    trades.push({ title: 'Cabinetry', bullets: cabinetBullets });
  }
  
  // Countertops
  if ((estimate.bath_countertop_sqft && estimate.bath_countertop_sqft > 0) ||
      (estimate.kitchen_countertop_sqft && estimate.kitchen_countertop_sqft > 0)) {
    trades.push({
      title: 'Countertops',
      bullets: [
        'Template countertops after cabinet installation',
        'Fabricate quartz or selected material per client choice',
        'Professional installation with undermount sink cutout',
        'Edge profile per client selection',
        'Seam placement minimized and positioned per industry standards',
      ],
    });
  }
  
  // Glass
  if (estimate.bath_uses_frameless_glass) {
    trades.push({
      title: 'Glass Enclosure',
      bullets: [
        'Frameless glass shower enclosure',
        'Professional field measurement after tile completion',
        'Custom hardware and seals',
        'Installation with proper waterproofing at connections',
      ],
    });
  }
  
  // Paint
  trades.push({
    title: 'Paint & Finishes',
    bullets: [
      'Wall prep including patching and priming',
      'Two coats of finish paint on walls',
      'Ceiling touch-up or repaint as needed',
      'Door and trim painting if included',
      'Final touch-ups after all trades complete',
    ],
  });
  
  return trades;
}

function getInclusions(): string[] {
  return [
    'Floor and dust protection in work areas',
    'Daily debris removal and final jobsite cleanup',
    'Coordination of TKBSO subcontractors and schedule',
    'Use of licensed and insured trades as required',
    'One-year workmanship warranty',
  ];
}

function getExclusions(): string[] {
  return [
    'Repair of unforeseen structural damage (rotted framing, termite damage)',
    'Mold or asbestos testing and remediation',
    'Electrical panel upgrades beyond scope',
    'HVAC duct relocations unless specifically listed',
    'Work outside the rooms described in this proposal',
    'Appliances unless specifically listed',
  ];
}

function getClientSuppliedItems(estimate: Estimate): string[] {
  const items: string[] = [];
  
  // Standard homeowner items
  items.push('Plumbing fixtures (faucets, showerhead, toilet)');
  items.push('Tile and grout selections');
  items.push('Bath accessories (towel bars, toilet paper holder, robe hooks)');
  
  if (estimate.has_bathrooms && !estimate.bath_uses_tkbso_vanities) {
    items.push('Vanity cabinet');
  }
  if (estimate.has_kitchen && !estimate.kitchen_uses_tkbso_cabinets) {
    items.push('Kitchen cabinets');
  }
  if (estimate.has_bathrooms && !estimate.bath_uses_frameless_glass) {
    items.push('Shower glass or enclosure');
  }
  
  items.push('Mirror(s)');
  items.push('Paint color selection');
  
  return items;
}

function getTkbsoSuppliedItems(estimate: Estimate): string[] {
  const items: string[] = [];
  
  items.push('All labor for trades listed above');
  items.push('Rough plumbing materials (pipes, fittings, valves)');
  items.push('Electrical materials (wire, boxes, devices)');
  items.push('Waterproofing system (Schluter or equivalent)');
  items.push('Tile setting materials (thinset, grout, sealers)');
  
  if (estimate.bath_uses_tkbso_vanities) {
    items.push('Vanity cabinet per selection');
  }
  if (estimate.kitchen_uses_tkbso_cabinets) {
    items.push('Kitchen cabinetry per selection');
  }
  if (estimate.bath_uses_frameless_glass) {
    items.push('Frameless glass shower enclosure');
  }
  
  items.push('Drywall, tape, and finishing materials');
  items.push('Paint and primer');
  
  return items;
}

export function ProposalPdf({ contractor, estimate, pricingConfig }: ProposalPdfProps) {
  const depositSplit = pricingConfig?.payment_split_deposit ?? 0.50;
  const progressSplit = pricingConfig?.payment_split_progress ?? 0.40;
  const finalSplit = pricingConfig?.payment_split_final ?? 0.10;
  
  const depositAmount = Math.round((estimate.final_cp_total || 0) * depositSplit);
  const progressAmount = Math.round((estimate.final_cp_total || 0) * progressSplit);
  const finalAmount = Math.round((estimate.final_cp_total || 0) * finalSplit);
  
  // Build address, filtering empty values
  const addressParts = [
    estimate.property_address,
    estimate.city,
    estimate.state,
    estimate.zip,
  ].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(', ').replace(/,\s*,/g, ',') : '';
  
  const projectType = getProjectType(estimate);
  const clientName = estimate.client_name || 'Valued Client';
  const title = `Proposal for ${projectType} for ${clientName}`;
  
  const trades = getTradesForEstimate(estimate);
  const inclusions = getInclusions();
  const exclusions = getExclusions();
  const clientItems = getClientSuppliedItems(estimate);
  const tkbsoItems = getTkbsoSuppliedItems(estimate);
  
  const proposalDate = formatDate(new Date());

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image src={tkbsoLogo} style={styles.logo} />
          <Text style={styles.mainTitle}>{title}</Text>
          {fullAddress && <Text style={styles.addressLine}>{fullAddress}</Text>}
          <Text style={styles.dateLine}>{proposalDate}</Text>
        </View>
        <View style={styles.divider} />
        
        {/* Project Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionHeader}>Project Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rooms:</Text>
            <Text style={styles.summaryValue}>{getRoomsSummary(estimate)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Scope:</Text>
            <Text style={styles.summaryValue}>{getScopeSummary(estimate)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Permit / GC:</Text>
            <Text style={styles.summaryValue}>{getPermitSummary(estimate)}</Text>
          </View>
        </View>
        
        {/* Investment Summary Box */}
        <View style={styles.investmentBox}>
          <Text style={styles.investmentLabel}>Investment Summary</Text>
          {estimate.low_estimate_cp && estimate.high_estimate_cp && (
            <Text style={styles.investmentRange}>
              Estimated Investment Range: {formatCurrency(estimate.low_estimate_cp)} – {formatCurrency(estimate.high_estimate_cp)}
            </Text>
          )}
          <Text style={styles.investmentAmount}>
            {formatCurrency(estimate.final_cp_total || 0)}
          </Text>
          <Text style={styles.investmentNote}>
            Pricing includes labor, standard materials, site protection, and cleanup as outlined below.
          </Text>
        </View>
        
        {/* Scope of Work */}
        <Text style={styles.sectionHeader}>Scope of Work</Text>
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
        
        {/* Inclusions & Exclusions */}
        <View style={styles.twoColumn}>
          <View style={styles.columnHalf}>
            <Text style={styles.subSectionTitle}>Inclusions</Text>
            {inclusions.map((item, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={styles.columnHalf}>
            <Text style={styles.subSectionTitle}>Exclusions</Text>
            {exclusions.map((item, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Client Selections & Responsibilities */}
        <Text style={styles.sectionHeader}>Client Selections &amp; Responsibilities</Text>
        <View style={styles.twoColumn}>
          <View style={styles.columnHalf}>
            <Text style={styles.subSectionTitle}>Homeowner to Provide</Text>
            {clientItems.map((item, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={styles.columnHalf}>
            <Text style={styles.subSectionTitle}>TKBSO to Provide</Text>
            {tkbsoItems.map((item, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Payment Terms */}
        <Text style={styles.sectionHeader}>Payment Terms</Text>
        <View style={styles.paymentSection}>
          <View style={styles.paymentItem}>
            <Text style={styles.paymentBullet}>•</Text>
            <Text style={styles.paymentText}>
              Deposit of {Math.round(depositSplit * 100)}% ({formatCurrency(depositAmount)}) due upon acceptance to schedule your project
            </Text>
          </View>
          <View style={styles.paymentItem}>
            <Text style={styles.paymentBullet}>•</Text>
            <Text style={styles.paymentText}>
              Progress payment of {Math.round(progressSplit * 100)}% ({formatCurrency(progressAmount)}) due at completion of rough-in and tile installation
            </Text>
          </View>
          <View style={styles.paymentItem}>
            <Text style={styles.paymentBullet}>•</Text>
            <Text style={styles.paymentText}>
              Final {Math.round(finalSplit * 100)}% ({formatCurrency(finalAmount)}) due at substantial completion and final walkthrough
            </Text>
          </View>
        </View>
        
        {/* Project Timeline */}
        <Text style={styles.sectionHeader}>Estimated Timeline</Text>
        <Text style={styles.timelineText}>
          Estimated project duration: 10–14 working days once work begins, assuming all materials are on site and no unforeseen issues are discovered. Actual timeline will be confirmed once selections are finalized and permits (if required) are approved.
        </Text>
        
        {/* Notes */}
        {estimate.job_notes && (
          <>
            <Text style={styles.sectionHeader}>Notes &amp; Clarifications</Text>
            <View style={styles.notesSection}>
              <Text style={styles.notesText}>{estimate.job_notes}</Text>
            </View>
          </>
        )}
        
        {/* Next Steps / Acceptance */}
        <View style={styles.nextStepsSection}>
          <Text style={styles.sectionHeader}>Next Steps</Text>
          <Text style={styles.nextStepsText}>
            To move forward, please reply to this proposal or sign below. We will finalize your selections and add your project to the schedule.
          </Text>
          
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>Client Signature:</Text>
            <View style={styles.signatureBlank} />
            <Text style={styles.signatureDate}>Date:</Text>
            <View style={styles.signatureDateBlank} />
          </View>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>TKBSO Representative:</Text>
            <View style={styles.signatureBlank} />
            <Text style={styles.signatureDate}>Date:</Text>
            <View style={styles.signatureDateBlank} />
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {contractor.name || 'The Kitchen and Bath Store of Orlando'}
            {contractor.primary_contact_phone && ` • ${contractor.primary_contact_phone}`}
            {contractor.primary_contact_email && ` • ${contractor.primary_contact_email}`}
            {contractor.service_area && ` • Serving ${contractor.service_area}`}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
