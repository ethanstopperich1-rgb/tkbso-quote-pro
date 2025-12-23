import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus, 
  Copy, 
  Bath, 
  ChefHat, 
  Sparkles,
  Home
} from 'lucide-react';
import { toast } from 'sonner';
import { Estimate } from '@/types/database';
import { BATHROOM_DEFAULTS, KITCHEN_DEFAULTS } from '@/lib/project-defaults';
import { supabase } from '@/integrations/supabase/client';

interface LineItem {
  id?: string;
  category: string;
  task_description: string;
  quantity: number;
  unit: string;
  ic_per_unit: number;
  cp_per_unit: number;
  ic_total: number;
  cp_total: number;
  margin_percent: number;
  room_label?: string;
}

interface AddSectionCardProps {
  estimate: Estimate;
  onUpdate: (updates: Partial<Estimate>) => void;
}

const SECTION_TEMPLATES = [
  { 
    id: 'bathroom', 
    label: 'Full Bathroom Remodel', 
    icon: Bath,
    description: 'Demo, plumbing, tile, vanity, glass'
  },
  { 
    id: 'shower_only', 
    label: 'Shower-Only Remodel', 
    icon: Bath,
    description: 'Demo, plumbing, tile, glass'
  },
  { 
    id: 'kitchen', 
    label: 'Full Kitchen Remodel', 
    icon: ChefHat,
    description: 'Demo, cabinets, countertops, appliances'
  },
  { 
    id: 'half_bath', 
    label: 'Half Bath / Powder Room', 
    icon: Home,
    description: 'Demo, vanity, toilet, paint'
  },
];

function generateBathroomLineItems(roomLabel: string): LineItem[] {
  const defaults = BATHROOM_DEFAULTS;
  const items: LineItem[] = [];
  const timestamp = Date.now();
  
  // Demo
  items.push({
    id: `item-${timestamp}-demo`,
    category: 'Demo',
    task_description: `Full bathroom demo - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 1650,
    cp_per_unit: 2500,
    ic_total: 1650,
    cp_total: 2500,
    margin_percent: 34,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-dumpster`,
    category: 'Dumpster/Haul',
    task_description: `Dumpster & haul - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 400,
    cp_per_unit: 750,
    ic_total: 400,
    cp_total: 750,
    margin_percent: 47,
    room_label: roomLabel,
  });
  
  // Plumbing
  items.push({
    id: `item-${timestamp}-plumbing`,
    category: 'Plumbing',
    task_description: `Plumbing rough-in & finish - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 2225,
    cp_per_unit: 3425,
    ic_total: 2225,
    cp_total: 3425,
    margin_percent: 35,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-toilet`,
    category: 'Plumbing',
    task_description: `Toilet installation - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 350,
    cp_per_unit: 690,
    ic_total: 350,
    cp_total: 690,
    margin_percent: 49,
    room_label: roomLabel,
  });
  
  // Electrical
  items.push({
    id: `item-${timestamp}-electrical`,
    category: 'Electrical',
    task_description: `Electrical package - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 250,
    cp_per_unit: 400,
    ic_total: 250,
    cp_total: 400,
    margin_percent: 38,
    room_label: roomLabel,
  });
  
  // Tile - estimate 100 sqft walls
  items.push({
    id: `item-${timestamp}-tile-wall`,
    category: 'Tile - Wall',
    task_description: `Wall tile installation - ${roomLabel}`,
    quantity: 100,
    unit: 'sqft',
    ic_per_unit: 20,
    cp_per_unit: 39,
    ic_total: 2000,
    cp_total: 3900,
    margin_percent: 49,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-tile-floor`,
    category: 'Tile - Floor',
    task_description: `Floor tile installation - ${roomLabel}`,
    quantity: 50,
    unit: 'sqft',
    ic_per_unit: 5.5,
    cp_per_unit: 12,
    ic_total: 275,
    cp_total: 600,
    margin_percent: 54,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-waterproofing`,
    category: 'Waterproofing',
    task_description: `Waterproofing system - ${roomLabel}`,
    quantity: 100,
    unit: 'sqft',
    ic_per_unit: 6,
    cp_per_unit: 13,
    ic_total: 600,
    cp_total: 1300,
    margin_percent: 54,
    room_label: roomLabel,
  });
  
  // Vanity
  items.push({
    id: `item-${timestamp}-vanity`,
    category: 'Vanity',
    task_description: `48" vanity bundle with top - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 1600,
    cp_per_unit: 2600,
    ic_total: 1600,
    cp_total: 2600,
    margin_percent: 38,
    room_label: roomLabel,
  });
  
  // Glass
  items.push({
    id: `item-${timestamp}-glass`,
    category: 'Glass - Shower',
    task_description: `Frameless glass enclosure - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 1200,
    cp_per_unit: 2100,
    ic_total: 1200,
    cp_total: 2100,
    margin_percent: 43,
    room_label: roomLabel,
  });
  
  // Paint
  items.push({
    id: `item-${timestamp}-paint`,
    category: 'Paint',
    task_description: `Paint & patch - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 800,
    cp_per_unit: 1300,
    ic_total: 800,
    cp_total: 1300,
    margin_percent: 38,
    room_label: roomLabel,
  });
  
  return items;
}

