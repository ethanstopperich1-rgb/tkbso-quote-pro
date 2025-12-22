import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Message } from '@/types/estimator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, Sparkles, Loader2, FileDown, ArrowRight, ChevronDown, ChevronUp, Menu, FileText, Camera, Upload, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { MultiPhotoAnalysisCard, PhotoAnalysisEntry, mergePhotoAnalyses } from './MultiPhotoAnalysisCard';
import { PhotoAnalysisConfirmation } from './PhotoAnalysisConfirmation';
import { PhotoAnalysis, DetectedItem } from './PhotoUploadButton';
import { VideoRecordingModal, VideoAnalysisResult } from './VideoRecordingModal';
import { VideoAnalysisConfirmation } from './VideoAnalysisConfirmation';
import { ClientDetailsForm } from './ClientDetailsForm';
import { ForgottenItemsModal } from './ForgottenItemsModal';
import { 
  ConversationState, 
  initialConversationState, 
  mapScopeToLineItems, 
  validateQuoteCompleteness,
  updateStateFromMessage,
  isReadyForClientDetails,
  hasCompleteClientDetails 
} from '@/lib/estimator-scope-mapper';
import {
  ScopeExtractionState,
  initialScopeState,
  extractScopeFromMessage,
  buildLineItemsFromScope,
  verifyCompleteness,
  ExtractedLineItem,
} from '@/lib/deterministic-pricing';
import {
  detectBundles,
  getBundleByKey,
  applyDerivations,
  derivedToLineItems,
  getMissingBundleInfo,
  generateBundleAcknowledgment,
  formatLineItemsPreview,
  DerivedItem,
} from '@/lib/estimate-bundles';
import {
  PRICING_TABLE,
  findPricingItem,
  calculateTotals,
  buildLineItem,
  parseQuickAdd,
  buildFromQuickAdd,
  LineItem,
  calculateEstimateTotals,
} from '@/lib/pricing-adapter';
import { useSmartQuestions } from '@/hooks/useSmartQuestions';
import { ProjectType } from '@/lib/smart-questions';

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

// ConversationState and initialConversationState imported from @/lib/estimator-scope-mapper

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Welcome to EstimAIte. I'm here to help you create a professional estimate for your remodeling project.

What type of project are we quoting today — kitchen or bathroom?

