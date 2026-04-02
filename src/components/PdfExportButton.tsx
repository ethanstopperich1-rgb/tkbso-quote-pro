/**
 * PdfExportButton — one-click branded PDF export for the EstimateDetail page
 *
 * Usage:
 *   <PdfExportButton estimateId={estimate.id} />
 *
 * Shows:
 *   - Idle: "Export PDF" button with FileDown icon
 *   - Generating: spinner + "Generating PDF..."
 *   - Done: green check + "Open PDF" link (if URL available)
 *   - Error: red X with error message + retry
 */

import { FileDown, Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePdfExport } from '../hooks/usePdfExport';

interface PdfExportButtonProps {
  estimateId: string | null;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  label?: string;
}

export function PdfExportButton({
  estimateId,
  variant = 'outline',
  size = 'default',
  className,
  label = 'Export PDF',
}: PdfExportButtonProps) {
  const { status, pdfUrl, error, generate, reset } = usePdfExport(estimateId);

  if (status === 'generating') {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Generating PDF...
      </Button>
    );
  }

  if (status === 'done') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="ghost"
          size={size}
          className="text-green-600 hover:text-green-700"
          onClick={reset}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          PDF Ready
        </Button>
        {pdfUrl && (
          <Button
            variant="outline"
            size={size}
            asChild
          >
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Open PDF
            </a>
          </Button>
        )}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="destructive"
          size={size}
          onClick={generate}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Retry PDF
        </Button>
        {error && (
          <span className="text-xs text-destructive max-w-[200px] truncate">{error}</span>
        )}
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={generate}
      disabled={!estimateId}
    >
      <FileDown className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
