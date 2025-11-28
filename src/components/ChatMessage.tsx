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
      "flex gap-3 animate-slide-up",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary-foreground">TK</span>
        </div>
      )}
      
      <div className={cn(
        "max-w-[85%]",
        isUser ? "order-first" : ""
      )}>
        {isUser ? (
          <div className="chat-bubble-user">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="chat-bubble-ai">
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.quote && <QuoteDisplay quote={message.quote} />}
          </div>
        )}
        
        <p className={cn(
          "text-xs text-muted-foreground mt-1",
          isUser ? "text-right" : "text-left"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-secondary-foreground">You</span>
        </div>
      )}
    </div>
  );
}
