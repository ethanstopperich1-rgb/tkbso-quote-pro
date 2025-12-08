import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Message } from '@/types/estimator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, Sparkles, Loader2, FileDown, ArrowRight, ChevronDown, ChevronUp, Menu, FileText, Camera, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { MultiPhotoAnalysisCard, PhotoAnalysisEntry, mergePhotoAnalyses } from './MultiPhotoAnalysisCard';
import { PhotoAnalysis, DetectedItem } from './PhotoUploadButton';
import { VideoRecordingModal, VideoAnalysisResult } from './VideoRecordingModal';

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

// Conversation phases for tracking workflow progress
type ConversationPhase = 'project_type' | 'scope_gathering' | 'materials' | 'client_details' | 'review' | 'complete';

interface ConversationState {
  phase: ConversationPhase;
  projectType: string | null;
  scopeItems: string[];
  materialsConfirmed: boolean;
  questionsAsked: string[];
  readyForQuote: boolean;
  clientDetails: {
    name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  clientDetailsSkipped: boolean;
}

const initialConversationState: ConversationState = {
  phase: 'project_type',
  projectType: null,
  scopeItems: [],
  materialsConfirmed: false,
  questionsAsked: [],
  readyForQuote: false,
  clientDetails: {
    name: null,
    phone: null,
    email: null,
    address: null,
  },
  clientDetailsSkipped: false,
};

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Hey! What project are we estimating today?

📷 **Upload a photo** or 🎥 **Record a video walk-through** for instant AI detection, or just tell me:

**Kitchen** or **Bathroom**?`,
  timestamp: new Date(),
};

export function EstimatorChatPanel() {
  const { contractor, profile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [context, setContext] = useState<ConversationContext>({});
  const [conversationState, setConversationState] = useState<ConversationState>(initialConversationState);
  const [isLoading, setIsLoading] = useState(false);
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
  const [savedEstimateId, setSavedEstimateId] = useState<string | null>(null);
  const [showLineItems, setShowLineItems] = useState(false);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoEntries, setPhotoEntries] = useState<PhotoAnalysisEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, estimate, photoEntries]);

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please drop an image file');
      return;
    }

    // Process each image file
    for (const file of imageFiles) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }
      await handlePhotoUpload(file);
    }
  };

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
      // Include photo analysis context if available
      const photoContext = getPhotoContextForEstimator();
      const messageWithContext = photoContext 
        ? `${content}\n\n[Photo Analysis Context]\n${photoContext}`
        : content;

      // Pass current conversation state to help AI understand where we are
      const { data, error } = await supabase.functions.invoke('calculate-estimate', {
        body: { 
          message: messageWithContext,
          context,
          contractor_id: contractor.id,
          conversation_history: updatedHistory,
          photo_analysis: photoEntries.length > 0 ? mergePhotoAnalyses(photoEntries) : null,
          conversation_state: conversationState,
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

          // Update conversation state based on what we learned
          setConversationState(prev => {
            const newState = { ...prev };
            
            // Update project type if detected
            if (response.parsed?.project_type) {
              newState.projectType = response.parsed.project_type;
              if (newState.phase === 'project_type') {
                newState.phase = 'scope_gathering';
              }
            }

            // Track scope items gathered
            if (response.parsed?.scope) {
              const scopeItems = Object.entries(response.parsed.scope)
                .filter(([_, v]) => v !== null)
                .map(([k]) => k);
              newState.scopeItems = [...new Set([...prev.scopeItems, ...scopeItems])];
            }

            // Check if dimensions gathered
            if (response.parsed?.dimensions) {
              const hasDimensions = Object.values(response.parsed.dimensions).some(v => v !== null);
              if (hasDimensions && newState.phase === 'scope_gathering') {
                newState.phase = 'materials';
              }
            }

            // Track questions asked to avoid repetition
            newState.questionsAsked = [...new Set([...prev.questionsAsked, followUp])];
            
            return newState;
          });
        }
        return;
      }

      // We have a complete estimate!
      setEstimate(response);
      
      // Update conversation state to complete
      setConversationState(prev => ({
        ...prev,
        phase: 'complete',
        readyForQuote: true,
        projectType: response.project_header.project_type,
      }));
      
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
    setConversationState(initialConversationState);
    setEstimate(null);
    setSavedEstimateId(null);
    setShowLineItems(false);
    setPhotoEntries([]);
    setShowVideoModal(false);
    setIsProcessingVideo(false);
  };

  // Handle video analysis result
  const handleVideoAnalyzed = async (result: VideoAnalysisResult) => {
    setIsProcessingVideo(false);
    
    // Add video analysis message to chat
    const videoMessage: Message = {
      id: 'video-' + Date.now(),
      role: 'assistant',
      content: `🎥 **Video analyzed!** Detected ${result.line_items?.length || 0} trade items.

${result.project_summary || 'Processing complete.'}

${result.transcript ? `**You said:** "${result.transcript.slice(0, 200)}${result.transcript.length > 200 ? '...' : ''}"` : ''}

Add dimensions or confirm to generate your quote.`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, videoMessage]);
    setConversationHistory(prev => [...prev, { role: 'assistant', content: videoMessage.content }]);

    // Convert video line items to photo analysis format for unified handling
    if (result.line_items && result.line_items.length > 0) {
      const videoEntry: PhotoAnalysisEntry = {
        id: 'video-' + Date.now(),
        analysis: {
          project_type: result.line_items[0]?.category?.includes('Kitchen') ? 'Kitchen' : 'Bathroom',
          confidence: 'medium',
          detected_items: result.line_items.map(item => ({
            category: item.category,
            item: item.item,
            quantity: item.quantity,
            unit: item.unit,
          })),
          observations: result.project_summary,
        },
        imagePreview: undefined, // Video doesn't have a preview image
      };
      setPhotoEntries(prev => [...prev, videoEntry]);

      // Update context with detected project type
      if (videoEntry.analysis.project_type) {
        setContext(prev => ({
          ...prev,
          projectType: videoEntry.analysis.project_type,
        }));
      }
    }
  };

  // Handle photo upload for AI vision analysis
  const handlePhotoUpload = async (file: File) => {
    if (!contractor?.id) {
      toast.error('Please log in to use photo analysis');
      return;
    }

    setIsAnalyzingPhoto(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);

      const base64Data = await base64Promise;
      const imagePreview = `data:${file.type};base64,${base64Data}`;

      // Add a "scanning" message
      const scanningMessage: Message = {
        id: 'scanning-' + Date.now(),
        role: 'assistant',
        content: '📷 **Scanning photo...** Analyzing visible trade items with AI vision.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, scanningMessage]);

      // Call the analyze-photo edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          image_base64: base64Data,
          mime_type: file.type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.');
        }
        if (response.status === 402) {
          throw new Error('AI quota exceeded. Please try again later.');
        }
        throw new Error(errorData.error || 'Failed to analyze photo');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Remove the scanning message and add results
      setMessages(prev => prev.filter(m => !m.id.startsWith('scanning-')));
      
      // Add to photo entries (supports multiple photos)
      const newEntry: PhotoAnalysisEntry = {
        id: Date.now().toString(),
        analysis: data.analysis,
        imagePreview,
      };
      setPhotoEntries(prev => [...prev, newEntry]);

      // Update context with detected project type
      if (data.analysis.project_type && data.analysis.project_type !== 'Unknown') {
        setContext(prev => ({
          ...prev,
          projectType: data.analysis.project_type,
        }));
      }

      // Add confirmation message
      const photoCount = photoEntries.length + 1;
      const confirmMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: photoCount === 1 
          ? `✨ **Photo analyzed!** I detected ${data.analysis.detected_items.length} trade items for a ${data.analysis.project_type} project.

📷 Upload more photos to capture different areas, or confirm the items and add dimensions.`
          : `✨ **Photo ${photoCount} added!** Found ${data.analysis.detected_items.length} more items. Total: ${photoEntries.reduce((sum, e) => sum + e.analysis.detected_items.length, 0) + data.analysis.detected_items.length} items detected.

Add more photos or provide dimensions to generate your quote.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmMessage]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: confirmMessage.content }]);

      toast.success(`Photo ${photoCount} analyzed!`);

    } catch (error) {
      console.error('Photo analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze photo');
      
      // Remove scanning message on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('scanning-')));
      
      addAssistantMessage("I couldn't analyze that photo. Please try a clearer image, or just describe the project.");
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  // Convert photo analysis to text context for the estimator
  const getPhotoContextForEstimator = (): string => {
    if (photoEntries.length === 0) return '';
    
    const mergedAnalysis = mergePhotoAnalyses(photoEntries);
    const items = mergedAnalysis.detected_items.map(item => 
      `${item.category}: ${item.item} (${item.quantity} ${item.unit})`
    ).join('\n');
    
    return `AI Vision detected items (from ${photoEntries.length} photo${photoEntries.length > 1 ? 's' : ''}):\n${items}\n\nObservations: ${mergedAnalysis.observations || 'None'}`;
  };

  // Handle removing a photo from entries
  const handleRemovePhoto = (id: string) => {
    setPhotoEntries(prev => prev.filter(e => e.id !== id));
    toast.success('Photo removed');
  };

  // Trigger file input for adding more photos
  const handleAddMorePhotos = () => {
    fileInputRef.current?.click();
  };

  // Handle updating quantity of a detected item
  const handleUpdateItem = (entryId: string, itemIndex: number, newQuantity: number) => {
    setPhotoEntries(prev => prev.map(entry => {
      if (entry.id !== entryId) return entry;
      const updatedItems = [...entry.analysis.detected_items];
      if (updatedItems[itemIndex]) {
        updatedItems[itemIndex] = { ...updatedItems[itemIndex], quantity: newQuantity };
      }
      return {
        ...entry,
        analysis: {
          ...entry.analysis,
          detected_items: updatedItems,
        },
      };
    }));
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
    <div 
      className="flex flex-col h-full glass-card-active relative overflow-hidden rounded-xl sm:rounded-2xl"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm border-2 border-dashed border-primary rounded-xl sm:rounded-2xl flex items-center justify-center animate-fade-in">
          <div className="flex flex-col items-center gap-3 text-primary">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Upload className="h-8 w-8" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">Drop photos here</p>
              <p className="text-sm text-muted-foreground">Release to analyze with AI vision</p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for adding more photos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          files.forEach(file => handlePhotoUpload(file));
          e.target.value = '';
        }}
        className="hidden"
      />
      {/* Subtle glow effect - hidden on mobile for performance */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header - navigation on mobile only, clean look on tablet/desktop */}
      <div className="relative flex items-center justify-between px-3 py-3 sm:px-6 sm:py-5 border-b border-border">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile: Menu button for navigation */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="h-8 w-8 p-0 rounded-lg hover:bg-muted sm:hidden"
          >
            <Menu className="h-4 w-4 text-muted-foreground" />
          </Button>
          {/* Desktop/Tablet: EstimAIte icon */}
          <div className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center flex-shrink-0 relative overflow-hidden" style={{ backgroundColor: '#0B1C3E' }}>
            <Sparkles className="h-5 w-5 text-white" />
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#00E5FF' }} />
          </div>
          <div>
            <h2 className="font-display font-semibold text-base sm:text-lg text-foreground tracking-tight">AI Estimator</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Powered by{' '}
              <span className="text-foreground/80 font-semibold">Estim</span>
              <span className="text-cyan-500 font-semibold">AI</span>
              <span className="text-foreground/80 font-semibold">te</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile: Quotes button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/estimates')}
            className="text-muted-foreground hover:text-foreground rounded-lg h-8 px-2 sm:hidden"
          >
            <FileText className="h-4 w-4" />
          </Button>
          {/* All screens: New Quote button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartNew}
            className="text-muted-foreground hover:text-foreground rounded-lg sm:rounded-xl h-8 sm:h-9 px-2 sm:px-3"
          >
            <RotateCcw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">New Quote</span>
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

        {/* Scanning animation */}
        {isAnalyzingPhoto && (
          <div className="flex items-center gap-3 text-cyan-600 animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <Camera className="h-4 w-4 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Scanning photo...</span>
              <span className="text-xs text-muted-foreground">Detecting trade items with AI vision</span>
            </div>
          </div>
        )}

        {/* Photo Analysis Card - Multi-photo support */}
        {photoEntries.length > 0 && !estimate && (
          <MultiPhotoAnalysisCard 
            entries={photoEntries}
            onRemovePhoto={handleRemovePhoto}
            onAddMore={handleAddMorePhotos}
            onUpdateItem={handleUpdateItem}
            isAnalyzing={isAnalyzingPhoto}
          />
        )}
        
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
        {/* Phase Progress Indicator */}
        {conversationState.phase !== 'project_type' && conversationState.phase !== 'complete' && (
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            <div className="flex gap-1">
              {['project_type', 'scope_gathering', 'materials', 'client_details'].map((phase, i) => (
                <div
                  key={phase}
                  className={`h-1.5 rounded-full transition-colors ${
                    i <= ['project_type', 'scope_gathering', 'materials', 'client_details'].indexOf(conversationState.phase)
                      ? 'bg-primary w-6'
                      : 'bg-muted w-4'
                  }`}
                />
              ))}
            </div>
            <span className="capitalize">
              {conversationState.phase === 'scope_gathering' && 'Gathering scope...'}
              {conversationState.phase === 'materials' && 'Material details...'}
              {conversationState.phase === 'client_details' && 'Client info...'}
            </span>
          </div>
        )}
        <ChatInput 
          onSend={handleSendMessage} 
          onPhotoUpload={handlePhotoUpload}
          onVideoClick={() => setShowVideoModal(true)}
          disabled={isLoading || isAnalyzingPhoto || isProcessingVideo}
          showPhotoUpload={true}
          showVideoCapture={true}
          isAnalyzingPhoto={isAnalyzingPhoto}
          isProcessingVideo={isProcessingVideo}
          placeholder={
            photoEntries.length > 0 && !estimate
              ? "Confirm items or add dimensions (e.g., '5x8 bathroom')..."
              : conversationState.phase === 'project_type'
                ? "Describe project, upload photo, or record video..."
              : conversationState.phase === 'scope_gathering'
                ? `Describe the ${conversationState.projectType?.toLowerCase() || 'project'} scope...`
              : conversationState.phase === 'materials'
                ? "What type of tile/materials? (e.g., porcelain, quartz)"
              : conversationState.phase === 'client_details'
                ? "Client name, phone, email, address..."
              : estimate
                ? "Add scope, change details, or start new..."
              : `Describe the ${context.projectType?.toLowerCase() || 'project'} scope...`
          }
        />
      </div>

      {/* Video Recording Modal */}
      <VideoRecordingModal
        open={showVideoModal}
        onOpenChange={setShowVideoModal}
        onVideoAnalyzed={handleVideoAnalyzed}
        contractorId={contractor?.id || ''}
      />
    </div>
  );
}
