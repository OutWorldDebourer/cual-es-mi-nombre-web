/**
 * Reminder Card Component — "Cuál es mi nombre" Web
 *
 * Displays a single reminder with status badge, trigger time,
 * and content. Supports cancellation for pending reminders.
 *
 * @module components/reminders/reminder-card
 */

"use client";

import type { Reminder } from "@/types/database";
import { formatDateTime, isPast } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReminderCardProps {
  reminder: Reminder;
  timezone?: string;
  onCancel: (reminderId: string) => void;
}

const STATUS_CONFIG: Record<
  Reminder["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pendiente", variant: "outline" },
  processing: { label: "Procesando", variant: "default" },
  sent: { label: "Enviado", variant: "secondary" },
  failed: { label: "Fallido", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "secondary" },
};

export function ReminderCard({
  reminder,
  timezone,
  onCancel,
}: ReminderCardProps) {
  const config = STATUS_CONFIG[reminder.status];
  const overdue = reminder.status === "pending" && isPast(reminder.trigger_at);
  const canCancel = reminder.status === "pending";

  return (
    <Card
      className={`transition-shadow ${
        overdue
          ? "border-destructive/40 bg-destructive/5"
          : reminder.status === "sent"
            ? "border-success/30 bg-success/5"
            : ""
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">
              {overdue && <span className="mr-1">⚠️</span>}
              {reminder.status === "sent" && <span className="mr-1">✅</span>}
              {formatDateTime(reminder.trigger_at, timezone)}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={config.variant}>{config.label}</Badge>
            {canCancel && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onCancel(reminder.id)}
                className="text-destructive hover:text-destructive"
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{reminder.content}</p>
        {reminder.original_text && reminder.original_text !== reminder.content && (
          <p className="text-xs text-muted-foreground mt-2 italic">
            Texto original: &quot;{reminder.original_text}&quot;
          </p>
        )}
        {reminder.failed_reason && (
          <p className="text-xs text-destructive mt-2">
            Error: {reminder.failed_reason}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
