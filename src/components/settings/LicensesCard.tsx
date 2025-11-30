import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Trash2 } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Licenses & Compliance</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={addLicense}>
            <Plus className="h-4 w-4 mr-1" />
            Add License
          </Button>
        </div>
        <CardDescription>
          Your contractor licenses appear on proposals and help build client trust
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No licenses added yet</p>
            <p className="text-sm">Click "Add License" to add your contractor licenses</p>
          </div>
        ) : (
          data.map((license, index) => {
            const status = getExpirationStatus(license.expiration);
            return (
              <div key={license.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    License #{index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {license.expiration && (
                      <Badge variant={status.variant}>{status.label}</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeLicense(license.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>License Type</Label>
                    <Input
                      value={license.type}
                      onChange={(e) => updateLicense(license.id, 'type', e.target.value)}
                      placeholder="General Contractor, EPA RRP, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>License Number</Label>
                    <Input
                      value={license.number}
                      onChange={(e) => updateLicense(license.id, 'number', e.target.value)}
                      placeholder="CBC1234567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      value={license.state}
                      onChange={(e) => updateLicense(license.id, 'state', e.target.value)}
                      placeholder="FL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiration Date</Label>
                    <Input
                      type="date"
                      value={license.expiration}
                      onChange={(e) => updateLicense(license.id, 'expiration', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
