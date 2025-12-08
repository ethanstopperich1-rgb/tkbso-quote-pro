import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function PublicPricing() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg"></div>
            <span className="text-xl font-bold text-slate-900">
              Estim<span className="text-cyan-500">AI</span>te
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-slate-600 hover:text-slate-900 transition font-medium">Features</Link>
            <Link to="/plans" className="text-slate-900 font-semibold">Pricing</Link>
            <Link to="/contact" className="text-slate-600 hover:text-slate-900 transition font-medium">Contact</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-slate-600 hover:text-slate-900 transition font-medium">Sign In</Link>
            <Link to="/auth" className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 px-5 py-2 rounded-lg font-bold hover:shadow-lg transition-all">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-32 pb-16 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Choose the plan that fits your business. Start free, upgrade when you're ready.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* STARTER */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Starter</h3>
              <p className="text-slate-600">Perfect for trying it out</p>
            </div>
            
            <div className="mb-6">
              <span className="text-5xl font-bold text-slate-900">$0</span>
              <span className="text-slate-600">/month</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">5 estimates per month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Chat Estimator only</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Basic PDF proposals</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Community support</span>
              </li>
            </ul>

            <Link 
              to="/auth" 
              className="block w-full text-center border-2 border-slate-900 text-slate-900 py-3 rounded-lg font-bold hover:bg-slate-900 hover:text-white transition"
            >
              Start Free
            </Link>
          </div>

          {/* PRO - MOST POPULAR */}
          <div className="bg-white rounded-2xl border-2 border-cyan-400 p-8 flex flex-col relative lg:scale-105 shadow-xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">
              MOST POPULAR
            </div>
            
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
              <p className="text-slate-600">For serious contractors</p>
            </div>
            
            <div className="mb-2">
              <span className="text-5xl font-bold text-slate-900">$597</span>
              <span className="text-slate-600">/month</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              or $5,370/year <span className="text-green-600 font-semibold">(save $1,794)</span>
            </p>

            {/* ROI Callout */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-cyan-800 font-medium">
                💰 Saves 10 hrs/week = $6,000/month in time
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 font-semibold">Unlimited estimates</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Chat Estimator</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 font-semibold">Photo-to-Quote (AI analysis)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 font-semibold">Video Walk-and-Talk (AI analysis)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Custom branding (logo, colors)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Forgotten Items Checker</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Before/After Visualizer</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Priority email support</span>
              </li>
            </ul>

            <Link 
              to="/auth" 
              className="block w-full text-center bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
            >
              Start 14-Day Trial →
            </Link>
            <p className="text-xs text-slate-500 text-center mt-2">No credit card required • Cancel anytime</p>
          </div>

          {/* PREMIUM */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium</h3>
              <p className="text-slate-600">For growing teams</p>
            </div>
            
            <div className="mb-2">
              <span className="text-5xl font-bold text-slate-900">$1,197</span>
              <span className="text-slate-600">/month</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              or $10,773/year <span className="text-green-600 font-semibold">(save $3,591)</span>
            </p>

            {/* Value Callout */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-800 font-medium">
                👥 Includes 3 user seats (save $297/month)
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 font-semibold">Everything in Pro</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 font-semibold">3 user seats included</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Team collaboration tools</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">API access</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">White-label proposals</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Priority phone support</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">Early access to new features</span>
              </li>
            </ul>

            <Link 
              to="/auth" 
              className="block w-full text-center bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition"
            >
              Start 14-Day Trial →
            </Link>
            <p className="text-xs text-slate-500 text-center mt-2">No credit card required • Cancel anytime</p>
          </div>

          {/* ENTERPRISE */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-8 flex flex-col text-white">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-slate-300">For large operations</p>
            </div>
            
            <div className="mb-2">
              <span className="text-3xl font-bold">Starting at</span>
            </div>
            <div className="mb-4">
              <span className="text-5xl font-bold">$2,997</span>
              <span className="text-slate-300">/month</span>
            </div>

            {/* Target Callout */}
            <div className="bg-white/10 border border-white/20 rounded-lg p-3 mb-6">
              <p className="text-sm font-medium">
                🏢 For showrooms, franchises & multi-crew shops
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">Everything in Premium</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">Unlimited user seats</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Custom integrations (QuickBooks, n8n)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>On-site training & onboarding</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>SLA guarantees (99.9% uptime)</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Custom feature development</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Priority roadmap influence</span>
              </li>
            </ul>

            <Link 
              to="/contact" 
              className="block w-full text-center bg-white text-slate-900 py-3 rounded-lg font-bold hover:bg-slate-100 transition"
            >
              Contact Sales
            </Link>
            <p className="text-xs text-slate-400 text-center mt-2">Schedule a demo with our team</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white border border-slate-200 rounded-xl p-6 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-slate-900">
                Do I need a credit card to start the free trial?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-600">No! Start with the Starter plan for free, or try Pro/Premium with a 14-day trial—no credit card required.</p>
            </details>
            <details className="bg-white border border-slate-200 rounded-xl p-6 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-slate-900">
                Can I switch plans anytime?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-600">Yes! Upgrade or downgrade anytime. When upgrading, you'll only pay the prorated difference. When downgrading, changes take effect at your next billing cycle.</p>
            </details>
            <details className="bg-white border border-slate-200 rounded-xl p-6 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-slate-900">
                What happens if I hit my estimate limit?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-600">On the Starter plan, you'll be prompted to upgrade once you reach 5 estimates. Pro, Premium, and Enterprise plans have unlimited estimates.</p>
            </details>
            <details className="bg-white border border-slate-200 rounded-xl p-6 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-slate-900">
                Is my data secure?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-600">Absolutely. We use bank-level 256-bit SSL encryption, SOC 2 Type II certified data centers, and never share your data with third parties.</p>
            </details>
            <details className="bg-white border border-slate-200 rounded-xl p-6 group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-slate-900">
                Can I cancel anytime?
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-slate-600">Yes, cancel anytime with one click. No contracts, no commitments, no questions asked.</p>
            </details>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Ready to Close More Deals?</h2>
            <p className="text-lg text-slate-800 mb-8 max-w-2xl mx-auto">
              Join contractors who are estimating 10x faster and winning more projects with AI-powered proposals.
            </p>
            <Link 
              to="/auth" 
              className="inline-block bg-slate-900 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-800 transition"
            >
              Start Your Free Trial →
            </Link>
            <p className="text-sm text-slate-700 mt-4">✓ No credit card required • ✓ Setup in 3 minutes • ✓ Cancel anytime</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg"></div>
              <span className="font-bold">EstimAIte</span>
              <span className="text-slate-500 ml-2">© 2025 All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-slate-400">
              <Link to="/terms" className="hover:text-white transition">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link to="/security" className="hover:text-white transition">Security</Link>
              <Link to="/contact" className="hover:text-white transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
