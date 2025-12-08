import { Link } from 'react-router-dom';
import PageTemplate from '@/components/PageTemplate';

export default function PublicPricing() {
  return (
    <PageTemplate 
      title="Simple, Transparent Pricing" 
      subtitle="Start free, upgrade when you're ready"
    >
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Starter */}
        <div className="bg-slate-50 rounded-2xl p-8 border-2 border-slate-200">
          <h3 className="text-2xl font-bold mb-2 text-[#0F172A]">Starter</h3>
          <p className="text-slate-600 mb-6">Perfect for trying it out</p>
          <div className="mb-6">
            <span className="text-5xl font-bold text-[#0F172A]">$0</span>
            <span className="text-slate-600">/month</span>
          </div>
          <ul className="space-y-3 mb-8">
            {['5 estimates per month', 'Chat estimator', 'Basic PDF proposals', 'Email support'].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link 
            to="/signup" 
            className="block w-full text-center border-2 border-[#0F172A] text-[#0F172A] py-3 rounded-lg font-bold hover:bg-[#0F172A] hover:text-white transition"
          >
            Start Free
          </Link>
        </div>

        {/* Pro */}
        <div className="bg-gradient-to-br from-[#00E5FF] to-[#3B82F6] rounded-2xl p-8 border-2 border-[#00E5FF] relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full text-xs font-bold text-[#0F172A]">
            MOST POPULAR
          </div>
          <h3 className="text-2xl font-bold mb-2 text-[#0F172A]">Pro</h3>
          <p className="text-slate-800 mb-6">For serious contractors</p>
          <div className="mb-6">
            <span className="text-5xl font-bold text-[#0F172A]">$99</span>
            <span className="text-slate-800">/month</span>
          </div>
          <ul className="space-y-3 mb-8 text-[#0F172A]">
            {[
              'Unlimited estimates',
              'Photo & video analysis',
              'Custom branding',
              'Priority support',
              'Team collaboration',
              'API access'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-[#0F172A]">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link 
            to="/signup" 
            className="block w-full text-center bg-[#0F172A] text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition"
          >
            Start 14-Day Free Trial
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold mb-6 text-center text-[#0F172A]">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <details className="bg-slate-50 p-6 rounded-lg">
            <summary className="font-semibold cursor-pointer text-[#0F172A]">Do I need a credit card for the free trial?</summary>
            <p className="mt-2 text-slate-600">No! Start with the Starter plan for free, no credit card required. Upgrade to Pro when you're ready.</p>
          </details>
          <details className="bg-slate-50 p-6 rounded-lg">
            <summary className="font-semibold cursor-pointer text-[#0F172A]">Can I cancel anytime?</summary>
            <p className="mt-2 text-slate-600">Yes, cancel anytime with one click. No contracts, no commitments.</p>
          </details>
          <details className="bg-slate-50 p-6 rounded-lg">
            <summary className="font-semibold cursor-pointer text-[#0F172A]">What payment methods do you accept?</summary>
            <p className="mt-2 text-slate-600">We accept all major credit cards (Visa, Mastercard, Amex) via Stripe.</p>
          </details>
        </div>
      </div>
    </PageTemplate>
  );
}
