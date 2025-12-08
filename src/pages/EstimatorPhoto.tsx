import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Plus, Check, Loader2, Eye, Trash2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface DetectedItem {
  category: string;
  item: string;
  quantity: number;
  unit: string;
  confidence: number;
  photoIndex: number;
  notes?: string;
}

interface UploadedPhoto {
  id: string;
  url: string;
  analyzing: boolean;
  analyzed: boolean;
}

const confidenceColors = {
  high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-red-100 text-red-700 border-red-200',
};

export default function EstimatorPhoto() {
  const { contractor } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !contractor?.id) return;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    for (const file of imageFiles) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }
      await processPhoto(file);
    }
  };

  const processPhoto = async (file: File) => {
    const photoId = Date.now().toString();
    
    // Create preview URL
    const reader = new FileReader();
    const urlPromise = new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
    });
    reader.readAsDataURL(file);
    const previewUrl = await urlPromise;

    // Add photo to state (analyzing)
    setPhotos(prev => [...prev, { id: photoId, url: previewUrl, analyzing: true, analyzed: false }]);

    try {
      // Get base64 for API
      const base64 = previewUrl.split(',')[1];

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          image_base64: base64,
          mime_type: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze photo');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Update photo status
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, analyzing: false, analyzed: true } : p
      ));

      // Add detected items
      const photoIndex = photos.length + 1;
      const newItems: DetectedItem[] = data.analysis.detected_items.map((item: any) => ({
        category: item.category,
        item: item.item,
        quantity: item.quantity,
        unit: item.unit,
        confidence: item.confidence || 0.8,
        photoIndex,
        notes: item.notes,
      }));
      
      setDetectedItems(prev => [...prev, ...newItems]);
      toast.success(`Detected ${newItems.length} items`);

    } catch (error) {
      console.error('Photo analysis error:', error);
      toast.error('Failed to analyze photo');
      
      // Remove failed photo
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemovePhoto = (id: string, index: number) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    setDetectedItems(prev => prev.filter(item => item.photoIndex !== index + 1));
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setDetectedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const handleContinue = () => {
    if (detectedItems.length === 0) {
      toast.error('Upload and analyze at least one photo');
      return;
    }
    
    // Store detected items in session/state and navigate to review
    sessionStorage.setItem('photoDetectedItems', JSON.stringify(detectedItems));
    toast.success('Proceeding to review...');
    // TODO: Navigate to estimate builder with detected items
  };

  const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  const hasPhotos = photos.length > 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/estimator/new')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Photo-to-Quote</h1>
            <p className="text-sm text-muted-foreground">
              Upload photos of the space for AI analysis
            </p>
          </div>
        </div>

        {!hasPhotos ? (
          /* Initial Upload State */
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="text-6xl mb-6">📸</div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Upload Photos of the Space
              </h2>
              <p className="text-muted-foreground mb-8">
                Our AI will identify fixtures, materials, and dimensions to build your estimate
              </p>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-semibold text-foreground mb-2">
                  Drop photos here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports JPG, PNG (max 10MB each)
                </p>
              </div>

              {/* Pro Tip */}
              <div className="mt-8 p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg text-left">
                <p className="text-sm text-sky-900 dark:text-sky-100">
                  <strong>📐 Pro Tip:</strong> Place a standard sheet of paper (8.5×11") in the photo for scale accuracy. AI will use this as a visual anchor to calculate dimensions.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* After Upload State */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Photo Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">
                  Uploaded Photos ({photos.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add More
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {photos.map((photo, idx) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {photo.analyzing && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                          <p className="text-sm text-foreground">Analyzing...</p>
                        </div>
                      </div>
                    )}
                    {photo.analyzed && (
                      <Badge className="absolute top-2 right-2 bg-emerald-500 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        Done
                      </Badge>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute bottom-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemovePhoto(photo.id, idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Detected Items */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                AI Detected Items ({detectedItems.length})
              </h3>
              
              <ScrollArea className="h-[500px]">
                <div className="space-y-3 pr-4">
                  {detectedItems.map((item, idx) => {
                    const confidenceLevel = getConfidenceLevel(item.confidence);
                    return (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-foreground">{item.item}</h4>
                              <p className="text-xs text-muted-foreground">
                                {item.category} • Photo #{item.photoIndex}
                              </p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={confidenceColors[confidenceLevel]}
                            >
                              {Math.round(item.confidence * 100)}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Qty:</span>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuantity(idx, Number(e.target.value))}
                                className="w-20 h-8 text-sm"
                              />
                            </div>
                            <div>
                              <span className="text-muted-foreground">Unit:</span>
                              <span className="ml-2 font-medium">{item.unit}</span>
                            </div>
                          </div>
                          {item.notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {item.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Button className="w-full" size="lg" onClick={handleContinue}>
                  Review & Finalize Estimate
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/estimator/chat')}
                >
                  Switch to Chat Mode
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
