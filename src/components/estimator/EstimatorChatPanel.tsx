import { useState, useRef, useEffect } from 'react';
import { useEstimator } from '@/contexts/EstimatorContext';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Message } from '@/types/estimator';
import { Button } from '@/components/ui/button';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Step definitions for the guided flow
type ChatStep = 
  | 'client_name'
  | 'client_phone'
  | 'client_email'
  | 'client_address'
  | 'project_type'
  | 'bathroom_size'
  | 'bathroom_scope'
  | 'include_demo'
  | 'include_plumbing'
  | 'include_tile'
  | 'include_glass'
  | 'include_vanity'
  | 'vanity_size'
  | 'include_electrical'
  | 'include_paint'
  | 'kitchen_size'
  | 'kitchen_scope'
  | 'include_countertops'
  | 'include_cabinets'
  | 'summary'
  | 'complete';

interface ChatState {
  step: ChatStep;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  projectType: 'bathroom' | 'kitchen' | null;
  roomSqft: number;
  scopeLevel: string;
  includeDemo: boolean;
  includePlumbing: boolean;
  includeTile: boolean;
  includeGlass: boolean;
  includeVanity: boolean;
  vanitySize: string;
  includeElectrical: boolean;
  includePaint: boolean;
  includeCountertops: boolean;
  includeCabinets: boolean;
}

const initialChatState: ChatState = {
  step: 'client_name',
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  clientAddress: '',
  projectType: null,
  roomSqft: 0,
  scopeLevel: 'full_gut',
  includeDemo: true,
  includePlumbing: true,
  includeTile: true,
  includeGlass: false,
  includeVanity: false,
  vanitySize: 'none',
  includeElectrical: false,
  includePaint: false,
  includeCountertops: false,
  includeCabinets: false,
};

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Welcome to the TKBSO Estimator! 👋\n\nI'll walk you through creating a quote step by step.\n\nLet's start with the basics:\n\n**What is the client's name?**`,
  timestamp: new Date(),
};

