import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { Contractor, Estimate, PricingConfig } from '@/types/database';
import tkbsoLogo from '@/assets/tkbso-logo-full.png';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    padding: 50,
    backgroundColor: '#ffffff',
  },
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
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  projectTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 4,
  },
  descriptionHeader: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 6,
  },
  tradeSection: {
    marginBottom: 14,
  },
  tradeTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    marginBottom: 6,
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
  costSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#1e3a8a',
  },
  costLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  costAmount: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    marginBottom: 16,
  },
  milestonesLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  paymentScheduleTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
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
    fontFamily: 'Helvetica-Bold',
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
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    textAlign: 'right',
  },
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
  notesSection: {
    marginTop: 24,
  },
  notesTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  noteItem: {
    marginBottom: 10,
  },
  noteLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
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

function buildScopeSections(estimate: Estimate): ScopeSection[] {
  const sections: ScopeSection[] = [];
  
  // DEMO Section
  if (estimate.include_demo !== false) {
    const demoItems: string[] = [];
    if (estimate.has_kitchen) {
      demoItems.push('Remove existing cabinets, countertops, and appliances as needed');
      demoItems.push('Protect adjacent areas and flooring');
      demoItems.push('Debris removal and disposal');
    }
    if (estimate.has_bathrooms) {
      if (estimate.bath_scope_level === 'shower_only') {
        demoItems.push('Remove existing shower fixtures, tile, and substrate');
      } else {
        demoItems.push('Remove existing fixtures, tile, vanity, and toilet');
      }
      if (!estimate.has_kitchen) {
        demoItems.push('Protect adjacent areas and flooring');
        demoItems.push('Debris removal and disposal');
      }
    }
    if (demoItems.length > 0) {
      sections.push({ title: 'DEMO', items: demoItems });
    }
  }
  
  // FRAMING Section
  const framingItems: string[] = [];
  if (estimate.has_bathrooms) {
    framingItems.push('Install blocking for shower fixtures and accessories');
    framingItems.push('Frame shower niche(s) as needed');
  }
  if (framingItems.length > 0) {
    sections.push({ title: 'FRAMING', items: framingItems });
  }
  
  // PLUMBING Section
  if (estimate.include_plumbing !== false) {
    const plumbingItems: string[] = [];
    if (estimate.has_kitchen) {
      plumbingItems.push('Install and connect kitchen sink and faucet');
      plumbingItems.push('Connect dishwasher and disposal if included');
      plumbingItems.push('Final pressure testing');
    }
    if (estimate.has_bathrooms) {
      if (estimate.bath_scope_level === 'shower_only') {
        plumbingItems.push('Rough-in water supply and drain lines for new shower');
        plumbingItems.push('Install shower valve, trim, and showerhead');
        plumbingItems.push('Pressure test and leak verification');
      } else {
        plumbingItems.push('Rough-in water supply and drain lines');
        plumbingItems.push('Install shower valve, trim, and fixtures');
        plumbingItems.push('Set and connect toilet');
        plumbingItems.push('Install vanity plumbing and faucet');
        plumbingItems.push('Final pressure testing and leak check');
      }
    }
    if (plumbingItems.length > 0) {
      sections.push({ title: 'PLUMBING', items: plumbingItems });
    }
  }
  
  // ELECTRICAL Section
  if (estimate.include_electrical !== false) {
    const electricalItems: string[] = [];
    if (estimate.has_kitchen) {
      electricalItems.push('Install dedicated circuits as needed');
      electricalItems.push('Install under-cabinet lighting');
      electricalItems.push('Connect appliances per code');
    }
    if (estimate.has_bathrooms) {
      if (estimate.num_recessed_cans && estimate.num_recessed_cans > 0) {
        electricalItems.push(`Install ${estimate.num_recessed_cans} recessed light(s)`);
      }
      if (estimate.num_vanity_lights && estimate.num_vanity_lights > 0) {
        electricalItems.push(`Install ${estimate.num_vanity_lights} vanity light fixture(s)`);
      }
      electricalItems.push('Install exhaust fan');
      electricalItems.push('GFCI outlets per code');
    }
    if (electricalItems.length > 0) {
      sections.push({ title: 'ELECTRICAL', items: electricalItems });
    }
  }
  
  // TILE WORK Section
  const tileItems: string[] = [];
  if (estimate.has_bathrooms) {
    tileItems.push('Install waterproofing system (Schluter or equivalent)');
    tileItems.push('Level and prep substrate as needed');
    if (estimate.bath_wall_tile_sqft && estimate.bath_wall_tile_sqft > 0) {
      tileItems.push(`Install wall tile in shower area (~${Math.round(estimate.bath_wall_tile_sqft)} sq ft)`);
    } else {
      tileItems.push('Install wall tile in shower/wet areas');
    }
    if (estimate.bath_shower_floor_tile_sqft && estimate.bath_shower_floor_tile_sqft > 0) {
      tileItems.push(`Install shower floor tile with slope to drain (~${Math.round(estimate.bath_shower_floor_tile_sqft)} sq ft)`);
    } else {
      tileItems.push('Install shower floor tile with proper slope to drain');
    }
    if (estimate.bath_scope_level !== 'shower_only' && estimate.bath_floor_tile_sqft && estimate.bath_floor_tile_sqft > 0) {
      tileItems.push(`Install bathroom floor tile (~${Math.round(estimate.bath_floor_tile_sqft)} sq ft)`);
    }
    tileItems.push('Grout, clean, and seal all tile');
    tileItems.push('Tile material to be supplied by homeowner');
  }
  if (estimate.has_kitchen) {
    tileItems.push('Install backsplash tile');
    tileItems.push('Grout and seal backsplash');
  }
  if (tileItems.length > 0) {
    sections.push({ title: 'TILE WORK', items: tileItems });
  }
  
  // CABINETS Section (Kitchen)
  if (estimate.has_kitchen && estimate.kitchen_uses_tkbso_cabinets) {
    sections.push({ 
      title: 'CABINETS', 
      items: [
        'Install new kitchen cabinets per design',
        'Level and secure all cabinets',
        'Install hardware and soft-close hinges'
      ]
    });
  }
  
  // COUNTERTOPS Section
  const countertopItems: string[] = [];
  if (estimate.has_kitchen && estimate.kitchen_countertop_sqft) {
    countertopItems.push(`Install kitchen quartz countertops (~${Math.round(estimate.kitchen_countertop_sqft)} sq ft)`);
    countertopItems.push('Template after cabinet installation');
    countertopItems.push('Sink cutout and faucet holes');
  }
  if (estimate.has_bathrooms && estimate.bath_countertop_sqft) {
    countertopItems.push(`Install vanity countertop (~${Math.round(estimate.bath_countertop_sqft)} sq ft)`);
  }
  if (countertopItems.length > 0) {
    sections.push({ title: 'COUNTERTOPS', items: countertopItems });
  }
  
  // VANITY Section (Bathroom)
  if (estimate.has_bathrooms && estimate.bath_scope_level !== 'shower_only' && estimate.bath_uses_tkbso_vanities) {
    const vanityItems: string[] = [];
    if (estimate.vanity_size) {
      vanityItems.push(`Install ${estimate.vanity_size}" vanity with top and sink`);
    } else {
      vanityItems.push('Install vanity with top and sink');
    }
    vanityItems.push('Install mirror');
    vanityItems.push('Connect plumbing and faucet');
    sections.push({ title: 'VANITY', items: vanityItems });
  }
  
  // SHOWER GLASS Section
  const hasGlass = estimate.include_glass || estimate.bath_uses_frameless_glass || 
                   (estimate.glass_type && estimate.glass_type !== 'none');
  if (estimate.has_bathrooms && hasGlass) {
    const glassItems: string[] = [];
    if (estimate.glass_type === 'panel_only') {
      glassItems.push('Glass panel installation');
    } else if (estimate.glass_type === '90_return') {
      glassItems.push('90-degree return glass enclosure');
    } else {
      glassItems.push('Frameless glass shower enclosure');
    }
    glassItems.push('Field measurement after tile completion');
    glassItems.push('Custom hardware and seals');
    glassItems.push('Professional installation');
    sections.push({ title: 'SHOWER GLASS', items: glassItems });
  }
  
  // PAINT Section
  if (estimate.include_paint !== false && estimate.has_bathrooms) {
    sections.push({ 
      title: 'PAINTING', 
      items: [
        'Patch and repair drywall as needed',
        'Prime and paint bathroom walls and ceiling',
        'Paint color to be selected by homeowner'
      ]
    });
  }
  
  // CLOSET Section
  if (estimate.has_closets) {
    sections.push({ 
      title: 'CLOSET', 
      items: [
        'Install closet organization system',
        'Shelving, rods, and drawers per design',
        'Hardware and accessories'
      ]
    });
  }
  
  return sections;
}

