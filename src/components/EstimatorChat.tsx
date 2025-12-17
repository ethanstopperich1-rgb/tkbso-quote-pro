import { useState, useRef, useEffect } from "react";
import { Message } from "@/types/estimator";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { QuickStartCards } from "./QuickStartCards";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEstimator } from "@/contexts/EstimatorContext";

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Hey! I'm your estimating assistant. What are we pricing today — **kitchen** or **bathroom**?`,
  timestamp: new Date(),
};

export function EstimatorChat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setFinalQuote, setStage, state } = useEstimator();

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
      // Build conversation history for the AI
      const conversationHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          content: m.content
        }));
      
      // Add current message
      conversationHistory.push({ role: 'user', content });

      // Call the generate-quote edge function
      const { data, error } = await supabase.functions.invoke('generate-quote', {
        body: { 
          message: content,
          conversationHistory
        }
      });

      if (error) throw error;

      console.log('generate-quote response:', data);

      // Check if we have a complete quote
      if (data?.isComplete && data?.quote) {
        // Quote is ready - update context and show success message
        setFinalQuote(data.quote);
        setStage('complete');
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Got it! I've generated your estimate. Check out the preview on the right. 👉\n\nYou can adjust line items, update pricing, or download the PDF when ready.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else if (data?.followUpQuestion) {
        // Still gathering info - show the follow-up question
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.followUpQuestion,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm processing your request. Could you tell me more about the project?",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setFinalQuote(null as any);
    setStage('collecting');
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
              Start Over
            </Button>
          </div>
        </div>
      )}

      {/* Input area */}
      <ChatInput 
        onSend={handleSendMessage} 
        disabled={isTyping}
        placeholder="Describe your project..."
      />
    </div>
  );
}
