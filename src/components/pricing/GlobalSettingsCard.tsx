import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Settings, Target } from 'lucide-react';

interface GlobalSettingsCardProps {
  targetMargin: number;
  marketDescription: string;
  onTargetMarginChange: (value: number) => void;
  onMarketDescriptionChange: (value: string) => void;
}

export function GlobalSettingsCard({
  targetMargin,
  marketDescription,
  onTargetMarginChange,
  onMarketDescriptionChange,
}: GlobalSettingsCardProps) {
  const marginPercent = Math.round(targetMargin * 100);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <CardTitle>Global Pricing Defaults</CardTitle>
        </div>
        <CardDescription>
          High-level settings used for UI hints and sanity checks. These do not drive math directly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="targetMargin" className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              Target Overall Margin (%)
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="targetMargin"
                type="number"
                min={0}
                max={100}
                value={marginPercent}
                onChange={(e) => onTargetMarginChange(parseFloat(e.target.value) / 100)}
                className="w-24"
              />
              <Badge variant={marginPercent >= 35 ? 'default' : 'destructive'}>
                {marginPercent}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              High-level target blended margin for full projects. Used for sanity checks and UI hints.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="marketDescription">Region / Market Description</Label>
            <Textarea
              id="marketDescription"
              value={marketDescription}
              onChange={(e) => onMarketDescriptionChange(e.target.value)}
              placeholder="Describe your market area..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Reference description for your service area and market positioning.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
