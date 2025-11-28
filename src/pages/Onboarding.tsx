import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, contractor, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    serviceArea: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !contractor) {
      toast.error('Please sign in first');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update contractor info
      const { error: contractorError } = await supabase
        .from('contractors')
        .update({
          name: formData.companyName,
          primary_contact_name: formData.contactName,
          primary_contact_email: formData.contactEmail,
          primary_contact_phone: formData.contactPhone,
          service_area: formData.serviceArea,
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
      toast.success('Company profile saved!');
      navigate('/');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-display">Welcome to TKBSO Estimator</CardTitle>
          <CardDescription>
            Let's set up your company profile to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                placeholder="The Kitchen & Bath Store of Orlando"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactName">Your Name *</Label>
              <Input
                id="contactName"
                placeholder="John Smith"
                value={formData.contactName}
                onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="john@tkbso.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone Number</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="(407) 555-0123"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceArea">Service Area</Label>
              <Input
                id="serviceArea"
                placeholder="Orlando, FL"
                value={formData.serviceArea}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceArea: e.target.value }))}
              />
            </div>
            
            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Your pricing allowances are pre-configured with TKBSO-style defaults. You can customize them anytime.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
