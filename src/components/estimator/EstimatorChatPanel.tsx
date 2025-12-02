import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Message } from '@/types/estimator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, Sparkles, Loader2, FileDown, ArrowRight, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface PricingLineItem {
  trade_name: string;
  display_name: string;
  category: string;
  quantity: number;
  unit: string;
  ic_per_unit: number;
  ic_total: number;
  cp_total: number;
  margin_percent: number;
}

interface SanityCheck {
  passed: boolean;
  threshold: number;
  calculated_per_sqft: number;
  total_sqft: number;
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
    trade_name: string;
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
      price_per_sqft: number;
      applied_min_job: boolean;
    };
    sanity_check: SanityCheck;
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
  // Error states
  error?: string;
  needsMoreInfo?: boolean;
  followUpQuestion?: string;
}

interface ConversationContext {
  projectType?: string;
  dimensions?: Record<string, number>;
  trades?: string[];
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `**Welcome to Estimaitor** ✨

I'm your AI estimator. Describe your project naturally and I'll calculate a professional quote with real pricing.

**Try something like:**
- "5x8 bathroom with 3x5 shower, frameless glass, 48in vanity"
- "Master bath full gut, 10x12, walk-in shower with bench"
- "Guest bath refresh, just tile and paint"

What project would you like to estimate?`,
  timestamp: new Date(),
};

