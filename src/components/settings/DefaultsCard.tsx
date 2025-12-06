import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings2, AlertCircle, DollarSign, Percent } from 'lucide-react';
import { BusinessDefaults, PricingMode } from '@/types/settings';

interface Props {
  data: BusinessDefaults;
  onChange: (data: BusinessDefaults) => void;
}

export function DefaultsCard({ data, onChange }: Props) {
  const update = <K extends keyof BusinessDefaults>(field: K, value: BusinessDefaults[K]) => {
    onChange({ ...data, [field]: value });
  };

  const totalPct = data.depositPct + data.progressPct + data.finalPct;
  const pctWarning = totalPct !== 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          <CardTitle>General Defaults</CardTitle>
        </div>
        <CardDescription>
          Default business policies and payment terms for new estimates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing Mode */}
        <div className="space-y-4 pb-4 border-b">
          <Label className="text-base font-medium">Pricing Calculation Mode</Label>
          <RadioGroup
            value={data.pricingMode || 'margin_multiplier'}
            onValueChange={(value) => update('pricingMode', value as PricingMode)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="margin_multiplier" id="margin_multiplier" className="mt-1" />
              <div className="flex-1">
                <label htmlFor="margin_multiplier" className="flex items-center gap-2 font-medium cursor-pointer">
                  <Percent className="h-4 w-4 text-primary" />
                  Margin Multiplier
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Set one target margin %. All prices auto-calculate as CP = IC ÷ (1 - margin)
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="sell_price" id="sell_price" className="mt-1" />
              <div className="flex-1">
                <label htmlFor="sell_price" className="flex items-center gap-2 font-medium cursor-pointer">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Fixed Sell Prices
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Use specific CP values from your pricing config for each line item
                </p>
              </div>
            </div>
          </RadioGroup>

          {/* Target Margin Input - only show when margin mode selected */}
          {(data.pricingMode === 'margin_multiplier' || !data.pricingMode) && (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="targetMarginPct" className="font-medium">Target Margin</Label>
                <p className="text-xs text-muted-foreground">
                  All line items will use this margin to calculate client price
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="targetMarginPct"
                  type="number"
                  min={1}
                  max={80}
                  value={data.targetMarginPct || 38}
                  onChange={(e) => update('targetMarginPct', Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-muted-foreground font-medium">%</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Split */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Payment Structure</Label>
            {pctWarning && (
              <div className="flex items-center gap-1 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Must total 100% (currently {totalPct}%)</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="depositPct">Deposit %</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="depositPct"
                  type="number"
                  min={0}
                  max={100}
                  value={data.depositPct}
                  onChange={(e) => update('depositPct', Number(e.target.value))}
                  className={pctWarning ? 'border-destructive' : ''}
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="progressPct">Progress %</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="progressPct"
                  type="number"
                  min={0}
                  max={100}
                  value={data.progressPct}
                  onChange={(e) => update('progressPct', Number(e.target.value))}
                  className={pctWarning ? 'border-destructive' : ''}
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="finalPct">Final %</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="finalPct"
                  type="number"
                  min={0}
                  max={100}
                  value={data.finalPct}
                  onChange={(e) => update('finalPct', Number(e.target.value))}
                  className={pctWarning ? 'border-destructive' : ''}
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Minimums */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minJobCp">Minimum Job Price ($)</Label>
            <Input
              id="minJobCp"
              type="number"
              min={0}
              value={data.minJobCp}
              onChange={(e) => update('minJobCp', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Quotes below this amount will be bumped up
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimateExpirationDays">Estimate Validity (days)</Label>
            <Input
              id="estimateExpirationDays"
              type="number"
              min={1}
              max={365}
              value={data.estimateExpirationDays}
              onChange={(e) => update('estimateExpirationDays', Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              How long quotes remain valid
            </p>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-2">
          <Label htmlFor="termsText">PDF Terms & Services</Label>
          <Textarea
            id="termsText"
            value={data.termsText}
            onChange={(e) => update('termsText', e.target.value)}
            placeholder="Enter your standard terms and conditions that appear on proposals..."
            rows={5}
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-4 border-t pt-4">
          <Label className="text-base font-medium">Project Requirements</Label>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="requireSignedProposal"
              checked={data.requireSignedProposal}
              onCheckedChange={(checked) => update('requireSignedProposal', checked === true)}
            />
            <div className="space-y-1">
              <label
                htmlFor="requireSignedProposal"
                className="text-sm font-medium cursor-pointer"
              >
                Require signed proposal before ordering materials
              </label>
              <p className="text-xs text-muted-foreground">
                Materials will not be ordered until proposal is signed by client
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="requireFixtureSelections"
              checked={data.requireFixtureSelections}
              onCheckedChange={(checked) => update('requireFixtureSelections', checked === true)}
            />
            <div className="space-y-1">
              <label
                htmlFor="requireFixtureSelections"
                className="text-sm font-medium cursor-pointer"
              >
                Require client fixture selections before scheduling
              </label>
              <p className="text-xs text-muted-foreground">
                Project scheduling requires client to confirm all fixture choices
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
