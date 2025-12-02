import { useState, useRef, useEffect } from 'react';
import { useEstimator } from '@/contexts/EstimatorContext';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Message } from '@/types/estimator';
import { Button } from '@/components/ui/button';
import { RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  content: `Welcome to **Estimaitor v2.0** ✨

I'm your AI estimator. Just describe your project naturally and I'll help create a professional quote.

**New:** Click **"Visual Takeoff"** in the header to measure rooms from floor plans!

**Try something like:**
- "Master bath remodel for John Smith, about 80 sqft, full gut with tile and glass"
- "Kitchen refresh at 123 Main St, 150 sqft, countertops and paint only"

Start with any detail and I'll ask follow-ups as needed.`,
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

interface EstimatorChatPanelProps {
  measuredSqft?: number | null;
}

export function EstimatorChatPanel({ measuredSqft }: EstimatorChatPanelProps) {
  const { state, updateClientInfo, updateTrades, addRoom, setProjectType, reset } = useEstimator();
  const { contractor, profile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [context, setContext] = useState<ConversationContext>(initialContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [savedEstimateId, setSavedEstimateId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Update context when measuredSqft changes
  useEffect(() => {
    if (measuredSqft) {
      setContext(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          bathroomSqft: measuredSqft
        }
      }));
      
      addAssistantMessage(`✓ Visual takeoff complete! I've recorded ${measuredSqft.toFixed(0)} sq ft for the bathroom. Please continue describing your project.`);
    }
  }, [measuredSqft]);
  
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

  // Generate scope text for client-facing display
  const generateScopeText = (ctx: ConversationContext, bathScopeLevel: string): string => {
    const lines: string[] = [];
    
    // Demo
    if (ctx.trades.includeDemo !== false) {
      lines.push('DEMO:');
      if (ctx.projectType === 'bathroom') {
        if (bathScopeLevel === 'shower_only') {
          lines.push('• Remove existing shower fixtures, tile, and substrate');
        } else {
          lines.push('• Remove existing fixtures, tile, vanity, and toilet');
        }
      } else if (ctx.projectType === 'kitchen') {
        lines.push('• Remove existing cabinets, countertops, and appliances as needed');
      }
      lines.push('• Protect adjacent areas and flooring');
      lines.push('• Debris removal and disposal');
      lines.push('');
    }
    
    // Framing (bathroom only)
    if (ctx.projectType === 'bathroom') {
      lines.push('FRAMING:');
      lines.push('• Install blocking for shower fixtures and accessories');
      lines.push('• Frame shower niche(s) as needed');
      lines.push('');
    }
    
    // Plumbing
    if (ctx.trades.includePlumbing !== false) {
      lines.push('PLUMBING:');
      if (ctx.projectType === 'bathroom') {
        if (bathScopeLevel === 'shower_only') {
          lines.push('• Rough-in water supply and drain lines for new shower');
          lines.push('• Install shower valve, trim, and showerhead');
          lines.push('• Pressure test and leak verification');
        } else {
          lines.push('• Rough-in water supply and drain lines');
          lines.push('• Install shower valve, trim, and fixtures');
          lines.push('• Set and connect toilet');
          lines.push('• Install vanity plumbing and faucet');
          lines.push('• Final pressure testing and leak check');
        }
      } else if (ctx.projectType === 'kitchen') {
        lines.push('• Install and connect kitchen sink and faucet');
        lines.push('• Connect dishwasher and disposal if included');
        lines.push('• Final pressure testing');
      }
      lines.push('');
    }
    
    // Electrical
    if (ctx.trades.includeElectrical) {
      lines.push('ELECTRICAL:');
      if (ctx.projectType === 'bathroom') {
        if (ctx.details.numRecessedCans) {
          lines.push(`• Install ${ctx.details.numRecessedCans} recessed light(s)`);
        }
        if (ctx.details.numVanityLights) {
          lines.push(`• Install ${ctx.details.numVanityLights} vanity light fixture(s)`);
        }
        lines.push('• Install exhaust fan');
        lines.push('• GFCI outlets per code');
      } else if (ctx.projectType === 'kitchen') {
        lines.push('• Install dedicated circuits as needed');
        lines.push('• Install under-cabinet lighting');
        lines.push('• Connect appliances per code');
      }
      lines.push('');
    }
    
    // Tile Work
    if (ctx.trades.includeTile !== false && ctx.projectType === 'bathroom') {
      lines.push('TILE WORK:');
      lines.push('• Install waterproofing system (Schluter or equivalent)');
      lines.push('• Level and prep substrate as needed');
      lines.push('• Install wall tile in shower/wet areas');
      lines.push('• Install shower floor tile with proper slope to drain');
      if (bathScopeLevel !== 'shower_only') {
        lines.push('• Install bathroom floor tile');
      }
      lines.push('• Grout, clean, and seal all tile');
      lines.push('• Tile material to be supplied by homeowner');
      lines.push('');
    }
    
    // Vanity (full bathroom only)
    if (ctx.trades.includeVanity && bathScopeLevel !== 'shower_only') {
      lines.push('VANITY:');
      if (ctx.details.vanitySize) {
        lines.push(`• Install ${ctx.details.vanitySize}" vanity with top and sink`);
      } else {
        lines.push('• Install vanity with top and sink');
      }
      lines.push('• Install mirror');
      lines.push('• Connect plumbing and faucet');
      lines.push('');
    }
    
    // Glass
    if (ctx.trades.includeGlass) {
      lines.push('SHOWER GLASS:');
      if (ctx.details.glassType === 'panel') {
        lines.push('• Glass panel installation');
      } else if (ctx.details.glassType === '90_return') {
        lines.push('• 90-degree return glass enclosure');
      } else {
        lines.push('• Frameless glass shower enclosure');
      }
      lines.push('• Field measurement after tile completion');
      lines.push('• Custom hardware and seals');
      lines.push('• Professional installation');
      lines.push('');
    }
    
    // Paint
    if (ctx.trades.includePaint) {
      lines.push('PAINTING:');
      lines.push('• Patch and repair drywall as needed');
      lines.push('• Prime and paint walls and ceiling');
      lines.push('• Paint color to be selected by homeowner');
      lines.push('');
    }
    
    return lines.join('\n');
  };

  // Save estimate to database
  const saveEstimateToDatabase = async (ctx: ConversationContext): Promise<string | null> => {
    if (!contractor?.id) {
      console.error('No contractor ID available');
      toast.error('You must be logged in to save estimates');
      return null;
    }

    try {
      // Determine scope level
      let bathScopeLevel = 'none';
      let kitchenScopeLevel = 'none';
      
      if (ctx.projectType === 'bathroom') {
        bathScopeLevel = ctx.scopeLevel === 'shower_only' ? 'shower_only' : 
                         ctx.scopeLevel === 'partial' ? 'partial' : 
                         ctx.scopeLevel === 'refresh' ? 'refresh' : 'full_gut';
      } else if (ctx.projectType === 'kitchen') {
        kitchenScopeLevel = ctx.scopeLevel === 'partial' ? 'partial' : 
                           ctx.scopeLevel === 'refresh' ? 'refresh' : 'full_gut';
      }

      // Calculate tile areas from dimensions if available
      let wallTileSqft = 0;
      let floorTileSqft = 0;
      let showerFloorSqft = 0;
      
      if (ctx.dimensions.showerLength && ctx.dimensions.showerWidth) {
        const height = ctx.dimensions.showerHeight || 8;
        const perimeter = 2 * (ctx.dimensions.showerLength + ctx.dimensions.showerWidth);
        wallTileSqft = perimeter * height;
        showerFloorSqft = ctx.dimensions.showerLength * ctx.dimensions.showerWidth;
      }

      // Use state's calculated pricing if available
      const finalCp = state.recommendedPrice || 0;
      const lowCp = state.lowEstimate || 0;
      const highCp = state.highEstimate || 0;
      const finalIc = state.internalCost || 0;

      // Generate scope text
      const scopeText = generateScopeText(ctx, bathScopeLevel);

      const estimateData = {
        contractor_id: contractor.id,
        created_by_profile_id: profile?.id || null,
        
        // Client info
        client_name: ctx.clientInfo.name || null,
        client_phone: ctx.clientInfo.phone || null,
        client_email: ctx.clientInfo.email || null,
        property_address: ctx.clientInfo.address || null,
        city: ctx.clientInfo.city || null,
        state: ctx.clientInfo.state || null,
        zip: ctx.clientInfo.zip || null,
        job_label: ctx.clientInfo.name ? `${ctx.clientInfo.name} - ${ctx.projectType || 'Remodel'}` : null,
        
        // Scope text for display
        client_estimate_text: scopeText,
        
        // Project type
        has_kitchen: ctx.projectType === 'kitchen',
        has_bathrooms: ctx.projectType === 'bathroom',
        has_closets: false,
        num_kitchens: ctx.projectType === 'kitchen' ? 1 : 0,
        num_bathrooms: ctx.projectType === 'bathroom' ? 1 : 0,
        num_closets: 0,
        
        // Dimensions
        total_bathroom_sqft: ctx.dimensions.bathroomSqft || 0,
        total_kitchen_sqft: ctx.dimensions.kitchenSqft || 0,
        bath_wall_tile_sqft: wallTileSqft,
        bath_floor_tile_sqft: floorTileSqft,
        bath_shower_floor_tile_sqft: showerFloorSqft,
        bath_shower_only_sqft: ctx.scopeLevel === 'shower_only' ? (ctx.dimensions.bathroomSqft || 15) : 0,
        
        // Scope levels
        bath_scope_level: bathScopeLevel,
        kitchen_scope_level: kitchenScopeLevel,
        
        // Trades
        include_demo: ctx.trades.includeDemo ?? true,
        include_plumbing: ctx.trades.includePlumbing ?? true,
        include_electrical: ctx.trades.includeElectrical ?? false,
        include_paint: ctx.trades.includePaint ?? false,
        include_glass: ctx.trades.includeGlass ?? false,
        include_waterproofing: ctx.trades.includeTile ?? true,
        
        // Details
        vanity_size: ctx.details.vanitySize || 'none',
        glass_type: ctx.details.glassType || 'none',
        num_recessed_cans: ctx.details.numRecessedCans || 0,
        num_vanity_lights: ctx.details.numVanityLights || 0,
        
        // Pricing (use state's calculated values)
        final_cp_total: finalCp,
        final_ic_total: finalIc,
        low_estimate_cp: lowCp,
        high_estimate_cp: highCp,
        
        // Status
        status: 'draft',
      };

      console.log('Saving estimate:', estimateData);

      const { data, error } = await supabase
        .from('estimates')
        .insert(estimateData)
        .select('id')
        .single();

      if (error) {
        console.error('Error saving estimate:', error);
        toast.error('Failed to save estimate: ' + error.message);
        return null;
      }

      console.log('Estimate saved with ID:', data.id);
      toast.success('Estimate saved successfully!');
      return data.id;
    } catch (err) {
      console.error('Exception saving estimate:', err);
      toast.error('Failed to save estimate');
      return null;
    }
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
          // Save to database
          const estimateId = await saveEstimateToDatabase(newContext);
          
          if (estimateId) {
            setIsComplete(true);
            setSavedEstimateId(estimateId);
            response += `\n\n✅ **Quote saved!** [View your estimate](/estimates/${estimateId}) or navigate to the **Estimates** page.\n\nType **new** to start another estimate.`;
          } else {
            response += `\n\nI have all the information needed, but there was an issue saving the quote. Please try again or contact support.`;
          }
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
    setSavedEstimateId(null);
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
