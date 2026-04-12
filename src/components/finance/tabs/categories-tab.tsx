"use client";

import { useMemo } from "react";
import { Lock, Pencil, Trash2, Plus, Tag } from "lucide-react";
import type { FinanceCategory, CategoryType } from "@/types/database";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/finance/shared/empty-state";

// ── Props ──────────────────────────────────────────────────────────────────

interface CategoriesTabProps {
  categories: FinanceCategory[];
  onRefresh: () => void;
}

// ── Type labels ────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  CategoryType,
  { title: string; subtitle: string; colorClass: string }
> = {
  expense: {
    title: "Gastos",
    subtitle: "Categorias para tus gastos diarios",
    colorClass: "text-red-600 dark:text-red-400",
  },
  income: {
    title: "Ingresos",
    subtitle: "Categorias para tus fuentes de ingreso",
    colorClass: "text-emerald-600 dark:text-emerald-400",
  },
  transfer: {
    title: "Transferencias",
    subtitle: "Movimientos entre tus cuentas",
    colorClass: "text-blue-600 dark:text-blue-400",
  },
};

// ── Component ──────────────────────────────────────────────────────────────

/** Category management tab: view, add, edit, and delete finance categories. */
export function CategoriesTab({ categories, onRefresh }: CategoriesTabProps) {
  const grouped = useMemo(() => {
    const map: Record<CategoryType, FinanceCategory[]> = {
      expense: [],
      income: [],
      transfer: [],
    };
    for (const cat of categories) {
      map[cat.type]?.push(cat);
    }
    // Sort each group by sort_order
    for (const key of Object.keys(map) as CategoryType[]) {
      map[key].sort((a, b) => a.sort_order - b.sort_order);
    }
    return map;
  }, [categories]);

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={Tag}
        title="Sin categorias"
        description="Crea categorias para organizar tus movimientos financieros."
        actionLabel="Crear categoria"
        onAction={() => {
          // TODO: open create category modal
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Add category button */}
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            // TODO: open create category modal (Phase 3)
          }}
        >
          <Plus className="size-4" />
          Nueva categoria
        </Button>
      </div>

      {/* Expense categories */}
      <CategorySection
        type="expense"
        categories={grouped.expense}
        onRefresh={onRefresh}
      />

      {/* Income categories */}
      <CategorySection
        type="income"
        categories={grouped.income}
        onRefresh={onRefresh}
      />

      {/* Transfer categories */}
      <CategorySection
        type="transfer"
        categories={grouped.transfer}
        onRefresh={onRefresh}
      />
    </div>
  );
}

// ── Category section ───────────────────────────────────────────────────────

function CategorySection({
  type,
  categories,
  onRefresh,
}: {
  type: CategoryType;
  categories: FinanceCategory[];
  onRefresh: () => void;
}) {
  const config = TYPE_CONFIG[type];

  if (categories.length === 0) return null;

  return (
    <div className="space-y-3">
      <div>
        <h3 className={cn("text-sm font-semibold", config.colorClass)}>
          {config.title}
        </h3>
        <p className="text-xs text-muted-foreground">{config.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  );
}

// ── Category card ──────────────────────────────────────────────────────────

function CategoryCard({
  category,
  onRefresh,
}: {
  category: FinanceCategory;
  onRefresh: () => void;
}) {
  const handleEdit = () => {
    // TODO: open edit category modal (Phase 3)
    void onRefresh;
  };

  const handleDelete = () => {
    // TODO: open delete confirmation modal (Phase 3)
    void onRefresh;
  };

  return (
    <Card variant="interactive">
      <CardContent className="flex items-center gap-3 py-3">
        {/* Icon / emoji */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg dark:bg-muted/50">
          {category.icon ?? "📁"}
        </div>

        {/* Name + badges */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium text-foreground">
              {category.name}
            </span>
            {category.is_system && (
              <Lock className="size-3 shrink-0 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {/* Color dot */}
            {category.color && (
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
                aria-label={`Color: ${category.color}`}
              />
            )}
            {/* Usage count */}
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {category.usage_count} uso{category.usage_count !== 1 ? "s" : ""}
            </Badge>
            {/* System badge */}
            {category.is_system && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Sistema
              </Badge>
            )}
          </div>
        </div>

        {/* Actions (non-system only) */}
        {!category.is_system && (
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleEdit}
              aria-label={`Editar ${category.name}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleDelete}
              aria-label={`Eliminar ${category.name}`}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
