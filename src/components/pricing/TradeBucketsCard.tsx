import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, AlertTriangle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PricingMode } from './GlobalSettingsCard';

export interface TradeBucket {
  key: string;
  name: string;
  description: string;
  unit: string;
  icField: string;
  cpField: string;
  icValue: number;
  cpValue: number;
  commonlyForgotten?: boolean;
  isModifier?: boolean;
}

interface TradeBucketsCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buckets: TradeBucket[];
  onChange: (field: string, value: number) => void;
  targetMargin: number;
  pricingMode: PricingMode;
}

function calculateMargin(ic: number, cp: number): number {
  // Handle invalid, NaN, null, undefined values - default to 40% margin
  if (!Number.isFinite(ic) || !Number.isFinite(cp) || ic == null || cp == null) {
    return 0.40;
  }
  if (cp <= 0) return 0.40; // If no sell price, default to target margin
  if (ic <= 0) return 1; // If no cost, 100% margin
  const margin = (cp - ic) / cp;
  // Clamp margin between -1 and 1 to prevent crazy values
  return Math.max(-1, Math.min(1, margin));
}

function calculateCpFromMargin(ic: number, margin: number): number {
  if (!Number.isFinite(ic) || ic <= 0) return 0;
  if (margin >= 1) return ic * 10; // Cap at 90% margin
  if (margin <= 0) return ic; // No margin means CP = IC
  return ic / (1 - margin);
}

function MarginIndicator({ margin }: { margin: number }) {
  // Handle edge cases for display
  const safeMargin = Number.isFinite(margin) ? margin : 0.40;
  const marginPercent = Math.round(safeMargin * 100);
  
  // Updated margin pill logic per requirements
  let colorClass = 'bg-amber-100 text-amber-700'; // 30-40%
  if (safeMargin > 0.40) {
    colorClass = 'bg-emerald-100 text-emerald-700';
  } else if (safeMargin < 0.30) {
    colorClass = 'bg-rose-100 text-rose-700';
  }
  
  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', colorClass)}>
      {marginPercent}%
    </span>
  );
}

export function TradeBucketsCard({
  title,
  description,
  icon,
  buckets,
  onChange,
  targetMargin,
  pricingMode,
}: TradeBucketsCardProps) {
  const isMarginMode = pricingMode === 'margin_mode';

  const handleIcChange = (bucket: TradeBucket, newIc: number) => {
    onChange(bucket.icField, newIc);
    
    // In margin mode, auto-calculate CP when IC changes
    if (isMarginMode) {
      const newCp = calculateCpFromMargin(newIc, targetMargin);
      onChange(bucket.cpField, Math.round(newCp * 100) / 100);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-cyan-500">{icon}</span>
          <h3 className="text-lg font-bold text-[#0B1C3E]">{title}</h3>
          {isMarginMode && (
            <Badge variant="outline" className="ml-2 text-[10px] border-cyan-300 text-cyan-700 bg-cyan-50">
              Auto-CP
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      
      {/* Table */}
      <div className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  Trade Bucket
                </th>
                <th className="text-left py-3 px-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  Unit
                </th>
                <th className="text-right py-3 px-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  Cost ($)
                </th>
                <th className="text-right py-3 px-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  <div className="flex items-center justify-end gap-1">
                    Sell Price ($)
                    {isMarginMode && <Lock className="h-3 w-3 text-slate-400" />}
                  </div>
                </th>
                <th className="text-right py-3 px-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  Margin
                </th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((bucket) => {
                const margin = calculateMargin(bucket.icValue, bucket.cpValue);
                const hasWarning = bucket.cpValue < bucket.icValue;
                
                return (
                  <tr key={bucket.key} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-800">{bucket.name}</span>
                        {bucket.commonlyForgotten && (
                          <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-700 bg-amber-50">
                            Often Missed
                          </Badge>
                        )}
                        {bucket.isModifier && (
                          <Badge variant="outline" className="text-[9px] border-purple-300 text-purple-700 bg-purple-50">
                            Modifier
                          </Badge>
                        )}
                        {hasWarning && (
                          <AlertTriangle className="h-4 w-4 text-rose-500" />
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help hover:text-slate-600 transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[280px] text-xs">
                            {bucket.description}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wide text-slate-500 border-slate-200 bg-slate-50">
                        {bucket.unit}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Input
                        type="number"
                        value={bucket.icValue}
                        onChange={(e) => handleIcChange(bucket, parseFloat(e.target.value) || 0)}
                        className="w-24 text-right h-9 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:ring-offset-0 focus:bg-white transition-all"
                        step="0.5"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <Input
                        type="number"
                        value={bucket.cpValue}
                        onChange={(e) => onChange(bucket.cpField, parseFloat(e.target.value) || 0)}
                        disabled={isMarginMode}
                        className={cn(
                          'w-24 text-right h-9 border-0 rounded-lg transition-all',
                          isMarginMode 
                            ? 'bg-slate-50 text-slate-500 cursor-not-allowed' 
                            : 'bg-slate-100 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-0 focus:bg-white',
                          hasWarning && !isMarginMode && 'ring-2 ring-rose-300 bg-rose-50'
                        )}
                        step="0.5"
                      />
                    </td>
                    <td className="py-3 px-2 text-right">
                      <MarginIndicator margin={margin} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Legend */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-100" />
            <span>&gt;40% margin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-100" />
            <span>30-40% margin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-100" />
            <span>&lt;30% margin</span>
          </div>
        </div>
      </div>
    </div>
  );
}