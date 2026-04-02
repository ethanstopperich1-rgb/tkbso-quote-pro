import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/pricing-calculator';
import { Estimate, PricingConfig } from '@/types/database';
import { SimpleProposalPdf } from '@/components/pdf/SimpleProposalPdf';
import { extractPassthroughLineItems, calculatePassthroughTotal } from '@/lib/estimate-passthrough';
import { generateProposalWord } from '@/components/word/ProposalWord';
import { ClientInfoEditCard } from '@/components/estimates/ClientInfoEditCard';
import { ConversationHistoryCard } from '@/components/estimates/ConversationHistoryCard';
import { PricingEditCard } from '@/components/estimates/PricingEditCard';
import { LineItemEditorCard } from '@/components/estimates/LineItemEditorCard';
import { ProjectPhotosCard } from '@/components/estimates/ProjectPhotosCard';
import { SendProposalDialog } from '@/components/estimates/SendProposalDialog';
import { AdditionalsCard } from '@/components/estimates/AdditionalsCard';
import { AddSectionCard } from '@/components/estimates/AddSectionCard';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronRight,
  Clock,
  Edit2,
  FileText,
  Send,
  FileIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Deal stages for the progress bar
const DEAL_STAGES = [
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'viewed', label: 'Viewed' },
  { id: 'signed', label: 'Signed' },
  { id: 'deposit_paid', label: 'Deposit Paid' },
];

// Generate scope text from estimate data
function generateScopeTextFromEstimate(estimate: Estimate): string {
  const lines: string[] = [];
  const isShowerOnly = estimate.bath_scope_level === 'shower_only';
  
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
  
  if (estimate.has_bathrooms) {
    lines.push('FRAMING:');
    lines.push('• Install blocking for shower fixtures and accessories');
    lines.push('• Frame shower niche(s) as needed');
    lines.push('');
  }
  
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
  
  if (estimate.include_paint) {
    lines.push('PAINTING:');
    lines.push('• Patch and repair drywall as needed');
    lines.push('• Prime and paint walls and ceiling');
    lines.push('• Paint color to be selected by homeowner');
    lines.push('');
  }
  
  return lines.join('\n');
}

// Note: TradeScope and buildTradeScopesFromEstimate removed - only using SimpleProposalPdf now

