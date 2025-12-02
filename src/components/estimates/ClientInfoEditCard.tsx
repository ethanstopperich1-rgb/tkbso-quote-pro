import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Phone, Mail, MapPin, Pencil, X, Check } from 'lucide-react';
import { Estimate } from '@/types/database';

interface ClientInfoEditCardProps {
  estimate: Estimate;
  onUpdate: (updated: Partial<Estimate>) => void;
}

export function ClientInfoEditCard({ estimate, onUpdate }: ClientInfoEditCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    client_name: estimate.client_name || '',
    client_phone: estimate.client_phone || '',
    client_email: estimate.client_email || '',
    property_address: estimate.property_address || '',
    city: estimate.city || '',
    state: estimate.state || '',
    zip: estimate.zip || '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('estimates')
        .update(formData)
        .eq('id', estimate.id);

      if (error) throw error;

      onUpdate(formData);
      setEditing(false);
      toast.success('Client info updated!');
    } catch (error) {
      console.error('Error updating client info:', error);
      toast.error('Failed to update client info');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      client_name: estimate.client_name || '',
      client_phone: estimate.client_phone || '',
      client_email: estimate.client_email || '',
      property_address: estimate.property_address || '',
      city: estimate.city || '',
      state: estimate.state || '',
      zip: estimate.zip || '',
    });
    setEditing(false);
  };

  const fullAddress = [
    estimate.property_address,
    estimate.city,
    estimate.state,
    estimate.zip,
  ].filter(Boolean).join(', ');

  if (editing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Information
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleCancel} disabled={saving}>
              <X className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSave} disabled={saving}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="client_name" className="text-xs">Name</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              placeholder="Client name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client_phone" className="text-xs">Phone</Label>
            <Input
              id="client_phone"
              value={formData.client_phone}
              onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
              placeholder="Phone number"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client_email" className="text-xs">Email</Label>
            <Input
              id="client_email"
              type="email"
              value={formData.client_email}
              onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
              placeholder="Email address"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="property_address" className="text-xs">Address</Label>
            <Input
              id="property_address"
              value={formData.property_address}
              onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state" className="text-xs">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zip" className="text-xs">ZIP</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                placeholder="ZIP"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Client Information
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setEditing(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {estimate.client_name && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{estimate.client_name}</span>
          </div>
        )}
        {estimate.client_email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{estimate.client_email}</span>
          </div>
        )}
        {estimate.client_phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{estimate.client_phone}</span>
          </div>
        )}
        {fullAddress && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span>{fullAddress}</span>
          </div>
        )}
        {!estimate.client_name && !estimate.client_email && !fullAddress && (
          <p className="text-sm text-muted-foreground italic">No client info provided</p>
        )}
      </CardContent>
    </Card>
  );
}
