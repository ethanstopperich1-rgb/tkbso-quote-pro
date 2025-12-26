import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Check, MessageSquare, Camera, Zap, Shield, Clock, TrendingUp, Award, Menu, X, FileText, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { EstimAIteLogo } from '@/components/EstimAIteLogo';

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
    <div className="rounded-2xl bg-[#0F172A] border border-[#1E293B] p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-[#00E5FF]" />
        </div>
        <span className="font-semibold text-white">AI Estimator</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400">Online</span>
        </div>
      </div>
      <div className="space-y-3 min-h-[140px]">
        <div className="bg-[#1E293B] rounded-xl rounded-bl-sm p-4 max-w-[80%]">
          <p className="text-sm text-slate-300">What&apos;s the project?</p>
        </div>
        
        {stage >= 1 && (
          <div className="bg-[#00E5FF]/20 rounded-xl rounded-br-sm p-4 max-w-[85%] ml-auto">
            <p className="text-sm text-white">
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
          <div className="bg-[#1E293B] rounded-xl rounded-bl-sm p-4 max-w-[60%]">
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
          <div className="bg-[#1E293B] rounded-xl rounded-bl-sm p-4 max-w-[85%]">
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
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Sticky */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <EstimAIteLogo size="sm" />
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              <span>🚀</span>
              <span>Launching Jan 1, 2026</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-600 hover:text-[#0F172A] transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-slate-600 hover:text-[#0F172A] transition-colors">
              Pricing
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-slate-600 hover:text-[#0F172A] transition-colors">
              How It Works
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth" className="text-sm font-medium text-slate-600 hover:text-[#0F172A] transition-colors">
              Sign In
            </Link>
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] text-[#0F172A] px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Start Free Trial
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-6 py-4 space-y-4">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left text-sm font-medium text-slate-600">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-sm font-medium text-slate-600">Pricing</button>
            <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left text-sm font-medium text-slate-600">How It Works</button>
            <Link to="/auth" className="block text-sm font-medium text-slate-600">Sign In</Link>
            <Button onClick={() => navigate('/signup')} className="w-full bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] text-[#0F172A]">
              Start Free Trial
            </Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 bg-gradient-to-br from-[#0F172A] via-[#1E3A5F] to-[#0F172A]">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-full text-[#00E5FF] text-sm font-semibold mb-6">
              <span>⚡</span>
              <span>Contractors are closing 3x more deals with AI-powered estimates</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              AI-Powered Estimates That
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#3B82F6]"> Close Deals</span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Describe your project naturally—like texting a contractor friend. Get professional estimates in under 3 minutes. No forms, no spreadsheets.
            </p>

            {/* CTA Button */}
            <div className="mb-6">
              <Button 
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] text-[#0F172A] px-8 py-6 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-[#00E5FF]/30 transition-all"
              >
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <p className="text-sm text-slate-400">
              <Check className="inline h-4 w-4 text-green-400 mr-1" /> No credit card 
              <span className="mx-2">•</span>
              <Check className="inline h-4 w-4 text-green-400 mr-1" /> 14-day trial 
              <span className="mx-2">•</span>
              <Check className="inline h-4 w-4 text-green-400 mr-1" /> Setup in 3 minutes
            </p>
          </div>

          {/* Right Column - Dashboard Screenshot */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] blur-3xl opacity-20 rounded-3xl" />
            <div className="relative">
              <AnimatedChatDemo />
              
              {/* Quick Stats Instead of Video */}
              <div className="mt-6 bg-[#1E293B] rounded-2xl p-6 border border-[#00E5FF]/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white mb-1">3 min</p>
                    <p className="text-slate-400 text-sm">Average time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white mb-1">65%+</p>
                    <p className="text-slate-400 text-sm">Close rate</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/signup')}
                  className="w-full mt-4 bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] text-[#0F172A] py-3 font-semibold"
                >
                  Try It Free - No Credit Card →
                </Button>
              </div>
            </div>
            
            {/* Floating Stats Cards */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl border border-slate-200">
              <p className="text-[#00E5FF] font-bold text-2xl">3 min</p>
              <p className="text-slate-600 text-sm">Avg Estimate Time</p>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-xl border border-slate-200">
              <p className="text-[#0F172A] font-bold text-2xl">$171K</p>
              <p className="text-slate-600 text-sm">Total Value Tracked</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Metrics Bar */}
      <section className="bg-[#F8FAFC] py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Clock className="h-8 w-8 text-[#00E5FF]" />
              <p className="font-bold text-[#0F172A] text-2xl">3 Min</p>
              <p className="text-sm text-slate-600">Average Estimate Time</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Zap className="h-8 w-8 text-[#00E5FF]" />
              <p className="font-bold text-[#0F172A] text-2xl">10+ Hours</p>
              <p className="text-sm text-slate-600">Saved Per Week</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-8 w-8 text-[#00E5FF]" />
              <p className="font-bold text-[#0F172A] text-2xl">3x More</p>
              <p className="text-sm text-slate-600">Proposals Sent</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Award className="h-8 w-8 text-[#00E5FF]" />
              <p className="font-bold text-[#0F172A] text-2xl">65%+</p>
              <p className="text-sm text-slate-600">Average Close Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0F172A] mb-4">
              From Site Visit to Signed Contract in 3 Steps
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              No more spreadsheets. No more guessing. Just fast, accurate estimates.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#00E5FF] rounded-full flex items-center justify-center text-[#0F172A] font-bold text-xl z-10">1</div>
              <div className="bg-slate-50 rounded-2xl p-8 pt-12 h-full">
                <div className="w-16 h-16 bg-[#00E5FF]/20 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare className="h-8 w-8 text-[#00E5FF]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-3">Describe the Job</h3>
                <p className="text-slate-600">
                  Type naturally like you're texting another contractor. "Master bath remodel, 8x10, walk-in shower with bench."
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#00E5FF] rounded-full flex items-center justify-center text-[#0F172A] font-bold text-xl z-10">2</div>
              <div className="bg-slate-50 rounded-2xl p-8 pt-12 h-full">
                <div className="w-16 h-16 bg-[#00E5FF]/20 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-[#00E5FF]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-3">AI Builds Your Quote</h3>
                <p className="text-slate-600">
                  EstimAIte asks smart follow-up questions, then generates accurate line items with your pricing in under 3 minutes.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#00E5FF] rounded-full flex items-center justify-center text-[#0F172A] font-bold text-xl z-10">3</div>
              <div className="bg-slate-50 rounded-2xl p-8 pt-12 h-full">
                <div className="w-16 h-16 bg-[#00E5FF]/20 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-[#00E5FF]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-3">Send & Close</h3>
                <p className="text-slate-600">
                  Export a professional PDF proposal, send it to your client, and track when they view it. Close more deals, faster.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Single Method - Conversational Estimating */}
      <section id="features" className="bg-[#F8FAFC] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-[#0F172A]">
              The Fastest Way to Estimate
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              No forms. No spreadsheets. Just describe your project naturally—our AI handles the rest.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-slate-100">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Column - Features */}
              <div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-md">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4 text-[#0F172A]">
                  Conversational AI Estimating
                </h3>
                <p className="text-lg text-slate-600 mb-8">
                  Talk to EstimAIte like you're describing the job to another contractor. 
                  It understands your language and asks smart follow-up questions.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-5 w-5 text-[#00E5FF]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0F172A] mb-1">Speaks Contractor Language</p>
                      <p className="text-slate-600 text-sm">Say "3×5 walk-in shower" and it knows exactly what you mean</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-5 w-5 text-[#00E5FF]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0F172A] mb-1">Smart Follow-Up Questions</p>
                      <p className="text-slate-600 text-sm">AI asks only what it needs to know—no unnecessary forms</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-5 w-5 text-[#00E5FF]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0F172A] mb-1">Accurate Line Items</p>
                      <p className="text-slate-600 text-sm">Generates detailed breakdowns with your pricing automatically</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-5 w-5 text-[#00E5FF]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0F172A] mb-1">Professional PDFs</p>
                      <p className="text-slate-600 text-sm">Export branded proposals that look like they took hours to create</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-2 text-sm">
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
                    ⚡ Fastest Method
                  </span>
                  <span className="text-slate-500">Average: 2-3 minutes</span>
                </div>
              </div>

              {/* Right Column - Chat Demo */}
              <div>
                <AnimatedChatDemo />
                
                <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Lightbulb className="h-5 w-5 text-[#00E5FF]" />
                    <p className="font-semibold text-[#0F172A] text-sm">Pro Tip</p>
                  </div>
                  <p className="text-slate-600 text-sm">
                    Works great on mobile! Create estimates on-site while walking through the job.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Badge */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm">
              <Camera className="h-4 w-4" />
              <span className="font-medium">Photo & Video Analysis Coming Q1 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Contractors Choose EstimAIte */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0F172A] mb-4">
              Built for Contractors, By Contractors
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              EstimAIte understands how you work because it was built by someone who's been doing this for 20+ years
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Reason 1 */}
            <div className="bg-slate-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-[#00E5FF]/20 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="h-7 w-7 text-[#00E5FF]" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Speaks Your Language</h3>
              <p className="text-slate-600 leading-relaxed">
                Say "3×5 walk-in shower with bench" and it knows exactly what you mean. 
                No need to learn complicated software or fill out endless forms. Just talk naturally.
              </p>
            </div>

            {/* Reason 2 */}
            <div className="bg-slate-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-[#00E5FF]/20 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-[#00E5FF]" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Protects Your Margins</h3>
              <p className="text-slate-600 leading-relaxed">
                Built-in pricing intelligence ensures you never leave money on the table. 
                Track IC, CP, and margins automatically. Know your profit before sending the quote.
              </p>
            </div>

            {/* Reason 3 */}
            <div className="bg-slate-50 rounded-2xl p-8">
              <div className="w-14 h-14 bg-[#00E5FF]/20 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-7 w-7 text-[#00E5FF]" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Get Your Life Back</h3>
              <p className="text-slate-600 leading-relaxed">
                Stop spending evenings and weekends creating estimates. Generate professional, 
                detailed quotes in minutes—not hours. Spend more time with family or closing deals.
              </p>
            </div>
          </div>

          {/* Real Results Callout */}
          <div className="mt-12 bg-gradient-to-r from-[#00E5FF]/10 to-blue-50 rounded-2xl p-8 border border-[#00E5FF]/30">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-[#0F172A] mb-2">4 Hours → 10 Minutes</p>
                <p className="text-slate-600">Average time savings per estimate</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#0F172A] mb-2">30% → 65%</p>
                <p className="text-slate-600">Close rate improvement</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#0F172A] mb-2">$0 → $12K+</p>
                <p className="text-slate-600">Monthly profit increase potential</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-[#F8FAFC] py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, label: 'Bank-Level Security', desc: '256-bit SSL encryption' },
              { icon: Clock, label: 'Always Available', desc: '99.9% uptime guarantee' },
              { icon: Zap, label: 'Lightning Fast', desc: 'Estimates in under 3 min' },
              { icon: Check, label: 'Satisfaction Guaranteed', desc: '30-day money back' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                  <item.icon className="h-6 w-6 text-slate-600" />
                </div>
                <p className="font-bold text-[#0F172A]">{item.label}</p>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Simplified to 3 tiers */}
      <section id="pricing" className="bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00E5FF]/20 border border-[#00E5FF]/40 rounded-full text-[#00E5FF] text-sm font-semibold mb-6">
              <span>🚀</span>
              <span>Launch Pricing - Save 20%</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-300 text-center mb-16">Start free, upgrade when you're ready</p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-slate-200">
              <h3 className="text-2xl font-bold text-[#0F172A] mb-2">Starter</h3>
              <p className="text-slate-600 text-sm mb-4">For independent contractors</p>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#0F172A]">$79</span>
                  <span className="text-slate-600">/month</span>
                </div>
                <p className="text-xs text-slate-500 line-through">$99/month regular price</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#00E5FF] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>50 estimates</strong> per month</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">AI conversational interface</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Professional PDF export</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Logo upload</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Email support</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => navigate('/signup')}
                variant="outline"
                className="w-full py-6 font-semibold border-2 text-base"
              >
                Start 14-Day Trial
              </Button>
              <p className="text-xs text-slate-500 text-center mt-3">No credit card required</p>
            </div>

            {/* Pro Plan - MOST POPULAR */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[#00E5FF] relative shadow-2xl shadow-[#00E5FF]/20 transform md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] text-[#0F172A] text-sm font-bold px-6 py-2 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-[#0F172A] mb-2 mt-2">Pro</h3>
              <p className="text-slate-600 text-sm mb-4">For growing contractors</p>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[#0F172A]">$149</span>
                  <span className="text-slate-600">/month</span>
                </div>
                <p className="text-xs text-slate-500 line-through">$297/month regular price</p>
              </div>
              
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-cyan-800 font-medium text-center">
                  💰 Saves 10 hrs/week = $3,000+/month value
                </p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#00E5FF] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Unlimited estimates</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#00E5FF] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700"><strong>Custom pricing overrides</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Everything in Starter</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Advanced branding options</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Margin tracking & analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">Priority email support</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => navigate('/signup')}
                className="w-full bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] text-[#0F172A] py-6 font-semibold hover:shadow-lg text-base"
              >
                Start 14-Day Trial →
              </Button>
              <p className="text-xs text-slate-500 text-center mt-3">No credit card required</p>
            </div>

            {/* Team Plan */}
            <div className="bg-[#1E293B] rounded-2xl p-8 border-2 border-[#334155]">
              <h3 className="text-2xl font-bold text-white mb-2">Team</h3>
              <p className="text-slate-400 text-sm mb-4">For contractor teams</p>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">$299</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <p className="text-xs text-slate-500 line-through">$597/month regular price</p>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-300 font-medium text-center">
                  👥 Includes 3 user seats
                </p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong>3 user seats included</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300"><strong>Team collaboration</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Role permissions</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Priority phone support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Dedicated onboarding</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => navigate('/signup')}
                className="w-full bg-white text-[#0F172A] hover:bg-slate-100 py-6 font-semibold text-base"
              >
                Start 14-Day Trial →
              </Button>
              <p className="text-xs text-slate-500 text-center mt-3">No credit card required</p>
            </div>
          </div>

          {/* FAQ Note */}
          <div className="mt-12 text-center">
            <p className="text-slate-300 text-sm">
              Need more than 3 seats? <a href="/contact" className="text-[#00E5FF] hover:underline">Contact us</a> for custom Enterprise pricing
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0F172A] mb-6">
            Ready to Save 10+ Hours Every Week?
          </h2>
          <p className="text-xl text-[#0F172A]/80 mb-8">
            Join contractors who are estimating faster and closing more deals with EstimAIte
          </p>
          <Button 
            onClick={() => navigate('/signup')}
            className="bg-[#0F172A] text-white px-12 py-6 rounded-lg font-bold text-xl hover:bg-[#1E293B] transition-all shadow-2xl"
          >
            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-[#0F172A]/70 mt-4">
            <Check className="inline h-4 w-4 mr-1" /> No credit card required 
            <span className="mx-2">•</span>
            <Check className="inline h-4 w-4 mr-1" /> Setup in 3 minutes 
            <span className="mx-2">•</span>
            <Check className="inline h-4 w-4 mr-1" /> Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo & Copyright */}
            <div className="flex items-center gap-4">
              <EstimAIteLogo size="sm" className="brightness-0 invert" />
              <span className="text-slate-500 text-sm">© {new Date().getFullYear()} EstimAIte™. All rights reserved.</span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/security" className="hover:text-white transition-colors">Security</Link>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {/* X (Twitter) */}
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* Facebook */}
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