export default function EstimateDetail() {
  const { id } = useParams<{ id: string }>();
  const { contractor } = useAuth();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState<'low' | 'recommended' | 'high'>('recommended');
  const [clientMode, setClientMode] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [showRange, setShowRange] = useState(false);
  const [showTileSqft, setShowTileSqft] = useState(true);
  const [customLowPrice, setCustomLowPrice] = useState<string>('');
  const [customHighPrice, setCustomHighPrice] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      if (!id) {
        setLoading(false);
        return;
      }
      
      // Wait for contractor to load before attempting fetch
      if (!contractor) return;
      
      try {
        const [estimateRes, configRes] = await Promise.all([
          supabase.from('estimates').select('*').eq('id', id).single(),
          supabase.from('pricing_configs').select('*').eq('contractor_id', contractor.id).single(),
        ]);
        
        if (estimateRes.data) setEstimate(estimateRes.data as Estimate);
        if (configRes.data) setPricingConfig(configRes.data as PricingConfig);
      } catch (error) {
        console.error('Error fetching estimate:', error);
      }
      setLoading(false);
    }
    
    fetchData();
  }, [id, contractor]);

  const handleMoveToSent = async () => {
    if (!estimate || !id) return;
    
    try {
      const { error } = await supabase
        .from('estimates')
        .update({ status: 'sent' })
        .eq('id', id);
      
      if (error) throw error;
      
      setEstimate({ ...estimate, status: 'sent' });
      toast.success('Estimate moved to Sent!');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
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
      // Always use SimpleProposalPdf (table format with room grouping)
      const lineItems = extractPassthroughLineItems(estimate);
      const selectedPrice = selectedPriceLevel === 'low' 
        ? estimate.low_estimate_cp 
        : selectedPriceLevel === 'high' 
          ? estimate.high_estimate_cp 
          : estimate.final_cp_total;
      const total = selectedPrice || calculatePassthroughTotal(lineItems);
      
      const blob = await pdf(
        <SimpleProposalPdf 
          contractor={contractor} 
          estimate={estimate} 
          lineItems={lineItems}
          total={total}
          // Don't show price range by default - only single price
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const clientName = estimate.client_name?.replace(/[^a-zA-Z0-9]/g, '_') || '';
      const jobLabel = estimate.job_label?.replace(/[^a-zA-Z0-9]/g, '_') || '';
      const filename = clientName || jobLabel
        ? `Estimate_${clientName}${jobLabel ? '_' + jobLabel : ''}.pdf`
        : `Estimate_${estimate.id}.pdf`;
      
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

  const handleDownloadWord = async () => {
    if (!estimate || !contractor) return;
    
    setDownloadingWord(true);
    try {
      // Use same logic as PDF - extract line items and calculate selected price
      const lineItems = extractPassthroughLineItems(estimate);
      const selectedPrice = selectedPriceLevel === 'low' 
        ? estimate.low_estimate_cp 
        : selectedPriceLevel === 'high' 
          ? estimate.high_estimate_cp 
          : estimate.final_cp_total;
      
      const total = selectedPrice || calculatePassthroughTotal(lineItems);
      
      await generateProposalWord({
        contractor,
        estimate,
        lineItems,
        total,
      });
      
      toast.success('Word document downloaded successfully!');
    } catch (error) {
      console.error('Word generation error:', error);
      toast.error('Failed to generate Word document. Please try again.');
    } finally {
      setDownloadingWord(false);
    }
  };

  const getCurrentStageIndex = () => {
    const status = estimate?.status || 'draft';
    const index = DEAL_STAGES.findIndex(s => s.id === status);
    return index >= 0 ? index : 0;
  };

  const getNextStageAction = () => {
    const currentIndex = getCurrentStageIndex();
    if (currentIndex === 0) return { label: 'Send Proposal', action: () => setSendDialogOpen(true) };
    return null;
  };

  const getSelectedPrice = () => {
    return selectedPriceLevel === 'low'
      ? estimate?.low_estimate_cp || 0
      : selectedPriceLevel === 'high'
        ? estimate?.high_estimate_cp || 0
        : estimate?.final_cp_total || 0;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 flex items-center justify-center min-h-[50vh] bg-black">
        <RefreshCw className="h-6 w-6 animate-spin text-[#666]" />
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="p-4 sm:p-8 bg-black min-h-screen">
        <p className="text-[#666]">Estimate not found.</p>
        <Link to="/estimates">
          <Button variant="ghost" className="mt-4 text-[#666] hover:text-[#E8E8E8] hover:bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Estimates
          </Button>
        </Link>
      </div>
    );
  }

  const currentStageIndex = getCurrentStageIndex();
  const nextAction = getNextStageAction();

  // Activity log entries
  const activityLog = [
    { date: new Date(estimate.created_at), action: 'Created', icon: FileText },
    ...(estimate.updated_at !== estimate.created_at 
      ? [{ date: new Date(estimate.updated_at), action: 'Edited Pricing', icon: Edit2 }] 
      : []),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto bg-black min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <Link to="/estimates">
            <button className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 flex items-center justify-center text-[#666] hover:text-[#E8E8E8] transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#E8E8E8] truncate">
              {(() => {
                // Determine project type from estimate data - check multiple sources
                const payload = estimate.internal_json_payload as {
                  quote?: { project?: { type?: string } },
                  project_header?: { project_type?: string }
                } | null;

                // Try project_header first (most reliable), then quote.project.type
                const projectTypeFromHeader = payload?.project_header?.project_type;
                const projectTypeFromQuote = payload?.quote?.project?.type;

                let projectType = 'Remodel';
                if (projectTypeFromHeader) {
                  // project_header.project_type is already clean like "Bathroom" or "Kitchen"
                  projectType = `${projectTypeFromHeader} Remodel`;
                } else if (projectTypeFromQuote) {
                  // Normalize project type (handle "bathroom", "bathroom_remodel", "Bathroom", etc.)
                  const normalized = projectTypeFromQuote.toLowerCase().replace(/_remodel$/, '');
                  if (normalized.includes('bathroom')) {
                    projectType = 'Bathroom Remodel';
                  } else if (normalized.includes('kitchen')) {
                    projectType = 'Kitchen Remodel';
                  } else {
                    projectType = `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)} Remodel`;
                  }
                } else if (estimate.has_bathrooms && estimate.has_kitchen) {
                  projectType = 'Kitchen & Bathroom Remodel';
                } else if (estimate.has_kitchen) {
                  projectType = 'Kitchen Remodel';
                } else if (estimate.has_bathrooms) {
                  projectType = 'Bathroom Remodel';
                } else if (estimate.has_closets) {
                  projectType = 'Closet Remodel';
                }

                // If job_label is set and it's not a generic label, use it
                if (estimate.job_label && !['Kitchen Remodel', 'Bathroom Remodel', 'Home Remodel'].includes(estimate.job_label)) {
                  return estimate.job_label;
                }

                // Show client name + project type, or just project type
                if (estimate.client_name) {
                  return `${estimate.client_name} - ${projectType}`;
                }
                return projectType;
              })()}
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mt-1">
              Created {new Date(estimate.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Client Mode Toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] border border-[#222] bg-[#111]">
            <Label htmlFor="client-mode" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] cursor-pointer flex items-center gap-1.5">
              {clientMode ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              Client Mode
            </Label>
            <Switch
              id="client-mode"
              checked={clientMode}
              onCheckedChange={setClientMode}
              className="scale-75 data-[state=checked]:bg-white data-[state=unchecked]:bg-[#333]"
            />
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading || !estimate.final_cp_total}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[#333] text-[#E8E8E8] bg-transparent hover:bg-[#111] rounded-[4px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-mono uppercase tracking-[0.08em]"
          >
            {downloading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            PDF
          </button>

          <button
            onClick={handleDownloadWord}
            disabled={downloadingWord || !estimate.final_cp_total}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[#333] text-[#E8E8E8] bg-transparent hover:bg-[#111] rounded-[4px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-mono uppercase tracking-[0.08em]"
          >
            {downloadingWord ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <FileIcon className="h-4 w-4" />
            )}
            Word
          </button>
        </div>
      </div>

      {/* Deal Stage Progress Bar */}
      <div className="mb-6 p-4 bg-[#111] rounded-[12px] border border-[#222]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">Deal Stage</h3>
          {nextAction && (
            <button onClick={nextAction.action} className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-black rounded-full font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#E8E8E8] transition-colors">
              <Send className="h-3.5 w-3.5" />
              {nextAction.label}
            </button>
          )}
        </div>
        <div className="flex items-center">
          {DEAL_STAGES.map((stage, index) => (
            <div key={stage.id} className="flex items-center flex-1">
              <div
                className={cn(
                  "flex items-center justify-center px-3 py-1.5 rounded-[4px] text-xs font-mono transition-all",
                  index <= currentStageIndex
                    ? "bg-[#2B4C8C] text-white"
                    : "text-[#666]"
                )}
              >
                {stage.label}
              </div>
              {index < DEAL_STAGES.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0 text-[#333]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Investment Summary */}
          <div className="bg-[#111] border border-[#222] rounded-[12px] p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">Investment Summary</h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedPriceLevel('low')}
                  className={cn(
                    "p-3 rounded-[4px] text-center transition-all",
                    selectedPriceLevel === 'low'
                      ? "border-b-2 border-[#2B4C8C]"
                      : "hover:bg-[#1a1a1a]"
                  )}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mb-1">Low</p>
                  <p className={cn(
                    "font-mono text-lg sm:text-xl tabular-nums",
                    selectedPriceLevel === 'low' ? 'text-white' : 'text-[#666]'
                  )}>
                    {formatCurrency(estimate.low_estimate_cp)}
                  </p>
                </button>

                <button
                  onClick={() => setSelectedPriceLevel('recommended')}
                  className={cn(
                    "p-3 rounded-[4px] text-center transition-all relative",
                    selectedPriceLevel === 'recommended'
                      ? "border-b-2 border-[#2B4C8C]"
                      : "hover:bg-[#1a1a1a]"
                  )}
                >
                  <p className={cn(
                    "font-mono text-[11px] uppercase tracking-[0.08em] mb-1",
                    selectedPriceLevel === 'recommended' ? 'text-[#999]' : 'text-[#666]'
                  )}>Recommended</p>
                  <p className={cn(
                    "font-mono text-[32px] sm:text-[36px] lg:text-[42px] font-normal tracking-tight tabular-nums",
                    selectedPriceLevel === 'recommended' ? 'text-white' : 'text-[#666]'
                  )}>
                    {formatCurrency(estimate.final_cp_total)}
                  </p>
                </button>

                <button
                  onClick={() => setSelectedPriceLevel('high')}
                  className={cn(
                    "p-3 rounded-[4px] text-center transition-all",
                    selectedPriceLevel === 'high'
                      ? "border-b-2 border-[#2B4C8C]"
                      : "hover:bg-[#1a1a1a]"
                  )}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mb-1">High</p>
                  <p className={cn(
                    "font-mono text-lg sm:text-xl tabular-nums",
                    selectedPriceLevel === 'high' ? 'text-white' : 'text-[#666]'
                  )}>
                    {formatCurrency(estimate.high_estimate_cp)}
                  </p>
                </button>
              </div>

              {/* Show Range Toggle */}
              <div className="mt-4 pt-4 border-t border-[#222]">
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="show-range" className="text-sm text-[#999] cursor-pointer">
                    Show price range on PDF
                  </Label>
                  <Switch
                    id="show-range"
                    checked={showRange}
                    onCheckedChange={(checked) => {
                      setShowRange(checked);
                      if (checked && !customLowPrice && !customHighPrice) {
                        setCustomLowPrice(String(estimate.low_estimate_cp || estimate.final_cp_total || 0));
                        setCustomHighPrice(String(estimate.high_estimate_cp || estimate.final_cp_total || 0));
                      }
                    }}
                    className="data-[state=checked]:bg-white data-[state=unchecked]:bg-[#333]"
                  />
                </div>

                {showRange && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mb-1 block">Low Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">$</span>
                        <input
                          type="number"
                          value={customLowPrice}
                          onChange={(e) => setCustomLowPrice(e.target.value)}
                          placeholder="48880"
                          className="w-full bg-black border border-[#333] rounded-[4px] px-3 pl-7 py-2 text-[#E8E8E8] font-mono tabular-nums placeholder:text-[#333] focus:outline-none focus:border-[#2B4C8C]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mb-1 block">High Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">$</span>
                        <input
                          type="number"
                          value={customHighPrice}
                          onChange={(e) => setCustomHighPrice(e.target.value)}
                          placeholder="55600"
                          className="w-full bg-black border border-[#333] rounded-[4px] px-3 pl-7 py-2 text-[#E8E8E8] font-mono tabular-nums placeholder:text-[#333] focus:outline-none focus:border-[#2B4C8C]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>


              <p className="font-mono text-[10px] text-[#666] text-center mt-3 uppercase tracking-[0.08em]">
                {showRange ? 'PDF will show range' : 'Tap to select price for PDF'}
              </p>
          </div>

          {/* Project Photos Card */}
          <ProjectPhotosCard estimateId={estimate.id} />

          {/* Profitability Analysis (only show when NOT in client mode) */}
          {!clientMode && (
            <PricingEditCard 
              estimate={estimate} 
              onUpdate={(updates) => setEstimate(prev => prev ? { ...prev, ...updates } : prev)} 
            />
          )}

          {/* Line Item Editor - Expanded by default, grouped by trade */}
          <LineItemEditorCard 
            estimate={estimate} 
            onUpdate={(updates) => setEstimate({ ...estimate, ...updates })} 
            defaultExpanded={true}
            hideInternalCost={clientMode}
          />

          {/* Conversation History */}
          {!clientMode && (
            <ConversationHistoryCard 
              conversationHistory={(estimate.internal_json_payload as any)?.conversation_history}
              estimateId={estimate.id}
            />
          )}
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-4 sm:space-y-6">
          {/* Client Info - Editable */}
          <ClientInfoEditCard 
            estimate={estimate} 
            onUpdate={(updated) => setEstimate({ ...estimate, ...updated })} 
          />

          {/* Recommended Additionals */}
          <AdditionalsCard 
            estimate={estimate}
            onUpdate={(updates) => setEstimate({ ...estimate, ...updates })}
          />

          {/* Add Section - Template or Clone */}
          {!clientMode && (
            <AddSectionCard 
              estimate={estimate}
              onUpdate={(updates) => setEstimate({ ...estimate, ...updates })}
            />
          )}

          {/* Activity Log Card */}
          <div className="bg-[#111] border border-[#222] rounded-[12px]">
            <div className="p-4 pb-3">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                Activity Log
              </h3>
            </div>
            <div className="px-4 pb-4">
              <div className="space-y-3">
                {activityLog.map((entry, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#222] flex items-center justify-center flex-shrink-0">
                      <entry.icon className="h-3.5 w-3.5 text-[#666]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#E8E8E8]">{entry.action}</p>
                      <p className="font-mono text-[11px] text-[#666] tabular-nums">
                        {entry.date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Send Proposal Dialog */}
      {contractor && (
        <SendProposalDialog
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
          estimate={estimate}
          contractor={contractor}
          pricingConfig={pricingConfig}
          selectedPrice={getSelectedPrice()}
          onSent={() => {
            setEstimate({ ...estimate, status: 'sent' });
          }}
        />
      )}
    </div>
  );
}
