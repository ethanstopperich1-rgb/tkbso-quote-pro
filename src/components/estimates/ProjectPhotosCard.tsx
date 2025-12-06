import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProjectPhotosCardProps {
  estimateId: string;
}

interface Photo {
  name: string;
  url: string;
}

export function ProjectPhotosCard({ estimateId }: ProjectPhotosCardProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing photos
  useEffect(() => {
    async function fetchPhotos() {
      try {
        const { data, error } = await supabase.storage
          .from('estimate-photos')
          .list(estimateId, { limit: 20, sortBy: { column: 'created_at', order: 'asc' } });

        if (error) throw error;

        if (data && data.length > 0) {
          const photoUrls = data
            .filter(file => file.name !== '.emptyFolderPlaceholder')
            .map(file => {
              const { data: urlData } = supabase.storage
                .from('estimate-photos')
                .getPublicUrl(`${estimateId}/${file.name}`);
              return { name: file.name, url: urlData.publicUrl };
            });
          setPhotos(photoUrls);
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setLoading(false);
      }
    }

    if (estimateId) {
      fetchPhotos();
    }
  }, [estimateId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPhotos: Photo[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${estimateId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('estimate-photos')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('estimate-photos')
          .getPublicUrl(filePath);

        newPhotos.push({ name: fileName, url: urlData.publicUrl });
      }

      if (newPhotos.length > 0) {
        setPhotos(prev => [...prev, ...newPhotos]);
        toast.success(`${newPhotos.length} photo(s) uploaded!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (photoName: string) => {
    setDeletingPhoto(photoName);
    try {
      const { error } = await supabase.storage
        .from('estimate-photos')
        .remove([`${estimateId}/${photoName}`]);

      if (error) throw error;

      setPhotos(prev => prev.filter(p => p.name !== photoName));
      toast.success('Photo deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete photo');
    } finally {
      setDeletingPhoto(null);
    }
  };

  const placeholderCount = Math.max(0, 4 - photos.length);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-muted-foreground" />
            Project Photos
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4 mr-1" />
            )}
            Add Photos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Uploaded Photos */}
            {photos.map((photo) => (
              <div
                key={photo.name}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <img
                  src={photo.url}
                  alt="Project photo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(photo.name)}
                    disabled={deletingPhoto === photo.name}
                  >
                    {deletingPhoto === photo.name ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {/* Placeholder slots */}
            {Array.from({ length: placeholderCount }).map((_, i) => (
              <div
                key={`placeholder-${i}`}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "aspect-square rounded-lg border-2 border-dashed border-slate-200 bg-slate-50",
                  "flex flex-col items-center justify-center text-slate-400",
                  "hover:border-sky-300 hover:bg-sky-50/50 transition-colors cursor-pointer"
                )}
              >
                <ImagePlus className="h-6 w-6 mb-1" />
                <span className="text-xs">Before {photos.length + i + 1}</span>
              </div>
            ))}
          </div>
        )}

        {photos.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
          </p>
        )}
      </CardContent>
    </Card>
  );
}
