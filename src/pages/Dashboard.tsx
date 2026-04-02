import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface EstimateRow {
  id: string;
  job_label: string | null;
  client_name: string | null;
  final_cp_total: number;
  status: string;
  created_at: string;
  project_type: string | null;
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

const STATUS_STYLES: Record<string, string> = {
  draft: 'border-[#333] text-[#666]',
  sent: 'border-[#2B4C8C] text-[#2B4C8C]',
  viewed: 'border-[#D4A843] text-[#D4A843]',
  approved: 'border-[#4A9E5C] text-[#4A9E5C]',
  won: 'border-[#4A9E5C] text-[#4A9E5C]',
  declined: 'border-[#D71921] text-[#D71921]',
  lost: 'border-[#333] text-[#666]',
};

export default function Dashboard() {
  const { contractor, profile } = useAuth();
  const [estimates, setEstimates] = useState<EstimateRow[]>([]);
  const [stats, setStats] = useState({ count: 0, avg: 0, total: 0, won: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!contractor) return;

      const { data } = await supabase
        .from('estimates')
        .select('id, job_label, client_name, final_cp_total, status, created_at, project_type')
        .eq('contractor_id', contractor.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(8);

      if (data) {
        setEstimates(data);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonth = data.filter(e => new Date(e.created_at) >= startOfMonth);
        const total = thisMonth.reduce((s, e) => s + (e.final_cp_total || 0), 0);
        const won = data.filter(e => e.status === 'won' || e.status === 'approved').length;

        setStats({
          count: thisMonth.length,
          avg: thisMonth.length > 0 ? total / thisMonth.length : 0,
          total,
          won,
        });
      }

      setLoading(false);
    }

    fetchData();
  }, [contractor]);

  const firstName = profile?.name?.split(' ')[0] || 'there';
  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';

  return (
    <div className="p-6 md:p-8 bg-black min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-medium text-white tracking-tight">
            Good {greeting}, {firstName}
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mt-1">
            TKBSO QUOTE PRO
          </p>
        </div>
        <Link
          to="/estimator"
          className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#E8E8E8] transition-colors duration-150 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          NEW QUOTE
        </Link>
      </div>

      {/* Stats — 4-column grid with border separation */}
      <div className="grid grid-cols-4 mb-10">
        {[
          { label: 'THIS MONTH', value: String(stats.count), hero: true },
          { label: 'AVG VALUE', value: fmt(stats.avg) },
          { label: 'TOTAL VALUE', value: fmt(stats.total) },
          { label: 'WON', value: String(stats.won) },
        ].map((s, i) => (
          <div
            key={i}
            className={`py-5 ${i > 0 ? 'pl-6 border-l border-[#222]' : ''} ${i < 3 ? 'pr-6' : ''}`}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mb-2">
              {s.label}
            </p>
            <p className={`${s.hero ? 'font-display' : 'font-mono'} text-[28px] text-white tabular-nums tracking-tight`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Quotes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">
            RECENT QUOTES
          </span>
          <Link
            to="/estimates"
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#444] hover:text-[#999] flex items-center gap-1 cursor-pointer transition-colors duration-150"
          >
            VIEW ALL <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">
            [LOADING...]
          </div>
        ) : estimates.length === 0 ? (
          <div className="border border-[#222] rounded-[12px] py-16 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mb-6">
              [NO QUOTES YET]
            </p>
            <Link
              to="/estimator"
              className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#E8E8E8] transition-colors duration-150 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              CREATE FIRST QUOTE
            </Link>
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div className="border-b border-[#333]">
              <div className="grid grid-cols-[1fr_120px_80px_100px_80px] gap-4 px-0 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">CUSTOMER</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] hidden md:block">TYPE</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">STATUS</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] text-right">VALUE</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] text-right hidden sm:block">DATE</span>
              </div>
            </div>

            {/* Table rows */}
            {estimates.map(e => (
              <div
                key={e.id}
                className="grid grid-cols-[1fr_120px_80px_100px_80px] gap-4 py-3 border-b border-[#222] hover:bg-[#111] transition-colors duration-150 cursor-pointer"
              >
                <Link
                  to={`/estimates/${e.id}`}
                  className="text-sm text-[#E8E8E8] hover:text-white transition-colors duration-150 truncate"
                >
                  {e.client_name || e.job_label || 'Untitled'}
                </Link>
                <span className="text-sm text-[#666] capitalize hidden md:block truncate">
                  {e.project_type || '\u2014'}
                </span>
                <span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-[0.06em] border bg-transparent ${STATUS_STYLES[e.status] || STATUS_STYLES.draft}`}>
                    {e.status}
                  </span>
                </span>
                <span className="text-sm text-right font-mono tabular-nums text-[#E8E8E8]">
                  {fmt(e.final_cp_total || 0)}
                </span>
                <span className="font-mono text-[11px] text-[#666] text-right tabular-nums hidden sm:block self-center">
                  {new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
