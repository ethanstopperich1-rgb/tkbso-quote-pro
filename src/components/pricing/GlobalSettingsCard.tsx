import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings, Target, Percent, DollarSign } from 'lucide-react';

export type PricingMode = 'margin_mode' | 'manual_mode';

interface GlobalSettingsCardProps {
  targetMargin: number;
  managementFeePercent: number;
  marketDescription: string;
  pricingMode: PricingMode;
  onTargetMarginChange: (value: number) => void;
  onManagementFeeChange: (value: number) => void;
  onMarketDescriptionChange: (value: string) => void;
  onPricingModeChange: (mode: PricingMode) => void;
  onApplyMarginToAll: () => void;
}

export function GlobalSettingsCard({
  targetMargin,
  managementFeePercent,
  marketDescription,
  pricingMode,
  onTargetMarginChange,
  onManagementFeeChange,
  onMarketDescriptionChange,
  onPricingModeChange,
  onApplyMarginToAll,
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
          Choose how you want to set your sell prices
        </p>
      </div>
      
      {/* Content */}
      <div className="p-5 space-y-6">
        {/* Pricing Mode Toggle */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-slate-700">Pricing Mode</Label>
          <RadioGroup
            value={pricingMode}
            onValueChange={(value) => onPricingModeChange(value as PricingMode)}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <div className={`flex items-start space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
              pricingMode === 'margin_mode' 
                ? 'border-cyan-400 bg-cyan-50/50 ring-1 ring-cyan-400' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}>
              <RadioGroupItem value="margin_mode" id="margin_mode" className="mt-0.5" />
              <div className="flex-1">
                <label htmlFor="margin_mode" className="flex items-center gap-2 font-medium cursor-pointer text-slate-800">
                  <Percent className="h-4 w-4 text-cyan-600" />
                  Margin Mode
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Enter IC → CP auto-calculates using your target margin
                </p>
              </div>
            </div>
            <div className={`flex items-start space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
              pricingMode === 'manual_mode' 
                ? 'border-cyan-400 bg-cyan-50/50 ring-1 ring-cyan-400' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}>
              <RadioGroupItem value="manual_mode" id="manual_mode" className="mt-0.5" />
              <div className="flex-1">
                <label htmlFor="manual_mode" className="flex items-center gap-2 font-medium cursor-pointer text-slate-800">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  Manual Mode
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Enter IC & CP manually → Margin auto-displays
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Target Margin - only active in margin mode */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="targetMargin" className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Target className="h-4 w-4 text-slate-400" />
              Target Margin (%)
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
              {pricingMode === 'margin_mode' && (
                <button
                  onClick={onApplyMarginToAll}
                  className="px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-100 hover:bg-cyan-200 rounded-lg transition-colors"
                >
                  Apply to All
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {pricingMode === 'margin_mode' 
                ? 'CP = IC ÷ (1 - margin%). Click "Apply to All" to update all sell prices.'
                : 'Reference margin. Used for estimate calculations.'}
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