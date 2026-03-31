/**
 * Reminder Form Component — "Cuál es mi nombre" Web
 *
 * Dialog-based form for creating and editing reminders.
 * Supports recurrence configuration with RRULE preview.
 *
 * @module components/reminders/reminder-form
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import type { Reminder } from "@/types/database";
import type { RecurrenceParams, RRuleFrequency, RRuleDay } from "@/lib/rrule";
import {
  buildRRule,
  parseRRule,
  describeRRule,
  DAY_OPTIONS,
} from "@/lib/rrule";
import { toLocalInputValue, toUTCISOString } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";

// ── Types ───────────────────────────────────────────────────────────────────

export interface ReminderFormData {
  content: string;
  trigger_at: string; // UTC ISO string
  is_recurring: boolean;
  recurrence_rule: string | null;
}

interface ReminderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder?: Reminder | null;
  onSubmit: (data: ReminderFormData) => Promise<void>;
  timezone?: string;
}

type EndType = "never" | "count" | "until";

// ── Helpers ─────────────────────────────────────────────────────────────────

function getDefaultTriggerAt(): string {
  // Tomorrow at 9:00 AM local time
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T09:00`;
}

const FREQUENCY_OPTIONS: { value: RRuleFrequency | "none"; label: string }[] = [
  { value: "none", label: "Sin repetición" },
  { value: "DAILY", label: "Diario" },
  { value: "WEEKLY", label: "Semanal" },
  { value: "MONTHLY", label: "Mensual" },
  { value: "YEARLY", label: "Anual" },
];

const FREQUENCY_LABELS: Record<RRuleFrequency, string> = {
  DAILY: "días",
  WEEKLY: "semanas",
  MONTHLY: "meses",
  YEARLY: "años",
};

// ── Component ───────────────────────────────────────────────────────────────

export function ReminderForm({
  open,
  onOpenChange,
  reminder,
  onSubmit,
  timezone,
}: ReminderFormProps) {
  const isEditing = !!reminder;

  // Form state
  const [content, setContent] = useState("");
  const [triggerAt, setTriggerAt] = useState(getDefaultTriggerAt);
  const [frequency, setFrequency] = useState<RRuleFrequency | "none">("none");
  const [interval, setInterval] = useState(1);
  const [byDay, setByDay] = useState<RRuleDay[]>([]);
  const [endType, setEndType] = useState<EndType>("never");
  const [count, setCount] = useState(10);
  const [untilDate, setUntilDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRecurring = frequency !== "none";

  // Populate form on open
  useEffect(() => {
    if (!open) return;
    setError(null);

    if (reminder) {
      setContent(reminder.content);
      setTriggerAt(
        timezone
          ? toLocalInputValue(reminder.trigger_at, timezone)
          : toLocalInputValue(reminder.trigger_at),
      );

      if (reminder.is_recurring && reminder.recurrence_rule) {
        try {
          const params = parseRRule(reminder.recurrence_rule);
          setFrequency(params.frequency);
          setInterval(params.interval);
          setByDay(params.byDay);
          if (params.count !== null) {
            setEndType("count");
            setCount(params.count);
          } else if (params.untilDate !== null) {
            setEndType("until");
            setUntilDate(params.untilDate);
          } else {
            setEndType("never");
          }
        } catch {
          setFrequency("none");
        }
      } else {
        setFrequency("none");
        setInterval(1);
        setByDay([]);
        setEndType("never");
      }
    } else {
      // Create mode defaults
      setContent("");
      setTriggerAt(getDefaultTriggerAt());
      setFrequency("none");
      setInterval(1);
      setByDay([]);
      setEndType("never");
      setCount(10);
      setUntilDate("");
    }
  }, [open, reminder, timezone]);

  // Build recurrence params for preview
  const recurrenceParams: RecurrenceParams | null = useMemo(() => {
    if (!isRecurring) return null;
    return {
      frequency: frequency as RRuleFrequency,
      interval,
      byDay,
      count: endType === "count" ? count : null,
      untilDate: endType === "until" ? untilDate || null : null,
    };
  }, [isRecurring, frequency, interval, byDay, endType, count, untilDate]);

  const rrulePreview = useMemo(() => {
    if (!recurrenceParams) return null;
    try {
      return describeRRule(recurrenceParams);
    } catch {
      return null;
    }
  }, [recurrenceParams]);

  // Day toggle handler
  function toggleDay(day: RRuleDay) {
    setByDay((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!content.trim()) {
      setError("El contenido del recordatorio es obligatorio.");
      return;
    }

    if (!triggerAt) {
      setError("La fecha y hora son obligatorias.");
      return;
    }

    // Validate trigger_at is in the future (only for create)
    const tz = timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    const utcTrigger = toUTCISOString(triggerAt, tz);
    if (!isEditing && new Date(utcTrigger) <= new Date()) {
      setError("La fecha debe ser en el futuro.");
      return;
    }

    // Validate recurrence
    if (isRecurring) {
      if (endType === "count" && count < 1) {
        setError("El número de repeticiones debe ser al menos 1.");
        return;
      }
      if (endType === "until") {
        if (!untilDate) {
          setError("Debes seleccionar una fecha de fin.");
          return;
        }
        if (untilDate <= triggerAt.split("T")[0]) {
          setError("La fecha de fin debe ser posterior a la fecha del recordatorio.");
          return;
        }
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let recurrenceRule: string | null = null;
      if (isRecurring && recurrenceParams) {
        recurrenceRule = buildRRule(recurrenceParams);
      }

      await onSubmit({
        content: content.trim(),
        trigger_at: utcTrigger,
        is_recurring: isRecurring,
        recurrence_rule: recurrenceRule,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el recordatorio.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {isEditing ? "Editar recordatorio" : "Nuevo recordatorio"}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {isEditing
                ? "Modifica los campos y guarda los cambios."
                : "Configura tu recordatorio. Puedes hacerlo recurrente."}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="grid gap-4 py-4">
            {/* Content */}
            <div className="grid gap-2">
              <Label htmlFor="reminder-content">Contenido</Label>
              <Textarea
                id="reminder-content"
                placeholder="¿Qué te recuerdo?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="resize-y min-h-[80px]"
              />
            </div>

            {/* Trigger date/time */}
            <div className="grid gap-2">
              <Label htmlFor="reminder-trigger">Fecha y hora</Label>
              <Input
                id="reminder-trigger"
                type="datetime-local"
                value={triggerAt}
                onChange={(e) => setTriggerAt(e.target.value)}
              />
            </div>

            {/* Recurrence section */}
            <div className="grid gap-3 border rounded-lg p-3">
              <Label>Repetición</Label>

              {/* Frequency */}
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as RRuleFrequency | "none")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isRecurring && (
                <>
                  {/* Interval */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="reminder-interval" className="shrink-0">
                      Cada
                    </Label>
                    <Input
                      id="reminder-interval"
                      type="number"
                      min={1}
                      max={99}
                      value={interval}
                      onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      {FREQUENCY_LABELS[frequency as RRuleFrequency]}
                    </span>
                  </div>

                  {/* Day picker (WEEKLY only) */}
                  {frequency === "WEEKLY" && (
                    <div className="grid gap-2">
                      <Label>Días</Label>
                      <div className="flex gap-1">
                        {DAY_OPTIONS.map((opt) => (
                          <Button
                            key={opt.value}
                            type="button"
                            variant={byDay.includes(opt.value) ? "default" : "outline"}
                            size="sm"
                            className="w-9 h-9 p-0"
                            onClick={() => toggleDay(opt.value)}
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* End condition */}
                  <div className="grid gap-2">
                    <Label>Finaliza</Label>
                    <Select
                      value={endType}
                      onValueChange={(v) => setEndType(v as EndType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Nunca</SelectItem>
                        <SelectItem value="count">Después de N veces</SelectItem>
                        <SelectItem value="until">Hasta una fecha</SelectItem>
                      </SelectContent>
                    </Select>

                    {endType === "count" && (
                      <div className="flex items-center gap-2">
                        <Label htmlFor="reminder-count" className="shrink-0">
                          Repeticiones
                        </Label>
                        <Input
                          id="reminder-count"
                          type="number"
                          min={1}
                          max={999}
                          value={count}
                          onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-24"
                        />
                      </div>
                    )}

                    {endType === "until" && (
                      <Input
                        type="date"
                        value={untilDate}
                        onChange={(e) => setUntilDate(e.target.value)}
                      />
                    )}
                  </div>

                  {/* RRULE preview */}
                  {rrulePreview && (
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
                      {rrulePreview}
                    </p>
                  )}
                </>
              )}
            </div>

            <FormError message={error} />
          </div>

          <ResponsiveDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear recordatorio"}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
