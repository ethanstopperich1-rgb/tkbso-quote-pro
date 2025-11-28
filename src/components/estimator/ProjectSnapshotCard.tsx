import { useState } from 'react';
import { useEstimator, ScopeLevel } from '@/contexts/EstimatorContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, MapPin, Home, Ruler, Settings2 } from 'lucide-react';

export function ProjectSnapshotCard() {
  const { state, updateRoom, setHasGC, setNeedsPermit, setQualityLevel, setLocation } = useEstimator();
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  
  const room = state.rooms[0];
  if (!room) return null;
  
  const scopeLabel = room.scopeLevel === 'full_gut' ? 'Full Gut' :
    room.scopeLevel === 'shower_only' ? 'Shower Only' :
    room.scopeLevel === 'partial' ? 'Partial' : 'Refresh';
  
  const projectType = state.projectType === 'combination' ? 'Kitchen + Bath' :
    state.projectType?.charAt(0).toUpperCase() + state.projectType?.slice(1);
  
  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Home className="w-4 h-4 text-primary" />
            Project Snapshot
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Pencil className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Project Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Room Size */}
                <div className="space-y-2">
                  <Label htmlFor="sqft">Room Size (sq ft)</Label>
                  <Input
                    id="sqft"
                    type="number"
                    value={room.sqft}
                    onChange={(e) => updateRoom(room.id, { sqft: parseInt(e.target.value) || 0 })}
                  />
                </div>
                
                {/* Scope Level */}
                <div className="space-y-2">
                  <Label>Scope Level</Label>
                  <Select
                    value={room.scopeLevel}
                    onValueChange={(value: ScopeLevel) => updateRoom(room.id, { scopeLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_gut">Full Gut</SelectItem>
                      <SelectItem value="partial">Partial Remodel</SelectItem>
                      <SelectItem value="shower_only">Shower Only</SelectItem>
                      <SelectItem value="refresh">Cosmetic Refresh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Quality Level */}
                <div className="space-y-2">
                  <Label>Finish Level</Label>
                  <Select
                    value={state.qualityLevel}
                    onValueChange={(value: 'basic' | 'mid-range' | 'high-end') => setQualityLevel(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic / Builder Grade</SelectItem>
                      <SelectItem value="mid-range">Mid-Range</SelectItem>
                      <SelectItem value="high-end">High-End / Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location / City</Label>
                  <Input
                    id="location"
                    value={state.location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Winter Garden, FL"
                  />
                </div>
                
                {/* GC & Permit */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gc" className="cursor-pointer">GC Partner Involved</Label>
                    <Switch
                      id="gc"
                      checked={state.hasGC}
                      onCheckedChange={setHasGC}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="permit" className="cursor-pointer">Permit Required</Label>
                    <Switch
                      id="permit"
                      checked={state.needsPermit}
                      onCheckedChange={setNeedsPermit}
                    />
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Project Type</span>
            <p className="font-medium">{projectType} Remodel</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Room Size</span>
            <p className="font-medium flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5" />
              {room.sqft} sq ft
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Scope</span>
            <p className="font-medium">{scopeLabel}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Finish Level</span>
            <p className="font-medium capitalize">{state.qualityLevel}</p>
          </div>
        </div>
        
        {state.location && (
          <div className="pt-2 border-t">
            <span className="text-muted-foreground text-xs uppercase tracking-wide flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Location
            </span>
            <p className="font-medium">{state.location}</p>
          </div>
        )}
        
        <div className="pt-2 border-t text-sm">
          <span className="text-muted-foreground text-xs uppercase tracking-wide flex items-center gap-1">
            <Settings2 className="w-3 h-3" />
            Permit / GC
          </span>
          <p className="font-medium">
            {state.hasGC && state.needsPermit ? 'GC partner + Permit required' :
             state.hasGC ? 'GC partner handling' :
             state.needsPermit ? 'Permit required – TKBSO to coordinate' :
             'No GC / No permit needed'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
