import { useNavigate } from 'react-router-dom';
import { MessageSquare, Camera, Video, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MODE_CARDS = [
  {
    id: 'chat',
    title: 'Chat Estimator',
    description: 'Type naturally: "10x10 kitchen, shaker cabinets, quartz counters"',
    icon: MessageSquare,
    emoji: '💬',
    route: '/estimator/chat',
    badge: { text: 'Fastest', variant: 'success' as const },
    time: '~2 min',
    borderColor: 'hover:border-sky-500',
    iconColor: 'text-sky-500',
  },
  {
    id: 'photo',
    title: 'Photo-to-Quote',
    description: 'Upload photos, AI identifies fixtures & estimates quantities',
    icon: Camera,
    emoji: '📸',
    route: '/estimator/photo',
    badge: { text: 'Most Accurate', variant: 'info' as const },
    time: '~3 min',
    borderColor: 'hover:border-violet-500',
    iconColor: 'text-violet-500',
  },
  {
    id: 'video',
    title: 'Video Walk-and-Talk',
    description: 'Record yourself walking the space, narrating the scope',
    icon: Video,
    emoji: '🎥',
    route: '/estimator/video',
    badge: { text: 'Most Detail', variant: 'warning' as const },
    time: '~4 min',
    borderColor: 'hover:border-amber-500',
    iconColor: 'text-amber-500',
  },
];

const badgeVariants = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  info: 'bg-sky-100 text-sky-700 border-sky-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function EstimatorLauncher() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Create New Estimate
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose how you want to build this estimate
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {MODE_CARDS.map((mode) => {
            const IconComponent = mode.icon;
            return (
              <Card
                key={mode.id}
                onClick={() => navigate(mode.route)}
                className={`group cursor-pointer transition-all duration-200 border-2 border-transparent ${mode.borderColor} hover:shadow-lg hover:-translate-y-1`}
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="text-5xl mb-4">{mode.emoji}</div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {mode.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {mode.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`px-2 py-1 rounded-full font-medium border ${badgeVariants[mode.badge.variant]}`}>
                      {mode.badge.text}
                    </span>
                    <span>{mode.time}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pro Tip Banner */}
        <div className="mt-8 p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-sky-900 dark:text-sky-100">
            <strong>Pro Tip:</strong> All three modes can be combined. Start with Chat for speed, add Photos for accuracy, then use Video for complex areas.
          </p>
        </div>
      </div>
    </div>
  );
}
