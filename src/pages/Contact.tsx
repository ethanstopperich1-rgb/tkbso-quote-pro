import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MessageSquare, HelpCircle, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EstimAIteLogo } from '@/components/EstimAIteLogo';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20, "Phone number is too long"),
  message: z.string().trim().max(2000, "Message must be less than 2000 characters").optional(),
});

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = contactSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      // Send to lead-followup edge function
      const { data, error } = await supabase.functions.invoke('lead-followup', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message || undefined,
          source: 'contact',
        },
      });

      if (error) throw error;

      // Also send to n8n webhook for automation
      try {
        await fetch('https://estopperich.app.n8n.cloud/webhook-test/estimaite-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'no-cors',
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message || '',
            source: 'contact',
            timestamp: new Date().toISOString(),
          }),
        });
        console.log('[Contact] n8n webhook triggered');
      } catch (n8nError) {
        console.warn('[Contact] n8n webhook failed (non-blocking):', n8nError);
      }

      setIsSubmitted(true);
      
      // Different message if phone was provided
      if (formData.phone) {
        toast.success('Thanks! Expect a call within 15 minutes. 📞');
      } else {
        toast.success("Thanks! We'll respond via email within 24 hours. 📧");
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error("Something went wrong. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <EstimAIteLogo size="sm" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-sm font-medium text-slate-600 hover:text-[#0F172A] transition-colors">
              Sign In
            </Link>
            <Button asChild className="bg-[#0F172A] text-white hover:bg-[#1E293B]">
              <Link to="/signup">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-['Cormorant_Garamond'] text-5xl md:text-6xl font-semibold text-[#0F172A] mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Have questions about EstimAIte? We're here to help you transform your estimating process.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Form - Takes 3 columns */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-slate-100">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-[#0F172A] mb-4">
                      Message Received!
                    </h3>
                    <p className="text-slate-600 text-lg mb-2">
                      Thanks for reaching out, <strong>{formData.name}</strong>.
                    </p>
                    <p className="text-slate-500 mb-8">
                      You'll receive a confirmation email shortly, and one of our team members will call you soon.
                    </p>
                    <Button 
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: '', email: '', phone: '', message: '' });
                      }}
                      variant="outline"
                      className="border-slate-300"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#0F172A] mb-6">
                      Send Us a Message
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-slate-700 font-medium">
                            Full Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="John Smith"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0F172A] transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-700 font-medium">
                            Email Address <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0F172A] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-700 font-medium">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0F172A] transition-colors"
                        />
                        <p className="text-xs text-slate-500">We'll give you a quick call to discuss your needs</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-slate-700 font-medium">
                          Message <span className="text-slate-400">(optional)</span>
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="Tell us about your business and how we can help..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={5}
                          className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0F172A] transition-colors resize-none"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-14 bg-[#0F172A] hover:bg-[#1E293B] text-white text-base font-semibold rounded-xl transition-all"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="animate-spin">⏳</span>
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Send Message
                          </span>
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Contact Info - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Direct Contact */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h3 className="font-['Cormorant_Garamond'] text-xl font-semibold text-[#0F172A] mb-6">
                  Direct Contact
                </h3>
                <div className="space-y-5">
                  <a 
                    href="mailto:support@estimaite.com" 
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-[#0F172A] transition-colors">
                      <Mail className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0F172A]">Email Us</p>
                      <p className="text-slate-600">support@estimaite.com</p>
                      <p className="text-sm text-slate-400 mt-0.5">We reply within 24 hours</p>
                    </div>
                  </a>

                  <a 
                    href="tel:+14078195809" 
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-[#0F172A] transition-colors">
                      <Phone className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0F172A]">Call Us</p>
                      <p className="text-slate-600">(407) 819-5809</p>
                      <p className="text-sm text-slate-400 mt-0.5">Mon-Fri, 9am-5pm EST</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0F172A]">Live Chat</p>
                      <p className="text-slate-600">Available in-app</p>
                      <p className="text-sm text-slate-400 mt-0.5">For existing customers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Center CTA */}
              <div className="bg-[#0F172A] rounded-2xl p-8 text-white">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-['Cormorant_Garamond'] text-xl font-semibold mb-2">
                  Need Immediate Help?
                </h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  Check our Help Center for instant answers to common questions about pricing, features, and getting started.
                </p>
                <Button 
                  asChild
                  variant="outline" 
                  className="w-full border-white/30 text-white hover:bg-white hover:text-[#0F172A] transition-all"
                >
                  <Link to="/help">Browse Help Center →</Link>
                </Button>
              </div>

              {/* FAQ Link */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <p className="text-sm text-slate-600 mb-3">
                  <strong>Common questions?</strong> Check our FAQ for quick answers about pricing, features, and trials.
                </p>
                <Link 
                  to="/faq" 
                  className="text-[#0F172A] font-semibold text-sm hover:underline underline-offset-4"
                >
                  View FAQ →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <EstimAIteLogo size="sm" className="brightness-0 invert" />
            <span className="text-slate-500 text-sm">© {new Date().getFullYear()} EstimAIte™. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/security" className="hover:text-white transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
