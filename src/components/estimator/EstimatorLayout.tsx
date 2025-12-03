import { EstimatorChatPanel } from './EstimatorChatPanel';

export function EstimatorLayout() {
  return (
    <div className="h-[calc(100vh-0px)] flex flex-col bg-background">
      {/* Zen Mode: Centered Chat Only */}
      <div className="flex-1 flex items-start justify-center overflow-hidden p-2 sm:p-4 md:p-6">
        <div className="w-full max-w-3xl h-full flex flex-col">
          <EstimatorChatPanel />
        </div>
      </div>
    </div>
  );
}
