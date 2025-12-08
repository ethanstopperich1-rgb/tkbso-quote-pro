import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ChevronUp,
  Sparkles,
  Loader2
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
  defaultExpanded?: boolean;
  hideInternalCost?: boolean;
}

// Organized by trade type for faster selection
const CATEGORY_GROUPS = {
  'Demo & Haul': ['Demo', 'Dumpster/Haul'],
  'Structural': ['Wall Removal', 'New Wall', 'Door Relocation', 'Door Closure', 'Pocket Door', 'New Doorway', 'Soffit Removal', 'Entrance Enlargement', 'Shower Enlargement', 'Alcove/Built-In'],
  'Framing': ['Framing', 'Niche', 'Blocking'],
  'Plumbing': ['Plumbing', 'Drain Relocation', 'Toilet Relocation', 'Tub Relocation'],
  'Electrical': ['Electrical', 'Recessed Can', 'Vanity Light', 'Exhaust Fan'],
  'Tile & Waterproofing': ['Tile - Wall', 'Tile - Floor', 'Tile - Shower Floor', 'Waterproofing', 'Cement Board'],
  'Glass': ['Glass - Shower', 'Glass - Panel', 'Glass - 90° Return', 'Mirror'],
  'Cabinetry & Vanity': ['Cabinets', 'Vanity', 'Closet Shelving', 'Floating Shelves'],
  'Countertops': ['Countertop - Quartz', 'Countertop - Granite', 'Countertop - Other'],
  'Paint & Drywall': ['Paint', 'Drywall', 'Ceiling Work', 'Texture'],
  'Flooring': ['Flooring - LVP', 'Flooring - Tile', 'Floor Leveling'],
  'Materials': ['Materials - Tile', 'Materials - Plumbing', 'Materials - Cabinets', 'Materials - Countertop', 'Materials - Flooring'],
  'Other': ['Other', 'Management Fee', 'Post-Construction Clean']
};

// Flatten for select options
const ALL_CATEGORIES = Object.values(CATEGORY_GROUPS).flat();

const UNITS = [
  { value: 'ea', label: 'Each' },
  { value: 'sqft', label: 'Sq Ft' },
  { value: 'lf', label: 'Linear Ft' },
  { value: 'hr', label: 'Hour' },
  { value: 'ls', label: 'Lump Sum' }
];

