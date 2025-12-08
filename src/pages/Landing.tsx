import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Play, Check, Star, MessageSquare, Camera, Video, Zap, Shield, Clock } from 'lucide-react';
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
    <div className="rounded-2xl bg-slate-800/50 border border-white/10 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-cyan-400" />
        </div>
        <span className="font-semibold text-white">AI Estimator</span>
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
          <div className="bg-cyan-400/20 rounded-xl rounded-br-sm p-4 max-w-[85%] ml-auto">
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
          <div className="bg-slate-700/50 rounded-xl rounded-bl-sm p-4 max-w-[60%]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                <p className="text-sm text-slate-300 mb-2">Quote Generated: <span className="text-cyan-400 font-bold">$22,900</span>. Ready to review?</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded-full">View Details</span>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-2xl">✨</span>
          </div>
          <div className="text-2xl font-bold">
            <span className="text-white">Estim</span>
            <span className="text-cyan-400">AI</span>
            <span className="text-white">te</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-slate-300 hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">Pricing</a>
        </div>
        <Link to="/auth">
          <Button variant="outline" className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 font-semibold transition-all">
            Sign In
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Value Prop */}
        <div>
          <div className="inline-block px-4 py-2 bg-cyan-400/20 border border-cyan-400/50 rounded-full text-cyan-400 text-sm font-semibold mb-6">
            🚀 Close 3x More Deals Without Hiring an Estimator
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            AI-Powered Estimates That
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"> Close Deals</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Upload a photo, describe the job, or record a video. 
            Get a professional estimate with visualizations in under 3 minutes.
          </p>

          {/* Social Proof */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-slate-900" />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-yellow-400">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-sm text-slate-400">Trusted by 500+ contractors</p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 px-8 py-6 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all"
            >
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" className="border-2 border-slate-600 text-white px-8 py-6 rounded-lg font-semibold hover:border-slate-400 hover:bg-transparent transition-all">
              <Play className="mr-2 h-5 w-5" /> Watch Demo
            </Button>
          </div>

          <p className="text-sm text-slate-500 mt-4">
            ✓ No credit card required • ✓ 14-day free trial • ✓ Cancel anytime
          </p>
        </div>

        {/* Right: Interactive Demo/Screenshot */}
        <div className="relative">
          {/* Floating Screenshot with Glow */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 blur-3xl opacity-30 rounded-3xl" />
            <AnimatedChatDemo />
          </div>
          
          {/* Floating Stats Cards */}
          <div className="absolute -bottom-6 -left-6 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-xl p-4 shadow-xl">
            <p className="text-cyan-400 font-bold text-2xl">3 min</p>
            <p className="text-slate-400 text-sm">Avg. Estimate Time</p>
          </div>
          
          <div className="absolute -top-6 -right-6 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-xl p-4 shadow-xl">
            <p className="text-green-400 font-bold text-2xl">35%</p>
            <p className="text-slate-400 text-sm">Avg. Margin Increase</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-slate-900">Three Ways to Estimate</h2>
          <p className="text-xl text-slate-600 text-center mb-16">Choose the method that fits your workflow</p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Chat Estimator */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">Chat Estimator</h3>
              <p className="text-slate-600 mb-4">
                Type naturally: "10x12 kitchen, quartz counters, shaker cabinets"
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">Fastest</span>
                <span className="text-slate-500">~2 minutes</span>
              </div>
            </div>

            {/* Photo-to-Quote */}
            <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-2 border-cyan-400">
              <div className="absolute -top-3 right-8 bg-cyan-400 text-slate-900 px-3 py-1 rounded-full text-xs font-bold">
                MOST POPULAR
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Camera className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">Photo-to-Quote</h3>
              <p className="text-slate-600 mb-4">
                Upload photos, AI identifies fixtures & estimates quantities
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">Most Accurate</span>
                <span className="text-slate-500">~3 minutes</span>
              </div>
            </div>

            {/* Video Walk-and-Talk */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Video className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">Video Walk-and-Talk</h3>
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
      <section id="how-it-works" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-slate-900">How It Works</h2>
          <p className="text-xl text-slate-600 text-center mb-16">From walkthrough to signed contract in minutes</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: Camera, title: 'Capture', desc: 'Snap photos, record video, or describe the project in chat' },
              { step: '2', icon: Zap, title: 'Generate', desc: 'AI analyzes scope and creates detailed line-item estimate' },
              { step: '3', icon: Check, title: 'Close', desc: 'Send professional proposal, collect signature & deposit' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto">
                    <item.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">Trusted by Kitchen & Bath Pros</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "EstimAIte saved me 10 hours per week on estimating. Now I can focus on selling and building.",
                author: "Mike Rodriguez",
                title: "Owner, Premier Kitchen Remodeling",
                stat: "3x more quotes per week"
              },
              {
                quote: "The visualizer feature closes deals on the spot. Clients can SEE what they're buying.",
                author: "Sarah Chen",
                title: "Lead Designer, Bath Transformations",
                stat: "45% higher close rate"
              },
              {
                quote: "We increased our average margin by 8% just by catching forgotten line items.",
                author: "David Thompson",
                title: "Estimator, Elite Renovations",
                stat: "$12K more profit/month"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                  {[1,2,3,4,5].map(j => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-700 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full" />
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.author}</p>
                    <p className="text-sm text-slate-600">{testimonial.title}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-cyan-600 font-bold">{testimonial.stat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Shield, label: 'Bank-Level Security', desc: '256-bit SSL encryption' },
              { icon: Clock, label: 'Always Available', desc: '99.9% uptime guarantee' },
              { icon: Zap, label: 'Lightning Fast', desc: 'Estimates in under 3 min' },
              { icon: Check, label: 'Satisfaction Guaranteed', desc: '30-day money back' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                  <item.icon className="h-6 w-6 text-slate-600" />
                </div>
                <p className="font-semibold text-slate-900">{item.label}</p>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-400 text-center mb-16">Start free, upgrade when you're ready</p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-2xl font-bold mb-2 text-white">Starter</h3>
              <p className="text-slate-400 mb-6">Perfect for trying it out</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['5 estimates per month', 'Chat estimator', 'Basic PDF proposals', 'Email support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300">
                    <Check className="h-5 w-5 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => navigate('/signup')}
                variant="outline" 
                className="w-full border-slate-600 text-white hover:bg-slate-700"
              >
                Get Started Free
              </Button>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl p-8 relative">
              <div className="absolute -top-3 right-8 bg-white text-slate-900 px-3 py-1 rounded-full text-xs font-bold">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900">Pro</h3>
              <p className="text-slate-800 mb-6">For serious contractors</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$99</span>
                <span className="text-slate-800">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited estimates', 'Photo & video analysis', 'Custom branding', 'Priority support', 'Team collaboration', 'API access'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-900">
                    <Check className="h-5 w-5 text-slate-900" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => navigate('/signup')}
                className="w-full bg-slate-900 text-white hover:bg-slate-800"
              >
                Start 14-Day Free Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-cyan-400 to-blue-500 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Ready to Close More Deals?
          </h2>
          <p className="text-xl text-slate-800 mb-8">
            Join 500+ contractors who are estimating faster and closing more deals with EstimAIte
          </p>
          <Button 
            onClick={() => navigate('/signup')}
            className="bg-slate-900 text-white px-12 py-6 rounded-lg font-bold text-xl hover:bg-slate-800 transition-all shadow-2xl"
          >
            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-slate-800 mt-4">
            ✓ No credit card required • ✓ Setup in 3 minutes • ✓ Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">✨</span>
              </div>
              <div className="text-xl font-bold">
                <span className="text-white">Estim</span>
                <span className="text-cyan-400">AI</span>
                <span className="text-white">te</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-sm text-slate-500">© 2024 EstimAIte. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
