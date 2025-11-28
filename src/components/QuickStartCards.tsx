import { Bath, ChefHat, Combine, ClipboardList } from "lucide-react";

interface QuickStartCardsProps {
  onSelect: (prompt: string) => void;
}

const quickStarts = [
  {
    icon: Bath,
    title: "Bathroom Remodel",
    description: "Full or partial bath renovation",
    prompt: "I need a quote for a bathroom remodel",
  },
  {
    icon: ChefHat,
    title: "Kitchen Remodel",
    description: "Kitchen renovation project",
    prompt: "I need a quote for a kitchen remodel",
  },
  {
    icon: Combine,
    title: "Multi-Room Project",
    description: "Kitchen + bathrooms combo",
    prompt: "I have a multi-room project including kitchen and bathrooms",
  },
  {
    icon: ClipboardList,
    title: "Quick Ballpark",
    description: "Just need a rough number",
    prompt: "I need a quick ballpark estimate for a project",
  },
];

export function QuickStartCards({ onSelect }: QuickStartCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
      {quickStarts.map((item) => (
        <button
          key={item.title}
          onClick={() => onSelect(item.prompt)}
          className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:bg-secondary/50 hover:border-primary/30 transition-all text-left group"
        >
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <item.icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{item.title}</h3>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
