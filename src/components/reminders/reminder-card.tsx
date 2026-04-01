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

import { useState, useMemo, useEffect } from "react";
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

  // Detect realtime status changes for highlight animation
  const [prevStatus, setPrevStatus] = useState(reminder.status);
  const [highlightActive, setHighlightActive] = useState(false);

  // Trigger highlight during render when status changes
  if (reminder.status !== prevStatus) {
    setPrevStatus(reminder.status);
    setHighlightActive(true);
  }

  // Auto-dismiss highlight after animation duration
  useEffect(() => {
    if (!highlightActive) return;
    const timer = setTimeout(() => setHighlightActive(false), 700);
    return () => clearTimeout(timer);
  }, [highlightActive]);

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
        variant="interactive"
        className={`cursor-pointer ${
          overdue
            ? "border-destructive/40 bg-destructive/5"
            : reminder.status === "sent"
              ? "border-success/30 bg-success/5"
              : ""
        } ${highlightActive ? "animate-[highlight_0.7s_ease-out]" : ""}`}
        onClick={() => onView(reminder)}
      >
        <CardHeader className="pb-2">
          {/* Row 1: Date/time + menu */}
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base truncate min-w-0">
              {overdue && <span className="mr-1" aria-hidden="true">⚠️</span>}
              {reminder.status === "sent" && <span className="mr-1" aria-hidden="true">✅</span>}
              {formatDateTime(reminder.trigger_at, timezone)}
            </CardTitle>
            {(canEdit || canCancel || canDelete) && (
              <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                        <span aria-hidden="true">✏️</span> Editar
                      </DropdownMenuItem>
                    )}
                    {canCancel && (
                      <DropdownMenuItem onClick={() => onCancel(reminder.id)}>
                        <span aria-hidden="true">⏹️</span> Cancelar
                      </DropdownMenuItem>
                    )}
                    {canCancelSeries && (
                      <DropdownMenuItem onClick={() => onCancelSeries(reminder)}>
                        <span aria-hidden="true">⏹️</span> Cancelar serie
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setShowDeleteDialog(true)}
                          className="text-destructive focus:text-destructive"
                        >
                          <span aria-hidden="true">🗑️</span> Eliminar
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          {/* Row 2: Badges */}
          <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
            {reminder.is_recurring && rruleDescription && (
              <Badge variant="outline" className="text-xs truncate min-w-0">
                <span className="sm:hidden">🔄</span>
                <span className="hidden sm:inline">🔁 {rruleDescription}</span>
              </Badge>
            )}
            {reminder.occurrence_number > 0 && (
              <span className="shrink-0 text-xs text-muted-foreground font-medium">
                #{reminder.occurrence_number}
              </span>
            )}
            <Badge variant={config.variant} className="whitespace-nowrap shrink-0">{config.label}</Badge>
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
