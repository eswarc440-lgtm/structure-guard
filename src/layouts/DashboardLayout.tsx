import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  Box,
  Building2,
  ChevronLeft,
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Settings,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "AI Intelligence",
    items: [
      { to: "/ai", label: "AI Overview", icon: Sparkles },
      { to: "/ai/predictions", label: "Predictions", icon: Activity },
      { to: "/ai/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/ai/risk-analysis", label: "Risk Analysis", icon: ShieldAlert },
      { to: "/ai/model-performance", label: "Model Performance", icon: Gauge },
    ],
  },
  {
    label: "Digital Infrastructure",
    items: [
      { to: "/digital-twin", label: "Digital Twin", icon: Box },
      { to: "/gis", label: "GIS", icon: Map },
      { to: "/infrastructure", label: "Infrastructure Assets", icon: Building2 },
    ],
  },
  {
    label: "Reports",
    items: [{ to: "/reports", label: "Reports", icon: FileText }],
  },
  {
    label: "System",
    items: [
      { to: "/notifications", label: "Notifications", icon: Bell },
      { to: "/profile", label: "Profile", icon: User },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

function SidebarNav({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-2")}>
        {collapsed ? <Logo tone="light" className="[&_span:last-child]:hidden" /> : <Logo tone="light" showSub />}
      </div>

      <nav aria-label="Application" className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            {!collapsed && <p className="eyebrow px-2 pb-2 text-sidebar-foreground/40">{group.label}</p>}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to + "/"));
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--color-sidebar-primary)]"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          onClick={() => {
            logout();
            navigate({ to: "/auth/login" });
          }}
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center",
          )}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && !user) navigate({ to: "/auth/login" });
  }, [ready, user, navigate]);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Loading SIMRAS workspace…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border transition-[width] duration-200 lg:block",
          collapsed ? "w-[72px]" : "w-[264px]",
        )}
      >
        <SidebarNav collapsed={collapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation" className="min-h-11 min-w-11 lg:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] border-sidebar-border bg-sidebar p-0">
                <SheetTitle className="sr-only">SIMRAS navigation</SheetTitle>
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>
            <Button
              variant="ghost"
              size="icon"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((v) => !v)}
              className="hidden lg:inline-flex"
            >
              <ChevronLeft className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
            </Button>
          </div>

          <p className="min-w-0 truncate text-sm text-muted-foreground">
            {user.organization} · {user.role}
          </p>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button asChild variant="ghost" size="icon" aria-label="Notifications" className="min-h-11 min-w-11">
              <Link to="/notifications">
                <Bell className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Profile" className="min-h-11 min-w-11">
              <Link to="/profile">
                <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {user.name.charAt(0)}
                </span>
              </Link>
            </Button>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
