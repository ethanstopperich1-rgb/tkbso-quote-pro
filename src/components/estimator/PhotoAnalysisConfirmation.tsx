import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, AlertCircle, X, Plus, Camera, Ruler } from 'lucide-react';
import { PhotoAnalysis, DetectedItem } from './PhotoUploadButton';
import { PhotoAnalysisEntry } from './MultiPhotoAnalysisCard';
import { cn } from '@/lib/utils';

interface SelectedItem extends DetectedItem {
  entryId: string;
  itemIndex: number;
  selected: boolean;
  analysisConfidence: 'high' | 'medium' | 'low';
}

interface PhotoAnalysisConfirmationProps {
  entries: PhotoAnalysisEntry[];
  onRemovePhoto: (id: string) => void;
  onAddMore: () => void;
  onConfirm: (selectedItems: SelectedItem[], scopeDescription: string) => void;
  onCancel: () => void;
  isAnalyzing?: boolean;
}

// Map vision categories to trade bucket display names
const categoryDisplayNames: Record<string, string> = {
  'Demo': 'Demolition',
  'Demolition': 'Demolition',
  'Plumbing': 'Plumbing',
  'Electrical': 'Electrical',
  'Tile': 'Tile & Waterproofing',
  'Tile & Waterproofing': 'Tile & Waterproofing',
  'Support': 'Tile & Waterproofing',
  'Waterproofing': 'Tile & Waterproofing',
  'Cabinetry': 'Cabinetry',
  'Countertops': 'Countertops',
  'Glass': 'Glass',
  'Flooring': 'Flooring',
  'Framing': 'Framing',
  'Framing/Structural': 'Framing',
  'Accessories': 'Accessories',
};

