import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles, CheckCircle2, AlertCircle, X, Plus, Camera } from 'lucide-react';
import { PhotoAnalysis, DetectedItem } from './PhotoUploadButton';
import { cn } from '@/lib/utils';

export interface PhotoAnalysisEntry {
  id: string;
  analysis: PhotoAnalysis;
  imagePreview: string;
  label?: string;
}

interface MultiPhotoAnalysisCardProps {
  entries: PhotoAnalysisEntry[];
  onRemovePhoto: (id: string) => void;
  onAddMore: () => void;
  onUpdateItem?: (entryId: string, itemIndex: number, newQuantity: number) => void;
  isAnalyzing?: boolean;
}

// Map vision categories to trade bucket display names (consolidate related categories)
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

// Extended item with source tracking for editing
interface TrackedItem extends DetectedItem {
  entryId: string;
  itemIndex: number;
}

// Group items by category across all photos, keeping source info
function mergeAndGroupItems(entries: PhotoAnalysisEntry[]): Record<string, TrackedItem[]> {
  const allItems: TrackedItem[] = entries.flatMap(e => 
    e.analysis.detected_items.map((item, idx) => ({
      ...item,
      entryId: e.id,
      itemIndex: idx,
    }))
  );
  return allItems.reduce((acc, item) => {
    const category = categoryDisplayNames[item.category] || item.category;
    if (!acc[category]) acc[category] = [];
    // Avoid exact duplicates by item name only (allow different quantities)
    const isDuplicate = acc[category].some(
      existing => existing.item === item.item && existing.entryId === item.entryId && existing.itemIndex === item.itemIndex
    );
    if (!isDuplicate) {
      acc[category].push(item);
    }
    return acc;
  }, {} as Record<string, TrackedItem[]>);
}

// Determine overall project type from all analyses
function getOverallProjectType(entries: PhotoAnalysisEntry[]): string {
  const types = entries.map(e => e.analysis.project_type).filter(t => t !== 'Unknown');
  if (types.length === 0) return 'Unknown';
  // Return most common type
  const counts: Record<string, number> = {};
  types.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export function MultiPhotoAnalysisCard({ 
  entries, 
  onRemovePhoto, 
  onAddMore,
  onUpdateItem,
  isAnalyzing 
}: MultiPhotoAnalysisCardProps) {
  const groupedItems = mergeAndGroupItems(entries);
  const categoryCount = Object.keys(groupedItems).length;
  const totalItemCount = Object.values(groupedItems).flat().length;
  const projectType = getOverallProjectType(entries);

  return (
    <Card className="animate-scale-in border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-transparent shadow-lg overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        {/* Header with photo thumbnails */}
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <Badge 
              variant="secondary" 
              className="bg-cyan-500/20 text-cyan-700 border border-cyan-500/30 gap-1"
            >
              <Sparkles className="h-3 w-3" />
              AI-Detected Items
            </Badge>
            <Badge variant="outline" className="text-xs">
              {entries.length} {entries.length === 1 ? 'photo' : 'photos'}
            </Badge>
          </div>
          
          {/* Photo thumbnails row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {entries.map((entry, idx) => (
              <div 
                key={entry.id} 
                className="relative flex-shrink-0 group"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-border">
                  <img 
                    src={entry.imagePreview} 
                    alt={`Photo ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
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
          
          {/* Summary */}
          <div className="mt-2">
            <h3 className="font-semibold text-base sm:text-lg">
              {projectType} Project
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {totalItemCount} total items across {categoryCount} trades
            </p>
          </div>
        </div>

        {/* Merged Detected Items by Category */}
        <div className="space-y-3">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="border-l-2 border-cyan-500/50 pl-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                {category}
              </h4>
              <div className="space-y-2">
                {items.map((item) => (
                  <div 
                    key={`${item.entryId}-${item.itemIndex}`} 
                    className="flex items-center gap-2 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                    <span className="flex-1 text-foreground">{item.item}</span>
                    {item.quantity >= 0 && (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 0;
                            onUpdateItem?.(item.entryId, item.itemIndex, newQty);
                          }}
                          className="w-16 h-7 text-xs text-center px-1"
                          min={0}
                        />
                        <span className="text-muted-foreground text-xs w-8">{item.unit}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Observations from all photos */}
        {entries.some(e => e.analysis.observations) && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
            {entries.filter(e => e.analysis.observations).map((entry, idx) => (
              <div key={entry.id} className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-medium">Photo {idx + 1}:</span> {entry.analysis.observations}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Action hint */}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Upload more photos or confirm detected items to generate your quote
        </p>
      </CardContent>
    </Card>
  );
}

// Helper to merge analyses for passing to estimator
export function mergePhotoAnalyses(entries: PhotoAnalysisEntry[]): PhotoAnalysis {
  const allItems = entries.flatMap(e => e.analysis.detected_items);
  const projectType = getOverallProjectType(entries);
  
  // Merge dimensions, taking the first non-null values
  const mergedDimensions = entries.reduce((acc, entry) => {
    const dims = entry.analysis.estimated_dimensions;
    if (!dims) return acc;
    return {
      room_length_ft: acc.room_length_ft ?? dims.room_length_ft,
      room_width_ft: acc.room_width_ft ?? dims.room_width_ft,
      ceiling_height_ft: acc.ceiling_height_ft ?? dims.ceiling_height_ft,
      shower_length_ft: acc.shower_length_ft ?? dims.shower_length_ft,
      shower_width_ft: acc.shower_width_ft ?? dims.shower_width_ft,
    };
  }, {} as PhotoAnalysis['estimated_dimensions']);

  // Combine observations
  const observations = entries
    .map((e, i) => e.analysis.observations ? `Photo ${i + 1}: ${e.analysis.observations}` : null)
    .filter(Boolean)
    .join(' | ');

  return {
    project_type: projectType as 'Kitchen' | 'Bathroom' | 'Unknown',
    confidence: 'medium',
    detected_items: allItems,
    estimated_dimensions: mergedDimensions,
    observations: observations || undefined,
  };
}
