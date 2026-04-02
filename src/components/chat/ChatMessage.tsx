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
          'max-w-[78%] px-4 py-3 text-sm leading-relaxed',
          isAssistant
            ? 'bg-[#111] border border-[#222] text-[#E8E8E8] rounded-[12px] rounded-tl-[4px]'
            : 'bg-[#2B4C8C] text-white rounded-[12px] rounded-tr-[4px]'
        )}
        style={{ whiteSpace: 'pre-line' }}
      >
        {message.text}
        <div
          className={cn(
            'font-mono text-[10px] mt-1.5 select-none tabular-nums',
            isAssistant ? 'text-[#666]' : 'text-white/40'
          )}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
