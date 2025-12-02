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
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#1e293b',
  },
  // Page 1 Styles
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 60,
    objectFit: 'contain',
    marginBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
  },
  clientBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  clientInfo: {
    flex: 1,
  },
  clientLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientValue: {
    fontSize: 12,
    fontWeight: 600,
    color: '#0f172a',
  },
  dateBlock: {
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#0ea5e9',
  },
  descriptionBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 16,
    marginBottom: 25,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0ea5e9',
    marginRight: 10,
    marginTop: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
    color: '#334155',
  },
  priceBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 20,
    marginTop: 'auto',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#ffffff',
  },
  priceNote: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 5,
  },
  // Page 2 Styles - Scope Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontWeight: 600,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  categoryCol: {
    width: '20%',
  },
  taskCol: {
    width: '65%',
  },
  includedCol: {
    width: '15%',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 600,
    color: '#0f172a',
  },
  taskText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.4,
  },
  includedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  includedText: {
    fontSize: 8,
    color: '#15803d',
    fontWeight: 600,
  },
  excludedBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  excludedText: {
    fontSize: 8,
    color: '#b91c1c',
    fontWeight: 600,
  },
  // Page 3 Styles - Payment & Signature
  milestoneSection: {
    marginBottom: 30,
  },
  milestoneBar: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 15,
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
    fontSize: 14,
    fontWeight: 700,
    color: '#ffffff',
  },
  milestoneDetails: {
    marginTop: 5,
  },
  milestoneRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  milestoneAmount: {
    width: 90,
    fontSize: 12,
    fontWeight: 600,
    color: '#0f172a',
  },
  milestoneLabel: {
    flex: 1,
    fontSize: 10,
    color: '#64748b',
  },
  notesSection: {
    marginBottom: 30,
  },
  noteBox: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    padding: 12,
    marginBottom: 10,
    borderRadius: 4,
  },
  noteTitle: {
    fontSize: 9,
    fontWeight: 600,
    color: '#92400e',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 9,
    color: '#78350f',
    lineHeight: 1.4,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureBox: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
    height: 30,
    marginBottom: 5,
  },
  dateLabel: {
    fontSize: 8,
    color: '#94a3b8',
    marginTop: 15,
  },
  dateLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    width: 120,
    height: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  pageNumber: {
    fontSize: 8,
    color: '#64748b',
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
      {/* PAGE 1: Executive Summary */}
      <Page size="LETTER" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          {logoUrl && <Image src={logoUrl} style={styles.logo} />}
          <Text style={styles.companyName}>THE KITCHEN AND BATH STORE OF ORLANDO</Text>
          <Text style={styles.tagline}>Professional Remodeling Services</Text>
        </View>

        {/* Client Information Block */}
        <View style={styles.clientBlock}>
          <View style={styles.clientInfo}>
            <Text style={styles.clientLabel}>Project For</Text>
            <Text style={styles.clientValue}>{clientName || 'Homeowner'}</Text>
            <Text style={{ ...styles.clientValue, fontSize: 10, fontWeight: 400, marginTop: 4, color: '#475569' }}>
              {fullAddress || 'Address TBD'}
            </Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.clientLabel}>Date</Text>
            <Text style={styles.clientValue}>{date}</Text>
            <Text style={{ ...styles.clientLabel, marginTop: 10 }}>Project Type</Text>
            <Text style={{ ...styles.clientValue, fontSize: 10 }}>{projectType} Remodel</Text>
          </View>
        </View>

        {/* Description of Work */}
        <Text style={styles.sectionTitle}>Description of Work</Text>
        <View style={styles.descriptionBox}>
          {summaryBullets.map((bullet, index) => (
            <View key={index} style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>

        {/* Total Investment Box */}
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Total Investment</Text>
          <Text style={styles.priceValue}>
            ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
          <Text style={styles.priceNote}>See payment schedule on page 3</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{contractorName}</Text>
          <Text style={styles.pageNumber}>Page 1 of 3</Text>
        </View>
      </Page>

      {/* PAGE 2: Detailed Scope */}
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Detailed Scope of Work</Text>

        {/* Table Header */}
        <View style={styles.tableHeader}>
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

        {/* Table Rows */}
        {scopeItems.map((item, index) => (
          <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
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
        <View style={styles.footer}>
          <Text style={styles.footerText}>{clientName} - {projectType} Remodel</Text>
          <Text style={styles.pageNumber}>Page 2 of 3</Text>
        </View>
      </Page>

      {/* PAGE 3: Payment & Signature */}
      <Page size="LETTER" style={styles.page}>
        {/* Payment Milestones */}
        <View style={styles.milestoneSection}>
          <Text style={styles.sectionTitle}>Payment Schedule</Text>
          
          {/* Visual Bar */}
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

          {/* Milestone Details */}
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
        <View style={styles.notesSection}>
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
        <View style={styles.signatureSection}>
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
        <View style={styles.footer}>
          <Text style={styles.footerText}>{contractorPhone} | {contractorEmail}</Text>
          <Text style={styles.pageNumber}>Page 3 of 3</Text>
        </View>
      </Page>
    </Document>
  );
}
