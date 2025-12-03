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
import { ClientInfoEditCard } from '@/components/estimates/ClientInfoEditCard';
import { ConversationHistoryCard } from '@/components/estimates/ConversationHistoryCard';
import { PricingEditCard } from '@/components/estimates/PricingEditCard';
import { LineItemEditorCard } from '@/components/estimates/LineItemEditorCard';
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

// Generate scope text from estimate data
function generateScopeTextFromEstimate(estimate: Estimate): string {
  const lines: string[] = [];
  const isShowerOnly = estimate.bath_scope_level === 'shower_only';
  
  // Demo
  if (estimate.include_demo !== false) {
    lines.push('DEMO:');
    if (estimate.has_bathrooms) {
      if (isShowerOnly) {
        lines.push('• Remove existing shower fixtures, tile, and substrate');
      } else {
        lines.push('• Remove existing fixtures, tile, vanity, and toilet');
      }
    } else if (estimate.has_kitchen) {
      lines.push('• Remove existing cabinets, countertops, and appliances as needed');
    }
    lines.push('• Protect adjacent areas and flooring');
    lines.push('• Debris removal and disposal');
    lines.push('');
  }
  
  // Framing (bathroom only)
  if (estimate.has_bathrooms) {
    lines.push('FRAMING:');
    lines.push('• Install blocking for shower fixtures and accessories');
    lines.push('• Frame shower niche(s) as needed');
    lines.push('');
  }
  
  // Plumbing
  if (estimate.include_plumbing !== false) {
    lines.push('PLUMBING:');
    if (estimate.has_bathrooms) {
      if (isShowerOnly) {
        lines.push('• Rough-in water supply and drain lines for new shower');
        lines.push('• Install shower valve, trim, and showerhead');
        lines.push('• Pressure test and leak verification');
      } else {
        lines.push('• Rough-in water supply and drain lines');
        lines.push('• Install shower valve, trim, and fixtures');
        lines.push('• Set and connect toilet');
        lines.push('• Install vanity plumbing and faucet');
        lines.push('• Final pressure testing and leak check');
      }
    } else if (estimate.has_kitchen) {
      lines.push('• Install and connect kitchen sink and faucet');
      lines.push('• Connect dishwasher and disposal if included');
      lines.push('• Final pressure testing');
    }
    lines.push('');
  }
  
  // Electrical
  if (estimate.include_electrical) {
    lines.push('ELECTRICAL:');
    if (estimate.has_bathrooms) {
      if (estimate.num_recessed_cans && estimate.num_recessed_cans > 0) {
        lines.push(`• Install ${estimate.num_recessed_cans} recessed light(s)`);
      }
      if (estimate.num_vanity_lights && estimate.num_vanity_lights > 0) {
        lines.push(`• Install ${estimate.num_vanity_lights} vanity light fixture(s)`);
      }
      lines.push('• Install exhaust fan');
      lines.push('• GFCI outlets per code');
    } else if (estimate.has_kitchen) {
      lines.push('• Install dedicated circuits as needed');
      lines.push('• Install under-cabinet lighting');
      lines.push('• Connect appliances per code');
    }
    lines.push('');
  }
  
  // Tile Work
  if (estimate.has_bathrooms) {
    lines.push('TILE WORK:');
    lines.push('• Install waterproofing system (Schluter or equivalent)');
    lines.push('• Level and prep substrate as needed');
    if (estimate.bath_wall_tile_sqft && estimate.bath_wall_tile_sqft > 0) {
      lines.push(`• Install wall tile in shower area (~${Math.round(estimate.bath_wall_tile_sqft)} sq ft)`);
    } else {
      lines.push('• Install wall tile in shower/wet areas');
    }
    if (estimate.bath_shower_floor_tile_sqft && estimate.bath_shower_floor_tile_sqft > 0) {
      lines.push(`• Install shower floor tile with slope to drain (~${Math.round(estimate.bath_shower_floor_tile_sqft)} sq ft)`);
    } else {
      lines.push('• Install shower floor tile with proper slope to drain');
    }
    if (!isShowerOnly && estimate.bath_floor_tile_sqft && estimate.bath_floor_tile_sqft > 0) {
      lines.push(`• Install bathroom floor tile (~${Math.round(estimate.bath_floor_tile_sqft)} sq ft)`);
    }
    lines.push('• Grout, clean, and seal all tile');
    lines.push('• Tile material to be supplied by homeowner');
    lines.push('');
  }
  
  // Vanity (full bathroom only)
  if (estimate.has_bathrooms && !isShowerOnly && estimate.bath_uses_tkbso_vanities) {
    lines.push('VANITY:');
    if (estimate.vanity_size && estimate.vanity_size !== 'none') {
      lines.push(`• Install ${estimate.vanity_size}" vanity with top and sink`);
    } else {
      lines.push('• Install vanity with top and sink');
    }
    lines.push('• Install mirror');
    lines.push('• Connect plumbing and faucet');
    lines.push('');
  }
  
  // Glass
  if (estimate.include_glass || estimate.bath_uses_frameless_glass || (estimate.glass_type && estimate.glass_type !== 'none')) {
    lines.push('SHOWER GLASS:');
    if (estimate.glass_type === 'panel_only') {
      lines.push('• Glass panel installation');
    } else if (estimate.glass_type === '90_return') {
      lines.push('• 90-degree return glass enclosure');
    } else {
      lines.push('• Frameless glass shower enclosure');
    }
    lines.push('• Field measurement after tile completion');
    lines.push('• Custom hardware and seals');
    lines.push('• Professional installation');
    lines.push('');
  }
  
  // Paint
  if (estimate.include_paint) {
    lines.push('PAINTING:');
    lines.push('• Patch and repair drywall as needed');
    lines.push('• Prime and paint walls and ceiling');
    lines.push('• Paint color to be selected by homeowner');
    lines.push('');
  }
  
  return lines.join('\n');
}

