import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { EstimAIteLogo } from '@/components/EstimAIteLogo';

const faqCategories = [
  {
    category: 'Pricing & Value',
    questions: [
      {
        question: 'What are the subscription plans?',
        answer: 'EstimAIte offers three tiers: Starter ($79/mo) for solo contractors, Pro ($149/mo) for growing businesses, and Team ($299/mo) for companies requiring multiple user accounts and priority support.'
      },
      {
        question: 'Are there any discounts available?',
        answer: 'Yes, we are currently offering 20% off launch pricing.'
      },
      {
        question: 'What is the expected ROI?',
        answer: 'Most contractors save 10+ hours per week. At average billing rates, this provides a 10-40x return on investment by saving $3,000–$6,000 in labor value monthly.'
      },
      {
        question: 'Is there a money-back guarantee?',
        answer: 'Yes, we offer a 30-day money-back guarantee if you are not satisfied with the platform.'
      }
    ]
  },
  {
    category: 'Core Features',
    questions: [
      {
        question: 'How does the AI work?',
        answer: 'EstimAIte uses a conversational interface. You describe your project naturally—like texting a friend—and the AI extracts the scope, asks smart follow-up questions, and maps details to a database of over 250 pricing items.'
      },
      {
        question: 'What is the Sales Consultant AI?',
        answer: 'During the estimation process, our AI identifies opportunities for high-conversion upsells (like heated floors or niche additions), potentially increasing your project revenue by up to 30%.'
      },
      {
        question: 'What does the final estimate look like?',
        answer: 'You receive a professional, branded PDF including trade-sequenced line items, dynamic payment schedules (e.g., 65/25/10), and a digital signature block.'
      }
    ]
  },
  {
    category: 'Technical Requirements',
    questions: [
      {
        question: 'Do I need to download an app?',
        answer: 'No. EstimAIte is a web-based SaaS platform fully optimized for mobile use. It is designed to be used on your phone or tablet directly at the job site.'
      },
      {
        question: 'What technology powers the platform?',
        answer: 'The system is built on a modern stack including React 18, Supabase, and advanced AI language models for natural conversation understanding.'
      }
    ]
  },
  {
    category: 'Data Security',
    questions: [
      {
        question: 'How is my data protected?',
        answer: 'We use bank-level security, including SSL/TLS encryption for all connections. Your data is isolated using Row Level Security (RLS), ensuring only you can access your company\'s information.'
      },
      {
        question: 'Are there backups?',
        answer: 'Yes, we perform daily automated backups with a 7-day retention period to ensure your estimates are never lost.'
      }
    ]
  },
  {
    category: 'Trial & Cancellation',
    questions: [
      {
        question: 'Is there a free trial?',
        answer: 'Yes, we offer a 14-day free trial with full access to the platform.'
      },
      {
        question: 'Do I need a credit card to start?',
        answer: 'No. You can sign up for the trial with no credit card required.'
      },
      {
        question: 'How do I cancel?',
        answer: 'You can cancel your subscription at any time through your account settings.'
      }
    ]
  },
  {
    category: 'Troubleshooting',
    questions: [
      {
        question: 'The dashboard shows "0 trade items" but my estimate is complete. Why?',
        answer: 'This is a known cosmetic bug that occasionally occurs in the UI; it does not affect the actual items or the accuracy of your generated PDF.'
      },
      {
        question: 'Why does the AI ask for dimensions I already provided?',
        answer: 'While we use advanced AI for superior context retention, "context memory" can occasionally lag. Simply restating the dimension will allow the AI to proceed.'
      },
      {
        question: 'What if the calculations for shower walls look low?',
        answer: 'To ensure accuracy, we have implemented a "Summary & Confirmation" phase. Always review the square footage in the summary before clicking "Looks Good" to generate the final PDF.'
      }
    ]
  }
];

export default function FAQ() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <EstimAIteLogo size="sm" />
          </Link>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="text-[#0F172A] font-medium"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-['Cormorant_Garamond'] text-5xl md:text-6xl font-semibold text-[#0F172A] mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about EstimAIte. Can't find the answer you're looking for? 
            <Link to="/contact" className="text-[#0F172A] underline underline-offset-4 ml-1 hover:text-[#1E293B]">
              Reach out to our support team
            </Link>.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-[#0F172A] mb-6 pb-3 border-b border-slate-200">
                {category.category}
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {category.questions.map((faq, faqIndex) => (
                  <AccordionItem 
                    key={faqIndex} 
                    value={`${categoryIndex}-${faqIndex}`}
                    className="bg-white border border-slate-200 rounded-lg px-6 data-[state=open]:shadow-sm transition-shadow"
                  >
                    <AccordionTrigger className="text-left font-medium text-[#0F172A] hover:no-underline py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0F172A] py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-['Cormorant_Garamond'] text-4xl font-semibold text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Our team is here to help you get started and make the most of EstimAIte.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={() => navigate('/contact')}
              className="bg-white text-[#0F172A] hover:bg-slate-100 px-8 py-6 text-base font-semibold min-w-[200px]"
            >
              Contact Support
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-base font-semibold min-w-[200px]"
            >
              Start 14-Day Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E293B] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <EstimAIteLogo size="sm" className="brightness-0 invert" />
            <span className="text-slate-500 text-sm">© {new Date().getFullYear()} EstimAIte™. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/security" className="hover:text-white transition-colors">Security</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
