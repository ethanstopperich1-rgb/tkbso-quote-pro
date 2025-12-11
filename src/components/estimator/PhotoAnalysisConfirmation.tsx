import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Camera, X, Plus, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { PhotoAnalysis, DetectedItem } from './PhotoUploadButton';
import { PhotoAnalysisEntry } from './MultiPhotoAnalysisCard';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

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

interface ConversationMessage {
  role: 'assistant' | 'user';
  content: string;
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
  
  for (const entry of entries) {
    for (const item of entry.analysis.detected_items) {
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

  if (allItems.length === 0) return "I couldn't detect specific items in the photo.";
  
  const uniqueItems = [...new Set(allItems)];
  
  if (uniqueItems.length <= 3) {
    return uniqueItems.join(', ');
  } else {
    const firstItems = uniqueItems.slice(0, -1).join(', ');
    return `${firstItems}, and ${uniqueItems[uniqueItems.length - 1]}`;
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
  const [inputValue, setInputValue] = useState('');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isReadyToGenerate, setIsReadyToGenerate] = useState(false);

  const projectType = getOverallProjectType(entries);
  const detectedSummary = useMemo(() => buildDetectedSummary(entries), [entries]);
  
  const estimatedDimensions = entries.find(e => e.analysis.estimated_dimensions)?.analysis.estimated_dimensions;
  const roomSqft = estimatedDimensions?.room_length_ft && estimatedDimensions?.room_width_ft 
    ? Math.round(estimatedDimensions.room_length_ft * estimatedDimensions.room_width_ft)
    : null;

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

  // Get full scope description from conversation
  const getFullScopeDescription = () => {
    return conversation
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('. ');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isThinking) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsThinking(true);

    try {
      // Build context for AI to determine if response is clear enough
      const detectedItems = entries.flatMap(e => e.analysis.detected_items.map(i => i.item)).join(', ');
      const previousResponses = conversation.filter(m => m.role === 'user').map(m => m.content).join('. ');
      
      const { data, error } = await supabase.functions.invoke('analyze-photo', {
        body: {
          mode: 'clarify_scope',
          projectType,
          detectedItems,
          userResponse: userMessage,
          previousResponses,
          roomSize: roomSqft ? `${estimatedDimensions?.room_length_ft}x${estimatedDimensions?.room_width_ft}` : null,
        }
      });

      if (error) throw error;

      const response = data as { needsMoreInfo: boolean; followUpQuestion?: string; summary?: string };
      
      if (response.needsMoreInfo && response.followUpQuestion) {
        setConversation(prev => [...prev, { role: 'assistant', content: response.followUpQuestion }]);
        setIsReadyToGenerate(false);
      } else {
        // Response is clear enough
        const confirmMessage = response.summary 
          ? `Got it! ${response.summary} Ready to generate your estimate.`
          : "Perfect, I have everything I need. Ready to generate your estimate.";
        setConversation(prev => [...prev, { role: 'assistant', content: confirmMessage }]);
        setIsReadyToGenerate(true);
      }
    } catch (err) {
      console.error('Error getting follow-up:', err);
      // Fallback: just proceed if AI call fails
      setConversation(prev => [...prev, { 
        role: 'assistant', 
        content: "Got it! Ready to generate your estimate." 
      }]);
      setIsReadyToGenerate(true);
    } finally {
      setIsThinking(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedItems, getFullScopeDescription());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isReadyToGenerate) {
        handleConfirm();
      } else if (inputValue.trim()) {
        handleSendMessage();
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

        {/* Conversation */}
        <div className="space-y-3 max-h-[350px] overflow-y-auto">
          {/* AI's opening message */}
          <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-4">
            <p className="text-sm leading-relaxed">
              I analyzed your {projectType} photo{entries.length > 1 ? 's' : ''} and spotted some items. 
              <span className="font-medium text-foreground"> What are you looking to do with this space?</span>
            </p>
            
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

          {/* Conversation history */}
          {conversation.map((msg, idx) => (
            <div 
              key={idx}
              className={cn(
                "rounded-2xl p-4",
                msg.role === 'user' 
                  ? "bg-primary text-primary-foreground ml-8 rounded-tr-sm"
                  : "bg-muted/50 rounded-tl-sm"
              )}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="mt-4">
          {isReadyToGenerate ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReadyToGenerate(false);
                  setInputValue('');
                }}
                className="flex-1"
              >
                Add More Details
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              >
                Generate Estimate →
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={conversation.length === 0 
                  ? "Tell me what you're planning... (e.g., 'Full remodel - new vanity, tile the shower')"
                  : "Type your response..."
                }
                className="min-h-[80px] pr-12 resize-none rounded-xl"
                autoFocus
                disabled={isThinking}
              />
              <Button
                size="icon"
                className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isThinking}
              >
                {isThinking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
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
