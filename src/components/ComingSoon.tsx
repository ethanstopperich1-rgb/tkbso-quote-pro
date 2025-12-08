import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1C3E] to-blue-900 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-6xl mb-6">🚧</div>
        <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
        <p className="text-xl text-slate-300 mb-8">Coming Soon</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-white text-[#0B1C3E] px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
