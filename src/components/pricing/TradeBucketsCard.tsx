import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TradeBucket {
  key: string;
  name: string;
  description: string;
  unit: string;
  icField: string;
  cpField: string;
  icValue: number;
  cpValue: number;
}

interface TradeBucketsCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buckets: TradeBucket[];
  onChange: (field: string, value: number) => void;
  targetMargin: number;
}

function calculateMargin(ic: number, cp: number): number {
  if (cp === 0) return 0;
  return (cp - ic) / cp;
}

function MarginIndicator({ margin, targetMargin }: { margin: number; targetMargin: number }) {
  const marginPercent = Math.round(margin * 100);
  
  let colorClass = 'text-green-600 bg-green-100';
  if (margin < 0.30) {
    colorClass = 'text-red-600 bg-red-100';
  } else if (margin < targetMargin - 0.03) {
    colorClass = 'text-yellow-600 bg-yellow-100';
  }
  
  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', colorClass)}>
      {marginPercent}%
    </span>
  );
}

export function TradeBucketsCard({
  title,
  description,
  icon,
  buckets,
  onChange,
  targetMargin,
}: TradeBucketsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-medium text-sm text-muted-foreground">Trade Bucket</th>
                <th className="text-left py-2 px-2 font-medium text-sm text-muted-foreground">Unit</th>
                <th className="text-right py-2 px-2 font-medium text-sm text-muted-foreground">IC ($)</th>
                <th className="text-right py-2 px-2 font-medium text-sm text-muted-foreground">CP ($)</th>
                <th className="text-right py-2 px-2 font-medium text-sm text-muted-foreground">Margin</th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((bucket) => {
                const margin = calculateMargin(bucket.icValue, bucket.cpValue);
                const hasWarning = bucket.cpValue < bucket.icValue;
                
                return (
                  <tr key={bucket.key} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{bucket.name}</span>
                        {hasWarning && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[280px] text-xs">
                            {bucket.description}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="text-xs font-normal">
                        {bucket.unit}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Input
                        type="number"
                        value={bucket.icValue}
                        onChange={(e) => onChange(bucket.icField, parseFloat(e.target.value) || 0)}
                        className="w-24 text-right h-8"
                        step="0.5"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <Input
                        type="number"
                        value={bucket.cpValue}
                        onChange={(e) => onChange(bucket.cpField, parseFloat(e.target.value) || 0)}
                        className={cn(
                          'w-24 text-right h-8',
                          hasWarning && 'border-destructive'
                        )}
                        step="0.5"
                      />
                    </td>
                    <td className="py-3 px-2 text-right">
                      <MarginIndicator margin={margin} targetMargin={targetMargin} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 pt-4 border-t flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-100" />
            <span>≥35% margin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-yellow-100" />
            <span>30-35% margin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-100" />
            <span>&lt;30% margin</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
