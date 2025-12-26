import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { z } from 'zod';
import { Shield, Lock, Check } from 'lucide-react';
import { analytics, EVENTS } from '@/lib/analytics';
import { supabase } from '@/integrations/supabase/client';
import { EstimAIteLogo } from '@/components/EstimAIteLogo';

const signupSchema = z.object({
  name: z.string().min(1, 'Please enter your name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function Signup() {
  const navigate = useNavigate();
  const { user, signUp, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/onboarding');
    }
  }, [user, loading, navigate]);

  const triggerLeadFollowup = async (userName: string, userEmail: string, userPhone: string) => {
    try {
      await supabase.functions.invoke('lead-followup', {
        body: {
          name: userName,
          email: userEmail,
          phone: userPhone,
          source: 'signup',
        },
      });
      console.log('[Signup] Lead followup triggered successfully');
    } catch (error) {
      console.error('[Signup] Lead followup error:', error);
      // Don't block signup flow if followup fails
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    const validation = signupSchema.safeParse({ name, email, phone, password });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }
    
    analytics.track(EVENTS.SIGNUP_STARTED, { email });
    
    setIsSubmitting(true);
    const { error } = await signUp(email, password);
    
    if (error) {
      setIsSubmitting(false);
      if (error.message.includes('User already registered')) {
        toast.error('An account with this email already exists. Please sign in instead.');
      } else {
        toast.error(error.message);
      }
    } else {
      // Trigger AI call and email followup in background
      triggerLeadFollowup(name, email, phone);
      
      analytics.track(EVENTS.SIGNUP_COMPLETED, { email });
      toast.success('Account created! You\'ll receive a welcome call shortly.');
      setIsSubmitting(false);
      navigate('/onboarding');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <EstimAIteLogo size="md" className="brightness-0 invert mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">
            Start Your Free Trial
          </h1>
          <p className="text-slate-400">
            No credit card required • 14 days free
          </p>
        </div>

        {/* Value Prop */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              Join contractors who are <span className="text-white font-semibold">saving 10+ hours</span> every week
            </p>
          </div>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <Input 
                type="text"
                required
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 border-2 border-slate-300 rounded-lg focus:border-cyan-400 focus:ring-cyan-400 transition-colors"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Work Email
              </label>
              <Input 
                type="email"
                required
                placeholder="you@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 border-2 border-slate-300 rounded-lg focus:border-cyan-400 focus:ring-cyan-400 transition-colors"
              />
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number
              </label>
              <Input 
                type="tel"
                required
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-12 px-4 border-2 border-slate-300 rounded-lg focus:border-cyan-400 focus:ring-cyan-400 transition-colors"
              />
              <p className="text-xs text-slate-500 mt-1">
                We'll call to help you get started
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Create Password
              </label>
              <Input 
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 border-2 border-slate-300 rounded-lg focus:border-cyan-400 focus:ring-cyan-400 transition-colors"
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <Checkbox 
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                I agree to the <Link to="/terms" className="text-cyan-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-cyan-600 hover:underline">Privacy Policy</Link>
              </label>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Free Account →'}
            </Button>
          </form>

          {/* What You'll Get */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-700 mb-3">Your free trial includes:</p>
            <div className="space-y-2">
              {[
                'Unlimited estimates for 14 days',
                'AI-powered conversational estimating',
                'Professional PDF proposals',
                'Personalized onboarding call'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account? <Link to="/auth" className="text-cyan-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Trust Signals */}
        <div className="mt-8 flex items-center justify-center gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-sm">256-bit SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-400" />
            <span className="text-sm">GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
