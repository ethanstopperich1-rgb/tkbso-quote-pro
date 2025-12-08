import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function PageTemplate({ title, subtitle, children }: PageTemplateProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0B1C3E] to-blue-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4">{title}</h1>
          {subtitle && <p className="text-xl text-slate-300">{subtitle}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {children}
      </div>

      {/* Simple Footer */}
      <footer className="bg-slate-100 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-slate-600">
          <Link to="/" className="font-bold text-[#0B1C3E] hover:text-[#00E5FF] transition">
            EstimAIte
          </Link>
          <span className="mx-2">•</span>
          <span>© 2025 All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