function generateShowerOnlyLineItems(roomLabel: string): LineItem[] {
  const timestamp = Date.now();
  const items: LineItem[] = [];
  
  items.push({
    id: `item-${timestamp}-demo`,
    category: 'Demo',
    task_description: `Shower-only demo - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 900,
    cp_per_unit: 1450,
    ic_total: 900,
    cp_total: 1450,
    margin_percent: 38,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-dumpster`,
    category: 'Dumpster/Haul',
    task_description: `Dumpster & haul - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 300,
    cp_per_unit: 550,
    ic_total: 300,
    cp_total: 550,
    margin_percent: 45,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-plumbing`,
    category: 'Plumbing',
    task_description: `Shower plumbing rough-in & finish - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 2225,
    cp_per_unit: 3425,
    ic_total: 2225,
    cp_total: 3425,
    margin_percent: 35,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-tile-wall`,
    category: 'Tile - Wall',
    task_description: `Wall tile installation - ${roomLabel}`,
    quantity: 100,
    unit: 'sqft',
    ic_per_unit: 20,
    cp_per_unit: 39,
    ic_total: 2000,
    cp_total: 3900,
    margin_percent: 49,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-tile-floor`,
    category: 'Tile - Shower Floor',
    task_description: `Shower floor tile - ${roomLabel}`,
    quantity: 15,
    unit: 'sqft',
    ic_per_unit: 6,
    cp_per_unit: 14,
    ic_total: 90,
    cp_total: 210,
    margin_percent: 57,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-waterproofing`,
    category: 'Waterproofing',
    task_description: `Waterproofing system - ${roomLabel}`,
    quantity: 100,
    unit: 'sqft',
    ic_per_unit: 6,
    cp_per_unit: 13,
    ic_total: 600,
    cp_total: 1300,
    margin_percent: 54,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-glass`,
    category: 'Glass - Shower',
    task_description: `Frameless glass enclosure - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 1200,
    cp_per_unit: 2100,
    ic_total: 1200,
    cp_total: 2100,
    margin_percent: 43,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-paint`,
    category: 'Paint',
    task_description: `Paint & patch - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 500,
    cp_per_unit: 800,
    ic_total: 500,
    cp_total: 800,
    margin_percent: 38,
    room_label: roomLabel,
  });
  
  return items;
}

function generateHalfBathLineItems(roomLabel: string): LineItem[] {
  const timestamp = Date.now();
  const items: LineItem[] = [];
  
  items.push({
    id: `item-${timestamp}-demo`,
    category: 'Demo',
    task_description: `Half bath demo - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 600,
    cp_per_unit: 1000,
    ic_total: 600,
    cp_total: 1000,
    margin_percent: 40,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-plumbing`,
    category: 'Plumbing',
    task_description: `Plumbing - toilet & vanity - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 700,
    cp_per_unit: 1200,
    ic_total: 700,
    cp_total: 1200,
    margin_percent: 42,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-vanity`,
    category: 'Vanity',
    task_description: `30" vanity bundle with top - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 1100,
    cp_per_unit: 1800,
    ic_total: 1100,
    cp_total: 1800,
    margin_percent: 39,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-tile-floor`,
    category: 'Tile - Floor',
    task_description: `Floor tile installation - ${roomLabel}`,
    quantity: 25,
    unit: 'sqft',
    ic_per_unit: 5.5,
    cp_per_unit: 12,
    ic_total: 137.5,
    cp_total: 300,
    margin_percent: 54,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-paint`,
    category: 'Paint',
    task_description: `Paint walls & ceiling - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 500,
    cp_per_unit: 850,
    ic_total: 500,
    cp_total: 850,
    margin_percent: 41,
    room_label: roomLabel,
  });
  
  return items;
}

