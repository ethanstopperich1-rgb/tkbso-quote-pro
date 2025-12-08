import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Palette, Upload, X, RefreshCw, Check, FileDown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Branding } from '@/types/settings';
import { cn } from '@/lib/utils';
import { pdf } from '@react-pdf/renderer';
import { ProposalPdfDocument } from '@/components/pdf/ProposalPdfDocument';

interface Props {
  data: Branding;
  onChange: (data: Branding) => void;
  contractorId?: string;
  initials: string;
  companyName: string;
}

const PRIMARY_COLORS = [
  { name: 'Navy', value: '#0B1C3E' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Green', value: '#059669' },
  { name: 'Black', value: '#18181B' },
  { name: 'Red', value: '#DC2626' },
];

const ACCENT_COLORS = [
  { name: 'Cyan', value: '#00E5FF' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Gold', value: '#EAB308' },
  { name: 'Pink', value: '#EC4899' },
];

export function BrandingCard({ data, onChange, contractorId, initials, companyName }: Props) {
  const [uploading, setUploading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [customPrimaryActive, setCustomPrimaryActive] = useState(
    !PRIMARY_COLORS.some(c => c.value === data.primaryColor)
  );
  const [customAccentActive, setCustomAccentActive] = useState(
    !ACCENT_COLORS.some(c => c.value === data.accentColor)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generatePreviewPdf = async () => {
    setGeneratingPdf(true);
    try {
      const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const sampleProps = {
        clientName: 'John & Jane Doe',
        address: '123 Sample Street',
        city: 'Orlando',
        state: 'FL',
        zip: '32819',
        date,
        projectType: 'Bathroom',
        summaryBullets: [
          'Full Bathroom Gut Renovation',
          'Custom tile installation throughout wet areas',
          'Frameless glass shower enclosure',
          '48-inch vanity with quartz countertop',
          'Complete plumbing rough-in and fixtures',
        ],
        totalPrice: 24500,
        scopeItems: [
          { category: 'Demo', task: 'Remove existing tile, fixtures, and vanity', included: true },
          { category: 'Plumbing', task: 'Rough-in for shower, toilet, and vanity', included: true },
          { category: 'Tile', task: 'Wall tile - 128 sqft, Floor tile - 40 sqft', included: true },
          { category: 'Glass', task: 'Frameless glass shower enclosure', included: true },
          { category: 'Vanity', task: '48" vanity with quartz top and undermount sink', included: true },
          { category: 'Paint', task: 'Full bathroom paint and finishing', included: true },
        ],
        paymentMilestones: { deposit: 0.65, progress: 0.25, final: 0.10 },
        estimatedDays: 14,
        contractorName: companyName || 'Your Company Name',
        contractorPhone: '(407) 555-1234',
        contractorEmail: 'info@yourcompany.com',
        logoUrl: data.logoUrl || undefined,
        headerTitle: data.headerTitle || companyName || 'Your Company Name',
        tagline: data.tagline || undefined,
        footerDisclaimer: data.pdfFooterDisclaimer || undefined,
        showPoweredBy: data.showPoweredBy,
      };

      const blob = await pdf(<ProposalPdfDocument {...sampleProps} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Preview PDF generated!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate preview PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const update = (field: keyof Branding, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contractorId) return;

    const validMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/x-png'];
    const validExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
    const fileExtension = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
    
    const isValidType = validMimeTypes.includes(file.type) || validExtensions.includes(fileExtension);
    
    if (!isValidType) {
      toast.error('Please upload a PNG, JPG, or SVG file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo.${fileExt}`;
      const filePath = `${contractorId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('contractor-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('contractor-assets')
        .getPublicUrl(filePath);

      update('logoUrl', urlData.publicUrl);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    update('logoUrl', '');
  };

  const selectPrimaryColor = (color: string, isPreset: boolean) => {
    update('primaryColor', color);
    setCustomPrimaryActive(!isPreset);
  };

  const selectAccentColor = (color: string, isPreset: boolean) => {
    update('accentColor', color);
    setCustomAccentActive(!isPreset);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Main Branding Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 mb-1">
            <Palette className="h-5 w-5 text-cyan-500" />
            <h3 className="text-lg font-bold text-[#0B1C3E]">Branding</h3>
          </div>
          <p className="text-sm text-slate-500">Customize how your quotes and proposals look</p>
        </div>
        
        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Circular Logo Upload */}
          <div className="space-y-3">
            <Label className="text-slate-700 text-sm">Company Logo</Label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'relative w-24 h-24 rounded-full cursor-pointer transition-all overflow-hidden',
                  'border-2 border-dashed border-slate-300 hover:border-cyan-400 hover:bg-cyan-50/50',
                  data.logoUrl && 'border-solid border-slate-200'
                )}
              >
                {data.logoUrl ? (
                  <>
                    <img
                      src={data.logoUrl}
                      alt="Company logo"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLogo();
                      }}
                      className="absolute top-0 right-0 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200">
                    <span className="text-2xl font-bold text-slate-500">{initials}</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="border-slate-200"
                >
                  {uploading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {data.logoUrl ? 'Change Logo' : 'Upload Logo'}
                </Button>
                <p className="text-xs text-slate-400 mt-2">PNG, JPG, or SVG. Max 5MB.</p>
              </div>
            </div>
          </div>

          {/* Primary Color Swatches */}
          <div className="space-y-3">
            <Label className="text-slate-700 text-sm">Primary Color</Label>
            <p className="text-xs text-slate-400 -mt-1">Used for headers and titles</p>
            <div className="flex flex-wrap gap-3">
              {PRIMARY_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => selectPrimaryColor(color.value, true)}
                  className={cn(
                    'group relative w-10 h-10 rounded-full transition-all',
                    'ring-2 ring-offset-2',
                    data.primaryColor === color.value && !customPrimaryActive
                      ? 'ring-cyan-500'
                      : 'ring-transparent hover:ring-slate-300'
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {data.primaryColor === color.value && !customPrimaryActive && (
                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                  )}
                </button>
              ))}
              
              {/* Custom Color */}
              <div className="relative">
                <input
                  type="color"
                  value={customPrimaryActive ? data.primaryColor : '#888888'}
                  onChange={(e) => selectPrimaryColor(e.target.value, false)}
                  className="absolute inset-0 w-10 h-10 opacity-0 cursor-pointer"
                />
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    'ring-2 ring-offset-2',
                    customPrimaryActive
                      ? 'ring-cyan-500'
                      : 'ring-transparent hover:ring-slate-300',
                    'bg-gradient-to-br from-rose-400 via-purple-400 to-cyan-400'
                  )}
                >
                  {customPrimaryActive && (
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white"
                      style={{ backgroundColor: data.primaryColor }}
                    />
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Selected: <span className="font-mono">{data.primaryColor}</span>
            </p>
          </div>

          {/* Accent Color Swatches */}
          <div className="space-y-3">
            <Label className="text-slate-700 text-sm">Accent Color</Label>
            <p className="text-xs text-slate-400 -mt-1">Used for prices and highlights</p>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => selectAccentColor(color.value, true)}
                  className={cn(
                    'group relative w-10 h-10 rounded-full transition-all',
                    'ring-2 ring-offset-2',
                    data.accentColor === color.value && !customAccentActive
                      ? 'ring-cyan-500'
                      : 'ring-transparent hover:ring-slate-300'
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {data.accentColor === color.value && !customAccentActive && (
                    <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                  )}
                </button>
              ))}
              
              {/* Custom Accent Color */}
              <div className="relative">
                <input
                  type="color"
                  value={customAccentActive ? data.accentColor : '#888888'}
                  onChange={(e) => selectAccentColor(e.target.value, false)}
                  className="absolute inset-0 w-10 h-10 opacity-0 cursor-pointer"
                />
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    'ring-2 ring-offset-2',
                    customAccentActive
                      ? 'ring-cyan-500'
                      : 'ring-transparent hover:ring-slate-300',
                    'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400'
                  )}
                >
                  {customAccentActive && (
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white"
                      style={{ backgroundColor: data.accentColor }}
                    />
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Selected: <span className="font-mono">{data.accentColor}</span>
            </p>
          </div>

          {/* Quote Header */}
          <div className="space-y-2">
            <Label htmlFor="headerTitle" className="text-slate-700 text-sm">Quote Header Title</Label>
            <Input
              id="headerTitle"
              value={data.headerTitle}
              onChange={(e) => update('headerTitle', e.target.value)}
              placeholder="THE KITCHEN AND BATH STORE OF ORLANDO"
              className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
            />
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <Label htmlFor="tagline" className="text-slate-700 text-sm">Company Tagline (optional)</Label>
            <Input
              id="tagline"
              value={data.tagline}
              onChange={(e) => update('tagline', e.target.value)}
              placeholder="e.g., Orlando's Premier Remodeling Partner"
              className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
            />
          </div>

          {/* Proposal Title */}
          <div className="space-y-2">
            <Label htmlFor="proposalTitle" className="text-slate-700 text-sm">Proposal Title</Label>
            <Input
              id="proposalTitle"
              value={data.proposalTitle}
              onChange={(e) => update('proposalTitle', e.target.value)}
              placeholder="Investment Proposal"
              className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
            />
            <p className="text-xs text-slate-400">Change to "Quote", "Estimate", "Proposal", etc.</p>
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <Label htmlFor="signatureText" className="text-slate-700 text-sm">Signature Text</Label>
            <Input
              id="signatureText"
              value={data.signatureText}
              onChange={(e) => update('signatureText', e.target.value)}
              placeholder="John Smith, Owner"
              className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
            />
          </div>

          {/* Footer Disclaimer */}
          <div className="space-y-2">
            <Label htmlFor="pdfFooterDisclaimer" className="text-slate-700 text-sm">PDF Footer Disclaimer</Label>
            <Textarea
              id="pdfFooterDisclaimer"
              value={data.pdfFooterDisclaimer}
              onChange={(e) => update('pdfFooterDisclaimer', e.target.value)}
              placeholder="Prices valid for 30 days. Subject to site inspection..."
              rows={3}
              className="border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Powered By Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label className="text-slate-700 text-sm font-medium">Show "Powered by EstimAIte"</Label>
              <p className="text-xs text-slate-400 mt-0.5">Display EstimAIte branding in PDF footer</p>
            </div>
            <Switch
              checked={data.showPoweredBy}
              onCheckedChange={(checked) => update('showPoweredBy', checked)}
            />
          </div>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-[#0B1C3E]">Live Preview</h3>
          <p className="text-sm text-slate-500">How your PDF header will look</p>
        </div>
        
        <div className="p-5">
          {/* Mini PDF Preview */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner">
            {/* PDF Header Mockup */}
            <div 
              className="p-6 text-center"
              style={{ backgroundColor: data.primaryColor + '10' }}
            >
              {/* Logo */}
              {data.logoUrl ? (
                <img 
                  src={data.logoUrl} 
                  alt="Logo" 
                  className="h-16 w-auto mx-auto mb-3 object-contain"
                />
              ) : (
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: data.primaryColor }}
                >
                  {initials}
                </div>
              )}
              
              {/* Company Name */}
              <h2 
                className="text-lg font-bold tracking-wide"
                style={{ color: data.primaryColor }}
              >
                {data.headerTitle || companyName || 'YOUR COMPANY NAME'}
              </h2>
              {data.tagline && (
                <p className="text-sm text-slate-500 mt-1">{data.tagline}</p>
              )}
            </div>
            
            {/* Fake Content */}
            <div className="p-4 space-y-3">
              <div className="text-center mb-4">
                <p className="text-xs text-slate-400 uppercase tracking-wide">{data.proposalTitle || 'Investment Proposal'}</p>
                <p className="text-lg font-bold text-slate-900">John & Jane Doe</p>
              </div>
              
              <div className="h-2 bg-slate-100 rounded w-full" />
              <div className="h-2 bg-slate-100 rounded w-4/5" />
              <div className="h-2 bg-slate-100 rounded w-3/5" />
              
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Investment</span>
                  <span className="font-bold" style={{ color: data.accentColor }}>$24,500</span>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-slate-50 px-4 py-3 text-center">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {data.pdfFooterDisclaimer || 'Your legal disclaimer will appear here...'}
              </p>
              {data.showPoweredBy && (
                <p className="text-[9px] text-slate-300 mt-1">Powered by EstimAIte</p>
              )}
            </div>
          </div>

          {/* Preview PDF Button */}
          <Button
            onClick={generatePreviewPdf}
            disabled={generatingPdf}
            className="w-full mt-4"
            style={{ backgroundColor: data.primaryColor }}
          >
            {generatingPdf ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            {generatingPdf ? 'Generating...' : 'Preview Sample PDF'}
          </Button>
        </div>
      </div>
    </div>
  );
}
