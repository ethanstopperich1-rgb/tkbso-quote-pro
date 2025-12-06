import { useRef, useState } from 'react';
import { Camera, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PhotoUploadButtonProps {
  onPhotoAnalyzed: (analysis: PhotoAnalysis, imagePreview: string) => void;
  disabled?: boolean;
}

export interface DetectedItem {
  category: string;
  item: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface PhotoAnalysis {
  project_type: 'Kitchen' | 'Bathroom' | 'Unknown';
  confidence: 'high' | 'medium' | 'low';
  detected_items: DetectedItem[];
  estimated_dimensions?: {
    room_length_ft?: number | null;
    room_width_ft?: number | null;
    ceiling_height_ft?: number | null;
    shower_length_ft?: number | null;
    shower_width_ft?: number | null;
  };
  observations?: string;
}

export function PhotoUploadButton({ onPhotoAnalyzed, disabled }: PhotoUploadButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Extract base64 data without the data URL prefix
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);

      const base64Data = await base64Promise;
      const imagePreview = `data:${file.type};base64,${base64Data}`;

      // Call the analyze-photo edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          image_base64: base64Data,
          mime_type: file.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.');
        }
        if (response.status === 402) {
          throw new Error('AI quota exceeded. Please try again later.');
        }
        throw new Error(errorData.error || 'Failed to analyze photo');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      toast.success('Photo analyzed!');
      onPhotoAnalyzed(data.analysis, imagePreview);

    } catch (error) {
      console.error('Photo analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze photo');
    } finally {
      setIsAnalyzing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={disabled || isAnalyzing}
        className={cn(
          "h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl transition-all duration-300",
          isAnalyzing 
            ? "bg-primary/20 text-primary animate-pulse" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        title="Upload photo for AI analysis"
      >
        {isAnalyzing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>
    </>
  );
}
