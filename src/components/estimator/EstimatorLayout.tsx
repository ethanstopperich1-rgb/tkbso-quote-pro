import { EstimatorChatPanel } from './EstimatorChatPanel';

export function EstimatorLayout() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-2xl h-full flex flex-col">
        <EstimatorChatPanel />
      </div>
    </div>
  );
}
