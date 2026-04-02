import { ChatEstimator } from '@/components/chat/ChatEstimator';
import { FileText } from 'lucide-react';

export default function Estimator() {
  return (
    <div className="h-full flex flex-col bg-white min-h-0">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900">New Quote</h1>
            <p className="text-xs text-slate-400">TKBSO Quote Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-400">Live pricing</span>
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
