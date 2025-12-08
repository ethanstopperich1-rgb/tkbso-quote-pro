import PageTemplate from '@/components/PageTemplate';

export default function Terms() {
  return (
    <PageTemplate 
      title="Terms of Service" 
      subtitle="Last updated: December 8, 2025"
    >
      <div className="prose prose-slate max-w-none">
        <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0F172A]">1. Acceptance of Terms</h2>
        <p className="text-slate-600 mb-6">By accessing and using EstimAIte ("Service"), you accept and agree to be bound by the terms and provision of this agreement.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0F172A]">2. Use License</h2>
        <p className="text-slate-600 mb-6">Permission is granted to temporarily use EstimAIte for personal, non-transferable purposes. This is the grant of a license, not a transfer of title.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0F172A]">3. Account Terms</h2>
        <ul className="list-disc list-inside text-slate-600 space-y-2 mb-6">
          <li>You must be 18 years or older to use this Service</li>
          <li>You must provide a valid email address and any other information requested</li>
          <li>You are responsible for maintaining the security of your account and password</li>
          <li>You may not use the Service for any illegal purposes</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0F172A]">4. Payment Terms</h2>
        <p className="text-slate-600 mb-6">For paid accounts, you will be billed in advance on a recurring monthly basis. You can cancel your subscription at any time.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0F172A]">5. Cancellation and Termination</h2>
        <p className="text-slate-600 mb-6">You may cancel your account at any time. Upon cancellation, your account will be downgraded to the free tier. We reserve the right to refuse service to anyone for any reason at any time.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0F172A]">6. Modifications to the Service</h2>
        <p className="text-slate-600 mb-6">We reserve the right to modify or discontinue the Service with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.</p>

        <h2 className="text-2xl font-bold mt-8 mb-4 text-[#0F172A]">7. Contact Information</h2>
        <p className="text-slate-600 mb-6">Questions about the Terms of Service should be sent to: legal@estimaite.com</p>
      </div>
    </PageTemplate>
  );
}
