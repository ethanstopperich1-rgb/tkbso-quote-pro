import { Link } from 'react-router-dom';
import PageTemplate from '@/components/PageTemplate';

export default function Features() {
  const features = [
    {
      icon: '💬',
      title: 'Chat Estimator',
      description: 'Type naturally like "10x12 kitchen, quartz counters, shaker cabinets" and watch AI build your estimate in real-time.',
      color: 'bg-blue-100'
    },
    {
      icon: '📸',
      title: 'Photo-to-Quote',
      description: 'Upload photos of the space and AI identifies fixtures, materials, and estimates quantities automatically.',
      color: 'bg-purple-100'
    },
    {
      icon: '🎥',
      title: 'Video Walk-and-Talk',
      description: 'Record yourself walking through the space while narrating the scope. AI transcribes and builds comprehensive estimates.',
      color: 'bg-orange-100'
    },
    {
      icon: '🎨',
      title: 'Before/After Visualizer',
      description: 'Show clients what their new space will look like with AI-powered visualizations and an interactive slider.',
      color: 'bg-green-100'
    },
    {
      icon: '⚠️',
      title: 'Forgotten Items Checker',
      description: 'AI validates every estimate against 50+ common missing items. Catch $2K-$5K in forgotten scope before you send.',
      color: 'bg-yellow-100'
    },
    {
      icon: '📄',
      title: 'Professional Proposals',
      description: 'Generate branded PDF proposals that look like they came from a $10M firm. Custom logo, colors, and payment terms.',
      color: 'bg-cyan-100'
    }
  ];

  return (
    <PageTemplate 
      title="Features" 
      subtitle="Everything you need to close more deals faster"
    >
      <div className="space-y-12">
        {features.map((feature, index) => (
          <div key={index} className="flex gap-6 items-start">
            <div className={`w-16 h-16 ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <span className="text-3xl">{feature.icon}</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-[#0F172A]">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <Link 
          to="/signup" 
          className="inline-block bg-gradient-to-r from-[#00E5FF] to-[#3B82F6] text-[#0F172A] px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all"
        >
          Try All Features Free →
        </Link>
      </div>
    </PageTemplate>
  );
}
