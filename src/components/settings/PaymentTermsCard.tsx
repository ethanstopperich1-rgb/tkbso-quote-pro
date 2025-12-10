import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, AlertCircle } from 'lucide-react';
import { BusinessDefaults } from '@/types/settings';

interface Props {
  data: BusinessDefaults;
  onChange: (data: BusinessDefaults) => void;
}

export function PaymentTermsCard({ data, onChange }: Props) {
  const update = (field: keyof BusinessDefaults, value: number | string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const total = data.depositPct + data.progressPct + data.finalPct;
  const isValid = total === 100;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-1">
          <CreditCard className="h-5 w-5 text-cyan-500" />
          <h3 className="text-lg font-bold text-[#0B1C3E]">Default Payment Terms</h3>
        </div>
        <p className="text-sm text-slate-500">Configure payment schedule for your proposals</p>
      </div>
      
      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Payment Split Row */}
        <div>
          <Label className="text-slate-700 text-sm mb-3 block">Payment Schedule (must equal 100%)</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Deposit</span>
                <span className="text-xs font-semibold text-emerald-600">{data.depositPct}%</span>
              </div>
              <Input
                type="number"
                min={0}
                max={100}
                value={data.depositPct}
                onChange={(e) => update('depositPct', parseInt(e.target.value) || 0)}
                className="h-10 border-0 bg-slate-100 rounded-lg text-center focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
              <Input
                type="text"
                value={data.depositLabel || 'Due at signing'}
                onChange={(e) => update('depositLabel', e.target.value)}
                placeholder="Due at signing"
                maxLength={50}
                className="h-7 text-[10px] text-slate-500 border-0 bg-transparent text-center focus:ring-1 focus:ring-cyan-400 focus:bg-slate-50 transition-all px-1"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Start</span>
                <span className="text-xs font-semibold text-amber-600">{data.progressPct}%</span>
              </div>
              <Input
                type="number"
                min={0}
                max={100}
                value={data.progressPct}
                onChange={(e) => update('progressPct', parseInt(e.target.value) || 0)}
                className="h-10 border-0 bg-slate-100 rounded-lg text-center focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Completion</span>
                <span className="text-xs font-semibold text-sky-600">{data.finalPct}%</span>
              </div>
              <Input
                type="number"
                min={0}
                max={100}
                value={data.finalPct}
                onChange={(e) => update('finalPct', parseInt(e.target.value) || 0)}
                className="h-10 border-0 bg-slate-100 rounded-lg text-center focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
              <Input
                type="text"
                value={data.finalLabel || 'Due at completion'}
                onChange={(e) => update('finalLabel', e.target.value)}
                placeholder="Due at completion"
                maxLength={50}
                className="h-7 text-[10px] text-slate-500 border-0 bg-transparent text-center focus:ring-1 focus:ring-cyan-400 focus:bg-slate-50 transition-all px-1"
              />
            </div>
          </div>
          
          {/* Total Indicator */}
          <div className={`mt-3 flex items-center gap-2 text-sm ${isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
            {!isValid && <AlertCircle className="h-4 w-4" />}
            <span className="font-medium">Total: {total}%</span>
            {!isValid && <span className="text-xs">(must equal 100%)</span>}
          </div>
        </div>

        {/* Visual Bar */}
        <div className="h-3 rounded-full overflow-hidden flex bg-slate-100">
          <div 
            className="bg-emerald-500 transition-all" 
            style={{ width: `${data.depositPct}%` }}
          />
          <div 
            className="bg-amber-500 transition-all" 
            style={{ width: `${data.progressPct}%` }}
          />
          <div 
            className="bg-sky-500 transition-all" 
            style={{ width: `${data.finalPct}%` }}
          />
        </div>

        {/* Project-Type Progress Labels */}
        <div className="space-y-3 pt-2">
          <Label className="text-slate-700 text-sm">Progress Payment Descriptions (by project type)</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-600">Kitchen Projects</span>
              <Input
                type="text"
                value={data.progressLabelKitchen || 'Due at arrival of cabinetry'}
                onChange={(e) => update('progressLabelKitchen', e.target.value)}
                placeholder="Due at arrival of cabinetry"
                maxLength={60}
                className="h-9 text-sm border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-600">Bathroom Projects</span>
              <Input
                type="text"
                value={data.progressLabelBathroom || 'Due at start of tile installation'}
                onChange={(e) => update('progressLabelBathroom', e.target.value)}
                placeholder="Due at start of tile installation"
                maxLength={60}
                className="h-9 text-sm border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400">These labels appear on PDF payment schedules based on project type</p>
        </div>

        {/* Legal Disclaimer */}
        <div className="space-y-2 pt-2">
          <Label htmlFor="termsText" className="text-slate-700 text-sm">Legal Disclaimer Footer</Label>
          <Textarea
            id="termsText"
            value={data.termsText}
            onChange={(e) => update('termsText', e.target.value)}
            placeholder="Payment due upon receipt. All prices valid for 30 days from proposal date. Work subject to material availability..."
            rows={3}
            className="border-0 bg-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:bg-white transition-all resize-none"
          />
          <p className="text-xs text-slate-400">This text appears at the bottom of your proposal PDFs</p>
        </div>
      </div>
    </div>
  );
}