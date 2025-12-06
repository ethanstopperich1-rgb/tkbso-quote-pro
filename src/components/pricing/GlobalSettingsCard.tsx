import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Target, Percent } from 'lucide-react';

interface GlobalSettingsCardProps {
  targetMargin: number;
  managementFeePercent: number;
  marketDescription: string;
  onTargetMarginChange: (value: number) => void;
  onManagementFeeChange: (value: number) => void;
  onMarketDescriptionChange: (value: string) => void;
}

export function GlobalSettingsCard({
  targetMargin,
  managementFeePercent,
  marketDescription,
  onTargetMarginChange,
  onManagementFeeChange,
  onMarketDescriptionChange,
}: GlobalSettingsCardProps) {
  const marginPercent = Math.round(targetMargin * 100);
  const feePercent = Math.round(managementFeePercent * 100);
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-1">
          <Settings className="h-5 w-5 text-cyan-500" />
          <h3 className="text-lg font-bold text-[#0B1C3E]">Global Pricing Defaults</h3>
        </div>
        <p className="text-sm text-slate-500">
          Target margin drives all estimate calculations. CP = IC ÷ (1 - margin)
        </p>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="targetMargin" className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Target className="h-4 w-4 text-slate-400" />
              Target Overall Margin (%)
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="targetMargin"
                type="number"
                min={0}
                max={100}
                value={marginPercent}
                onChange={(e) => onTargetMarginChange(parseFloat(e.target.value) / 100)}
                className="w-24 h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:ring-offset-0 focus:bg-white transition-all"
              />
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                marginPercent >= 35 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {marginPercent}%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              All line items use this margin: CP = IC ÷ (1 - margin%)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="managementFee" className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Percent className="h-4 w-4 text-slate-400" />
              Management Fee (%)
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="managementFee"
                type="number"
                min={0}
                max={50}
                value={feePercent}
                onChange={(e) => onManagementFeeChange(parseFloat(e.target.value) / 100)}
                className="w-24 h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:ring-offset-0 focus:bg-white transition-all"
              />
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                {feePercent}%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Default fee when management fee is enabled on a project.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="marketDescription" className="text-sm font-medium text-slate-700">
              Region / Market Description
            </Label>
            <Textarea
              id="marketDescription"
              value={marketDescription}
              onChange={(e) => onMarketDescriptionChange(e.target.value)}
              placeholder="Describe your market area..."
              rows={3}
              className="resize-none border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:ring-offset-0 focus:bg-white transition-all"
            />
            <p className="text-xs text-slate-500">
              Reference description for your service area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
