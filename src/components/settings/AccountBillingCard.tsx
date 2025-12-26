import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  CreditCard, 
  Sparkles, 
  TrendingUp, 
  FileText, 
  Users, 
  HardDrive,
  ExternalLink,
  Check,
  Clock,
  RefreshCw
} from 'lucide-react';

interface Props {
  contractorId: string;
}

interface UsageStats {
  estimatesThisMonth: number;
  teamMembers: number;
  storageUsedMb: number;
}

export function AccountBillingCard({ contractorId }: Props) {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageStats>({
    estimatesThisMonth: 0,
    teamMembers: 1,
    storageUsedMb: 0,
  });

  useEffect(() => {
    async function fetchUsage() {
      if (!contractorId) return;
      
      try {
        // Get estimate count for this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { count: estimateCount } = await supabase
          .from('estimates')
          .select('*', { count: 'exact', head: true })
          .eq('contractor_id', contractorId)
          .gte('created_at', startOfMonth.toISOString());

        // Get team member count (profiles with this contractor_id)
        const { count: memberCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('contractor_id', contractorId);

        setUsage({
          estimatesThisMonth: estimateCount || 0,
          teamMembers: memberCount || 1,
          storageUsedMb: 0, // Would need storage bucket query
        });
      } catch (error) {
        console.error('Error fetching usage:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsage();
  }, [contractorId]);

  // Mock plan data - in production this would come from Stripe
  const plan = {
    name: 'Pro',
    price: 149,
    interval: 'month',
    status: 'active',
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    features: [
      'Unlimited estimates',
      'Up to 3 team members',
      '10 GB storage',
      'PDF proposals',
      'Email support'
    ]
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 mb-1">
            <Sparkles className="h-5 w-5 text-cyan-500" />
            <h3 className="text-lg font-bold text-[#0B1C3E]">Current Plan</h3>
          </div>
          <p className="text-sm text-slate-500">Manage your subscription and billing</p>
        </div>
        
        <div className="p-5">
          {/* Plan Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h4 className="text-2xl font-bold text-[#0B1C3E]">{plan.name}</h4>
                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Active
                </span>
              </div>
              <p className="text-slate-500 mt-1">
                <span className="text-2xl font-bold text-[#0B1C3E]">${plan.price}</span>
                <span className="text-sm">/{plan.interval}</span>
              </p>
            </div>
            <Button variant="outline" className="border-slate-200 hover:border-cyan-300 hover:text-cyan-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </div>

          {/* Next Billing */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-6 p-3 bg-slate-50 rounded-xl">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>Next billing date: <strong>{plan.nextBillingDate}</strong></span>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2">
            {plan.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 mb-1">
            <TrendingUp className="h-5 w-5 text-cyan-500" />
            <h3 className="text-lg font-bold text-[#0B1C3E]">Usage This Month</h3>
          </div>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4">
            {/* Estimates */}
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <FileText className="h-6 w-6 mx-auto text-cyan-500 mb-2" />
              <p className="text-2xl font-bold text-[#0B1C3E]">{usage.estimatesThisMonth}</p>
              <p className="text-xs text-slate-500">Estimates Created</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Unlimited</p>
            </div>
            
            {/* Team Members */}
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <Users className="h-6 w-6 mx-auto text-cyan-500 mb-2" />
              <p className="text-2xl font-bold text-[#0B1C3E]">{usage.teamMembers}</p>
              <p className="text-xs text-slate-500">Team Members</p>
              <p className="text-xs text-slate-400 mt-1">of 3 included</p>
            </div>
            
            {/* Storage */}
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <HardDrive className="h-6 w-6 mx-auto text-cyan-500 mb-2" />
              <p className="text-2xl font-bold text-[#0B1C3E]">{usage.storageUsedMb || '<1'}</p>
              <p className="text-xs text-slate-500">MB Used</p>
              <p className="text-xs text-slate-400 mt-1">of 10 GB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 mb-1">
            <CreditCard className="h-5 w-5 text-cyan-500" />
            <h3 className="text-lg font-bold text-[#0B1C3E]">Payment Method</h3>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="font-medium text-slate-900">•••• •••• •••• 4242</p>
                <p className="text-xs text-slate-500">Expires 12/2027</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-slate-200">
              Update
            </Button>
          </div>
          
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 border-slate-200">
              <FileText className="h-4 w-4 mr-2" />
              View Invoices
            </Button>
            <Button variant="outline" className="flex-1 border-slate-200">
              <ExternalLink className="h-4 w-4 mr-2" />
              Billing Portal
            </Button>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold">Need more features?</h4>
            <p className="text-cyan-100 text-sm mt-1">
              Upgrade to Team for unlimited users, advanced analytics, and priority support.
            </p>
          </div>
          <Button className="bg-white text-cyan-600 hover:bg-cyan-50">
            View Plans
          </Button>
        </div>
      </div>
    </div>
  );
}
