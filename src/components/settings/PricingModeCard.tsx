import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Building2, Wrench, RefreshCw, Check } from 'lucide-react';

interface Props {
  contractorId: string;
  initialMode?: string;
}

export function PricingModeCard({ contractorId, initialMode = 'ic_and_cp' }: Props) {
  const [pricingMode, setPricingMode] = useState(initialMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialMode) {
      setPricingMode(initialMode);
    }
  }, [initialMode]);

  const handleModeChange = async (newMode: string) => {
    setPricingMode(newMode);
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('contractors')
        .update({ pricing_mode: newMode })
        .eq('id', contractorId);
      
      if (error) throw error;
      
      toast.success(
        newMode === 'ic_and_cp' 
          ? 'Switched to General Contractor mode'
          : 'Switched to Trade Contractor mode'
      );
    } catch (error) {
      console.error('Error updating pricing mode:', error);
      toast.error('Failed to update account type');
      setPricingMode(initialMode); // Revert on error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-1">
          <Building2 className="h-5 w-5 text-cyan-500" />
          <h3 className="text-lg font-bold text-[#0B1C3E]">Account Type</h3>
          {saving && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
        </div>
        <p className="text-sm text-slate-500">Choose how you want to view pricing in estimates</p>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <RadioGroup
          value={pricingMode}
          onValueChange={handleModeChange}
          className="space-y-3"
        >
          {/* GC Mode */}
          <label 
            htmlFor="gc-mode"
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              pricingMode === 'ic_and_cp' 
                ? 'border-cyan-500 bg-cyan-50/50' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <RadioGroupItem value="ic_and_cp" id="gc-mode" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-slate-600" />
                <span className="font-semibold text-slate-900">General Contractor</span>
                {pricingMode === 'ic_and_cp' && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-cyan-100 text-cyan-700 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600">
                Full visibility into costs and margins. Shows both Internal Cost (IC) and Customer Price (CP).
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded">Internal Cost</span>
                <span className="px-2 py-1 text-xs bg-sky-100 text-sky-700 rounded">Customer Price</span>
                <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded">Margin %</span>
              </div>
            </div>
          </label>
          
          {/* Trade Mode */}
          <label 
            htmlFor="trade-mode"
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              pricingMode === 'cp_only' 
                ? 'border-cyan-500 bg-cyan-50/50' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <RadioGroupItem value="cp_only" id="trade-mode" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="h-4 w-4 text-slate-600" />
                <span className="font-semibold text-slate-900">Trade Contractor</span>
                {pricingMode === 'cp_only' && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-cyan-100 text-cyan-700 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600">
                Simplified view showing only customer-facing prices. Best for subcontractors or single-trade businesses.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs bg-sky-100 text-sky-700 rounded">Customer Price Only</span>
              </div>
            </div>
          </label>
        </RadioGroup>
        
        <p className="text-xs text-slate-400 mt-4 text-center">
          This affects how pricing displays throughout the app. You can change this anytime.
        </p>
      </div>
    </div>
  );
}
