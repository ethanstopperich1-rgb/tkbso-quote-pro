/**
 * MicButton — animated microphone button for voice-to-estimate
 *
 * States:
 *   idle        → teal mic icon, "Tap to speak"
 *   recording   → pulsing red ring, live waveform bars, "Listening..."
 *   processing  → spinning loader, "Generating estimate..."
 *   done        → green check, "Done"
 *   error       → red X, error message
 *   unsupported → disabled, tooltip explaining fallback
 */

import { Mic, MicOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { VoiceEstimateStatus } from '../hooks/useVoiceEstimate';

interface MicButtonProps {
  status: VoiceEstimateStatus;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: { button: 'h-10 w-10', icon: 16, ring: 'h-14 w-14' },
  md: { button: 'h-16 w-16', icon: 24, ring: 'h-24 w-24' },
  lg: { button: 'h-20 w-20', icon: 32, ring: 'h-28 w-28' },
};

export function MicButton({
  status,
  onStart,
  onStop,
  onReset,
  className,
  size = 'md',
}: MicButtonProps) {
  const s = SIZE_MAP[size];

  const handleClick = () => {
    if (status === 'idle' || status === 'error') onStart();
    else if (status === 'recording') onStop();
    else if (status === 'done') onReset();
  };

  const isDisabled = status === 'processing' || status === 'requesting_permission' || status === 'unsupported';

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Pulse ring when recording */}
      {status === 'recording' && (
        <>
          <span
            className={cn(
              'absolute rounded-full bg-red-500/20 animate-ping',
              s.ring
            )}
          />
          <span
            className={cn(
              'absolute rounded-full bg-red-500/10',
              s.ring
            )}
          />
        </>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            size="icon"
            disabled={isDisabled}
            onClick={handleClick}
            aria-label={
              status === 'recording' ? 'Stop recording' : 'Start voice estimate'
            }
            className={cn(
              s.button,
              'rounded-full relative z-10 transition-all duration-200 shadow-lg',
              {
                'bg-primary hover:bg-primary/90': status === 'idle',
                'bg-red-500 hover:bg-red-600 scale-110': status === 'recording',
                'bg-muted text-muted-foreground cursor-not-allowed': isDisabled,
                'bg-green-600 hover:bg-green-700': status === 'done',
                'bg-red-600 hover:bg-red-700': status === 'error',
              }
            )}
          >
            {status === 'idle' && <Mic size={s.icon} />}
            {(status === 'requesting_permission') && (
              <Loader2 size={s.icon} className="animate-spin" />
            )}
            {status === 'recording' && (
              <MicOff size={s.icon} />
            )}
            {status === 'processing' && (
              <Loader2 size={s.icon} className="animate-spin" />
            )}
            {status === 'done' && <CheckCircle2 size={s.icon} />}
            {status === 'error' && <XCircle size={s.icon} />}
            {status === 'unsupported' && <MicOff size={s.icon} />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {status === 'idle' && 'Tap to describe the project out loud'}
          {status === 'requesting_permission' && 'Requesting microphone access...'}
          {status === 'recording' && 'Tap to stop recording'}
          {status === 'processing' && 'Qwen AI is generating your estimate...'}
          {status === 'done' && 'Tap to record again'}
          {status === 'error' && 'Tap to try again'}
          {status === 'unsupported' && 'Voice input not supported in this browser'}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// Animated waveform bars shown during recording
export function VoiceWaveform({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="flex items-end gap-0.5 h-6" aria-hidden>
      {[1, 2, 3, 4, 5, 4, 3].map((h, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-red-500 animate-pulse"
          style={{
            height: `${h * 4}px`,
            animationDelay: `${i * 80}ms`,
            animationDuration: '600ms',
          }}
        />
      ))}
    </div>
  );
}
