import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface BrandingData {
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  companyName: string;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  proposalTitle: string;
  showPoweredBy: boolean;
}

interface BrandingContextType {
  branding: BrandingData;
  isLoaded: boolean;
}

const defaultBranding: BrandingData = {
  logoUrl: null,
  primaryColor: '#0B1C3E',
  accentColor: '#00E5FF',
  companyName: 'My Company',
  tagline: null,
  phone: null,
  email: null,
  website: null,
  proposalTitle: 'Investment Proposal',
  showPoweredBy: true,
};

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  isLoaded: false,
});

// Helper to convert hex to HSL string for CSS variables
function hexToHSL(hex: string): string | null {
  hex = hex.replace(/^#/, '');
  if (hex.length !== 6) return null;
  
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { contractor } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [branding, setBranding] = useState<BrandingData>(defaultBranding);

  // Load branding from contractor settings
  useEffect(() => {
    if (contractor) {
      const settings = contractor.settings as any;
      const brandingSettings = settings?.branding || {};
      const companyProfile = settings?.companyProfile || {};

      setBranding({
        logoUrl: contractor.logo_url || brandingSettings.logoUrl || null,
        primaryColor: brandingSettings.primaryColor || defaultBranding.primaryColor,
        accentColor: brandingSettings.accentColor || defaultBranding.accentColor,
        companyName: companyProfile.companyName || contractor.name || defaultBranding.companyName,
        tagline: brandingSettings.tagline || null,
        phone: contractor.primary_contact_phone || companyProfile.phone || null,
        email: contractor.primary_contact_email || companyProfile.email || null,
        website: companyProfile.website || null,
        proposalTitle: brandingSettings.proposalTitle || defaultBranding.proposalTitle,
        showPoweredBy: brandingSettings.showPoweredBy !== false,
      });
      setIsLoaded(true);
    }
  }, [contractor]);

  // Apply CSS variables for brand colors
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply primary color
    if (branding.primaryColor) {
      const primaryHSL = hexToHSL(branding.primaryColor);
      if (primaryHSL) {
        root.style.setProperty('--primary', primaryHSL);
        root.style.setProperty('--sidebar-primary', primaryHSL);
      }
    }

    // Apply accent color
    if (branding.accentColor) {
      const accentHSL = hexToHSL(branding.accentColor);
      if (accentHSL) {
        root.style.setProperty('--accent', accentHSL);
        root.style.setProperty('--sidebar-accent', accentHSL);
      }
    }

    // Cleanup on unmount
    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--sidebar-primary');
      root.style.removeProperty('--sidebar-accent');
    };
  }, [branding.primaryColor, branding.accentColor]);

  return (
    <BrandingContext.Provider value={{ branding, isLoaded }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
