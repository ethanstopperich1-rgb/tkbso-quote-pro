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
    padding: 50,
    backgroundColor: '#ffffff',
  },
  // Cover Page
  coverPage: {
    fontFamily: 'Helvetica',
    padding: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    height: '100%',
  },
  coverHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 220,
    height: 'auto',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 8,
  },
  companyContact: {
    fontSize: 10,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 3,
  },
  coverDivider: {
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a8a',
    marginVertical: 20,
  },
  coverProjectTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  coverProjectSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  coverClientSection: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 4,
    marginVertical: 20,
  },
  coverClientLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coverClientValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  coverPricingTier: {
    textAlign: 'center',
    marginTop: 24,
  },
  pricingTierLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 6,
  },
  pricingTierValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
  },
  coverFooter: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  coverFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  coverFooterLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  coverFooterValue: {
    fontSize: 9,
    color: '#475569',
  },
  
  // Section Styles
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    marginTop: 20,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a8a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    marginTop: 12,
    marginBottom: 8,
  },
  
  // Bullet Items
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 4,
  },
  bullet: {
    width: 12,
    fontSize: 10,
    color: '#1e3a8a',
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
    color: '#475569',
  },
  
  // Trade Section
  tradeSection: {
    marginBottom: 14,
    marginTop: 8,
  },
  tradeTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 6,
    backgroundColor: '#f1f5f9',
    padding: 6,
  },
  
  // Allowances Table
  allowanceTable: {
    marginTop: 8,
  },
  allowanceRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  allowanceItem: {
    flex: 1,
    fontSize: 10,
    color: '#475569',
  },
  allowanceValue: {
    width: 100,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  allowanceNote: {
    fontSize: 9,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  
  // Timeline
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  timelinePhase: {
    width: 80,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
  },
  timelineDesc: {
    flex: 1,
    fontSize: 10,
    color: '#475569',
  },
  
  // Investment Summary
  investmentBox: {
    backgroundColor: '#1e3a8a',
    padding: 24,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  investmentLabel: {
    fontSize: 12,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  investmentAmount: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  
  // Payment Table
  paymentTable: {
    marginTop: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a8a',
  },
  paymentHeaderText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  paymentRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  paymentPercent: {
    width: 60,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
  },
  paymentMilestone: {
    flex: 1,
    fontSize: 10,
    color: '#475569',
  },
  paymentAmount: {
    width: 100,
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
  },
  
  // Signature Section
  signatureSection: {
    marginTop: 40,
  },
  signatureTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  signatureRow: {
    flexDirection: 'row',
    marginBottom: 30,
    alignItems: 'flex-end',
  },
  signatureBlock: {
    flex: 1,
    marginRight: 20,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 6,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    height: 24,
  },
  dateBlock: {
    width: 120,
  },
  
  // Warranty & Compliance
  warrantyItem: {
    marginBottom: 8,
  },
  warrantyTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  warrantyText: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.4,
  },
  
  // Footer
  pageFooter: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
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

interface ScopeSection {
  title: string;
  items: string[];
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
  const types: string[] = [];
  if (estimate.has_kitchen) types.push('Kitchen');
  if (estimate.has_bathrooms) {
    if (estimate.bath_scope_level === 'shower_only') {
      types.push('Shower');
    } else {
      types.push('Bathroom');
    }
  }
  if (estimate.has_closets) types.push('Closet');
  return types.length > 0 ? types.join(' & ') : 'Remodel';
}

function getPricingTier(estimate: Estimate): string {
  const projectType = getProjectTypeLabel(estimate);
  const total = estimate.final_cp_total || 0;
  
  if (total >= 50000) return `Premium ${projectType} Remodel Package`;
  if (total >= 30000) return `Full ${projectType} Transformation Package`;
  if (total >= 20000) return `Complete ${projectType} Remodel Package`;
  return `${projectType} Remodel Package`;
}

function getTransformationSummary(estimate: Estimate): string[] {
  const items: string[] = [];
  
  if (estimate.has_bathrooms) {
    if (estimate.bath_scope_level === 'shower_only') {
      items.push('Complete shower transformation with modern design');
      items.push('New tile system with professional waterproofing');
      items.push('Updated plumbing fixtures for improved water efficiency');
    } else {
      items.push('Full bathroom transformation from floor to ceiling');
      items.push('New tile surfaces with premium waterproofing system');
      items.push('Updated plumbing, fixtures, and vanity');
      if (estimate.include_glass || estimate.bath_uses_frameless_glass) {
        items.push('Custom glass enclosure for a modern, open feel');
      }
    }
  }
  
  if (estimate.has_kitchen) {
    items.push('Complete kitchen transformation');
    if (estimate.kitchen_uses_tkbso_cabinets) {
      items.push('New cabinetry with modern soft-close hardware');
    }
    items.push('Updated countertops and surfaces');
    items.push('Improved functionality and storage');
  }
  
  items.push('High-durability materials built to last');
  items.push('Modern, low-maintenance design for long-term value');
  
  return items;
}

function buildScopeSections(estimate: Estimate): ScopeSection[] {
  const sections: ScopeSection[] = [];
  
  // DEMO Section
  if (estimate.include_demo !== false) {
    const demoItems: string[] = [];
    if (estimate.has_kitchen) {
      demoItems.push('Careful removal of existing cabinets, countertops, and appliances');
      demoItems.push('Protection of adjacent areas with floor covering and dust barriers');
      demoItems.push('Complete debris removal and professional disposal');
    }
    if (estimate.has_bathrooms) {
      if (estimate.bath_scope_level === 'shower_only') {
        demoItems.push('Remove existing shower fixtures, tile, and waterproofing substrate');
        demoItems.push('Inspect and prepare substructure for new installation');
      } else {
        demoItems.push('Remove existing fixtures including toilet, vanity, and shower/tub');
        demoItems.push('Remove all tile, flooring, and waterproofing membranes');
        demoItems.push('Inspect substructure and address any water damage or rot');
      }
      if (!estimate.has_kitchen) {
        demoItems.push('Protection of adjacent areas with floor covering and dust barriers');
        demoItems.push('Complete debris removal and professional disposal');
      }
    }
    if (demoItems.length > 0) {
      sections.push({ title: 'DEMOLITION', items: demoItems });
    }
  }
  
  // FRAMING Section
  if (estimate.has_bathrooms) {
    sections.push({ 
      title: 'FRAMING & STRUCTURE', 
      items: [
        'Install proper blocking for shower fixtures and grab bars',
        'Frame shower niche(s) to manufacturer specifications',
        'Ensure all framing meets code for tile backing installation',
        'Address any structural deficiencies discovered during demo'
      ]
    });
  }
  
  // PLUMBING Section
  if (estimate.include_plumbing !== false) {
    const plumbingItems: string[] = [];
    if (estimate.has_kitchen) {
      plumbingItems.push('Install supply and drain lines for kitchen sink');
      plumbingItems.push('Connect dishwasher supply and drain if included in scope');
      plumbingItems.push('Install garbage disposal with proper electrical connection');
      plumbingItems.push('Pressure test all connections and verify no leaks');
    }
    if (estimate.has_bathrooms) {
      if (estimate.bath_scope_level === 'shower_only') {
        plumbingItems.push('Rough-in new water supply lines for shower valve');
        plumbingItems.push('Install new drain assembly with proper slope');
        plumbingItems.push('Set shower valve to proper depth for tile finish');
        plumbingItems.push('Install trim kit, showerhead, and hand shower if included');
        plumbingItems.push('Complete pressure testing with 24-hour leak verification');
      } else {
        plumbingItems.push('Rough-in all water supply and drain lines per plan');
        plumbingItems.push('Install shower valve assembly to manufacturer specifications');
        plumbingItems.push('Set and connect new toilet with wax ring seal');
        plumbingItems.push('Install vanity drain, P-trap, and supply connections');
        plumbingItems.push('Mount and connect all fixtures and trim');
        plumbingItems.push('Complete pressure testing with leak verification');
      }
    }
    if (plumbingItems.length > 0) {
      sections.push({ title: 'PLUMBING', items: plumbingItems });
    }
  }
  
  // ELECTRICAL Section
  if (estimate.include_electrical !== false && (estimate.num_recessed_cans || estimate.num_vanity_lights || estimate.has_kitchen)) {
    const electricalItems: string[] = [];
    if (estimate.has_kitchen) {
      electricalItems.push('Install dedicated circuits for appliances per NEC code');
      electricalItems.push('Install under-cabinet LED lighting');
      electricalItems.push('Provide GFCI protection for all countertop receptacles');
    }
    if (estimate.has_bathrooms) {
      if (estimate.num_recessed_cans && estimate.num_recessed_cans > 0) {
        electricalItems.push(`Install ${estimate.num_recessed_cans} IC-rated recessed light fixture(s)`);
      }
      if (estimate.num_vanity_lights && estimate.num_vanity_lights > 0) {
        electricalItems.push(`Install ${estimate.num_vanity_lights} vanity light fixture(s) above mirror`);
      }
      electricalItems.push('Install code-compliant exhaust fan with timer switch');
      electricalItems.push('Provide GFCI protection for all bathroom receptacles');
    }
    if (electricalItems.length > 0) {
      sections.push({ title: 'ELECTRICAL', items: electricalItems });
    }
  }
  
  // TILE & WATERPROOFING Section
  if (estimate.has_bathrooms) {
    const tileItems: string[] = [];
    tileItems.push('Install Schluter DITRA or equivalent waterproofing membrane system');
    tileItems.push('Apply liquid waterproofing to all shower corners and transitions');
    tileItems.push('Install cement board backing to all tile areas per TCNA guidelines');
    
    if (estimate.bath_wall_tile_sqft && estimate.bath_wall_tile_sqft > 0) {
      tileItems.push(`Install wall tile in shower area (~${Math.round(estimate.bath_wall_tile_sqft)} sq ft)`);
    } else {
      tileItems.push('Install wall tile to shower walls with proper waterproofing');
    }
    
    if (estimate.bath_shower_floor_tile_sqft && estimate.bath_shower_floor_tile_sqft > 0) {
      tileItems.push(`Install shower floor tile with proper slope to drain (~${Math.round(estimate.bath_shower_floor_tile_sqft)} sq ft)`);
    } else {
      tileItems.push('Install shower floor tile with 1/4" per foot slope to drain');
    }
    
    if (estimate.bath_scope_level !== 'shower_only') {
      tileItems.push('Install bathroom floor tile with proper layout and cuts');
    }
    
    tileItems.push('Apply premium grout with sealer for long-term protection');
    tileItems.push('Install Schluter edge profiles and transitions');
    sections.push({ title: 'TILE & WATERPROOFING', items: tileItems });
  }
  
  // CABINETS Section
  if (estimate.has_kitchen && estimate.kitchen_uses_tkbso_cabinets) {
    sections.push({ 
      title: 'CABINETRY', 
      items: [
        'Install new kitchen cabinets per approved design layout',
        'Level and secure all cabinets to wall studs',
        'Install soft-close hinges and drawer glides',
        'Install all hardware per homeowner selection',
        'Adjust doors and drawers for proper alignment'
      ]
    });
  }
  
  // COUNTERTOPS Section
  if ((estimate.has_kitchen && estimate.kitchen_countertop_sqft) || 
      (estimate.has_bathrooms && estimate.bath_countertop_sqft)) {
    const countertopItems: string[] = [];
    if (estimate.has_kitchen && estimate.kitchen_countertop_sqft) {
      countertopItems.push(`Template and fabricate kitchen quartz countertops (~${Math.round(estimate.kitchen_countertop_sqft)} sq ft)`);
      countertopItems.push('Include undermount sink cutout and faucet hole drilling');
    }
    if (estimate.has_bathrooms && estimate.bath_countertop_sqft) {
      countertopItems.push(`Template and fabricate vanity countertop (~${Math.round(estimate.bath_countertop_sqft)} sq ft)`);
    }
    countertopItems.push('Professional installation with proper support and sealing');
    sections.push({ title: 'COUNTERTOPS', items: countertopItems });
  }
  
  // VANITY Section
  if (estimate.has_bathrooms && estimate.bath_scope_level !== 'shower_only' && estimate.bath_uses_tkbso_vanities) {
    const vanityItems: string[] = [];
    if (estimate.vanity_size && estimate.vanity_size !== 'none') {
      vanityItems.push(`Install ${estimate.vanity_size}" vanity with integrated top and sink`);
    } else {
      vanityItems.push('Install new vanity cabinet with countertop and sink');
    }
    vanityItems.push('Mount framed mirror above vanity');
    vanityItems.push('Connect all plumbing with chrome supply lines');
    vanityItems.push('Install faucet and drain assembly');
    sections.push({ title: 'VANITY', items: vanityItems });
  }
  
  // SHOWER GLASS Section
  const hasGlass = estimate.include_glass || estimate.bath_uses_frameless_glass || 
                   (estimate.glass_type && estimate.glass_type !== 'none');
  if (estimate.has_bathrooms && hasGlass) {
    const glassItems: string[] = [];
    if (estimate.glass_type === 'panel_only') {
      glassItems.push('Install frameless glass panel with stabilizing bar');
    } else if (estimate.glass_type === '90_return') {
      glassItems.push('Install frameless 90-degree return glass enclosure');
    } else {
      glassItems.push('Install frameless glass door and panel enclosure');
    }
    glassItems.push('Field measurement after tile completion for precision fit');
    glassItems.push('Install premium hardware with polished chrome finish');
    glassItems.push('Apply silicone seals and water deflectors');
    glassItems.push('Final adjustment and cleaning');
    sections.push({ title: 'SHOWER GLASS', items: glassItems });
  }
  
  // PAINT Section
  if (estimate.include_paint !== false) {
    const paintItems: string[] = [];
    if (estimate.has_bathrooms) {
      paintItems.push('Repair and finish all drywall patches and transitions');
      paintItems.push('Apply primer to all new drywall and repaired areas');
      paintItems.push('Apply two coats of moisture-resistant bathroom paint');
      paintItems.push('Paint ceiling with mold-resistant flat finish');
    }
    if (estimate.has_kitchen) {
      paintItems.push('Repair and finish all drywall patches');
      paintItems.push('Apply two coats of premium interior paint');
    }
    paintItems.push('Paint colors to be selected by homeowner');
    if (paintItems.length > 0) {
      sections.push({ title: 'PAINTING & FINISH', items: paintItems });
    }
  }
  
  // FINAL INSTALLATION Section
  sections.push({
    title: 'FINAL INSTALLATION & CLEANUP',
    items: [
      'Install all fixtures, accessories, and hardware',
      'Mount towel bars, toilet paper holders, and robe hooks',
      'Install switch plates and outlet covers',
      'Caulk all transitions between surfaces',
      'Complete walk-through with homeowner',
      'Professional cleanup of all work areas'
    ]
  });
  
  return sections;
}

function getMaterialAllowances(estimate: Estimate): { item: string; allowance: string }[] {
  const allowances: { item: string; allowance: string }[] = [];
  
  if (estimate.has_bathrooms) {
    allowances.push({ item: 'Tile Material (homeowner to provide)', allowance: '$7.50 - $8.25/sq ft' });
    allowances.push({ item: 'Plumbing Fixtures (shower trim, faucet)', allowance: '$1,100 - $1,600' });
    
    if (estimate.bath_scope_level !== 'shower_only') {
      allowances.push({ item: 'Toilet', allowance: '$450' });
      allowances.push({ item: 'Vanity Mirror + Lighting', allowance: '$400 - $800' });
    }
    
    if (estimate.include_glass || estimate.bath_uses_frameless_glass) {
      allowances.push({ item: 'Shower Glass Enclosure', allowance: 'Included in scope' });
    }
  }
  
  if (estimate.has_kitchen) {
    allowances.push({ item: 'Kitchen Faucet', allowance: '$400' });
    allowances.push({ item: 'Garbage Disposal', allowance: '$250' });
  }
  
  return allowances;
}

export function ProposalPdf({ contractor, estimate, pricingConfig }: ProposalPdfProps) {
  const settings: ContractorSettings = (contractor.settings as ContractorSettings) || defaultSettings;
  const { companyProfile, branding, licenses, insurance, defaults } = settings;
  
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
  const projectType = getProjectTypeLabel(estimate);
  const pricingTier = getPricingTier(estimate);
  const transformationItems = getTransformationSummary(estimate);
  const scopeSections = buildScopeSections(estimate);
  const allowances = getMaterialAllowances(estimate);
  
  const companyName = companyProfile.companyName || branding.headerTitle || 'The Kitchen & Bath Store of Orlando';
  const companyPhone = companyProfile.phone || '(407) 555-0100';
  const companyEmail = companyProfile.email || 'info@tkbso.com';
  const companyWebsite = companyProfile.website || 'www.tkbso.com';
  
  // Find GC license
  const gcLicense = licenses.find(l => l.type.toLowerCase().includes('general') || l.type.toLowerCase().includes('gc'));
  const licenseNumber = gcLicense?.number || '';
  const licenseState = gcLicense?.state || 'FL';
  
  // Insurance info
  const hasInsurance = insurance.glProvider && insurance.glNumber;
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      {/* PAGE 1: COVER PAGE */}
      <Page size="LETTER" style={styles.coverPage}>
        <View>
          {/* Header with Logo */}
          <View style={styles.coverHeader}>
            {branding.logoUrl ? (
              <Image src={branding.logoUrl} style={styles.logo} />
            ) : (
              <Image src={tkbsoLogo} style={styles.logo} />
            )}
            <Text style={styles.companyName}>{companyName.toUpperCase()}</Text>
            <Text style={styles.companyContact}>{companyPhone} | {companyEmail}</Text>
            <Text style={styles.companyContact}>{companyWebsite}</Text>
          </View>
          
          <View style={styles.coverDivider} />
          
          {/* Project Title */}
          <Text style={styles.coverProjectTitle}>
            {clientName} – {projectType} Remodel
          </Text>
          <Text style={styles.coverProjectSubtitle}>
            Professional Remodeling Proposal
          </Text>
          
          {/* Client & Project Info */}
          <View style={styles.coverClientSection}>
            <Text style={styles.coverClientLabel}>Prepared For</Text>
            <Text style={styles.coverClientValue}>{clientName}</Text>
            
            {fullAddress && (
              <>
                <Text style={styles.coverClientLabel}>Project Address</Text>
                <Text style={styles.coverClientValue}>{fullAddress}</Text>
              </>
            )}
            
            <Text style={styles.coverClientLabel}>Date</Text>
            <Text style={styles.coverClientValue}>{currentDate}</Text>
          </View>
          
          {/* Pricing Tier */}
          <View style={styles.coverPricingTier}>
            <Text style={styles.pricingTierLabel}>Service Package</Text>
            <Text style={styles.pricingTierValue}>{pricingTier}</Text>
          </View>
        </View>
        
        {/* Footer with License & Insurance */}
        <View style={styles.coverFooter}>
          {licenseNumber && (
            <View style={styles.coverFooterRow}>
              <Text style={styles.coverFooterLabel}>Contractor License:</Text>
              <Text style={styles.coverFooterValue}>{licenseState} #{licenseNumber}</Text>
            </View>
          )}
          {hasInsurance && (
            <View style={styles.coverFooterRow}>
              <Text style={styles.coverFooterLabel}>General Liability Insurance:</Text>
              <Text style={styles.coverFooterValue}>{insurance.glProvider} - {insurance.glCoverage}</Text>
            </View>
          )}
          <View style={styles.coverFooterRow}>
            <Text style={styles.coverFooterLabel}>Fully Licensed & Insured</Text>
            <Text style={styles.coverFooterValue}>Professional Workmanship Guaranteed</Text>
          </View>
        </View>
      </Page>
      
      {/* PAGE 2: PROJECT SUMMARY & SCOPE */}
      <Page size="LETTER" style={styles.page}>
        {/* Project Summary */}
        <Text style={styles.sectionTitle}>Project Summary</Text>
        <Text style={{ fontSize: 10, color: '#64748b', marginBottom: 12, lineHeight: 1.5 }}>
          Your {projectType.toLowerCase()} remodel will transform your space into a modern, 
          functional area designed for years of daily use. Here&apos;s what we&apos;ll accomplish together:
        </Text>
        {transformationItems.map((item, idx) => (
          <View key={idx} style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
        
        {/* Scope of Work */}
        <Text style={styles.sectionTitle}>Scope of Work</Text>
        <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 8 }}>
          The following work will be performed by licensed professionals to industry standards:
        </Text>
        
        {scopeSections.slice(0, 4).map((section, sectionIdx) => (
          <View key={sectionIdx} style={styles.tradeSection}>
            <Text style={styles.tradeTitle}>{section.title}</Text>
            {section.items.map((item, itemIdx) => (
              <View key={itemIdx} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}
        
        <View style={styles.pageFooter}>
          <Text style={styles.footerText}>{companyName} | {companyPhone} | Page 2</Text>
        </View>
      </Page>
      
      {/* PAGE 3: SCOPE CONTINUED & ALLOWANCES */}
      <Page size="LETTER" style={styles.page}>
        {/* Remaining Scope Sections */}
        {scopeSections.slice(4).map((section, sectionIdx) => (
          <View key={sectionIdx} style={styles.tradeSection}>
            <Text style={styles.tradeTitle}>{section.title}</Text>
            {section.items.map((item, itemIdx) => (
              <View key={itemIdx} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}
        
        {/* Material Allowances */}
        {allowances.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Material Allowances</Text>
            <View style={styles.allowanceTable}>
              {allowances.map((allowance, idx) => (
                <View key={idx} style={styles.allowanceRow}>
                  <Text style={styles.allowanceItem}>{allowance.item}</Text>
                  <Text style={styles.allowanceValue}>{allowance.allowance}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.allowanceNote}>
              Note: Upgrades over allowance amounts will be added to project cost prior to ordering. 
              Homeowner selections must be finalized before materials are ordered.
            </Text>
          </>
        )}
        
        {/* Project Timeline */}
        <Text style={styles.sectionTitle}>Project Timeline</Text>
        <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 12 }}>
          Estimated project timeline, subject to material availability and conditions discovered during work:
        </Text>
        <View style={styles.timelineItem}>
          <Text style={styles.timelinePhase}>Phase 1:</Text>
          <Text style={styles.timelineDesc}>Demolition & Rough-In (Days 1-3)</Text>
        </View>
        <View style={styles.timelineItem}>
          <Text style={styles.timelinePhase}>Phase 2:</Text>
          <Text style={styles.timelineDesc}>Framing, Plumbing & Electrical (Days 3-5)</Text>
        </View>
        <View style={styles.timelineItem}>
          <Text style={styles.timelinePhase}>Phase 3:</Text>
          <Text style={styles.timelineDesc}>Waterproofing & Tile Installation (Days 5-9)</Text>
        </View>
        <View style={styles.timelineItem}>
          <Text style={styles.timelinePhase}>Phase 4:</Text>
          <Text style={styles.timelineDesc}>Vanity, Countertops & Paint (Days 9-11)</Text>
        </View>
        <View style={styles.timelineItem}>
          <Text style={styles.timelinePhase}>Phase 5:</Text>
          <Text style={styles.timelineDesc}>Glass, Fixtures & Final (Days 11-14)</Text>
        </View>
        
        <View style={styles.pageFooter}>
          <Text style={styles.footerText}>{companyName} | {companyPhone} | Page 3</Text>
        </View>
      </Page>
      
      {/* PAGE 4: INVESTMENT & PAYMENT */}
      <Page size="LETTER" style={styles.page}>
        {/* Investment Summary */}
        <Text style={styles.sectionTitle}>Your Investment</Text>
        <View style={styles.investmentBox}>
          <Text style={styles.investmentLabel}>{projectType} Remodel Investment</Text>
          <Text style={styles.investmentAmount}>{formatCurrency(totalCost)}</Text>
        </View>
        
        {/* Payment Milestones */}
        <Text style={styles.sectionTitle}>Payment Schedule</Text>
        <View style={styles.paymentTable}>
          <View style={styles.paymentHeader}>
            <Text style={[styles.paymentHeaderText, { width: 60 }]}>%</Text>
            <Text style={[styles.paymentHeaderText, { flex: 1 }]}>Milestone</Text>
            <Text style={[styles.paymentHeaderText, { width: 100, textAlign: 'right' }]}>Amount</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(depositSplit * 100)}%</Text>
            <Text style={styles.paymentMilestone}>Due upon signed agreement to begin ordering materials</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(depositAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(progressSplit * 100)}%</Text>
            <Text style={styles.paymentMilestone}>Due upon completion of tile work and rough-in trades</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(progressAmount)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentPercent}>{Math.round(finalSplit * 100)}%</Text>
            <Text style={styles.paymentMilestone}>Due upon final walk-through and project completion</Text>
            <Text style={styles.paymentAmount}>{formatCurrency(finalAmount)}</Text>
          </View>
        </View>
        
        {/* Warranty */}
        <Text style={styles.sectionTitle}>Warranty & Responsibilities</Text>
        <View style={styles.warrantyItem}>
          <Text style={styles.warrantyTitle}>Workmanship Warranty</Text>
          <Text style={styles.warrantyText}>
            All labor and installation is warranted for 24 months from project completion. 
            This covers defects in workmanship and installation failures under normal use.
          </Text>
        </View>
        <View style={styles.warrantyItem}>
          <Text style={styles.warrantyTitle}>Manufacturer Warranties</Text>
          <Text style={styles.warrantyText}>
            All fixtures, materials, and products are covered under their respective manufacturer warranties. 
            Registration cards will be provided to homeowner upon completion.
          </Text>
        </View>
        <View style={styles.warrantyItem}>
          <Text style={styles.warrantyTitle}>Homeowner Responsibilities</Text>
          <Text style={styles.warrantyText}>
            Homeowner is responsible for proper maintenance per manufacturer guidelines. 
            Warranty is void for damage caused by improper use, cleaning products, or neglect. 
            Any changes to approved scope require a written change order.
          </Text>
        </View>
        
        <View style={styles.pageFooter}>
          <Text style={styles.footerText}>{companyName} | {companyPhone} | Page 4</Text>
        </View>
      </Page>
      
      {/* PAGE 5: COMPLIANCE & SIGNATURES */}
      <Page size="LETTER" style={styles.page}>
        {/* Compliance */}
        <Text style={styles.sectionTitle}>Compliance & Safety</Text>
        <View style={styles.warrantyItem}>
          <Text style={styles.warrantyTitle}>Licensing</Text>
          <Text style={styles.warrantyText}>
            {companyName} is a licensed contractor in the State of {licenseState}
            {licenseNumber ? ` (License #${licenseNumber})` : ''}.
            All work performed will meet or exceed local building codes and industry standards.
          </Text>
        </View>
        <View style={styles.warrantyItem}>
          <Text style={styles.warrantyTitle}>Insurance</Text>
          <Text style={styles.warrantyText}>
            We maintain comprehensive general liability insurance
            {insurance.glCoverage ? ` with ${insurance.glCoverage} coverage` : ''} 
            {insurance.wcProvider ? ' and workers compensation insurance' : ''}.
            Certificates available upon request.
          </Text>
        </View>
        <View style={styles.warrantyItem}>
          <Text style={styles.warrantyTitle}>Safety Practices</Text>
          <Text style={styles.warrantyText}>
            Our team follows OSHA safety guidelines and maintains a clean, organized worksite. 
            Dust barriers and floor protection are installed to minimize disruption to your home.
            {estimate.has_bathrooms ? ' All tile work follows TCNA guidelines for waterproofing and installation.' : ''}
          </Text>
        </View>
        
        {/* Terms */}
        {defaults.termsText && (
          <>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <Text style={{ fontSize: 9, color: '#64748b', lineHeight: 1.5 }}>
              {defaults.termsText}
            </Text>
          </>
        )}
        
        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>Acceptance</Text>
          <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 20, textAlign: 'center' }}>
            By signing below, I accept this proposal and authorize {companyName} to proceed with the project as described.
          </Text>
          
          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>Homeowner Signature</Text>
              <View style={styles.signatureLine} />
            </View>
            <View style={styles.dateBlock}>
              <Text style={styles.signatureLabel}>Date</Text>
              <View style={styles.signatureLine} />
            </View>
          </View>
          
          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>Homeowner Printed Name</Text>
              <View style={styles.signatureLine} />
            </View>
          </View>
          
          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>
                {branding.signatureText || `${companyName} Representative`}
              </Text>
              <View style={styles.signatureLine} />
            </View>
            <View style={styles.dateBlock}>
              <Text style={styles.signatureLabel}>Date</Text>
              <View style={styles.signatureLine} />
            </View>
          </View>
        </View>
        
        {/* Footer */}
        <View style={[styles.pageFooter, { borderTopWidth: 2, borderTopColor: '#1e3a8a' }]}>
          <Text style={[styles.footerText, { fontSize: 9, color: '#475569' }]}>
            {branding.pdfFooterDisclaimer || `Thank you for choosing ${companyName}. We look forward to transforming your space.`}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
