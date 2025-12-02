import { Message } from "@/types/estimator";
import { QuoteDisplay } from "./QuoteDisplay";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { useState, useEffect } from "react";

interface ChatMessageProps {
  message: Message;
  isNew?: boolean;
}

// Typewriter effect for AI messages
function TypewriterText({ text, speed = 15 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-0.5 h-4 ml-0.5 bg-accent animate-pulse" />
      )}
    </span>
  );
}

// Parse markdown-style formatting
function parseContent(content: string) {
  return content.split('\n').map((line, i) => {
    // Bold text
    const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      // Bullet points
      if (part.startsWith('- ') || part.startsWith('• ')) {
        return <span key={j}>• {part.slice(2)}</span>;
      }
      return part;
    });
    
    return (
      <p key={i} className="mb-1.5 last:mb-0">
        {parts}
      </p>
    );
  });
}

export function ChatMessage({ message, isNew = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isWelcome = message.id === 'welcome';
  
  return (
    <div className={cn(
      "flex gap-3 animate-fade-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0 border border-accent/30 shadow-glow">
          <Bot className="w-4 h-4 text-accent" />
        </div>
      )}
      
      <div className={cn("max-w-[80%]", isUser ? "order-first" : "")}>
        {isUser ? (
          <div className="chat-bubble-user">
            <p className="text-[0.9375rem] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="chat-bubble-ai">
              <div className="text-[0.9375rem] leading-relaxed whitespace-pre-wrap">
                {isNew && !isWelcome ? (
                  <TypewriterText text={message.content} speed={12} />
                ) : (
                  parseContent(message.content)
                )}
              </div>
            </div>
            {message.quote && <QuoteDisplay quote={message.quote} />}
          </div>
        )}
        
        <p className={cn(
          "text-[10px] text-muted-foreground/50 mt-1.5 font-medium",
          isUser ? "text-right" : "text-left"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      
      {/* User Avatar */}
      {isUser && (
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20">
          <User className="w-4 h-4 text-accent-foreground" />
        </div>
      )}
    </div>
  );
}
