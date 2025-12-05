import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Building2, User, Phone, Mail, MapPin } from 'lucide-react';
import { EstimAIteLogo } from '@/components/EstimAIteLogo';
import { defaultSettings } from '@/types/settings';

// Extract dominant color from an image
function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('#0EA5E9'); // Default sky blue
        return;
      }
      
      // Scale down for performance
      const scale = Math.min(1, 100 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colorCounts: Record<string, number> = {};
      
      // Sample pixels and count colors (skip very light/dark colors)
      for (let i = 0; i < imageData.length; i += 16) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];
        
        // Skip transparent, very light, or very dark pixels
        if (a < 128) continue;
        const brightness = (r + g + b) / 3;
        if (brightness < 30 || brightness > 225) continue;
        
        // Round to reduce variations
        const key = `${Math.round(r / 10) * 10},${Math.round(g / 10) * 10},${Math.round(b / 10) * 10}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
      }
      
      // Find most common color
      let maxCount = 0;
      let dominantColor = '14,165,233'; // Default sky-500
      
      for (const [color, count] of Object.entries(colorCounts)) {
        if (count > maxCount) {
          maxCount = count;
          dominantColor = color;
        }
      }
      
      const [r, g, b] = dominantColor.split(',').map(Number);
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      resolve(hex);
    };
    
    img.onerror = () => {
      resolve('#0EA5E9'); // Default sky blue on error
    };
    
    img.src = imageUrl;
  });
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, contractor, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [extractedColor, setExtractedColor] = useState<string>('#0EA5E9');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    serviceArea: '',
    logoUrl: '',
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contractor) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    setIsUploadingLogo(true);
    
    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      
      // Extract color from preview
      const color = await extractDominantColor(previewUrl);
      setExtractedColor(color);
      
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${contractor.id}/logo.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) {
        // If bucket doesn't exist, try public bucket
        const { error: publicError } = await supabase.storage
          .from('public')
          .upload(`logos/${fileName}`, file, { upsert: true });
        
        if (publicError) {
          console.error('Upload error:', publicError);
          // Still use the preview for now
          setFormData(prev => ({ ...prev, logoUrl: previewUrl }));
          toast.success('Logo selected! Color extracted.');
          return;
        }
        
        const { data: publicUrl } = supabase.storage
          .from('public')
          .getPublicUrl(`logos/${fileName}`);
        
        setFormData(prev => ({ ...prev, logoUrl: publicUrl.publicUrl }));
      } else {
        const { data: urlData } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);
        
        setFormData(prev => ({ ...prev, logoUrl: urlData.publicUrl }));
      }
      
      toast.success('Logo uploaded! Brand color extracted.');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !contractor) {
      toast.error('Please sign in first');
      return;
    }
    
    if (!formData.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Build updated settings
      const currentSettings = contractor.settings || defaultSettings;
      const updatedSettings = {
        ...currentSettings,
        companyProfile: {
          ...currentSettings.companyProfile,
          companyName: formData.companyName,
          ownerFirst: formData.contactName.split(' ')[0] || '',
          ownerLast: formData.contactName.split(' ').slice(1).join(' ') || '',
          phone: formData.contactPhone,
          email: formData.contactEmail,
        },
        branding: {
          ...currentSettings.branding,
          logoUrl: formData.logoUrl || logoPreview || '',
          primaryColor: extractedColor,
        },
        onboardingCompleted: true,
      };
      
      // Update contractor info
      const { error: contractorError } = await supabase
        .from('contractors')
        .update({
          name: formData.companyName,
          primary_contact_name: formData.contactName,
          primary_contact_email: formData.contactEmail,
          primary_contact_phone: formData.contactPhone,
          service_area: formData.serviceArea,
          logo_url: formData.logoUrl || logoPreview || null,
          settings: JSON.parse(JSON.stringify(updatedSettings)),
        })
        .eq('id', contractor.id);
      
      if (contractorError) throw contractorError;
      
      // Update profile name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.contactName,
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      await refreshProfile();
      toast.success('Welcome! Your profile is set up.');
      navigate('/estimates');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8">
      {/* Logo */}
      <div className="mb-6">
        <EstimAIteLogo size="lg" />
      </div>

      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Welcome! Let's set up your profile</h1>
        <p className="text-slate-500">Enter your company details to get started</p>
      </div>

      {/* Form */}
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Company Logo</Label>
            <div 
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {logoPreview ? (
                <div className="space-y-3">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="h-16 w-auto mx-auto object-contain"
                  />
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                    <span>Brand color:</span>
                    <div 
                      className="w-6 h-6 rounded-full border border-slate-200" 
                      style={{ backgroundColor: extractedColor }}
                    />
                    <span className="font-mono text-xs">{extractedColor}</span>
                  </div>
                  <p className="text-sm text-slate-500">Click to change</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-slate-400" />
                  <p className="text-sm text-slate-600">
                    {isUploadingLogo ? 'Uploading...' : 'Click to upload your logo'}
                  </p>
                  <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-slate-700 font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company Name *
            </Label>
            <Input
              id="companyName"
              placeholder="Your Company Name"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              required
              className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:ring-sky-500 transition-colors"
            />
          </div>
          
          {/* Contact Name */}
          <div className="space-y-2">
            <Label htmlFor="contactName" className="text-slate-700 font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Name *
            </Label>
            <Input
              id="contactName"
              placeholder="John Smith"
              value={formData.contactName}
              onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
              required
              className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:ring-sky-500 transition-colors"
            />
          </div>
          
          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="text-slate-700 font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Email
            </Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="you@company.com"
              value={formData.contactEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:ring-sky-500 transition-colors"
            />
          </div>
          
          {/* Contact Phone */}
          <div className="space-y-2">
            <Label htmlFor="contactPhone" className="text-slate-700 font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="contactPhone"
              type="tel"
              placeholder="(407) 555-0123"
              value={formData.contactPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
              className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:ring-sky-500 transition-colors"
            />
          </div>
          
          {/* Service Area */}
          <div className="space-y-2">
            <Label htmlFor="serviceArea" className="text-slate-700 font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Service Area
            </Label>
            <Input
              id="serviceArea"
              placeholder="Orlando, FL"
              value={formData.serviceArea}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceArea: e.target.value }))}
              className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 focus:ring-sky-500 transition-colors"
            />
          </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-base shadow-sm transition-colors" 
              disabled={isSubmitting || isUploadingLogo}
            >
              {isSubmitting ? 'Setting up...' : 'Get Started'}
            </Button>
          </div>
          
          <p className="text-sm text-slate-500 text-center">
            Your pricing is pre-configured with industry defaults. Customize anytime in Settings.
          </p>
        </form>
      </div>
    </div>
  );
}