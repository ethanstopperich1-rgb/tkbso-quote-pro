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
                      ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-700'
                      : isSelected
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                    : isSelected
                      ? 'bg-slate-100 text-slate-800 border-slate-400'
                      : 'bg-white text-slate-500 border-slate-200 hover:text-slate-700 hover:border-slate-400',
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

      {/* Text input */}
      {(!quickReplies || quickReplies.length === 0 || inputType !== 'text') && (
        inputType !== 'text' || !quickReplies?.length
      ) && (
        <div className="relative flex items-end bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-slate-400 transition-colors">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none leading-relaxed max-h-36"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <button
            onClick={submit}
            disabled={disabled}
            className="m-2 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 transition-all duration-150 disabled:opacity-20 hover:bg-slate-700 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Hint */}
      {!quickReplies?.length && (
        <p className="text-[10px] text-slate-400 px-1 flex items-center gap-1">
          <CornerDownLeft className="w-2.5 h-2.5" />
          Enter to send
        </p>
      )}
    </div>
  );
}
