import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Estimate, PricingConfig } from '@/types/database';
import { SimpleProposalPdf } from '@/components/pdf/SimpleProposalPdf';
import { extractPassthroughLineItems, calculatePassthroughTotal } from '@/lib/estimate-passthrough';
import { generateProposalWord } from '@/components/word/ProposalWord';
import { ArrowLeft, Download, FileText, ChevronRight } from 'lucide-react';

const fmt = (n: number | null) => '$' + (n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });

const STATUSES = ['draft', 'sent', 'won', 'lost'] as const;
const STATUS_STYLES: Record<string, string> = {
  draft: 'border-[#333] text-[#666]',
  sent: 'border-[#2B4C8C] text-[#2B4C8C]',
  won: 'border-[#4A9E5C] text-[#4A9E5C]',
  lost: 'border-[#D71921] text-[#D71921]',
};

function generateScope(est: Estimate): string[] {
  const lines: string[] = [];
  const shower = est.bath_scope_level === 'shower_only';

  if (est.include_demo !== false) {
    lines.push('DEMO');
    if (est.has_bathrooms) lines.push(shower ? '- Remove shower fixtures, tile, substrate' : '- Remove fixtures, tile, vanity, toilet');
    if (est.has_kitchen) lines.push('- Remove cabinets, countertops, appliances');
    lines.push('- Protect adjacent areas, debris removal');
    lines.push('');
  }

  if (est.include_plumbing !== false) {
    lines.push('PLUMBING');
    if (est.has_bathrooms) {
      lines.push('- Rough-in water supply and drain lines');
      lines.push('- Install shower valve, trim, fixtures');
      if (!shower) lines.push('- Set toilet, install vanity plumbing');
    }
    if (est.has_kitchen) lines.push('- Install sink, faucet, dishwasher/disposal connections');
    lines.push('');
  }

  if (est.include_electrical) {
    lines.push('ELECTRICAL');
    if (est.num_recessed_cans) lines.push(`- ${est.num_recessed_cans} recessed can light(s)`);
    if (est.num_vanity_lights) lines.push(`- ${est.num_vanity_lights} vanity light fixture(s)`);
    if (est.has_bathrooms) lines.push('- Exhaust fan, GFCI outlets');
    if (est.has_kitchen) lines.push('- Dedicated circuits, under-cabinet lighting');
    lines.push('');
  }

  if (est.has_bathrooms && (est.bath_wall_tile_sqft || est.bath_floor_tile_sqft)) {
    lines.push('TILE WORK');
    lines.push('- Waterproofing system (Schluter or equiv.)');
    if (est.bath_wall_tile_sqft) lines.push(`- Wall tile ~${Math.round(est.bath_wall_tile_sqft)} sq ft`);
    if (est.bath_floor_tile_sqft) lines.push(`- Floor tile ~${Math.round(est.bath_floor_tile_sqft)} sq ft`);
    lines.push('- Grout, clean, seal');
    lines.push('');
  }

  if (est.has_bathrooms && est.vanity_size && est.vanity_size !== 'none') {
    lines.push('VANITY & COUNTERTOP');
    lines.push(`- ${est.vanity_size}" vanity w/ quartz top + sink`);
    lines.push('');
  }

  if (est.include_glass || est.bath_uses_frameless_glass) {
    lines.push('SHOWER GLASS');
    lines.push('- Frameless glass enclosure, 3/8" tempered');
    lines.push('');
  }

  if (est.include_paint) {
    lines.push('PAINT & TRIM');
    lines.push('- Walls, ceiling, trim — 2 coats');
    lines.push('- Door trim and baseboards');
    lines.push('');
  }

  if (est.has_kitchen && est.kitchen_uses_tkbso_cabinets) {
    lines.push('CABINETRY');
    lines.push('- KCC cabinet package (installed)');
    lines.push('');
  }

  if (est.has_kitchen && est.kitchen_countertop_sqft) {
    lines.push('COUNTERTOPS');
    lines.push(`- Countertop ~${Math.round(est.kitchen_countertop_sqft)} sq ft`);
    lines.push('');
  }

  return lines;
}

