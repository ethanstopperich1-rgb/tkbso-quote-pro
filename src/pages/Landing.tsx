import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Play, 
  MessageSquare, 
  Settings, 
  Zap,
  Check,
  Star,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EstimAIteLogo } from '@/components/EstimAIteLogo';
import { useState, useEffect } from 'react';

// Typewriter component for chat animation
function TypewriterText({ 
  text, 
  delay = 0, 
  speed = 50, 
  onComplete 
}: { 
  text: string; 
  delay?: number; 
  speed?: number; 
  onComplete?: () => void;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    
    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [displayedText, text, speed, started, onComplete]);

  return (
    <span>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// Mini Before/After Slider for Bento Grid
function MiniBeforeAfter() {
  const [position, setPosition] = useState(50);
  
  return (
    <div className="relative w-full h-32 rounded-lg overflow-hidden cursor-ew-resize">
      <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/30 to-blue-600/20">
        <div className="absolute bottom-2 right-2 text-[10px] font-bold text-[#00E5FF] bg-[#0B1C3E]/80 px-2 py-0.5 rounded">AFTER</div>
        <div className="h-full flex items-center justify-center">
          <div className="w-20 h-16 bg-[#00E5FF]/20 rounded border border-[#00E5FF]/40 flex items-center justify-center">
            <div className="w-8 h-8 bg-[#00E5FF]/40 rounded" />
          </div>
        </div>
      </div>
      
      <div 
        className="absolute inset-0 bg-gradient-to-br from-amber-900/40 to-orange-800/30"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <div className="absolute bottom-2 left-2 text-[10px] font-bold text-amber-400 bg-[#0B1C3E]/80 px-2 py-0.5 rounded">BEFORE</div>
        <div className="h-full flex items-center justify-center">
          <div className="w-20 h-16 bg-amber-900/40 rounded border border-amber-700/40 flex items-center justify-center">
            <div className="w-8 h-8 bg-amber-700/40 rounded" />
          </div>
        </div>
      </div>
      
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-3 bg-slate-400 rounded" />
            <div className="w-0.5 h-3 bg-slate-400 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini PDF Document for Bento Grid
function MiniPdfDocument() {
  return (
    <div className="relative w-full h-32 flex items-center justify-center">
      <div className="relative w-24 bg-white rounded shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-300">
        <div className="p-2">
          <div className="flex items-center gap-1 mb-2">
            <div className="w-4 h-4 bg-[#0B1C3E] rounded" />
            <div className="w-10 h-1.5 bg-slate-200 rounded" />
          </div>
          <div className="space-y-1">
            <div className="w-full h-1 bg-slate-100 rounded" />
            <div className="w-4/5 h-1 bg-slate-100 rounded" />
            <div className="w-full h-1 bg-slate-100 rounded" />
          </div>
          <div className="mt-2 bg-[#00E5FF]/10 rounded p-1 text-center">
            <span className="text-[8px] font-bold text-[#0B1C3E]">$22,900</span>
          </div>
          <div className="mt-2 border-t border-slate-200 pt-1">
            <div className="w-12 h-2 mx-auto">
              <svg viewBox="0 0 50 10" className="w-full h-full">
                <path 
                  d="M5 8 C10 2, 15 8, 20 4 C25 0, 30 6, 35 3 C40 0, 45 5, 48 2" 
                  stroke="#0B1C3E" 
                  strokeWidth="1.5" 
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-3 h-3 text-white" />
        </div>
      </div>
      <div className="absolute -z-10 w-20 h-24 bg-slate-700/50 rounded shadow-lg transform rotate-6 translate-x-2 translate-y-1" />
    </div>
  );
}

// Animated Chat Demo
function AnimatedChatDemo() {
  const [stage, setStage] = useState(0);
  const [cycle, setCycle] = useState(0);
  
  useEffect(() => {
    const cycleTimer = setInterval(() => {
      setStage(0);
      setCycle(c => c + 1);
    }, 12000);
    
    return () => clearInterval(cycleTimer);
  }, []);

  useEffect(() => {
    if (stage === 0) {
      const timer = setTimeout(() => setStage(1), 500);
      return () => clearTimeout(timer);
    }
  }, [cycle, stage]);

  return (
    <div className="rounded-2xl bg-slate-800/50 border border-white/10 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-[#00E5FF]" />
        </div>
        <span className="font-semibold">AI Estimator</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400">Online</span>
        </div>
      </div>
      <div className="space-y-3 min-h-[140px]">
        <div className="bg-slate-700/50 rounded-xl rounded-bl-sm p-4 max-w-[80%]">
          <p className="text-sm text-slate-300">What&apos;s the project?</p>
        </div>
        
        {stage >= 1 && (
          <div className="bg-[#00E5FF]/20 rounded-xl rounded-br-sm p-4 max-w-[85%] ml-auto">
            <p className="text-sm">
              {stage === 1 ? (
                <TypewriterText 
                  key={cycle}
                  text="Master bath remodel, 8x10, walk-in shower with bench, frameless glass..."
                  speed={40}
                  onComplete={() => setTimeout(() => setStage(2), 800)}
                />
              ) : (
                "Master bath remodel, 8x10, walk-in shower with bench, frameless glass..."
              )}
            </p>
          </div>
        )}
        
        {stage === 2 && (
          <div className="bg-slate-700/50 rounded-xl rounded-bl-sm p-4 max-w-[60%]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-slate-400">Calculating...</span>
            </div>
          </div>
        )}
        
        {stage >= 2 && (
          <div className="bg-slate-700/50 rounded-xl rounded-bl-sm p-4 max-w-[85%]">
            {stage === 2 ? (
              <p className="text-sm text-slate-300">
                <TypewriterText 
                  key={`response-${cycle}`}
                  text="Quote Generated: $22,900. Ready to review?"
                  delay={1500}
                  speed={35}
                  onComplete={() => setStage(3)}
                />
              </p>
            ) : (
              <div>
                <p className="text-sm text-slate-300 mb-2">Quote Generated: <span className="text-[#00E5FF] font-bold">$22,900</span>. Ready to review?</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-[#00E5FF]/20 text-[#00E5FF] px-2 py-1 rounded-full">View Details</span>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Send to Client</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0B1C3E]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <EstimAIteLogo size="sm" />
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-300 hover:text-white transition-colors">How it Works</a>
              <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-[#00E5FF] text-[#0B1C3E] hover:bg-[#00E5FF]/90 font-semibold shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-blue-600 opacity-10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8 inline-flex items-center rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-4 py-1.5 animate-fade-in">
            <Zap className="h-4 w-4 text-[#00E5FF] mr-2" />
            <span className="text-sm font-semibold text-[#00E5FF]">New: Visual Estimator v2.0</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Stop Typing Estimates.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#00E5FF]">
              Start Building.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            The AI command center for Kitchen &amp; Bath remodelers. Turn a 30-minute walkthrough into a 
            signed, deposit-paid contract before you leave the driveway.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/auth">
              <Button 
                size="lg" 
                className="group relative bg-[#00E5FF] text-[#0B1C3E] hover:bg-[#00E5FF]/90 font-bold text-lg px-8 py-6 rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)] hover:shadow-[0_0_50px_rgba(0,229,255,0.6)] transition-all"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg"
              className="border-slate-600 text-white hover:bg-white/10 font-semibold text-lg px-8 py-6 rounded-full"
            >
              <Play className="mr-2 h-5 w-5 fill-white" />
              Watch Demo
            </Button>
          </div>

          {/* 3D Tilted App Screenshot with Glassmorphism */}
          <div className="mt-20 relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#00E5FF] opacity-30 blur-[100px] rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-r from-[#00E5FF] via-blue-500 to-[#00E5FF] opacity-20 blur-[60px] rounded-full" />
            </div>
            
            <div 
              className="relative rounded-2xl bg-white/5 p-2 lg:p-4 border border-white/10 backdrop-blur-xl shadow-2xl"
              style={{ 
                transform: 'perspective(1000px) rotateX(5deg) rotateY(-2deg)',
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00E5FF]/20 via-transparent to-blue-600/10 pointer-events-none" />
              
              <div className="rounded-xl overflow-hidden bg-gradient-to-br from-[#0B1C3E] to-slate-900 aspect-video relative">
                <div className="absolute inset-0 p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/20 flex items-center justify-center">
                        <div className="w-4 h-4 bg-[#00E5FF] rounded" />
                      </div>
                      <div className="w-20 h-3 bg-white/20 rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-16 h-6 bg-[#00E5FF]/20 rounded-full" />
                      <div className="w-6 h-6 bg-white/10 rounded-full" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 h-[calc(100%-3rem)]">
                    <div className="col-span-1 space-y-3">
                      <div className="h-20 bg-white/5 rounded-lg border border-white/10 p-3">
                        <div className="w-12 h-2 bg-white/30 rounded mb-2" />
                        <div className="w-full h-2 bg-white/10 rounded mb-1" />
                        <div className="w-3/4 h-2 bg-white/10 rounded" />
                      </div>
                      <div className="h-32 bg-white/5 rounded-lg border border-white/10 p-3">
                        <div className="w-16 h-2 bg-[#00E5FF]/50 rounded mb-3" />
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="w-12 h-2 bg-white/20 rounded" />
                            <div className="w-8 h-2 bg-green-500/50 rounded" />
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="w-10 h-2 bg-white/20 rounded" />
                            <div className="w-10 h-2 bg-[#00E5FF]/50 rounded" />
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="w-14 h-2 bg-white/20 rounded" />
                            <div className="w-6 h-2 bg-amber-500/50 rounded" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 bg-white/5 rounded-lg border border-white/10 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-[#00E5FF]/20" />
                        <div className="w-24 h-3 bg-white/20 rounded" />
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="bg-slate-700/50 rounded-lg p-2 max-w-[60%]">
                          <div className="w-full h-2 bg-white/20 rounded" />
                        </div>
                        <div className="bg-[#00E5FF]/20 rounded-lg p-2 max-w-[70%] ml-auto">
                          <div className="w-full h-2 bg-white/30 rounded" />
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-[#00E5FF]/10 to-transparent rounded-lg p-3 border border-[#00E5FF]/20">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="w-16 h-2 bg-white/20 rounded mb-1" />
                            <div className="w-24 h-4 bg-[#00E5FF] rounded" />
                          </div>
                          <div className="w-16 h-6 bg-green-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-medium text-white/80">LIVE</span>
                </div>
              </div>
            </div>
            
            <div className="absolute -left-8 top-1/4 bg-[#0B1C3E]/80 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl transform -rotate-6 hidden lg:block">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium">Quote Sent</span>
              </div>
            </div>
            <div className="absolute -right-8 top-1/3 bg-[#0B1C3E]/80 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl transform rotate-6 hidden lg:block">
              <div className="text-center">
                <span className="text-lg font-bold text-[#00E5FF]">$22,900</span>
                <p className="text-[10px] text-slate-400">Client Price</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for <span className="text-[#00E5FF]">Remodelers</span>, by Remodelers
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Three problems. One solution. Zero spreadsheets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:row-span-2 group relative p-6 rounded-2xl bg-[#0B1C3E]/60 border border-white/10 backdrop-blur-sm hover:border-[#00E5FF]/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
              <h3 className="text-xl font-bold mb-3 relative z-10">No More Spreadsheets</h3>
              <p className="text-slate-400 mb-6 relative z-10">
                Stop guessing margins on napkin math. Our AI calculates accurate costs in seconds, not hours.
              </p>
              <div className="relative h-48 flex items-center justify-center">
                <div className="relative">
                  <div className="w-24 h-32 bg-white rounded shadow-lg transform -rotate-6 relative overflow-hidden">
                    <div className="absolute inset-0 p-2">
                      <div className="grid grid-cols-3 gap-0.5 h-full">
                        {Array.from({ length: 15 }).map((_, i) => (
                          <div key={i} className="bg-slate-100 rounded-sm" />
                        ))}
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                      <X className="w-16 h-16 text-red-500 stroke-[3]" />
                    </div>
                  </div>
                  <div className="absolute -inset-4 bg-red-500/20 blur-xl rounded-full -z-10" />
                </div>
              </div>
            </div>

            <div className="group relative p-6 rounded-2xl bg-[#0B1C3E]/60 border border-white/10 backdrop-blur-sm hover:border-[#00E5FF]/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 to-transparent pointer-events-none" />
              <h3 className="text-xl font-bold mb-3 relative z-10">Visual Estimates</h3>
              <p className="text-slate-400 mb-4 text-sm relative z-10">
                Snap a photo, describe the scope, close the deal.
              </p>
              <MiniBeforeAfter />
            </div>

            <div className="group relative p-6 rounded-2xl bg-[#0B1C3E]/60 border border-white/10 backdrop-blur-sm hover:border-[#00E5FF]/30 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
              <h3 className="text-xl font-bold mb-3 relative z-10">Instant Contracts</h3>
              <p className="text-slate-400 mb-4 text-sm relative z-10">
                Generate signed PDFs before you leave the driveway.
              </p>
              <MiniPdfDocument />
            </div>

            <div className="lg:col-span-2 group relative p-6 rounded-2xl bg-[#0B1C3E]/60 border border-white/10 backdrop-blur-sm hover:border-[#00E5FF]/30 transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-black text-[#00E5FF] mb-1">5 min</div>
                  <p className="text-slate-400 text-sm">Average Quote Time</p>
                </div>
                <div className="hidden sm:block w-px h-16 bg-white/10" />
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-black text-[#00E5FF] mb-1">38%</div>
                  <p className="text-slate-400 text-sm">Margin Protection</p>
                </div>
                <div className="hidden sm:block w-px h-16 bg-white/10" />
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl font-black text-green-400 mb-1">+40%</div>
                  <p className="text-slate-400 text-sm">Close Rate Increase</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-[#0B1C3E]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How <span className="text-[#00E5FF]">EstimAIte</span> Works
            </h2>
            <p className="text-lg text-slate-400">
              From walkthrough to signed contract in three steps
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-[#00E5FF] mb-4">
                <span className="w-8 h-8 rounded-full bg-[#00E5FF]/20 flex items-center justify-center text-sm font-bold">1</span>
                <span className="text-sm font-semibold uppercase tracking-wide">Describe</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Chat with Your Data</h3>
              <p className="text-slate-400 text-lg mb-6">
                Just talk to the AI like you&apos;d describe the job to your crew. &quot;3x5 shower, full tile, frameless glass&quot; — 
                that&apos;s all it takes. The AI extracts dimensions, materials, and scope automatically.
              </p>
              <ul className="space-y-3">
                {['Natural language processing', 'Automatic dimension extraction', 'Smart clarifying questions'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-300">
                    <Check className="h-5 w-5 text-[#00E5FF]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <AnimatedChatDemo />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <div className="rounded-2xl bg-slate-800/50 border border-white/10 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-amber-400" />
                  </div>
                  <span className="font-semibold">Pricing Config</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-sm text-slate-300">Tile Labor</span>
                    <span className="font-mono text-[#00E5FF]">$21/sqft</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-sm text-slate-300">Target Margin</span>
                    <span className="font-mono text-green-400">38%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-sm text-slate-300">Plumbing Package</span>
                    <span className="font-mono text-[#00E5FF]">$2,225</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-[#00E5FF] mb-4">
                <span className="w-8 h-8 rounded-full bg-[#00E5FF]/20 flex items-center justify-center text-sm font-bold">2</span>
                <span className="text-sm font-semibold uppercase tracking-wide">Configure</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Protect Your Margins</h3>
              <p className="text-slate-400 text-lg mb-6">
                Set your own labor rates, material allowances, and target margins. Every quote uses YOUR numbers, 
                not generic industry averages. Keep your pricing consistent across every job.
              </p>
              <ul className="space-y-3">
                {['Custom labor rates per trade', 'Material allowance control', 'Margin protection built-in'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-300">
                    <Check className="h-5 w-5 text-[#00E5FF]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-[#00E5FF] mb-4">
                <span className="w-8 h-8 rounded-full bg-[#00E5FF]/20 flex items-center justify-center text-sm font-bold">3</span>
                <span className="text-sm font-semibold uppercase tracking-wide">Close</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Send &amp; Get Signed</h3>
              <p className="text-slate-400 text-lg mb-6">
                Generate a beautiful PDF proposal with one click. Email it directly to your client with payment 
                milestones built in. Track when they view it, when they sign, when they pay.
              </p>
              <ul className="space-y-3">
                {['Professional PDF proposals', 'Email delivery tracking', 'Payment milestone automation'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-300">
                    <Check className="h-5 w-5 text-[#00E5FF]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-slate-400">Deal Stage</span>
                  <span className="text-xs text-[#00E5FF] bg-[#00E5FF]/20 px-2 py-1 rounded-full">Active</span>
                </div>
                <div className="flex items-center justify-between mb-6 overflow-x-auto">
                  {['Draft', 'Sent', 'Viewed', 'Signed', 'Paid'].map((stage, i) => (
                    <div key={stage} className="flex items-center">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        i <= 3 ? 'bg-[#00E5FF] text-[#0B1C3E]' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {stage}
                      </div>
                      {i < 4 && <ChevronRight className={`h-4 w-4 mx-1 flex-shrink-0 ${i < 3 ? 'text-[#00E5FF]' : 'text-slate-600'}`} />}
                    </div>
                  ))}
                </div>
                <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">$22,900</p>
                  <p className="text-sm text-slate-400">Master Bath Remodel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-center text-sm text-slate-500 uppercase tracking-wider mb-8">Trusted by Industry Leaders</p>
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 opacity-50">
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">NARI</span>
                </div>
                <span className="text-sm text-slate-400 hidden sm:inline">Remodeling Industry</span>
              </div>
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">NKBA</span>
                </div>
                <span className="text-sm text-slate-400 hidden sm:inline">Kitchen &amp; Bath</span>
              </div>
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">NAHB</span>
                </div>
                <span className="text-sm text-slate-400 hidden sm:inline">Home Builders</span>
              </div>
              <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">BBB</span>
                </div>
                <span className="text-sm text-slate-400 hidden sm:inline">A+ Rated</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Trusted by <span className="text-[#00E5FF]">Orlando&apos;s Best</span>
            </h2>
            <p className="text-lg text-slate-400">Real contractors, real results</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "I used to spend 2 hours on each estimate. Now it takes 5 minutes. The AI gets my pricing right every time.",
                name: "Mike Rodriguez",
                title: "Owner, Premier Bath & Kitchen",
                stars: 5,
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
              },
              {
                quote: "The PDF proposals look so professional, clients sign faster. We've increased close rate by 40% since switching.",
                name: "Sarah Chen",
                title: "Sales Director, HomePro Remodeling",
                stars: 5,
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
              },
              {
                quote: "Finally, a tool that understands construction. The margin protection alone has saved us thousands.",
                name: "James Thompson",
                title: "Founder, Luxe Renovations",
                stars: 5,
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
              }
            ].map((testimonial, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-800/30 border border-white/10 hover:border-[#00E5FF]/20 transition-colors">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.stars }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-[#00E5FF] text-[#00E5FF]" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#00E5FF]/30"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-[#0B1C3E]/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Pros <span className="text-[#00E5FF]">Switch</span>
            </h2>
            <p className="text-lg text-slate-400">The difference is night and day</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-4 text-slate-400 font-medium">Features</th>
                  <th className="p-4 text-slate-400 font-medium text-center">Spreadsheets</th>
                  <th className="p-4 text-center relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                      <span className="bg-[#00E5FF] text-[#0B1C3E] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        RECOMMENDED
                      </span>
                    </div>
                    <div className="bg-gradient-to-b from-[#00E5FF]/20 to-transparent rounded-t-xl py-4 border-2 border-[#00E5FF] border-b-0">
                      <span className="font-bold text-[#00E5FF]">EstimAIte</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Speed', spreadsheet: 'Hours', estimaite: 'Seconds' },
                  { feature: 'Accuracy', spreadsheet: 'Guesswork', estimaite: 'Market Rates' },
                  { feature: 'Visuals', spreadsheet: 'Text Only', estimaite: 'Photo-Realistic' },
                  { feature: 'AI Protection', spreadsheet: 'None', estimaite: 'Included' },
                  { feature: 'PDF Proposals', spreadsheet: 'Manual', estimaite: 'One-Click' },
                  { feature: 'Margin Control', spreadsheet: 'Error-Prone', estimaite: 'Guaranteed' },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td className="p-4 text-slate-300 font-medium">{row.feature}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <X className="w-5 h-5 text-red-400" />
                        <span className="text-slate-500">{row.spreadsheet}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center border-x-2 border-[#00E5FF] bg-[#00E5FF]/5">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5 text-[#00E5FF]" />
                        <span className="text-white font-medium">{row.estimaite}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                  <td className="p-4 border-x-2 border-b-2 border-[#00E5FF] rounded-b-xl bg-[#00E5FF]/5">
                    <Link to="/auth" className="block">
                      <Button className="w-full bg-[#00E5FF] text-[#0B1C3E] hover:bg-[#00E5FF]/90 font-bold">
                        Start Free Trial
                      </Button>
                    </Link>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#0B1C3E]/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, Transparent <span className="text-[#00E5FF]">Pricing</span>
            </h2>
            <p className="text-lg text-slate-400">Start free, upgrade when you&apos;re ready</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-slate-800/30 border border-white/10">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <p className="text-slate-400 mb-6">Perfect for solo contractors</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['5 estimates/month', 'Basic PDF proposals', 'Email support', 'Standard pricing config'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-slate-300">
                    <Check className="h-5 w-5 text-slate-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/auth">
                <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-white/10">
                  Get Started
                </Button>
              </Link>
            </div>

            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-[#00E5FF]/10 to-transparent border-2 border-[#00E5FF] shadow-[0_0_40px_rgba(0,229,255,0.2)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#00E5FF] text-[#0B1C3E] text-sm font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-slate-400 mb-6">For growing remodeling businesses</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited estimates', 'Premium PDF proposals', 'Email delivery & tracking', 'Advanced pricing config', 'Priority support', 'Custom branding'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-slate-300">
                    <Check className="h-5 w-5 text-[#00E5FF]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/auth">
                <Button className="w-full bg-[#00E5FF] text-[#0B1C3E] hover:bg-[#00E5FF]/90 font-bold shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to close more deals?
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join hundreds of Kitchen &amp; Bath remodelers who&apos;ve already made the switch to AI-powered estimating.
          </p>
          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-[#00E5FF] text-[#0B1C3E] hover:bg-[#00E5FF]/90 font-bold text-lg px-10 py-6 rounded-full shadow-[0_0_40px_rgba(0,229,255,0.4)] hover:shadow-[0_0_60px_rgba(0,229,255,0.6)] transition-all"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-slate-500">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <EstimAIteLogo size="sm" />
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} EstimAIte. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
