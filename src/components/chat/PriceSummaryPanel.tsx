import { cn } from '@/lib/utils';
import { calculateEstimate, type EstimateState } from '@/lib/chatFlow';

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
    est.marginPercent >= 0.35 ? 'text-[#4A9E5C]'
    : est.marginPercent >= 0.30 ? 'text-[#D4A843]'
    : est.marginPercent > 0 ? 'text-[#D71921]'
    : 'text-[#666]';

  return (
    <div
      className={cn(
        'transition-all duration-500 ease-out overflow-hidden',
        visible ? 'opacity-100 max-h-[600px]' : 'opacity-0 max-h-0'
      )}
    >
      <div className="bg-[#111] border border-[#222] rounded-[12px] p-4 space-y-3">
        {/* Label */}
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#999]">
          LIVE ESTIMATE
        </span>

        {/* Trade breakdown */}
        {hasTrades && (
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {est.trades
              .filter((t) => t.cp > 0 || t.ic > 0)
              .map((t, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-[#999] truncate mr-2">{t.name}</span>
                  <div className="flex gap-3 flex-shrink-0">
                    <span className="font-mono tabular-nums text-[#E8E8E8]">
                      {fmt(t.cp)}
                    </span>
                    <span className="font-mono tabular-nums text-[#666] w-16 text-right">
                      {t.ic > 0 ? fmt(t.ic) : ''}
                    </span>
                  </div>
                </div>
              ))}

            {/* Column headers */}
            <div className="flex justify-end font-mono text-[10px] text-[#666] pt-1 border-t border-[#222] uppercase tracking-[0.08em]">
              <span className="mr-3">CP</span>
              <span className="w-16 text-right">IC</span>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="border-t border-[#222] pt-3 space-y-1.5">
          <div className="flex justify-between items-baseline">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#999]">
              TOTAL CP
            </span>
            <span className="font-mono text-2xl font-bold text-white tabular-nums">
              {est.subtotalCp > 0 ? fmt(est.subtotalCp) : '...'}
            </span>
          </div>

          {est.subtotalIc > 0 && (
            <div className="flex justify-between text-xs">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">TOTAL IC</span>
              <span className="font-mono tabular-nums text-[#666]">
                {fmt(est.subtotalIc)}
              </span>
            </div>
          )}

          {est.marginPercent > 0 && (
            <div className="flex justify-between text-xs">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">MARGIN</span>
              <span className={cn('font-mono tabular-nums', marginColor)}>
                {fmt(est.margin)} ({(est.marginPercent * 100).toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        {/* Payment milestones */}
        {est.paymentMilestones.length > 0 && est.subtotalCp > 0 && (
          <div className="border-t border-[#222] pt-2 space-y-1">
            {est.paymentMilestones.map((m, i) => (
              <div key={i} className="flex justify-between text-[11px]">
                <span className="font-mono text-[#666] uppercase tracking-[0.08em]">
                  {m.label} ({m.percent}%)
                </span>
                <span className="font-mono tabular-nums text-[#666]">
                  {fmt(m.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="font-mono text-[10px] text-[#444] leading-relaxed uppercase tracking-[0.05em]">
          REAL TKBSO TRADE PRICING. IC = INTERNAL COST. CP = CLIENT PRICE.
        </p>
      </div>
    </div>
  );
}
