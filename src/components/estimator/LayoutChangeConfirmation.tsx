import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlertTriangle, 
  ArrowRight, 
  MapPin, 
  Construction,
  Home,
  Ruler,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FixtureLocation {
  id: string;
  name: string;
  currentLocation: string;
  newLocation: string;
  isMoving: boolean;
  estimatedDistance: number; // in feet
}

interface StructuralChange {
  id: string;
  description: string;
  selected: boolean;
  type: 'remove_wall' | 'remove_door' | 'add_wall' | 'add_door' | 'close_opening' | 'other';
}

interface DetectedFixture {
  name: string;
  location: string;
  confidence: number;
}

interface LayoutChangeConfirmationProps {
  projectType: 'Kitchen' | 'Bathroom';
  detectedFixtures: DetectedFixture[];
  estimatedRoomSize: { length: number; width: number; sqft: number } | null;
  imagePreview?: string;
  onConfirmKeepLayout: () => void;
  onConfirmLayoutChange: (changes: {
    fixtures: FixtureLocation[];
    structuralChanges: StructuralChange[];
    demoLevel: 'full_gut' | 'selective';
    additionalNotes: string;
  }) => void;
  onCancel: () => void;
}

// Cost estimates for relocations (per linear foot)
const RELOCATION_COSTS = {
  toilet: { perFoot: 200, baseCost: 800 },
  bathtub: { perFoot: 275, baseCost: 1200 },
  tub: { perFoot: 275, baseCost: 1200 },
  shower: { perFoot: 200, baseCost: 1000 },
  sink: { perFoot: 150, baseCost: 600 },
  vanity: { perFoot: 150, baseCost: 600 },
};

const STRUCTURAL_COSTS = {
  remove_wall: { min: 400, max: 800, label: 'Wall Removal' },
  remove_door: { min: 300, max: 500, label: 'Door/Frame Removal' },
  add_wall: { min: 800, max: 1500, label: 'New Wall Framing' },
  add_door: { min: 600, max: 1200, label: 'New Door Opening' },
  close_opening: { min: 400, max: 700, label: 'Close Opening (Drywall)' },
  other: { min: 500, max: 1000, label: 'Other Structural' },
};

