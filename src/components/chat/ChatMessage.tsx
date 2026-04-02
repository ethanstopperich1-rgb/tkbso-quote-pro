import { cn } from '@/lib/utils';
import { type ChatMessage as ChatMessageType } from '@/lib/chatFlow';

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex w-full',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isAssistant
            ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm'
            : 'bg-slate-800 text-white rounded-tr-sm font-medium'
        )}
        style={{ whiteSpace: 'pre-line' }}
      >
        {message.text}
        <div
          className={cn(
            'text-[10px] mt-1.5 select-none',
            isAssistant ? 'text-slate-400' : 'text-white/40'
          )}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
