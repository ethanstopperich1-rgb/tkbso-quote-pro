import { Message } from "@/types/estimator";
import { QuoteDisplay } from "./QuoteDisplay";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      "flex gap-3 animate-slide-up mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-xs font-semibold text-primary-foreground">AI</span>
        </div>
      )}
      
      <div className={cn(
        "max-w-[75%]",
        isUser ? "order-first" : ""
      )}>
        {isUser ? (
          <div className="bg-accent text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                {message.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">
                    {line.startsWith('**') && line.endsWith('**') ? (
                      <strong>{line.slice(2, -2)}</strong>
                    ) : line.startsWith('- ') ? (
                      <span>• {line.slice(2)}</span>
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
            </div>
            {message.quote && <QuoteDisplay quote={message.quote} />}
          </div>
        )}
        
        <p className={cn(
          "text-[10px] text-muted-foreground mt-1.5 font-medium",
          isUser ? "text-right" : "text-left"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-xs font-semibold text-white">You</span>
        </div>
      )}
    </div>
  );
}
