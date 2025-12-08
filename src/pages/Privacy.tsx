import PageTemplate from '@/components/PageTemplate';

export default function Privacy() {
  return (
    <PageTemplate 
      title="Privacy Policy" 
      subtitle="Last updated: December 8, 2025"
    >
      <div className="prose prose-slate max-w-none">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0F172A]">1. Information We Collect</h2>
        <p className="text-slate-600 mb-4">We collect information you provide directly to us, including:</p>
        <ul className="list-disc list-inside text-slate-600 space-y-2 mb-6">
          <li>Account information (name, email, company name)</li>
          <li>Project data (estimates, client information, photos)</li>
          <li>Payment information (processed securely through Stripe)</li>
          <li>Usage data (features used, login times)</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0F172A]">2. How We Use Your Information</h2>
        <p className="text-slate-600 mb-4">We use the information we collect to:</p>
        <ul className="list-disc list-inside text-slate-600 space-y-2 mb-6">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0F172A]">3. Information Sharing</h2>
        <p className="text-slate-600 mb-4">We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
        <ul className="list-disc list-inside text-slate-600 space-y-2 mb-6">
          <li>Service providers who assist in our operations</li>
          <li>Law enforcement when required by law</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0F172A]">4. Data Security</h2>
        <p className="text-slate-600 mb-6">We use industry-standard security measures to protect your data, including 256-bit SSL encryption, secure data centers, and regular security audits.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0F172A]">5. Your Rights</h2>
        <p className="text-slate-600 mb-4">You have the right to:</p>
        <ul className="list-disc list-inside text-slate-600 space-y-2 mb-6">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0F172A]">6. Contact Us</h2>
        <p className="text-slate-600 mb-6">For questions about this Privacy Policy, contact: privacy@estimaite.com</p>
      </div>
    </PageTemplate>
  );
}
