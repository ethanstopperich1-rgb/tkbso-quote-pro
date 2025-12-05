import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Palette } from 'lucide-react';

interface AllowanceItem {
  key: string;
  label: string;
  field: string;
  value: number;
  unit: string;
  description: string;
}

interface AllowancesCardProps {
  allowances: AllowanceItem[];
  onChange: (field: string, value: number) => void;
}

export function AllowancesCard({ allowances, onChange }: AllowancesCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-1">
          <Palette className="h-5 w-5 text-cyan-500" />
          <h3 className="text-lg font-bold text-[#0B1C3E]">Allowances (Material Only)</h3>
        </div>
        <p className="text-sm text-slate-500">
          Client-facing material allowances. These are included in customer quotes as line items.
        </p>
      </div>
      
      {/* Grid Layout - Shopping Catalog Style */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allowances.map((item) => (
            <div 
              key={item.key} 
              className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
            >
              {/* Label with Tooltip */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help hover:text-slate-600 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[280px] text-xs">
                    {item.description}
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {/* Price Input + Unit */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                  <Input
                    type="number"
                    value={item.value}
                    onChange={(e) => onChange(item.field, parseFloat(e.target.value) || 0)}
                    className="pl-7 h-10 border-0 bg-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:ring-offset-0 transition-all text-slate-800 font-medium"
                    step="0.5"
                  />
                </div>
                <span className="px-2.5 py-1.5 bg-slate-200 text-slate-600 text-[10px] uppercase tracking-wide font-semibold rounded-lg whitespace-nowrap">
                  {item.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
