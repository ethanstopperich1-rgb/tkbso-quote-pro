import { useState, useRef, useEffect } from 'react';
import { useEstimator, ScopeLevel } from '@/contexts/EstimatorContext';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Message } from '@/types/estimator';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Hi! I'm your TKBSO estimator assistant.\n\nJust describe your project and I'll build a live quote on the right panel. Include:\n\n• **Room type** (bathroom, kitchen, closet)\n• **Size** (sq ft or dimensions)\n• **Scope** (full gut, partial, shower-only)\n\nExample: *"75 sq ft bathroom, full gut, no GC"*`,
  timestamp: new Date(),
};

export function EstimatorChatPanel() {
  const { state, reset, setProjectType, addRoom, setHasGC, setNeedsPermit, setQualityLevel, setLocation, updateClientInfo, setStage } = useEstimator();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const parseAndUpdateState = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Parse project type
    const hasBathroom = /bath(room)?|shower|tub|vanit/i.test(text);
    const hasKitchen = /kitchen/i.test(text);
    const hasCloset = /closet/i.test(text);
    
    if (hasBathroom && hasKitchen) setProjectType('combination');
    else if (hasBathroom) setProjectType('bathroom');
    else if (hasKitchen) setProjectType('kitchen');
    else if (hasCloset) setProjectType('closet');
    
    // Parse square footage
    const sqftMatch = text.match(/(\d+)\s*(sq\.?\s*ft\.?|square\s*feet?|sqft|sf)\b/i);
    const sqft = sqftMatch ? parseInt(sqftMatch[1]) : 0;
    
    // Parse dimensions like 10x8
    const dimMatch = text.match(/(\d+)\s*[xX×]\s*(\d+)/);
    const dimSqft = dimMatch ? parseInt(dimMatch[1]) * parseInt(dimMatch[2]) : 0;
    const finalSqft = sqft || dimSqft;
    
    // Parse scope
    const isShowerOnly = /shower[\s-]?only|just\s+(the\s+)?shower/i.test(text);
    const isRefresh = /refresh|cosmetic|light\s+update/i.test(lowerText);
    const isPartial = /partial|some\s+work|limited/i.test(lowerText);
    
    let scopeLevel: ScopeLevel = 'full_gut';
    if (isShowerOnly) scopeLevel = 'shower_only';
    else if (isRefresh) scopeLevel = 'refresh';
    else if (isPartial) scopeLevel = 'partial';
    
    // GC/Permit
    if (/\b(with|have|using|yes)\b.*\b(gc|contractor)\b/i.test(lowerText)) setHasGC(true);
    if (/\b(no|without)\b.*\b(gc|contractor)\b/i.test(lowerText)) setHasGC(false);
    if (/permit/i.test(lowerText)) setNeedsPermit(true);
    
    // Quality
    if (/high[\s-]?end|premium|luxury|custom/i.test(lowerText)) setQualityLevel('high-end');
    else if (/basic|budget|simple|builder/i.test(lowerText)) setQualityLevel('basic');
    
    // Location
    const locationMatch = text.match(/in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:,?\s*[A-Z]{2})?)/i);
    if (locationMatch) setLocation(locationMatch[1]);
    
    // Add room if we have enough data
    if (finalSqft > 0) {
      const roomType = hasKitchen && !hasBathroom ? 'kitchen' : 
                       hasCloset && !hasBathroom && !hasKitchen ? 'closet' : 'bathroom';
      addRoom({
        type: roomType,
        name: roomType.charAt(0).toUpperCase() + roomType.slice(1),
        sqft: finalSqft,
        scopeLevel,
      });
      
      // Move to confirming stage
      if (state.stage === 'collecting') {
        setStage('confirming');
      }
    }
    
    // Parse client info (Stage 3)
    if (state.stage === 'client_details') {
      // Name
      const nameMatch = text.match(/(?:name(?:\s+is)?|client|customer|for)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+(?:and|&)\s+)?[A-Z][a-z]*(?:\s+[A-Z][a-z]+)?)/i);
      if (nameMatch) updateClientInfo({ name: nameMatch[1].trim() });
      
      // Simple name (just words starting with caps)
      if (!nameMatch && text.length < 50) {
        const words = text.trim().split(/\s+/);
        if (words.length <= 4 && words.every(w => /^[A-Z]/i.test(w))) {
          updateClientInfo({ name: text.trim() });
        }
      }
      
      // Phone
      const phoneMatch = text.match(/(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/);
      if (phoneMatch) updateClientInfo({ phone: phoneMatch[1] });
      
      // Email
      const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) updateClientInfo({ email: emailMatch[1] });
      
      // Address
      const addressMatch = text.match(/(\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Way|Court|Ct|Boulevard|Blvd|Circle|Cir|Place|Pl)\.?)/i);
      if (addressMatch) updateClientInfo({ address: addressMatch[1].trim() });
      
      // City, State, ZIP
      const cityStateZip = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)?/);
      if (cityStateZip) {
        updateClientInfo({ 
          city: cityStateZip[1], 
          state: cityStateZip[2],
          zip: cityStateZip[3] || undefined,
        });
      }
    }
  };
  
  const generateResponse = (): string => {
    const { stage, rooms, clientInfo } = state;
    
    if (stage === 'collecting') {
      if (rooms.length === 0) {
        return "I need a bit more info. What's the room size in square feet, and is this a full gut or partial remodel?";
      }
      return "Got it! I've updated the quote panel on the right. Review the assumptions and click **Confirm Assumptions** when ready.";
    }
    
    if (stage === 'confirming') {
      return "Great! Review the project details in the panel and click **Confirm Assumptions** to proceed. You can also edit any values directly on the right.";
    }
    
    if (stage === 'client_details') {
      const missing: string[] = [];
      if (!clientInfo.name) missing.push('client name');
      if (!clientInfo.address) missing.push('property address');
      if (!clientInfo.city || !clientInfo.state) missing.push('city/state');
      
      if (missing.length > 0) {
        return `Almost there! I still need: **${missing.join(', ')}**\n\nYou can type it here or fill in the form on the right.`;
      }
      return "Client info complete! Click **Generate Quote** to create your client-ready proposal.";
    }
    
    if (stage === 'complete') {
      return "Your quote is ready! Download the PDF or save it to your account. Need to start a new quote? Click the reset button below.";
    }
    
    return "How can I help with your project?";
  };
  
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
    
    // Parse and update state
    parseAndUpdateState(content);
    
    // Simulate thinking
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));
    
    // Generate response
    const response = generateResponse();
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };
  
  const handleReset = () => {
    reset();
    setMessages([WELCOME_MESSAGE]);
  };
  
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
        <div>
          <h2 className="font-display font-semibold text-foreground">Project Chat</h2>
          <p className="text-xs text-muted-foreground">Describe your project • AI builds your quote</p>
        </div>
        {messages.length > 1 && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-foreground">TK</span>
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isTyping}
        placeholder={
          state.stage === 'client_details' 
            ? "Enter client name, address, phone, email..." 
            : "Describe your project..."
        }
      />
    </div>
  );
}
