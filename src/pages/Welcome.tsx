import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Camera, Video, ArrowRight, Check } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
            You're all set!
          </h1>
          <p className="text-slate-600">
            Choose how you'd like to create your first estimate
          </p>
        </div>

        {/* Estimate Methods */}
        <div className="space-y-3 mb-8">
          <button 
            onClick={() => navigate('/estimator')}
            className="w-full p-5 bg-white border border-slate-200 rounded-xl hover:border-[#00E5FF] hover:shadow-md transition-all flex items-center gap-4 text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#0F172A]">Chat Estimator</h3>
              <p className="text-sm text-slate-500">Describe your project in natural language</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">Fastest</span>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[#00E5FF] transition-colors" />
          </button>

          <button 
            onClick={() => navigate('/estimator')}
            className="w-full p-5 bg-white border-2 border-[#00E5FF] rounded-xl hover:shadow-md transition-all flex items-center gap-4 text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#0F172A]">Photo-to-Quote</h3>
              <p className="text-sm text-slate-500">Upload photos and let AI detect fixtures</p>
            </div>
            <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs font-semibold">Popular</span>
            <ArrowRight className="h-5 w-5 text-[#00E5FF]" />
          </button>

          <button 
            onClick={() => navigate('/estimator')}
            className="w-full p-5 bg-white border border-slate-200 rounded-xl hover:border-[#00E5FF] hover:shadow-md transition-all flex items-center gap-4 text-left group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#0F172A]">Video Walk-and-Talk</h3>
              <p className="text-sm text-slate-500">Record yourself walking through the space</p>
            </div>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">Detailed</span>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[#00E5FF] transition-colors" />
          </button>
        </div>

        {/* Skip to Dashboard */}
        <div className="text-center">
          <Button 
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 hover:text-[#0F172A]"
          >
            Skip to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
