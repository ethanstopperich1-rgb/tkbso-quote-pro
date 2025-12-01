import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp } from 'lucide-react';
import { PricingConfig } from '@/types/database';
import { formatCurrency } from '@/lib/pricing-calculator';

interface BathroomPreviewCardProps {
  config: PricingConfig;
}

export function BathroomPreviewCard({ config }: BathroomPreviewCardProps) {
  const [sqft, setSqft] = useState(80);
  const [fullGut, setFullGut] = useState(true);
  const [newTileShower, setNewTileShower] = useState(true);
  const [layoutChange, setLayoutChange] = useState(false);
  const [freestandingTub, setFreestandingTub] = useState(false);
  const [glassEnclosure, setGlassEnclosure] = useState(true);
  const [vanity, setVanity] = useState(true);

  const preview = useMemo(() => {
    let totalIC = 0;
    let totalCP = 0;

    // Demo (if full gut)
    if (fullGut) {
      const isLargeBath = sqft > 60;
      totalIC += isLargeBath ? config.demo_large_bath_ic : config.demo_small_bath_ic;
      totalCP += isLargeBath ? config.demo_large_bath_cp : config.demo_small_bath_cp;
      // Dumpster
      totalIC += config.dumpster_bath_ic || 400;
      totalCP += config.dumpster_bath_cp || 750;
    }

    // Framing & Carpentry
    if (fullGut) {
      totalIC += config.framing_standard_ic || 750;
      totalCP += config.framing_standard_cp || 1300;
    }

    // Tile (if new tile shower)
    if (newTileShower) {
      // Estimate: 3x5 shower = 15 sqft floor, ~100 sqft walls for standard 8ft height
      const wallTileSqft = 100;
      const showerFloorSqft = 15;
      const mainFloorSqft = Math.max(0, sqft - 20);

      // Wall tile
      totalIC += wallTileSqft * config.tile_wall_ic_per_sqft;
      totalCP += wallTileSqft * config.tile_wall_cp_per_sqft;

      // Shower floor
      totalIC += showerFloorSqft * config.tile_shower_floor_ic_per_sqft;
      totalCP += showerFloorSqft * config.tile_shower_floor_cp_per_sqft;

      // Main floor
      totalIC += mainFloorSqft * config.tile_floor_ic_per_sqft;
      totalCP += mainFloorSqft * config.tile_floor_cp_per_sqft;

      // Cement board
      totalIC += wallTileSqft * config.cement_board_ic_per_sqft;
      totalCP += wallTileSqft * config.cement_board_cp_per_sqft;

      // Waterproofing
      totalIC += wallTileSqft * config.waterproofing_ic_per_sqft;
      totalCP += wallTileSqft * config.waterproofing_cp_per_sqft;

      // Tile material allowance
      totalCP += (wallTileSqft + showerFloorSqft + mainFloorSqft) * config.tile_material_allowance_cp_per_sqft;
    }

    // Plumbing
    if (layoutChange) {
      // Layout change - higher cost
      totalIC += config.plumbing_tub_to_shower_ic || 2550;
      totalCP += config.plumbing_tub_to_shower_cp || 4200;
    } else {
      // Standard plumbing
      totalIC += config.plumbing_shower_standard_ic;
      totalCP += config.plumbing_shower_standard_cp;
    }
    // Plumbing fixture allowance
    totalCP += config.plumbing_fixture_allowance_cp || 1350;

    // Freestanding tub
    if (freestandingTub) {
      totalIC += config.plumbing_tub_freestanding_ic;
      totalCP += config.plumbing_tub_freestanding_cp;
    }

    // Electrical (basic bathroom package)
    totalIC += config.electrical_small_package_ic || 250;
    totalCP += config.electrical_small_package_cp || 400;
    // Add 2 recessed cans
    totalIC += 2 * config.recessed_can_ic_each;
    totalCP += 2 * config.recessed_can_cp_each;
    // Vanity light
    totalIC += config.electrical_vanity_light_ic;
    totalCP += config.electrical_vanity_light_cp;

    // Glass enclosure
    if (glassEnclosure) {
      totalIC += config.glass_shower_standard_ic;
      totalCP += config.glass_shower_standard_cp;
    }

    // Vanity
    if (vanity) {
      // 48" bundle as default
      totalIC += config.vanity_48_bundle_ic;
      totalCP += config.vanity_48_bundle_cp;
    }

    // Paint
    totalIC += config.paint_patch_bath_ic || 800;
    totalCP += config.paint_patch_bath_cp || 1300;

    // Mirror allowance
    totalCP += config.mirror_allowance_cp || 500;

    // Toilet
    totalIC += config.plumbing_toilet_ic;
    totalCP += config.plumbing_toilet_cp;
    totalCP += config.toilet_allowance_cp || 450;

    // Apply minimum
    const minCP = config.min_job_cp || 15000;
    totalCP = Math.max(totalCP, minCP);

    const margin = totalCP > 0 ? (totalCP - totalIC) / totalCP : 0;
    const cpPerSqft = sqft > 0 ? totalCP / sqft : 0;

    return { totalIC, totalCP, margin, cpPerSqft };
  }, [config, sqft, fullGut, newTileShower, layoutChange, freestandingTub, glassEnclosure, vanity]);

  const marginPercent = Math.round(preview.margin * 100);
  const marginColor = marginPercent >= 35 ? 'text-green-600' : marginPercent >= 30 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle>Bathroom Price Preview</CardTitle>
          <Badge variant="outline" className="ml-auto">Live Calculator</Badge>
        </div>
        <CardDescription>
          Simulate a bathroom estimate using your configured trade buckets. This is a sanity check tool, not saved data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="previewSqft">Bathroom Size (sqft)</Label>
              <Input
                id="previewSqft"
                type="number"
                value={sqft}
                onChange={(e) => setSqft(parseFloat(e.target.value) || 0)}
                className="w-32"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Scope Options</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="fullGut" checked={fullGut} onCheckedChange={(c) => setFullGut(!!c)} />
                <label htmlFor="fullGut" className="text-sm">Full gut remodel</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="newTileShower" checked={newTileShower} onCheckedChange={(c) => setNewTileShower(!!c)} />
                <label htmlFor="newTileShower" className="text-sm">New tile shower</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="layoutChange" checked={layoutChange} onCheckedChange={(c) => setLayoutChange(!!c)} />
                <label htmlFor="layoutChange" className="text-sm">Layout change / tub-to-shower</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="freestandingTub" checked={freestandingTub} onCheckedChange={(c) => setFreestandingTub(!!c)} />
                <label htmlFor="freestandingTub" className="text-sm">Freestanding tub</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="glassEnclosure" checked={glassEnclosure} onCheckedChange={(c) => setGlassEnclosure(!!c)} />
                <label htmlFor="glassEnclosure" className="text-sm">Glass door + panel</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="vanity" checked={vanity} onCheckedChange={(c) => setVanity(!!c)} />
                <label htmlFor="vanity" className="text-sm">Vanity (48" bundle)</label>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Preview Results
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total IC</span>
                <span className="font-mono text-sm">{formatCurrency(preview.totalIC)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total CP</span>
                <span className="font-mono text-lg font-bold text-primary">{formatCurrency(preview.totalCP)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Implied Margin</span>
                <span className={`font-mono text-sm font-semibold ${marginColor}`}>{marginPercent}%</span>
              </div>

              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm text-muted-foreground">Implied CP/sqft</span>
                <span className="font-mono text-sm font-semibold">{formatCurrency(preview.cpPerSqft)}</span>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Badge variant="secondary" className="text-xs">
                Standard Baths typically: $260–$320/sqft
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
