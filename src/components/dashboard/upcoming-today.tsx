"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, PartyPopper } from "lucide-react";
import type { Reminder } from "@/types/database";

interface UpcomingTodayProps {
  reminders: Reminder[];
  timezone: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendiente", variant: "outline" },
  processing: { label: "Procesando", variant: "secondary" },
  sent: { label: "Enviado", variant: "default" },
  failed: { label: "Fallido", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "secondary" },
};

function formatTime(isoString: string, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("es", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
    }).format(new Date(isoString));
  } catch {
    return new Intl.DateTimeFormat("es", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoString));
  }
}

export function UpcomingToday({ reminders, timezone }: UpcomingTodayProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Próximos hoy
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <PartyPopper className="h-4 w-4" />
            Sin recordatorios para hoy
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((rem) => {
              const config = statusConfig[rem.status] ?? statusConfig.pending;
              return (
                <Link
                  key={rem.id}
                  href="/dashboard/reminders"
                  className="flex items-center gap-3 rounded-md p-2 -mx-2 transition-colors hover:bg-muted/50"
                >
                  <span className="text-sm font-mono text-muted-foreground shrink-0 tabular-nums">
                    {formatTime(rem.trigger_at, timezone)}
                  </span>
                  <span className="text-sm truncate min-w-0 flex-1">
                    {rem.content}
                  </span>
                  <Badge variant={config.variant} className="shrink-0 text-xs">
                    {config.label}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
