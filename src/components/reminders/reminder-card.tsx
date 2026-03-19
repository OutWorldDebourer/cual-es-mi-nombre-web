/**
 * Reminder Card Component — "Cuál es mi nombre" Web
 *
 * Displays a single reminder with status badge, trigger time, content,
 * recurrence info, and action dropdown menu. Supports edit, cancel,
 * cancel series, and delete with confirmation.
 *
 * @module components/reminders/reminder-card
 */

"use client";

import { useState, useMemo } from "react";
import type { Reminder } from "@/types/database";
import { formatDateTime, isPast } from "@/lib/dates";
import { parseRRule, describeRRule } from "@/lib/rrule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReminderCardProps {
  reminder: Reminder;
  timezone?: string;
  onView: (reminder: Reminder) => void;
  onCancel: (reminderId: string) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (reminderId: string) => void;
  onCancelSeries: (reminder: Reminder) => void;
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
  onView,
  onCancel,
  onEdit,
  onDelete,
  onCancelSeries,
}: ReminderCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const config = STATUS_CONFIG[reminder.status];
  const overdue = reminder.status === "pending" && isPast(reminder.trigger_at);
  const canEdit = reminder.status === "pending";
  const canCancel = reminder.status === "pending";
  const canDelete = ["pending", "cancelled"].includes(reminder.status);
  const isRecurringSeries =
    reminder.is_recurring || !!reminder.recurrence_parent_id;
  const canCancelSeries = canCancel && isRecurringSeries;

  // Parse RRULE for display
  const rruleDescription = useMemo(() => {
    if (!reminder.recurrence_rule) return null;
    try {
      const params = parseRRule(reminder.recurrence_rule);
      return describeRRule(params);
    } catch {
      return null;
    }
  }, [reminder.recurrence_rule]);

  return (
    <>
      <Card
        className={`transition-shadow hover:shadow-md cursor-pointer ${
          overdue
            ? "border-destructive/40 bg-destructive/5"
            : reminder.status === "sent"
              ? "border-success/30 bg-success/5"
              : ""
        }`}
        onClick={() => onView(reminder)}
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
              {/* Recurring badge */}
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
              {/* Status badge */}
              <Badge variant={config.variant}>{config.label}</Badge>
              {/* Actions menu */}
              {(canEdit || canCancel || canDelete) && (
                <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Acciones de recordatorio"
                        >
                          ⋮
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Acciones</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end">
                    {canEdit && (
                      <DropdownMenuItem onClick={() => onEdit(reminder)}>
                        ✏️ Editar
                      </DropdownMenuItem>
                    )}
                    {canCancel && (
                      <DropdownMenuItem onClick={() => onCancel(reminder.id)}>
                        ⏹️ Cancelar
                      </DropdownMenuItem>
                    )}
                    {canCancelSeries && (
                      <DropdownMenuItem onClick={() => onCancelSeries(reminder)}>
                        ⏹️ Cancelar serie
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setShowDeleteDialog(true)}
                          className="text-destructive focus:text-destructive"
                        >
                          🗑️ Eliminar
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{reminder.content}</p>
          {/* Series indicator */}
          {reminder.recurrence_parent_id && (
            <p className="text-xs text-muted-foreground mt-1">
              Parte de una serie
            </p>
          )}
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este recordatorio?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente este recordatorio. Esta acción se
              puede deshacer durante unos segundos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(reminder.id)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
