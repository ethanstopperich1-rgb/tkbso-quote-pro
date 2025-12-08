import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { Send, Mic, MicOff, Loader2, Camera, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onPhotoUpload?: (file: File) => void;
  onVideoClick?: () => void;
  disabled?: boolean;
  placeholder?: string;
  showPhotoUpload?: boolean;
  showVideoCapture?: boolean;
  isAnalyzingPhoto?: boolean;
  isProcessingVideo?: boolean;
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function ChatInput({ 
  onSend, 
  onPhotoUpload,
  onVideoClick,
  disabled, 
  placeholder,
  showPhotoUpload = false,
  showVideoCapture = false,
  isAnalyzingPhoto = false,
  isProcessingVideo = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    onPhotoUpload?.(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className={cn(
        "relative flex items-end gap-2 p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300",
        "bg-muted/30 border border-border",
        isFocused && "border-primary/50 bg-muted/50 shadow-sm"
      )}
    >
      {/* Hidden file input for photo upload */}
      {showPhotoUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

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
          "flex-1 bg-transparent border-0 resize-none text-sm sm:text-base",
          "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "min-h-[40px] sm:min-h-[44px] max-h-[120px] sm:max-h-[150px] py-2 sm:py-2.5 px-1 sm:px-2"
        )}
      />

      <div className="flex items-center gap-1 sm:gap-1.5 pb-0.5 sm:pb-1">
        {/* Photo Upload Button */}
        {showPhotoUpload && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePhotoClick}
            disabled={disabled || isAnalyzingPhoto}
            className={cn(
              "h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl transition-all duration-300",
              isAnalyzingPhoto 
                ? "bg-cyan-500/20 text-cyan-600 animate-pulse" 
                : "text-muted-foreground hover:text-cyan-600 hover:bg-cyan-500/10"
            )}
            title="Upload photo for AI analysis"
          >
            {isAnalyzingPhoto ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Video Capture Button */}
        {showVideoCapture && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onVideoClick}
            disabled={disabled || isProcessingVideo}
            className={cn(
              "h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl transition-all duration-300",
              isProcessingVideo 
                ? "bg-red-500/20 text-red-600 animate-pulse" 
                : "text-muted-foreground hover:text-red-600 hover:bg-red-500/10"
            )}
            title="Record video walk-through"
          >
            {isProcessingVideo ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Video className="h-4 w-4" />
            )}
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleListening}
          disabled={disabled}
          className={cn(
            "h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl transition-all duration-300",
            isListening 
              ? "bg-destructive/20 text-destructive hover:bg-destructive/30 animate-pulse" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        <Button
          type="button"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className={cn(
            "h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl p-0 transition-all duration-300",
            "bg-primary hover:bg-primary/90",
            "disabled:opacity-50"
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
