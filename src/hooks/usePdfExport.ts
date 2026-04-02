/**
 * usePdfExport(estimateId) — generate and download a branded PDF estimate
 *
 * Flow:
 *   1. POST to generate-pdf Edge Function with estimateId
 *   2. If Browserless is configured: returns signed URL → open in new tab
 *   3. If HTML fallback mode: injects HTML into hidden iframe → window.print()
 *   4. Tracks status: idle | generating | done | error
 */

import { useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

export type PdfExportStatus = 'idle' | 'generating' | 'done' | 'error';

export interface UsePdfExportReturn {
  status: PdfExportStatus;
  pdfUrl: string | null;
  error: string | null;
  generate: () => Promise<void>;
  reset: () => void;
}

export function usePdfExport(estimateId: string | null): UsePdfExportReturn {
  const [status, setStatus] = useState<PdfExportStatus>('idle');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!estimateId) return;
    setStatus('generating');
    setError(null);
    setPdfUrl(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-pdf`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.access_token ?? ''}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estimateId }),
        }
      );

      if (!res.ok) throw new Error(`PDF generation failed: ${res.status}`);

      const data = await res.json();

      if (data.mode === 'html_fallback') {
        // Print fallback: inject into hidden iframe and trigger print dialog
        printHtmlFallback(data.html as string);
        setStatus('done');
        return;
      }

      if (data.url) {
        setPdfUrl(data.url as string);
        window.open(data.url as string, '_blank', 'noopener,noreferrer');
        setStatus('done');
      } else {
        throw new Error('No PDF URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
      setStatus('error');
    }
  }, [estimateId]);

  const reset = useCallback(() => {
    setStatus('idle');
    setPdfUrl(null);
    setError(null);
  }, []);

  return { status, pdfUrl, error, generate, reset };
}

// ─── Print fallback helper (no Browserless) ──────────────────────────────────────

function printHtmlFallback(html: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) {
    window.open('data:text/html,' + encodeURIComponent(html), '_blank');
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  // Wait for fonts to load before printing
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 2000);
    }, 800);
  };
}
