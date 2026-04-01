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
            ? 'bg-[#1a1a1a] border border-white/[0.06] text-[#e8e8e8] rounded-tl-sm'
            : 'bg-white text-[#0a0a0a] rounded-tr-sm font-medium'
        )}
        style={{ whiteSpace: 'pre-line' }}
      >
        {message.text}
        <div
          className={cn(
            'text-[10px] mt-1.5 select-none',
            isAssistant ? 'text-white/25' : 'text-black/30'
          )}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
