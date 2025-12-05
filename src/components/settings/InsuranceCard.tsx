import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Upload, FileText, RefreshCw, AlertTriangle } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-1">
          <Shield className="h-5 w-5 text-cyan-500" />
          <h3 className="text-lg font-bold text-[#0B1C3E]">Insurance</h3>
        </div>
        <p className="text-sm text-slate-500">Insurance details for proposals and client verification</p>
      </div>
      
      {/* Content */}
      <div className="p-5 space-y-6">
        {/* Warning Banner */}
        {(glStatus.warning || wcStatus?.warning) && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-rose-700">Insurance Attention Required</p>
              <p className="text-sm text-rose-600">One or more policies are expired or expiring soon</p>
            </div>
          </div>
        )}

        {/* General Liability */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#0B1C3E]">General Liability (GL)</h4>
            {data.glExpiration && <Badge variant={glStatus.variant}>{glStatus.label}</Badge>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-slate-700 text-sm">Insurance Provider</Label>
              <Input
                value={data.glProvider}
                onChange={(e) => update('glProvider', e.target.value)}
                placeholder="State Farm, Progressive, etc."
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 text-sm">Policy Number</Label>
              <Input
                value={data.glNumber}
                onChange={(e) => update('glNumber', e.target.value)}
                placeholder="POL-123456"
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 text-sm">Coverage Amount</Label>
              <Input
                value={data.glCoverage}
                onChange={(e) => update('glCoverage', e.target.value)}
                placeholder="$1,000,000"
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 text-sm">Expiration Date</Label>
              <Input
                type="date"
                value={data.glExpiration}
                onChange={(e) => update('glExpiration', e.target.value)}
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
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
              className="border-slate-200"
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
                className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 hover:underline"
              >
                <FileText className="h-4 w-4" />
                View Certificate
              </a>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Workers Comp */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#0B1C3E]">Workers Compensation (Optional)</h4>
            {data.wcExpiration && wcStatus && (
              <Badge variant={wcStatus.variant}>{wcStatus.label}</Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-slate-700 text-sm">WC Provider</Label>
              <Input
                value={data.wcProvider || ''}
                onChange={(e) => update('wcProvider', e.target.value)}
                placeholder="Insurance provider"
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 text-sm">WC Policy Number</Label>
              <Input
                value={data.wcNumber || ''}
                onChange={(e) => update('wcNumber', e.target.value)}
                placeholder="WC-123456"
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 text-sm">WC Coverage Amount</Label>
              <Input
                value={data.wcCoverage || ''}
                onChange={(e) => update('wcCoverage', e.target.value)}
                placeholder="$500,000"
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 text-sm">WC Expiration Date</Label>
              <Input
                type="date"
                value={data.wcExpiration || ''}
                onChange={(e) => update('wcExpiration', e.target.value)}
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
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
              className="border-slate-200"
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
                className="flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 hover:underline"
              >
                <FileText className="h-4 w-4" />
                View Certificate
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}