// Group items by category
function groupItemsByCategory(items: SelectedItem[]): Record<string, SelectedItem[]> {
  return items.reduce((acc, item) => {
    const category = categoryDisplayNames[item.category] || item.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, SelectedItem[]>);
}

// Determine overall project type
function getOverallProjectType(entries: PhotoAnalysisEntry[]): string {
  const types = entries.map(e => e.analysis.project_type).filter(t => t !== 'Unknown');
  if (types.length === 0) return 'Unknown';
  const counts: Record<string, number> = {};
  types.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

// Get confidence badge styling
function getConfidenceBadge(confidence: 'high' | 'medium' | 'low') {
  if (confidence === 'high') {
    return { className: 'bg-green-500/20 text-green-700 border-green-500/30', label: 'high' };
  } else if (confidence === 'medium') {
    return { className: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30', label: 'medium' };
  } else {
    return { className: 'bg-red-500/20 text-red-700 border-red-500/30', label: 'low ⚠️' };
  }
}

export function PhotoAnalysisConfirmation({ 
  entries, 
  onRemovePhoto, 
  onAddMore,
  onConfirm,
  onCancel,
  isAnalyzing 
}: PhotoAnalysisConfirmationProps) {
  // Initialize items with selection state
  const [items, setItems] = useState<SelectedItem[]>(() => {
    return entries.flatMap(entry => 
      entry.analysis.detected_items.map((item, idx) => ({
        ...item,
        entryId: entry.id,
        itemIndex: idx,
        selected: true, // Default to selected
        analysisConfidence: entry.analysis.confidence,
      }))
    );
  });
  
  const [scopeDescription, setScopeDescription] = useState('');

  const groupedItems = groupItemsByCategory(items);
  const projectType = getOverallProjectType(entries);
  const selectedCount = items.filter(i => i.selected).length;
  const totalCount = items.length;

  // Get estimated room size from first entry with dimensions
  const estimatedDimensions = entries.find(e => e.analysis.estimated_dimensions)?.analysis.estimated_dimensions;
  const roomSqft = estimatedDimensions?.room_length_ft && estimatedDimensions?.room_width_ft 
    ? estimatedDimensions.room_length_ft * estimatedDimensions.room_width_ft 
    : null;

  const toggleItem = (entryId: string, itemIndex: number) => {
    setItems(prev => prev.map(item => 
      item.entryId === entryId && item.itemIndex === itemIndex
        ? { ...item, selected: !item.selected }
        : item
    ));
  };

  const updateQuantity = (entryId: string, itemIndex: number, newQuantity: number) => {
    setItems(prev => prev.map(item => 
      item.entryId === entryId && item.itemIndex === itemIndex
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const handleConfirm = () => {
    const selectedItems = items.filter(i => i.selected);
    onConfirm(selectedItems, scopeDescription);
  };

  return (
    <Card className="animate-scale-in border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-transparent shadow-lg overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge 
            variant="secondary" 
            className="bg-cyan-500/20 text-cyan-700 border border-cyan-500/30 gap-1"
          >
            <Sparkles className="h-3 w-3" />
            🔍 What I Detected
          </Badge>
          <Badge variant="outline" className="text-xs">
            {entries.length} {entries.length === 1 ? 'photo' : 'photos'}
          </Badge>
        </div>

        {/* Photo thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4">
          {entries.map((entry, idx) => (
            <div key={entry.id} className="relative flex-shrink-0 group">
              {entry.imagePreview ? (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-border">
                  <img 
                    src={entry.imagePreview} 
                    alt={`Photo ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-border bg-muted flex items-center justify-center">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => onRemovePhoto(entry.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5 rounded-b-lg">
                {entry.analysis.detected_items.length} items
              </div>
            </div>
          ))}
          
          {/* Add more button */}
          <button
            onClick={onAddMore}
            disabled={isAnalyzing}
            className={cn(
              "w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 border-dashed border-cyan-500/50 flex flex-col items-center justify-center gap-1 flex-shrink-0 transition-colors",
              isAnalyzing 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:border-cyan-500 hover:bg-cyan-500/10 cursor-pointer"
            )}
          >
            {isAnalyzing ? (
              <Camera className="h-4 w-4 text-cyan-500 animate-pulse" />
            ) : (
              <>
                <Plus className="h-4 w-4 text-cyan-500" />
                <span className="text-[10px] text-cyan-600">Add</span>
              </>
            )}
          </button>
        </div>

        {/* Project type and summary */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg">
            {projectType} Project
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedCount} of {totalCount} items selected
          </p>
        </div>

        {/* Room size estimate */}
        {roomSqft && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-blue-600" />
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Estimated Room Size
              </p>
            </div>
            <p className="text-blue-800 dark:text-blue-200 text-sm mt-1">
              ~{estimatedDimensions?.room_length_ft}' × {estimatedDimensions?.room_width_ft}' ({roomSqft} sqft)
            </p>
          </div>
        )}

        {/* Detected items with checkboxes */}
        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="border-l-2 border-cyan-500/50 pl-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {category}
              </h4>
              <div className="space-y-2">
                {categoryItems.map((item) => {
                  const confidenceBadge = getConfidenceBadge(item.analysisConfidence);
                  return (
                    <div 
                      key={`${item.entryId}-${item.itemIndex}`} 
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                        item.selected 
                          ? "bg-white dark:bg-background border-border" 
                          : "bg-muted/50 border-transparent opacity-60"
                      )}
                    >
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={() => toggleItem(item.entryId, item.itemIndex)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-medium text-sm">{item.item}</p>
                          <Badge 
                            variant="outline" 
                            className={cn('text-[10px] px-1.5 py-0', confidenceBadge.className)}
                          >
                            {confidenceBadge.label}
                          </Badge>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mb-2">{item.notes}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.entryId, item.itemIndex, parseInt(e.target.value) || 0)}
                            className="w-16 h-7 text-xs text-center px-1"
                            min={0}
                            disabled={!item.selected}
                          />
                          <span className="text-muted-foreground text-xs">{item.unit}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Observations */}
        {entries.some(e => e.analysis.observations) && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            {entries.filter(e => e.analysis.observations).map((entry, idx) => (
              <div key={entry.id} className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {entries.length > 1 && <span className="font-medium">Photo {idx + 1}:</span>} {entry.analysis.observations}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Critical: Scope description question */}
        <div className="border-t border-border pt-4 mb-4">
          <p className="font-bold text-base mb-2">Now tell me — what's the actual scope?</p>
          <p className="text-sm text-muted-foreground mb-3">
            I detected items in your photo, but tell me what you're actually doing with this space.
          </p>
          <Textarea
            rows={3}
            placeholder="Example: Full bathroom remodel, or just replacing vanity and painting walls, or keeping the tub and just updating the shower..."
            value={scopeDescription}
            onChange={(e) => setScopeDescription(e.target.value)}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            💡 Or just say "looks good" and I'll use what's selected above!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleConfirm}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
            disabled={selectedCount === 0}
          >
            Use Selected Items →
          </Button>
          <Button 
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