export function EstimatorChatPanel() {
  const { updateClientInfo, updateTrades, addRoom, setProjectType, reset } = useEstimator();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [chatState, setChatState] = useState<ChatState>(initialChatState);
  const [isTyping, setIsTyping] = useState(false);
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

  const processStep = (userInput: string, currentStep: ChatStep): { nextStep: ChatStep; response: string } => {
    const input = userInput.trim();
    const lowerInput = input.toLowerCase();
    
    switch (currentStep) {
      case 'client_name':
        if (input.length < 2) {
          return { nextStep: 'client_name', response: "Please enter a valid name for the client." };
        }
        setChatState(prev => ({ ...prev, clientName: input }));
        updateClientInfo({ name: input });
        return { 
          nextStep: 'client_phone', 
          response: `Great, working with **${input}**!\n\n**What is their phone number?**\n\n_(You can type "skip" if you don't have it)_` 
        };

      case 'client_phone':
        if (lowerInput !== 'skip') {
          const phoneMatch = input.match(/(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/);
          if (phoneMatch) {
            setChatState(prev => ({ ...prev, clientPhone: phoneMatch[1] }));
            updateClientInfo({ phone: phoneMatch[1] });
          }
        }
        return { 
          nextStep: 'client_email', 
          response: `**What is their email address?**\n\n_(You can type "skip" if you don't have it)_` 
        };

      case 'client_email':
        if (lowerInput !== 'skip') {
          const emailMatch = input.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (emailMatch) {
            setChatState(prev => ({ ...prev, clientEmail: emailMatch[1] }));
            updateClientInfo({ email: emailMatch[1] });
          }
        }
        return { 
          nextStep: 'client_address', 
          response: `**What is the property address?**\n\n_(Enter the full address or type "skip")_` 
        };

      case 'client_address':
        if (lowerInput !== 'skip' && input.length > 5) {
          setChatState(prev => ({ ...prev, clientAddress: input }));
          updateClientInfo({ address: input });
        }
        return { 
          nextStep: 'project_type', 
          response: `Perfect! Now let's talk about the project.\n\n**Is this a Kitchen or Bathroom remodel?**\n\nType **kitchen** or **bathroom**` 
        };

      case 'project_type':
        if (lowerInput.includes('kitchen')) {
          setChatState(prev => ({ ...prev, projectType: 'kitchen' }));
          setProjectType('kitchen');
          return { 
            nextStep: 'kitchen_size', 
            response: `🍳 **Kitchen remodel** - got it!\n\n**What is the kitchen size in square feet?**\n\n_(Example: 150 sqft or 12x12)_` 
          };
        } else if (lowerInput.includes('bath')) {
          setChatState(prev => ({ ...prev, projectType: 'bathroom' }));
          setProjectType('bathroom');
          return { 
            nextStep: 'bathroom_size', 
            response: `🚿 **Bathroom remodel** - got it!\n\n**What is the bathroom size in square feet?**\n\n_(Example: 75 sqft or 8x10)_` 
          };
        }
        return { nextStep: 'project_type', response: "Please type **kitchen** or **bathroom** to continue." };

      case 'bathroom_size':
      case 'kitchen_size': {
        let sqft = 0;
        const sqftMatch = input.match(/(\d+)\s*(sq\.?\s*ft\.?|square\s*feet?|sqft|sf)?\b/i);
        const dimMatch = input.match(/(\d+)\s*[xX×]\s*(\d+)/);
        
        if (dimMatch) {
          sqft = parseInt(dimMatch[1]) * parseInt(dimMatch[2]);
        } else if (sqftMatch) {
          sqft = parseInt(sqftMatch[1]);
        }
        
        if (sqft < 10) {
          return { nextStep: currentStep, response: "Please enter a valid size. Example: **75 sqft** or **8x10**" };
        }
        
        setChatState(prev => ({ ...prev, roomSqft: sqft }));
        
        if (chatState.projectType === 'bathroom') {
          return { 
            nextStep: 'bathroom_scope', 
            response: `Got it - **${sqft} square feet**.\n\n**What's the scope of work?**\n\n• **Full gut** - complete tear-out and rebuild\n• **Shower only** - just the shower area\n• **Partial** - some updates, not everything\n• **Refresh** - cosmetic updates only\n\nType your choice:` 
          };
        } else {
          return { 
            nextStep: 'kitchen_scope', 
            response: `Got it - **${sqft} square feet**.\n\n**What's the scope of work?**\n\n• **Full gut** - complete tear-out and rebuild\n• **Partial** - cabinets/counters only\n• **Refresh** - cosmetic updates only\n\nType your choice:` 
          };
        }
      }

      case 'bathroom_scope': {
        let scope = 'full_gut';
        if (lowerInput.includes('shower')) scope = 'shower_only';
        else if (lowerInput.includes('partial')) scope = 'partial';
        else if (lowerInput.includes('refresh') || lowerInput.includes('cosmetic')) scope = 'refresh';
        
        setChatState(prev => ({ ...prev, scopeLevel: scope }));
        return { 
          nextStep: 'include_demo', 
          response: `**${scope.replace('_', ' ').toUpperCase()}** scope selected.\n\nNow let's go through the trades:\n\n**Include demolition & site prep?**\n\n_(yes/no)_` 
        };
      }

      case 'kitchen_scope': {
        let scope = 'full_gut';
        if (lowerInput.includes('partial')) scope = 'partial';
        else if (lowerInput.includes('refresh') || lowerInput.includes('cosmetic')) scope = 'refresh';
        
        setChatState(prev => ({ ...prev, scopeLevel: scope }));
        return { 
          nextStep: 'include_demo', 
          response: `**${scope.replace('_', ' ').toUpperCase()}** scope selected.\n\nNow let's go through the trades:\n\n**Include demolition & site prep?**\n\n_(yes/no)_` 
        };
      }

      case 'include_demo': {
        const include = lowerInput.includes('yes') || lowerInput === 'y';
        setChatState(prev => ({ ...prev, includeDemo: include }));
        updateTrades({ includeDemo: include, includeDumpster: include });
        return { 
          nextStep: 'include_plumbing', 
          response: `Demo: **${include ? 'Yes' : 'No'}** ✓\n\n**Include plumbing work?**\n\n_(yes/no)_` 
        };
      }

      case 'include_plumbing': {
        const include = lowerInput.includes('yes') || lowerInput === 'y';
        setChatState(prev => ({ ...prev, includePlumbing: include }));
        updateTrades({ includePlumbing: include });
        return { 
          nextStep: 'include_tile', 
          response: `Plumbing: **${include ? 'Yes' : 'No'}** ✓\n\n**Include tile work?**\n\n_(yes/no)_` 
        };
      }

      case 'include_tile': {
        const include = lowerInput.includes('yes') || lowerInput === 'y';
        setChatState(prev => ({ ...prev, includeTile: include }));
        updateTrades({ includeTile: include, includeCementBoard: include, includeWaterproofing: include });
        
        if (chatState.projectType === 'bathroom') {
          return { 
            nextStep: 'include_glass', 
            response: `Tile: **${include ? 'Yes' : 'No'}** ✓\n\n**Include glass enclosure?**\n\n_(yes/no)_` 
          };
        } else {
          return { 
            nextStep: 'include_countertops', 
            response: `Tile: **${include ? 'Yes' : 'No'}** ✓\n\n**Include countertops (quartz)?**\n\n_(yes/no)_` 
          };
        }
      }

      case 'include_glass': {
        const include = lowerInput.includes('yes') || lowerInput === 'y';
        setChatState(prev => ({ ...prev, includeGlass: include }));
        updateTrades({ includeGlass: include, glassType: include ? 'standard' : 'none' });
        return { 
          nextStep: 'include_vanity', 
          response: `Glass: **${include ? 'Yes' : 'No'}** ✓\n\n**Include vanity & countertop?**\n\n_(yes/no)_` 
        };
      }

      case 'include_vanity': {
        const include = lowerInput.includes('yes') || lowerInput === 'y';
        setChatState(prev => ({ ...prev, includeVanity: include }));
        updateTrades({ includeVanity: include });
        
        if (include) {
          return { 
            nextStep: 'vanity_size', 
            response: `Vanity: **Yes** ✓\n\n**What size vanity?**\n\n• 30" Single\n• 36" Single\n• 48" Single\n• 54" Single\n• 60" Double\n• 72" Double\n• 84" Double\n\nType the size (e.g., **48** or **60 double**):` 
          };
        }
        return { 
          nextStep: 'include_electrical', 
          response: `Vanity: **No** ✓\n\n**Include electrical work?**\n\n_(yes/no)_` 
        };
      }

      case 'vanity_size': {
        let size = '48';
        if (input.includes('30')) size = '30';
        else if (input.includes('36')) size = '36';
        else if (input.includes('48')) size = '48';
        else if (input.includes('54')) size = '54';
        else if (input.includes('60')) size = '60';
        else if (input.includes('72')) size = '72';
        else if (input.includes('84')) size = '84';
        
        setChatState(prev => ({ ...prev, vanitySize: size }));
        updateTrades({ vanitySize: size as any });
        return { 
          nextStep: 'include_electrical', 
          response: `Vanity size: **${size}"** ✓\n\n**Include electrical work?**\n\n_(yes/no)_` 
        };
      }

      case 'include_countertops': {
        const include = lowerInput.includes('yes') || lowerInput === 'y';
        setChatState(prev => ({ ...prev, includeCountertops: include }));
        updateTrades({ includeCountertops: include });
        return { 
          nextStep: 'include_cabinets', 
          response: `Countertops: **${include ? 'Yes' : 'No'}** ✓\n\n**Include cabinet work?**\n\n_(yes/no)_` 
        };
      }

      case 'include_cabinets': {
        const include = lowerInput.includes('yes') || lowerInput === 'y';
        setChatState(prev => ({ ...prev, includeCabinets: include }));
        updateTrades({ includeCabinetry: include });
        return { 
          nextStep: 'include_electrical', 
          response: `Cabinets: **${include ? 'Yes' : 'No'}** ✓\n\n**Include electrical work?**\n\n_(yes/no)_` 
        };
      }

      case 'include_electrical': {
        const include = lowerInput.includes('yes') || lowerInput === 'y';
        setChatState(prev => ({ ...prev, includeElectrical: include }));
        updateTrades({ includeElectrical: include });
        return { 
          nextStep: 'include_paint', 
          response: `Electrical: **${include ? 'Yes' : 'No'}** ✓\n\n**Include painting?**\n\n_(yes/no)_` 
        };
      }

      case 'include_paint': {
        const include = lowerInput.includes('yes') || lowerInput === 'y';
        setChatState(prev => ({ ...prev, includePaint: include }));
        updateTrades({ includePainting: include, paintType: include ? 'full' : 'none' });
        
        // Add the room to the estimator context
        addRoom({
          type: chatState.projectType || 'bathroom',
          name: chatState.projectType === 'kitchen' ? 'Kitchen' : 'Bathroom',
          sqft: chatState.roomSqft,
          scopeLevel: chatState.scopeLevel as any,
        });
        
        return { 
          nextStep: 'summary', 
          response: `Painting: **${include ? 'Yes' : 'No'}** ✓\n\n---\n\n## Project Summary\n\n**Client:** ${chatState.clientName}\n**Project:** ${chatState.projectType?.toUpperCase()} REMODEL\n**Size:** ${chatState.roomSqft} sqft\n**Scope:** ${chatState.scopeLevel.replace('_', ' ')}\n\n**Included Trades:**\n${chatState.includeDemo ? '✓ Demo & Haul Away\n' : ''}${chatState.includePlumbing ? '✓ Plumbing\n' : ''}${chatState.includeTile ? '✓ Tile & Waterproofing\n' : ''}${chatState.includeGlass ? '✓ Glass Enclosure\n' : ''}${chatState.includeVanity ? `✓ Vanity (${chatState.vanitySize}")\n` : ''}${chatState.includeCountertops ? '✓ Countertops\n' : ''}${chatState.includeCabinets ? '✓ Cabinets\n' : ''}${chatState.includeElectrical ? '✓ Electrical\n' : ''}${include ? '✓ Painting\n' : ''}\n\nType **confirm** to generate quote or **restart** to start over.` 
        };
      }

      case 'summary':
        if (lowerInput === 'confirm' || lowerInput.includes('yes')) {
          return { 
            nextStep: 'complete', 
            response: `🎉 **Quote created successfully!**\n\nYour estimate has been saved and is ready for review.\n\nTo view and download the quote PDF, navigate to the **Estimates** page.\n\nType **new** to start a new estimate.` 
          };
        } else if (lowerInput === 'restart' || lowerInput.includes('start over')) {
          return { nextStep: 'client_name', response: WELCOME_MESSAGE.content };
        }
        return { nextStep: 'summary', response: "Type **confirm** to generate quote or **restart** to start over." };

      case 'complete':
        if (lowerInput === 'new' || lowerInput.includes('new')) {
          setChatState(initialChatState);
          return { nextStep: 'client_name', response: WELCOME_MESSAGE.content };
        }
        return { nextStep: 'complete', response: "Type **new** to start a new estimate." };

      default:
        return { nextStep: 'client_name', response: "Let's start over. What is the client's name?" };
    }
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
    
    // Simulate thinking
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300));
    
    // Process the step
    const { nextStep, response } = processStep(content, chatState.step);
    setChatState(prev => ({ ...prev, step: nextStep }));
    
    addAssistantMessage(response);
    setIsTyping(false);
  };
  
  const handleReset = () => {
    reset();
    setChatState(initialChatState);
    setMessages([WELCOME_MESSAGE]);
  };

  // Progress indicator
  const getProgress = () => {
    const steps: ChatStep[] = [
      'client_name', 'client_phone', 'client_email', 'client_address', 
      'project_type', 'bathroom_size', 'bathroom_scope', 'include_demo',
      'include_plumbing', 'include_tile', 'include_glass', 'include_vanity',
      'include_electrical', 'include_paint', 'summary', 'complete'
    ];
    const currentIndex = steps.indexOf(chatState.step);
    return Math.round((currentIndex / (steps.length - 1)) * 100);
  };
  
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-foreground">TKBSO Estimator</h2>
            <p className="text-xs text-muted-foreground">Guided quote builder</p>
          </div>
          {messages.length > 1 && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
              <RotateCcw className="w-4 h-4 mr-1" />
              Start Over
            </Button>
          )}
        </div>
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{getProgress()}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>
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
      <div className="border-t p-4 bg-card">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isTyping}
          placeholder={
            chatState.step === 'client_name' ? "Enter client name..." :
            chatState.step === 'project_type' ? "Type kitchen or bathroom..." :
            chatState.step === 'summary' ? "Type confirm or restart..." :
            "Type your answer..."
          }
        />
      </div>
    </div>
  );
}
