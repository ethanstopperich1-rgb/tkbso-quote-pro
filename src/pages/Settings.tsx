import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save, X } from 'lucide-react';
import { ContractorSettings, defaultSettings } from '@/types/settings';
import { CompanyProfileCard } from '@/components/settings/CompanyProfileCard';
import { BrandingCard } from '@/components/settings/BrandingCard';
import { LicensesCard } from '@/components/settings/LicensesCard';
import { InsuranceCard } from '@/components/settings/InsuranceCard';
import { DefaultsCard } from '@/components/settings/DefaultsCard';
import { ProductMappingCard } from '@/components/settings/ProductMappingCard';

export default function Settings() {
  const { contractor } = useAuth();
  const [settings, setSettings] = useState<ContractorSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<ContractorSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  useEffect(() => {
    async function fetchSettings() {
      if (!contractor?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('contractors')
          .select('settings, name, primary_contact_email, primary_contact_phone, primary_contact_name')
          .eq('id', contractor.id)
          .single();
        
        if (error) throw error;
        
        // Merge stored settings with defaults
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

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your company profile, branding, and business defaults
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto gap-1 bg-muted p-1 rounded-lg">
          <TabsTrigger value="company" className="data-[state=active]:bg-background">
            Company
          </TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-background">
            Branding
          </TabsTrigger>
          <TabsTrigger value="licenses" className="data-[state=active]:bg-background">
            Licenses
          </TabsTrigger>
          <TabsTrigger value="insurance" className="data-[state=active]:bg-background">
            Insurance
          </TabsTrigger>
          <TabsTrigger value="defaults" className="data-[state=active]:bg-background">
            Defaults
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-background">
            Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <CompanyProfileCard
            data={settings.companyProfile}
            onChange={(value) => updateSettings('companyProfile', value)}
          />
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <BrandingCard
            data={settings.branding}
            onChange={(value) => updateSettings('branding', value)}
            contractorId={contractor?.id}
          />
        </TabsContent>

        <TabsContent value="licenses" className="space-y-6">
          <LicensesCard
            data={settings.licenses}
            onChange={(value) => updateSettings('licenses', value)}
          />
        </TabsContent>

        <TabsContent value="insurance" className="space-y-6">
          <InsuranceCard
            data={settings.insurance}
            onChange={(value) => updateSettings('insurance', value)}
            contractorId={contractor?.id}
          />
        </TabsContent>

        <TabsContent value="defaults" className="space-y-6">
          <DefaultsCard
            data={settings.defaults}
            onChange={(value) => updateSettings('defaults', value)}
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductMappingCard />
        </TabsContent>
      </Tabs>

      {/* Sticky Save Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <p className="text-sm text-muted-foreground">You have unsaved changes</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleDiscard} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Discard
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
