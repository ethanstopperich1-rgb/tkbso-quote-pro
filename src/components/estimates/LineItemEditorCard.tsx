import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  List, 
  Plus, 
  Trash2, 
  Save, 
  Edit2, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/pricing-calculator';
import { Estimate } from '@/types/database';
import { cn } from '@/lib/utils';

interface LineItem {
  category: string;
  task_description: string;
  quantity: number;
  unit: string;
  ic_per_unit: number;
  cp_per_unit: number;
  ic_total: number;
  cp_total: number;
  margin_percent: number;
}

interface LineItemEditorCardProps {
  estimate: Estimate;
  onUpdate: (updates: Partial<Estimate>) => void;
}

const CATEGORIES = [
  'Demo',
  'Framing',
  'Plumbing',
  'Electrical',
  'Tile',
  'Waterproofing',
  'Glass',
  'Vanity',
  'Paint',
  'Cabinets',
  'Countertop',
  'Other'
];

const UNITS = ['ea', 'sqft', 'lf', 'hr', 'ls'];

export function LineItemEditorCard({ estimate, onUpdate }: LineItemEditorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<LineItem>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<LineItem>>({
    category: 'Other',
    task_description: '',
    quantity: 1,
    unit: 'ea',
    ic_per_unit: 0,
    cp_per_unit: 0,
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load line items from estimate payload
  useEffect(() => {
    const payload = estimate.internal_json_payload as any;
    if (payload?.pricing?.line_items) {
      setLineItems(payload.pricing.line_items);
    }
  }, [estimate.internal_json_payload]);

  const calculateTotals = (items: LineItem[]) => {
    const totalIc = items.reduce((sum, item) => sum + item.ic_total, 0);
    const totalCp = items.reduce((sum, item) => sum + item.cp_total, 0);
    const overallMargin = totalCp > 0 ? ((totalCp - totalIc) / totalCp) * 100 : 0;
    return { totalIc, totalCp, overallMargin };
  };

  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...lineItems[index] });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm({});
  };

  const handleSaveItemEdit = () => {
    if (editingIndex === null) return;

    const quantity = editForm.quantity || 0;
    const icPerUnit = editForm.ic_per_unit || 0;
    const cpPerUnit = editForm.cp_per_unit || 0;
    
    const updatedItem: LineItem = {
      ...lineItems[editingIndex],
      ...editForm,
      ic_total: quantity * icPerUnit,
      cp_total: quantity * cpPerUnit,
      margin_percent: cpPerUnit > 0 ? ((cpPerUnit - icPerUnit) / cpPerUnit) * 100 : 0,
    };

    const newItems = [...lineItems];
    newItems[editingIndex] = updatedItem;
    setLineItems(newItems);
    setEditingIndex(null);
    setEditForm({});
    setHasChanges(true);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = lineItems.filter((_, i) => i !== index);
    setLineItems(newItems);
    setHasChanges(true);
  };

  const handleAddItem = () => {
    const quantity = newItem.quantity || 0;
    const icPerUnit = newItem.ic_per_unit || 0;
    const cpPerUnit = newItem.cp_per_unit || 0;

    const item: LineItem = {
      category: newItem.category || 'Other',
      task_description: newItem.task_description || 'New Item',
      quantity,
      unit: newItem.unit || 'ea',
      ic_per_unit: icPerUnit,
      cp_per_unit: cpPerUnit,
      ic_total: quantity * icPerUnit,
      cp_total: quantity * cpPerUnit,
      margin_percent: cpPerUnit > 0 ? ((cpPerUnit - icPerUnit) / cpPerUnit) * 100 : 0,
    };

    setLineItems([...lineItems, item]);
    setNewItem({
      category: 'Other',
      task_description: '',
      quantity: 1,
      unit: 'ea',
      ic_per_unit: 0,
      cp_per_unit: 0,
    });
    setIsAddDialogOpen(false);
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const { totalIc, totalCp, overallMargin } = calculateTotals(lineItems);
      const lowMultiplier = 0.95;
      const highMultiplier = 1.05;

      // Update internal_json_payload with new line items
      const payload = (estimate.internal_json_payload as any) || {};
      const updatedPayload = {
        ...payload,
        pricing: {
          ...payload.pricing,
          line_items: lineItems,
          totals: {
            ...payload.pricing?.totals,
            total_ic: totalIc,
            total_cp: totalCp,
            low_estimate: totalCp * lowMultiplier,
            high_estimate: totalCp * highMultiplier,
            overall_margin_percent: overallMargin,
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
      setHasChanges(false);
      toast.success('Line items saved!');
    } catch (error) {
      console.error('Error saving line items:', error);
      toast.error('Failed to save line items');
    } finally {
      setSaving(false);
    }
  };

  const { totalIc, totalCp, overallMargin } = calculateTotals(lineItems);

  // Group items by category
  const groupedItems = lineItems.reduce((acc, item, index) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ ...item, originalIndex: index });
    return acc;
  }, {} as Record<string, (LineItem & { originalIndex: number })[]>);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <List className="h-5 w-5" />
          Line Items ({lineItems.length})
        </CardTitle>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button size="sm" onClick={handleSaveAll} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
            <div>
              <p className="text-muted-foreground">Internal Cost</p>
              <p className="font-semibold">{formatCurrency(totalIc)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Client Price</p>
              <p className="font-semibold text-primary">{formatCurrency(totalCp)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Margin</p>
              <p className="font-semibold text-emerald-600">{overallMargin.toFixed(1)}%</p>
            </div>
          </div>

          {/* Add Item Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Line Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Line Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={newItem.category} 
                      onValueChange={(v) => setNewItem({ ...newItem, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select 
                      value={newItem.unit} 
                      onValueChange={(v) => setNewItem({ ...newItem, unit: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map(u => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newItem.task_description}
                    onChange={(e) => setNewItem({ ...newItem, task_description: e.target.value })}
                    placeholder="e.g., Demo - Shower Only"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IC/Unit ($)</Label>
                    <Input
                      type="number"
                      value={newItem.ic_per_unit}
                      onChange={(e) => setNewItem({ ...newItem, ic_per_unit: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CP/Unit ($)</Label>
                    <Input
                      type="number"
                      value={newItem.cp_per_unit}
                      onChange={(e) => setNewItem({ ...newItem, cp_per_unit: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Line Items by Category */}
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {category}
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">IC</TableHead>
                    <TableHead className="text-right">CP</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.originalIndex}>
                      {editingIndex === item.originalIndex ? (
                        <>
                          <TableCell>
                            <Input
                              value={editForm.task_description}
                              onChange={(e) => setEditForm({ ...editForm, task_description: e.target.value })}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={editForm.quantity}
                              onChange={(e) => setEditForm({ ...editForm, quantity: parseFloat(e.target.value) || 0 })}
                              className="h-8 w-16 text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={editForm.ic_per_unit}
                              onChange={(e) => setEditForm({ ...editForm, ic_per_unit: parseFloat(e.target.value) || 0 })}
                              className="h-8 w-20 text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={editForm.cp_per_unit}
                              onChange={(e) => setEditForm({ ...editForm, cp_per_unit: parseFloat(e.target.value) || 0 })}
                              className="h-8 w-20 text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveItemEdit}>
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancelEdit}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">
                            {item.task_description}
                            <span className="text-muted-foreground text-xs ml-2">({item.unit})</span>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(item.ic_total)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.cp_total)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7"
                                onClick={() => handleEditItem(item.originalIndex)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteItem(item.originalIndex)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}

          {lineItems.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No line items found. Add items to build your estimate.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
