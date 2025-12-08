export interface CompanyProfile {
  ownerFirst: string;
  ownerLast: string;
  companyName: string;
  dba: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  preferredContact: 'email' | 'phone' | 'text';
}

export interface Branding {
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  headerTitle: string;
  tagline: string;
  signatureText: string;
  pdfFooterDisclaimer: string;
  proposalTitle: string;
  showPoweredBy: boolean;
}

export interface License {
  id: string;
  type: string;
  number: string;
  state: string;
  expiration: string;
  fileUrl?: string;
}

export interface Insurance {
  glProvider: string;
  glNumber: string;
  glCoverage: string;
  glExpiration: string;
  glFileUrl?: string;
  wcProvider?: string;
  wcNumber?: string;
  wcCoverage?: string;
  wcExpiration?: string;
  wcFileUrl?: string;
}

export interface BusinessDefaults {
  depositPct: number;
  depositLabel: string;
  progressPct: number;
  progressLabel: string;
  finalPct: number;
  finalLabel: string;
  minJobCp: number;
  estimateExpirationDays: number;
  termsText: string;
  requireSignedProposal: boolean;
  requireFixtureSelections: boolean;
}

export interface ContractorSettings {
  companyProfile: CompanyProfile;
  branding: Branding;
  licenses: License[];
  insurance: Insurance;
  defaults: BusinessDefaults;
  onboardingCompleted?: boolean;
}

export const defaultSettings: ContractorSettings = {
  companyProfile: {
    ownerFirst: '',
    ownerLast: '',
    companyName: '',
    dba: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    website: '',
    preferredContact: 'email',
  },
  branding: {
    logoUrl: '',
    primaryColor: '#0B1C3E',
    accentColor: '#00E5FF',
    headerTitle: '',
    tagline: '',
    signatureText: '',
    pdfFooterDisclaimer: '',
    proposalTitle: 'Investment Proposal',
    showPoweredBy: true,
  },
  licenses: [],
  insurance: {
    glProvider: '',
    glNumber: '',
    glCoverage: '',
    glExpiration: '',
    glFileUrl: '',
    wcProvider: '',
    wcNumber: '',
    wcCoverage: '',
    wcExpiration: '',
    wcFileUrl: '',
  },
  defaults: {
    depositPct: 65,
    depositLabel: 'Due at signing',
    progressPct: 25,
    progressLabel: 'Due at job start',
    finalPct: 10,
    finalLabel: 'Due at completion',
    minJobCp: 15000,
    estimateExpirationDays: 30,
    termsText: '',
    requireSignedProposal: true,
    requireFixtureSelections: false,
  },
};
