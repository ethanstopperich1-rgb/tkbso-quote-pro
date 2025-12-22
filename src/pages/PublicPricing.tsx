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
            <div className="bg-muted/30 border border-border rounded-lg p-3 mb-6">
              <p className="text-sm text-foreground font-medium">
                Saves 10 hours per week = $6,000/month in time
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
            <div className="bg-muted/30 border border-border rounded-lg p-3 mb-6">
              <p className="text-sm text-foreground font-medium">
                Includes 3 user seats (save $297/month)
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
                For showrooms, franchises & multi-crew shops
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
            <p className="text-sm text-slate-700 mt-4">No credit card required · Setup in 3 minutes · Cancel anytime</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo & Copyright */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Estim</span>
              <span className="text-xl font-bold text-cyan-400">AI</span>
              <span className="text-xl font-bold">te</span>
              <span className="text-slate-500 ml-4 text-sm">© 2025 All rights reserved.</span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link to="/terms" className="hover:text-white transition">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link to="/security" className="hover:text-white transition">Security</Link>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {/* X (Twitter) */}
              <a href="#" className="text-slate-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              {/* Facebook */}
              <a href="#" className="text-slate-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="text-slate-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              {/* Instagram */}
              <a href="#" className="text-slate-400 hover:text-white transition">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
