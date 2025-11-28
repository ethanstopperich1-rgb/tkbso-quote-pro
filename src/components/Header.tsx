import tkbsoLogo from "@/assets/tkbso-logo.png";

// Header component for TKBSO Estimator
export function Header() {
  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={tkbsoLogo} 
            alt="The Kitchen and Bath Store of Orlando" 
            className="h-12 w-auto"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">AI Estimator</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            Beta
          </span>
        </div>
      </div>
    </header>
  );
}
