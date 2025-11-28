import { EstimatorChatPanel } from './EstimatorChatPanel';
import { QuotePanel } from './QuotePanel';

export function EstimatorLayout() {
  return (
    <div className="h-screen flex">
      {/* Left side - Chat */}
      <div className="w-1/2 min-w-[400px] max-w-[600px] border-r flex flex-col">
        <EstimatorChatPanel />
      </div>
      
      {/* Right side - Live Quote Panel */}
      <div className="flex-1 flex flex-col">
        <QuotePanel />
      </div>
    </div>
  );
}
