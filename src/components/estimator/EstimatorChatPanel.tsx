import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Message } from '@/types/estimator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, Sparkles, Loader2, FileDown, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface PricingLineItem {
  category: string;
  task_description: string;
  quantity: number;
  unit: string;
  ic_per_unit: number;
  cp_per_unit: number;
  ic_total: number;
  cp_total: number;
  margin_percent: number;
}

interface EstimateResponse {
  project_header: {
    client_name?: string | null;
    project_type: string;
    overall_size_sqft?: number | null;
  };
  dimensions: {
    ceiling_height_ft: number;
    room_length_ft?: number | null;
    room_width_ft?: number | null;
    shower_floor_sqft?: number | null;
    shower_wall_sqft?: number | null;
    main_floor_sqft?: number | null;
  };
  trade_buckets: Array<{
    category: string;
    task_description: string;
    quantity: number;
    unit: string;
  }>;
  pricing: {
    line_items: PricingLineItem[];
    totals: {
      total_ic: number;
      total_cp: number;
      low_estimate: number;
      high_estimate: number;
      overall_margin_percent: number;
    };
    warnings: string[];
  };
  payment_schedule: {
    deposit: number;
    progress: number;
    final: number;
  };
  allowances: Array<{ item: string; quantity: number; notes?: string }>;
  exclusions: string[];
  warnings: string[];
  // Conversation states
  error?: string;
  needsMoreInfo?: boolean;
  followUpQuestion?: string;
  parsed?: {
    project_type?: string | null;
    scope?: Record<string, string | null>;
    dimensions?: Record<string, number | null>;
    missing?: string[];
  };
}

