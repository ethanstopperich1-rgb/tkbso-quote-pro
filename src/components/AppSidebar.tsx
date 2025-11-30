import { LayoutDashboard, MessageSquare, FileText, DollarSign, LogOut, Settings } from "lucide-react";
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
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Chat Estimator", url: "/estimator", icon: MessageSquare },
  { title: "Estimates", url: "/estimates", icon: FileText },
  { title: "Pricing", url: "/pricing", icon: DollarSign },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { profile, contractor, signOut } = useAuth();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          {contractor?.settings?.branding?.logoUrl ? (
            <img 
              src={contractor.settings.branding.logoUrl} 
              alt="Company logo" 
              className="w-10 h-10 rounded-lg object-contain bg-white"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">
                {(contractor?.settings?.companyProfile?.companyName || contractor?.name || 'TK').slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-foreground">
              {contractor?.settings?.companyProfile?.companyName || contractor?.name || 'My Company'}
            </span>
            <span className="text-xs text-muted-foreground">Quote Creator</span>
          </div>
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
                      className={`w-full ${
                        isActive
                          ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                          : "hover:bg-sidebar-accent"
                      }`}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {profile?.name || profile?.email || 'User'}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {profile?.email}
            </span>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
