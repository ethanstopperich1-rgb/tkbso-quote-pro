import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, User, Mail, Phone, MapPin, Globe } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-1">
          <Building2 className="h-5 w-5 text-cyan-500" />
          <h3 className="text-lg font-bold text-[#0B1C3E]">Company Profile</h3>
        </div>
        <p className="text-sm text-slate-500">Business identity information for your quotes and proposals</p>
      </div>
      
      {/* Content - 2 Column Grid */}
      <div className="p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              Contact Information
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ownerFirst" className="text-slate-700 text-sm">First Name</Label>
                <Input
                  id="ownerFirst"
                  value={data.ownerFirst}
                  onChange={(e) => update('ownerFirst', e.target.value)}
                  placeholder="John"
                  className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerLast" className="text-slate-700 text-sm">Last Name</Label>
                <Input
                  id="ownerLast"
                  value={data.ownerLast}
                  onChange={(e) => update('ownerLast', e.target.value)}
                  placeholder="Smith"
                  className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 text-sm flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="info@company.com"
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700 text-sm flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="(407) 555-1234"
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferredContact" className="text-slate-700 text-sm">Preferred Contact</Label>
              <Select
                value={data.preferredContact}
                onValueChange={(value) => update('preferredContact', value as 'email' | 'phone' | 'text')}
              >
                <SelectTrigger id="preferredContact" className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 shadow-lg z-50">
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="text">Text Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" />
              Company Details
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-slate-700 text-sm">Company Name *</Label>
              <Input
                id="companyName"
                value={data.companyName}
                onChange={(e) => update('companyName', e.target.value)}
                placeholder="Your Company Name"
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dba" className="text-slate-700 text-sm">DBA Name (optional)</Label>
              <Input
                id="dba"
                value={data.dba}
                onChange={(e) => update('dba', e.target.value)}
                placeholder="Doing Business As..."
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="text-slate-700 text-sm flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Address
              </Label>
              <Input
                id="address"
                value={data.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="123 Main St, Orlando, FL 32801"
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website" className="text-slate-700 text-sm flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-slate-400" />
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={data.website}
                onChange={(e) => update('website', e.target.value)}
                placeholder="https://www.yourcompany.com"
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}