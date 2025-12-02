import { LayoutDashboard, MessageSquare, FileText, DollarSign, LogOut, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Estimator", url: "/estimator", icon: MessageSquare },
  { title: "Projects", url: "/estimates", icon: FileText },
  { title: "Pricing", url: "/pricing", icon: DollarSign },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { profile, contractor, signOut } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  const companyName = contractor?.settings?.companyProfile?.companyName || contractor?.name || 'My Company';
  const logoUrl = contractor?.settings?.branding?.logoUrl;

  return (
    <Sidebar 
      className="sidebar-glass transition-all duration-300"
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Company logo" 
              className="w-10 h-10 rounded-xl object-contain bg-white/10 flex-shrink-0 border border-white/10"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0 border border-accent/30">
              <span className="text-sm font-bold text-accent">
                {companyName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-display font-semibold text-sm text-sidebar-foreground truncate tracking-tight">
                {companyName}
              </span>
              <span className="text-xs text-sidebar-foreground/50">Estimaitor</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url || 
                  (item.url === '/estimates' && location.pathname.startsWith('/estimates')) ||
                  (item.url === '/settings' && location.pathname.startsWith('/settings'));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={isCollapsed ? item.title : undefined}
                      className={`w-full rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-accent text-accent-foreground shadow-glow hover:bg-accent hover:text-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-white/[0.06] hover:text-sidebar-foreground"
                      }`}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/[0.06]">
        <div className="flex flex-col gap-3">
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">
                {profile?.name || profile?.email?.split('@')[0] || 'User'}
              </span>
              <span className="text-xs text-sidebar-foreground/50 truncate">
                {profile?.email}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button 
              onClick={signOut}
              className="flex items-center gap-2 text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground transition-all duration-300 hover:scale-105"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/[0.06] transition-all duration-300"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
