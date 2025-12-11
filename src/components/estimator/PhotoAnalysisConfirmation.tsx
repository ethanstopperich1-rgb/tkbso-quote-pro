import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Camera, X, Plus, Send, CheckCircle2 } from 'lucide-react';
import { PhotoAnalysis, DetectedItem } from './PhotoUploadButton';
import { PhotoAnalysisEntry } from './MultiPhotoAnalysisCard';
import { cn } from '@/lib/utils';

export interface SelectedItem extends DetectedItem {
  entryId: string;
  itemIndex: number;
  selected: boolean;
  analysisConfidence: 'high' | 'medium' | 'low';
}

export interface LayoutChangeData {
  fixtures: Array<{
    id: string;
    name: string;
    currentLocation: string;
    newLocation: string;
    isMoving: boolean;
    estimatedDistance: number;
  }>;
  structuralChanges: Array<{
    id: string;
    description: string;
    selected: boolean;
    type: 'remove_wall' | 'remove_door' | 'add_wall' | 'add_door' | 'close_opening' | 'other';
  }>;
  demoLevel: 'full_gut' | 'selective';
  additionalNotes: string;
}

interface PhotoAnalysisConfirmationProps {
  entries: PhotoAnalysisEntry[];
  onRemovePhoto: (id: string) => void;
  onAddMore: () => void;
  onConfirm: (selectedItems: SelectedItem[], scopeDescription: string, layoutChanges?: LayoutChangeData) => void;
  onCancel: () => void;
  isAnalyzing?: boolean;
}

// Determine overall project type
function getOverallProjectType(entries: PhotoAnalysisEntry[]): string {
  const types = entries.map(e => e.analysis.project_type).filter(t => t !== 'Unknown');
  if (types.length === 0) return 'space';
  const counts: Record<string, number> = {};
  types.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0].toLowerCase();
}

// Build a natural summary of detected items
function buildDetectedSummary(entries: PhotoAnalysisEntry[]): string {
  const allItems: string[] = [];
  const dimensions = entries.find(e => e.analysis.estimated_dimensions)?.analysis.estimated_dimensions;
  
  for (const entry of entries) {
    for (const item of entry.analysis.detected_items) {
      // Make items sound more natural
      let itemText = item.item;
      if (item.quantity && item.quantity > 1) {
        itemText = `${item.quantity}x ${item.item}`;
      }
      if (item.notes && !itemText.includes(item.notes)) {
        itemText += ` (${item.notes})`;
      }
      allItems.push(itemText);
    }
  }

  // Build natural language list
  if (allItems.length === 0) return "I couldn't detect specific items in the photo.";
  
  let summary = "";
  
  // Group similar items
  const uniqueItems = [...new Set(allItems)];
  
  if (uniqueItems.length <= 3) {
    summary = uniqueItems.join(', ');
  } else {
    const firstItems = uniqueItems.slice(0, -1).join(', ');
    summary = `${firstItems}, and ${uniqueItems[uniqueItems.length - 1]}`;
  }

  return summary;
}

