import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText, TrendingUp, DollarSign, Clock, Plus, ArrowRight } from "lucide-react";
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

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  sent: 'bg-blue-50 text-blue-600',
  viewed: 'bg-amber-50 text-amber-600',
  approved: 'bg-emerald-50 text-emerald-600',
  won: 'bg-emerald-50 text-emerald-700',
  declined: 'bg-red-50 text-red-600',
  lost: 'bg-slate-100 text-slate-400',
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

  return (
    <div className="p-6 md:p-8 bg-white min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">TKBSO Quote Pro</p>
        </div>
        <Link
          to="/estimator"
          className="inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Quote
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-px bg-slate-200 rounded-lg overflow-hidden mb-8">
        {[
          { label: 'This Month', value: stats.count, icon: FileText },
          { label: 'Avg Value', value: fmt(stats.avg), icon: TrendingUp },
          { label: 'Total Value', value: fmt(stats.total), icon: DollarSign },
          { label: 'Won', value: stats.won, icon: MessageSquare },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{s.label}</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{s.value}</p>
              </div>
              <s.icon className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Quotes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent Quotes</h2>
          <Link to="/estimates" className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading...</div>
        ) : estimates.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-lg py-16 text-center">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">No quotes yet</p>
            <Link
              to="/estimator"
              className="inline-flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create First Quote
            </Link>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">Customer</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">Status</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">Value</th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estimates.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/estimates/${e.id}`} className="text-slate-900 font-medium hover:text-slate-600 cursor-pointer">
                        {e.client_name || e.job_label || 'Untitled'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400 capitalize hidden md:table-cell">
                      {e.project_type || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${STATUS_COLORS[e.status] || STATUS_COLORS.draft}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 tabular-nums">
                      {fmt(e.final_cp_total || 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 hidden sm:table-cell">
                      <span className="flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
