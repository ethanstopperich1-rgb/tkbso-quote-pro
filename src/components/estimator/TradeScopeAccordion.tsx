import { useEstimator } from '@/contexts/EstimatorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Droplet, 
  LayoutGrid, 
  Square, 
  Zap, 
  Sparkles, 
  Paintbrush,
  Package,
  Hammer,
  ShieldCheck,
  Bath
} from 'lucide-react';

export function TradeScopeAccordion() {
  const { state, updateTrades } = useEstimator();
  const { trades } = state;
  
  const tradeItems = [
    {
      id: 'demo',
      icon: Hammer,
      title: 'Demo & Site Prep',
      enabled: trades.includeDemo,
      onToggle: (val: boolean) => updateTrades({ includeDemo: val }),
      items: [
        'Remove existing fixtures and materials',
        'Protect adjacent areas',
        'Dispose of debris and haul away',
        'Prep surfaces for new installation',
      ],
    },
    {
      id: 'plumbing',
      icon: Droplet,
      title: 'Plumbing',
      enabled: trades.includePlumbing,
      onToggle: (val: boolean) => updateTrades({ includePlumbing: val }),
      items: [
        'Rough-in for new shower valve, drain, and supply',
        'Install new shower pan/liner system',
        'Set and connect trim kit',
        'Final pressure testing and leak verification',
      ],
      hasOptions: true,
      options: (
        <div className="pt-3 border-t mt-3 space-y-3">
          <div>
            <Label className="text-xs">Toilets to Install</Label>
            <Input
              type="number"
              min={0}
              value={trades.numToilets}
              onChange={(e) => updateTrades({ numToilets: parseInt(e.target.value) || 0 })}
              className="mt-1 h-8 w-24"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'tile',
      icon: LayoutGrid,
      title: 'Tile & Flooring',
      enabled: trades.includeTile,
      onToggle: (val: boolean) => updateTrades({ includeTile: val, includeCementBoard: val, includeWaterproofing: val }),
      items: [
        'Install cement board substrate',
        trades.includeWaterproofing ? 'Apply Schluter waterproofing membrane' : 'Waterproof as needed',
        'Level substrate for proper drainage',
        'Install wall tile in wet areas',
        'Install floor tile per layout',
        trades.numNiches > 0 ? `${trades.numNiches} recessed niche(s)` : null,
        'Grout, clean, and seal',
      ].filter(Boolean),
      hasOptions: true,
      options: (
        <div className="pt-3 border-t mt-3 space-y-3">
          <div>
            <Label className="text-xs">Number of Niches</Label>
            <Input
              type="number"
              min={0}
              value={trades.numNiches}
              onChange={(e) => updateTrades({ numNiches: parseInt(e.target.value) || 0 })}
              className="mt-1 h-8 w-24"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'waterproofing',
      icon: ShieldCheck,
      title: 'Waterproofing',
      enabled: trades.includeWaterproofing,
      onToggle: (val: boolean) => updateTrades({ includeWaterproofing: val }),
      items: [
        'Schluter DITRA or KERDI system',
        'Membrane on shower walls and pan',
        'Sealed corners and transitions',
        'Code-compliant installation',
      ],
    },
    {
      id: 'lvp',
      icon: Square,
      title: 'LVP Flooring',
      enabled: trades.includeLVP,
      onToggle: (val: boolean) => updateTrades({ includeLVP: val }),
      items: [
        'Luxury vinyl plank installation',
        'Barrier/underlayment included',
        trades.lvpSqft > 0 ? `${trades.lvpSqft} sqft coverage` : 'Square footage to be determined',
        'Professional installation and trim',
      ],
      hasOptions: true,
      options: (
        <div className="pt-3 border-t mt-3 space-y-3">
          <div>
            <Label className="text-xs">LVP Square Footage</Label>
            <Input
              type="number"
              min={0}
              value={trades.lvpSqft}
              onChange={(e) => updateTrades({ lvpSqft: parseInt(e.target.value) || 0 })}
              className="mt-1 h-8 w-32"
              placeholder="e.g., 150"
            />
            <p className="text-xs text-muted-foreground mt-1">Includes barrier @ $1/sqft + LVP @ $2.50/sqft</p>
          </div>
        </div>
      ),
    },
    {
      id: 'electrical',
      icon: Zap,
      title: 'Electrical',
      enabled: trades.includeElectrical,
      onToggle: (val: boolean) => updateTrades({ includeElectrical: val }),
      items: [
        'Rough electrical as needed',
        trades.recessedCans > 0 ? `${trades.recessedCans} recessed can lights` : 'Lighting connections',
        trades.vanityLights > 0 ? `${trades.vanityLights} vanity light fixture(s)` : 'Vanity light ready',
        'GFCI outlets in wet areas',
        'Final trim-out',
      ],
      hasOptions: true,
      options: (
        <div className="pt-3 border-t mt-3 space-y-3">
          <div>
            <Label className="text-xs">Recessed Cans</Label>
            <Input
              type="number"
              min={0}
              value={trades.recessedCans}
              onChange={(e) => updateTrades({ recessedCans: parseInt(e.target.value) || 0 })}
              className="mt-1 h-8 w-24"
            />
          </div>
          <div>
            <Label className="text-xs">Vanity Lights</Label>
            <Input
              type="number"
              min={0}
              value={trades.vanityLights}
              onChange={(e) => updateTrades({ vanityLights: parseInt(e.target.value) || 0 })}
              className="mt-1 h-8 w-24"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'glass',
      icon: Sparkles,
      title: 'Glass Enclosure',
      enabled: trades.includeGlass,
      onToggle: (val: boolean) => updateTrades({ includeGlass: val, glassType: val ? 'standard' : 'none' }),
      items: trades.glassType === 'standard' ? [
        'Frameless glass enclosure with door',
        'Professional field measurement',
        'Hardware, hinges, and seals',
        'Final installation and adjustment',
      ] : trades.glassType === 'panel_only' ? [
        'Fixed frameless glass panel',
        'Professional measurement',
        'Clips and hardware',
      ] : ['No glass enclosure'],
      hasOptions: true,
      options: trades.includeGlass && (
        <div className="pt-3 border-t mt-3 space-y-3">
          <div>
            <Label className="text-xs">Glass Type</Label>
            <Select
              value={trades.glassType}
              onValueChange={(val: 'none' | 'standard' | 'panel_only') => updateTrades({ glassType: val })}
            >
              <SelectTrigger className="mt-1 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Full Enclosure (Door + Panel)</SelectItem>
                <SelectItem value="panel_only">Fixed Panel Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      id: 'vanity',
      icon: Bath,
      title: 'Vanity & Countertop',
      enabled: trades.includeVanity,
      onToggle: (val: boolean) => updateTrades({ includeVanity: val }),
      items: trades.vanitySize !== 'none' ? [
        `${trades.vanitySize}" vanity cabinet`,
        'Quartz countertop included',
        parseInt(trades.vanitySize) >= 60 ? 'Two undermount sinks' : 'Undermount sink',
        'Professional installation',
      ] : [
        'Vanity cabinet installation',
        'Hardware and final adjustments',
      ],
      hasOptions: true,
      options: trades.includeVanity && (
        <div className="pt-3 border-t mt-3">
          <Label className="text-xs">Vanity Size</Label>
          <Select
            value={trades.vanitySize}
            onValueChange={(val: 'none' | '30' | '36' | '48' | '54' | '60' | '72' | '84') => updateTrades({ vanitySize: val })}
          >
            <SelectTrigger className="mt-1 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30" Single</SelectItem>
              <SelectItem value="36">36" Single</SelectItem>
              <SelectItem value="48">48" Single</SelectItem>
              <SelectItem value="54">54" Single</SelectItem>
              <SelectItem value="60">60" Double</SelectItem>
              <SelectItem value="72">72" Double</SelectItem>
              <SelectItem value="84">84" Double</SelectItem>
              <SelectItem value="none">Customer-Supplied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      id: 'cabinetry',
      icon: Package,
      title: 'Kitchen Cabinetry',
      enabled: trades.includeCabinetry,
      onToggle: (val: boolean) => updateTrades({ includeCabinetry: val }),
      items: [
        trades.cabinetrySupplier === 'tkbso' ? 'TKBSO-supplied cabinetry' : 'Customer-supplied cabinetry',
        'Professional installation',
        'Hardware installation',
        'Final adjustments',
      ],
      hasOptions: true,
      options: (
        <div className="pt-3 border-t mt-3">
          <Label className="text-xs">Supplier</Label>
          <Select
            value={trades.cabinetrySupplier}
            onValueChange={(val: 'tkbso' | 'customer') => updateTrades({ cabinetrySupplier: val })}
          >
            <SelectTrigger className="mt-1 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tkbso">TKBSO (28% markup)</SelectItem>
              <SelectItem value="customer">Customer-Supplied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      id: 'countertops',
      icon: Square,
      title: 'Countertops (Standalone)',
      enabled: trades.includeCountertops && !trades.includeVanity,
      onToggle: (val: boolean) => updateTrades({ includeCountertops: val }),
      items: [
        'Template and fabrication',
        'Professional installation',
        'Undermount sink cutout',
        'Edge profile selection',
      ],
    },
    {
      id: 'painting',
      icon: Paintbrush,
      title: 'Paint & Finishes',
      enabled: trades.includePainting,
      onToggle: (val: boolean) => updateTrades({ includePainting: val, paintType: val ? 'patch' : 'none' }),
      items: trades.paintType === 'full' ? [
        'Patch and texture disturbed areas',
        'Prime as needed',
        'Paint walls, ceiling, and trim',
        'Final touch-up',
      ] : trades.paintType === 'patch' ? [
        'Patch and texture disturbed areas only',
        'Color-match existing finish',
      ] : ['No painting'],
      hasOptions: true,
      options: trades.includePainting && (
        <div className="pt-3 border-t mt-3">
          <Label className="text-xs">Paint Scope</Label>
          <Select
            value={trades.paintType}
            onValueChange={(val: 'none' | 'patch' | 'full') => updateTrades({ paintType: val })}
          >
            <SelectTrigger className="mt-1 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="patch">Patch & Texture Only</SelectItem>
              <SelectItem value="full">Full Room Paint</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ];
  
  // Filter out standalone countertops if vanity is included (vanity bundle includes countertop)
  const filteredTrades = tradeItems.filter(trade => {
    if (trade.id === 'countertops' && trades.includeVanity) return false;
    return true;
  });
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display">Scope of Work</CardTitle>
        <p className="text-xs text-muted-foreground">Toggle trades on/off to customize scope</p>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="multiple" className="space-y-2">
          {filteredTrades.map((trade) => (
            <AccordionItem 
              key={trade.id} 
              value={trade.id}
              className={`border rounded-lg px-3 transition-opacity ${!trade.enabled ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-3 py-2">
                <Switch
                  checked={trade.enabled}
                  onCheckedChange={trade.onToggle}
                  className="data-[state=checked]:bg-primary"
                />
                <trade.icon className={`w-4 h-4 ${trade.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                <AccordionTrigger className="flex-1 py-0 hover:no-underline">
                  <span className="font-medium text-sm">{trade.title}</span>
                </AccordionTrigger>
              </div>
              <AccordionContent className="pb-3 pt-0">
                <ul className="space-y-1 text-sm text-muted-foreground ml-7">
                  {trade.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {trade.hasOptions && trade.options}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
