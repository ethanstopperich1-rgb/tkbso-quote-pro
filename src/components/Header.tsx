import { Brain, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenTakeoff?: () => void;
}

export function Header({ onOpenTakeoff }: HeaderProps) {
  return (
    <header className="border-b bg-primary px-6 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary-foreground tracking-tight">
              Estimaitor
            </h1>
            <p className="text-xs text-primary-foreground/70">Intelligent Project Quotes</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {onOpenTakeoff && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenTakeoff}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Ruler className="w-4 h-4 mr-2" />
              Visual Takeoff
            </Button>
          )}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent/20 text-white border border-accent/30">
            v2.0
          </span>
        </div>
      </div>
    </header>
  );
}
