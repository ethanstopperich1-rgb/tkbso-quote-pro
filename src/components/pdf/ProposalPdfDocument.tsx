import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

// Register Inter font
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff2', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 60,
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#1e293b',
    justifyContent: 'flex-start',
  },
  page2: {
    padding: 40,
    paddingBottom: 60,
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#1e293b',
    justifyContent: 'space-between',
  },
  // Page Header with Logo (appears on every page)
  pageHeader: {
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logo: {
    width: 180,
    height: 60,
    objectFit: 'contain',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 2,
  },
  tagline: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
  },
  // Client Info Block
  headerGroup: {
    marginBottom: 15,
  },
  clientBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  clientInfo: {
    flex: 1,
  },
  clientLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientValue: {
    fontSize: 11,
    fontWeight: 600,
    color: '#0f172a',
  },
  dateBlock: {
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#0ea5e9',
  },
  descriptionBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0ea5e9',
    marginRight: 8,
    marginTop: 3,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
    color: '#334155',
  },
  priceBox: {
    backgroundColor: '#0f172a',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 9,
    color: '#94a3b8',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: 700,
    color: '#ffffff',
  },
  // Scope Table Styles
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 3,
    marginBottom: 1,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontWeight: 600,
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  categoryCol: {
    width: '18%',
  },
  taskCol: {
    width: '67%',
  },
  includedCol: {
    width: '15%',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 9,
    fontWeight: 600,
    color: '#0f172a',
  },
  taskText: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.3,
  },
  includedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  includedText: {
    fontSize: 7,
    color: '#15803d',
    fontWeight: 600,
  },
  excludedBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  excludedText: {
    fontSize: 7,
    color: '#b91c1c',
    fontWeight: 600,
  },
  // Page 2 Styles - Payment & Signature
  milestoneSection: {
    marginBottom: 20,
  },
  milestoneBar: {
    flexDirection: 'row',
    height: 30,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  milestone65: {
    width: '65%',
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestone25: {
    width: '25%',
    backgroundColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestone10: {
    width: '10%',
    backgroundColor: '#7dd3fc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestonePercent: {
    fontSize: 11,
    fontWeight: 700,
    color: '#ffffff',
  },
  milestoneDetails: {
    marginTop: 4,
  },
  milestoneRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  milestoneAmount: {
    width: 80,
    fontSize: 11,
    fontWeight: 600,
    color: '#0f172a',
  },
  milestoneLabel: {
    flex: 1,
    fontSize: 9,
    color: '#64748b',
  },
  notesSection: {
    marginBottom: 20,
  },
  noteBox: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    padding: 8,
    marginBottom: 6,
    borderRadius: 3,
  },
  noteTitle: {
    fontSize: 8,
    fontWeight: 600,
    color: '#92400e',
    marginBottom: 2,
  },
  noteText: {
    fontSize: 8,
    color: '#78350f',
    lineHeight: 1.3,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  signatureBox: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
    height: 25,
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 10,
  },
  dateLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    width: 100,
    height: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  },
  pageNumber: {
    fontSize: 7,
    color: '#64748b',
  },
  // Scope grouping to keep related items together
  scopeSection: {
    marginBottom: 15,
  },
});

export interface ScopeItem {
  category: string;
  task: string;
  included: boolean;
}

export interface ProposalPdfProps {
  clientName: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  date: string;
  projectType: string;
  summaryBullets: string[];
  totalPrice: number;
  lowPrice?: number;
  highPrice?: number;
  scopeItems: ScopeItem[];
  paymentMilestones: {
    deposit: number;
    progress: number;
    final: number;
  };
  estimatedDays?: number;
  contractorName?: string;
  contractorPhone?: string;
  contractorEmail?: string;
  logoUrl?: string;
}

