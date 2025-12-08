import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, Paperclip, Loader2, ArrowLeft, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LivePreviewPanel, PreviewLineItem } from '@/components/estimator/LivePreviewPanel';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationContext {
  projectType?: string;
  scope?: Record<string, string | null>;
  dimensions?: Record<string, number | null>;
}

const PROJECT_TYPES = [
  { value: 'kitchen', label: 'Kitchen Remodel' },
  { value: 'bathroom', label: 'Full Bathroom' },
  { value: 'powder-room', label: 'Powder Room' },
  { value: 'combo', label: 'Kitchen + Bath Combo' },
  { value: 'custom', label: 'Custom Project' },
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Hey! Let's build your estimate. Describe the project naturally:

*"10x12 kitchen, remove wall to dining room, white shaker cabinets, quartz counters, subway tile backsplash"*

Or just start with the basics and I'll ask follow-up questions.`,
  timestamp: new Date(),
};

export default function EstimatorChat() {
  const { contractor, profile } = useAuth();
  const navigate = useNavigate();
  
  // Project info state
  const [clientName, setClientName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [projectType, setProjectType] = useState('');
  const [startDate, setStartDate] = useState('');
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [context, setContext] = useState<ConversationContext>({});
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Preview state
  const [lineItems, setLineItems] = useState<PreviewLineItem[]>([]);
  const [suggestions, setSuggestions] = useState<Array<{ item: string; reason: string; quantity?: number; unit?: string }>>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    if (!contractor?.id) {
      toast.error('Please log in to create estimates');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const updatedHistory = [...conversationHistory, { role: 'user' as const, content: inputMessage.trim() }];
    setConversationHistory(updatedHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('calculate-estimate', {
        body: {
          message: inputMessage.trim(),
          context: {
            ...context,
            projectType: projectType || context.projectType,
            clientName,
            projectAddress,
          },
          contractor_id: contractor.id,
          conversation_history: updatedHistory,
        },
      });

      if (error) throw error;

      // Handle follow-up questions
      if (data.needsMoreInfo) {
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.followUpQuestion || "Could you tell me more about the project?",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setConversationHistory(prev => [...prev, { role: 'assistant', content: assistantMessage.content }]);
        
        // Update context with parsed data
        if (data.parsed) {
          setContext(prev => ({
            ...prev,
            projectType: data.parsed?.project_type || prev.projectType,
            scope: { ...prev.scope, ...data.parsed?.scope },
            dimensions: { ...prev.dimensions, ...data.parsed?.dimensions },
          }));
        }
        return;
      }

      // We have line items - update the preview panel
      if (data.pricing?.line_items) {
        const items: PreviewLineItem[] = data.pricing.line_items.map((item: any, idx: number) => ({
          id: `item-${idx}`,
          category: item.category,
          name: item.task_description,
          quantity: item.quantity,
          unit: item.unit,
          price: item.cp_per_unit,
          total: item.cp_total,
          cost: item.ic_total,
          margin: item.margin_percent,
          confidence: 'high' as const,
        }));
        setLineItems(items);
      }

      // Handle suggestions
      if (data.forgotten_items_suggestions) {
        setSuggestions(data.forgotten_items_suggestions);
      }

      // Add summary message
      const summaryMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**${data.project_header?.project_type || 'Project'} Quote Ready** ✓

${data.pricing?.line_items?.length || 0} line items • ${data.project_header?.overall_size_sqft ? `${data.project_header.overall_size_sqft} sq ft` : 'See preview →'}

Review the items in the preview panel and make any adjustments before finalizing.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, summaryMessage]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: summaryMessage.content }]);

    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to process message');
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Sorry, I had an issue processing that. Let's try again - describe the project and I'll help build the estimate.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRemoveItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleFinalize = async () => {
    if (lineItems.length === 0) {
      toast.error('Add some line items first');
      return;
    }
    
    // Navigate to review page or save and redirect
    toast.success('Navigating to review...');
    // TODO: Save estimate and navigate to review page
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const totalCost = lineItems.reduce((sum, item) => sum + (item.cost || 0), 0);
  const avgMargin = totalCost > 0 ? ((subtotal - totalCost) / subtotal) * 100 : 0;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-muted/30">
      {/* Left Side: Chat */}
      <div className="flex-1 flex flex-col min-w-0 lg:max-w-2xl">
        {/* Project Info Form - Sticky */}
        <div className="bg-background border-b p-4 sticky top-0 z-10">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/estimator/new')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold text-foreground">Chat Estimator</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Client Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Project Address"
              value={projectAddress}
              onChange={(e) => setProjectAddress(e.target.value)}
              className="text-sm"
            />
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Project Type" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Est. Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  }} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-bl-md">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-background border-t p-4">
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Describe the project... (e.g., '10x12 kitchen, remove wall to dining room, white shaker cabinets')"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[80px] pr-24 resize-none text-sm"
                rows={3}
              />
              <div className="absolute bottom-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/estimator/photo')}
                  className="h-8 w-8"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="icon"
                  className="h-8 w-8"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Live Preview Panel */}
      <div className="hidden lg:block w-96 border-l bg-background overflow-y-auto">
        <LivePreviewPanel
          lineItems={lineItems}
          onRemoveItem={handleRemoveItem}
          onFinalize={handleFinalize}
          subtotal={subtotal}
          avgMargin={avgMargin}
        />
      </div>

      {/* Mobile: Bottom Sheet Preview (simplified) */}
      {lineItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{lineItems.length} items</p>
              <p className="text-lg font-bold">${subtotal.toLocaleString()}</p>
            </div>
            <Button onClick={handleFinalize}>
              Review & Finalize
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