If you have client details, include them: "master bath remodel for the Smiths at 123 Main St" and I'll capture everything upfront.`,
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
  const [showPhotoConfirmation, setShowPhotoConfirmation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [showVideoConfirmation, setShowVideoConfirmation] = useState(false);
  const [videoAnalysisResult, setVideoAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [showClientDetailsForm, setShowClientDetailsForm] = useState(false);
  const [showForgottenItemsModal, setShowForgottenItemsModal] = useState(false);
  const [forgottenItems, setForgottenItems] = useState<string[]>([]);
  const [pendingClientDetails, setPendingClientDetails] = useState<{name: string; phone: string; email: string; address: string} | null>(null);
  
  // Deterministic pricing state
  const [scopeState, setScopeState] = useState<ScopeExtractionState>(initialScopeState);
  const [pendingLineItems, setPendingLineItems] = useState<ExtractedLineItem[]>([]);
  const [showLineItemsReview, setShowLineItemsReview] = useState(false);
  
  // Smart questions for conversational scope building
  const smartQuestions = useSmartQuestions();
  
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
    // Check by both mime type AND extension for better HEIC support
    const isImageFile = (file: File) => {
      const name = file.name.toLowerCase();
      return file.type.startsWith('image/') || 
             name.endsWith('.heic') || 
             name.endsWith('.heif') ||
             name.endsWith('.jpg') ||
             name.endsWith('.jpeg') ||
             name.endsWith('.png') ||
             name.endsWith('.webp');
    };
    const imageFiles = files.filter(isImageFile);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (imageFiles.length === 0 && videoFiles.length === 0) {
      toast.error('Please drop an image or video file');
      return;
    }

    // Process image files (batch upload)
    const validImageFiles = imageFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });
    
    if (validImageFiles.length > 0) {
      await handlePhotoUpload(validImageFiles);
    }

    // Process video files (one at a time)
    if (videoFiles.length > 0) {
      const videoFile = videoFiles[0];
      if (videoFile.size > 100 * 1024 * 1024) {
        toast.error('Video must be under 100MB');
        return;
      }
      await handleVideoUpload(videoFile);
    }
  };

  // Handle video file upload for AI analysis
  const handleVideoUpload = async (file: File) => {
    if (!contractor?.id) {
      toast.error('Please log in to use video analysis');
      return;
    }

    setIsProcessingVideo(true);
    
    // Add processing message
    const processingMessage: Message = {
      id: 'video-processing-' + Date.now(),
      role: 'assistant',
      content: '🎥 **Processing video...** Extracting audio and analyzing frames. This may take a moment.',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, processingMessage]);

    try {
      const videoBlob = file;
      
      // Extract audio and transcribe
      let transcript = '';
      try {
        const audioBase64 = await extractAudioFromVideoFile(videoBlob);
        
        const transcriptionResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ 
              audio: audioBase64,
              mimeType: 'audio/wav'
            })
          }
        );

        if (transcriptionResponse.ok) {
          const transcriptionResult = await transcriptionResponse.json();
          if (transcriptionResult?.text) {
            transcript = transcriptionResult.text;
          }
        }
      } catch (audioError) {
        console.error('Audio extraction error:', audioError);
      }
      
      // Extract frames
      const frames = await extractFramesFromVideoFile(videoBlob);
      
      // Analyze with AI
      const analysisResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-video`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            videoFrames: frames,
            audioTranscript: transcript,
            projectType: 'Remodeling'
          })
        }
      );

      if (!analysisResponse.ok) {
        throw new Error('Video analysis failed');
      }

      const result = await analysisResponse.json() as VideoAnalysisResult;

      // Remove processing message
      setMessages(prev => prev.filter(m => !m.id.startsWith('video-processing-')));
      
      // Handle the result
      handleVideoAnalyzed(result);

    } catch (error) {
      console.error('Error processing video:', error);
      setMessages(prev => prev.filter(m => !m.id.startsWith('video-processing-')));
      toast.error(error instanceof Error ? error.message : 'Failed to process video');
    } finally {
      setIsProcessingVideo(false);
    }
  };

  // Helper: Extract audio from video file
  const extractAudioFromVideoFile = async (videoBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoBlob);
      
      video.onloadedmetadata = async () => {
        try {
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const arrayBuffer = await videoBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const numberOfChannels = 1;
          const length = audioBuffer.length;
          const sampleRate = 16000;
          const offlineContext = new OfflineAudioContext(numberOfChannels, length, sampleRate);
          const source = offlineContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(offlineContext.destination);
          source.start();
          
          const renderedBuffer = await offlineContext.startRendering();
          const channelData = renderedBuffer.getChannelData(0);
          
          const pcmData = new Int16Array(channelData.length);
          for (let i = 0; i < channelData.length; i++) {
            const s = Math.max(-1, Math.min(1, channelData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          
          // Create WAV file
          const buffer = new ArrayBuffer(44 + pcmData.length * 2);
          const view = new DataView(buffer);
          const writeString = (offset: number, str: string) => {
            for (let i = 0; i < str.length; i++) {
              view.setUint8(offset + i, str.charCodeAt(i));
            }
          };
          writeString(0, 'RIFF');
          view.setUint32(4, 36 + pcmData.length * 2, true);
          writeString(8, 'WAVE');
          writeString(12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, 1, true);
          view.setUint32(24, sampleRate, true);
          view.setUint32(28, sampleRate * 2, true);
          view.setUint16(32, 2, true);
          view.setUint16(34, 16, true);
          writeString(36, 'data');
          view.setUint32(40, pcmData.length * 2, true);
          for (let i = 0; i < pcmData.length; i++) {
            view.setInt16(44 + i * 2, pcmData[i], true);
          }
          
          // Convert to base64
          const bytes = new Uint8Array(buffer);
          let binary = '';
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          
          URL.revokeObjectURL(video.src);
          resolve(btoa(binary));
        } catch (err) {
          // Fallback: send video as-is
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(videoBlob);
        }
      };
      
      video.onerror = reject;
    });
  };

  // Helper: Extract frames from video file
  const extractFramesFromVideoFile = async (videoBlob: Blob, intervalSeconds = 2): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoBlob);
      video.muted = true;
      
      const frames: string[] = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        canvas.width = Math.min(video.videoWidth, 640);
        canvas.height = Math.min(video.videoHeight, 480);
        
        const duration = video.duration;
        const timestamps: number[] = [];
        
        for (let t = 0; t < duration; t += intervalSeconds) {
          timestamps.push(t);
        }
        
        const limitedTimestamps = timestamps.slice(0, 10);
        let currentIndex = 0;
        
        const captureFrame = () => {
          if (currentIndex >= limitedTimestamps.length) {
            URL.revokeObjectURL(video.src);
            resolve(frames);
            return;
          }
          video.currentTime = limitedTimestamps[currentIndex];
        };
        
        video.onseeked = () => {
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            const base64 = dataUrl.split(',')[1];
            frames.push(base64);
          }
          currentIndex++;
          captureFrame();
        };
        
        captureFrame();
      };
      
      video.onerror = reject;
    });
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

      // AI-first approach: Let AI handle all natural language parsing
      const { data, error } = await supabase.functions.invoke('generate-quote', {
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
              const pType = response.parsed.project_type;
              if (pType === 'Kitchen' || pType === 'Bathroom') {
                newState.projectType = pType;
              }
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

      // We have a complete estimate - transform response to expected structure
      const rawPricing = response.pricing as any;
      const rawEstimate = (response as any).estimate;
      
      // Transform to expected structure
      const transformedResponse: EstimateResponse = {
        project_header: rawEstimate?.project_header || response.project_header,
        dimensions: rawEstimate?.dimensions || response.dimensions || {},
        trade_buckets: rawEstimate?.trade_buckets || response.trade_buckets || [],
        pricing: {
          line_items: rawPricing?.line_items || [],
          totals: {
            total_ic: rawPricing?.total_ic || 0,
            total_cp: rawPricing?.total_cp || 0,
            low_estimate: rawPricing?.low_estimate || 0,
            high_estimate: rawPricing?.high_estimate || 0,
            overall_margin_percent: rawPricing?.overall_margin_percent || 0,
          },
          warnings: rawPricing?.warnings || [],
        },
        payment_schedule: response.payment_schedule || {
          deposit: (rawPricing?.total_cp || 0) * 0.65,
          progress: (rawPricing?.total_cp || 0) * 0.25,
          final: (rawPricing?.total_cp || 0) * 0.10,
        },
        allowances: rawEstimate?.allowances || response.allowances || [],
        exclusions: rawEstimate?.exclusions || response.exclusions || [],
        warnings: rawEstimate?.warnings || response.warnings || [],
      };

      if (!transformedResponse.pricing.totals.total_cp) {
        console.error('Invalid estimate response - missing pricing:', response);
        addAssistantMessage("I generated the estimate but there was an issue with the data. Let me try again - can you confirm the scope?");
        return;
      }
      
      setEstimate(transformedResponse);
      
      // Update conversation state to complete
      const projectType = transformedResponse.project_header?.project_type || 'Bathroom';
      setConversationState(prev => ({
        ...prev,
        phase: 'complete' as const,
        readyForQuote: true,
        projectType: (projectType === 'Kitchen' || projectType === 'Bathroom') ? projectType : prev.projectType,
      }));

      // Generate summary message
      const summaryParts = [
        `**${projectType} Quote Ready** ✓`,
      ];
      
      if (transformedResponse.project_header?.overall_size_sqft) {
        summaryParts.push(`${transformedResponse.project_header.overall_size_sqft} sq ft • ${transformedResponse.trade_buckets?.length || 0} trade items`);
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
      
      addAssistantMessage("Sorry, I had an issue processing that. Could you describe your project again?");
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
    setShowPhotoConfirmation(false);
    setShowVideoModal(false);
    setShowVideoConfirmation(false);
    setVideoAnalysisResult(null);
    setIsProcessingVideo(false);
    setShowClientDetailsForm(false);
    setShowForgottenItemsModal(false);
    setForgottenItems([]);
    setPendingClientDetails(null);
    // Reset deterministic pricing state
    setScopeState(initialScopeState);
    setPendingLineItems([]);
    setShowLineItemsReview(false);
    // Reset smart questions
    smartQuestions.reset();
  };

  // Build line items from scope and show for review
  const handleShowLineItemsReview = () => {
    // Get all user messages for completeness check
    const userMessages = conversationHistory
      .filter(m => m.role === 'user')
      .map(m => m.content);
    
    // Build line items from deterministic scope state
    const baseLineItems = buildLineItemsFromScope(scopeState);
    
    // Apply intelligent derivation rules
    const derivedItems = applyDerivations(scopeState);
    const derivedLineItems = derivedToLineItems(derivedItems);
    
    // Merge base and derived items (avoid duplicates by checking pricing keys)
    const baseItemNames = new Set(baseLineItems.map(item => item.name.toLowerCase().replace(/\s*\([^)]*\)/g, '')));
    const uniqueDerivedItems = derivedLineItems.filter(item => {
      const simpleName = item.name.toLowerCase().replace(/\s*\([^)]*\)/g, '');
      return !baseItemNames.has(simpleName);
    });
    
    const allLineItems = [...baseLineItems, ...uniqueDerivedItems];
    
    // Verify completeness
    const { missing, warnings } = verifyCompleteness(userMessages, scopeState);
    
    // Check for missing bundle info
    const missingBundleInfo = getMissingBundleInfo(scopeState.activeBundles, scopeState);
    
    if (missing.length > 0 || missingBundleInfo.length > 0) {
      const allMissing = [...missing, ...missingBundleInfo.map(m => m)];
      const missingMsg = allMissing.join(', ');
      addAssistantMessage(`⚠️ I noticed: ${missingMsg}. Let me make sure I captured everything.`);
    }
    
    if (warnings.length > 0) {
      warnings.forEach(w => console.warn('Scope warning:', w));
    }
    
    // Set pending line items for review
    setPendingLineItems(allLineItems);
    setShowLineItemsReview(true);
    
    // Add message showing we're ready for review
    const totals = calculateTotals(allLineItems);
    
    // Show what was auto-included from bundles/derivations
    let derivedNote = '';
    if (derivedItems.length > 0) {
      derivedNote = `\n\n*Auto-included:*\n${derivedItems.slice(0, 5).map(d => `• ${d.lineItem} - ${d.reason}`).join('\n')}`;
      if (derivedItems.length > 5) {
        derivedNote += `\n...and ${derivedItems.length - 5} more`;
      }
    }
    
    addAssistantMessage(`📋 **Here's what I have - ${allLineItems.length} line items totaling ${formatCurrency(totals.totalCP)}.**\n\nReview below and let me know if anything's missing.${derivedNote}`);
  };
  
  // Handle line items review confirmation
  const handleLineItemsConfirmed = () => {
    setShowLineItemsReview(false);
    setShowClientDetailsForm(true);
    addAssistantMessage("Great! Now let's get the client details.");
  };
  
  // Handle adding an item during review
  const handleAddItemDuringReview = (itemName: string, quantity: number, price: number) => {
    const newItem: ExtractedLineItem = {
      name: itemName,
      quantity,
      unit: 'ea',
      ic: price * 0.58, // Estimate IC at 58%
      cp: price,
      category: 'Custom',
    };
    setPendingLineItems(prev => [...prev, newItem]);
    toast.success(`Added: ${itemName}`);
  };
  
  // Handle removing an item during review
  const handleRemoveItemDuringReview = (index: number) => {
    setPendingLineItems(prev => prev.filter((_, i) => i !== index));
  };

  // Handle client details form submission
  const handleClientDetailsSubmit = async (details: {name: string; phone: string; email: string; address: string}) => {
    // Update conversation state with client details
    setConversationState(prev => ({
      ...prev,
      clientDetails: {
        name: details.name || null,
        phone: details.phone || null,
        email: details.email || null,
        address: details.address || null,
      },
      phase: 'review' as const,
    }));
    setShowClientDetailsForm(false);

    // Use the pending line items from deterministic pricing
    if (pendingLineItems.length > 0) {
      // Generate quote with deterministic line items
      await generateQuoteWithDeterministicItems(details, pendingLineItems);
    } else {
      // Fallback to AI-based generation
      const allScopeText = conversationHistory
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join(' ');
      const lineItems = mapScopeToLineItems(allScopeText, conversationState);
      const missing = validateQuoteCompleteness(allScopeText, lineItems);

      if (missing.length > 0) {
        setForgottenItems(missing);
        setPendingClientDetails(details);
        setShowForgottenItemsModal(true);
      } else {
        await generateQuoteWithDetails(details);
      }
    }
  };

  // Handle skip client details
  const handleSkipClientDetails = async () => {
    setConversationState(prev => ({
      ...prev,
      clientDetailsSkipped: true,
      phase: 'review' as const,
    }));
    setShowClientDetailsForm(false);
    
    // Generate quote without client details
    await generateQuoteWithDetails(null);
  };

  // Handle forgotten items confirmation
  const handleForgottenItemsConfirm = async (selectedItems: string[]) => {
    if (selectedItems.length > 0) {
      // Add selected items to scope via a message
      const itemsMessage = `Adding: ${selectedItems.join(', ')}`;
      addAssistantMessage(`Got it! Adding ${selectedItems.length} items to the scope: ${selectedItems.join(', ')}`);
    }
    
    // Generate quote
    if (pendingClientDetails) {
      await generateQuoteWithDetails(pendingClientDetails);
    } else {
      await generateQuoteWithDetails(null);
    }
    setPendingClientDetails(null);
  };

  // Generate quote with optional client details
  const generateQuoteWithDetails = async (details: {name: string; phone: string; email: string; address: string} | null) => {
    if (!contractor?.id) return;

    setIsLoading(true);
    
    // Build a comprehensive message including client details
    let message = "Generate the quote now.";
    if (details?.name) {
      message = `Generate quote for client: ${details.name}`;
      if (details.phone) message += `, phone: ${details.phone}`;
      if (details.email) message += `, email: ${details.email}`;
      if (details.address) message += `, address: ${details.address}`;
    }

    const updatedHistory = [...conversationHistory, { role: 'user' as const, content: message }];
    setConversationHistory(updatedHistory);

    try {
      const { data, error } = await supabase.functions.invoke('generate-quote', {
        body: { 
          message,
          context,
          contractor_id: contractor.id,
          conversation_history: updatedHistory,
          photo_analysis: photoEntries.length > 0 ? mergePhotoAnalyses(photoEntries) : null,
          conversation_state: {
            ...conversationState,
            clientDetails: details || conversationState.clientDetails,
            clientDetailsSkipped: !details,
          },
        }
      });

      if (error) throw error;
      
      const response = data as EstimateResponse;
      
      if (response.needsMoreInfo) {
        addAssistantMessage(response.followUpQuestion || "I need a bit more information to generate the quote.");
        return;
      }

      // Transform response to expected structure (same as sendMessage)
      const rawPricing = response.pricing as any;
      const rawEstimate = (response as any).estimate;
      
      const transformedResponse: EstimateResponse = {
        project_header: rawEstimate?.project_header || response.project_header,
        dimensions: rawEstimate?.dimensions || response.dimensions || {},
        trade_buckets: rawEstimate?.trade_buckets || response.trade_buckets || [],
        pricing: {
          line_items: rawPricing?.line_items || [],
          totals: {
            total_ic: rawPricing?.total_ic || 0,
            total_cp: rawPricing?.total_cp || 0,
            low_estimate: rawPricing?.low_estimate || 0,
            high_estimate: rawPricing?.high_estimate || 0,
            overall_margin_percent: rawPricing?.overall_margin_percent || 0,
          },
          warnings: rawPricing?.warnings || [],
        },
        payment_schedule: response.payment_schedule || {
          deposit: (rawPricing?.total_cp || 0) * 0.65,
          progress: (rawPricing?.total_cp || 0) * 0.25,
          final: (rawPricing?.total_cp || 0) * 0.10,
        },
        allowances: rawEstimate?.allowances || response.allowances || [],
        exclusions: rawEstimate?.exclusions || response.exclusions || [],
        warnings: rawEstimate?.warnings || response.warnings || [],
      };

      if (!transformedResponse.pricing.totals.total_cp) {
        console.error('Invalid estimate response - missing pricing:', response);
        addAssistantMessage("I generated the estimate but there was an issue with the data. Let me try again.");
        return;
      }

      setEstimate(transformedResponse);
      
      const projectType = transformedResponse.project_header?.project_type || 'Bathroom';
      setConversationState(prev => ({
        ...prev,
        phase: 'complete' as const,
        readyForQuote: true,
        projectType: (projectType === 'Kitchen' || projectType === 'Bathroom') ? projectType : prev.projectType,
      }));

      addAssistantMessage(`**${projectType} Quote Ready** ✓\n${transformedResponse.trade_buckets.length} trade items`);
      
    } catch (err) {
      console.error('Error generating quote:', err);
      toast.error('Failed to generate quote');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate quote with deterministic line items (bypasses AI pricing)
  const generateQuoteWithDeterministicItems = async (
    details: {name: string; phone: string; email: string; address: string} | null,
    lineItems: ExtractedLineItem[]
  ) => {
    if (!contractor?.id) return;

    setIsLoading(true);
    
    try {
      const totals = calculateTotals(lineItems);
      
      // Convert ExtractedLineItem to PricingLineItem format
      const pricingLineItems: PricingLineItem[] = lineItems.map(item => ({
        category: item.category,
        task_description: item.name,
        quantity: item.quantity,
        unit: item.unit,
        ic_per_unit: item.quantity > 0 ? item.ic / item.quantity : item.ic,
        cp_per_unit: item.quantity > 0 ? item.cp / item.quantity : item.cp,
        ic_total: item.ic,
        cp_total: item.cp,
        margin_percent: item.cp > 0 ? (item.cp - item.ic) / item.cp : 0,
      }));

      // Build the estimate response from deterministic data
      const deterministicResponse: EstimateResponse = {
        project_header: {
          client_name: details?.name || null,
          project_type: scopeState.projectType || 'Bathroom',
          overall_size_sqft: scopeState.roomSqft || null,
        },
        dimensions: {
          ceiling_height_ft: 9,
          room_length_ft: null,
          room_width_ft: null,
          shower_floor_sqft: scopeState.showerFloorSqft || null,
          shower_wall_sqft: scopeState.wallTileSqft || null,
          main_floor_sqft: scopeState.floorTileSqft || null,
        },
        trade_buckets: lineItems.map(item => ({
          category: item.category,
          task_description: item.name,
          quantity: item.quantity,
          unit: item.unit,
        })),
        pricing: {
          line_items: pricingLineItems,
          totals: {
            total_ic: totals.totalIC,
            total_cp: totals.totalCP,
            low_estimate: totals.lowEstimate,
            high_estimate: totals.highEstimate,
            overall_margin_percent: totals.margin,
          },
          warnings: [],
        },
        payment_schedule: {
          deposit: Math.round(totals.totalCP * 0.65),
          progress: Math.round(totals.totalCP * 0.25),
          final: Math.round(totals.totalCP * 0.10),
        },
        allowances: [],
        exclusions: scopeState.exclusions,
        warnings: scopeState.warnings,
      };

      // Add client details to the payload
      const payloadWithClientDetails = {
        ...deterministicResponse,
        client_details: details ? {
          client_name: details.name,
          client_phone: details.phone,
          client_email: details.email,
          property_address: details.address,
        } : {},
      };

      setEstimate(deterministicResponse);

      // Save to database
      const estimateId = await saveEstimateToDatabase(payloadWithClientDetails as any, conversationHistory);
      if (estimateId) {
        setSavedEstimateId(estimateId);
      }

      // Update conversation state
      const projectType = scopeState.projectType || 'Bathroom';
      setConversationState(prev => ({
        ...prev,
        phase: 'complete' as const,
        readyForQuote: true,
        projectType: projectType,
      }));

      addAssistantMessage(`**${projectType} Quote Ready** ✓\n${lineItems.length} line items • ${formatCurrency(totals.totalCP)}`);
      
    } catch (err) {
      console.error('Error generating quote:', err);
      toast.error('Failed to generate quote');
    } finally {
      setIsLoading(false);
    }
  };
  const handleVideoAnalyzed = async (result: VideoAnalysisResult) => {
    setIsProcessingVideo(false);
    
    // Store the result for confirmation
    setVideoAnalysisResult(result);
    setShowVideoConfirmation(true);
    
    // Add analysis message to chat
    const itemCount = result.line_items?.length || 0;
    const videoMessage: Message = {
      id: 'video-' + Date.now(),
      role: 'assistant',
      content: `🎥 **Video analyzed!** I found ${itemCount} items and transcribed your narration. Please review what I detected below and confirm the scope.`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, videoMessage]);
    setConversationHistory(prev => [...prev, { role: 'assistant', content: videoMessage.content }]);
    
    toast.success(`Video analyzed! ${itemCount} items detected`);
  };

  // Handle video confirmation - user confirmed selected items and scope
  const handleVideoConfirmation = async (selectedItems: any[], scopeDescription: string, understoodScope: string[]) => {
    setShowVideoConfirmation(false);
    
    // Build a message with the confirmed items and scope
    const itemsList = selectedItems.map(item => 
      `${item.category}: ${item.item} (${item.quantity} ${item.unit})`
    ).join('\n');
    
    const userContent = scopeDescription.trim() || 'Looks good, use these items.';
    
    // Add user confirmation message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Convert selected video items to photo analysis format for unified handling
    if (selectedItems.length > 0) {
      const videoEntry: PhotoAnalysisEntry = {
        id: 'video-' + Date.now(),
        analysis: {
          project_type: selectedItems[0]?.category?.includes('Kitchen') ? 'Kitchen' : 'Bathroom',
          confidence: 'medium',
          detected_items: selectedItems.map(item => ({
            category: item.category,
            item: item.item,
            quantity: item.quantity,
            unit: item.unit,
          })),
          observations: videoAnalysisResult?.project_summary || '',
        },
        imagePreview: undefined,
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
    
    // Clear video result
    setVideoAnalysisResult(null);
    
    // Add assistant confirmation
    addAssistantMessage(`✓ Got it! Using ${selectedItems.length} items from your video${scopeDescription.trim() ? ` for: ${scopeDescription.slice(0, 100)}...` : ''}.\n\nNow tell me the room dimensions (e.g., "8x10 bathroom") or describe any additional scope.`);
  };

  // Handle re-recording from video confirmation
  const handleVideoReRecord = () => {
    setShowVideoConfirmation(false);
    setVideoAnalysisResult(null);
    setShowVideoModal(true);
  };

  // Process a single photo file
  const processPhotoFile = async (file: File): Promise<PhotoAnalysisEntry | null> => {
    let processedFile = file;
    let mimeType = file.type;
    
    // Convert HEIC/HEIF to JPEG
    if (file.type === 'image/heic' || file.type === 'image/heif' || 
        file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
      console.log('Converting HEIC/HEIF to JPEG...');
      
      const heic2any = (await import('heic2any')).default;
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9,
      });
      
      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      processedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
      mimeType = 'image/jpeg';
    }
    
    // Convert to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result as string;
        if (!result || !result.includes(',')) {
          reject(new Error('Invalid FileReader result'));
          return;
        }
        const base64 = result.split(',')[1];
        if (!base64 || base64.length === 0) {
          reject(new Error('Empty base64 data after split'));
          return;
        }
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.onabort = () => reject(new Error('File reading was aborted'));
    });
    
    reader.readAsDataURL(processedFile);

    const base64Data = await base64Promise;
    const imagePreview = `data:${mimeType};base64,${base64Data}`;

    // Call the analyze-photo edge function
    const requestBody = {
      image_base64: base64Data,
      mime_type: mimeType,
    };
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify(requestBody),
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

    return {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      analysis: data.analysis,
      imagePreview,
    };
  };

  // Handle photo upload for AI vision analysis (supports multiple files)
  const handlePhotoUpload = async (files: File[]) => {
    if (!contractor?.id) {
      toast.error('Please log in to use photo analysis');
      return;
    }

    if (files.length === 0) return;

    setIsAnalyzingPhoto(true);

    // Add a "scanning" message
    const scanningMessage: Message = {
      id: 'scanning-' + Date.now(),
      role: 'assistant',
      content: files.length === 1 
        ? '📷 **Scanning photo...** Analyzing visible trade items with AI vision.'
        : `📷 **Scanning ${files.length} photos...** Analyzing visible trade items with AI vision.`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, scanningMessage]);

    try {
      const results: PhotoAnalysisEntry[] = [];
      let totalItemsDetected = 0;
      let lastProjectType = '';

      // Process all photos (in parallel for speed)
      const processPromises = files.map(file => processPhotoFile(file).catch(err => {
        console.error(`Error processing ${file.name}:`, err);
        toast.error(`Failed to analyze ${file.name}`);
        return null;
      }));

      const processedResults = await Promise.all(processPromises);
      
      for (const result of processedResults) {
        if (result) {
          results.push(result);
          totalItemsDetected += result.analysis.detected_items.length;
          if (result.analysis.project_type && result.analysis.project_type !== 'Unknown') {
            lastProjectType = result.analysis.project_type;
          }
        }
      }

      if (results.length === 0) {
        throw new Error('Could not analyze any of the uploaded photos');
      }

      // Remove the scanning message
      setMessages(prev => prev.filter(m => !m.id.startsWith('scanning-')));
      
      // Add all to photo entries
      setPhotoEntries(prev => [...prev, ...results]);

      // Update context with detected project type
      if (lastProjectType) {
        setContext(prev => ({
          ...prev,
          projectType: lastProjectType,
        }));
      }

      // Show the photo confirmation UI instead of auto-proceeding
      setShowPhotoConfirmation(true);
      
      // Add a brief message prompting user to confirm
      const confirmMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🔍 **Photo analyzed!** I found ${totalItemsDetected} items. Please review what I detected below and tell me what you're actually doing with this space.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, confirmMessage]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: confirmMessage.content }]);

      toast.success(results.length === 1 ? 'Photo analyzed!' : `${results.length} photos analyzed!`);

    } catch (error) {
      console.error('Photo analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze photos');
      
      // Remove scanning message on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('scanning-')));
      
      addAssistantMessage("I couldn't analyze the photo(s). Please try clearer images, or just describe the project.");
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

  // Handle photo confirmation - user confirmed scope description
  const handlePhotoConfirmation = async (selectedItems: any[], scopeDescription: string) => {
    setShowPhotoConfirmation(false);
    
    const userContent = scopeDescription.trim() || 'Use my photo analysis';
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setConversationHistory(prev => [...prev, { role: 'user', content: userContent }]);
    
    // Build assistant response
    const assistantResponse = `✓ Got it! I'll use your description to generate the estimate.\n\nTell me the room dimensions (e.g., "8x10 bathroom") or any additional details.`;
    
    addAssistantMessage(assistantResponse);
  };

  const handleViewEstimate = async () => {
    if (savedEstimateId) {
      navigate(`/estimates/${savedEstimateId}`);
      return;
    }
    
    // Save first if not yet saved
    if (estimate) {
      const estimateId = await saveEstimateToDatabase(estimate, conversationHistory);
      if (estimateId) {
        setSavedEstimateId(estimateId);
        navigate(`/estimates/${estimateId}`);
      }
    }
  };

  // Group line items by category - with defensive null checks
  const groupedLineItems = (estimate?.pricing?.line_items || []).reduce((acc, item) => {
    if (!item) return acc;
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, PricingLineItem[]>);

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
              <p className="font-semibold text-lg">Drop photos or videos here</p>
              <p className="text-sm text-muted-foreground">Release to analyze with AI</p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for adding photos and videos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.heic,.heif"
        capture="environment"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          const imageFiles: File[] = [];
          
          files.forEach(file => {
            const isVideo = file.type.startsWith('video/');
            
            if (isVideo) {
              handleVideoUpload(file);
            } else {
              imageFiles.push(file);
            }
          });
          
          // Process all images at once
          if (imageFiles.length > 0) {
            handlePhotoUpload(imageFiles);
          }
          
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

        {/* Line Items Review - shown before client details */}
        {showLineItemsReview && pendingLineItems.length > 0 && !estimate && (
          <Card className="animate-scale-in border-primary/20 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold text-lg tracking-tight">Review Line Items</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pendingLineItems.length} items • {formatCurrency(calculateTotals(pendingLineItems).totalCP)} total
                  </p>
                </div>
              </div>

              {/* Line Items List */}
              <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
                {pendingLineItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg group">
                    <div className="flex-1">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({item.quantity} {item.unit})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{formatCurrency(item.cp)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItemDuringReview(idx)}
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(calculateTotals(pendingLineItems).totalCP)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowLineItemsReview(false);
                    addAssistantMessage("No problem! Tell me what else to add.");
                  }}
                  className="flex-1"
                >
                  Add More Items
                </Button>
                <Button
                  size="sm"
                  onClick={handleLineItemsConfirmed}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Looks Good
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Client Details Form - shown when ready for client details */}
        {showClientDetailsForm && !estimate && (
          <ClientDetailsForm
            onSubmit={handleClientDetailsSubmit}
            onSkip={handleSkipClientDetails}
            isLoading={isLoading}
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
        {estimate && estimate.pricing?.totals && estimate.trade_buckets && estimate.payment_schedule && (
          <Card className="animate-scale-in border-primary/20 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              {/* Header with total - stacks on mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div>
                  <h3 className="font-display font-semibold text-lg sm:text-xl tracking-tight">Quote Ready</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                    {estimate.trade_buckets.length} items • {(estimate.pricing.totals.overall_margin_percent || 0).toFixed(0)}% margin
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
                  disabled={isLoading}
                >
                  {savedEstimateId ? 'View Details' : 'Save & View Details'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleViewEstimate}
                  disabled={isLoading}
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
        
        {/* Generate Quote Button - appears when scope is sufficient */}
        {scopeState.projectType && 
         (scopeState.demoScope || scopeState.vanitySize || scopeState.wallTileSqft || scopeState.showerType) && 
         !estimate && 
         !showLineItemsReview && 
         !showClientDetailsForm && (
          <div className="mb-2">
            <Button
              onClick={handleShowLineItemsReview}
              className="w-full h-10"
              disabled={isLoading}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Review & Generate Quote
            </Button>
          </div>
        )}
        
        <ChatInput
          onSend={handleSendMessage} 
          disabled={isLoading}
          placeholder={
            conversationState.phase === 'project_type'
              ? "Describe your project (e.g., 'master bath remodel for the Smiths')..."
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

      {/* Forgotten Items Modal */}
      <ForgottenItemsModal
        open={showForgottenItemsModal}
        onOpenChange={setShowForgottenItemsModal}
        suggestions={forgottenItems.map((item, i) => ({
          id: `missing-${i}`,
          item,
          category: 'Missing Items',
          reason: 'Detected in scope but not in line items',
          autoAdd: true,
        }))}
        onAddItems={(items) => {
          handleForgottenItemsConfirm(items.map(i => i.item));
        }}
        onSkip={() => {
          handleForgottenItemsConfirm([]);
        }}
      />
    </div>
  );
}
