import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Box,
  Building2,
  FileText,
  Gauge,
  Home,
  LayoutDashboard,
  Map,
  Settings,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogoMark } from "@/components/common/Logo";

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const overview: Item[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const infrastructure: Item[] = [
  { to: "/infrastructure", label: "Infrastructure Assets", icon: Building2 },
  { to: "/digital-twin", label: "Digital Twin", icon: Box },
  { to: "/gis", label: "GIS", icon: Map },
];

const ai: Item[] = [
  { to: "/ai", label: "AI Overview", icon: Sparkles },
  { to: "/ai/predictions", label: "Predictions", icon: Activity },
  { to: "/ai/risk-analysis", label: "Risk Analysis", icon: ShieldAlert },
  { to: "/ai/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/ai/model-performance", label: "Model Performance", icon: Gauge },
];

const system: Item[] = [
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => pathname === to || (to !== "/home" && pathname.startsWith(to + "/"));

  const group = (label: string, items: Item[]) => (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.label}>
                <Link to={item.to} className="flex items-center gap-2">
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/home" className="flex min-w-0 items-center gap-2.5 px-1 py-1.5" aria-label="SIMRAS home">
          <LogoMark />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block font-display text-base leading-none font-extrabold tracking-[0.14em]">SIMRAS</span>
              <span className="mt-1 block truncate text-[10px] leading-none text-muted-foreground">
                Structural Infrastructure Monitoring System
              </span>
            </span>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {group("Overview", overview)}
        {group("Infrastructure", infrastructure)}
        {group("AI Intelligence", ai)}
        {group("System", system)}
      </SidebarContent>
    </Sidebar>
  );
}