export function ProposalPdf({ contractor, estimate, pricingConfig }: ProposalPdfProps) {
  const depositSplit = pricingConfig?.payment_split_deposit ?? 0.65;
  const progressSplit = pricingConfig?.payment_split_progress ?? 0.25;
  const finalSplit = pricingConfig?.payment_split_final ?? 0.10;
  
  const totalCost = estimate.final_cp_total || 0;
  const depositAmount = Math.round(totalCost * depositSplit);
  const progressAmount = Math.round(totalCost * progressSplit);
  const finalAmount = Math.round(totalCost * finalSplit);
  
  const addressParts = [
    estimate.property_address,
    estimate.city,
    estimate.state,
    estimate.zip,
  ].filter(Boolean);
  const fullAddress = addressParts.join(', ').replace(/,\s*,/g, ',');
  
  const clientName = estimate.client_name || 'Customer Name';
  const projectType = getProjectTypeLabel(estimate);
  const scopeSections = buildScopeSections(estimate);

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
        
        {/* Dynamic Scope Sections */}
        {scopeSections.map((section, sectionIdx) => (
          <View key={sectionIdx} style={styles.tradeSection}>
            <Text style={styles.tradeTitle}>{section.title}:</Text>
            {section.items.map((item, itemIdx) => (
              <View key={itemIdx} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}
        
        {/* Final Cost */}
        <View style={styles.costSection}>
          <Text style={styles.costLabel}>{projectType} Final Cost:</Text>
          <Text style={styles.costAmount}>{formatCurrency(totalCost)}</Text>
          <Text style={styles.milestonesLabel}>Payment Milestones:</Text>
        </View>
      </Page>
      
      {/* Page 2 - Payment Schedule & Signatures */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.paymentScheduleTitle}>Payment Schedule</Text>
        
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
