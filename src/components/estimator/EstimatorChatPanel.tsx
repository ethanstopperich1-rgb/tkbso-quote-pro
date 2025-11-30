import { useState, useRef, useEffect } from 'react';
import { useEstimator } from '@/contexts/EstimatorContext';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Message } from '@/types/estimator';
import { Button } from '@/components/ui/button';
import { RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ParsedProject {
  clientInfo: {
    name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
  projectType: 'kitchen' | 'bathroom' | 'both' | null;
  rooms: {
    bathrooms: number;
    kitchens: number;
  };
  dimensions: {
    bathroomSqft: number | null;
    kitchenSqft: number | null;
    showerLength: number | null;
    showerWidth: number | null;
    showerHeight: number | null;
  };
  scopeLevel: 'full' | 'partial' | 'refresh' | 'shower_only' | null;
  trades: {
    includeDemo: boolean | null;
    includePlumbing: boolean | null;
    includeTile: boolean | null;
    includeGlass: boolean | null;
    includeVanity: boolean | null;
    includeCountertops: boolean | null;
    includeCabinets: boolean | null;
    includeElectrical: boolean | null;
    includePaint: boolean | null;
    includeLVP: boolean | null;
  };
  details: {
    vanitySize: '30' | '36' | '48' | '54' | '60' | '72' | '84' | null;
    glassType: 'panel' | 'door_panel' | '90_return' | 'frameless' | null;
    hasNiche: boolean | null;
    hasBench: boolean | null;
    numRecessedCans: number | null;
    numVanityLights: number | null;
    lvpSqft: number | null;
  };
  needsMoreInfo: boolean;
  followUpQuestion: string | null;
  summary: string;
}

interface ConversationContext {
  clientInfo: Partial<ParsedProject['clientInfo']>;
  projectType: string | null;
  rooms: ParsedProject['rooms'];
  dimensions: Partial<ParsedProject['dimensions']>;
  scopeLevel: string | null;
  trades: Partial<ParsedProject['trades']>;
  details: Partial<ParsedProject['details']>;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Welcome to the TKBSO Estimator! ✨

I can understand natural language, so just describe your project and I'll help create a quote.

**Try something like:**
- "Master bath remodel for John Smith, about 80 sqft, full gut with tile, glass, and new vanity"
- "Kitchen refresh for the Johnsons at 123 Main St, 150 sqft, just countertops and paint"

Or start simple and I'll ask follow-up questions!`,
  timestamp: new Date(),
};

const initialContext: ConversationContext = {
  clientInfo: {},
  projectType: null,
  rooms: { bathrooms: 0, kitchens: 0 },
  dimensions: {},
  scopeLevel: null,
  trades: {},
  details: {},
};

export function EstimatorChatPanel() {
  const { updateClientInfo, updateTrades, addRoom, setProjectType, reset } = useEstimator();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [context, setContext] = useState<ConversationContext>(initialContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addAssistantMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const applyParsedData = (parsed: ParsedProject) => {
    // Update client info
    if (parsed.clientInfo.name || parsed.clientInfo.phone || parsed.clientInfo.email || parsed.clientInfo.address) {
      updateClientInfo({
        name: parsed.clientInfo.name || undefined,
        phone: parsed.clientInfo.phone || undefined,
        email: parsed.clientInfo.email || undefined,
        address: parsed.clientInfo.address || undefined,
        city: parsed.clientInfo.city || undefined,
        state: parsed.clientInfo.state || undefined,
        zip: parsed.clientInfo.zip || undefined,
      });
    }

    // Update project type
    if (parsed.projectType === 'kitchen' || parsed.projectType === 'bathroom') {
      setProjectType(parsed.projectType);
    }

    // Update trades
    const tradesUpdate: Record<string, any> = {};
    if (parsed.trades.includeDemo !== null) tradesUpdate.includeDemo = parsed.trades.includeDemo;
    if (parsed.trades.includePlumbing !== null) tradesUpdate.includePlumbing = parsed.trades.includePlumbing;
    if (parsed.trades.includeTile !== null) {
      tradesUpdate.includeTile = parsed.trades.includeTile;
      tradesUpdate.includeCementBoard = parsed.trades.includeTile;
      tradesUpdate.includeWaterproofing = parsed.trades.includeTile;
    }
    if (parsed.trades.includeGlass !== null) tradesUpdate.includeGlass = parsed.trades.includeGlass;
    if (parsed.trades.includeVanity !== null) tradesUpdate.includeVanity = parsed.trades.includeVanity;
    if (parsed.trades.includeCountertops !== null) tradesUpdate.includeCountertops = parsed.trades.includeCountertops;
    if (parsed.trades.includeCabinets !== null) tradesUpdate.includeCabinetry = parsed.trades.includeCabinets;
    if (parsed.trades.includeElectrical !== null) tradesUpdate.includeElectrical = parsed.trades.includeElectrical;
    if (parsed.trades.includePaint !== null) {
      tradesUpdate.includePainting = parsed.trades.includePaint;
      tradesUpdate.paintType = parsed.trades.includePaint ? 'full' : 'none';
    }
    if (parsed.trades.includeLVP !== null) tradesUpdate.includeLVP = parsed.trades.includeLVP;
    
    // Update details
    if (parsed.details.vanitySize) tradesUpdate.vanitySize = parsed.details.vanitySize;
    if (parsed.details.glassType) tradesUpdate.glassType = parsed.details.glassType;
    if (parsed.details.numRecessedCans) tradesUpdate.numRecessedCans = parsed.details.numRecessedCans;
    if (parsed.details.numVanityLights) tradesUpdate.numVanityLights = parsed.details.numVanityLights;
    if (parsed.details.lvpSqft) tradesUpdate.lvpSqft = parsed.details.lvpSqft;
    
    if (Object.keys(tradesUpdate).length > 0) {
      updateTrades(tradesUpdate);
    }

    // Add rooms
    if (parsed.projectType === 'bathroom' && parsed.dimensions.bathroomSqft) {
      addRoom({
        type: 'bathroom',
        name: 'Bathroom',
        sqft: parsed.dimensions.bathroomSqft,
        scopeLevel: (parsed.scopeLevel as any) || 'full_gut',
      });
    } else if (parsed.projectType === 'kitchen' && parsed.dimensions.kitchenSqft) {
      addRoom({
        type: 'kitchen',
        name: 'Kitchen',
        sqft: parsed.dimensions.kitchenSqft,
        scopeLevel: (parsed.scopeLevel as any) || 'full_gut',
      });
    }
  };

  const mergeContext = (parsed: ParsedProject): ConversationContext => {
    return {
      clientInfo: { ...context.clientInfo, ...Object.fromEntries(Object.entries(parsed.clientInfo).filter(([_, v]) => v !== null)) },
      projectType: parsed.projectType || context.projectType,
      rooms: {
        bathrooms: parsed.rooms.bathrooms || context.rooms.bathrooms,
        kitchens: parsed.rooms.kitchens || context.rooms.kitchens,
      },
      dimensions: { ...context.dimensions, ...Object.fromEntries(Object.entries(parsed.dimensions).filter(([_, v]) => v !== null)) },
      scopeLevel: parsed.scopeLevel || context.scopeLevel,
      trades: { ...context.trades, ...Object.fromEntries(Object.entries(parsed.trades).filter(([_, v]) => v !== null)) },
      details: { ...context.details, ...Object.fromEntries(Object.entries(parsed.details).filter(([_, v]) => v !== null)) },
    };
  };

  const handleSendMessage = async (content: string) => {
    // Check for reset commands
    const lowerContent = content.toLowerCase().trim();
    if (lowerContent === 'new' || lowerContent === 'restart' || lowerContent === 'start over') {
      handleReset();
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('parse-project', {
        body: { message: content, context },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to process your message');
      }

      const parsed = data as ParsedProject;
      
      // Merge new data with existing context
      const newContext = mergeContext(parsed);
      setContext(newContext);

      // Apply the parsed data to the estimator
      applyParsedData(parsed);

      // Build response message
      let response = parsed.summary;
      
      if (parsed.needsMoreInfo && parsed.followUpQuestion) {
        response += `\n\n${parsed.followUpQuestion}`;
      } else if (!parsed.needsMoreInfo) {
        // Check if we have enough info to generate a quote
        const hasClientName = newContext.clientInfo.name;
        const hasProjectType = newContext.projectType;
        const hasDimensions = newContext.dimensions.bathroomSqft || newContext.dimensions.kitchenSqft;
        
        if (hasClientName && hasProjectType && hasDimensions) {
          setIsComplete(true);
          response += `\n\n✅ **Quote created!** Navigate to the **Estimates** page to view and download the PDF.\n\nType **new** to start another estimate.`;
        } else {
          // Ask for missing critical info
          if (!hasClientName) {
            response += `\n\nWhat is the client's name?`;
          } else if (!hasProjectType) {
            response += `\n\nIs this a **kitchen** or **bathroom** remodel?`;
          } else if (!hasDimensions) {
            response += `\n\nWhat is the room size in square feet?`;
          }
        }
      }

      addAssistantMessage(response);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      
      if (errorMessage.includes('Rate limit')) {
        toast.error('Rate limit reached. Please wait a moment and try again.');
      } else {
        toast.error('Failed to process message');
      }
      
      addAssistantMessage("I had trouble understanding that. Could you try rephrasing? For example:\n\n\"Full bathroom remodel for John Smith, 75 sqft, includes tile, glass, and vanity\"");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    reset();
    setContext(initialContext);
    setMessages([WELCOME_MESSAGE]);
    setIsComplete(false);
  };

  const getPlaceholder = () => {
    if (isComplete) return "Type 'new' to start another estimate...";
    if (!context.clientInfo.name) return "Describe your project (e.g., 'Master bath remodel for John Smith...')";
    if (!context.projectType) return "Is this a kitchen or bathroom remodel?";
    return "Add more details or ask questions...";
  };
  
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-display font-semibold text-foreground">TKBSO AI Estimator</h2>
              <p className="text-xs text-muted-foreground">Describe your project naturally</p>
            </div>
          </div>
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Start Over
            </Button>
          )}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Analyzing your project...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading}
        placeholder={getPlaceholder()}
      />
    </div>
  );
}
