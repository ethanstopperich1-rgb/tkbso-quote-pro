import { useEstimator } from '@/contexts/EstimatorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, MapPin } from 'lucide-react';

export function ClientInfoForm() {
  const { state, updateClientInfo } = useEstimator();
  const { clientInfo } = state;
  
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Client Information
        </CardTitle>
        <p className="text-xs text-muted-foreground">Required for final quote generation</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="clientName" className="text-xs flex items-center gap-1">
            <User className="w-3 h-3" />
            Client Name
          </Label>
          <Input
            id="clientName"
            value={clientInfo.name || ''}
            onChange={(e) => updateClientInfo({ name: e.target.value })}
            placeholder="John & Jane Doe"
          />
        </div>
        
        {/* Phone & Email row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs flex items-center gap-1">
              <Phone className="w-3 h-3" />
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={clientInfo.phone || ''}
              onChange={(e) => updateClientInfo({ phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={clientInfo.email || ''}
              onChange={(e) => updateClientInfo({ email: e.target.value })}
              placeholder="client@email.com"
            />
          </div>
        </div>
        
        {/* Address */}
        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Property Address
          </Label>
          <Input
            id="address"
            value={clientInfo.address || ''}
            onChange={(e) => updateClientInfo({ address: e.target.value })}
            placeholder="123 Main Street"
          />
        </div>
        
        {/* City, State, ZIP row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5 col-span-1">
            <Label htmlFor="city" className="text-xs">City</Label>
            <Input
              id="city"
              value={clientInfo.city || ''}
              onChange={(e) => updateClientInfo({ city: e.target.value })}
              placeholder="Orlando"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state" className="text-xs">State</Label>
            <Input
              id="state"
              value={clientInfo.state || ''}
              onChange={(e) => updateClientInfo({ state: e.target.value })}
              placeholder="FL"
              maxLength={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zip" className="text-xs">ZIP</Label>
            <Input
              id="zip"
              value={clientInfo.zip || ''}
              onChange={(e) => updateClientInfo({ zip: e.target.value })}
              placeholder="32801"
              maxLength={10}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
