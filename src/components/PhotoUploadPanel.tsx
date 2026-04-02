/**
 * PhotoUploadPanel — full photo upload → AI scope detection UI
 *
 * Features:
 *   - Drag & drop zone (desktop)
 *   - Camera capture button (mobile — opens native camera)
 *   - File picker fallback
 *   - Photo grid with per-photo status and remove button
 *   - Per-photo AI description revealed on completion
 *   - Progress bar through upload → analyze → generate stages
 *   - Line items with accept/reject (reuses same pattern as VoiceEstimatePanel)
 *   - "Add to Quote" CTA
 */

import { useRef, useState, useCallback } from 'react';
import {
  Camera,
  Upload,
  X,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ImagePlus,
  Wand2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { usePhotoEstimate } from '../hooks/usePhotoEstimate';
import type { LineItem, ProjectType } from '../types';

interface PhotoUploadPanelProps {
  projectType: ProjectType;
  onAddItems: (items: LineItem[]) => void;
  className?: string;
}

export function PhotoUploadPanel({
  projectType,
  onAddItems,
  className,
}: PhotoUploadPanelProps) {
  const {
    photos,
    overallStatus,
    result,
    error,
    addPhotos,
    removePhoto,
    runAnalysis,
    reset,
    uploadProgress,
  } = usePhotoEstimate();

  const [isDragging, setIsDragging] = useState(false);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [showGaps, setShowGaps] = useState(true);
  const [expandedPhotoId, setExpandedPhotoId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync accepted IDs when result first arrives
  const allItemIds = result?.lineItems.map((item) => (item as LineItem).id ?? '') ?? [];
  if (result && acceptedIds.size === 0 && allItemIds.length > 0) {
    setAcceptedIds(new Set(allItemIds));
  }

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const images = arr.filter((f) => f.type.startsWith('image/'));
      if (images.length === 0) return;
      addPhotos(images);
    },
    [addPhotos]
  );

  // Drag & drop handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const toggleItem = (id: string) => {
    setAcceptedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddToQuote = () => {
    if (!result) return;
    const accepted = (result.lineItems as LineItem[]).filter(
      (item) => acceptedIds.has(item.id ?? '')
    );
    onAddItems(accepted);
    reset();
    setAcceptedIds(new Set());
  };

  const acceptedCount = acceptedIds.size;
  const acceptedTotal = result
    ? (result.lineItems as LineItem[])
        .filter((item) => acceptedIds.has(item.id ?? ''))
        .reduce((sum, item) => sum + item.totalPrice, 0)
    : 0;

  const isProcessing = ['uploading', 'analyzing', 'generating'].includes(overallStatus);
  const statusLabel = {
    idle: '',
    uploading: 'Uploading photos to storage...',
    analyzing: 'Qwen Vision is analyzing each photo...',
    generating: 'Building your estimate...',
    done: 'Analysis complete',
    error: 'Something went wrong',
  }[overallStatus];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Camera className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-base">Photo Estimate</h3>
        <Badge variant="secondary" className="text-xs">Qwen Vision AI</Badge>
      </div>

      {/* Drop zone */}
      {!isProcessing && overallStatus !== 'done' && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            'border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Drop job site photos here</p>
          <p className="text-xs text-muted-foreground mt-1">
            or tap to browse &bull; up to 10 photos
          </p>

          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Browse Files
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                cameraInputRef.current?.click();
              }}
            >
              <Camera className="h-3.5 w-3.5 mr-1.5" />
              Take Photo
            </Button>
          </div>

          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square">
              <img
                src={photo.previewUrl}
                alt="Job site photo"
                className="h-full w-full object-cover rounded-lg"
                loading="lazy"
              />

              {/* Status overlay */}
              <div
                className={cn(
                  'absolute inset-0 rounded-lg flex items-center justify-center',
                  photo.status === 'uploading' || photo.status === 'analyzing'
                    ? 'bg-black/40'
                    : 'bg-transparent'
                )}
              >
                {(photo.status === 'uploading' || photo.status === 'analyzing') && (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                )}
                {photo.status === 'done' && (
                  <CheckCircle2 className="h-5 w-5 text-green-400 drop-shadow" />
                )}
                {photo.status === 'error' && (
                  <AlertTriangle className="h-5 w-5 text-red-400 drop-shadow" />
                )}
              </div>

              {/* Remove button */}
              {!isProcessing && (
                <button
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(photo.id)}
                  aria-label="Remove photo"
                >
                  <X className="h-3 w-3" />
                </button>
              )}

              {/* Description preview toggle */}
              {photo.description && (
                <button
                  className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                  onClick={() =>
                    setExpandedPhotoId(
                      expandedPhotoId === photo.id ? null : photo.id
                    )
                  }
                  aria-label="View AI description"
                >
                  <Eye className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Expanded photo description */}
      {expandedPhotoId && (() => {
        const photo = photos.find((p) => p.id === expandedPhotoId);
        return photo?.description ? (
          <Card className="border-primary/20">
            <CardContent className="pt-4 pb-3">
              <div className="flex gap-3">
                <img
                  src={photo.previewUrl}
                  alt=""
                  className="h-14 w-14 object-cover rounded-md flex-shrink-0"
                />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Qwen Vision detected:</p>
                  <p className="text-sm leading-relaxed">{photo.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null;
      })()}

      {/* Progress bar */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground animate-pulse">{statusLabel}</p>
            <span className="text-xs text-muted-foreground tabular-nums">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Error */}
      {overallStatus === 'error' && error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analyze CTA */}
      {photos.length > 0 && overallStatus === 'idle' && (
        <Button
          className="w-full"
          onClick={() => runAnalysis(projectType)}
          disabled={photos.length === 0}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Analyze {photos.length} Photo{photos.length !== 1 ? 's' : ''} with AI
        </Button>
      )}

      {/* Results */}
      {result && overallStatus === 'done' && (
        <>
          {/* Gap warnings */}
          {result.gapWarnings.length > 0 && (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                <button
                  className="font-medium text-amber-800 dark:text-amber-400 flex items-center gap-1 w-full text-left"
                  onClick={() => setShowGaps(!showGaps)}
                >
                  {result.gapWarnings.length} commonly missed item{result.gapWarnings.length > 1 ? 's' : ''}
                  {showGaps ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                {showGaps && (
                  <ul className="mt-2 space-y-1">
                    {result.gapWarnings.map((w, i) => (
                      <li key={i} className="text-xs text-amber-700 dark:text-amber-300">
                        • {w}
                      </li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Line items */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Photo-Detected Line Items
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost" size="sm" className="text-xs h-7"
                    onClick={() => setAcceptedIds(new Set(allItemIds))}
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost" size="sm" className="text-xs h-7"
                    onClick={() => setAcceptedIds(new Set())}
                  >
                    None
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {(result.lineItems as LineItem[]).map((item) => {
                const id = item.id ?? '';
                const isAccepted = acceptedIds.has(id);
                return (
                  <div
                    key={id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                      isAccepted
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border bg-muted/30 opacity-50'
                    )}
                    onClick={() => toggleItem(id)}
                  >
                    <div
                      className={cn(
                        'mt-0.5 h-4 w-4 rounded border-2 flex-shrink-0 transition-colors',
                        isAccepted ? 'bg-primary border-primary' : 'border-muted-foreground'
                      )}
                    >
                      {isAccepted && (
                        <svg viewBox="0 0 8 8" fill="none" className="h-full w-full p-0.5">
                          <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{item.name}</span>
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          {item.category}
                        </Badge>
                        {item.isOptional && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">Optional</Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.quantity} {item.unit} × ${item.unitPrice.toLocaleString()} / {item.unit}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold tabular-nums">
                        ${item.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}

              <Separator className="my-2" />

              <div className="flex items-center justify-between px-1">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    {acceptedCount} of {result.lineItems.length} items selected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Suggested markup:{' '}
                    <span className="font-medium text-foreground">{result.suggestedMarkup}%</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Subtotal</p>
                  <p className="text-lg font-bold tabular-nums">
                    ${acceptedTotal.toLocaleString()}
                  </p>
                </div>
              </div>

              {result.summary && (
                <p className="text-xs text-muted-foreground italic border-t pt-2">
                  {result.summary}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1"
                  disabled={acceptedCount === 0}
                  onClick={handleAddToQuote}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {acceptedCount} item{acceptedCount !== 1 ? 's' : ''} to Quote
                </Button>
                <Button variant="outline" size="icon" onClick={reset} title="Start over">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
