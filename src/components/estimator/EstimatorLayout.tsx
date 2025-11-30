import { EstimatorChatPanel } from './EstimatorChatPanel';
import { QuotePanel } from './QuotePanel';

export function EstimatorLayout() {
  return (
    <div className="h-screen flex bg-background">
      {/* Left: Chat Panel */}
      <div className="w-1/2 flex flex-col border-r">
        <EstimatorChatPanel />
      </div>
      
      {/* Right: Live Quote Panel with Pricing Controls */}
      <div className="w-1/2 flex flex-col">
        <QuotePanel />
      </div>
    </div>
  );
}
