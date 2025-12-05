import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Plus, Trash2 } from 'lucide-react';
import { License } from '@/types/settings';

interface Props {
  data: License[];
  onChange: (data: License[]) => void;
}

function getExpirationStatus(dateStr: string): { label: string; variant: 'default' | 'destructive' | 'secondary' } {
  if (!dateStr) return { label: 'No date', variant: 'secondary' };
  
  const expDate = new Date(dateStr);
  const now = new Date();
  const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 0) return { label: 'Expired', variant: 'destructive' };
  if (daysUntil <= 30) return { label: 'Expiring Soon', variant: 'destructive' };
  return { label: 'Active', variant: 'default' };
}

export function LicensesCard({ data, onChange }: Props) {
  const addLicense = () => {
    const newLicense: License = {
      id: Date.now().toString(),
      type: '',
      number: '',
      state: '',
      expiration: '',
    };
    onChange([...data, newLicense]);
  };

  const updateLicense = (id: string, field: keyof License, value: string) => {
    onChange(data.map(lic => 
      lic.id === id ? { ...lic, [field]: value } : lic
    ));
  };

  const removeLicense = (id: string) => {
    onChange(data.filter(lic => lic.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <FileCheck className="h-5 w-5 text-cyan-500" />
            <h3 className="text-lg font-bold text-[#0B1C3E]">Licenses & Compliance</h3>
          </div>
          <p className="text-sm text-slate-500">Contractor licenses appear on proposals and help build client trust</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={addLicense}
          className="border-slate-200 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add License
        </Button>
      </div>
      
      {/* Content */}
      <div className="p-5 space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No licenses added yet</p>
            <p className="text-sm mt-1">Click "Add License" to add your contractor licenses</p>
          </div>
        ) : (
          data.map((license, index) => {
            const status = getExpirationStatus(license.expiration);
            return (
              <div key={license.id} className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    License #{index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {license.expiration && (
                      <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => removeLicense(license.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-sm">License Type</Label>
                    <Input
                      value={license.type}
                      onChange={(e) => updateLicense(license.id, 'type', e.target.value)}
                      placeholder="General Contractor, EPA RRP, etc."
                      className="h-10 border-0 bg-white rounded-lg focus:ring-2 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-sm">License Number</Label>
                    <Input
                      value={license.number}
                      onChange={(e) => updateLicense(license.id, 'number', e.target.value)}
                      placeholder="CBC1234567"
                      className="h-10 border-0 bg-white rounded-lg focus:ring-2 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-sm">State</Label>
                    <Input
                      value={license.state}
                      onChange={(e) => updateLicense(license.id, 'state', e.target.value)}
                      placeholder="FL"
                      className="h-10 border-0 bg-white rounded-lg focus:ring-2 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 text-sm">Expiration Date</Label>
                    <Input
                      type="date"
                      value={license.expiration}
                      onChange={(e) => updateLicense(license.id, 'expiration', e.target.value)}
                      className="h-10 border-0 bg-white rounded-lg focus:ring-2 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}