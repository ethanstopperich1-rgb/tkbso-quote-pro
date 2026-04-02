import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { cn } from '@/lib/utils';
import {
  type ChatMessage as ChatMessageType,
  type EstimateState,
  type FlowStep,
  type QuickReply,
  getGreeting,
  getNextStep,
  FLOW_STEPS,
  calculateEstimate,
  isMultiSelectStep,
} from '@/lib/chatFlow';
import { saveEstimate } from '@/lib/saveEstimate';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { PriceSummaryPanel } from './PriceSummaryPanel';

export function ChatEstimator() {
  const navigate = useNavigate();
  const { contractor, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [currentStep, setCurrentStep] = useState<FlowStep | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [state, setState] = useState<Partial<EstimateState>>({});
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
  const [inputConfig, setInputConfig] = useState<{ type?: string; placeholder?: string; quickReplies?: QuickReply[] } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  const addAssistantMessage = (text: string, extras?: Partial<ChatMessageType>) => {
    setMessages((prev) => [
      ...prev,
      {
        id: uuid(),
        role: 'assistant',
        text,
        timestamp: new Date(),
        ...extras,
      },
    ]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: uuid(), role: 'user', text, timestamp: new Date() },
    ]);
  };

  // Greet on mount
  useEffect(() => {
    const greeting = getGreeting();
    setTimeout(() => {
      setMessages([greeting]);
      setInputConfig({ quickReplies: greeting.quickReplies });
    }, 400);
  }, []);

  useEffect(() => scrollToBottom(), [messages, isTyping]);

  const advanceToStep = (step: FlowStep, updatedState: Partial<EstimateState>) => {
    const cfg = FLOW_STEPS[step];
    if (!cfg) return;

    setIsTyping(true);
    setInputConfig(null);
    // Reset extras selection for new multi-select steps
    if (isMultiSelectStep(step)) {
      setSelectedExtras(new Set());
    }

    setTimeout(() => {
      setIsTyping(false);
      const msg = cfg.message(updatedState);
      const qr = cfg.quickReplies?.(updatedState);
      addAssistantMessage(msg, { quickReplies: qr });
      setCurrentStep(step);
      setInputConfig({
        type: cfg.inputType,
        placeholder: cfg.inputPlaceholder,
        quickReplies: qr,
      });
    }, 650);
  };

  const handleSend = (raw: string) => {
    // Initial start
    if (!currentStep) {
      if (raw === '__start__') {
        addUserMessage("Let's go \u2192");
        advanceToStep('customer_name', state);
      }
      return;
    }

    const step = currentStep;
    const cfg = FLOW_STEPS[step];

    // Multi-select steps (bath_extras, bath_plumbing_extras, kitchen_extras)
    if (isMultiSelectStep(step)) {
      if (raw === '__continue__') {
        const selected = [...selectedExtras];
        addUserMessage(`Selected: ${selected.join(', ') || 'none'}`);

        let updated = { ...state };
        if (step === 'bath_extras') {
          updated.bathExtras = selected;
        } else if (step === 'bath_plumbing_extras') {
          updated.bathPlumbingExtras = selected;
        } else if (step === 'kitchen_cabinet_addons') {
          updated.kitchenCabinetAddons = selected;
        } else if (step === 'kitchen_extras') {
          updated.kitchenExtras = selected;
        }

        setState(updated);
        const next = getNextStep(step, updated);
        advanceToStep(next, updated);
      }
      return;
    }

    // Validation
    if (cfg.validate) {
      const err = cfg.validate(raw);
      if (err) {
        addAssistantMessage(err);
        return;
      }
    }

    // Display label for quick replies
    const displayLabel = cfg.quickReplies?.(state)?.find((qr) => qr.value === raw)?.label ?? raw;
    addUserMessage(displayLabel);
    setInputConfig(null);

    // Update state based on step
    let updated = { ...state };

    switch (step) {
      // Customer
      case 'customer_name': updated.customerName = raw; break;
      case 'customer_address': updated.customerAddress = raw; break;
      case 'customer_phone': updated.customerPhone = raw; break;
      case 'customer_email': updated.customerEmail = raw || ''; break;

      // Room
      case 'room_type': updated.roomType = raw; break;
      case 'room_dimensions': updated.roomDimensions = raw || ''; break;

      // Bathroom
      case 'bath_demo': updated.bathDemo = raw; break;
      case 'bath_shower_type': updated.bathShowerType = raw; break;
      case 'bath_tile_wall_sqft': updated.bathTileWallSqft = parseFloat(raw) || 0; break;
      case 'bath_tile_floor_sqft': updated.bathTileFloorSqft = parseFloat(raw) || 0; break;
      case 'bath_vanity_size': updated.bathVanitySize = raw; break;
      case 'bath_countertop': updated.bathCountertop = raw; break;
      case 'bath_glass': updated.bathGlass = raw; break;

      // Kitchen
      case 'kitchen_demo': updated.kitchenDemo = raw; break;
      case 'kitchen_cabinets': updated.kitchenCabinets = raw; break;
      case 'kitchen_cabinet_color': updated.kitchenCabinetColor = raw; break;
      case 'kitchen_cabinet_count': updated.kitchenCabinetCount = parseFloat(raw) || 20; break;
      case 'kitchen_countertop': updated.kitchenCountertop = raw; break;
      case 'kitchen_countertop_sqft': updated.kitchenCountertopSqft = parseFloat(raw) || 0; break;
      case 'kitchen_backsplash': updated.kitchenBacksplash = raw; break;
      case 'kitchen_flooring': updated.kitchenFlooring = raw; break;
      case 'kitchen_flooring_sqft': updated.kitchenFlooringSqft = parseFloat(raw) || 0; break;

      // Closing
      case 'pricing_tier': updated.pricingTier = raw; break;
      case 'total_price': {
        if (raw.toLowerCase() === 'auto') {
          updated.totalPriceOverride = null;
        } else {
          const parsed = parseFloat(raw.replace(/[$,]/g, ''));
          updated.totalPriceOverride = isNaN(parsed) ? null : parsed;
        }
        break;
      }
      case 'payment_schedule': updated.paymentSchedule = raw; break;

      // Confirm
      case 'confirm': {
        if (raw === 'restart') {
          setState({});
          setSelectedExtras(new Set());
          setMessages([]);
          setCurrentStep(null);
          setTimeout(() => {
            const greeting = getGreeting();
            setMessages([greeting]);
            setInputConfig({ quickReplies: greeting.quickReplies });
          }, 300);
          return;
        }
        if (raw === 'submit' && contractor?.id) {
          // Save to Supabase + GHL
          const breakdown = calculateEstimate(updated);
          saveEstimate(updated, breakdown, contractor.id, profile?.id).then((result) => {
            if (result.error) {
              addAssistantMessage(`⚠️ Save failed: ${result.error}. Your quote data is still here — try again.`);
            } else {
              // Navigate to the saved estimate after the done message shows
              if (result.estimateId) {
                setTimeout(() => navigate(`/estimates/${result.estimateId}`), 2500);
              }
            }
          });
        }
        break;
      }
    }

    setState(updated);
    const next = getNextStep(step, updated);
    advanceToStep(next, updated);
  };

  const toggleExtra = (value: string) => {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  // Show price panel once we're past room selection into scope questions
  const priceSteps: FlowStep[] = [
    'bath_demo', 'bath_shower_type', 'bath_tile_wall_sqft', 'bath_tile_floor_sqft',
    'bath_vanity_size', 'bath_countertop', 'bath_glass', 'bath_extras', 'bath_plumbing_extras',
    'kitchen_demo', 'kitchen_cabinets', 'kitchen_cabinet_color',
    'kitchen_countertop', 'kitchen_countertop_sqft',
    'kitchen_cabinet_count', 'kitchen_cabinet_addons',
    'kitchen_backsplash', 'kitchen_flooring', 'kitchen_flooring_sqft', 'kitchen_extras',
    'pricing_tier', 'total_price', 'payment_schedule', 'confirm', 'done',
  ];
  const showPricePanel = priceSteps.includes(currentStep ?? '' as FlowStep);

  const currentCfg = currentStep ? FLOW_STEPS[currentStep] : null;

  return (
    <div className="flex flex-col h-full min-h-0 bg-black">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-2 space-y-3 scroll-smooth">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Bottom panel */}
      <div className="px-4 pb-4 pt-2 space-y-3 border-t border-[#222]">
        <PriceSummaryPanel state={state} visible={showPricePanel} />

        {inputConfig !== null && (
          <ChatInput
            onSend={handleSend}
            quickReplies={inputConfig.quickReplies}
            selectedExtras={selectedExtras}
            onToggleExtra={toggleExtra}
            inputType={currentCfg?.inputType}
            placeholder={currentCfg?.inputPlaceholder}
            disabled={isTyping}
            currentStep={currentStep ?? 'customer_name'}
          />
        )}
      </div>
    </div>
  );
}