function generateKitchenLineItems(roomLabel: string): LineItem[] {
  const timestamp = Date.now();
  const items: LineItem[] = [];
  
  items.push({
    id: `item-${timestamp}-demo`,
    category: 'Demo',
    task_description: `Kitchen demo - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 1750,
    cp_per_unit: 2800,
    ic_total: 1750,
    cp_total: 2800,
    margin_percent: 38,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-dumpster`,
    category: 'Dumpster/Haul',
    task_description: `Dumpster & haul - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 825,
    cp_per_unit: 1400,
    ic_total: 825,
    cp_total: 1400,
    margin_percent: 41,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-cabinets`,
    category: 'Cabinets',
    task_description: `Cabinet installation - ${roomLabel}`,
    quantity: 20,
    unit: 'lf',
    ic_per_unit: 250,
    cp_per_unit: 400,
    ic_total: 5000,
    cp_total: 8000,
    margin_percent: 38,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-countertop`,
    category: 'Countertop - Quartz',
    task_description: `Quartz countertop - ${roomLabel}`,
    quantity: 40,
    unit: 'sqft',
    ic_per_unit: 65,
    cp_per_unit: 108,
    ic_total: 2600,
    cp_total: 4320,
    margin_percent: 40,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-backsplash`,
    category: 'Tile - Wall',
    task_description: `Backsplash tile - ${roomLabel}`,
    quantity: 30,
    unit: 'sqft',
    ic_per_unit: 18,
    cp_per_unit: 32,
    ic_total: 540,
    cp_total: 960,
    margin_percent: 44,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-plumbing`,
    category: 'Plumbing',
    task_description: `Plumbing - sink, faucet, disposal - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 525,
    cp_per_unit: 950,
    ic_total: 525,
    cp_total: 950,
    margin_percent: 45,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-electrical`,
    category: 'Electrical',
    task_description: `Electrical package - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 950,
    cp_per_unit: 1750,
    ic_total: 950,
    cp_total: 1750,
    margin_percent: 46,
    room_label: roomLabel,
  });
  
  items.push({
    id: `item-${timestamp}-paint`,
    category: 'Paint',
    task_description: `Paint walls & ceiling - ${roomLabel}`,
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 800,
    cp_per_unit: 1400,
    ic_total: 800,
    cp_total: 1400,
    margin_percent: 43,
    room_label: roomLabel,
  });
  
  return items;
}

