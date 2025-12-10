import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, DollarSign, FileText, TrendingUp, Clock } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from '@/lib/pricing-calculator';

interface EstimateRow {
  id: string;
  job_label: string | null;
  client_name: string | null;
  final_cp_total: number;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const { contractor, profile } = useAuth();
  const [recentEstimates, setRecentEstimates] = useState<EstimateRow[]>([]);
  const [stats, setStats] = useState({
    estimatesThisMonth: 0,
    averageValue: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!contractor) return;
      
      const { data: estimates } = await supabase
        .from('estimates')
        .select('id, job_label, client_name, final_cp_total, status, created_at')
        .eq('contractor_id', contractor.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (estimates) {
        setRecentEstimates(estimates);
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const thisMonthEstimates = estimates.filter(
          (e) => new Date(e.created_at) >= startOfMonth
        );
        
        const totalValue = thisMonthEstimates.reduce((sum, e) => sum + (e.final_cp_total || 0), 0);
        const avgValue = thisMonthEstimates.length > 0 ? totalValue / thisMonthEstimates.length : 0;
        
        setStats({
          estimatesThisMonth: thisMonthEstimates.length,
          averageValue: avgValue,
          totalValue: totalValue,
        });
      }
      
      setLoading(false);
    }
    
    fetchData();
  }, [contractor]);

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-full">
      {/* Welcome Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
          Welcome back{profile?.name ? `, ${profile.name}` : ''}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {contractor?.name || "Here's what's happening with your estimates this month."}
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <Link to="/estimator">
          <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border border-slate-200 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-2xl h-full">
            <CardContent className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base tracking-tight">Open Chat Estimator</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Start a new estimate conversation</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/pricing">
          <Card className="hover:shadow-md transition-shadow cursor-pointer bg-white border border-slate-200 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-2xl h-full">
            <CardContent className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base tracking-tight">Edit Pricing Allowances</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Configure your cost and price rates</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <Card className="bg-white border border-slate-200 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Estimates This Month</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">{stats.estimatesThisMonth}</p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Average Estimate Value</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
                  {formatCurrency(stats.averageValue)}
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-2xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Estimates */}
      <Card className="bg-white border border-slate-200 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] rounded-2xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 px-4 sm:px-6">
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold font-display text-slate-900 tracking-tight">Recent Estimates</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">Your latest estimates</p>
          </div>
          <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
            <Link to="/estimates">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {loading ? (
            <p className="text-muted-foreground text-sm py-4">Loading...</p>
          ) : recentEstimates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4 text-sm">No estimates yet</p>
              <Link to="/estimator">
                <Button size="sm">Create Your First Quote</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentEstimates.map((estimate) => (
                <Link 
                  key={estimate.id} 
                  to={`/estimates/${estimate.id}`}
                  className="flex items-center justify-between py-3 sm:py-4 first:pt-0 last:pb-0 hover:bg-muted/50 -mx-4 px-4 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm sm:text-base truncate">
                      {estimate.job_label || estimate.client_name || 'Untitled Estimate'}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(estimate.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-semibold text-foreground text-sm sm:text-base">{formatCurrency(estimate.final_cp_total)}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground capitalize">{estimate.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Branding */}
      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground">
          Powered by{' '}
          <span className="text-foreground/80 font-semibold">Estim</span>
          <span className="text-cyan-500 font-semibold">AI</span>
          <span className="text-foreground/80 font-semibold">te</span>
          <span className="text-muted-foreground/60 text-xs ml-0.5">™</span>
        </p>
      </div>
    </div>
  );
}