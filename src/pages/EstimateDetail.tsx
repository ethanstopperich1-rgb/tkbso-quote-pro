import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Estimate, PricingConfig } from '@/types/database';
import { SimpleProposalPdf } from '@/components/pdf/SimpleProposalPdf';
import { extractPassthroughLineItems, calculatePassthroughTotal } from '@/lib/estimate-passthrough';
import { generateProposalWord } from '@/components/word/ProposalWord';
import { ArrowLeft, Download, FileText, Edit2, Check, X } from 'lucide-react';

const fmt = (n: number | null) => '$' + (n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });

const STATUSES = ['draft', 'sent', 'won', 'lost'] as const;
const STATUS_STYLES: Record<string, string> = {
  draft: 'border-[#333] text-[#666]',
  sent: 'border-[#2B4C8C] text-[#2B4C8C]',
  won: 'border-[#4A9E5C] text-[#4A9E5C]',
  lost: 'border-[#D71921] text-[#D71921]',
};

// Nothing-style inline input
function InlineInput({ value, onChange, placeholder, type = 'text', className = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-transparent border-b border-[#333] focus:border-[#2B4C8C] outline-none text-sm text-[#E8E8E8] py-1 w-full transition-colors duration-150 placeholder:text-[#444] ${className}`}
    />
  );
}

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
    lines.push('- Walls, ceiling, trim \u2014 2 coats');
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

  // Edit states
  const [editingClient, setEditingClient] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);

  // Editable fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [priceValue, setPriceValue] = useState('');
  const [notesValue, setNotesValue] = useState('');

  useEffect(() => {
    if (!id || !contractor) return;

    async function load() {
      const { data: est } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', id)
        .single();

      if (est) {
        const e = est as unknown as Estimate;
        setEstimate(e);
        setClientName(e.client_name || '');
        setClientPhone(e.client_phone || '');
        setClientEmail(e.client_email || '');
        setClientAddress(e.property_address || '');
        setPriceValue(String(e.final_cp_total || 0));
        setNotesValue(e.job_notes || '');
      }

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

  const saveField = useCallback(async (updates: Record<string, unknown>) => {
    if (!estimate) return;
    const { error } = await supabase.from('estimates').update(updates).eq('id', estimate.id);
    if (error) {
      toast.error('Save failed');
      return;
    }
    setEstimate({ ...estimate, ...updates } as Estimate);
    toast.success('[SAVED]');
  }, [estimate]);

  const saveClient = () => {
    saveField({ client_name: clientName, client_phone: clientPhone, client_email: clientEmail, property_address: clientAddress });
    setEditingClient(false);
  };

  const savePrice = () => {
    const num = parseFloat(priceValue.replace(/[$,]/g, '')) || 0;
    saveField({
      final_cp_total: num,
      low_estimate_cp: Math.round(num * 0.95),
      high_estimate_cp: Math.round(num * 1.05),
    });
    setEditingPrice(false);
  };

  const saveNotes = () => {
    saveField({ job_notes: notesValue });
    setEditingNotes(false);
  };

  const updateStatus = async (status: string) => {
    if (!estimate) return;
    await supabase.from('estimates').update({ status }).eq('id', estimate.id);
    setEstimate({ ...estimate, status } as Estimate);
    toast.success(`[${status.toUpperCase()}]`);
  };

  const downloadPdf = async () => {
    if (!estimate || !contractor) return;
    try {
      const lineItems = extractPassthroughLineItems(estimate);
      const selectedPrice = estimate.final_cp_total || calculatePassthroughTotal(lineItems, false, null);
      const blob = await pdf(
        <SimpleProposalPdf estimate={estimate} contractor={contractor} pricingConfig={pricingConfig} selectedPrice={selectedPrice} showRange={false} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Estimate_${(estimate.client_name || estimate.id).replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('[PDF DOWNLOADED]');
    } catch (err) {
      console.error(err);
      toast.error('[PDF FAILED]');
    }
  };

  const downloadWord = async () => {
    if (!estimate || !contractor) return;
    try {
      await generateProposalWord({ estimate, contractor, pricingConfig, selectedPrice: estimate.final_cp_total || 0, showRange: false });
      toast.success('[WORD DOWNLOADED]');
    } catch (err) {
      console.error(err);
      toast.error('[WORD FAILED]');
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
        <Link to="/estimates" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#2B4C8C] hover:text-white transition-colors cursor-pointer">
          \u2190 BACK TO PROJECTS
        </Link>
      </div>
    );
  }

  const scope = generateScope(estimate);
  const total = estimate.final_cp_total || 0;
  const ic = estimate.final_ic_total || 0;
  const margin = total > 0 ? ((total - ic) / total * 100).toFixed(1) : '0';
  const marginColor = parseFloat(margin) >= 35 ? 'text-[#4A9E5C]' : parseFloat(margin) >= 30 ? 'text-[#D4A843]' : 'text-[#D71921]';
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
              {estimate.property_address || ''} {estimate.property_address ? '\u00b7' : ''} {new Date(estimate.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
            <div className="flex items-center gap-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">TOTAL</p>
              {!editingPrice && (
                <button onClick={() => setEditingPrice(true)} className="text-[#444] hover:text-[#999] transition-colors cursor-pointer">
                  <Edit2 className="w-3 h-3" strokeWidth={1.5} />
                </button>
              )}
            </div>
            {editingPrice ? (
              <div className="flex items-end gap-2 mt-1">
                <span className="font-mono text-[28px] text-[#666]">$</span>
                <input
                  type="text"
                  value={priceValue}
                  onChange={e => setPriceValue(e.target.value)}
                  className="bg-transparent border-b-2 border-[#2B4C8C] outline-none font-mono text-[28px] text-white tabular-nums w-40"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && savePrice()}
                />
                <button onClick={savePrice} className="text-[#4A9E5C] hover:text-white mb-2 cursor-pointer"><Check className="w-4 h-4" strokeWidth={1.5} /></button>
                <button onClick={() => { setPriceValue(String(total)); setEditingPrice(false); }} className="text-[#666] hover:text-white mb-2 cursor-pointer"><X className="w-4 h-4" strokeWidth={1.5} /></button>
              </div>
            ) : (
              <p className="font-mono text-[40px] text-white tabular-nums tracking-tight leading-none cursor-pointer" onClick={() => setEditingPrice(true)}>
                {fmt(total)}
              </p>
            )}
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
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">CLIENT</p>
            {!editingClient ? (
              <button onClick={() => setEditingClient(true)} className="text-[#444] hover:text-[#999] transition-colors cursor-pointer">
                <Edit2 className="w-3 h-3" strokeWidth={1.5} />
              </button>
            ) : (
              <div className="flex gap-1">
                <button onClick={saveClient} className="text-[#4A9E5C] hover:text-white cursor-pointer"><Check className="w-3 h-3" strokeWidth={1.5} /></button>
                <button onClick={() => setEditingClient(false)} className="text-[#666] hover:text-white cursor-pointer"><X className="w-3 h-3" strokeWidth={1.5} /></button>
              </div>
            )}
          </div>
          {editingClient ? (
            <div className="space-y-3 max-w-sm">
              <InlineInput value={clientName} onChange={setClientName} placeholder="Full name" />
              <InlineInput value={clientPhone} onChange={setClientPhone} placeholder="Phone" type="tel" />
              <InlineInput value={clientEmail} onChange={setClientEmail} placeholder="Email" type="email" />
              <InlineInput value={clientAddress} onChange={setClientAddress} placeholder="Property address" />
            </div>
          ) : (
            <div className="space-y-1">
              {estimate.client_name && <p className="text-sm text-[#E8E8E8]">{estimate.client_name}</p>}
              {estimate.client_phone && <p className="text-sm text-[#999]">{estimate.client_phone}</p>}
              {estimate.client_email && <p className="text-sm text-[#999]">{estimate.client_email}</p>}
              {estimate.property_address && <p className="text-sm text-[#999]">{estimate.property_address}</p>}
              {!estimate.client_name && !estimate.client_phone && (
                <button onClick={() => setEditingClient(true)} className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#444] hover:text-[#999] cursor-pointer">
                  + ADD CLIENT INFO
                </button>
              )}
            </div>
          )}
        </div>

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
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">NOTES</p>
            {!editingNotes ? (
              <button onClick={() => setEditingNotes(true)} className="text-[#444] hover:text-[#999] transition-colors cursor-pointer">
                <Edit2 className="w-3 h-3" strokeWidth={1.5} />
              </button>
            ) : (
              <div className="flex gap-1">
                <button onClick={saveNotes} className="text-[#4A9E5C] hover:text-white cursor-pointer"><Check className="w-3 h-3" strokeWidth={1.5} /></button>
                <button onClick={() => { setNotesValue(estimate.job_notes || ''); setEditingNotes(false); }} className="text-[#666] hover:text-white cursor-pointer"><X className="w-3 h-3" strokeWidth={1.5} /></button>
              </div>
            )}
          </div>
          {editingNotes ? (
            <textarea
              value={notesValue}
              onChange={e => setNotesValue(e.target.value)}
              rows={4}
              className="w-full bg-[#111] border border-[#222] rounded-[8px] p-3 text-sm text-[#E8E8E8] placeholder:text-[#444] outline-none focus:border-[#2B4C8C] transition-colors resize-none"
              placeholder="Add notes about this project..."
              autoFocus
            />
          ) : (
            <div>
              {estimate.job_notes ? (
                <p className="text-sm text-[#999] leading-relaxed cursor-pointer" onClick={() => setEditingNotes(true)}>{estimate.job_notes}</p>
              ) : (
                <button onClick={() => setEditingNotes(true)} className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#444] hover:text-[#999] cursor-pointer">
                  + ADD NOTES
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
