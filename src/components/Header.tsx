import { Button } from "@/components/ui/button";
import { EstimAIteLogo } from "@/components/EstimAIteLogo";

interface HeaderProps {
  onOpenTakeoff?: () => void;
}

export function Header({ onOpenTakeoff }: HeaderProps) {
  return (
    <header className="border-b bg-white px-6 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <EstimAIteLogo size="sm" showTM={false} />
        
        <div className="flex items-center gap-3">
          {onOpenTakeoff && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenTakeoff}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 3 9 15"/><path d="M12 3H3v18h18v-9"/><path d="M16 3h5v5"/><path d="M14 15H9v-5"/></svg>
              Visual Takeoff
            </Button>
          )}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            v2.0
          </span>
        </div>
      </div>
    </header>
  );
}
