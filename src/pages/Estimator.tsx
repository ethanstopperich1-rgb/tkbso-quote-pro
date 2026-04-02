import { ChatEstimator } from '@/components/chat/ChatEstimator';

export default function Estimator() {
  return (
    <div className="h-full flex flex-col bg-black min-h-0">
      {/* Header — Nothing style */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] flex-shrink-0">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#999]">
          NEW QUOTE
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4A9E5C]" />
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#4A9E5C]">
            LIVE
          </span>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatEstimator />
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes tkb-bounce {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
