import { MessageSquare, DollarSign, FileText, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  // Mock data - replace with real data from your backend
  const stats = {
    estimatesThisMonth: 2,
    averageValue: 6054,
    totalValue: 12108,
  };

  const recentEstimates = [
    { id: "1", name: "Estimate 11/28/2025", date: "Nov 28, 2025", value: 6918, status: "draft" },
    { id: "2", name: "Estimate 11/28/2025", date: "Nov 28, 2025", value: 5190, status: "draft" },
  ];

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-display">Welcome back, Dev User!</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your estimates this month.</p>
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
                  ${stats.averageValue.toLocaleString()}
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
                  ${stats.totalValue.toLocaleString()}
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
            <p className="text-sm text-muted-foreground">Your latest 5 estimates this month</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/estimates">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {recentEstimates.map((estimate) => (
              <div key={estimate.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-foreground">{estimate.name}</p>
                  <p className="text-sm text-muted-foreground">{estimate.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${estimate.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{estimate.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
