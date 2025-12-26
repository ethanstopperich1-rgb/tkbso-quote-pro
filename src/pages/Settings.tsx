import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save, X, Building2, Palette, FileCheck, Shield, ChevronRight, DollarSign, CreditCard, Settings2 } from 'lucide-react';
import { ContractorSettings, defaultSettings } from '@/types/settings';
import { CompanyProfileCard } from '@/components/settings/CompanyProfileCard';
import { PaymentTermsCard } from '@/components/settings/PaymentTermsCard';
import { EstimateDefaultsCard } from '@/components/settings/EstimateDefaultsCard';
import { BrandingCard } from '@/components/settings/BrandingCard';
import { LicensesCard } from '@/components/settings/LicensesCard';
import { InsuranceCard } from '@/components/settings/InsuranceCard';
import { MarginStrategyCard } from '@/components/settings/MarginStrategyCard';
import { PricingModeCard } from '@/components/settings/PricingModeCard';
import { AccountBillingCard } from '@/components/settings/AccountBillingCard';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'company', label: 'Company Profile', icon: Building2 },
  { id: 'pricing', label: 'Pricing & Margins', icon: DollarSign },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'licenses', label: 'Licenses', icon: FileCheck },
  { id: 'insurance', label: 'Insurance', icon: Shield },
  { id: 'billing', label: 'Account & Billing', icon: CreditCard },
];

export default function Settings() {
  const { contractor, profile } = useAuth();
  const [settings, setSettings] = useState<ContractorSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<ContractorSettings>(defaultSettings);
  const [pricingMode, setPricingMode] = useState<string>('ic_and_cp');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  useEffect(() => {
    async function fetchSettings() {
      if (!contractor?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('contractors')
          .select('settings, name, primary_contact_email, primary_contact_phone, primary_contact_name, pricing_mode')
          .eq('id', contractor.id)
          .single();
        
        if (error) throw error;
        
        setPricingMode(data?.pricing_mode || 'ic_and_cp');
        
        const storedSettings = (data?.settings || {}) as Partial<ContractorSettings>;
        const mergedSettings: ContractorSettings = {
          companyProfile: {
            ...defaultSettings.companyProfile,
            companyName: data?.name || '',
            email: data?.primary_contact_email || '',
            phone: data?.primary_contact_phone || '',
            ...(storedSettings.companyProfile || {}),
          },
          branding: { ...defaultSettings.branding, ...(storedSettings.branding || {}) },
          licenses: storedSettings.licenses || [],
          insurance: { ...defaultSettings.insurance, ...(storedSettings.insurance || {}) },
          defaults: { ...defaultSettings.defaults, ...(storedSettings.defaults || {}) },
        };
        
        setSettings(mergedSettings);
        setOriginalSettings(mergedSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSettings();
  }, [contractor?.id]);

  const handleSave = async () => {
    if (!contractor?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('contractors')
        .update({
          settings: JSON.parse(JSON.stringify(settings)),
          name: settings.companyProfile.companyName,
          primary_contact_email: settings.companyProfile.email,
          primary_contact_phone: settings.companyProfile.phone,
          primary_contact_name: `${settings.companyProfile.ownerFirst} ${settings.companyProfile.ownerLast}`.trim(),
        })
        .eq('id', contractor.id);
      
      if (error) throw error;
      
      setOriginalSettings(settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setSettings(originalSettings);
    toast.info('Changes discarded');
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const updateSettings = (section: keyof ContractorSettings, value: any) => {
    setSettings(prev => ({ ...prev, [section]: value }));
  };

  // Get user initials for logo placeholder
  const getInitials = () => {
    const firstName = settings.companyProfile.ownerFirst || profile?.name?.split(' ')[0] || '';
    const lastName = settings.companyProfile.ownerLast || profile?.name?.split(' ')[1] || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'CO';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#F8FAFC]/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1C3E] tracking-tight">Settings</h1>
              <p className="text-sm text-slate-500 mt-1">Manage your company profile and preferences</p>
            </div>
            {hasChanges && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDiscard} disabled={saving} size="sm" className="border-slate-200">
                  <X className="h-4 w-4 mr-2" />
                  Discard
                </Button>
                <Button onClick={handleSave} disabled={saving} size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Vertical Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-2 sticky top-28">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                    activeTab === tab.id
                      ? 'bg-slate-100 text-[#0B1C3E] font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <tab.icon className={cn(
                    'h-5 w-5',
                    activeTab === tab.id ? 'text-cyan-500' : 'text-slate-400'
                  )} />
                  <span className="flex-1">{tab.label}</span>
                  {activeTab === tab.id && (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="flex-1 space-y-6">
            {activeTab === 'company' && (
              <>
                <CompanyProfileCard
                  data={settings.companyProfile}
                  onChange={(value) => updateSettings('companyProfile', value)}
                />
                <PaymentTermsCard
                  data={settings.defaults}
                  onChange={(value) => updateSettings('defaults', value)}
                />
                <EstimateDefaultsCard
                  data={settings.defaults}
                  onChange={(value) => updateSettings('defaults', value)}
                />
              </>
            )}

            {activeTab === 'pricing' && contractor?.id && (
              <>
                <PricingModeCard 
                  contractorId={contractor.id} 
                  initialMode={pricingMode}
                />
                <MarginStrategyCard contractorId={contractor.id} />
              </>
            )}

            {activeTab === 'branding' && (
              <BrandingCard
                data={settings.branding}
                onChange={(value) => updateSettings('branding', value)}
                contractorId={contractor?.id}
                initials={getInitials()}
                companyName={settings.companyProfile.companyName}
              />
            )}

            {activeTab === 'licenses' && (
              <LicensesCard
                data={settings.licenses}
                onChange={(value) => updateSettings('licenses', value)}
              />
            )}

            {activeTab === 'insurance' && (
              <InsuranceCard
                data={settings.insurance}
                onChange={(value) => updateSettings('insurance', value)}
                contractorId={contractor?.id}
              />
            )}

            {activeTab === 'billing' && contractor?.id && (
              <AccountBillingCard contractorId={contractor.id} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
