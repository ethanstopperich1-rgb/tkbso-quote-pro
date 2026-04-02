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
      {/* Quick reply chips — Nothing style */}
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
                  'px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] border transition-colors duration-150 cursor-pointer select-none',
                  isContinue
                    ? 'bg-white text-black border-white rounded-pill hover:bg-[#E8E8E8]'
                    : isSelected
                      ? 'bg-[#2B4C8C] text-white border-[#2B4C8C] rounded-pill'
                      : 'bg-transparent text-[#999] border-[#333] rounded-pill hover:text-[#E8E8E8] hover:border-[#666]',
                  disabled && 'opacity-30 pointer-events-none'
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

      {/* Text input — Nothing style */}
      {(!quickReplies || quickReplies.length === 0 || inputType !== 'text') && (
        inputType !== 'text' || !quickReplies?.length
      ) && (
        <div className="relative flex items-end bg-[#111] border border-[#222] rounded-lg overflow-hidden focus-within:border-[#2B4C8C] transition-colors duration-150">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-[#E8E8E8] placeholder:text-[#444] outline-none resize-none leading-relaxed max-h-36 font-sans"
            style={{ fieldSizing: 'content' } as React.CSSProperties}
          />
          <button
            onClick={submit}
            disabled={disabled}
            className="m-2 w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 transition-colors duration-150 disabled:opacity-20 hover:bg-[#E8E8E8] cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Hint */}
      {!quickReplies?.length && (
        <p className="font-mono text-[10px] text-[#444] px-1 flex items-center gap-1 uppercase tracking-[0.08em]">
          <CornerDownLeft className="w-2.5 h-2.5" strokeWidth={1.5} />
          ENTER TO SEND
        </p>
      )}
    </div>
  );
}
