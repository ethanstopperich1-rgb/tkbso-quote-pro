import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings2, Calendar, DollarSign, FileSignature, ListChecks, TrendingUp } from 'lucide-react';
import { BusinessDefaults } from '@/types/settings';

interface Props {
  data: BusinessDefaults;
  onChange: (data: BusinessDefaults) => void;
}

export function EstimateDefaultsCard({ data, onChange }: Props) {
  const update = (field: keyof BusinessDefaults, value: number | string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-1">
          <Settings2 className="h-5 w-5 text-cyan-500" />
          <h3 className="text-lg font-bold text-[#0B1C3E]">Estimate Defaults</h3>
        </div>
        <p className="text-sm text-slate-500">Configure default settings for new estimates</p>
      </div>
      
      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Minimum Job & Expiration Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <Label htmlFor="minJobCp" className="text-sm font-medium text-slate-700">
                Minimum Job Size
              </Label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <Input
                id="minJobCp"
                type="number"
                min={0}
                step={500}
                value={data.minJobCp}
                onChange={(e) => update('minJobCp', parseInt(e.target.value) || 0)}
                className="pl-7 h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
            <p className="text-xs text-slate-400">Jobs below this show the minimum price</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <Label htmlFor="expirationDays" className="text-sm font-medium text-slate-700">
                Estimate Valid For
              </Label>
            </div>
            <div className="relative">
              <Input
                id="expirationDays"
                type="number"
                min={1}
                max={365}
                value={data.estimateExpirationDays}
                onChange={(e) => update('estimateExpirationDays', parseInt(e.target.value) || 30)}
                className="h-10 border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">days</span>
            </div>
            <p className="text-xs text-slate-400">Shown on PDF proposals</p>
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-4 pt-2">
          <Label className="text-sm font-medium text-slate-700">Proposal Requirements</Label>
          
          <div className="space-y-3">
            {/* Require Signed Proposal */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <FileSignature className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Require Signed Proposal</p>
                  <p className="text-xs text-slate-500">Show signature section on proposals</p>
                </div>
              </div>
              <Switch
                checked={data.requireSignedProposal}
                onCheckedChange={(checked) => update('requireSignedProposal', checked)}
              />
            </div>
            
            {/* Require Fixture Selections */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <ListChecks className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Require Fixture Selections</p>
                  <p className="text-xs text-slate-500">Clients must confirm fixture choices before signing</p>
                </div>
              </div>
              <Switch
                checked={data.requireFixtureSelections}
                onCheckedChange={(checked) => update('requireFixtureSelections', checked)}
              />
            </div>
            
            {/* Show Market Comparison */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Show Market Comparison</p>
                  <p className="text-xs text-slate-500">Display how your pricing compares to market average</p>
                </div>
              </div>
              <Switch
                checked={data.showMarketComparison}
                onCheckedChange={(checked) => update('showMarketComparison', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
