import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Palette } from 'lucide-react';

interface AllowanceItem {
  key: string;
  label: string;
  field: string;
  value: number;
  unit: string;
  description: string;
}

interface AllowancesCardProps {
  allowances: AllowanceItem[];
  onChange: (field: string, value: number) => void;
}

export function AllowancesCard({ allowances, onChange }: AllowancesCardProps) {
  // Group allowances by category
  const tileAllowances = allowances.filter(a => a.key.includes('tile'));
  const plumbingAllowances = allowances.filter(a => a.key.includes('plumbing') || a.key.includes('toilet') || a.key.includes('sink') || a.key.includes('tub') || a.key.includes('shower_trim') || a.key.includes('faucet') || a.key.includes('disposal'));
  const otherAllowances = allowances.filter(a => 
    !a.key.includes('tile') && 
    !a.key.includes('plumbing') && 
    !a.key.includes('toilet') && 
    !a.key.includes('sink') && 
    !a.key.includes('tub') && 
    !a.key.includes('shower_trim') &&
    !a.key.includes('faucet') &&
    !a.key.includes('disposal')
  );

  const renderAllowanceGroup = (items: AllowanceItem[], title: string) => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">{title}</h4>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.key} className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor={item.field} className="text-sm">{item.label}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[280px] text-xs">
                  {item.description}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  id={item.field}
                  type="number"
                  value={item.value}
                  onChange={(e) => onChange(item.field, parseFloat(e.target.value) || 0)}
                  className="pl-6"
                  step="0.5"
                />
              </div>
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                {item.unit}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <CardTitle>Allowances (Material Only)</CardTitle>
        </div>
        <CardDescription>
          Client-facing material allowances. These are included in customer quotes as line items.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {tileAllowances.length > 0 && renderAllowanceGroup(tileAllowances, 'Tile & Surface')}
        {plumbingAllowances.length > 0 && renderAllowanceGroup(plumbingAllowances, 'Plumbing & Fixtures')}
        {otherAllowances.length > 0 && renderAllowanceGroup(otherAllowances, 'Other Allowances')}
      </CardContent>
    </Card>
  );
}
