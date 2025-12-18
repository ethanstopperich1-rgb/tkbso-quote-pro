import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Estimate } from '@/types/database';
import { Plus, X, Sparkles, Edit2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Additional {
  id: string;
  description: string;
  details?: string;
  price: number;
  category?: 'upgrade' | 'optional' | 'recommended';
}

// Common additionals library
const COMMON_ADDITIONALS: Omit<Additional, 'id'>[] = [
  {
    description: "Heated Floor System",
    details: "Warm tiles year-round, energy efficient",
    price: 1200,
    category: "upgrade"
  },
  {
    description: "Premium Tile Upgrade",
    details: "Upgrade from standard to luxury tile",
    price: 1500,
    category: "upgrade"
  },
  {
    description: "Towel Warmer (Electric)",
    details: "Brushed nickel finish, wall-mounted",
    price: 350,
    category: "optional"
  },
  {
    description: "Recessed Lighting Package",
    details: "Four LED can lights with dimmer",
    price: 600,
    category: "optional"
  },
  {
    description: "Rain Shower Head",
    details: "12-inch rainfall head with handheld",
    price: 250,
    category: "upgrade"
  },
  {
    description: "Built-in Shower Bench",
    details: "Tiled bench seat, ADA compliant",
    price: 400,
    category: "optional"
  },
  {
    description: "Exhaust Fan Upgrade",
    details: "Quiet operation, 110 CFM, Bluetooth speaker",
    price: 450,
    category: "upgrade"
  },
  {
    description: "Mirror Defogger",
    details: "Heated mirror pad prevents fog",
    price: 150,
    category: "optional"
  },
  {
    description: "LED Backlit Mirror",
    details: "Touch dimmer, anti-fog, modern design",
    price: 350,
    category: "upgrade"
  },
  {
    description: "Grab Bar Package",
    details: "ADA compliant, brushed nickel finish",
    price: 275,
    category: "optional"
  },
];

interface AdditionalsCardProps {
  estimate: Estimate;
  onUpdate: (updates: Partial<Estimate>) => void;
}

export function AdditionalsCard({ estimate, onUpdate }: AdditionalsCardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');

  // Get additionals from estimate payload
  const payload = estimate.internal_json_payload as Record<string, unknown> | null;
  const additionals: Additional[] = (payload?.additionals as Additional[]) || [];

  const generateId = () => `addon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const saveAdditionals = async (newAdditionals: Additional[]) => {
    setSaving(true);
    try {
      // Convert additionals to plain JSON-compatible objects
      const additionalsJson = newAdditionals.map(a => ({
        id: a.id,
        description: a.description,
        details: a.details || null,
        price: a.price,
        category: a.category || null,
      }));

      const updatedPayload = {
        ...(payload || {}),
        additionals: additionalsJson,
      };

      const { error } = await supabase
        .from('estimates')
        .update({ internal_json_payload: updatedPayload })
        .eq('id', estimate.id);

      if (error) throw error;

      // Use type assertion for the onUpdate callback
      onUpdate({ internal_json_payload: updatedPayload as Estimate['internal_json_payload'] });
      toast.success('Additionals updated');
    } catch (error) {
      console.error('Error saving additionals:', error);
      toast.error('Failed to save additionals');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustom = () => {
    if (!description || !price) {
      toast.error('Please enter description and price');
      return;
    }

    const newAdditional: Additional = {
      id: generateId(),
      description,
      details: details || undefined,
      price: parseFloat(price),
      category: 'optional',
    };

    saveAdditionals([...additionals, newAdditional]);
    setDescription('');
    setDetails('');
    setPrice('');
    setShowAddForm(false);
  };

  const handleAddFromLibrary = (item: Omit<Additional, 'id'>) => {
    const newAdditional: Additional = {
      ...item,
      id: generateId(),
    };
    saveAdditionals([...additionals, newAdditional]);
    setShowLibrary(false);
  };

  const handleRemove = (id: string) => {
    saveAdditionals(additionals.filter(a => a.id !== id));
  };

  const handleUpdatePrice = (id: string, newPrice: string) => {
    const updated = additionals.map(a => 
      a.id === id ? { ...a, price: parseFloat(newPrice) || 0 } : a
    );
    saveAdditionals(updated);
    setEditingId(null);
  };

  const totalAdditionals = additionals.reduce((sum, a) => sum + a.price, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Recommended Additionals
          </div>
          {additionals.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              Total: ${totalAdditionals.toLocaleString()}
            </span>
          )}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Optional upgrades shown on PDF for client consideration
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Existing additionals */}
        {additionals.map((item) => (
          <div 
            key={item.id} 
            className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-100"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-slate-800">{item.description}</p>
              {item.details && (
                <p className="text-xs text-slate-500 mt-0.5">{item.details}</p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-3">
              {editingId === item.id ? (
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">$</span>
                  <Input
                    type="number"
                    defaultValue={item.price}
                    className="w-20 h-7 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdatePrice(item.id, (e.target as HTMLInputElement).value);
                      }
                    }}
                    onBlur={(e) => handleUpdatePrice(item.id, e.target.value)}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setEditingId(null)}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="font-semibold text-sm text-slate-700">
                    ${item.price.toLocaleString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
                    onClick={() => setEditingId(item.id)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                    onClick={() => handleRemove(item.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Add form */}
        {showAddForm && (
          <div className="space-y-3 p-3 border rounded-lg bg-white">
            <div>
              <Label className="text-xs">Description *</Label>
              <Input
                placeholder="e.g., Heated Floor System"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Details (optional)</Label>
              <Input
                placeholder="e.g., Warm tiles year-round"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Price *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <Input
                  type="number"
                  placeholder="1200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleAddCustom} disabled={saving}>
                {saving ? 'Saving...' : 'Add'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Library */}
        {showLibrary && (
          <div className="space-y-2 p-3 border rounded-lg bg-white max-h-80 overflow-y-auto">
            <p className="text-xs font-medium text-slate-600 mb-2">Quick Add from Library</p>
            <div className="grid grid-cols-1 gap-2">
              {COMMON_ADDITIONALS.filter(
                item => !additionals.some(a => a.description === item.description)
              ).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleAddFromLibrary(item)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition-all text-left"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{item.description}</p>
                    <p className="text-xs text-slate-500">{item.details}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-600 ml-3">
                    ${item.price.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowLibrary(false)}
              className="w-full mt-2"
            >
              Close
            </Button>
          </div>
        )}

        {/* Action buttons */}
        {!showAddForm && !showLibrary && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="flex-1"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Custom
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowLibrary(true)}
              className="flex-1"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Quick Add
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function getAdditionalsFromEstimate(estimate: Estimate): Additional[] {
  const payload = estimate.internal_json_payload as Record<string, unknown> | null;
  return (payload?.additionals as Additional[]) || [];
}
