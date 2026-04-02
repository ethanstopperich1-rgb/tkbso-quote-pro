import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      <div className="bg-[#111] border border-[#222] rounded-[12px]">
        <div className="p-4 flex flex-row items-center justify-between">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">
            Client Information
          </h3>
          <div className="flex gap-2">
            <button onClick={handleCancel} disabled={saving} className="h-7 w-7 flex items-center justify-center text-[#666] hover:text-[#E8E8E8] transition-colors">
              <X className="h-4 w-4" />
            </button>
            <button onClick={handleSave} disabled={saving} className="h-7 w-7 flex items-center justify-center text-[#666] hover:text-[#E8E8E8] transition-colors">
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="px-4 pb-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="client_name" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">Name</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              placeholder="Client name"
              className="bg-black border-[#333] text-[#E8E8E8] placeholder:text-[#333]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client_phone" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">Phone</Label>
            <Input
              id="client_phone"
              value={formData.client_phone}
              onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
              placeholder="Phone number"
              className="bg-black border-[#333] text-[#E8E8E8] placeholder:text-[#333]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client_email" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">Email</Label>
            <Input
              id="client_email"
              type="email"
              value={formData.client_email}
              onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
              placeholder="Email address"
              className="bg-black border-[#333] text-[#E8E8E8] placeholder:text-[#333]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="property_address" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">Address</Label>
            <Input
              id="property_address"
              value={formData.property_address}
              onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
              placeholder="Street address"
              className="bg-black border-[#333] text-[#E8E8E8] placeholder:text-[#333]"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                className="bg-black border-[#333] text-[#E8E8E8] placeholder:text-[#333]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
                className="bg-black border-[#333] text-[#E8E8E8] placeholder:text-[#333]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zip" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">ZIP</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                placeholder="ZIP"
                className="bg-black border-[#333] text-[#E8E8E8] placeholder:text-[#333]"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-[12px]">
      <div className="p-4 flex flex-row items-center justify-between">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">
          Client Information
        </h3>
        <button onClick={() => setEditing(true)} className="text-[#666] hover:text-[#E8E8E8] transition-colors">
          <Pencil className="h-4 w-4" />
        </button>
      </div>
      <div className="px-4 pb-4 space-y-3">
        {estimate.client_name && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-[#666]" />
            <span className="text-[#E8E8E8]">{estimate.client_name}</span>
          </div>
        )}
        {estimate.client_email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-[#666]" />
            <span className="text-[#E8E8E8]">{estimate.client_email}</span>
          </div>
        )}
        {estimate.client_phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-[#666]" />
            <span className="text-[#E8E8E8]">{estimate.client_phone}</span>
          </div>
        )}
        {fullAddress && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-[#666] mt-0.5" />
            <span className="text-[#E8E8E8]">{fullAddress}</span>
          </div>
        )}
        {!estimate.client_name && !estimate.client_email && !fullAddress && (
          <p className="text-sm text-[#666] italic">No client info provided</p>
        )}
      </div>
    </div>
  );
}
