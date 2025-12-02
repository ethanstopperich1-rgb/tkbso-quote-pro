import { useState } from 'react';
import { EstimatorChatPanel } from './EstimatorChatPanel';
import { QuotePanel } from './QuotePanel';
import { TakeoffModal } from '@/components/takeoff/TakeoffModal';
import { Header } from '@/components/Header';

export function EstimatorLayout() {
  const [takeoffModalOpen, setTakeoffModalOpen] = useState(false);
  const [measuredSqft, setMeasuredSqft] = useState<number | null>(null);

  const handleTakeoffComplete = (data: { sqft: number; perimeter: number }) => {
    setMeasuredSqft(data.sqft);
    // TODO: Sync this to the EstimatorContext
    console.log('Takeoff complete:', data);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header onOpenTakeoff={() => setTakeoffModalOpen(true)} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat Panel */}
        <div className="w-1/2 flex flex-col border-r">
          <EstimatorChatPanel measuredSqft={measuredSqft} />
        </div>
        
        {/* Right: Live Quote Panel */}
        <div className="w-1/2 flex flex-col">
          <QuotePanel />
        </div>
      </div>

      <TakeoffModal
        open={takeoffModalOpen}
        onClose={() => setTakeoffModalOpen(false)}
        onComplete={handleTakeoffComplete}
      />
    </div>
  );
}