export function AddSectionCard({ estimate, onUpdate }: AddSectionCardProps) {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('bathroom');
  const [roomLabel, setRoomLabel] = useState('');
  const [selectedCloneRoom, setSelectedCloneRoom] = useState<string>('');
  const [newRoomLabel, setNewRoomLabel] = useState('');
  const [saving, setSaving] = useState(false);

  // Get existing line items
  const payload = estimate.internal_json_payload as any;
  const existingLineItems: LineItem[] = payload?.pricing?.line_items || [];
  
  // Get unique room labels from existing items
  const existingRoomLabels = [...new Set(
    existingLineItems
      .map(item => item.room_label)
      .filter(Boolean)
  )] as string[];

  const handleAddFromTemplate = async () => {
    if (!roomLabel.trim()) {
      toast.error('Please enter a room label');
      return;
    }

    setSaving(true);
    try {
      let newItems: LineItem[] = [];
      
      switch (selectedTemplate) {
        case 'bathroom':
          newItems = generateBathroomLineItems(roomLabel);
          break;
        case 'shower_only':
          newItems = generateShowerOnlyLineItems(roomLabel);
          break;
        case 'half_bath':
          newItems = generateHalfBathLineItems(roomLabel);
          break;
        case 'kitchen':
          newItems = generateKitchenLineItems(roomLabel);
          break;
      }

      // Combine with existing items
      const allItems = [...existingLineItems, ...newItems];
      
      // Calculate new totals
      const totalIc = allItems.reduce((sum, item) => sum + item.ic_total, 0);
      const totalCp = allItems.reduce((sum, item) => sum + item.cp_total, 0);
      const lowMultiplier = 0.95;
      const highMultiplier = 1.05;

      const updatedPayload = {
        ...payload,
        pricing: {
          ...payload?.pricing,
          line_items: allItems,
          totals: {
            ...payload?.pricing?.totals,
            total_ic: totalIc,
            total_cp: totalCp,
            low_estimate: totalCp * lowMultiplier,
            high_estimate: totalCp * highMultiplier,
          }
        }
      };

      const updates = {
        internal_json_payload: updatedPayload,
        final_ic_total: totalIc,
        final_cp_total: totalCp,
        low_estimate_cp: totalCp * lowMultiplier,
        high_estimate_cp: totalCp * highMultiplier,
      };

      const { error } = await supabase
        .from('estimates')
        .update(updates)
        .eq('id', estimate.id);

      if (error) throw error;

      onUpdate(updates);
      setTemplateDialogOpen(false);
      setRoomLabel('');
      toast.success(`Added ${roomLabel} section with ${newItems.length} line items!`);
    } catch (error) {
      console.error('Error adding section:', error);
      toast.error('Failed to add section');
    } finally {
      setSaving(false);
    }
  };

  const handleCloneSection = async () => {
    if (!selectedCloneRoom || !newRoomLabel.trim()) {
      toast.error('Please select a room and enter a new label');
      return;
    }

    setSaving(true);
    try {
      // Find all items from the selected room
      const itemsToClone = existingLineItems.filter(
        item => item.room_label === selectedCloneRoom
      );

      if (itemsToClone.length === 0) {
        toast.error('No items found in selected room');
        return;
      }

      const timestamp = Date.now();
      
      // Clone items with new room label and IDs
      const clonedItems: LineItem[] = itemsToClone.map((item, idx) => ({
        ...item,
        id: `item-${timestamp}-clone-${idx}`,
        room_label: newRoomLabel,
        task_description: item.task_description.replace(selectedCloneRoom, newRoomLabel),
      }));

      // Combine with existing items
      const allItems = [...existingLineItems, ...clonedItems];
      
      // Calculate new totals
      const totalIc = allItems.reduce((sum, item) => sum + item.ic_total, 0);
      const totalCp = allItems.reduce((sum, item) => sum + item.cp_total, 0);
      const lowMultiplier = 0.95;
      const highMultiplier = 1.05;

      const updatedPayload = {
        ...payload,
        pricing: {
          ...payload?.pricing,
          line_items: allItems,
          totals: {
            ...payload?.pricing?.totals,
            total_ic: totalIc,
            total_cp: totalCp,
            low_estimate: totalCp * lowMultiplier,
            high_estimate: totalCp * highMultiplier,
          }
        }
      };

      const updates = {
        internal_json_payload: updatedPayload,
        final_ic_total: totalIc,
        final_cp_total: totalCp,
        low_estimate_cp: totalCp * lowMultiplier,
        high_estimate_cp: totalCp * highMultiplier,
      };

      const { error } = await supabase
        .from('estimates')
        .update(updates)
        .eq('id', estimate.id);

      if (error) throw error;

      onUpdate(updates);
      setCloneDialogOpen(false);
      setSelectedCloneRoom('');
      setNewRoomLabel('');
      toast.success(`Cloned ${clonedItems.length} items to "${newRoomLabel}"!`);
    } catch (error) {
      console.error('Error cloning section:', error);
      toast.error('Failed to clone section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Section
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Add from Template */}
        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Sparkles className="h-4 w-4" />
              Add from Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Section from Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Room Label</Label>
                <Input 
                  placeholder="e.g., Guest Bathroom, Master Bath"
                  value={roomLabel}
                  onChange={(e) => setRoomLabel(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_TEMPLATES.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <template.icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{template.label}</div>
                            <div className="text-xs text-muted-foreground">{template.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddFromTemplate} disabled={saving}>
                {saving ? 'Adding...' : 'Add Section'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clone Existing Section */}
        <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2"
              disabled={existingRoomLabels.length === 0}
            >
              <Copy className="h-4 w-4" />
              Clone Existing Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clone Existing Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Source Room</Label>
                <Select value={selectedCloneRoom} onValueChange={setSelectedCloneRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room to clone" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingRoomLabels.map(label => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>New Room Label</Label>
                <Input 
                  placeholder="e.g., Guest Bathroom"
                  value={newRoomLabel}
                  onChange={(e) => setNewRoomLabel(e.target.value)}
                />
              </div>
              
              {selectedCloneRoom && (
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    This will duplicate {existingLineItems.filter(i => i.room_label === selectedCloneRoom).length} items 
                    from "{selectedCloneRoom}"
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCloneDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCloneSection} disabled={saving}>
                {saving ? 'Cloning...' : 'Clone Section'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {existingRoomLabels.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Clone option will be available after you have line items with room labels.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
