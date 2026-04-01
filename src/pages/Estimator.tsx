import { ChatEstimator } from '@/components/chat/ChatEstimator';
import { Sparkles } from 'lucide-react';

export default function Estimator() {
  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] min-h-0">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white/60" />
          </div>
          <div>
            <h1 className="text-sm font-medium text-white">New Estimate</h1>
            <p className="text-xs text-white/30">Chat-based estimator · 2 min</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/30">Live pricing</span>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatEstimator />
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes tkb-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
