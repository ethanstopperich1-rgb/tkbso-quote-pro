import { useState, useRef, useEffect } from "react";
import { Message } from "@/types/estimator";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { QuickStartCards } from "./QuickStartCards";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Welcome! I'm **TKE** (The Knowledgeable Estimator), your AI-powered estimator for The Kitchen & Bath Store of Orlando.

I'll guide you through a structured 4-phase workflow:

**Phase 1:** Scope Ingestion — I'll listen to your project description
**Phase 2:** Question & Refinement — I'll ask key clarifying questions
**Phase 3:** Data Extraction — I'll output structured scope details
**Phase 4:** Image Processing — Upload floor plans for automated takeoffs (optional)

Let's begin! **Describe your project:**`,
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

    try {
      // Call the parse-project edge function with conversation context
      const { data, error } = await supabase.functions.invoke('parse-project', {
        body: { 
          message: content,
          context: { messages: messages.slice(1) } // Exclude welcome message
        }
      });

      if (error) throw error;

      // Handle Markdown response (Phases 1-3)
      if (data?.isMarkdown) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Handle JSON response (legacy or structured data)
        const response = data?.followUpQuestion || data?.summary || "I'm processing your request...";
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error processing your request. Please try rephrasing your project description.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  const showQuickStart = messages.length === 1;

  return (
    <div className="flex flex-col h-full">
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
