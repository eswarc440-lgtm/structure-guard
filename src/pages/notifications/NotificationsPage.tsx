import { AlertTriangle, Bell, Info } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { notifications } from "@/data/analyticsData";

const severityMap = {
  critical: { icon: AlertTriangle, cls: "border-danger/30 bg-danger/10 text-danger", label: "Critical" },
  warning: { icon: Bell, cls: "border-warning/40 bg-warning/12 text-warning", label: "Warning" },
  info: { icon: Info, cls: "border-accent/30 bg-accent/10 text-accent", label: "Info" },
} as const;

export function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="System"
          title="Notifications"
          description="Risk alerts, inspection reminders and platform updates."
        />

        <ul className="space-y-3">
          {notifications.map((n) => {
            const sev = severityMap[n.severity];
            const Icon = sev.icon;
            return (
              <li
                key={n.id}
                className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 rounded-lg border bg-card p-4 ${
                  n.read ? "" : "border-l-2 border-l-primary"
                }`}
              >
                <span className={`grid size-9 shrink-0 place-items-center rounded-md border ${sev.cls}`}>
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <p className="min-w-0 text-sm font-semibold">{n.title}</p>
                    <p className="shrink-0 font-mono text-[11px] text-muted-foreground">{n.time}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  <p className={`mt-2 eyebrow ${n.severity === "critical" ? "text-danger" : n.severity === "warning" ? "text-warning" : "text-accent"}`}>
                    {sev.label}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </DashboardLayout>
  );
}
