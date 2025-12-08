import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { BrandingProvider, useBranding } from "@/contexts/BrandingContext";

function DashboardLayoutContent() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { branding } = useBranding();

  // On tablet: start collapsed. On mobile: start closed. On desktop: start open.
  const getDefaultOpen = () => {
    if (isMobile) return false;
    if (isTablet) return false;
    return true;
  };

  return (
    <SidebarProvider defaultOpen={getDefaultOpen()}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {/* Mobile-only header with menu trigger */}
          <div className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm sm:hidden">
            <SidebarTrigger className="h-9 w-9" />
            <span className="font-display font-semibold text-foreground">
              {branding.companyName}
            </span>
          </div>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}

export function DashboardLayout() {
  return (
    <BrandingProvider>
      <DashboardLayoutContent />
    </BrandingProvider>
  );
}