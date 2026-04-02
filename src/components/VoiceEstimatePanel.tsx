/**
 * VoiceEstimatePanel — full voice-to-estimate UI panel
 *
 * Shows:
 *   - MicButton + waveform
 *   - Live transcript while recording
 *   - Manual text fallback (textarea) for Firefox / no mic
 *   - AI-generated line items with accept/reject per item
 *   - Gap warnings from AI
 *   - Suggested markup
 *   - "Add to Quote" button to pass accepted items upstream
 */

import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Plus, Trash2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { MicButton, VoiceWaveform } from './MicButton';
import { useVoiceEstimate } from '../hooks/useVoiceEstimate';
import { cn } from '@/lib/utils';
import type { LineItem, ProjectType } from '../types';

interface VoiceEstimatePanelProps {
  projectType: ProjectType;
  onAddItems: (items: LineItem[]) => void;
  className?: string;
}

export function VoiceEstimatePanel({
  projectType,
  onAddItems,
  className,
}: VoiceEstimatePanelProps) {
  const {
    status,
    transcript,
    finalTranscript,
    result,
    error,
    isSupported,
    startRecording,
    stopRecording,
    reset,
    runEstimate,
  } = useVoiceEstimate(projectType);

  const [manualText, setManualText] = useState('');
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [showGaps, setShowGaps] = useState(true);
  const [showManual, setShowManual] = useState(!isSupported);

  // When result arrives, accept all items by default
  const allItemIds = result?.lineItems.map((item) => (item as LineItem).id ?? '') ?? [];
  const initialAccepted = new Set(allItemIds);

  const handleResultArrived = () => {
    setAcceptedIds(initialAccepted);
    setRejectedIds(new Set());
  };

  // Keep accepted set in sync when result first arrives
  if (result && acceptedIds.size === 0 && allItemIds.length > 0) {
    handleResultArrived();
  }

  const toggleItem = (id: string) => {
    setAcceptedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setRejectedIds((r) => new Set([...r, id]));
      } else {
        next.add(id);
        setRejectedIds((r) => { const rr = new Set(r); rr.delete(id); return rr; });
      }
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
    setRejectedIds(new Set());
  };

  const acceptedTotal = result
    ? (result.lineItems as LineItem[])
        .filter((item) => acceptedIds.has(item.id ?? ''))
        .reduce((sum, item) => sum + item.totalPrice, 0)
    : 0;

  const acceptedCount = acceptedIds.size;

  return (
    <div className={cn('space-y-4', className)}>
      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <Wand2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-base">AI Voice Estimate</h3>
        <Badge variant="secondary" className="text-xs">Powered by Qwen 2.5</Badge>
      </div>

      {/* ── Mic + Transcript ── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <MicButton
              status={status}
              onStart={startRecording}
              onStop={stopRecording}
              onReset={reset}
              size="lg"
            />

            {status === 'recording' && (
              <div className="flex flex-col items-center gap-2 w-full">
                <VoiceWaveform active />
                <p className="text-sm text-muted-foreground">Listening — tap mic to stop</p>
              </div>
            )}

            {status === 'processing' && (
              <p className="text-sm text-muted-foreground animate-pulse">
                Qwen AI is building your estimate...
              </p>
            )}

            {/* Live transcript */}
            {(status === 'recording' || status === 'processing' || status === 'done') &&
              (transcript || finalTranscript) && (
                <div className="w-full rounded-lg bg-muted p-3">
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Transcript</p>
                  <p className="text-sm leading-relaxed">
                    {finalTranscript || transcript}
                  </p>
                </div>
              )}

            {/* Error */}
            {status === 'error' && error && (
              <Alert variant="destructive" className="w-full">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Fallback toggle */}
            {status === 'idle' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-xs"
                onClick={() => setShowManual(!showManual)}
              >
                {showManual ? 'Hide' : isSupported ? 'Or type instead' : 'Type your scope (mic not supported)'}
              </Button>
            )}
          </div>

          {/* Manual text input fallback */}
          {showManual && (status === 'idle' || status === 'error') && (
            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="Describe the project... e.g. 'Kitchen remodel, remove existing cabinets and counters, install new semi-custom white shaker cabinets, quartz countertops, subway tile backsplash, new faucet, under-cabinet lighting'"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                rows={4}
                className="resize-none text-sm"
              />
              <Button
                size="sm"
                className="w-full"
                disabled={!manualText.trim()}
                onClick={() => runEstimate(manualText, projectType)}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Estimate with AI
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Results ── */}
      {result && status === 'done' && (
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
                  {result.gapWarnings.length} item{result.gapWarnings.length > 1 ? 's' : ''} commonly missed
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
                  AI-Generated Line Items
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setAcceptedIds(new Set(allItemIds))}
                  >
                    Select all
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setAcceptedIds(new Set())}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {(result.lineItems as LineItem[]).map((item) => {
                const id = item.id ?? '';
                const isAccepted = acceptedIds.has(id);
                const isRejected = rejectedIds.has(id);
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
                        isAccepted
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground'
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
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            Optional
                          </Badge>
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

              {/* Summary row */}
              <div className="flex items-center justify-between px-1">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    {acceptedCount} of {result.lineItems.length} items selected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Suggested markup: <span className="font-medium text-foreground">{result.suggestedMarkup}%</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Subtotal</p>
                  <p className="text-lg font-bold tabular-nums">
                    ${acceptedTotal.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* AI summary */}
              {result.summary && (
                <p className="text-xs text-muted-foreground italic border-t pt-2">
                  {result.summary}
                </p>
              )}

              {/* CTA */}
              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1"
                  disabled={acceptedCount === 0}
                  onClick={handleAddToQuote}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {acceptedCount} item{acceptedCount !== 1 ? 's' : ''} to Quote
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={reset}
                  title="Discard and record again"
                >
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