interface ConversationContext {
  projectType?: string;
  scope?: Record<string, string | null>;
  dimensions?: Record<string, number | null>;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Hey! What project are we estimating today?

**Kitchen** or **Bathroom**?`,
  timestamp: new Date(),
};

export function EstimatorChatPanel() {
  const { contractor, profile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [context, setContext] = useState<ConversationContext>({});
  const [isLoading, setIsLoading] = useState(false);
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
  const [savedEstimateId, setSavedEstimateId] = useState<string | null>(null);
  const [showLineItems, setShowLineItems] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, estimate]);

  const addAssistantMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
    
    // Add to conversation history for AI context
    setConversationHistory(prev => [...prev, { role: 'assistant', content }]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const saveEstimateToDatabase = async (data: EstimateResponse, chatHistory: ConversationMessage[]): Promise<string | null> => {
    if (!contractor?.id) {
      toast.error('You must be logged in to save estimates');
      return null;
    }

    try {
      // Include conversation history in the payload
      const payloadWithHistory = {
        ...data,
        conversation_history: chatHistory,
      };

      const estimateData = {
        contractor_id: contractor.id,
        created_by_profile_id: profile?.id || null,
        job_label: `${data.project_header.project_type} Remodel`,
        has_kitchen: data.project_header.project_type === 'Kitchen',
        has_bathrooms: data.project_header.project_type === 'Bathroom',
        total_bathroom_sqft: data.project_header.project_type === 'Bathroom' 
          ? (data.project_header.overall_size_sqft || 0) : 0,
        total_kitchen_sqft: data.project_header.project_type === 'Kitchen' 
          ? (data.project_header.overall_size_sqft || 0) : 0,
        bath_wall_tile_sqft: data.dimensions.shower_wall_sqft || 0,
        bath_shower_floor_tile_sqft: data.dimensions.shower_floor_sqft || 0,
        final_cp_total: data.pricing.totals.total_cp,
        final_ic_total: data.pricing.totals.total_ic,
        low_estimate_cp: data.pricing.totals.low_estimate,
        high_estimate_cp: data.pricing.totals.high_estimate,
        internal_json_payload: JSON.parse(JSON.stringify(payloadWithHistory)),
        status: 'draft',
      };

      const { data: saved, error } = await supabase
        .from('estimates')
        .insert([estimateData])
        .select('id')
        .single();

      if (error) throw error;

      toast.success('Estimate saved!');
      return saved.id;
    } catch (err) {
      console.error('Error saving estimate:', err);
      toast.error('Failed to save estimate');
      return null;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!contractor?.id) {
      toast.error('Please log in to create estimates');
      return;
    }

    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Add to conversation history
    const updatedHistory = [...conversationHistory, { role: 'user' as const, content }];
    setConversationHistory(updatedHistory);
    
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('calculate-estimate', {
        body: { 
          message: content,
          context,
          contractor_id: contractor.id,
          conversation_history: updatedHistory,
        }
      });

      if (error) throw error;
      
      const response = data as EstimateResponse;
      
      // Handle follow-up questions (needs more info)
      if (response.needsMoreInfo) {
        const followUp = response.followUpQuestion || "Could you tell me more about the project?";
        addAssistantMessage(followUp);
        
        // Update context with parsed data
        if (response.parsed) {
          setContext(prev => ({
            ...prev,
            projectType: response.parsed?.project_type || prev.projectType,
            scope: { ...prev.scope, ...response.parsed?.scope },
            dimensions: { ...prev.dimensions, ...response.parsed?.dimensions },
          }));
        }
        return;
      }

      // We have a complete estimate!
      setEstimate(response);
      
      // Save to database with conversation history
      const estimateId = await saveEstimateToDatabase(response, updatedHistory);
      if (estimateId) {
        setSavedEstimateId(estimateId);
      }

      // Generate summary message
      const summaryParts = [
        `**${response.project_header.project_type} Quote Ready** ✓`,
      ];
      
      if (response.project_header.overall_size_sqft) {
        summaryParts.push(`${response.project_header.overall_size_sqft} sq ft • ${response.trade_buckets.length} trade items`);
      }
      
      addAssistantMessage(summaryParts.join('\n'));
      
    } catch (err) {
      console.error('Error processing message:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('429')) {
          toast.error('Rate limit exceeded. Please wait a moment.');
        } else if (err.message.includes('402')) {
          toast.error('AI quota exceeded. Please try again later.');
        } else {
          toast.error('Failed to process request');
        }
      }
      
      addAssistantMessage("Sorry, I had an issue. Let's try again - is this a kitchen or bathroom project?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNew = () => {
    setMessages([WELCOME_MESSAGE]);
    setConversationHistory([]);
    setContext({});
    setEstimate(null);
    setSavedEstimateId(null);
    setShowLineItems(false);
  };

  const handleViewEstimate = () => {
    if (savedEstimateId) {
      navigate(`/estimates/${savedEstimateId}`);
    }
  };

  // Group line items by category
  const groupedLineItems = estimate?.pricing.line_items.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, PricingLineItem[]>) || {};

  return (
    <div className="flex flex-col h-full glass-card-active relative overflow-hidden">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-6 py-5 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg text-foreground tracking-tight">AI Estimator</h2>
            <p className="text-sm text-muted-foreground">
              {context.projectType ? `${context.projectType} Project` : 'Powered by real pricing'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStartNew}
          className="text-muted-foreground hover:text-foreground rounded-xl"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          New Quote
        </Button>
      </div>

      {/* Messages */}
      <div className="relative flex-1 overflow-y-auto p-6 space-y-5">
        {messages.map((message, index) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            isNew={index === messages.length - 1 && message.role === 'assistant'}
          />
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-3 text-muted-foreground animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
            <span className="text-sm">
              {estimate ? 'Calculating...' : 'Thinking...'}
            </span>
          </div>
        )}

        {/* Quote Summary Card */}
        {estimate && (
          <Card className="animate-scale-in border-primary/20 shadow-lg">
            <CardContent className="p-6">
              {/* Header with total */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-semibold text-xl tracking-tight">Quote Ready</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {estimate.trade_buckets.length} line items • {estimate.pricing.totals.overall_margin_percent.toFixed(0)}% margin
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(estimate.pricing.totals.total_cp)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Range: {formatCurrency(estimate.pricing.totals.low_estimate)} - {formatCurrency(estimate.pricing.totals.high_estimate)}
                  </div>
                </div>
              </div>

              {/* Payment Schedule */}
              <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-muted/50 rounded-xl">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Deposit (65%)</div>
                  <div className="font-semibold">{formatCurrency(estimate.payment_schedule.deposit)}</div>
                </div>
                <div className="text-center border-x border-border">
                  <div className="text-xs text-muted-foreground mb-1">Progress (25%)</div>
                  <div className="font-semibold">{formatCurrency(estimate.payment_schedule.progress)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Final (10%)</div>
                  <div className="font-semibold">{formatCurrency(estimate.payment_schedule.final)}</div>
                </div>
              </div>

              {/* Line Items Toggle */}
              <button
                onClick={() => setShowLineItems(!showLineItems)}
                className="w-full flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>View pricing breakdown</span>
                {showLineItems ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {/* Expanded Line Items */}
              {showLineItems && (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                  {Object.entries(groupedLineItems).map(([category, items]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        {category}
                      </h4>
                      <div className="space-y-1">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm py-1">
                            <div className="flex-1">
                              <span className="text-foreground">{item.task_description}</span>
                              <span className="text-muted-foreground ml-2">
                                ({item.quantity} {item.unit})
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-muted-foreground text-xs">
                                IC: {formatCurrency(item.ic_total)}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(item.cp_total)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Totals */}
                  <div className="border-t border-border pt-3 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Internal Cost</span>
                      <span>{formatCurrency(estimate.pricing.totals.total_ic)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Client Price</span>
                      <span className="font-semibold text-primary">{formatCurrency(estimate.pricing.totals.total_cp)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Profit</span>
                      <span className="text-green-600">
                        {formatCurrency(estimate.pricing.totals.total_cp - estimate.pricing.totals.total_ic)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
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
            </CardContent>
          </Card>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative p-4 border-t border-border">
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={isLoading}
          placeholder={
            !context.projectType 
              ? "Kitchen or bathroom?" 
              : `Describe the ${context.projectType.toLowerCase()} scope...`
          }
        />
      </div>
    </div>
  );
}
