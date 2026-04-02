import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Estimate } from '@/types/database';
import { Plus, X, Sparkles, Edit2, Check } from 'lucide-react';

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
    <div className="bg-[#111] border border-[#222] rounded-[12px]">
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">
            Recommended Additionals
          </h3>
          {additionals.length > 0 && (
            <span className="font-mono text-[11px] text-[#999] tabular-nums">
              Total: ${totalAdditionals.toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-xs text-[#666] mt-1">
          Optional upgrades shown on PDF for client consideration
        </p>
      </div>
      <div className="px-4 pb-4 space-y-3">
        {/* Existing additionals */}
        {additionals.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between p-3 bg-black rounded-[4px] border border-[#222]"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#E8E8E8]">{item.description}</p>
              {item.details && (
                <p className="text-xs text-[#666] mt-0.5">{item.details}</p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-3">
              {editingId === item.id ? (
                <div className="flex items-center gap-1">
                  <span className="text-[#666]">$</span>
                  <Input
                    type="number"
                    defaultValue={item.price}
                    className="w-20 h-7 text-sm bg-black border-[#333] text-[#E8E8E8] font-mono tabular-nums"
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
                    className="h-7 w-7 p-0 text-[#666] hover:text-[#E8E8E8] hover:bg-transparent"
                    onClick={() => setEditingId(null)}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="font-mono text-sm text-[#E8E8E8] tabular-nums">
                    ${item.price.toLocaleString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-[#666] hover:text-[#E8E8E8] hover:bg-transparent"
                    onClick={() => setEditingId(item.id)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-[#666] hover:text-[#D71921] hover:bg-transparent"
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
          <div className="space-y-3 p-3 border border-[#222] rounded-[4px] bg-black">
            <div>
              <Label className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">Description *</Label>
              <Input
                placeholder="e.g., Heated Floor System"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 bg-[#111] border-[#333] text-[#E8E8E8] placeholder:text-[#333]"
              />
            </div>
            <div>
              <Label className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">Details (optional)</Label>
              <Input
                placeholder="e.g., Warm tiles year-round"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="mt-1 bg-[#111] border-[#333] text-[#E8E8E8] placeholder:text-[#333]"
              />
            </div>
            <div>
              <Label className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666]">Price *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">$</span>
                <Input
                  type="number"
                  placeholder="1200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-7 bg-[#111] border-[#333] text-[#E8E8E8] font-mono tabular-nums placeholder:text-[#333]"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleAddCustom} disabled={saving} className="px-4 py-1.5 bg-white text-black rounded-full font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#E8E8E8] transition-colors disabled:opacity-40">
                {saving ? 'Saving...' : 'Add'}
              </button>
              <button onClick={() => setShowAddForm(false)} className="px-4 py-1.5 text-[#666] hover:text-[#E8E8E8] font-mono text-[11px] uppercase tracking-[0.08em] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Library */}
        {showLibrary && (
          <div className="space-y-2 p-3 border border-[#222] rounded-[4px] bg-black max-h-80 overflow-y-auto">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#666] mb-2">Quick Add from Library</p>
            <div className="grid grid-cols-1 gap-2">
              {COMMON_ADDITIONALS.filter(
                item => !additionals.some(a => a.description === item.description)
              ).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleAddFromLibrary(item)}
                  className="flex items-center justify-between p-2.5 rounded-[4px] border border-[#222] hover:border-[#333] hover:bg-[#111] transition-all text-left"
                >
                  <div className="flex-1">
                    <p className="text-sm text-[#E8E8E8]">{item.description}</p>
                    <p className="text-xs text-[#666]">{item.details}</p>
                  </div>
                  <span className="font-mono text-sm text-[#999] tabular-nums ml-3">
                    ${item.price.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLibrary(false)}
              className="w-full mt-2 py-1.5 text-[#666] hover:text-[#E8E8E8] font-mono text-[11px] uppercase tracking-[0.08em] transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Action buttons */}
        {!showAddForm && !showLibrary && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#333] text-[#999] rounded-full font-mono text-[11px] uppercase tracking-[0.08em] hover:text-[#E8E8E8] hover:border-[#666] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Custom
            </button>
            <button
              onClick={() => setShowLibrary(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#333] text-[#999] rounded-full font-mono text-[11px] uppercase tracking-[0.08em] hover:text-[#E8E8E8] hover:border-[#666] transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Quick Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function getAdditionalsFromEstimate(estimate: Estimate): Additional[] {
  const payload = estimate.internal_json_payload as Record<string, unknown> | null;
  return (payload?.additionals as Additional[]) || [];
}
