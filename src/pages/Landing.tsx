import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Check, Star, MessageSquare, Camera, Video, Zap, Shield, Clock, Users, TrendingUp, Award, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">
              <span className="text-[#0F172A]">Estim</span>
              <span className="text-[#00E5FF]">AI</span>
              <span className="text-[#0F172A]">te</span>
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
              <span>🚀</span>
              <span>Join 500+ contractors closing 3x more deals</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              AI-Powered Estimates That
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#3B82F6]"> Close Deals</span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Upload a photo, describe the job, or record a video. Get professional estimates in under 3 minutes.
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

      {/* Social Proof Bar */}
      <section className="bg-[#F8FAFC] py-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Users className="h-6 w-6 text-slate-600" />
              <p className="font-bold text-[#0F172A]">500+ Contractors</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 text-yellow-400">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="font-bold text-[#0F172A]">4.9/5 Stars</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Award className="h-6 w-6 text-slate-600" />
              <p className="font-bold text-[#0F172A]">NARI Certified</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-6 w-6 text-slate-600" />
              <p className="font-bold text-[#0F172A]">$12K+ Avg. Monthly Profit</p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Ways to Estimate */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-[#0F172A]">Three Ways to Estimate</h2>
          <p className="text-xl text-slate-600 text-center mb-16">Choose the method that fits your workflow</p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Chat Estimator */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-md">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#0F172A]">Chat Estimator</h3>
              <p className="text-slate-600 mb-4">
                Type naturally: "10x12 kitchen, quartz counters, shaker cabinets"
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">Fastest</span>
                <span className="text-slate-500">~2 minutes</span>
              </div>
            </div>

            {/* Photo-to-Quote - Featured */}
            <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-2 border-[#00E5FF]">
              <div className="absolute -top-3 right-8 bg-[#00E5FF] text-[#0F172A] px-3 py-1 rounded-full text-xs font-bold">
                MOST POPULAR
              </div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-md">
                <Camera className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#0F172A]">Photo-to-Quote</h3>
              <p className="text-slate-600 mb-4">
                Upload photos, AI identifies fixtures & estimates quantities
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">Most Accurate</span>
                <span className="text-slate-500">~3 minutes</span>
              </div>
            </div>

            {/* Video Walk-and-Talk */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 shadow-md">
                <Video className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#0F172A]">Video Walk-and-Talk</h3>
              <p className="text-slate-600 mb-4">
                Record yourself narrating the scope while walking the space
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">Most Detail</span>
                <span className="text-slate-500">~4 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-[#F8FAFC] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-[#0F172A]">How It Works</h2>
          <p className="text-xl text-slate-600 text-center mb-16">From walkthrough to signed contract in minutes</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: Camera, title: 'Capture', desc: 'Take photos or record video of the space' },
              { step: '2', icon: Zap, title: 'Generate', desc: 'AI builds comprehensive estimate with pricing' },
              { step: '3', icon: Check, title: 'Close', desc: 'Send professional proposal and get e-signature' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-[#00E5FF] rounded-2xl flex items-center justify-center mx-auto">
                    <item.icon className="h-10 w-10 text-[#0F172A]" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#0F172A] text-white rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#0F172A]">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-16 border-y border-slate-100">
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

      {/* Pricing */}
      <section id="pricing" className="bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-300 text-center mb-16">Start free, upgrade when you're ready</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Starter Plan */}
            <div className="bg-[#1E293B] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
              <p className="text-slate-400 text-sm mb-4">Perfect for trying it out</p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {['5 estimates per month', 'Chat Estimator only', 'Basic PDF proposals', 'Community support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => navigate('/signup')}
                className="w-full bg-white text-[#0F172A] hover:bg-slate-100 py-5 font-semibold"
              >
                Start Free
              </Button>
            </div>

            {/* Pro Plan - Featured */}
            <div className="relative bg-white rounded-2xl p-6 lg:scale-105 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] text-[#0F172A] px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">Pro</h3>
              <p className="text-slate-600 text-sm mb-1">For serious contractors</p>
              <div className="mb-1">
                <span className="text-4xl font-bold text-[#0F172A]">$597</span>
                <span className="text-slate-600">/month</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">or $5,370/year <span className="text-green-600 font-semibold">(save $1,794)</span></p>
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-2 mb-4">
                <p className="text-xs text-cyan-800 font-medium">💰 Saves 10 hrs/week = $6,000/month</p>
              </div>
              <ul className="space-y-2 mb-6">
                {['Unlimited estimates', 'Photo-to-Quote (AI)', 'Video Walk-and-Talk (AI)', 'Custom branding', 'Forgotten Items Checker', 'Priority email support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                    <span className={i < 3 ? 'font-semibold' : ''}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => navigate('/signup')}
                className="w-full bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] text-[#0F172A] py-5 font-semibold hover:shadow-lg"
              >
                Start 14-Day Trial →
              </Button>
              <p className="text-xs text-slate-500 text-center mt-2">No credit card required</p>
            </div>

            {/* Premium Plan */}
            <div className="bg-[#1E293B] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
              <p className="text-slate-400 text-sm mb-1">For growing teams</p>
              <div className="mb-1">
                <span className="text-4xl font-bold text-white">$1,197</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-xs text-slate-500 mb-3">or $10,773/year <span className="text-green-500 font-semibold">(save $3,591)</span></p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-4">
                <p className="text-xs text-blue-300 font-medium">👥 Includes 3 user seats</p>
              </div>
              <ul className="space-y-2 mb-6">
                {['Everything in Pro', '3 user seats included', 'Team collaboration', 'API access', 'White-label proposals', 'Priority phone support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className={i < 2 ? 'font-semibold' : ''}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => navigate('/signup')}
                className="w-full bg-white text-[#0F172A] hover:bg-slate-100 py-5 font-semibold"
              >
                Start 14-Day Trial →
              </Button>
              <p className="text-xs text-slate-500 text-center mt-2">No credit card required</p>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gradient-to-br from-[#0F172A] to-blue-900 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-slate-400 text-sm mb-1">For large operations</p>
              <p className="text-xs text-slate-500 mb-1">Starting at</p>
              <div className="mb-3">
                <span className="text-4xl font-bold text-white">$2,997</span>
                <span className="text-slate-400">/month</span>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-lg p-2 mb-4">
                <p className="text-xs text-white font-medium">🏢 For showrooms & franchises</p>
              </div>
              <ul className="space-y-2 mb-6">
                {['Everything in Premium', 'Unlimited user seats', 'Custom integrations', 'Dedicated account manager', 'On-site training', 'SLA guarantees'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                    <span className={i < 2 ? 'font-semibold' : ''}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => navigate('/contact')}
                className="w-full bg-white text-[#0F172A] hover:bg-slate-100 py-5 font-semibold"
              >
                Contact Sales
              </Button>
              <p className="text-xs text-slate-500 text-center mt-2">Schedule a demo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#0F172A] mb-6">
            Ready to Close More Deals?
          </h2>
          <p className="text-xl text-[#0F172A]/80 mb-8">
            Join 500+ contractors estimating faster and closing more with EstimAIte
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
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">Estim</span>
              <span className="text-xl font-bold text-[#00E5FF]">AI</span>
              <span className="text-xl font-bold text-white">te</span>
              <span className="text-slate-500 ml-4 text-sm">© 2025 All rights reserved.</span>
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