export function PhotoAnalysisConfirmation({ 
  entries, 
  onRemovePhoto, 
  onAddMore,
  onConfirm,
  onCancel,
  isAnalyzing 
}: PhotoAnalysisConfirmationProps) {
  const [scopeDescription, setScopeDescription] = useState('');
  const [conversationStage, setConversationStage] = useState<'ask' | 'confirm'>('ask');

  const projectType = getOverallProjectType(entries);
  const detectedSummary = useMemo(() => buildDetectedSummary(entries), [entries]);
  
  // Get estimated room size from first entry with dimensions
  const estimatedDimensions = entries.find(e => e.analysis.estimated_dimensions)?.analysis.estimated_dimensions;
  const roomSqft = estimatedDimensions?.room_length_ft && estimatedDimensions?.room_width_ft 
    ? Math.round(estimatedDimensions.room_length_ft * estimatedDimensions.room_width_ft)
    : null;

  // Create selected items for confirmation
  const selectedItems = useMemo<SelectedItem[]>(() => {
    return entries.flatMap(entry => 
      entry.analysis.detected_items.map((item, idx) => ({
        ...item,
        entryId: entry.id,
        itemIndex: idx,
        selected: true,
        analysisConfidence: entry.analysis.confidence,
      }))
    );
  }, [entries]);

  const handleSendScope = () => {
    if (scopeDescription.trim()) {
      setConversationStage('confirm');
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedItems, scopeDescription);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (conversationStage === 'ask' && scopeDescription.trim()) {
        handleSendScope();
      } else if (conversationStage === 'confirm') {
        handleConfirm();
      }
    }
  };

  return (
    <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-transparent shadow-lg overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {/* Photo thumbnails - compact */}
        <div className="flex items-center gap-2 mb-4">
          {entries.map((entry, idx) => (
            <div key={entry.id} className="relative flex-shrink-0 group">
              {entry.imagePreview ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-border">
                  <img 
                    src={entry.imagePreview} 
                    alt={`Photo ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg border border-border bg-muted flex items-center justify-center">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => onRemovePhoto(entry.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          {/* Add more button */}
          <button
            onClick={onAddMore}
            disabled={isAnalyzing}
            className={cn(
              "w-12 h-12 rounded-lg border-2 border-dashed border-cyan-500/50 flex flex-col items-center justify-center gap-0.5 flex-shrink-0 transition-colors",
              isAnalyzing 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:border-cyan-500 hover:bg-cyan-500/10 cursor-pointer"
            )}
          >
            <Plus className="h-4 w-4 text-cyan-500" />
          </button>
          
          <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-700 border border-cyan-500/30 gap-1 ml-auto">
            <Sparkles className="h-3 w-3" />
            AI Analysis
          </Badge>
        </div>

        {/* Conversational AI Message */}
        <div className="space-y-4">
          {/* AI's opening message */}
          <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-4">
            <p className="text-sm leading-relaxed">
              I analyzed your {projectType} photo{entries.length > 1 ? 's' : ''} and spotted some items. 
              <span className="font-medium text-foreground"> What are you looking to do with this space?</span>
            </p>
            
            {/* Show detected items naturally */}
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Here's what I see:</p>
              <p className="text-sm text-foreground/80">{detectedSummary}</p>
              
              {roomSqft && (
                <p className="text-xs text-muted-foreground mt-2">
                  Estimated size: ~{estimatedDimensions?.room_length_ft}' × {estimatedDimensions?.room_width_ft}' ({roomSqft} sqft)
                </p>
              )}
            </div>
          </div>

          {/* User's response (if in confirm stage) */}
          {conversationStage === 'confirm' && scopeDescription && (
            <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-4 ml-8">
              <p className="text-sm">{scopeDescription}</p>
            </div>
          )}

          {/* AI confirmation message */}
          {conversationStage === 'confirm' && (
            <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm leading-relaxed">
                    Got it! I'll use your description to generate the estimate. 
                    <span className="font-medium"> Ready to continue?</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="mt-4">
          {conversationStage === 'ask' ? (
            <div className="relative">
              <Textarea
                value={scopeDescription}
                onChange={(e) => setScopeDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell me what you're planning... (e.g., 'Full remodel - new vanity, tile the shower, replace toilet')"
                className="min-h-[80px] pr-12 resize-none rounded-xl"
                autoFocus
              />
              <Button
                size="icon"
                className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                onClick={handleSendScope}
                disabled={!scopeDescription.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setConversationStage('ask')}
                className="flex-1"
              >
                Edit Response
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              >
                Generate Estimate →
              </Button>
            </div>
          )}
        </div>

        {/* Cancel link */}
        <button
          onClick={onCancel}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
        >
          Cancel and start over
        </button>
      </CardContent>
    </Card>
  );
}
