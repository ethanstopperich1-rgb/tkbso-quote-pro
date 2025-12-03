import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function DashboardLayout() {
  const { contractor } = useAuth();
  const isMobile = useIsMobile();

  // Apply dynamic brand color from tenant settings
  useEffect(() => {
    const brandColor = contractor?.settings?.branding?.primaryColor;
    if (brandColor) {
      const hsl = hexToHSL(brandColor);
      if (hsl) {
        document.documentElement.style.setProperty('--accent', hsl);
        document.documentElement.style.setProperty('--sidebar-accent', hsl);
      }
    } else {
      document.documentElement.style.removeProperty('--accent');
      document.documentElement.style.removeProperty('--sidebar-accent');
    }
  }, [contractor?.settings?.branding?.primaryColor]);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {/* Mobile header with menu trigger */}
          <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm md:hidden">
            <SidebarTrigger className="h-9 w-9" />
            <span className="font-display font-semibold text-foreground">
              {contractor?.settings?.companyProfile?.companyName || contractor?.name || 'Estimaitor'}
            </span>
          </div>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}

// Helper to convert hex to HSL string for CSS variables
function hexToHSL(hex: string): string | null {
  hex = hex.replace(/^#/, '');
  if (hex.length !== 6) return null;
  
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}