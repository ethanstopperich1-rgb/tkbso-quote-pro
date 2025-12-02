import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { Send, Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            }
          }
          if (finalTranscript) {
            setInput(prev => prev + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied');
          }
        };

        recognitionRef.current.onend = () => setIsListening(false);
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        toast.error('Failed to start listening');
      }
    }
  };

  const handleSend = () => {
    if (input.trim() && !disabled) {
      if (isListening && recognitionRef.current) recognitionRef.current.stop();
      onSend(input.trim());
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className={cn(
        "relative flex items-end gap-2 p-3 rounded-2xl transition-all duration-300",
        "bg-white/[0.03] border border-white/[0.08]",
        isFocused && "border-accent/50 bg-white/[0.05] shadow-glow"
      )}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder || "Describe your project..."}
        disabled={disabled}
        rows={1}
        className={cn(
          "flex-1 bg-transparent border-0 resize-none text-base",
          "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "min-h-[44px] max-h-[150px] py-2.5 px-2"
        )}
      />

      <div className="flex items-center gap-1.5 pb-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleListening}
          disabled={disabled}
          className={cn(
            "h-9 w-9 rounded-xl transition-all duration-300",
            isListening 
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse" 
              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.08]"
          )}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        <Button
          type="button"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className={cn(
            "h-9 w-9 rounded-xl p-0 transition-all duration-300",
            "bg-accent hover:bg-accent/90",
            "hover:scale-105 hover:shadow-glow",
            "disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
          )}
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
