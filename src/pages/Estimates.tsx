import { FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Estimates() {
  // Mock data - replace with real data
  const estimates = [
    { id: "1", name: "Estimate 11/28/2025", date: "Nov 28, 2025", value: 6918, status: "draft" },
    { id: "2", name: "Estimate 11/28/2025", date: "Nov 28, 2025", value: 5190, status: "draft" },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-display">Estimates</h1>
          <p className="text-muted-foreground mt-1">Manage and view all your estimates</p>
        </div>
        <Button asChild>
          <Link to="/estimator">
            <Plus className="h-4 w-4 mr-2" />
            New Estimate
          </Link>
        </Button>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Estimates</CardTitle>
        </CardHeader>
        <CardContent>
          {estimates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No estimates yet</p>
              <Button asChild className="mt-4">
                <Link to="/estimator">Create Your First Estimate</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {estimates.map((estimate) => (
                <div key={estimate.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{estimate.name}</p>
                      <p className="text-sm text-muted-foreground">{estimate.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">${estimate.value.toLocaleString()}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      {estimate.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
