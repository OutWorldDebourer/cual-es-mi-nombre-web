"use client";

import { useCallback, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FinanceCategory, CategoryType } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";

// ── Schema ──────────────────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(50, "Maximo 50 caracteres"),
  icon: z.string().max(10).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hex invalido").optional(),
  type: z.enum(["expense", "income", "transfer"]),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export interface CategorySubmitData {
  name: string;
  icon: string | null;
  color: string | null;
  type: CategoryType;
}

interface EditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null = creating new category, existing = editing */
  category: FinanceCategory | null;
  onSubmit: (data: CategorySubmitData) => void;
}

// ── Type options ────────────────────────────────────────────────────────────

const TYPE_OPTIONS: Array<{ value: CategoryType; label: string }> = [
  { value: "expense", label: "Gasto" },
  { value: "income", label: "Ingreso" },
  { value: "transfer", label: "Transferencia" },
];

// ── Component ───────────────────────────────────────────────────────────────

/** Modal for creating or editing a finance category. */
export function EditCategoryModal({
  open,
  onOpenChange,
  category,
  onSubmit,
}: EditCategoryModalProps) {
  const isEditing = category !== null;

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      icon: "",
      color: "#6366f1",
      type: "expense",
    },
  });

  // Pre-populate when editing
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        icon: category.icon ?? "",
        color: category.color ?? "#6366f1",
        type: category.type,
      });
    } else {
      reset({ name: "", icon: "", color: "#6366f1", type: "expense" });
    }
  }, [category, reset]);

  const handleFormSubmit = useCallback(
    (data: CategoryFormData) => {
      onSubmit({
        name: data.name,
        icon: data.icon || null,
        color: data.color || null,
        type: data.type as CategoryType,
      });
      reset();
      onOpenChange(false);
    },
    [onSubmit, reset, onOpenChange]
  );

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {isEditing ? "Editar categoria" : "Nueva categoria"}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {isEditing
              ? "Modifica los datos de la categoria."
              : "Crea una categoria personalizada."}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 py-2"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Nombre</Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  id="cat-name"
                  {...field}
                  placeholder="Ej: Delivery"
                  className="h-9 text-sm"
                />
              )}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Icon + Color row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cat-icon">Icono (emoji)</Label>
              <Controller
                control={control}
                name="icon"
                render={({ field }) => (
                  <Input
                    id="cat-icon"
                    {...field}
                    placeholder="🍔"
                    className="h-9 text-sm"
                    maxLength={10}
                  />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cat-color">Color</Label>
              <Controller
                control={control}
                name="color"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={field.value ?? "#6366f1"}
                      onChange={field.onChange}
                      className="size-9 cursor-pointer rounded-md border border-input"
                    />
                    <Input
                      id="cat-color"
                      {...field}
                      placeholder="#6366f1"
                      className="h-9 flex-1 text-xs font-mono"
                    />
                  </div>
                )}
              />
              {errors.color && (
                <p className="text-xs text-destructive">{errors.color.message}</p>
              )}
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Footer */}
          <ResponsiveDialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isEditing ? "Guardar cambios" : "Crear"}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
