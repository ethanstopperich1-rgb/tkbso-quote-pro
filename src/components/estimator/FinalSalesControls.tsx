import { useState } from 'react';
import { useEstimator, PricingMode, TKBSO_MARGINS } from '@/contexts/EstimatorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/tkbso-pricing';
import { DollarSign, Percent, Sparkles, Lock, TrendingUp, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FinalSalesControls() {
  const { 
    state, 
    setPricingMode, 
    setSellingPrice, 
    setTargetMargin, 
    resetToAutoMargin,
    lockEstimate 
  } = useEstimator();
  
  const { 
    pricingMode, 
    overrideValue, 
    baseInternalCost, 
    internalCost,
    recommendedPrice, 
    calculatedMargin, 
    profit,
    lowEstimate,
    highEstimate,
    projectType,
    marginStatus,
    pricingResult,
    isLocked 
  } = state;
  
  const [inputPrice, setInputPrice] = useState<string>(
    pricingMode === 'sell_price' && overrideValue ? overrideValue.toString() : ''
  );
  const [inputMargin, setInputMargin] = useState<string>(
    pricingMode === 'target_margin' && overrideValue ? (overrideValue * 100).toString() : ''
  );
  
  // Get TKBSO standard margin for current project type
  const tkbsoMargin = projectType ? TKBSO_MARGINS[projectType] : TKBSO_MARGINS.bathroom;
  
  const handleModeChange = (mode: PricingMode) => {
    if (isLocked) return;
    setPricingMode(mode);
    
    if (mode === 'auto') {
      resetToAutoMargin();
    }
  };
  
  const handlePriceSubmit = () => {
    if (isLocked) return;
    const price = parseFloat(inputPrice);
    if (price > 0) {
      setSellingPrice(price);
    }
  };
  
  const handleMarginSubmit = () => {
    if (isLocked) return;
    const margin = parseFloat(inputMargin) / 100; // Convert to decimal
    if (margin > 0 && margin < 1) {
      setTargetMargin(margin);
    }
  };
  
  const marginPercent = calculatedMargin * 100;
  
  if (baseInternalCost === 0) return null;
  
  return (
    <Card className={cn(
      "border-2",
      isLocked ? "border-green-500 bg-green-50/30" : "border-amber-400 bg-amber-50/30"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Final Sales Controls
          </CardTitle>
          {isLocked && (
            <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
              <Lock className="w-3 h-3" />
              Locked
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Control your final selling price. Customer never sees internals.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Margin Warning Alert */}
        {marginStatus && marginStatus.status !== 'good' && (
          <Alert variant={marginStatus.status === 'low' ? 'destructive' : 'default'} className={cn(
            marginStatus.status === 'healthy' && 'border-amber-500 bg-amber-50',
            marginStatus.status === 'high' && 'border-orange-500 bg-orange-50'
          )}>
            {marginStatus.status === 'low' && <AlertCircle className="h-4 w-4" />}
            {marginStatus.status === 'healthy' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
            {marginStatus.status === 'high' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
            <AlertDescription className={cn(
              marginStatus.status === 'healthy' && 'text-amber-800',
              marginStatus.status === 'high' && 'text-orange-800'
            )}>
              {marginStatus.message}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Pricing Mode Selection */}
        <RadioGroup
          value={pricingMode}
          onValueChange={(val) => handleModeChange(val as PricingMode)}
          className="space-y-2"
          disabled={isLocked}
        >
          {/* Auto Margin */}
          <div className={cn(
            "flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors",
            pricingMode === 'auto' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            isLocked && "opacity-60 cursor-not-allowed"
          )}>
            <RadioGroupItem value="auto" id="auto" disabled={isLocked} />
            <Label htmlFor="auto" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium">TKBSO Standard Margin</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Auto: {(tkbsoMargin.range.low * 100).toFixed(0)}–{(tkbsoMargin.range.high * 100).toFixed(0)}% margin for {projectType || 'projects'}
              </p>
            </Label>
          </div>
          
          {/* Set Selling Price */}
          <div className={cn(
            "rounded-lg border p-3 transition-colors",
            pricingMode === 'sell_price' ? "border-primary bg-primary/5" : "border-border",
            isLocked && "opacity-60"
          )}>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="sell_price" id="sell_price" disabled={isLocked} />
              <Label htmlFor="sell_price" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Set Selling Price</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  "I want to sell this job for $X"
                </p>
              </Label>
            </div>
            {pricingMode === 'sell_price' && !isLocked && (
              <div className="mt-3 ml-7 flex gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={inputPrice}
                    onChange={(e) => setInputPrice(e.target.value)}
                    onBlur={handlePriceSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handlePriceSubmit()}
                    placeholder="14,500"
                    className="pl-9"
                  />
                </div>
                <Button size="sm" onClick={handlePriceSubmit}>Apply</Button>
              </div>
            )}
          </div>
          
          {/* Set Target Margin */}
          <div className={cn(
            "rounded-lg border p-3 transition-colors",
            pricingMode === 'target_margin' ? "border-primary bg-primary/5" : "border-border",
            isLocked && "opacity-60"
          )}>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="target_margin" id="target_margin" disabled={isLocked} />
              <Label htmlFor="target_margin" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Set Target Margin</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  "I want a 40% margin on this job"
                </p>
              </Label>
            </div>
            {pricingMode === 'target_margin' && !isLocked && (
              <div className="mt-3 ml-7 flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="number"
                    value={inputMargin}
                    onChange={(e) => setInputMargin(e.target.value)}
                    onBlur={handleMarginSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handleMarginSubmit()}
                    placeholder="38"
                    className="pr-8"
                    min={1}
                    max={99}
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <Button size="sm" onClick={handleMarginSubmit}>Apply</Button>
              </div>
            )}
          </div>
        </RadioGroup>
        
        {/* Live Preview */}
        <div className="pt-4 border-t space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Live Preview
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Final Client Price */}
            <div className="bg-primary rounded-lg p-3 text-center col-span-2">
              <span className="text-primary-foreground/70 text-xs uppercase tracking-wide">
                Final Client Price
              </span>
              <div className="text-2xl font-display font-bold text-primary-foreground">
                {formatCurrency(recommendedPrice)}
              </div>
              <span className="text-primary-foreground/50 text-xs">
                Range: {formatCurrency(lowEstimate)} – {formatCurrency(highEstimate)}
              </span>
            </div>
            
            {/* Internal Cost (contractor view only) */}
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
                Internal Cost
              </span>
              <div className="text-lg font-semibold">
                {formatCurrency(internalCost)}
              </div>
            </div>
            
            {/* Profit */}
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
              <span className="text-green-700 text-xs uppercase tracking-wide">
                Total Profit
              </span>
              <div className="text-lg font-semibold text-green-700">
                {formatCurrency(profit)}
              </div>
            </div>
            
            {/* Margin with Status */}
            <div className={cn(
              "rounded-lg p-3 text-center col-span-2 border",
              marginStatus?.status === 'good' ? "bg-green-50 border-green-300" : 
              marginStatus?.status === 'healthy' ? "bg-amber-50 border-amber-300" : 
              marginStatus?.status === 'high' ? "bg-orange-50 border-orange-300" : 
              "bg-red-50 border-red-300"
            )}>
              <div className="flex items-center justify-center gap-2">
                {marginStatus?.status === 'good' && <CheckCircle className="w-4 h-4 text-green-600" />}
                {marginStatus?.status === 'healthy' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                {marginStatus?.status === 'high' && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                {marginStatus?.status === 'low' && <AlertCircle className="w-4 h-4 text-red-600" />}
                <span className={cn(
                  "text-xs uppercase tracking-wide",
                  marginStatus?.status === 'good' ? "text-green-700" : 
                  marginStatus?.status === 'healthy' ? "text-amber-700" : 
                  marginStatus?.status === 'high' ? "text-orange-700" : 
                  "text-red-700"
                )}>
                  Implied Margin
                </span>
              </div>
              <div className={cn(
                "text-xl font-bold",
                marginStatus?.status === 'good' ? "text-green-700" : 
                marginStatus?.status === 'healthy' ? "text-amber-700" : 
                marginStatus?.status === 'high' ? "text-orange-700" : 
                "text-red-700"
              )}>
                {marginPercent.toFixed(1)}%
              </div>
              {marginStatus && (
                <p className={cn(
                  "text-xs mt-1",
                  marginStatus.status === 'good' ? "text-green-600" : 
                  marginStatus.status === 'healthy' ? "text-amber-600" : 
                  marginStatus.status === 'high' ? "text-orange-600" : 
                  "text-red-600"
                )}>
                  {marginStatus.status === 'good' ? 'TKBSO Standard – Good' : marginStatus.message}
                </p>
              )}
            </div>
          </div>
          
          {/* Cost Breakdown (collapsible) */}
          {pricingResult && (
            <details className="bg-muted/30 rounded-lg p-3">
              <summary className="text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground">
                Cost Breakdown
              </summary>
              <div className="mt-2 space-y-1 text-xs">
                {pricingResult.demo_ic > 0 && (
                  <div className="flex justify-between">
                    <span>Demo</span>
                    <span className="font-mono">{formatCurrency(pricingResult.demo_ic)}</span>
                  </div>
                )}
                {pricingResult.plumbing_ic > 0 && (
                  <div className="flex justify-between">
                    <span>Plumbing</span>
                    <span className="font-mono">{formatCurrency(pricingResult.plumbing_ic)}</span>
                  </div>
                )}
                {pricingResult.tile_ic > 0 && (
                  <div className="flex justify-between">
                    <span>Tile ({pricingResult.wall_tile_sqft} + {pricingResult.shower_floor_sqft} sqft)</span>
                    <span className="font-mono">{formatCurrency(pricingResult.tile_ic)}</span>
                  </div>
                )}
                {pricingResult.cement_board_ic > 0 && (
                  <div className="flex justify-between">
                    <span>Cement Board</span>
                    <span className="font-mono">{formatCurrency(pricingResult.cement_board_ic)}</span>
                  </div>
                )}
                {pricingResult.waterproofing_ic > 0 && (
                  <div className="flex justify-between">
                    <span>Waterproofing</span>
                    <span className="font-mono">{formatCurrency(pricingResult.waterproofing_ic)}</span>
                  </div>
                )}
                {pricingResult.electrical_ic > 0 && (
                  <div className="flex justify-between">
                    <span>Electrical</span>
                    <span className="font-mono">{formatCurrency(pricingResult.electrical_ic)}</span>
                  </div>
                )}
                {pricingResult.glass_ic > 0 && (
                  <div className="flex justify-between">
                    <span>Glass</span>
                    <span className="font-mono">{formatCurrency(pricingResult.glass_ic)}</span>
                  </div>
                )}
                {pricingResult.vanity_ic > 0 && (
                  <div className="flex justify-between">
                    <span>Vanity</span>
                    <span className="font-mono">{formatCurrency(pricingResult.vanity_ic)}</span>
                  </div>
                )}
                {pricingResult.paint_ic > 0 && (
                  <div className="flex justify-between">
                    <span>Paint</span>
                    <span className="font-mono">{formatCurrency(pricingResult.paint_ic)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t font-semibold">
                  <span>Total IC</span>
                  <span className="font-mono">{formatCurrency(pricingResult.total_ic)}</span>
                </div>
              </div>
            </details>
          )}
          
          {/* Payment Milestones Preview */}
          <div className="bg-muted/30 rounded-lg p-3">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Payment Milestones</span>
            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
              <div className="text-center">
                <span className="font-bold text-primary">65%</span>
                <p className="text-xs">{formatCurrency(recommendedPrice * 0.65)}</p>
              </div>
              <div className="text-center">
                <span className="font-bold text-primary">25%</span>
                <p className="text-xs">{formatCurrency(recommendedPrice * 0.25)}</p>
              </div>
              <div className="text-center">
                <span className="font-bold text-primary">10%</span>
                <p className="text-xs">{formatCurrency(recommendedPrice * 0.10)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lock Button */}
        {!isLocked && (
          <Button 
            onClick={lockEstimate} 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={recommendedPrice === 0}
          >
            <Lock className="w-4 h-4 mr-2" />
            Lock & Save Estimate
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
