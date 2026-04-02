import { LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBranding } from "@/contexts/BrandingContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "DASHBOARD", url: "/dashboard" },
  { title: "NEW QUOTE", url: "/estimator" },
  { title: "PROJECTS", url: "/estimates" },
];

export function AppSidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { branding } = useBranding();
  const { logoUrl } = branding;

  return (
    <Sidebar
      className="!bg-black border-r border-[#222] !w-[200px] min-w-[200px] max-w-[200px]"
      collapsible="none"
    >
      {/* Logo */}
      <SidebarHeader className="px-5 pt-6 pb-8">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="TKBSO"
            className="h-8 w-auto object-contain opacity-90"
          />
        ) : (
          <img
            src="/images/tkbso-logo-white-on-dark.png"
            alt="TKBSO"
            className="h-8 w-auto object-contain opacity-90"
          />
        )}
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-0 flex-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url === "/estimates" &&
                    location.pathname.startsWith("/estimates"));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="!rounded-none !bg-transparent hover:!bg-transparent !h-auto !p-0"
                    >
                      <NavLink
                        to={item.url}
                        className="relative flex items-center w-full px-5 py-2.5"
                      >
                        {/* Left accent bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#2B4C8C]" />
                        )}
                        <span
                          className={`font-mono text-[11px] uppercase tracking-[0.08em] transition-colors duration-150 ${
                            isActive
                              ? "text-white"
                              : "text-[#666] hover:text-[#999]"
                          }`}
                        >
                          {isActive ? `[ ${item.title} ]` : item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-5 py-4 border-t border-[#222]">
        <div className="space-y-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#666] truncate">
              {profile?.name || profile?.email?.split("@")[0] || "User"}
            </p>
            <p className="font-mono text-[10px] text-[#444] truncate mt-0.5">
              {profile?.email}
            </p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#444] hover:text-[#999] transition-colors duration-150"
          >
            <LogOut className="w-3 h-3" strokeWidth={1.5} />
            SIGN OUT
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