export function ProposalPdfDocument({
  clientName,
  address,
  city,
  state,
  zip,
  date,
  projectType,
  summaryBullets,
  totalPrice,
  scopeItems,
  paymentMilestones,
  estimatedDays = 14,
  contractorName = 'The Kitchen and Bath Store of Orlando',
  contractorPhone = '(407) 555-1234',
  contractorEmail = 'info@tkbso.com',
  logoUrl,
}: ProposalPdfProps) {
  const fullAddress = [address, city, state, zip].filter(Boolean).join(', ');
  
  const depositAmount = totalPrice * paymentMilestones.deposit;
  const progressAmount = totalPrice * paymentMilestones.progress;
  const finalAmount = totalPrice * paymentMilestones.final;

  return (
    <Document>
      {/* PAGE 1: Executive Summary + Scope */}
      <Page size="LETTER" style={styles.page}>
        {/* Page Header with Logo */}
        <View style={styles.pageHeader} fixed>
          {logoUrl && <Image src={logoUrl} style={styles.logo} />}
          <Text style={styles.companyName}>THE KITCHEN AND BATH STORE OF ORLANDO</Text>
          <Text style={styles.tagline}>Professional Remodeling Services</Text>
        </View>

        {/* Client Info Block */}
        <View style={styles.headerGroup} wrap={false}>
          <View style={styles.clientBlock}>
            <View style={styles.clientInfo}>
              <Text style={styles.clientLabel}>Project For</Text>
              <Text style={styles.clientValue}>{clientName || 'Homeowner'}</Text>
              <Text style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>
                {fullAddress || 'Address TBD'}
              </Text>
            </View>
            <View style={styles.dateBlock}>
              <Text style={styles.clientLabel}>Date</Text>
              <Text style={styles.clientValue}>{date}</Text>
              <Text style={{ ...styles.clientLabel, marginTop: 8 }}>Project Type</Text>
              <Text style={{ fontSize: 9, fontWeight: 600, color: '#0f172a' }}>{projectType} Remodel</Text>
            </View>
          </View>
        </View>

        {/* Description of Work */}
        <View wrap={false}>
          <Text style={styles.sectionTitle}>Description of Work</Text>
          <View style={styles.descriptionBox}>
            {summaryBullets.map((bullet, index) => (
              <View key={index} style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Total Investment Box */}
        <View style={styles.priceBox} wrap={false}>
          <Text style={styles.priceLabel}>Total Investment</Text>
          <Text style={styles.priceValue}>
            ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
        </View>

        {/* Scope Table */}
        <Text style={styles.sectionTitle}>Detailed Scope of Work</Text>
        <View style={styles.tableHeader} wrap={false}>
          <View style={styles.categoryCol}>
            <Text style={styles.tableHeaderText}>Category</Text>
          </View>
          <View style={styles.taskCol}>
            <Text style={styles.tableHeaderText}>Task Description</Text>
          </View>
          <View style={styles.includedCol}>
            <Text style={styles.tableHeaderText}>Status</Text>
          </View>
        </View>

        {scopeItems.map((item, index) => (
          <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]} wrap={false}>
            <View style={styles.categoryCol}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <View style={styles.taskCol}>
              <Text style={styles.taskText}>{item.task}</Text>
            </View>
            <View style={styles.includedCol}>
              {item.included ? (
                <View style={styles.includedBadge}>
                  <Text style={styles.includedText}>Included</Text>
                </View>
              ) : (
                <View style={styles.excludedBadge}>
                  <Text style={styles.excludedText}>N/A</Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{contractorName}</Text>
          <Text style={styles.pageNumber}>Page 1 of 2</Text>
        </View>
      </Page>

      {/* PAGE 2: Payment & Signature */}
      <Page size="LETTER" style={styles.page}>
        {/* Page Header with Logo */}
        <View style={styles.pageHeader} fixed>
          {logoUrl && <Image src={logoUrl} style={styles.logo} />}
          <Text style={styles.companyName}>THE KITCHEN AND BATH STORE OF ORLANDO</Text>
          <Text style={styles.tagline}>Professional Remodeling Services</Text>
        </View>

        {/* Payment Milestones */}
        <View style={styles.milestoneSection} wrap={false}>
          <Text style={styles.sectionTitle}>Payment Schedule</Text>
          
            <View style={styles.milestoneBar}>
              <View style={styles.milestone65}>
                <Text style={styles.milestonePercent}>{Math.round(paymentMilestones.deposit * 100)}%</Text>
              </View>
              <View style={styles.milestone25}>
                <Text style={styles.milestonePercent}>{Math.round(paymentMilestones.progress * 100)}%</Text>
              </View>
              <View style={styles.milestone10}>
                <Text style={styles.milestonePercent}>{Math.round(paymentMilestones.final * 100)}%</Text>
              </View>
            </View>

            <View style={styles.milestoneDetails}>
              <View style={styles.milestoneRow}>
                <Text style={styles.milestoneAmount}>
                  ${depositAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </Text>
                <Text style={styles.milestoneLabel}>
                  Deposit — Due upon homeowner approval of project
                </Text>
              </View>
              <View style={styles.milestoneRow}>
                <Text style={styles.milestoneAmount}>
                  ${progressAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </Text>
                <Text style={styles.milestoneLabel}>
                  Progress — Upon completion of tile, rough plumbing & electrical
                </Text>
              </View>
              <View style={styles.milestoneRow}>
                <Text style={styles.milestoneAmount}>
                  ${finalAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </Text>
                <Text style={styles.milestoneLabel}>
                  Final — Upon overall completion and walkthrough
                </Text>
              </View>
            </View>
          </View>

          {/* Project Notes */}
          <View style={styles.notesSection} wrap={false}>
            <Text style={styles.sectionTitle}>Project Notes</Text>
            
            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>Note I: Work Site Precautions</Text>
              <Text style={styles.noteText}>
                TKBSO will take reasonable precautions to minimize dust and disruption, including 
                installing floor protection, sealing vents, and maintaining a clean workspace.
              </Text>
            </View>

            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>Note II: Fixture Allowances</Text>
              <Text style={styles.noteText}>
                All fixtures to be supplied by TKBSO under standard allowance unless specific 
                models are chosen by the homeowner prior to ordering.
              </Text>
            </View>

            <View style={styles.noteBox}>
              <Text style={styles.noteTitle}>Note III: Project Timeline</Text>
              <Text style={styles.noteText}>
                Estimated timeline for completion is approximately {estimatedDays} days from project 
                start, pending material lead times.
              </Text>
            </View>
          </View>

        {/* Signature Section */}
        <View style={styles.signatureSection} wrap={false}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Homeowner Approval</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.dateLabel}>Date: _______________</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>TKBSO Representative</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.dateLabel}>Date: _______________</Text>
            </View>
        </View>

        {/* Footer */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 8, marginTop: 20 }}>
          <Text style={styles.footerText}>{contractorPhone} | {contractorEmail}</Text>
          <Text style={styles.pageNumber}>Page 2 of 2</Text>
        </View>
      </Page>
    </Document>
  );
}
