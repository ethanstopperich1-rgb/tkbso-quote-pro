import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Save, X, MapPin, Percent, RefreshCw } from 'lucide-react';
import { MarginStrategy, ZipMarginRule } from '@/types/margin-strategy';

interface MarginStrategyCardProps {
  contractorId: string;
}

export function MarginStrategyCard({ contractorId }: MarginStrategyCardProps) {
  const [strategy, setStrategy] = useState<MarginStrategy | null>(null);
  const [zipRules, setZipRules] = useState<ZipMarginRule[]>([]);
  const [baseMargin, setBaseMargin] = useState(42);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // New zip rule form state
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);
  const [newZipCode, setNewZipCode] = useState('');
  const [newMargin, setNewMargin] = useState(42);
  const [newNotes, setNewNotes] = useState('');
  
  // Edit mode state
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editZipCode, setEditZipCode] = useState('');
  const [editMargin, setEditMargin] = useState(42);
  const [editNotes, setEditNotes] = useState('');

  // Load strategy and rules
  useEffect(() => {
    if (contractorId) {
      loadMarginStrategy();
    }
  }, [contractorId]);

  async function loadMarginStrategy() {
    try {
      setLoading(true);
      
      // Get active strategy
      const { data: strategyData, error: strategyError } = await supabase
        .from('margin_strategies')
        .select('*')
        .eq('contractor_id', contractorId)
        .eq('is_active', true)
        .maybeSingle();

      if (strategyError) {
        throw strategyError;
      }

      if (strategyData) {
        setStrategy(strategyData as MarginStrategy);
        setBaseMargin(Number(strategyData.base_margin) * 100);

        // Get zip rules
        const { data: rulesData, error: rulesError } = await supabase
          .from('zip_margin_rules')
          .select('*')
          .eq('strategy_id', strategyData.id)
          .order('zip_code');

        if (rulesError) throw rulesError;
        setZipRules((rulesData || []) as ZipMarginRule[]);
      } else {
        // Create default strategy
        const { data: newStrategy, error: createError } = await supabase
          .from('margin_strategies')
          .insert({
            contractor_id: contractorId,
            strategy_name: 'Default Strategy',
            base_margin: 0.42,
            is_active: true
          })
          .select()
          .single();

        if (createError) throw createError;
        setStrategy(newStrategy as MarginStrategy);
        setBaseMargin(42);
      }
    } catch (error) {
      console.error('Error loading margin strategy:', error);
      toast.error('Failed to load margin strategy');
    } finally {
      setLoading(false);
    }
  }

  async function saveBaseMargin() {
    if (!strategy) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('margin_strategies')
        .update({ 
          base_margin: baseMargin / 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', strategy.id);

      if (error) throw error;
      toast.success('Base margin updated');
    } catch (error) {
      console.error('Error saving base margin:', error);
      toast.error('Failed to save base margin');
    } finally {
      setSaving(false);
    }
  }

  async function addZipRule() {
    if (!strategy) return;
    
    // Validation
    if (!/^\d{5}$/.test(newZipCode)) {
      toast.error('Zip code must be 5 digits');
      return;
    }
    
    if (newMargin < 0 || newMargin > 100) {
      toast.error('Margin must be between 0 and 100');
      return;
    }

    try {
      const { error } = await supabase
        .from('zip_margin_rules')
        .insert({
          strategy_id: strategy.id,
          zip_code: newZipCode,
          margin_override: newMargin / 100,
          notes: newNotes || null
        });

      if (error) throw error;
      
      toast.success('Zip code rule added');
      setShowNewRuleForm(false);
      setNewZipCode('');
      setNewMargin(42);
      setNewNotes('');
      loadMarginStrategy();
    } catch (error: any) {
      console.error('Error adding zip rule:', error);
      if (error.code === '23505') {
        toast.error('This zip code already has a rule');
      } else {
        toast.error('Failed to add zip code rule');
      }
    }
  }

  async function deleteZipRule(ruleId: string) {
    try {
      const { error } = await supabase
        .from('zip_margin_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
      
      toast.success('Zip code rule deleted');
      loadMarginStrategy();
    } catch (error) {
      console.error('Error deleting zip rule:', error);
      toast.error('Failed to delete zip code rule');
    }
  }

  function startEditingRule(rule: ZipMarginRule) {
    setEditingRuleId(rule.id);
    setEditZipCode(rule.zip_code);
    setEditMargin(Number(rule.margin_override) * 100);
    setEditNotes(rule.notes || '');
  }

  function cancelEditingRule() {
    setEditingRuleId(null);
    setEditZipCode('');
    setEditMargin(42);
    setEditNotes('');
  }

  async function saveEditedRule(ruleId: string) {
    // Validation
    if (!/^\d{5}$/.test(editZipCode)) {
      toast.error('Zip code must be 5 digits');
      return;
    }
    
    if (editMargin < 0 || editMargin > 100) {
      toast.error('Margin must be between 0 and 100');
      return;
    }

    try {
      const { error } = await supabase
        .from('zip_margin_rules')
        .update({
          zip_code: editZipCode,
          margin_override: editMargin / 100,
          notes: editNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', ruleId);

      if (error) throw error;
      
      toast.success('Zip code rule updated');
      cancelEditingRule();
      loadMarginStrategy();
    } catch (error: any) {
      console.error('Error updating zip rule:', error);
      if (error.code === '23505') {
        toast.error('This zip code already has a rule');
      } else {
        toast.error('Failed to update zip code rule');
      }
    }
  }

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900">Margin Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Percent className="h-5 w-5 text-cyan-500" />
          Margin Strategy
        </CardTitle>
        <p className="text-sm text-slate-500">Automatically adjust profit margins based on customer zip code</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Base Margin */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <Label className="text-sm font-medium text-slate-700">Default Margin (%)</Label>
          <div className="flex items-center gap-3 mt-2">
            <Input
              type="number"
              value={baseMargin}
              onChange={(e) => setBaseMargin(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="1"
              className="max-w-[120px]"
            />
            <Button 
              onClick={saveBaseMargin} 
              disabled={saving}
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Applied when no zip code override exists</p>
        </div>

        {/* Zip Code Overrides */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              Zip Code Overrides
            </Label>
            {!showNewRuleForm && (
              <Button
                onClick={() => setShowNewRuleForm(true)}
                size="sm"
                variant="outline"
                className="text-cyan-600 border-cyan-300 hover:bg-cyan-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Override
              </Button>
            )}
          </div>

          {/* New Rule Form */}
          {showNewRuleForm && (
            <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-slate-600">Zip Code</Label>
                  <Input
                    placeholder="32789"
                    value={newZipCode}
                    maxLength={5}
                    onChange={(e) => setNewZipCode(e.target.value.replace(/\D/g, ''))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-600">Margin (%)</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={newMargin}
                    min="0"
                    max="100"
                    onChange={(e) => setNewMargin(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Notes (optional)</Label>
                <Input
                  placeholder="e.g., Wealthy area, higher prices"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addZipRule} size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setShowNewRuleForm(false);
                    setNewZipCode('');
                    setNewMargin(42);
                    setNewNotes('');
                  }}
                  size="sm"
                  variant="ghost"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Existing Rules */}
          {zipRules.length === 0 && !showNewRuleForm && (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No zip code overrides yet</p>
              <p className="text-xs">Add one to customize margins by location</p>
            </div>
          )}

          {zipRules.length > 0 && (
            <div className="space-y-2">
              {zipRules.map((rule) => (
                <div key={rule.id} className="bg-white rounded-lg border border-slate-200 p-3">
                  {editingRuleId === rule.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-slate-600">Zip Code</Label>
                          <Input
                            value={editZipCode}
                            maxLength={5}
                            onChange={(e) => setEditZipCode(e.target.value.replace(/\D/g, ''))}
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-slate-600">Margin (%)</Label>
                          <Input
                            type="number"
                            value={editMargin}
                            min="0"
                            max="100"
                            onChange={(e) => setEditMargin(parseFloat(e.target.value) || 0)}
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600">Notes</Label>
                        <Input
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="mt-1 h-8 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => saveEditedRule(rule.id)}
                          size="sm"
                          className="bg-cyan-500 hover:bg-cyan-600 text-white h-7 text-xs"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button onClick={cancelEditingRule} size="sm" variant="ghost" className="h-7 text-xs">
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-slate-900">{rule.zip_code}</span>
                          <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-xs font-semibold">
                            {(Number(rule.margin_override) * 100).toFixed(0)}%
                          </span>
                        </div>
                        {rule.notes && (
                          <p className="text-xs text-slate-500">{rule.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={() => startEditingRule(rule)}
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-slate-600 hover:text-cyan-600"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm(`Delete override for ${rule.zip_code}?`)) {
                              deleteZipRule(rule.id);
                            }
                          }}
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-slate-600 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
