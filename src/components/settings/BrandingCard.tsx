import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Palette, Upload, X, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Branding } from '@/types/settings';

interface Props {
  data: Branding;
  onChange: (data: Branding) => void;
  contractorId?: string;
}

export function BrandingCard({ data, onChange, contractorId }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof Branding, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contractorId) return;

    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <CardTitle>Branding</CardTitle>
        </div>
        <CardDescription>
          Customize how your quotes and proposals look
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-3">
          <Label>Company Logo</Label>
          <div className="flex items-start gap-4">
            {data.logoUrl ? (
              <div className="relative">
                <img
                  src={data.logoUrl}
                  alt="Company logo"
                  className="h-20 w-auto max-w-[200px] object-contain border rounded-lg p-2 bg-white"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={removeLogo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="h-20 w-40 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30">
                <span className="text-xs text-muted-foreground">No logo</span>
              </div>
            )}
            <div>
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
              >
                {uploading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {data.logoUrl ? 'Change Logo' : 'Upload Logo'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or SVG. Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Brand Primary Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={data.primaryColor}
                onChange={(e) => update('primaryColor', e.target.value)}
                className="w-14 h-10 p-1 cursor-pointer"
              />
              <Input
                id="primaryColor"
                value={data.primaryColor}
                onChange={(e) => update('primaryColor', e.target.value)}
                placeholder="#1e3a8a"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={data.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
                className="w-14 h-10 p-1 cursor-pointer"
              />
              <Input
                id="accentColor"
                value={data.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Quote Header */}
        <div className="space-y-2">
          <Label htmlFor="headerTitle">Quote Header Title</Label>
          <Input
            id="headerTitle"
            value={data.headerTitle}
            onChange={(e) => update('headerTitle', e.target.value)}
            placeholder="THE KITCHEN AND BATH STORE OF ORLANDO"
          />
          <p className="text-xs text-muted-foreground">
            This title appears at the top of your proposal PDFs
          </p>
        </div>

        {/* Signature */}
        <div className="space-y-2">
          <Label htmlFor="signatureText">Signature Text for Proposals</Label>
          <Input
            id="signatureText"
            value={data.signatureText}
            onChange={(e) => update('signatureText', e.target.value)}
            placeholder="John Smith, Owner"
          />
        </div>

        {/* Footer Disclaimer */}
        <div className="space-y-2">
          <Label htmlFor="pdfFooterDisclaimer">PDF Footer Disclaimer</Label>
          <Textarea
            id="pdfFooterDisclaimer"
            value={data.pdfFooterDisclaimer}
            onChange={(e) => update('pdfFooterDisclaimer', e.target.value)}
            placeholder="Prices valid for 30 days. Subject to site inspection..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
