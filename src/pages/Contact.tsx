import { Link } from 'react-router-dom';
import PageTemplate from '@/components/PageTemplate';

export default function Contact() {
  return (
    <PageTemplate 
      title="Get in Touch" 
      subtitle="We're here to help you succeed"
    >
      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#0F172A]">Name</label>
              <input 
                type="text"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-[#00E5FF] focus:outline-none"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#0F172A]">Email</label>
              <input 
                type="email"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-[#00E5FF] focus:outline-none"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-[#0F172A]">Message</label>
              <textarea 
                rows={6}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-[#00E5FF] focus:outline-none"
                placeholder="How can we help?"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] text-[#0F172A] py-3 rounded-lg font-bold hover:shadow-lg transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold mb-2 text-[#0F172A]">Email Us</h3>
            <p className="text-slate-600">support@estimaite.com</p>
            <p className="text-sm text-slate-500 mt-1">We reply within 24 hours</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2 text-[#0F172A]">Live Chat</h3>
            <p className="text-slate-600">Available in-app</p>
            <p className="text-sm text-slate-500 mt-1">Monday-Friday, 9am-5pm EST</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2 text-[#0F172A]">Phone</h3>
            <p className="text-slate-600">(407) 819-5809</p>
            <p className="text-sm text-slate-500 mt-1">For urgent issues only</p>
          </div>

          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
            <h4 className="font-bold mb-2 text-[#0F172A]">Need immediate help?</h4>
            <p className="text-sm text-slate-700 mb-3">Check out our Help Center for instant answers to common questions.</p>
            <Link to="/help" className="text-[#00E5FF] font-semibold hover:underline">
              Visit Help Center →
            </Link>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
