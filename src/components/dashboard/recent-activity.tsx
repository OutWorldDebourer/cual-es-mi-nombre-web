import {
  StickyNote,
  Bell,
  Coins,
  BellRing,
  BellOff,
  CreditCard,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  type: "note" | "reminder" | "credit";
  title: string;
  detail: string;
  timestamp: string;
}

interface RecentActivityProps {
  items: ActivityItem[];
}

const ICON_CONFIG: Record<
  string,
  { icon: React.ElementType; bg: string; fg: string }
> = {
  note: { icon: StickyNote, bg: "bg-info/10", fg: "text-info" },
  "reminder-pending": { icon: Bell, bg: "bg-warning/10", fg: "text-warning" },
  "reminder-sent": { icon: BellRing, bg: "bg-success/10", fg: "text-success" },
  "reminder-failed": { icon: BellOff, bg: "bg-destructive/10", fg: "text-destructive" },
  "credit-positive": { icon: Coins, bg: "bg-success/10", fg: "text-success" },
  "credit-negative": { icon: CreditCard, bg: "bg-muted", fg: "text-muted-foreground" },
};

function getIconConfig(item: ActivityItem) {
  if (item.type === "note") return ICON_CONFIG["note"];
  if (item.type === "reminder") {
    if (item.detail.includes("entregado")) return ICON_CONFIG["reminder-sent"];
    if (item.detail.includes("fallido")) return ICON_CONFIG["reminder-failed"];
    return ICON_CONFIG["reminder-pending"];
  }
  // credit
  if (item.detail.startsWith("+")) return ICON_CONFIG["credit-positive"];
  return ICON_CONFIG["credit-negative"];
}

function formatRelativeTime(isoTimestamp: string): string {
  const now = Date.now();
  const then = new Date(isoTimestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "ayer";
  if (diffD < 7) return `hace ${diffD}d`;
  return new Date(isoTimestamp).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
  });
}

export function RecentActivity({ items }: RecentActivityProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold text-base mb-3">Actividad reciente</h3>
        <p className="text-sm text-muted-foreground text-center py-6">
          Aún no hay actividad. Envía un mensaje por WhatsApp para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="font-semibold text-base mb-3">Actividad reciente</h3>
      <div className="space-y-1">
        {items.map((item, index) => {
          const config = getIconConfig(item);
          const Icon = config.icon;

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors animate-[fade-in-up_0.3s_ease-out_both]"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bg}`}
              >
                <Icon className={`h-4 w-4 ${config.fg}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.detail}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {formatRelativeTime(item.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
