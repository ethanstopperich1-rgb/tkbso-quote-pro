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
  Package
} from 'lucide-react';

export function TradeScopeAccordion() {
  const { state, updateTrades } = useEstimator();
  const { trades } = state;
  
  const tradeItems = [
    {
      id: 'plumbing',
      icon: Droplet,
      title: 'Plumbing',
      enabled: trades.includePlumbing,
      onToggle: (val: boolean) => updateTrades({ includePlumbing: val }),
      items: [
        'Rough plumbing for new fixtures',
        'Supply/return relocation',
        'Shower valve installation',
        'Final trim-out',
      ],
    },
    {
      id: 'tile',
      icon: LayoutGrid,
      title: 'Tile & Flooring',
      enabled: trades.includeTile,
      onToggle: (val: boolean) => updateTrades({ includeTile: val }),
      items: [
        'Remove existing tile',
        'Install Schluter membrane',
        'Level & waterproof',
        'Full height walls in wet areas',
        'Floor tile installation',
      ],
    },
    {
      id: 'cabinetry',
      icon: Package,
      title: 'Cabinetry',
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
      id: 'electrical',
      icon: Zap,
      title: 'Electrical',
      enabled: trades.includeElectrical,
      onToggle: (val: boolean) => updateTrades({ includeElectrical: val }),
      items: [
        'Rough electrical as needed',
        trades.recessedCans > 0 ? `${trades.recessedCans} recessed can lights` : 'Lighting connections',
        'GFCI outlets in wet areas',
        'Final trim-out',
      ],
      hasOptions: true,
      options: (
        <div className="pt-3 border-t mt-3">
          <Label className="text-xs">Recessed Cans</Label>
          <Input
            type="number"
            min={0}
            value={trades.recessedCans}
            onChange={(e) => updateTrades({ recessedCans: parseInt(e.target.value) || 0 })}
            className="mt-1 h-8 w-24"
          />
        </div>
      ),
    },
    {
      id: 'glass',
      icon: Sparkles,
      title: 'Glass Enclosure',
      enabled: trades.includeGlass,
      onToggle: (val: boolean) => updateTrades({ includeGlass: val, glassType: val ? 'frameless' : 'none' }),
      items: trades.glassType === 'frameless' ? [
        'Frameless glass enclosure',
        'Professional measurement',
        'Custom hardware and seals',
      ] : trades.glassType === 'framed' ? [
        'Framed glass enclosure',
        'Standard hardware',
      ] : ['No glass enclosure'],
      hasOptions: true,
      options: trades.includeGlass && (
        <div className="pt-3 border-t mt-3 space-y-3">
          <div>
            <Label className="text-xs">Glass Type</Label>
            <Select
              value={trades.glassType}
              onValueChange={(val: 'frameless' | 'framed' | 'none') => updateTrades({ glassType: val })}
            >
              <SelectTrigger className="mt-1 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frameless">Frameless</SelectItem>
                <SelectItem value="framed">Framed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {trades.glassType === 'frameless' && (
            <div>
              <Label className="text-xs">Glass Area (sq ft)</Label>
              <Input
                type="number"
                min={0}
                value={trades.glassSqft}
                onChange={(e) => updateTrades({ glassSqft: parseInt(e.target.value) || 0 })}
                className="mt-1 h-8 w-24"
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'countertops',
      icon: Square,
      title: 'Countertops',
      enabled: trades.includeCountertops,
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
      onToggle: (val: boolean) => updateTrades({ includePainting: val }),
      items: [
        'Wall prep and primer',
        'Two coats finish paint',
        'Ceiling touch-up',
        'Trim and door painting',
      ],
    },
  ];
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display">Scope of Work</CardTitle>
        <p className="text-xs text-muted-foreground">Toggle trades on/off to customize scope</p>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="multiple" className="space-y-2">
          {tradeItems.map((trade) => (
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
