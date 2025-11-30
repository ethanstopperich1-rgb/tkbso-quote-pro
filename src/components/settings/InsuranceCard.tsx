import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Upload, FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Insurance } from '@/types/settings';

interface Props {
  data: Insurance;
  onChange: (data: Insurance) => void;
  contractorId?: string;
}

function getExpirationStatus(dateStr: string): { label: string; variant: 'default' | 'destructive' | 'secondary'; warning: boolean } {
  if (!dateStr) return { label: 'No date', variant: 'secondary', warning: false };
  
  const expDate = new Date(dateStr);
  const now = new Date();
  const daysUntil = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntil < 0) return { label: 'Expired', variant: 'destructive', warning: true };
  if (daysUntil <= 30) return { label: `Expires in ${daysUntil} days`, variant: 'destructive', warning: true };
  return { label: 'Active', variant: 'default', warning: false };
}

export function InsuranceCard({ data, onChange, contractorId }: Props) {
  const [uploadingGl, setUploadingGl] = useState(false);
  const [uploadingWc, setUploadingWc] = useState(false);
  const glFileRef = useRef<HTMLInputElement>(null);
  const wcFileRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof Insurance, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleFileUpload = async (
    file: File,
    type: 'gl' | 'wc',
    setUploading: (v: boolean) => void
  ) => {
    if (!contractorId) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileName = `${type}-certificate.pdf`;
      const filePath = `${contractorId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('contractor-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('contractor-assets')
        .getPublicUrl(filePath);

      update(type === 'gl' ? 'glFileUrl' : 'wcFileUrl', urlData.publicUrl);
      toast.success('Certificate uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload certificate');
    } finally {
      setUploading(false);
    }
  };

  const glStatus = getExpirationStatus(data.glExpiration);
  const wcStatus = data.wcExpiration ? getExpirationStatus(data.wcExpiration) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle>Insurance</CardTitle>
        </div>
        <CardDescription>
          Insurance details that may be included on proposals or shared with clients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Warning Banner */}
        {(glStatus.warning || wcStatus?.warning) && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Insurance Attention Required</p>
              <p className="text-sm text-muted-foreground">
                One or more policies are expired or expiring soon
              </p>
            </div>
          </div>
        )}

        {/* General Liability */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">General Liability (GL)</h4>
            {data.glExpiration && <Badge variant={glStatus.variant}>{glStatus.label}</Badge>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Insurance Provider</Label>
              <Input
                value={data.glProvider}
                onChange={(e) => update('glProvider', e.target.value)}
                placeholder="State Farm, Progressive, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>Policy Number</Label>
              <Input
                value={data.glNumber}
                onChange={(e) => update('glNumber', e.target.value)}
                placeholder="POL-123456"
              />
            </div>
            <div className="space-y-2">
              <Label>Coverage Amount</Label>
              <Input
                value={data.glCoverage}
                onChange={(e) => update('glCoverage', e.target.value)}
                placeholder="$1,000,000"
              />
            </div>
            <div className="space-y-2">
              <Label>Expiration Date</Label>
              <Input
                type="date"
                value={data.glExpiration}
                onChange={(e) => update('glExpiration', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              ref={glFileRef}
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'gl', setUploadingGl)}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => glFileRef.current?.click()}
              disabled={uploadingGl}
            >
              {uploadingGl ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload GL Certificate
            </Button>
            {data.glFileUrl && (
              <a
                href={data.glFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                View Certificate
              </a>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Workers Comp */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Workers Compensation (Optional)</h4>
            {data.wcExpiration && wcStatus && (
              <Badge variant={wcStatus.variant}>{wcStatus.label}</Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>WC Provider</Label>
              <Input
                value={data.wcProvider || ''}
                onChange={(e) => update('wcProvider', e.target.value)}
                placeholder="Insurance provider"
              />
            </div>
            <div className="space-y-2">
              <Label>WC Policy Number</Label>
              <Input
                value={data.wcNumber || ''}
                onChange={(e) => update('wcNumber', e.target.value)}
                placeholder="WC-123456"
              />
            </div>
            <div className="space-y-2">
              <Label>WC Coverage Amount</Label>
              <Input
                value={data.wcCoverage || ''}
                onChange={(e) => update('wcCoverage', e.target.value)}
                placeholder="$500,000"
              />
            </div>
            <div className="space-y-2">
              <Label>WC Expiration Date</Label>
              <Input
                type="date"
                value={data.wcExpiration || ''}
                onChange={(e) => update('wcExpiration', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              ref={wcFileRef}
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'wc', setUploadingWc)}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => wcFileRef.current?.click()}
              disabled={uploadingWc}
            >
              {uploadingWc ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload WC Certificate
            </Button>
            {data.wcFileUrl && (
              <a
                href={data.wcFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                View Certificate
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