export function LineItemEditorCard({ estimate, onUpdate, defaultExpanded = false, hideInternalCost = false }: LineItemEditorCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
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
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // AI quick add handler
  const handleAiAdd = async () => {
    if (!aiInput.trim() || aiLoading) return;
    
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-line-item', {
        body: { input: aiInput }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const parsed = data.lineItem;
      const quantity = parsed.quantity || 1;
      const icPerUnit = parsed.ic_per_unit || 0;
      const cpPerUnit = parsed.cp_per_unit || 0;

      const item: LineItem = {
        category: parsed.category || 'Other',
        task_description: parsed.task_description || aiInput,
        quantity,
        unit: parsed.unit || 'ea',
        ic_per_unit: icPerUnit,
        cp_per_unit: cpPerUnit,
        ic_total: quantity * icPerUnit,
        cp_total: quantity * cpPerUnit,
        margin_percent: cpPerUnit > 0 ? ((cpPerUnit - icPerUnit) / cpPerUnit) * 100 : 0,
      };

      setLineItems([...lineItems, item]);
      setAiInput('');
      setHasChanges(true);
      toast.success(`Added: ${item.task_description}`);
    } catch (err) {
      console.error('AI parse error:', err);
      toast.error('Failed to parse. Try: "demo $1500" or "tile wall 128sqft $39/sqft"');
    } finally {
      setAiLoading(false);
    }
  };

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
    const item = lineItems[index];
    setEditForm({ 
      ...item,
      ic_total: item.ic_total,
      cp_total: item.cp_total,
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm({});
  };

  const handleSaveItemEdit = () => {
    if (editingIndex === null) return;

    const quantity = editForm.quantity || 1;
    const icTotal = editForm.ic_total ?? (quantity * (editForm.ic_per_unit || 0));
    const cpTotal = editForm.cp_total ?? (quantity * (editForm.cp_per_unit || 0));
    
    // Back-calculate per-unit from totals
    const icPerUnit = quantity > 0 ? icTotal / quantity : 0;
    const cpPerUnit = quantity > 0 ? cpTotal / quantity : 0;
    
    const updatedItem: LineItem = {
      ...lineItems[editingIndex],
      ...editForm,
      quantity,
      ic_per_unit: Math.round(icPerUnit * 100) / 100,
      cp_per_unit: Math.round(cpPerUnit * 100) / 100,
      ic_total: Math.round(icTotal * 100) / 100,
      cp_total: Math.round(cpTotal * 100) / 100,
      margin_percent: cpTotal > 0 ? ((cpTotal - icTotal) / cpTotal) * 100 : 0,
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
          <div className={cn("grid gap-4 p-4 bg-muted/50 rounded-lg text-sm", hideInternalCost ? "grid-cols-1" : "grid-cols-3")}>
            {!hideInternalCost && (
              <div>
                <p className="text-muted-foreground">Internal Cost</p>
                <p className="font-semibold">{formatCurrency(totalIc)}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Client Price</p>
              <p className="font-semibold text-primary">{formatCurrency(totalCp)}</p>
            </div>
            {!hideInternalCost && (
              <div>
                <p className="text-muted-foreground">Margin</p>
                <p className="font-semibold text-emerald-600">{overallMargin.toFixed(1)}%</p>
              </div>
            )}
          </div>

          {/* AI Quick Add */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiAdd()}
                placeholder='Try: "demo $1500" or "tile wall 128sqft $39/sqft"'
                className="pl-9 h-9 text-sm"
                disabled={aiLoading}
              />
            </div>
            <Button 
              size="sm" 
              onClick={handleAiAdd} 
              disabled={aiLoading || !aiInput.trim()}
              className="h-9"
            >
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
            
            {/* Manual Add Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Plus className="h-4 w-4 mr-1" />
                  Manual
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Line Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {/* Category - Grouped for faster selection */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Category</Label>
                  <Select 
                    value={newItem.category} 
                    onValueChange={(v) => setNewItem({ ...newItem, category: v })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Object.entries(CATEGORY_GROUPS).map(([group, categories]) => (
                        <div key={group}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                            {group}
                          </div>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat} className="pl-4">
                              {cat}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Description</Label>
                  <Input
                    value={newItem.task_description}
                    onChange={(e) => setNewItem({ ...newItem, task_description: e.target.value })}
                    placeholder="e.g., Remove existing vanity"
                    className="h-9"
                  />
                </div>

                {/* Quantity & Unit in one row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Qty</Label>
                    <Input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                      className="h-9"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Unit</Label>
                    <div className="flex gap-1">
                      {UNITS.map(u => (
                        <Button
                          key={u.value}
                          type="button"
                          variant={newItem.unit === u.value ? "default" : "outline"}
                          size="sm"
                          className="flex-1 h-9 text-xs"
                          onClick={() => setNewItem({ ...newItem, unit: u.value })}
                        >
                          {u.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Internal Cost</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        value={newItem.ic_per_unit}
                        onChange={(e) => setNewItem({ ...newItem, ic_per_unit: parseFloat(e.target.value) || 0 })}
                        className="h-9 pl-7"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Client Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        value={newItem.cp_per_unit}
                        onChange={(e) => setNewItem({ ...newItem, cp_per_unit: parseFloat(e.target.value) || 0 })}
                        className="h-9 pl-7"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {(newItem.quantity || 0) > 0 && ((newItem.ic_per_unit || 0) > 0 || (newItem.cp_per_unit || 0) > 0) && (
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg text-sm">
                    <span className="text-muted-foreground">Line Total:</span>
                    <div className="flex gap-4">
                      <span className="text-muted-foreground">
                        IC: {formatCurrency((newItem.quantity || 0) * (newItem.ic_per_unit || 0))}
                      </span>
                      <span className="font-semibold text-primary">
                        CP: {formatCurrency((newItem.quantity || 0) * (newItem.cp_per_unit || 0))}
                      </span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleAddItem} 
                  className="w-full"
                  disabled={!newItem.task_description}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>

          {/* Line Items by Category */}
          <div className="space-y-3">
            {Object.entries(groupedItems).map(([category, items]) => {
              const categoryTotal = items.reduce((sum, i) => sum + i.cp_total, 0);
              return (
                <div key={category} className="border rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                    <span className="text-sm font-semibold">{category}</span>
                    <span className="text-sm font-medium text-primary">{formatCurrency(categoryTotal)}</span>
                  </div>
                  
                  {/* Items */}
                  <div className="divide-y">
                    {items.map((item) => (
                      <div key={item.originalIndex} className="group">
                        {editingIndex === item.originalIndex ? (
                          <div className="p-3 bg-muted/20 space-y-3">
                            <Input
                              value={editForm.task_description}
                              onChange={(e) => setEditForm({ ...editForm, task_description: e.target.value })}
                              className="h-8"
                              placeholder="Description"
                            />
                            <div className="grid grid-cols-4 gap-2">
                              <Input
                                type="number"
                                value={editForm.quantity}
                                onChange={(e) => setEditForm({ ...editForm, quantity: parseFloat(e.target.value) || 1 })}
                                className="h-8"
                                placeholder="Qty"
                              />
                              {!hideInternalCost && (
                                <Input
                                  type="number"
                                  value={editForm.ic_total}
                                  onChange={(e) => setEditForm({ ...editForm, ic_total: parseFloat(e.target.value) || 0 })}
                                  className="h-8"
                                  placeholder="IC Total"
                                />
                              )}
                              <Input
                                type="number"
                                value={editForm.cp_total}
                                onChange={(e) => setEditForm({ ...editForm, cp_total: parseFloat(e.target.value) || 0 })}
                                className="h-8"
                                placeholder="CP Total"
                              />
                              <div className="flex gap-1">
                                <Button size="sm" variant="default" className="h-8 flex-1" onClick={handleSaveItemEdit}>
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8" onClick={handleCancelEdit}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">{item.task_description}</span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {item.quantity} {item.unit}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {!hideInternalCost && (
                                <span className="text-sm text-muted-foreground w-20 text-right">
                                  {formatCurrency(item.ic_total)}
                                </span>
                              )}
                              <span className="text-sm font-medium w-20 text-right">
                                {formatCurrency(item.cp_total)}
                              </span>
                              {!hideInternalCost && (
                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-7 w-7"
                                    onClick={() => handleEditItem(item.originalIndex)}
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteItem(item.originalIndex)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {lineItems.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">No line items yet</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Line Item" to build your estimate</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
