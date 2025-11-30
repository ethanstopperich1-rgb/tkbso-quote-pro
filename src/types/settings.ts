export interface CompanyProfile {
  ownerFirst: string;
  ownerLast: string;
  companyName: string;
  dba: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  preferredContact: 'email' | 'phone' | 'text';
}

export interface Branding {
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  headerTitle: string;
  signatureText: string;
  pdfFooterDisclaimer: string;
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
  progressPct: number;
  finalPct: number;
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
    website: '',
    preferredContact: 'email',
  },
  branding: {
    logoUrl: '',
    primaryColor: '#1e3a8a',
    accentColor: '#3b82f6',
    headerTitle: '',
    signatureText: '',
    pdfFooterDisclaimer: '',
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
    progressPct: 25,
    finalPct: 10,
    minJobCp: 15000,
    estimateExpirationDays: 30,
    termsText: '',
    requireSignedProposal: true,
    requireFixtureSelections: false,
  },
};
