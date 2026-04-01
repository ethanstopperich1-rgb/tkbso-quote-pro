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
    : '—';

export function PriceSummaryPanel({ state, visible }: Props) {
  const est = calculateEstimate(state);

  const rows: { label: string; value: number; muted?: boolean }[] = [
    { label: 'Materials', value: est.materials },
    { label: 'Labor', value: est.labor },
    { label: 'Add-ons', value: est.extras, muted: est.extras === 0 },
    { label: 'Sales Tax (6.5%)', value: est.tax, muted: true },
  ];

  return (
    <div
      className={cn(
        'transition-all duration-500 ease-out overflow-hidden',
        visible ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'
      )}
    >
      <div className="bg-[#0f0f0f] border border-white/[0.06] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-white/40 font-medium tracking-wide uppercase">
          <TrendingUp className="w-3 h-3" />
          Live Estimate
        </div>

        <div className="space-y-1.5">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className={cn('text-white/40', row.muted && 'text-white/20')}>
                {row.label}
              </span>
              <span
                className={cn(
                  'font-mono tabular-nums',
                  row.muted ? 'text-white/25' : 'text-white/70'
                )}
              >
                {fmt(row.value)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-3 flex justify-between items-baseline">
          <span className="text-xs text-white/40 uppercase tracking-wide font-medium">Total Estimate</span>
          <span className="text-xl font-semibold text-white tabular-nums font-mono">
            {est.total > 0 ? fmt(est.total) : '...'}
          </span>
        </div>

        <p className="text-[10px] text-white/20 leading-relaxed">
          Estimate updates live as you answer. Final quote generated after review.
        </p>
      </div>
    </div>
  );
}
