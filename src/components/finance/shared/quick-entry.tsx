"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronDown, Plus, X } from "lucide-react";
import type { FinanceCategory, TransactionType } from "@/types/database";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { CategoryPills } from "@/components/finance/shared/category-pills";
import { AmountInput } from "@/components/finance/shared/amount-input";

/* ── Types ─────────────────────────────────────────────────────── */

interface QuickEntrySubmit {
  type: TransactionType;
  categoryId: string;
  amount: number;
  description: string;
}

interface TodayTotals {
  income: number;
  expense: number;
}

interface QuickEntryProps {
  categories: FinanceCategory[];
  onSubmit: (entry: QuickEntrySubmit) => void;
  todayTotals: TodayTotals;
  className?: string;
}

interface EntryWidgetProps {
  type: "income" | "expense";
  categories: FinanceCategory[];
  todayTotal: number;
  onSubmit: (entry: QuickEntrySubmit) => void;
}

/* ── Helpers ───────────────────────────────────────────────────── */

function formatAmount(n: number): string {
  return `S/ ${n.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const FLASH_DURATION_MS = 1500;

/* ── Palette lookup ────────────────────────────────────────────── */

const palette = {
  income: {
    accent: "#00da00",
    emoji: "\uD83D\uDCB0",
    title: "Registro R\u00e1pido de Ingresos",
    prompt: "\u00bfCu\u00e1nto ganaste hoy?",
    btnLabel: "Registrar",
    flashMsg: "\u2705 Ingreso registrado!",
    waHint: "Tip: tambi\u00e9n puedes enviar por WhatsApp \u2018gan\u00e9 150 en ventas\u2019",
    borderClass: "border-l-[3px] border-l-[#00da00]",
    btnClass: "bg-[#00da00] hover:bg-[#00c200] text-black",
    totalClass: "text-[#00da00]",
    flashBg: "bg-[#00da00]/10",
    flashText: "text-[#00da00]",
  },
  expense: {
    accent: "#ff2067",
    emoji: "\uD83D\uDCB8",
    title: "Registro R\u00e1pido de Gastos",
    prompt: "\u00bfCu\u00e1nto gastaste?",
    btnLabel: "Registrar",
    flashMsg: "\u2705 Gasto registrado!",
    waHint: "Tip: tambi\u00e9n puedes enviar por WhatsApp \u2018gast\u00e9 30 en almuerzo\u2019",
    borderClass: "border-l-[3px] border-l-[#ff2067]",
    btnClass: "bg-[#ff2067] hover:bg-[#e61b5c] text-white",
    totalClass: "text-[#ff2067]",
    flashBg: "bg-[#ff2067]/10",
    flashText: "text-[#ff2067]",
  },
} as const;

/* ── EntryWidget ───────────────────────────────────────────────── */

function EntryWidget({ type, categories, todayTotal, onSubmit }: EntryWidgetProps) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [showDesc, setShowDesc] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const p = palette[type];
  const isIncome = type === "income";

  const filteredCategories = categories.filter(
    (c) => c.type === (isIncome ? "income" : "expense") && c.show_in_quick_entry,
  );

  const selectedCategory = filteredCategories.find((c) => c.id === categoryId) ?? null;

  const canSubmit = categoryId !== null && amount !== "" && parseFloat(amount) > 0;

  /* ── Cleanup flash timer on unmount ── */
  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  /* ── Submit handler ── */
  const handleSubmit = useCallback(() => {
    if (!canSubmit || !categoryId) return;
    onSubmit({
      type,
      categoryId,
      amount: parseFloat(amount),
      description: description.trim(),
    });

    // Show success flash
    setFlashVisible(true);
    flashTimer.current = setTimeout(() => setFlashVisible(false), FLASH_DURATION_MS);

    // Reset form
    setCategoryId(null);
    setAmount("");
    setDescription("");
    setShowDesc(false);
  }, [canSubmit, categoryId, amount, description, type, onSubmit]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card",
        p.borderClass,
      )}
    >
      {/* ── Success flash overlay ── */}
      {flashVisible && (
        <div
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center",
            "animate-in fade-in-0 duration-200",
            p.flashBg,
          )}
        >
          <span className={cn("text-base font-semibold", p.flashText)}>
            {p.flashMsg}
          </span>
        </div>
      )}

      {/* ── Collapsed trigger bar ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-accent/50"
      >
        <span className="text-base" aria-hidden="true">
          {p.emoji}
        </span>
        <span className="flex-1 truncate text-[14px] font-semibold text-foreground">
          {p.title}
        </span>
        <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
          Hoy:{" "}
          <span className={p.totalClass}>{formatAmount(todayTotal)}</span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* ── Expanded body ── */}
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 px-4 pb-4 pt-1">
            {/* 1. Prompt text */}
            <p className="text-[15px] font-medium text-foreground">{p.prompt}</p>

            {/* 2. Amount row: input + register button */}
            <div className="flex items-center gap-2">
              <AmountInput
                value={amount}
                onChange={setAmount}
                variant={isIncome ? "income" : "expense"}
                size="lg"
                placeholder="0.00"
                className="flex-1 !h-12 !text-xl !font-bold"
              />
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className={cn(
                  "h-12 shrink-0 rounded-md px-5 text-sm font-semibold transition-all",
                  "disabled:pointer-events-none disabled:opacity-40",
                  p.btnClass,
                )}
              >
                {p.btnLabel}
              </button>
            </div>

            {/* 3. Category pills */}
            {filteredCategories.length > 0 ? (
              <CategoryPills
                categories={filteredCategories}
                selected={categoryId}
                onSelect={setCategoryId}
                maxVisible={4}
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                No hay categor\u00edas de {isIncome ? "ingreso" : "gasto"} configuradas.
              </p>
            )}

            {/* 4. Selected category indicator */}
            {selectedCategory && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ backgroundColor: selectedCategory.color ?? p.accent }}
                />
                <span className="font-medium text-foreground">
                  {selectedCategory.icon} {selectedCategory.name}
                </span>
                <button
                  type="button"
                  onClick={() => setCategoryId(null)}
                  className="ml-auto rounded-full p-0.5 hover:bg-muted"
                  aria-label="Quitar categor\u00eda"
                >
                  <X className="size-3" />
                </button>
              </div>
            )}

            {/* 5. Description toggle */}
            {!showDesc ? (
              <button
                type="button"
                onClick={() => setShowDesc(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="size-3" />
                Agregar descripci\u00f3n (opcional)
              </button>
            ) : (
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isIncome ? "Ej: Sueldo marzo" : "Ej: Almuerzo"}
                className="h-9 text-sm"
                autoFocus
              />
            )}

            {/* 6. WhatsApp hint */}
            <p className="text-[11px] text-muted-foreground/60">{p.waHint}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── QuickEntry (public) ───────────────────────────────────────── */

/** Two side-by-side collapsible widgets for quick income/expense entry. */
export function QuickEntry({
  categories,
  onSubmit,
  todayTotals,
  className,
}: QuickEntryProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      <EntryWidget
        type="income"
        categories={categories}
        todayTotal={todayTotals.income}
        onSubmit={onSubmit}
      />
      <EntryWidget
        type="expense"
        categories={categories}
        todayTotal={todayTotals.expense}
        onSubmit={onSubmit}
      />
    </div>
  );
}
