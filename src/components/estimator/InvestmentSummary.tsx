import { useEstimator } from '@/contexts/EstimatorContext';
import { formatCurrency } from '@/lib/pricing';
import { TrendingUp } from 'lucide-react';

export function InvestmentSummary() {
  const { state } = useEstimator();
  const { lowEstimate, highEstimate, recommendedPrice } = state;
  
  if (recommendedPrice === 0) return null;
  
  return (
    <div className="bg-primary rounded-xl p-6 text-center shadow-lg">
      <div className="flex items-center justify-center gap-2 text-primary-foreground/80 text-sm uppercase tracking-wider mb-2">
        <TrendingUp className="w-4 h-4" />
        Estimated Investment
      </div>
      
      {/* HERO NUMBER */}
      <div className="text-4xl font-display font-bold text-primary-foreground mb-1">
        {formatCurrency(recommendedPrice)}
      </div>
      
      {/* Subtle range */}
      <div className="text-primary-foreground/60 text-sm">
        Based on similar projects: {formatCurrency(lowEstimate)} – {formatCurrency(highEstimate)}
      </div>
      
      {/* Fine print */}
      <p className="text-primary-foreground/50 text-xs mt-4">
        Includes labor, materials, fixtures*, demo & disposal
      </p>
    </div>
  );
}