export default function EstimateDetail() {
  const { id } = useParams<{ id: string }>();
  const { contractor } = useAuth();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState<'low' | 'recommended' | 'high'>('recommended');

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

  const handleRegenerateScope = async () => {
    if (!estimate || !id) return;
    
    setRegenerating(true);
    try {
      const newScopeText = generateScopeTextFromEstimate(estimate);
      
      const { error } = await supabase
        .from('estimates')
        .update({ client_estimate_text: newScopeText })
        .eq('id', id);
      
      if (error) throw error;
      
      setEstimate({ ...estimate, client_estimate_text: newScopeText });
      toast.success('Scope text regenerated!');
    } catch (error) {
      console.error('Error regenerating scope:', error);
      toast.error('Failed to regenerate scope text');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!estimate || !contractor) return;
    
    if (!estimate.final_cp_total) {
      toast.error('Estimate is incomplete – finish the quote before downloading a PDF.');
      return;
    }
    
    setDownloading(true);
    try {
      // Create estimate with selected price level
      const selectedPrice = selectedPriceLevel === 'low' 
        ? estimate.low_estimate_cp 
        : selectedPriceLevel === 'high' 
          ? estimate.high_estimate_cp 
          : estimate.final_cp_total;
      
      const estimateForPdf = {
        ...estimate,
        final_cp_total: selectedPrice,
      };
      
      const blob = await pdf(
        <ProposalPdf 
          contractor={contractor} 
          estimate={estimateForPdf} 
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
      <div className="p-4 sm:p-8 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="p-4 sm:p-8">
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
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <Link to="/estimates">
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display truncate">
                {estimate.job_label || estimate.client_name || 'Untitled Estimate'}
              </h1>
              <Badge className={getStatusColor(estimate.status)}>
                {estimate.status}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Created {new Date(estimate.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleDownloadPdf} 
          disabled={downloading || !estimate.final_cp_total}
          className="gap-2 w-full sm:w-auto"
          size="sm"
        >
          {downloading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          {/* Price Summary Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Investment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  onClick={() => setSelectedPriceLevel('low')}
                  className={`p-2 sm:p-3 rounded-lg text-center transition-all ${
                    selectedPriceLevel === 'low'
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <p className="text-xs sm:text-sm text-muted-foreground">Low</p>
                  <p className={`text-base sm:text-xl font-semibold ${selectedPriceLevel === 'low' ? 'text-primary' : ''}`}>
                    {formatCurrency(estimate.low_estimate_cp)}
                  </p>
                </button>
                <button
                  onClick={() => setSelectedPriceLevel('recommended')}
                  className={`p-2 sm:p-3 rounded-lg text-center transition-all ${
                    selectedPriceLevel === 'recommended'
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <p className={`text-xs sm:text-sm font-medium ${selectedPriceLevel === 'recommended' ? 'text-primary' : 'text-muted-foreground'}`}>
                    Rec
                  </p>
                  <p className={`text-lg sm:text-2xl font-bold ${selectedPriceLevel === 'recommended' ? 'text-primary' : ''}`}>
                    {formatCurrency(estimate.final_cp_total)}
                  </p>
                </button>
                <button
                  onClick={() => setSelectedPriceLevel('high')}
                  className={`p-2 sm:p-3 rounded-lg text-center transition-all ${
                    selectedPriceLevel === 'high'
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <p className="text-xs sm:text-sm text-muted-foreground">High</p>
                  <p className={`text-base sm:text-xl font-semibold ${selectedPriceLevel === 'high' ? 'text-primary' : ''}`}>
                    {formatCurrency(estimate.high_estimate_cp)}
                  </p>
                </button>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-2 sm:mt-3">
                Tap to select price for PDF
              </p>
            </CardContent>
          </Card>

          {/* Internal Breakdown with Edit Pricing */}
          <PricingEditCard 
            estimate={estimate} 
            onUpdate={(updates) => setEstimate({ ...estimate, ...updates })} 
          />

          {/* Line Item Editor */}
          <LineItemEditorCard 
            estimate={estimate} 
            onUpdate={(updates) => setEstimate({ ...estimate, ...updates })} 
          />

          {/* Conversation History */}
          <ConversationHistoryCard 
            conversationHistory={(estimate.internal_json_payload as any)?.conversation_history}
          />
        </div>

        {/* Right Column - Client & Project Info */}
        <div className="space-y-4 sm:space-y-6">
          {/* Client Info - Editable */}
          <ClientInfoEditCard 
            estimate={estimate} 
            onUpdate={(updated) => setEstimate({ ...estimate, ...updated })} 
          />

          {/* Project Summary */}
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Project Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
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
            <CardContent className="pt-4 sm:pt-6 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(estimate.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
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
