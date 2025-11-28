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
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-display">
          Welcome back{profile?.name ? `, ${profile.name}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {contractor?.name || "Here's what's happening with your estimates this month."}
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link to="/estimator">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border border-border">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Open Chat Estimator</h3>
                <p className="text-sm text-muted-foreground">Start a new estimate conversation</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/pricing">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border border-border">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Edit Pricing Allowances</h3>
                <p className="text-sm text-muted-foreground">Configure your cost and price rates</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimates This Month</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.estimatesThisMonth}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Estimate Value</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {formatCurrency(stats.averageValue)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Estimates */}
      <Card className="border border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold font-display">Recent Estimates</CardTitle>
            <p className="text-sm text-muted-foreground">Your latest estimates</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/estimates">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm py-4">Loading...</p>
          ) : recentEstimates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No estimates yet</p>
              <Link to="/estimator">
                <Button>Create Your First Quote</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentEstimates.map((estimate) => (
                <Link 
                  key={estimate.id} 
                  to={`/estimates/${estimate.id}`}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0 hover:bg-muted/50 -mx-4 px-4 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {estimate.job_label || estimate.client_name || 'Untitled Estimate'}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(estimate.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(estimate.final_cp_total)}</p>
                    <p className="text-sm text-muted-foreground capitalize">{estimate.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
