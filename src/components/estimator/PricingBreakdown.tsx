import { Card } from '@/components/ui/card';
import { ProjectPricing, formatCurrency, formatMargin } from '@/lib/trade-bucket-pricer';
import { AlertCircle } from 'lucide-react';

interface PricingBreakdownProps {
  pricing: ProjectPricing;
}

export function PricingBreakdown({ pricing }: PricingBreakdownProps) {
  return (
    <div className="space-y-4">
      {/* Warnings */}
      {pricing.warnings.length > 0 && (
        <Card className="p-4 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              {pricing.warnings.map((warning, idx) => (
                <p key={idx} className="text-sm text-amber-700 dark:text-amber-400">
                  {warning}
                </p>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Line Items */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Pricing Breakdown</h3>
        <div className="space-y-2">
          {pricing.line_items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr,auto,auto,auto] gap-4 py-2 border-b last:border-0 text-sm"
            >
              <div>
                <div className="font-medium">{item.category}</div>
                <div className="text-muted-foreground text-xs">{item.task_description}</div>
                <div className="text-muted-foreground text-xs">
                  {item.quantity} {item.unit} × {formatCurrency(item.cp_per_unit)}/{item.unit}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">IC</div>
                <div>{formatCurrency(item.ic_total)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">CP</div>
                <div className="font-medium">{formatCurrency(item.cp_total)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Margin</div>
                <div className="text-sm">{formatMargin(item.margin_percent)}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Totals */}
      <Card className="p-6 bg-primary/5">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Internal Cost</span>
            <span className="font-medium">{formatCurrency(pricing.totals.total_ic)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Client Price</span>
            <span className="text-primary">{formatCurrency(pricing.totals.total_cp)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Margin</span>
            <span className={`font-medium ${
              pricing.totals.overall_margin_percent >= 35 ? 'text-green-600' :
              pricing.totals.overall_margin_percent >= 30 ? 'text-amber-600' :
              'text-red-600'
            }`}>
              {formatMargin(pricing.totals.overall_margin_percent)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
