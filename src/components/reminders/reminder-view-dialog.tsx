/**
 * Reminder View Dialog — "Cuál es mi nombre" Web
 *
 * Read-only dialog to display the full details of a reminder.
 * Opened by clicking a reminder card; provides an "Edit" action
 * that transitions to the edit form (only for pending reminders).
 *
 * @module components/reminders/reminder-view-dialog
 */

"use client";

import { useMemo } from "react";
import type { Reminder } from "@/types/database";
import { formatDateTime, isPast } from "@/lib/dates";
import { parseRRule, describeRRule } from "@/lib/rrule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReminderViewDialogProps {
  reminder: Reminder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (reminder: Reminder) => void;
  timezone?: string;
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

export function ReminderViewDialog({
  reminder,
  open,
  onOpenChange,
  onEdit,
  timezone,
}: ReminderViewDialogProps) {
  const recurrenceRule = reminder?.recurrence_rule ?? null;
  const rruleDescription = useMemo(() => {
    if (!recurrenceRule) return null;
    try {
      const params = parseRRule(recurrenceRule);
      return describeRRule(params);
    } catch {
      return null;
    }
  }, [recurrenceRule]);

  if (!reminder) return null;

  const config = STATUS_CONFIG[reminder.status];
  const overdue = reminder.status === "pending" && isPast(reminder.trigger_at);
  const canEdit = reminder.status === "pending";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {overdue && <span aria-hidden="true">⚠️</span>}
            {reminder.status === "sent" && <span aria-hidden="true">✅</span>}
            {formatDateTime(reminder.trigger_at, timezone)}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 pt-1">
            <Badge variant={config.variant}>{config.label}</Badge>
            {reminder.is_recurring && rruleDescription && (
              <Badge variant="outline" className="text-xs">
                🔁 {rruleDescription}
                {reminder.occurrence_number > 0 && (
                  <span className="ml-1 opacity-70">
                    #{reminder.occurrence_number}
                  </span>
                )}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm whitespace-pre-wrap break-words">
            {reminder.content}
          </p>

          {reminder.recurrence_parent_id && (
            <p className="text-xs text-muted-foreground">
              Parte de una serie
            </p>
          )}

          {reminder.original_text && reminder.original_text !== reminder.content && (
            <p className="text-xs text-muted-foreground italic">
              Texto original: &quot;{reminder.original_text}&quot;
            </p>
          )}

          {reminder.failed_reason && (
            <p className="text-xs text-destructive">
              Error: {reminder.failed_reason}
            </p>
          )}

          {reminder.sent_at && (
            <p className="text-xs text-muted-foreground">
              Enviado: {formatDateTime(reminder.sent_at, timezone)}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
          {canEdit && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onEdit(reminder);
              }}
            >
              <span aria-hidden="true">✏️</span> Editar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
