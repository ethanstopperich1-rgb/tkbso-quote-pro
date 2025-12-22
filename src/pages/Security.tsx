import PageTemplate from '@/components/PageTemplate';

export default function Security() {
  return (
    <PageTemplate 
      title="Security" 
      subtitle="Your data is protected by enterprise-grade security"
    >
      <div className="space-y-12">
        {/* Security Features */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-foreground font-sans">Security Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-muted/30 p-6 rounded-lg border border-border">
              <h3 className="font-semibold mb-2 text-foreground font-sans">256-bit SSL Encryption</h3>
              <p className="text-muted-foreground">All data transmitted between your browser and our servers is encrypted using industry-standard SSL/TLS protocols.</p>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg border border-border">
              <h3 className="font-semibold mb-2 text-foreground font-sans">Secure Data Centers</h3>
              <p className="text-muted-foreground">Your data is stored in SOC 2 Type II certified data centers with 24/7 monitoring and physical security.</p>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg border border-border">
              <h3 className="font-semibold mb-2 text-foreground font-sans">Two-Factor Authentication</h3>
              <p className="text-muted-foreground">Add an extra layer of security to your account with optional 2FA via authenticator apps.</p>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg border border-border">
              <h3 className="font-semibold mb-2 text-foreground font-sans">Regular Audits</h3>
              <p className="text-muted-foreground">We conduct regular security audits and penetration testing to identify and fix vulnerabilities.</p>
            </div>
          </div>
        </div>

        {/* Compliance */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-[#0F172A]">Compliance</h2>
          <div className="bg-slate-50 p-8 rounded-lg">
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span><strong className="text-[#0F172A]">GDPR Compliant:</strong> <span className="text-slate-600">We comply with European data protection regulations</span></span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span><strong className="text-[#0F172A]">CCPA Compliant:</strong> <span className="text-slate-600">California residents have full control over their data</span></span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <span><strong className="text-[#0F172A]">SOC 2 Type II:</strong> <span className="text-slate-600">Annual audits verify our security controls</span></span>
              </li>
            </ul>
          </div>
        </div>

        {/* Report Issue */}
        <div className="bg-muted/30 border border-border rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-3 text-foreground font-sans">Found a security issue?</h3>
          <p className="text-muted-foreground mb-4">We take security seriously. If you discover a vulnerability, please report it responsibly to: security@estimaite.com</p>
          <p className="text-sm text-muted-foreground">We offer rewards for responsibly disclosed security vulnerabilities.</p>
        </div>
      </div>
    </PageTemplate>
  );
}
