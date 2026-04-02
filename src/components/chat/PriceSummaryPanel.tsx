import { cn } from '@/lib/utils';
import { calculateEstimate, type EstimateState } from '@/lib/chatFlow';
import { TrendingUp } from 'lucide-react';

interface Props {
  state: Partial<EstimateState>;
  visible: boolean;
}

const fmt = (n: number) =>
  n > 0
    ? '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : '\u2014';

export function PriceSummaryPanel({ state, visible }: Props) {
  const est = calculateEstimate(state);
  const hasTrades = est.trades.length > 0;

  const marginColor =
    est.marginPercent >= 0.35 ? 'text-emerald-600'
    : est.marginPercent >= 0.30 ? 'text-amber-600'
    : est.marginPercent > 0 ? 'text-red-600'
    : 'text-slate-300';

  return (
    <div
      className={cn(
        'transition-all duration-500 ease-out overflow-hidden',
        visible ? 'opacity-100 max-h-[600px]' : 'opacity-0 max-h-0'
      )}
    >
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium tracking-wide uppercase">
          <TrendingUp className="w-3 h-3" />
          Live Estimate
        </div>

        {/* Trade breakdown */}
        {hasTrades && (
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {est.trades
              .filter((t) => t.cp > 0 || t.ic > 0)
              .map((t, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-slate-500 truncate mr-2">{t.name}</span>
                  <div className="flex gap-3 flex-shrink-0">
                    <span className="font-mono tabular-nums text-slate-700">
                      {fmt(t.cp)}
                    </span>
                    <span className="font-mono tabular-nums text-slate-400 w-16 text-right">
                      {t.ic > 0 ? fmt(t.ic) : ''}
                    </span>
                  </div>
                </div>
              ))}

            {/* Column headers */}
            <div className="flex justify-end text-[10px] text-slate-400 pt-1 border-t border-slate-200">
              <span className="mr-3">CP</span>
              <span className="w-16 text-right">IC</span>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="border-t border-slate-200 pt-3 space-y-1.5">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
              Total CP
            </span>
            <span className="text-xl font-semibold text-slate-900 tabular-nums font-mono">
              {est.subtotalCp > 0 ? fmt(est.subtotalCp) : '...'}
            </span>
          </div>

          {est.subtotalIc > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total IC</span>
              <span className="font-mono tabular-nums text-slate-400">
                {fmt(est.subtotalIc)}
              </span>
            </div>
          )}

          {est.marginPercent > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Margin</span>
              <span className={cn('font-mono tabular-nums', marginColor)}>
                {fmt(est.margin)} ({(est.marginPercent * 100).toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        {/* Payment milestones */}
        {est.paymentMilestones.length > 0 && est.subtotalCp > 0 && (
          <div className="border-t border-slate-200 pt-2 space-y-1">
            {est.paymentMilestones.map((m, i) => (
              <div key={i} className="flex justify-between text-[11px]">
                <span className="text-slate-400">
                  {m.label} ({m.percent}%)
                </span>
                <span className="font-mono tabular-nums text-slate-500">
                  {fmt(m.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="text-[10px] text-slate-400 leading-relaxed">
          Real TKBSO trade pricing. IC = internal cost. CP = client price.
        </p>
      </div>
    </div>
  );
}
