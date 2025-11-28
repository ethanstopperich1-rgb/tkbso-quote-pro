import { useState, useRef, useEffect } from "react";
import { Message } from "@/types/estimator";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { QuickStartCards } from "./QuickStartCards";
import { processUserMessage, resetEstimator } from "@/lib/estimator-engine";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Welcome to the TKBSO AI Estimator! I'm here to help you create professional quotes for kitchen and bathroom remodels.\n\nI'll gather project details and generate a complete quote with:\n• Client-facing price summary\n• Detailed scope of work\n• Internal cost & margin breakdown\n\n**Get started by telling me about your project, or choose a quick start below:**`,
  timestamp: new Date(),
};

export function EstimatorChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    // Process and get response
    const { response, quote } = processUserMessage(content);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      quote,
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleReset = () => {
    resetEstimator();
    setMessages([WELCOME_MESSAGE]);
  };

  const showQuickStart = messages.length === 1;

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {showQuickStart && (
            <div className="pt-4 animate-fade-in">
              <QuickStartCards onSelect={handleSendMessage} />
            </div>
          )}
          
          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary-foreground">TK</span>
              </div>
              <div className="chat-bubble-ai">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-subtle" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-subtle" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-subtle" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Reset button */}
      {messages.length > 1 && (
        <div className="px-4 pb-2">
          <div className="max-w-4xl mx-auto flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
              <RotateCcw className="w-4 h-4 mr-1" />
              Start New Quote
            </Button>
          </div>
        </div>
      )}

      {/* Input area */}
      <ChatInput 
        onSend={handleSendMessage} 
        disabled={isTyping}
        placeholder="Describe your project (e.g., 'Full bathroom remodel, 85 sq ft, no GC involved...')"
      />
    </div>
  );
}