export default function EstimateDetail() {
  const { id } = useParams<{ id: string }>();
  const { contractor } = useAuth();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !contractor) return;

    async function load() {
      const { data: est } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', id)
        .single();

      if (est) setEstimate(est as unknown as Estimate);

      const { data: pc } = await supabase
        .from('pricing_configs')
        .select('*')
        .eq('contractor_id', contractor!.id)
        .single();

      if (pc) setPricingConfig(pc as unknown as PricingConfig);
      setLoading(false);
    }

    load();
  }, [id, contractor]);

  const updateStatus = async (status: string) => {
    if (!estimate) return;
    await supabase.from('estimates').update({ status }).eq('id', estimate.id);
    setEstimate({ ...estimate, status } as Estimate);
    toast.success(`Status updated to ${status}`);
  };

  const downloadPdf = async () => {
    if (!estimate || !contractor) return;
    try {
      const lineItems = extractPassthroughLineItems(estimate);
      const selectedPrice = estimate.final_cp_total || calculatePassthroughTotal(lineItems, false, null);

      const blob = await pdf(
        <SimpleProposalPdf
          estimate={estimate}
          contractor={contractor}
          pricingConfig={pricingConfig}
          selectedPrice={selectedPrice}
          showRange={false}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Estimate_${(estimate.client_name || estimate.id).replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch (err) {
      console.error(err);
      toast.error('PDF generation failed');
    }
  };

  const downloadWord = async () => {
    if (!estimate || !contractor) return;
    try {
      await generateProposalWord({
        estimate,
        contractor,
        pricingConfig,
        selectedPrice: estimate.final_cp_total || 0,
        showRange: false,
      });
      toast.success('Word document downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Word generation failed');
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">[LOADING...]</span>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">[ESTIMATE NOT FOUND]</span>
        <Link to="/estimates" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#2B4C8C] hover:text-white transition-colors">
          ← BACK TO PROJECTS
        </Link>
      </div>
    );
  }

  const scope = generateScope(estimate);
  const total = estimate.final_cp_total || 0;
  const ic = estimate.final_ic_total || 0;
  const margin = total > 0 ? ((total - ic) / total * 100).toFixed(1) : '0';
  const marginColor = parseFloat(margin) >= 35 ? 'text-[#4A9E5C]' : parseFloat(margin) >= 30 ? 'text-[#D4A843]' : 'text-[#D71921]';

  // Payment milestones from internal_json_payload if available
  const payload = estimate.internal_json_payload as any;
  const milestones = payload?.breakdown?.paymentMilestones || [];

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Back */}
        <Link to="/estimates" className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] hover:text-[#E8E8E8] transition-colors mb-8 cursor-pointer">
          <ArrowLeft className="w-3 h-3" strokeWidth={1.5} />
          PROJECTS
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-2xl font-medium text-white tracking-tight">
              {estimate.client_name || estimate.job_label || 'Untitled'}
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mt-1">
              {estimate.property_address || ''} {estimate.property_address ? '·' : ''} {new Date(estimate.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadPdf} className="flex items-center gap-1.5 border border-[#333] text-[#E8E8E8] px-3 py-2 rounded-[4px] font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#111] transition-colors cursor-pointer">
              <Download className="w-3 h-3" strokeWidth={1.5} />
              PDF
            </button>
            <button onClick={downloadWord} className="flex items-center gap-1.5 border border-[#333] text-[#E8E8E8] px-3 py-2 rounded-[4px] font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#111] transition-colors cursor-pointer">
              <FileText className="w-3 h-3" strokeWidth={1.5} />
              WORD
            </button>
          </div>
        </div>

        {/* Price + Status */}
        <div className="flex items-end justify-between mb-10 pb-8 border-b border-[#222]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mb-1">TOTAL</p>
            <p className="font-mono text-[40px] text-white tabular-nums tracking-tight leading-none">
              {fmt(total)}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="font-mono text-[11px] text-[#666] tabular-nums">IC {fmt(ic)}</span>
              <span className={`font-mono text-[11px] tabular-nums ${marginColor}`}>{margin}% MARGIN</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className={`font-mono text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 border rounded-[4px] transition-colors cursor-pointer ${
                  estimate.status === s
                    ? STATUS_STYLES[s] + ' bg-transparent'
                    : 'border-[#222] text-[#444] hover:border-[#333] hover:text-[#666]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Client Info */}
        {(estimate.client_name || estimate.client_phone || estimate.client_email) && (
          <div className="mb-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mb-3">CLIENT</p>
            <div className="space-y-1">
              {estimate.client_name && <p className="text-sm text-[#E8E8E8]">{estimate.client_name}</p>}
              {estimate.client_phone && <p className="text-sm text-[#999]">{estimate.client_phone}</p>}
              {estimate.client_email && <p className="text-sm text-[#999]">{estimate.client_email}</p>}
              {estimate.property_address && <p className="text-sm text-[#999]">{estimate.property_address}</p>}
            </div>
          </div>
        )}

        {/* Scope */}
        <div className="mb-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mb-3">SCOPE OF WORK</p>
          <div className="bg-[#111] border border-[#222] rounded-[12px] p-5">
            {scope.map((line, i) => {
              if (line === '') return <div key={i} className="h-3" />;
              if (!line.startsWith('-')) {
                return <p key={i} className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#999] mt-2 first:mt-0">{line}</p>;
              }
              return <p key={i} className="text-sm text-[#E8E8E8] pl-2 leading-relaxed">{line}</p>;
            })}
          </div>
        </div>

        {/* Trade Breakdown */}
        {payload?.breakdown?.trades && (
          <div className="mb-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mb-3">TRADE BREAKDOWN</p>
            <div className="space-y-0">
              {payload.breakdown.trades
                .filter((t: any) => t.cp > 0 || t.ic > 0)
                .map((t: any, i: number) => (
                  <div key={i} className="flex justify-between py-2 border-b border-[#222] last:border-0">
                    <span className="text-sm text-[#999]">{t.name}</span>
                    <div className="flex gap-4">
                      <span className="font-mono text-sm tabular-nums text-[#E8E8E8]">{fmt(t.cp)}</span>
                      <span className="font-mono text-sm tabular-nums text-[#666] w-20 text-right">{t.ic > 0 ? fmt(t.ic) : ''}</span>
                    </div>
                  </div>
                ))}
              <div className="flex justify-end pt-1 font-mono text-[10px] text-[#666] uppercase tracking-[0.08em]">
                <span className="mr-4">CP</span>
                <span className="w-20 text-right">IC</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Milestones */}
        {milestones.length > 0 && (
          <div className="mb-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mb-3">PAYMENT SCHEDULE</p>
            <div className="space-y-2">
              {milestones.map((m: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className="font-mono text-sm text-[#999]">{m.label} ({m.percent}%)</span>
                  <span className="font-mono text-sm tabular-nums text-[#E8E8E8]">{fmt(m.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {estimate.job_notes && (
          <div className="mb-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mb-3">NOTES</p>
            <p className="text-sm text-[#999] leading-relaxed">{estimate.job_notes}</p>
          </div>
        )}

      </div>
    </div>
  );
}
