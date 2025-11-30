import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { CompanyProfile } from '@/types/settings';

interface Props {
  data: CompanyProfile;
  onChange: (data: CompanyProfile) => void;
}

export function CompanyProfileCard({ data, onChange }: Props) {
  const update = (field: keyof CompanyProfile, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>Company Profile</CardTitle>
        </div>
        <CardDescription>
          General business identity information that appears on your quotes and proposals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Owner Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ownerFirst">Owner First Name</Label>
            <Input
              id="ownerFirst"
              value={data.ownerFirst}
              onChange={(e) => update('ownerFirst', e.target.value)}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerLast">Owner Last Name</Label>
            <Input
              id="ownerLast"
              value={data.ownerLast}
              onChange={(e) => update('ownerLast', e.target.value)}
              placeholder="Smith"
            />
          </div>
        </div>

        {/* Company Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={data.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              placeholder="The Kitchen & Bath Store of Orlando"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dba">DBA Name (optional)</Label>
            <Input
              id="dba"
              value={data.dba}
              onChange={(e) => update('dba', e.target.value)}
              placeholder="TKBSO"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Business Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="(407) 555-1234"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Business Email</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="info@tkbso.com"
            />
          </div>
        </div>

        {/* Address & Website */}
        <div className="space-y-2">
          <Label htmlFor="address">Office Address</Label>
          <Input
            id="address"
            value={data.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder="123 Main St, Orlando, FL 32801"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              type="url"
              value={data.website}
              onChange={(e) => update('website', e.target.value)}
              placeholder="https://www.tkbso.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredContact">Preferred Contact Method</Label>
            <Select
              value={data.preferredContact}
              onValueChange={(value) => update('preferredContact', value as 'email' | 'phone' | 'text')}
            >
              <SelectTrigger id="preferredContact">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="text">Text Message</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
