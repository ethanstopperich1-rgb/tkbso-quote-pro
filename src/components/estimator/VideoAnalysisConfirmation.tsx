import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Mic, Video, AlertCircle, Ruler, Check } from 'lucide-react';
import { VideoAnalysisResult } from './VideoRecordingModal';
import { cn } from '@/lib/utils';

interface DetectedVideoItem {
  category: string;
  item: string;
  quantity: number;
  unit: string;
  confidence: number;
  source: string;
  selected: boolean;
  id: string;
}

interface VideoAnalysisConfirmationProps {
  result: VideoAnalysisResult;
  onConfirm: (selectedItems: DetectedVideoItem[], scopeDescription: string, understoodScope: string[]) => void;
  onCancel: () => void;
  onReRecord: () => void;
}

// Map categories to display names
const categoryDisplayNames: Record<string, string> = {
  'Demo': 'Demolition',
  'Demolition': 'Demolition',
  'Standard Demolition': 'Demolition',
  'Heavy/Difficult Demo': 'Demolition',
  'Plumbing': 'Plumbing',
  'Plumbing Relocations': 'Plumbing',
  'Electrical': 'Electrical',
  'Smart Home / Specialty Electrical': 'Electrical',
  'Tile': 'Tile & Waterproofing',
  'Tile & Waterproofing': 'Tile & Waterproofing',
  'Waterproofing': 'Tile & Waterproofing',
  'Cabinetry': 'Cabinetry',
  'Cabinetry & Vanities': 'Cabinetry',
  'Countertops': 'Countertops',
  'Glass': 'Glass',
  'Flooring': 'Flooring',
  'Framing': 'Framing',
  'Framing/Structural': 'Framing',
  'Paint & Drywall': 'Paint & Drywall',
  'Accessories': 'Accessories',
  'Site Protection & Setup': 'Site Prep',
  'Disposal & Logistics': 'Logistics',
};

