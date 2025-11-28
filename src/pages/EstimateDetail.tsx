import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatCurrency, formatPercentage } from '@/lib/pricing-calculator';
import { Estimate, PricingConfig } from '@/types/database';
import { ProposalPdf } from '@/components/pdf/ProposalPdf';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  RefreshCw,
  Copy,
} from 'lucide-react';

export default function EstimateDetail() {
  const { id } = useParams<{ id: string }>();
  const { contractor } = useAuth();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id || !contractor) return;
      
      const [estimateRes, configRes] = await Promise.all([
        supabase.from('estimates').select('*').eq('id', id).single(),
        supabase.from('pricing_configs').select('*').eq('contractor_id', contractor.id).single(),
      ]);
      
      if (estimateRes.data) setEstimate(estimateRes.data as Estimate);
      if (configRes.data) setPricingConfig(configRes.data as PricingConfig);
      setLoading(false);
    }
    
    fetchData();
  }, [id, contractor]);

  const handleDownloadPdf = async () => {
    if (!estimate || !contractor) return;
    
    if (!estimate.final_cp_total || !estimate.client_estimate_text) {
      toast.error('Estimate is incomplete – finish the quote before downloading a PDF.');
      return;
    }
    
    setDownloading(true);
    try {
      const blob = await pdf(
        <ProposalPdf 
          contractor={contractor} 
          estimate={estimate} 
          pricingConfig={pricingConfig || undefined} 
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const clientName = estimate.client_name?.replace(/[^a-zA-Z0-9]/g, '_') || '';
      const jobLabel = estimate.job_label?.replace(/[^a-zA-Z0-9]/g, '_') || '';
      const filename = clientName || jobLabel
        ? `TKBSO_Proposal_${clientName}${jobLabel ? '_' + jobLabel : ''}.pdf`
        : `TKBSO_Proposal_${estimate.id}.pdf`;
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyText = () => {
    if (estimate?.client_estimate_text) {
      navigator.clipboard.writeText(estimate.client_estimate_text);
      toast.success('Scope text copied to clipboard!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-secondary text-secondary-foreground';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'won': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Estimate not found.</p>
        <Link to="/estimates">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Estimates
          </Button>
        </Link>
      </div>
    );
  }

  const fullAddress = [
    estimate.property_address,
    estimate.city,
    estimate.state,
    estimate.zip,
  ].filter(Boolean).join(', ');

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/estimates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-display">
                {estimate.job_label || estimate.client_name || 'Untitled Estimate'}
              </h1>
              <Badge className={getStatusColor(estimate.status)}>
                {estimate.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created {new Date(estimate.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleDownloadPdf} 
          disabled={downloading || !estimate.final_cp_total}
          className="gap-2"
        >
          {downloading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PDF
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Price Summary Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Investment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Low</p>
                  <p className="text-xl font-semibold">{formatCurrency(estimate.low_estimate_cp)}</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-3">
                  <p className="text-sm text-primary font-medium">Recommended</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(estimate.final_cp_total)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High</p>
                  <p className="text-xl font-semibold">{formatCurrency(estimate.high_estimate_cp)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scope of Work */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Scope of Work
              </CardTitle>
              {estimate.client_estimate_text && (
                <Button variant="ghost" size="sm" onClick={handleCopyText}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {estimate.client_estimate_text ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-foreground bg-muted/30 p-4 rounded-lg">
                    {estimate.client_estimate_text}
                  </pre>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No scope text generated yet. Complete the estimate to generate client-facing scope.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Internal Breakdown (only visible to contractor) */}
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader>
              <CardTitle className="text-lg text-amber-800">Internal Breakdown</CardTitle>
              <p className="text-xs text-amber-600">This section is NOT shown on the client PDF</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Internal Cost</p>
                  <p className="font-semibold">{formatCurrency(estimate.final_ic_total)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Client Price</p>
                  <p className="font-semibold">{formatCurrency(estimate.final_cp_total)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Margin</p>
                  <p className="font-semibold text-emerald-600">
                    {estimate.final_cp_total > 0
                      ? formatPercentage((estimate.final_cp_total - estimate.final_ic_total) / estimate.final_cp_total)
                      : '0%'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gross Profit</p>
                  <p className="font-semibold">{formatCurrency(estimate.final_cp_total - estimate.final_ic_total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Client & Project Info */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
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

          {/* Project Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {estimate.has_kitchen && estimate.num_kitchens > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kitchens</span>
                  <span>{estimate.num_kitchens} ({estimate.total_kitchen_sqft} sqft)</span>
                </div>
              )}
              {estimate.has_bathrooms && estimate.num_bathrooms > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bathrooms</span>
                  <span>{estimate.num_bathrooms} ({estimate.total_bathroom_sqft} sqft)</span>
                </div>
              )}
              {estimate.has_closets && estimate.num_closets > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Closets</span>
                  <span>{estimate.num_closets} ({estimate.total_closet_sqft} sqft)</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">GC Partner</span>
                <span>{estimate.needs_gc_partner ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Permit Required</span>
                <span>{estimate.permit_required ? 'Yes' : 'No'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardContent className="pt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(estimate.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Updated:</span>
                <span>{new Date(estimate.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
