import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Ruler } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PerSqftReferenceCardProps {
  kitchenIcPerSqft: number;
  kitchenCpPerSqft: number;
  bathIcPerSqft: number;
  bathCpPerSqft: number;
  closetIcPerSqft: number;
  closetCpPerSqft: number;
  targetMargin: number;
  onChange: (field: string, value: number) => void;
}

function calculateMargin(ic: number, cp: number): number {
  if (cp === 0) return 0;
  return (cp - ic) / cp;
}

function MarginBadge({ margin, target }: { margin: number; target: number }) {
  const marginPercent = Math.round(margin * 100);
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  
  if (margin < 0.30) {
    variant = 'destructive';
  } else if (margin < target - 0.03) {
    variant = 'secondary';
  }
  
  return (
    <Badge variant={variant} className="text-xs">
      {marginPercent}% margin
    </Badge>
  );
}

export function PerSqftReferenceCard({
  kitchenIcPerSqft,
  kitchenCpPerSqft,
  bathIcPerSqft,
  bathCpPerSqft,
  closetIcPerSqft,
  closetCpPerSqft,
  targetMargin,
  onChange,
}: PerSqftReferenceCardProps) {
  const kitchenMargin = calculateMargin(kitchenIcPerSqft, kitchenCpPerSqft);
  const bathMargin = calculateMargin(bathIcPerSqft, bathCpPerSqft);
  const closetMargin = calculateMargin(closetIcPerSqft, closetCpPerSqft);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Ruler className="h-5 w-5 text-primary" />
          <CardTitle>Per-Sqft Reference Ranges</CardTitle>
          <Badge variant="outline" className="ml-auto">Sanity Check Only</Badge>
        </div>
        <CardDescription>
          Use these as HIGH-LEVEL reference values only. The estimator prices projects by trade buckets, not these rates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            These per-sqft numbers are here to sanity check final bids, not drive the math. 
            Actual pricing uses the trade bucket configuration below.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Kitchen */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Kitchen</h4>
              <MarginBadge margin={kitchenMargin} target={targetMargin} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">IC/sqft</Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    value={kitchenIcPerSqft}
                    onChange={(e) => onChange('kitchen_ic_per_sqft', parseFloat(e.target.value) || 0)}
                    className="pl-6"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">CP/sqft</Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    value={kitchenCpPerSqft}
                    onChange={(e) => onChange('kitchen_cp_per_sqft', parseFloat(e.target.value) || 0)}
                    className="pl-6"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Full gut rate (demo, cabinets, quartz, etc.)</p>
          </div>

          {/* Bathroom */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Bathroom</h4>
              <MarginBadge margin={bathMargin} target={targetMargin} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">IC/sqft</Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    value={bathIcPerSqft}
                    onChange={(e) => onChange('bath_ic_per_sqft', parseFloat(e.target.value) || 0)}
                    className="pl-6"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">CP/sqft</Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    value={bathCpPerSqft}
                    onChange={(e) => onChange('bath_cp_per_sqft', parseFloat(e.target.value) || 0)}
                    className="pl-6"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Full gut rate (tile, plumbing, vanity, etc.)</p>
          </div>

          {/* Closet */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Closet</h4>
              <MarginBadge margin={closetMargin} target={targetMargin} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">IC/sqft</Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    value={closetIcPerSqft}
                    onChange={(e) => onChange('closet_ic_per_sqft', parseFloat(e.target.value) || 0)}
                    className="pl-6"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">CP/sqft</Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    value={closetCpPerSqft}
                    onChange={(e) => onChange('closet_cp_per_sqft', parseFloat(e.target.value) || 0)}
                    className="pl-6"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Buildout (drywall, trim, shelving)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