// Group items by category
function groupItemsByCategory(items: DetectedVideoItem[]): Record<string, DetectedVideoItem[]> {
  return items.reduce((acc, item) => {
    const category = categoryDisplayNames[item.category] || item.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, DetectedVideoItem[]>);
}

// Get confidence styling
function getConfidenceStyle(confidence: number) {
  if (confidence >= 0.8) {
    return { className: 'bg-green-500/20 text-green-700 border-green-500/30', label: `${Math.round(confidence * 100)}%` };
  } else if (confidence >= 0.6) {
    return { className: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30', label: `${Math.round(confidence * 100)}%` };
  } else {
    return { className: 'bg-red-500/20 text-red-700 border-red-500/30', label: `${Math.round(confidence * 100)}% ⚠️` };
  }
}

export function VideoAnalysisConfirmation({ 
  result, 
  onConfirm,
  onCancel,
  onReRecord
}: VideoAnalysisConfirmationProps) {
  // Initialize items with selection state
  const [items, setItems] = useState<DetectedVideoItem[]>(() => 
    (result.line_items || []).map((item, idx) => ({
      ...item,
      selected: true,
      id: `video-item-${idx}`,
    }))
  );
  
  const [scopeDescription, setScopeDescription] = useState('');

  // Build "understood scope" from AI analysis
  const understoodScope = result.line_items?.map(item => {
    const action = item.item.toLowerCase().includes('demo') ? 'Demo' : 
                   item.item.toLowerCase().includes('install') ? 'Install' : 'Work on';
    return `${action} ${item.item} (${item.quantity} ${item.unit})`;
  }) || [];

  const groupedItems = groupItemsByCategory(items);
  const selectedCount = items.filter(i => i.selected).length;
  const totalCount = items.length;

  // Room dimensions
  const roomDimensions = result.room_dimensions;
  const roomSqft = roomDimensions?.length_ft && roomDimensions?.width_ft 
    ? roomDimensions.length_ft * roomDimensions.width_ft 
    : null;

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleConfirm = () => {
    const selectedItems = items.filter(i => i.selected);
    onConfirm(selectedItems, scopeDescription, understoodScope);
  };

  return (
    <Card className="animate-scale-in border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent shadow-lg overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge 
            variant="secondary" 
            className="bg-purple-500/20 text-purple-700 border border-purple-500/30 gap-1"
          >
            <Video className="h-3 w-3" />
            🎥 Video Analysis
          </Badge>
          <Badge variant="outline" className="text-xs">
            {totalCount} items detected
          </Badge>
        </div>

        {/* Transcript Section */}
        {result.transcript && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="h-4 w-4 text-purple-600" />
              <h3 className="font-semibold text-sm">Transcript of Your Narration</h3>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 border border-border max-h-32 overflow-y-auto">
              <p className="text-sm text-foreground leading-relaxed italic">
                "{result.transcript}"
              </p>
            </div>
          </div>
        )}

        {/* Project Summary */}
        {result.project_summary && (
          <div className="mb-4">
            <p className="text-muted-foreground text-sm">
              {result.project_summary}
            </p>
          </div>
        )}

        {/* Room size estimate */}
        {roomSqft && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-blue-600" />
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Room Size from Video
              </p>
            </div>
            <p className="text-blue-800 dark:text-blue-200 text-sm mt-1">
              ~{roomDimensions?.length_ft}' × {roomDimensions?.width_ft}' ({roomSqft} sqft)
              {roomDimensions?.confidence && (
                <span className="text-blue-600 ml-2">
                  ({Math.round(roomDimensions.confidence * 100)}% confident)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Detected Items */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold">🔍 Items Detected in Video</h3>
            <span className="text-xs text-muted-foreground">
              {selectedCount} of {totalCount} selected
            </span>
          </div>
          
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category} className="border-l-2 border-purple-500/50 pl-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {category}
                </h4>
                <div className="space-y-2">
                  {categoryItems.map((item) => {
                    const confidenceStyle = getConfidenceStyle(item.confidence);
                    return (
                      <div 
                        key={item.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                          item.selected 
                            ? "bg-white dark:bg-background border-border" 
                            : "bg-muted/50 border-transparent opacity-60"
                        )}
                      >
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => toggleItem(item.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-medium text-sm">{item.item}</p>
                            <Badge 
                              variant="outline" 
                              className={cn('text-[10px] px-1.5 py-0', confidenceStyle.className)}
                            >
                              {confidenceStyle.label}
                            </Badge>
                          </div>
                          {item.source && (
                            <p className="text-[10px] text-muted-foreground mb-1">{item.source}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
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
        </div>

        {/* Understood Scope */}
        {understoodScope.length > 0 && (
          <div className="mb-4 p-4 bg-cyan-50 dark:bg-cyan-950/30 border-l-4 border-cyan-400 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🎯</span>
              <h3 className="font-semibold text-cyan-900 dark:text-cyan-100">
                What I Understood Your Scope To Be
              </h3>
            </div>
            <ul className="space-y-1">
              {understoodScope.slice(0, 8).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-cyan-800 dark:text-cyan-200">
                  <Check className="h-3 w-3 text-cyan-600 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
              {understoodScope.length > 8 && (
                <li className="text-xs text-cyan-600">+ {understoodScope.length - 8} more items...</li>
              )}
            </ul>
          </div>
        )}

        {/* Special Requests & Concerns */}
        {(result.special_requests?.length > 0 || result.concerns_flagged?.length > 0) && (
          <div className="mb-4 space-y-3">
            {result.special_requests?.length > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs font-semibold text-green-800 dark:text-green-200 mb-1">📋 Special Requests</p>
                <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                  {result.special_requests.map((req, idx) => (
                    <li key={idx}>• {req}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.concerns_flagged?.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-1 mb-1">
                  <AlertCircle className="h-3 w-3 text-amber-600" />
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Concerns Flagged</p>
                </div>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  {result.concerns_flagged.map((concern, idx) => (
                    <li key={idx}>• {concern}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Scope Confirmation Question */}
        <div className="border-t border-border pt-4 mb-4">
          <p className="font-bold text-base mb-2">Does this match what you want to do?</p>
          <p className="text-sm text-muted-foreground mb-3">
            Adjust the items above or tell me what I should change:
          </p>
          <Textarea
            rows={3}
            placeholder="Example: Yes that's right, but also add paint... OR: Just the vanity and shower, keeping the tub..."
            value={scopeDescription}
            onChange={(e) => setScopeDescription(e.target.value)}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            💡 Say "looks good" or leave blank to use what's selected!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button 
            onClick={handleConfirm}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
            disabled={selectedCount === 0}
          >
            Looks Good — Add to Estimate →
          </Button>
          <Button 
            variant="outline"
            onClick={onReRecord}
          >
            Record New Video
          </Button>
          <Button 
            variant="ghost"
            onClick={onCancel}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
