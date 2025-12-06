import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Play, 
  FileSpreadsheet, 
  Camera, 
  FileSignature, 
  MessageSquare, 
  Settings, 
  Zap,
  Check,
  Star,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EstimAIteLogo } from '@/components/EstimAIteLogo';

// Brand Colors
const NAVY = '#0B1C3E';
const ELECTRIC = '#00E5FF';

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
        {/* Background Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00E5FF] opacity-20 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-blue-600 opacity-10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/10 px-4 py-1.5 animate-fade-in">
            <Zap className="h-4 w-4 text-[#00E5FF] mr-2" />
            <span className="text-sm font-semibold text-[#00E5FF]">New: Visual Estimator v2.0</span>
          </div>

          {/* Headlines */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Stop Typing Estimates.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#00E5FF]">
              Start Building.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            The AI command center for Kitchen & Bath remodelers. Turn a 30-minute walkthrough into a 
            signed, deposit-paid contract before you leave the driveway.
          </p>

          {/* CTAs */}
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

          {/* App Screenshot */}
          <div className="mt-20 relative animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="relative rounded-2xl bg-slate-900/50 p-2 ring-1 ring-white/10 backdrop-blur-xl lg:p-4">
              <div className="rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 aspect-video flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#00E5FF]/20 flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 text-[#00E5FF]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Live Dashboard Preview</h3>
                  <p className="text-slate-400">AI-powered estimation in action</p>
                </div>
              </div>
            </div>
            {/* Glow behind screenshot */}
            <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-[#00E5FF] via-blue-600 to-[#00E5FF] opacity-20 blur-3xl rounded-3xl" />
          </div>
        </div>
      </section>

      {/* Problem/Solution Grid */}
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

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 hover:border-[#00E5FF]/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="h-7 w-7 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">No More Spreadsheets</h3>
              <p className="text-slate-400">
                Stop guessing margins on napkin math. Our AI calculates accurate costs in seconds, not hours.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 hover:border-[#00E5FF]/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-[#00E5FF]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="h-7 w-7 text-[#00E5FF]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Visual Estimates</h3>
              <p className="text-slate-400">
                Snap a photo, describe the scope, close the deal. AI understands your project instantly.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 hover:border-[#00E5FF]/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileSignature className="h-7 w-7 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Contracts</h3>
              <p className="text-slate-400">
                Generate signed PDF contracts before you leave the driveway. Close deals on the spot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Zig-Zag */}
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

          {/* Step 1 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-[#00E5FF] mb-4">
                <span className="w-8 h-8 rounded-full bg-[#00E5FF]/20 flex items-center justify-center text-sm font-bold">1</span>
                <span className="text-sm font-semibold uppercase tracking-wide">Describe</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Chat with Your Data</h3>
              <p className="text-slate-400 text-lg mb-6">
                Just talk to the AI like you'd describe the job to your crew. "3x5 shower, full tile, frameless glass" — 
                that's all it takes. The AI extracts dimensions, materials, and scope automatically.
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
              <div className="rounded-2xl bg-slate-800/50 border border-white/10 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-[#00E5FF]" />
                  </div>
                  <span className="font-semibold">AI Estimator</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-slate-700/50 rounded-xl rounded-bl-sm p-4 max-w-[80%]">
                    <p className="text-sm text-slate-300">What's the project?</p>
                  </div>
                  <div className="bg-[#00E5FF]/20 rounded-xl rounded-br-sm p-4 max-w-[80%] ml-auto">
                    <p className="text-sm">Master bath remodel, 8x10, walk-in shower with bench, double vanity</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl rounded-bl-sm p-4 max-w-[80%]">
                    <p className="text-sm text-slate-300">Got it! I'm calculating your estimate now...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
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

          {/* Step 3 */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 text-[#00E5FF] mb-4">
                <span className="w-8 h-8 rounded-full bg-[#00E5FF]/20 flex items-center justify-center text-sm font-bold">3</span>
                <span className="text-sm font-semibold uppercase tracking-wide">Close</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Send & Get Signed</h3>
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
                <div className="flex items-center justify-between mb-6">
                  {['Draft', 'Sent', 'Viewed', 'Signed', 'Paid'].map((stage, i) => (
                    <div key={stage} className="flex items-center">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        i <= 3 ? 'bg-[#00E5FF] text-[#0B1C3E]' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {stage}
                      </div>
                      {i < 4 && <ChevronRight className={`h-4 w-4 mx-1 ${i < 3 ? 'text-[#00E5FF]' : 'text-slate-600'}`} />}
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

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Trusted by <span className="text-[#00E5FF]">Orlando's Best</span>
            </h2>
            <p className="text-lg text-slate-400">
              Real contractors, real results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "I used to spend 2 hours on each estimate. Now it takes 5 minutes. The AI gets my pricing right every time.",
                name: "Mike Rodriguez",
                title: "Owner, Premier Bath & Kitchen",
                stars: 5
              },
              {
                quote: "The PDF proposals look so professional, clients sign faster. We've increased close rate by 40% since switching.",
                name: "Sarah Chen",
                title: "Sales Director, HomePro Remodeling",
                stars: 5
              },
              {
                quote: "Finally, a tool that understands construction. The margin protection alone has saved us thousands.",
                name: "James Thompson",
                title: "Founder, Luxe Renovations",
                stars: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-800/30 border border-white/10">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.stars }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-[#00E5FF] text-[#00E5FF]" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.title}</p>
                </div>
              </div>
            ))}
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
            <p className="text-lg text-slate-400">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Starter */}
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

            {/* Pro */}
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
            Join hundreds of Kitchen & Bath remodelers who've already made the switch to AI-powered estimating.
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
