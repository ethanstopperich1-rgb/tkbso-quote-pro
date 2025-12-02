import { useState, useRef, useEffect } from 'react';
import { useEstimator } from '@/contexts/EstimatorContext';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Message } from '@/types/estimator';
import { Button } from '@/components/ui/button';
import { RotateCcw, Sparkles, Loader2, FileDown, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { calculateProjectPricing, TradeBucket, ProjectPricing } from '@/lib/trade-bucket-pricer';
import { Tables } from '@/integrations/supabase/types';
import { Card } from '@/components/ui/card';

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
  content: `**Welcome to Estimaitor** ✨

I'm your AI estimator. Describe your project naturally and I'll create a professional quote.

**Examples:**
- "Master bath remodel, 80 sqft, full gut with tile and glass"
- "Kitchen refresh, 150 sqft, countertops and paint only"

What project would you like to estimate?`,
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
  const { state, updateClientInfo, updateTrades, addRoom, setProjectType, reset } = useEstimator();
  const { contractor, profile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [context, setContext] = useState<ConversationContext>(initialContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [savedEstimateId, setSavedEstimateId] = useState<string | null>(null);
  const [calculatedPricing, setCalculatedPricing] = useState<ProjectPricing | null>(null);
  const [pricingConfig, setPricingConfig] = useState<Tables<'pricing_configs'> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchPricingConfig = async () => {
      if (!contractor?.id) return;
      
      const { data, error } = await supabase
        .from('pricing_configs')
        .select('*')
        .eq('contractor_id', contractor.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching pricing config:', error);
        toast.error('Failed to load pricing configuration');
        return;
      }
      
      if (data) {
        setPricingConfig(data);
      }
    };
    
    fetchPricingConfig();
  }, [contractor?.id]);
  
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

  const generateScopeText = (ctx: ConversationContext, bathScopeLevel: string): string => {
    const lines: string[] = [];
    
    if (ctx.trades.includeDemo !== false) {
      lines.push('**DEMO:**');
      if (ctx.projectType === 'bathroom') {
        lines.push(bathScopeLevel === 'shower_only' 
          ? '• Remove existing shower fixtures, tile, and substrate'
          : '• Remove existing fixtures, tile, vanity, and toilet');
      } else if (ctx.projectType === 'kitchen') {
        lines.push('• Remove existing cabinets, countertops, and appliances');
      }
      lines.push('• Debris removal and disposal');
      lines.push('');
    }
    
    if (ctx.projectType === 'bathroom') {
      lines.push('**FRAMING:**');
      lines.push('• Install blocking for fixtures and accessories');
      lines.push('');
    }
    
    if (ctx.trades.includePlumbing !== false) {
      lines.push('**PLUMBING:**');
      if (ctx.projectType === 'bathroom') {
        lines.push('• Rough-in water supply and drain lines');
        lines.push('• Install shower valve, trim, and fixtures');
        if (bathScopeLevel !== 'shower_only') {
          lines.push('• Set toilet and vanity plumbing');
        }
      } else if (ctx.projectType === 'kitchen') {
        lines.push('• Install sink and faucet');
        lines.push('• Connect dishwasher and disposal');
      }
      lines.push('');
    }
    
    if (ctx.trades.includeTile !== false && ctx.projectType === 'bathroom') {
      lines.push('**TILE WORK:**');
      lines.push('• Install waterproofing system');
      lines.push('• Wall and floor tile installation');
      lines.push('• Grout and seal');
      lines.push('');
    }
    
    if (ctx.trades.includeGlass) {
      lines.push('**SHOWER GLASS:**');
      lines.push('• Frameless glass enclosure');
      lines.push('');
    }
    
    return lines.join('\n');
  };

  const saveEstimateToDatabase = async (ctx: ConversationContext): Promise<string | null> => {
    if (!contractor?.id) {
      toast.error('You must be logged in to save estimates');
      return null;
    }

    try {
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

      let wallTileSqft = 0;
      let showerFloorSqft = 0;
      
      if (ctx.dimensions.showerLength && ctx.dimensions.showerWidth) {
        const height = ctx.dimensions.showerHeight || 8;
        const perimeter = 2 * (ctx.dimensions.showerLength + ctx.dimensions.showerWidth);
        wallTileSqft = perimeter * height;
        showerFloorSqft = ctx.dimensions.showerLength * ctx.dimensions.showerWidth;
      }

      const finalCp = state.recommendedPrice || 0;
      const lowCp = state.lowEstimate || 0;
      const highCp = state.highEstimate || 0;
      const finalIc = state.internalCost || 0;
      const scopeText = generateScopeText(ctx, bathScopeLevel);

      const estimateData = {
        contractor_id: contractor.id,
        created_by_profile_id: profile?.id || null,
        client_name: ctx.clientInfo.name || null,
        client_phone: ctx.clientInfo.phone || null,
        client_email: ctx.clientInfo.email || null,
        property_address: ctx.clientInfo.address || null,
        city: ctx.clientInfo.city || null,
        state: ctx.clientInfo.state || null,
        zip: ctx.clientInfo.zip || null,
        job_label: ctx.clientInfo.name ? `${ctx.clientInfo.name} - ${ctx.projectType || 'Remodel'}` : null,
        client_estimate_text: scopeText,
        has_kitchen: ctx.projectType === 'kitchen',
        has_bathrooms: ctx.projectType === 'bathroom',
        has_closets: false,
        num_kitchens: ctx.projectType === 'kitchen' ? 1 : 0,
        num_bathrooms: ctx.projectType === 'bathroom' ? 1 : 0,
        num_closets: 0,
        total_bathroom_sqft: ctx.dimensions.bathroomSqft || 0,
        total_kitchen_sqft: ctx.dimensions.kitchenSqft || 0,
        bath_wall_tile_sqft: wallTileSqft,
        bath_floor_tile_sqft: 0,
        bath_shower_floor_tile_sqft: showerFloorSqft,
        bath_shower_only_sqft: ctx.scopeLevel === 'shower_only' ? (ctx.dimensions.bathroomSqft || 15) : 0,
        bath_scope_level: bathScopeLevel,
        kitchen_scope_level: kitchenScopeLevel,
        include_demo: ctx.trades.includeDemo ?? true,
        include_plumbing: ctx.trades.includePlumbing ?? true,
        include_electrical: ctx.trades.includeElectrical ?? false,
        include_paint: ctx.trades.includePaint ?? false,
        include_glass: ctx.trades.includeGlass ?? false,
        include_waterproofing: ctx.trades.includeTile ?? true,
        vanity_size: ctx.details.vanitySize || 'none',
        glass_type: ctx.details.glassType || 'none',
        num_recessed_cans: ctx.details.numRecessedCans || 0,
        num_vanity_lights: ctx.details.numVanityLights || 0,
        final_cp_total: finalCp,
        final_ic_total: finalIc,
        low_estimate_cp: lowCp,
        high_estimate_cp: highCp,
        status: 'draft',
      };

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

      toast.success('Estimate saved!');
      return data.id;
    } catch (err) {
      console.error('Exception saving estimate:', err);
      toast.error('Failed to save estimate');
      return null;
    }
  };

  const applyParsedData = (parsed: ParsedProject) => {
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

    if (parsed.projectType === 'kitchen' || parsed.projectType === 'bathroom') {
      setProjectType(parsed.projectType);
    }

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
    if (parsed.trades.includePaint !== null) tradesUpdate.includePaint = parsed.trades.includePaint;
    if (parsed.trades.includeLVP !== null) tradesUpdate.includeLVP = parsed.trades.includeLVP;
    
    if (Object.keys(tradesUpdate).length > 0) {
      updateTrades(tradesUpdate);
    }
  };

  const updateConversationContext = (parsed: ParsedProject): ConversationContext => {
    return {
      clientInfo: {
        ...context.clientInfo,
        ...Object.fromEntries(
          Object.entries(parsed.clientInfo).filter(([_, v]) => v !== null)
        ),
      },
      projectType: parsed.projectType || context.projectType,
      rooms: {
        bathrooms: parsed.rooms.bathrooms || context.rooms.bathrooms,
        kitchens: parsed.rooms.kitchens || context.rooms.kitchens,
      },
      dimensions: {
        ...context.dimensions,
        ...Object.fromEntries(
          Object.entries(parsed.dimensions).filter(([_, v]) => v !== null)
        ),
      },
      scopeLevel: parsed.scopeLevel || context.scopeLevel,
      trades: {
        ...context.trades,
        ...Object.fromEntries(
          Object.entries(parsed.trades).filter(([_, v]) => v !== null)
        ),
      },
      details: {
        ...context.details,
        ...Object.fromEntries(
          Object.entries(parsed.details).filter(([_, v]) => v !== null)
        ),
      },
    };
  };

  const buildTradeBuckets = (ctx: ConversationContext): TradeBucket[] => {
    const buckets: TradeBucket[] = [];
    
    if (!ctx.projectType) return buckets;
    
    const sqft = ctx.projectType === 'bathroom' 
      ? (ctx.dimensions.bathroomSqft || 60)
      : (ctx.dimensions.kitchenSqft || 120);
    
    const showerSqft = (ctx.dimensions.showerLength || 3) * (ctx.dimensions.showerWidth || 5);
    const showerHeight = ctx.dimensions.showerHeight || 8;
    const showerPerimeter = 2 * ((ctx.dimensions.showerLength || 3) + (ctx.dimensions.showerWidth || 5));
    const wallTileSqft = showerPerimeter * showerHeight;
    
    if (ctx.projectType === 'bathroom') {
      if (ctx.trades.includeDemo !== false) {
        if (ctx.scopeLevel === 'shower_only') {
          buckets.push({ category: 'demo', task_description: 'shower_only', quantity: 1, unit: 'each' });
        } else if (sqft > 60) {
          buckets.push({ category: 'demo', task_description: 'large_bath', quantity: 1, unit: 'each' });
        } else {
          buckets.push({ category: 'demo', task_description: 'small_bath', quantity: 1, unit: 'each' });
        }
        buckets.push({ category: 'demo', task_description: 'dumpster_bath', quantity: 1, unit: 'each' });
      }
      
      buckets.push({ category: 'framing', task_description: 'standard', quantity: 1, unit: 'each' });
      
      if (ctx.trades.includePlumbing !== false) {
        buckets.push({ category: 'plumbing', task_description: 'shower_standard', quantity: 1, unit: 'each' });
        if (ctx.scopeLevel !== 'shower_only') {
          buckets.push({ category: 'plumbing', task_description: 'toilet', quantity: 1, unit: 'each' });
        }
      }
      
      if (ctx.trades.includeTile !== false) {
        buckets.push({ category: 'tile', task_description: 'wall', quantity: wallTileSqft, unit: 'sqft' });
        buckets.push({ category: 'tile', task_description: 'shower_floor', quantity: showerSqft, unit: 'sqft' });
        buckets.push({ category: 'waterproofing', task_description: 'standard', quantity: wallTileSqft + showerSqft, unit: 'sqft' });
        if (ctx.scopeLevel !== 'shower_only') {
          buckets.push({ category: 'tile', task_description: 'floor', quantity: sqft - showerSqft, unit: 'sqft' });
        }
      }
      
      if (ctx.trades.includeGlass) {
        const glassType = ctx.details.glassType || 'door_panel';
        if (glassType === 'panel') {
          buckets.push({ category: 'glass', task_description: 'panel_only', quantity: 1, unit: 'each' });
        } else if (glassType === '90_return') {
          buckets.push({ category: 'glass', task_description: '90_return', quantity: 1, unit: 'each' });
        } else {
          buckets.push({ category: 'glass', task_description: 'shower_standard', quantity: 1, unit: 'each' });
        }
      }
      
      if (ctx.trades.includeVanity && ctx.scopeLevel !== 'shower_only') {
        const vanitySize = ctx.details.vanitySize || '48';
        buckets.push({ category: 'vanity', task_description: `bundle_${vanitySize}`, quantity: 1, unit: 'each' });
      }
      
      if (ctx.trades.includeElectrical) {
        if (ctx.details.numRecessedCans) {
          buckets.push({ category: 'electrical', task_description: 'recessed_can', quantity: ctx.details.numRecessedCans, unit: 'each' });
        }
        if (ctx.details.numVanityLights) {
          buckets.push({ category: 'electrical', task_description: 'vanity_light', quantity: ctx.details.numVanityLights, unit: 'each' });
        }
      }
      
      if (ctx.trades.includePaint) {
        buckets.push({ category: 'paint', task_description: 'full_bath', quantity: 1, unit: 'each' });
      }
    }
    
    return buckets;
  };

  const handleSendMessage = async (content: string) => {
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
        body: { 
          message: content,
          conversationContext: context,
          pricingConfig: pricingConfig,
        }
      });

      if (error) throw error;
      
      const parsed = data as ParsedProject;
      
      applyParsedData(parsed);
      
      const newContext = updateConversationContext(parsed);
      setContext(newContext);

      if (parsed.needsMoreInfo && parsed.followUpQuestion) {
        addAssistantMessage(parsed.followUpQuestion);
      } else {
        const tradeBuckets = buildTradeBuckets(newContext);
        
        if (pricingConfig && tradeBuckets.length > 0) {
          const pricing = calculateProjectPricing(tradeBuckets, pricingConfig);
          setCalculatedPricing(pricing);
          
          const estimateId = await saveEstimateToDatabase(newContext);
          if (estimateId) {
            setSavedEstimateId(estimateId);
          }
          
          setIsComplete(true);
          
          const summaryMessage = `**Quote Summary**

**Project:** ${newContext.projectType === 'bathroom' ? 'Bathroom Remodel' : 'Kitchen Remodel'}
${newContext.clientInfo.name ? `**Client:** ${newContext.clientInfo.name}` : ''}
${newContext.dimensions.bathroomSqft ? `**Size:** ${newContext.dimensions.bathroomSqft} sq ft` : ''}

**Estimated Investment:** $${pricing.totals.total_cp.toLocaleString()}

Click below to view details or download PDF.`;
          
          addAssistantMessage(summaryMessage);
        } else {
          addAssistantMessage(parsed.summary || "I've captured the project details. What else would you like to add?");
        }
      }
    } catch (err) {
      console.error('Error processing message:', err);
      addAssistantMessage("I encountered an issue. Could you rephrase your project description?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNew = () => {
    setMessages([WELCOME_MESSAGE]);
    setContext(initialContext);
    setIsComplete(false);
    setSavedEstimateId(null);
    setCalculatedPricing(null);
    reset();
  };

  const handleViewEstimate = () => {
    if (savedEstimateId) {
      navigate(`/estimates/${savedEstimateId}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">AI Estimator</h2>
            <p className="text-xs text-muted-foreground">Describe your project naturally</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStartNew}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          New Quote
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Analyzing project...</span>
          </div>
        )}

        {/* Quote Summary Card */}
        {isComplete && calculatedPricing && (
          <Card className="p-6 bg-accent/5 border-accent/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Quote Ready</h3>
              <span className="text-2xl font-bold text-accent">
                ${calculatedPricing.totals.total_cp.toLocaleString()}
              </span>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleViewEstimate}
                className="flex-1"
                disabled={!savedEstimateId}
              >
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                variant="outline"
                onClick={handleViewEstimate}
                disabled={!savedEstimateId}
              >
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </Card>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={isLoading}
          placeholder="Describe your project..."
        />
      </div>
    </div>
  );
}
