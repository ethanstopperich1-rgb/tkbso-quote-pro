import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Pricing() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-display">Pricing & Allowances</h1>
        <p className="text-muted-foreground mt-1">Configure your cost and price rates</p>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pricing Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Pricing configuration coming soon. This section will allow you to set your default rates,
            margins, and allowances for different types of work.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
