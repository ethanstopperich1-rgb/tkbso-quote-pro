import { Brain } from "lucide-react";

// Header component for Estimaitor
export function Header() {
  return (
    <header className="border-b bg-primary px-6 py-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent">
            <Brain className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground tracking-tight">
              Estimaitor
            </h1>
            <p className="text-xs text-primary-foreground/80">Intelligent Project Quotes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
            Beta
          </span>
        </div>
      </div>
    </header>
  );
}
