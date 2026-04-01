import { useState, useEffect, useRef } from 'react';
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
} from '@/lib/chatFlow';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { PriceSummaryPanel } from './PriceSummaryPanel';

export function ChatEstimator() {
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
        addUserMessage("Let's go →");
        advanceToStep('room', state);
      }
      return;
    }

    const step = currentStep;
    const cfg = FLOW_STEPS[step];

    // Extras step — multi-select with continue
    if (step === 'extras') {
      if (raw === '__continue__') {
        addUserMessage(`Selected: ${[...selectedExtras].join(', ') || 'none'}`);
        const updated: Partial<EstimateState> = {
          ...state,
          backsplash: selectedExtras.has('backsplash'),
          plumbing: selectedExtras.has('plumbing'),
          electrical: selectedExtras.has('electrical'),
          demo: selectedExtras.has('demo'),
        };
        setState(updated);
        advanceToStep('contact_name', updated);
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

    // Update state
    let updated = { ...state };
    if (step === 'room') updated.roomType = raw;
    else if (step === 'sqft') updated.sqFootage = parseFloat(raw);
    else if (step === 'complexity') updated.complexity = raw;
    else if (step === 'cabinets') updated.cabinets = raw;
    else if (step === 'countertops') updated.countertops = raw;
    else if (step === 'flooring') updated.flooring = raw;
    else if (step === 'contact_name') updated.customerName = raw;
    else if (step === 'contact_email') updated.customerEmail = raw;
    else if (step === 'contact_phone') updated.customerPhone = raw;
    else if (step === 'notes') updated.notes = raw;
    else if (step === 'confirm') {
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

  const showPricePanel = ['countertops', 'flooring', 'extras', 'contact_name', 'contact_email', 'contact_phone', 'notes', 'confirm'].includes(currentStep ?? '');

  const currentCfg = currentStep ? FLOW_STEPS[currentStep] : null;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-2 space-y-3 scroll-smooth">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Bottom panel */}
      <div className="px-4 pb-4 pt-2 space-y-3 border-t border-white/[0.05]">
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
            currentStep={currentStep ?? 'room'}
          />
        )}
      </div>
    </div>
  );
}
