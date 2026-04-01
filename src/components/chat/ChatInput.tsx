import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ArrowUp, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type QuickReply, type FlowStep, isMultiSelectStep } from '@/lib/chatFlow';

interface Props {
  onSend: (value: string) => void;
  quickReplies?: QuickReply[];
  selectedExtras?: Set<string>;
  onToggleExtra?: (value: string) => void;
  inputType?: string;
  placeholder?: string;
  disabled?: boolean;
  currentStep: FlowStep;
}

export function ChatInput({
  onSend,
  quickReplies,
  selectedExtras,
  onToggleExtra,
  inputType = 'text',
  placeholder = 'Type a message...',
  disabled,
  currentStep,
}: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled, currentStep]);

  const submit = () => {
    const val = text.trim();
    if (!val) {
      // Allow empty submit for optional steps (email, dimensions)
      if (currentStep === 'customer_email' || currentStep === 'room_dimensions') {
        onSend('');
        setText('');
        return;
      }
      return;
    }
    onSend(val);
    setText('');
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const isExtras = isMultiSelectStep(currentStep);

  return (
    <div className="flex flex-col gap-2">
      {/* Quick reply chips */}
      {quickReplies && quickReplies.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {quickReplies.map((qr) => {
            const isSelected = selectedExtras?.has(qr.value);
            const isContinue = qr.value === '__continue__';

            return (
              <button
                key={qr.value}
                onClick={() => {
                  if (isExtras && !isContinue && onToggleExtra) {
                    onToggleExtra(qr.value);
                  } else {
                    onSend(qr.value);
                  }
                }}
                disabled={disabled}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 cursor-pointer select-none',
                  qr.style === 'price'
                    ? isContinue
                      ? 'bg-white text-black border-white hover:bg-white/90'
                      : isSelected
                        ? 'bg-white text-black border-white'
                        : 'bg-transparent text-white border-white/20 hover:border-white/50'
                    : isSelected
                      ? 'bg-white/10 text-white border-white/30'
                      : 'bg-transparent text-white/60 border-white/10 hover:text-white hover:border-white/30',
                  disabled && 'opacity-40 pointer-events-none'
                )}
              >
                {isExtras && !isContinue && (
                  <span className="mr-1">{isSelected ? '\u2713' : '+'}</span>
                )}
                {qr.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Text input -- show when no quickReplies or for text/number input steps */}
      {(!quickReplies || quickReplies.length === 0 || inputType !== 'text') && (
        inputType !== 'text' || !quickReplies?.length
      ) && (
        <div className="relative flex items-end bg-[#141414] border border-white/[0.08] rounded-2xl overflow-hidden focus-within:border-white/20 transition-colors">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none resize-none leading-relaxed max-h-36"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <button
            onClick={submit}
            disabled={disabled}
            className="m-2 w-8 h-8 rounded-xl bg-white flex items-center justify-center flex-shrink-0 transition-all duration-150 disabled:opacity-20 hover:bg-white/90 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Hint */}
      {!quickReplies?.length && (
        <p className="text-[10px] text-white/20 px-1 flex items-center gap-1">
          <CornerDownLeft className="w-2.5 h-2.5" />
          Enter to send
        </p>
      )}
    </div>
  );
}
