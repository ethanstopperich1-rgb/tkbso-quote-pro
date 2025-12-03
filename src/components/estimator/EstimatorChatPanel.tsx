import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Message } from '@/types/estimator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, Sparkles, Loader2, FileDown, ArrowRight, ChevronDown, ChevronUp, Menu, LayoutDashboard, FileText, Settings, X } from 'lucide-react';
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

      // Extract client details from the internal payload if available
      const clientDetails = (data as any).client_details || {};

      const estimateData = {
        contractor_id: contractor.id,
        created_by_profile_id: profile?.id || null,
        job_label: clientDetails.client_name 
          ? `${data.project_header.project_type} Remodel - ${clientDetails.client_name}`
          : `${data.project_header.project_type} Remodel`,
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
        // Client information fields
        client_name: clientDetails.client_name || data.project_header.client_name || null,
        client_phone: clientDetails.client_phone || null,
        client_email: clientDetails.client_email || null,
        property_address: clientDetails.property_address || null,
        city: clientDetails.city || null,
        state: clientDetails.state || null,
        zip: clientDetails.zip || null,
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
    <div className="flex flex-col h-full glass-card-active relative overflow-hidden rounded-xl sm:rounded-2xl">
      {/* Subtle glow effect - hidden on mobile for performance */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header - compact on mobile with navigation */}
      <div className="relative flex items-center justify-between px-3 py-3 sm:px-6 sm:py-5 border-b border-border">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Menu dropdown for navigation */}
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-lg sm:rounded-xl hover:bg-muted"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </Button>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary hidden sm:block" />
            <div>
              <h2 className="font-display font-semibold text-base sm:text-lg text-foreground tracking-tight">AI Estimator</h2>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {context.projectType ? `${context.projectType} Project` : 'Powered by real pricing'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/estimates')}
            className="text-muted-foreground hover:text-foreground rounded-lg sm:rounded-xl h-8 sm:h-9 px-2 sm:px-3"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Quotes</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartNew}
            className="text-muted-foreground hover:text-foreground rounded-lg sm:rounded-xl h-8 sm:h-9 px-2 sm:px-3"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">New</span>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="relative flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5">
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
            <CardContent className="p-4 sm:p-6">
              {/* Header with total - stacks on mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div>
                  <h3 className="font-display font-semibold text-lg sm:text-xl tracking-tight">Quote Ready</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                    {estimate.trade_buckets.length} items • {estimate.pricing.totals.overall_margin_percent.toFixed(0)}% margin
                  </p>
                </div>
                <div className="sm:text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {formatCurrency(estimate.pricing.totals.total_cp)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Range: {formatCurrency(estimate.pricing.totals.low_estimate)} - {formatCurrency(estimate.pricing.totals.high_estimate)}
                  </div>
                </div>
              </div>

              {/* Payment Schedule - stacks on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-muted/50 rounded-lg sm:rounded-xl">
                <div className="flex justify-between sm:justify-center sm:flex-col sm:text-center py-1 sm:py-0">
                  <div className="text-xs text-muted-foreground sm:mb-1">Deposit (65%)</div>
                  <div className="font-semibold text-sm sm:text-base">{formatCurrency(estimate.payment_schedule.deposit)}</div>
                </div>
                <div className="flex justify-between sm:justify-center sm:flex-col sm:text-center border-t sm:border-t-0 sm:border-x border-border py-1 sm:py-0 pt-2 sm:pt-0">
                  <div className="text-xs text-muted-foreground sm:mb-1">Progress (25%)</div>
                  <div className="font-semibold text-sm sm:text-base">{formatCurrency(estimate.payment_schedule.progress)}</div>
                </div>
                <div className="flex justify-between sm:justify-center sm:flex-col sm:text-center border-t sm:border-t-0 border-border py-1 sm:py-0 pt-2 sm:pt-0">
                  <div className="text-xs text-muted-foreground sm:mb-1">Final (10%)</div>
                  <div className="font-semibold text-sm sm:text-base">{formatCurrency(estimate.payment_schedule.final)}</div>
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
                <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 border-t border-border pt-3 sm:pt-4">
                  {Object.entries(groupedLineItems).map(([category, items]) => (
                    <div key={category}>
                      <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        {category}
                      </h4>
                      <div className="space-y-2 sm:space-y-1">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm py-1.5 sm:py-1 border-b sm:border-b-0 border-border/50 last:border-b-0">
                            <div className="flex-1 mb-1 sm:mb-0">
                              <span className="text-foreground">{item.task_description}</span>
                              <span className="text-muted-foreground ml-1 sm:ml-2">
                                ({item.quantity} {item.unit})
                              </span>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
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
                  <div className="border-t border-border pt-3 mt-3 sm:mt-4">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Internal Cost</span>
                      <span>{formatCurrency(estimate.pricing.totals.total_ic)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm mt-1">
                      <span className="text-muted-foreground">Client Price</span>
                      <span className="font-semibold text-primary">{formatCurrency(estimate.pricing.totals.total_cp)}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm mt-1">
                      <span className="text-muted-foreground">Profit</span>
                      <span className="text-green-600">
                        {formatCurrency(estimate.pricing.totals.total_cp - estimate.pricing.totals.total_ic)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <Button 
                  onClick={handleViewEstimate}
                  className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
                  disabled={!savedEstimateId}
                >
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleViewEstimate}
                  disabled={!savedEstimateId}
                  className="h-10 sm:h-11 text-sm sm:text-base"
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

      {/* Input - compact on mobile */}
      <div className="relative p-2 sm:p-4 border-t border-border">
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
