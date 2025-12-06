import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { PhotoAnalysis, DetectedItem } from './PhotoUploadButton';
import { cn } from '@/lib/utils';

interface PhotoAnalysisCardProps {
  analysis: PhotoAnalysis;
  imagePreview?: string;
}

// Map vision categories to trade bucket display names
const categoryDisplayNames: Record<string, string> = {
  'Demo': 'Demolition',
  'Demolition': 'Demolition',
  'Plumbing': 'Plumbing',
  'Electrical': 'Electrical',
  'Tile': 'Tile',
  'Cabinetry': 'Cabinetry',
  'Countertops': 'Countertops',
  'Glass': 'Glass',
  'Flooring': 'Flooring',
  'Framing': 'Framing',
};

// Group items by category
function groupItemsByCategory(items: DetectedItem[]): Record<string, DetectedItem[]> {
  return items.reduce((acc, item) => {
    const category = categoryDisplayNames[item.category] || item.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, DetectedItem[]>);
}

export function PhotoAnalysisCard({ analysis, imagePreview }: PhotoAnalysisCardProps) {
  const groupedItems = groupItemsByCategory(analysis.detected_items);
  const categoryCount = Object.keys(groupedItems).length;
  const itemCount = analysis.detected_items.length;

  const confidenceColors = {
    high: 'bg-green-500/20 text-green-700 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
    low: 'bg-red-500/20 text-red-700 border-red-500/30',
  };

  return (
    <Card className="animate-scale-in border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-transparent shadow-lg overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {imagePreview && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 border border-border">
              <img 
                src={imagePreview} 
                alt="Analyzed photo" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="secondary" 
                className="bg-cyan-500/20 text-cyan-700 border border-cyan-500/30 gap-1"
              >
                <Sparkles className="h-3 w-3" />
                AI-Detected Items
              </Badge>
              <Badge 
                variant="outline" 
                className={cn('text-xs', confidenceColors[analysis.confidence])}
              >
                {analysis.confidence} confidence
              </Badge>
            </div>
            <h3 className="font-semibold text-base sm:text-lg mt-2">
              {analysis.project_type} Project Detected
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {itemCount} items across {categoryCount} trades
            </p>
          </div>
        </div>

        {/* Detected Items by Category */}
        <div className="space-y-3">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="border-l-2 border-cyan-500/50 pl-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                {category}
              </h4>
              <div className="space-y-1">
                {items.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-foreground">{item.item}</span>
                      {item.quantity > 0 && (
                        <span className="text-muted-foreground ml-1">
                          ({item.quantity} {item.unit})
                        </span>
                      )}
                      {item.notes && (
                        <span className="text-muted-foreground text-xs block">
                          {item.notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Observations */}
        {analysis.observations && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                {analysis.observations}
              </p>
            </div>
          </div>
        )}

        {/* Dimensions if detected */}
        {analysis.estimated_dimensions && (
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.estimated_dimensions.room_length_ft && analysis.estimated_dimensions.room_width_ft && (
              <Badge variant="outline" className="text-xs">
                Room: {analysis.estimated_dimensions.room_length_ft}' × {analysis.estimated_dimensions.room_width_ft}'
              </Badge>
            )}
            {analysis.estimated_dimensions.shower_length_ft && analysis.estimated_dimensions.shower_width_ft && (
              <Badge variant="outline" className="text-xs">
                Shower: {analysis.estimated_dimensions.shower_length_ft}' × {analysis.estimated_dimensions.shower_width_ft}'
              </Badge>
            )}
            {analysis.estimated_dimensions.ceiling_height_ft && (
              <Badge variant="outline" className="text-xs">
                Ceiling: {analysis.estimated_dimensions.ceiling_height_ft}'
              </Badge>
            )}
          </div>
        )}

        {/* Action hint */}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Review detected items above, then confirm or add details to generate your quote
        </p>
      </CardContent>
    </Card>
  );
}