export function LayoutChangeConfirmation({
  projectType,
  detectedFixtures,
  estimatedRoomSize,
  imagePreview,
  onConfirmKeepLayout,
  onConfirmLayoutChange,
  onCancel,
}: LayoutChangeConfirmationProps) {
  const [phase, setPhase] = useState<'initial' | 'layout_questions' | 'review'>('initial');
  const [demoLevel, setDemoLevel] = useState<'full_gut' | 'selective'>('full_gut');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  
  // Initialize fixtures from detected items
  const [fixtures, setFixtures] = useState<FixtureLocation[]>(() => 
    detectedFixtures.map((f, idx) => ({
      id: `fixture-${idx}`,
      name: f.name,
      currentLocation: f.location,
      newLocation: '',
      isMoving: false,
      estimatedDistance: 0,
    }))
  );

  // Initialize structural changes
  const [structuralChanges, setStructuralChanges] = useState<StructuralChange[]>([
    { id: 'remove-door-1', description: 'Remove existing door/entry', selected: false, type: 'remove_door' },
    { id: 'remove-wall-1', description: 'Remove half wall or partition', selected: false, type: 'remove_wall' },
    { id: 'close-opening-1', description: 'Close up old door opening', selected: false, type: 'close_opening' },
    { id: 'add-wall-1', description: 'Build new wall/partition', selected: false, type: 'add_wall' },
    { id: 'add-door-1', description: 'Create new door opening', selected: false, type: 'add_door' },
  ]);

  const toggleFixtureMoving = (fixtureId: string) => {
    setFixtures(prev => prev.map(f => 
      f.id === fixtureId ? { ...f, isMoving: !f.isMoving, estimatedDistance: f.isMoving ? 0 : 6 } : f
    ));
  };

  const updateFixtureNewLocation = (fixtureId: string, newLocation: string) => {
    setFixtures(prev => prev.map(f => 
      f.id === fixtureId ? { ...f, newLocation } : f
    ));
  };

  const updateFixtureDistance = (fixtureId: string, distance: number) => {
    setFixtures(prev => prev.map(f => 
      f.id === fixtureId ? { ...f, estimatedDistance: distance } : f
    ));
  };

  const toggleStructuralChange = (changeId: string) => {
    setStructuralChanges(prev => prev.map(c => 
      c.id === changeId ? { ...c, selected: !c.selected } : c
    ));
  };

  // Calculate estimated relocation costs
  const calculateRelocationCost = (fixture: FixtureLocation): number => {
    if (!fixture.isMoving || fixture.estimatedDistance === 0) return 0;
    
    const fixtureName = fixture.name.toLowerCase();
    let rate = RELOCATION_COSTS.sink; // default
    
    if (fixtureName.includes('toilet')) rate = RELOCATION_COSTS.toilet;
    else if (fixtureName.includes('tub') || fixtureName.includes('bathtub')) rate = RELOCATION_COSTS.bathtub;
    else if (fixtureName.includes('shower')) rate = RELOCATION_COSTS.shower;
    else if (fixtureName.includes('vanity') || fixtureName.includes('sink')) rate = RELOCATION_COSTS.vanity;
    
    return rate.baseCost + (rate.perFoot * fixture.estimatedDistance);
  };

  const totalRelocationCost = fixtures
    .filter(f => f.isMoving)
    .reduce((sum, f) => sum + calculateRelocationCost(f), 0);

  const totalStructuralCost = structuralChanges
    .filter(c => c.selected)
    .reduce((sum, c) => sum + STRUCTURAL_COSTS[c.type].max, 0);

  const hasLayoutChanges = fixtures.some(f => f.isMoving) || structuralChanges.some(c => c.selected);

  const handleConfirmLayoutChange = () => {
    onConfirmLayoutChange({
      fixtures: fixtures.filter(f => f.isMoving),
      structuralChanges: structuralChanges.filter(c => c.selected),
      demoLevel,
      additionalNotes,
    });
  };

  return (
    <Card className="animate-scale-in border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent shadow-lg overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge 
            variant="secondary" 
            className="bg-yellow-500/20 text-yellow-700 border border-yellow-500/30 gap-1"
          >
            <Construction className="h-3 w-3" />
            Complex Layout Detected
          </Badge>
        </div>

        {/* Photo preview + Current fixtures */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Photo */}
          {imagePreview && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img 
                src={imagePreview} 
                alt="Current layout" 
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Current Layout */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Current Layout
            </h3>
            <div className="space-y-2 text-sm">
              {detectedFixtures.map((fixture, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{fixture.name}:</span>
                  <span className="font-medium">{fixture.location}</span>
                </div>
              ))}
              {estimatedRoomSize && (
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Ruler className="h-3 w-3" /> Room Size:
                  </span>
                  <span className="font-medium">~{estimatedRoomSize.length}'×{estimatedRoomSize.width}' ({estimatedRoomSize.sqft} sqft)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phase 1: Initial Question */}
        {phase === 'initial' && (
          <div className="space-y-4">
            <div className="bg-background border-2 border-border rounded-lg p-6 text-center">
              <h3 className="font-bold text-lg mb-2">Are we keeping this layout, or changing it?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Layout changes involve structural work (walls, doors) and plumbing relocations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  className="flex-1 max-w-xs"
                  onClick={onConfirmKeepLayout}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Keep Current Layout
                </Button>
                <Button 
                  className="flex-1 max-w-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => setPhase('layout_questions')}
                >
                  <Construction className="h-4 w-4 mr-2" />
                  Changing Layout
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Layout Change Questions */}
        {phase === 'layout_questions' && (
          <div className="space-y-6">
            {/* Structural Warning */}
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100 mb-1">Structural Work Flagged</p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Layout changes may require permits, load-bearing assessments, and additional structural work.
                  </p>
                </div>
              </div>
            </div>

            {/* Fixture Relocations */}
            <div>
              <h4 className="font-semibold mb-3">Which fixtures are moving?</h4>
              <div className="space-y-3">
                {fixtures.map((fixture) => (
                  <div 
                    key={fixture.id}
                    className={cn(
                      "border rounded-lg p-4 transition-colors",
                      fixture.isMoving ? "border-yellow-500 bg-yellow-500/5" : "border-border"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={fixture.isMoving}
                        onCheckedChange={() => toggleFixtureMoving(fixture.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{fixture.name}</p>
                          <Badge variant="outline" className="text-xs">
                            Current: {fixture.currentLocation}
                          </Badge>
                        </div>
                        
                        {fixture.isMoving && (
                          <div className="mt-3 space-y-3">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Moving to:</label>
                              <Input
                                placeholder="e.g., Northeast corner, where tub currently is"
                                value={fixture.newLocation}
                                onChange={(e) => updateFixtureNewLocation(fixture.id, e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="text-xs text-muted-foreground">Distance (feet):</label>
                              <Input
                                type="number"
                                min={0}
                                max={20}
                                value={fixture.estimatedDistance}
                                onChange={(e) => updateFixtureDistance(fixture.id, parseInt(e.target.value) || 0)}
                                className="w-20 text-sm"
                              />
                              <span className="text-xs text-muted-foreground">
                                ~${calculateRelocationCost(fixture).toLocaleString()} estimated
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Structural Changes */}
            <div>
              <h4 className="font-semibold mb-3">What walls/doors are being modified?</h4>
              <div className="space-y-2">
                {structuralChanges.map((change) => (
                  <div 
                    key={change.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      change.selected ? "border-yellow-500 bg-yellow-500/5" : "border-border"
                    )}
                  >
                    <Checkbox
                      checked={change.selected}
                      onCheckedChange={() => toggleStructuralChange(change.id)}
                    />
                    <span className="text-sm">{change.description}</span>
                    {change.selected && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        ~${STRUCTURAL_COSTS[change.type].max.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Demo Level */}
            <div>
              <h4 className="font-semibold mb-3">Demo level?</h4>
              <div className="flex gap-3">
                <Button
                  variant={demoLevel === 'full_gut' ? 'default' : 'outline'}
                  onClick={() => setDemoLevel('full_gut')}
                  className="flex-1"
                >
                  Full Gut
                </Button>
                <Button
                  variant={demoLevel === 'selective' ? 'default' : 'outline'}
                  onClick={() => setDemoLevel('selective')}
                  className="flex-1"
                >
                  Selective Demo
                </Button>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <h4 className="font-semibold mb-2">Anything else about the layout changes?</h4>
              <Textarea
                placeholder="e.g., Swapping toilet and tub locations, removing the half wall between vanity and shower..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Cost Summary */}
            {hasLayoutChanges && (
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <button
                  onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="font-semibold">Estimated Structural/Relocation Costs</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      ${(totalRelocationCost + totalStructuralCost).toLocaleString()}
                    </span>
                    {showCostBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>
                
                {showCostBreakdown && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2 text-sm">
                    {fixtures.filter(f => f.isMoving).map((f) => (
                      <div key={f.id} className="flex justify-between">
                        <span className="text-muted-foreground">{f.name} relocation ({f.estimatedDistance}ft):</span>
                        <span>${calculateRelocationCost(f).toLocaleString()}</span>
                      </div>
                    ))}
                    {structuralChanges.filter(c => c.selected).map((c) => (
                      <div key={c.id} className="flex justify-between">
                        <span className="text-muted-foreground">{STRUCTURAL_COSTS[c.type].label}:</span>
                        <span>${STRUCTURAL_COSTS[c.type].max.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-2">
                  💡 These costs are in addition to standard finish work (tile, fixtures, etc.)
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleConfirmLayoutChange}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                disabled={!hasLayoutChanges}
              >
                Confirm Layout Changes <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => setPhase('initial')}>
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Cancel button always visible */}
        {phase === 'initial' && (
          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={onCancel} className="text-sm text-muted-foreground">
              Skip layout questions, just use detected items
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
