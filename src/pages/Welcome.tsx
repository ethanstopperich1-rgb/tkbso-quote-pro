import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Camera, Video, BookOpen, MessageCircle, FileText, Play } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex w-24 h-24 bg-green-500 rounded-full items-center justify-center mb-6 animate-bounce">
            <span className="text-white text-5xl">✓</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome to EstimAIte! 🎉
          </h1>
          <p className="text-xl text-slate-300">
            Your account is ready. Let's create your first estimate.
          </p>
        </div>

        {/* Quick Start Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Choose Your First Estimate Method</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <button 
              onClick={() => navigate('/estimator')}
              className="p-6 border-2 border-slate-200 rounded-xl hover:border-cyan-400 hover:bg-cyan-50 transition-all group text-left"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold mb-1 text-slate-900">Chat Estimator</h3>
              <p className="text-sm text-slate-600">Type your scope</p>
              <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                Fastest
              </span>
            </button>

            <button 
              onClick={() => navigate('/estimator')}
              className="p-6 border-2 border-cyan-400 bg-cyan-50 rounded-xl hover:shadow-lg transition-all group text-left"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                <Camera className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-1 text-slate-900">Photo-to-Quote</h3>
              <p className="text-sm text-slate-600">Upload photos</p>
              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                Recommended
              </span>
            </button>

            <button 
              onClick={() => navigate('/estimator')}
              className="p-6 border-2 border-slate-200 rounded-xl hover:border-cyan-400 hover:bg-cyan-50 transition-all group text-left"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                <Video className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-bold mb-1 text-slate-900">Video Walk</h3>
              <p className="text-sm text-slate-600">Record scope</p>
              <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-semibold">
                Most Detail
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-sm text-slate-500">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Alternative Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="h-12 border-2 border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowTutorial(true)}
              className="h-12 border-2 border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
            >
              <Play className="h-4 w-4 mr-2" /> Watch Tutorial (2 min)
            </Button>
          </div>
        </div>

        {/* Help Resources */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <a href="#" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4" />
            Documentation
          </a>
          <a href="#" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center justify-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Live Chat Support
          </a>
          <a href="#" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center justify-center gap-2">
            <FileText className="h-4 w-4" />
            Pricing Templates
          </a>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Quick Start Tutorial</h3>
              <button 
                onClick={() => setShowTutorial(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center mb-6">
              <div className="text-center">
                <Play className="h-16 w-16 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500">Tutorial video coming soon</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => setShowTutorial(false)}
                className="flex-1 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 rounded-lg font-bold"
              >
                Got it, let's start!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
