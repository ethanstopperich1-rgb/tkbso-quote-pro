import { useEstimator } from '@/contexts/EstimatorContext';
import { formatCurrency } from '@/lib/pricing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export function PaymentMilestones() {
  const { state } = useEstimator();
  const { recommendedPrice } = state;
  
  if (recommendedPrice === 0) return null;
  
  const milestones = [
    {
      percent: 65,
      label: 'Deposit',
      description: 'Lock materials, schedule trades',
      amount: recommendedPrice * 0.65,
    },
    {
      percent: 25,
      label: 'Progress',
      description: 'Rough-in complete, tile installed',
      amount: recommendedPrice * 0.25,
    },
    {
      percent: 10,
      label: 'Final',
      description: 'Completion + punch list',
      amount: recommendedPrice * 0.10,
    },
  ];
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          Payment Milestones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {milestones.map((milestone, idx) => (
          <div
            key={milestone.label}
            className={`flex items-center justify-between py-3 ${
              idx < milestones.length - 1 ? 'border-b' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{milestone.percent}%</span>
              </div>
              <div>
                <p className="font-medium text-sm">{milestone.label}</p>
                <p className="text-xs text-muted-foreground">{milestone.description}</p>
              </div>
            </div>
            <span className="font-semibold">{formatCurrency(milestone.amount)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