export function EstimatorChatPanel() {
  const { contractor, profile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
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
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const saveEstimateToDatabase = async (data: EstimateResponse): Promise<string | null> => {
    if (!contractor?.id) {
      toast.error('You must be logged in to save estimates');
      return null;
    }

    try {
      const roomSqft = (data.dimensions.room_length_ft && data.dimensions.room_width_ft) 
        ? data.dimensions.room_length_ft * data.dimensions.room_width_ft 
        : data.project_header.overall_size_sqft || 0;

      const estimateData = {
        contractor_id: contractor.id,
        created_by_profile_id: profile?.id || null,
        job_label: `${data.project_header.project_type} Remodel`,
        has_kitchen: data.project_header.project_type === 'Kitchen',
        has_bathrooms: data.project_header.project_type === 'Bathroom',
        total_bathroom_sqft: data.project_header.project_type === 'Bathroom' ? roomSqft : 0,
        total_kitchen_sqft: data.project_header.project_type === 'Kitchen' ? roomSqft : 0,
        bath_wall_tile_sqft: data.dimensions.shower_wall_sqft || 0,
        bath_shower_floor_tile_sqft: data.dimensions.shower_floor_sqft || 0,
        final_cp_total: data.pricing.totals.total_cp,
        final_ic_total: data.pricing.totals.total_ic,
        low_estimate_cp: data.pricing.totals.low_estimate,
        high_estimate_cp: data.pricing.totals.high_estimate,
        internal_json_payload: JSON.parse(JSON.stringify(data)),
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

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setEstimate(null);

    try {
      const { data, error } = await supabase.functions.invoke('calculate-estimate', {
        body: { 
          message: content,
          context,
          contractor_id: contractor.id,
        }
      });

      if (error) throw error;
      
      const response = data as EstimateResponse;
      
      // Handle errors or follow-up questions
      if (response.error || response.needsMoreInfo) {
        addAssistantMessage(response.followUpQuestion || response.error || 
          "I need more details. Could you specify dimensions and scope?");
        
        // Update context with any partial data
        if (response.project_header) {
          setContext(prev => ({
            ...prev,
            projectType: response.project_header.project_type,
          }));
        }
        return;
      }

      // We have a complete estimate
      setEstimate(response);
      
      // Save to database
      const estimateId = await saveEstimateToDatabase(response);
      if (estimateId) {
        setSavedEstimateId(estimateId);
      }

      // Generate summary message
      const summaryParts = [
        `**${response.project_header.project_type} Remodel Quote**`,
        '',
      ];
      
      if (response.pricing.sanity_check.total_sqft > 0) {
        summaryParts.push(`📐 **Size:** ${response.pricing.sanity_check.total_sqft} sq ft • $${response.pricing.totals.price_per_sqft}/sqft`);
      }
      
      summaryParts.push(`🔧 **Scope:** ${response.pricing.line_items.length} trade items`);
      summaryParts.push('');
      summaryParts.push(`**Investment Range:** ${formatCurrency(response.pricing.totals.low_estimate)} - ${formatCurrency(response.pricing.totals.high_estimate)}`);
      
      // Add sanity check warning to message
      if (!response.pricing.sanity_check.passed) {
        summaryParts.push('');
        summaryParts.push('🚨 **SANITY CHECK FAILED** - Price exceeds $320/sqft threshold. Review line items.');
      }
      
      if (response.pricing.warnings.length > 0) {
        summaryParts.push('');
        summaryParts.push('⚠️ ' + response.pricing.warnings.filter(w => !w.includes('SANITY CHECK')).join(' | '));
      }
      
      addAssistantMessage(summaryParts.join('\n'));
      
    } catch (err) {
      console.error('Error processing message:', err);
      
      // Check for specific error types
      if (err instanceof Error) {
        if (err.message.includes('429')) {
          toast.error('Rate limit exceeded. Please wait a moment.');
        } else if (err.message.includes('402')) {
          toast.error('AI quota exceeded. Please try again later.');
        } else {
          toast.error('Failed to process request');
        }
      }
      
      addAssistantMessage("I encountered an issue processing your request. Please try describing your project again with specific dimensions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNew = () => {
    setMessages([WELCOME_MESSAGE]);
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

  const sanityCheckFailed = estimate?.pricing?.sanity_check && !estimate.pricing.sanity_check.passed;

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
            <p className="text-sm text-muted-foreground">Powered by database-driven pricing</p>
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
            <span className="text-sm">Calculating estimate...</span>
          </div>
        )}

        {/* Quote Summary Card */}
        {estimate && (
          <Card className={`animate-scale-in shadow-lg ${sanityCheckFailed ? 'border-destructive border-2' : 'border-primary/20'}`}>
            <CardContent className="p-6">
              {/* SANITY CHECK WARNING BANNER */}
              {sanityCheckFailed && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-destructive">Sanity Check Failed</h4>
                    <p className="text-sm text-destructive/80 mt-1">
                      Price exceeds ${estimate.pricing.sanity_check.threshold}/sqft threshold 
                      (calculated: ${estimate.pricing.sanity_check.calculated_per_sqft}/sqft for {estimate.pricing.sanity_check.total_sqft} sqft).
                      <strong className="block mt-1">Review line items before sending to customer.</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Header with total */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display font-semibold text-xl tracking-tight">Quote Ready</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {estimate.pricing.line_items.length} line items • {estimate.pricing.totals.overall_margin_percent}% margin
                    {estimate.pricing.sanity_check.total_sqft > 0 && (
                      <span className={sanityCheckFailed ? 'text-destructive font-medium' : ''}>
                        {' '}• ${estimate.pricing.totals.price_per_sqft}/sqft
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${sanityCheckFailed ? 'text-destructive' : 'text-primary'}`}>
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
                              <span className="text-foreground">{item.display_name}</span>
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
                      <span className={`font-semibold ${sanityCheckFailed ? 'text-destructive' : 'text-primary'}`}>
                        {formatCurrency(estimate.pricing.totals.total_cp)}
                      </span>
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

              {/* Warnings */}
              {estimate.pricing.warnings.length > 0 && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="text-xs text-amber-600 space-y-1">
                    {estimate.pricing.warnings.map((warning, idx) => (
                      <p key={idx}>{warning}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={handleViewEstimate}
                  className="flex-1"
                  disabled={!savedEstimateId}
                  variant={sanityCheckFailed ? "destructive" : "default"}
                >
                  {sanityCheckFailed ? 'Review & Fix' : 'View Details'}
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
          placeholder="Describe your project..."
        />
      </div>
    </div>
  );
}
