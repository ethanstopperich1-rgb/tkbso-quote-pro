import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Building2, User, Phone, MapPin, ArrowLeft, Check } from 'lucide-react';
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
        resolve('#0EA5E9');
        return;
      }
      
      const scale = Math.min(1, 100 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colorCounts: Record<string, number> = {};
      
      for (let i = 0; i < imageData.length; i += 16) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];
        
        if (a < 128) continue;
        const brightness = (r + g + b) / 3;
        if (brightness < 30 || brightness > 225) continue;
        
        const key = `${Math.round(r / 10) * 10},${Math.round(g / 10) * 10},${Math.round(b / 10) * 10}`;
        colorCounts[key] = (colorCounts[key] || 0) + 1;
      }
      
      let maxCount = 0;
      let dominantColor = '14,165,233';
      
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
      resolve('#0EA5E9');
    };
    
    img.src = imageUrl;
  });
}

type ProjectType = 'kitchen' | 'bathroom' | 'full-home' | 'additions' | 'basement' | 'commercial';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, contractor, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [extractedColor, setExtractedColor] = useState<string>('#0EA5E9');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    logoUrl: '',
  });

  const [selectedTypes, setSelectedTypes] = useState<ProjectType[]>([]);
  const [teamSize, setTeamSize] = useState<string>('');

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contractor) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    setIsUploadingLogo(true);
    
    try {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      
      const color = await extractDominantColor(previewUrl);
      setExtractedColor(color);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${contractor.id}/logo.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) {
        const { error: publicError } = await supabase.storage
          .from('public')
          .upload(`logos/${fileName}`, file, { upsert: true });
        
        if (publicError) {
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

  const handleTypeToggle = (type: ProjectType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = () => {
    if (selectedTypes.length === 0) {
      toast.error('Please select at least one project type');
      return;
    }
    handleFinalSubmit();
  };

  const handleFinalSubmit = async () => {
    if (!user || !contractor) {
      toast.error('Please sign in first');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const currentSettings = contractor.settings || defaultSettings;
      const updatedSettings = {
        ...currentSettings,
        companyProfile: {
          ...currentSettings.companyProfile,
          companyName: formData.companyName,
          ownerFirst: formData.firstName,
          ownerLast: formData.lastName,
          phone: formData.phone,
        },
        branding: {
          ...currentSettings.branding,
          logoUrl: formData.logoUrl || logoPreview || '',
          primaryColor: extractedColor,
        },
        projectTypes: selectedTypes,
        teamSize: teamSize,
        onboardingCompleted: true,
      };
      
      const { error: contractorError } = await supabase
        .from('contractors')
        .update({
          name: formData.companyName,
          primary_contact_name: `${formData.firstName} ${formData.lastName}`.trim(),
          primary_contact_phone: formData.phone,
          service_area: formData.address,
          logo_url: formData.logoUrl || logoPreview || null,
          settings: JSON.parse(JSON.stringify(updatedSettings)),
        })
        .eq('id', contractor.id);
      
      if (contractorError) throw contractorError;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
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

  const projectTypes = [
    { id: 'kitchen' as ProjectType, icon: '🍳', label: 'Kitchen Remodels', popular: true },
    { id: 'bathroom' as ProjectType, icon: '🛁', label: 'Bathroom Remodels', popular: true },
    { id: 'full-home' as ProjectType, icon: '🏠', label: 'Full Home Renovations' },
    { id: 'additions' as ProjectType, icon: '🔨', label: 'Additions & Extensions' },
    { id: 'basement' as ProjectType, icon: '🚪', label: 'Basement Finishing' },
    { id: 'commercial' as ProjectType, icon: '🏢', label: 'Commercial Projects' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600">Step {step} of 2</span>
            <span className="text-sm text-slate-500">{step === 1 ? 'About 2 minutes' : 'Almost done!'}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500" 
              style={{ width: `${step * 50}%` }}
            />
          </div>
        </div>

        {/* Step 1: Company Info */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold mb-2 text-slate-900">Tell us about your business</h2>
            <p className="text-slate-600 mb-8">This helps us customize EstimAIte for your workflow</p>

            <form onSubmit={handleStep1Submit} className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Company Logo</Label>
                <div 
                  className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/50 transition-colors"
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
              <div>
                <Label htmlFor="companyName" className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  required
                  placeholder="The Kitchen and Bath Store"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="h-12 border-2 border-slate-300 rounded-lg focus:border-cyan-400 focus:ring-cyan-400"
                />
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    required
                    placeholder="Ethan"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="h-12 border-2 border-slate-300 rounded-lg focus:border-cyan-400 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700 mb-2">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    required
                    placeholder="Smith"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="h-12 border-2 border-slate-300 rounded-lg focus:border-cyan-400 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  placeholder="(407) 819-5809"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="h-12 border-2 border-slate-300 rounded-lg focus:border-cyan-400 focus:ring-cyan-400"
                />
              </div>

              {/* Business Address */}
              <div>
                <Label htmlFor="address" className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Business Address
                </Label>
                <Input
                  id="address"
                  placeholder="1234 Main St, Orlando, FL 32801"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="h-12 border-2 border-slate-300 rounded-lg focus:border-cyan-400 focus:ring-cyan-400"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Optional - used for proposals and invoices
                </p>
              </div>

              {/* Submit */}
              <Button 
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 rounded-lg font-bold text-lg hover:shadow-lg transition-all"
              >
                Continue →
              </Button>
            </form>

            <button 
              onClick={() => setStep(2)}
              className="w-full text-center text-slate-500 text-sm mt-4 hover:text-slate-700"
            >
              Skip for now →
            </button>
          </div>
        )}

        {/* Step 2: Project Types */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold mb-2 text-slate-900">What type of projects do you do?</h2>
            <p className="text-slate-600 mb-8">Select all that apply - we'll customize your pricing templates</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {projectTypes.map(type => (
                <label 
                  key={type.id}
                  className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all hover:border-cyan-400 ${
                    selectedTypes.includes(type.id) 
                      ? 'border-cyan-400 bg-cyan-50' 
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {type.popular && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                      POPULAR
                    </span>
                  )}
                  <input 
                    type="checkbox"
                    checked={selectedTypes.includes(type.id)}
                    onChange={() => handleTypeToggle(type.id)}
                    className="sr-only"
                  />
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <p className="font-semibold text-slate-900">{type.label}</p>
                  {selectedTypes.includes(type.id) && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </label>
              ))}
            </div>

            {/* Team Size */}
            <div className="mb-8">
              <Label className="block text-sm font-semibold text-slate-700 mb-3">
                How many people on your team?
              </Label>
              <div className="grid grid-cols-4 gap-3">
                {['Just me', '2-5', '6-10', '11+'].map(size => (
                  <button 
                    key={size}
                    type="button"
                    onClick={() => setTeamSize(size)}
                    className={`py-3 rounded-lg font-semibold transition-all ${
                      teamSize === size
                        ? 'bg-cyan-400 text-slate-900'
                        : 'border-2 border-slate-300 text-slate-700 hover:border-cyan-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
                className="px-6 h-12 border-2 border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Button 
                onClick={handleStep2Submit}
                disabled={selectedTypes.length === 0 || isSubmitting}
                className="flex-1 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Setting up...' : 'Get Started →'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
