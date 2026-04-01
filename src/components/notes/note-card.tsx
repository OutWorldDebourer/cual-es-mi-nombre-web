/**
 * Note Card Component — "Cuál es mi nombre" Web
 *
 * Displays a single note with title, content preview, tags, and action menu.
 * Supports pin/unpin, archive, edit trigger, and delete with confirmation.
 *
 * @module components/notes/note-card
 */

"use client";

import { useState } from "react";
import type { Note, NoteStatus, NotePriority } from "@/types/database";
import { formatRelativeTime } from "@/lib/dates";
import { NOTE_STATUS_CONFIG } from "@/components/notes/note-status-config";
import { NOTE_PRIORITY_CONFIG } from "@/components/notes/note-priority-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { GripVertical } from "lucide-react";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";

type NoteLayout = "grid" | "list" | "compact";

import { tagColor } from "@/components/notes/note-tag-colors";

interface NoteCardProps {
  note: Note;
  layout?: NoteLayout;
  index?: number;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string, isPinned: boolean) => void;
  onArchive: (noteId: string) => void;
  onStatusChange?: (noteId: string, status: NoteStatus) => void;
  onPriorityChange?: (noteId: string, priority: NotePriority) => void;
  onTagClick?: (tag: string) => void;
  dragHandleListeners?: DraggableSyntheticListeners;
}

export function NoteCard({
  note,
  layout = "grid",
  index,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  onArchive,
  onStatusChange,
  onPriorityChange,
  onTagClick,
  dragHandleListeners,
}: NoteCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const priority = note.priority ?? "normal";
  const priorityConfig = priority !== "normal" ? NOTE_PRIORITY_CONFIG[priority] : null;

  const priorityDot = priorityConfig ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-block h-2 w-2 rounded-full shrink-0 ${priorityConfig.dotClass}`}
          aria-label={`Prioridad: ${priorityConfig.label}`}
        />
      </TooltipTrigger>
      <TooltipContent>{priorityConfig.label}</TooltipContent>
    </Tooltip>
  ) : null;

  const maxPreview = layout === "compact" ? 100 : layout === "list" ? 120 : 200;
  const contentPreview =
    note.content.length > maxPreview
      ? note.content.slice(0, maxPreview) + "…"
      : note.content;

  const actionsMenu = (
    <div onClick={(e) => e.stopPropagation()} className="shrink-0">
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Acciones de nota"
            >
              ⋮
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Acciones</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(note)}>
          <span aria-hidden="true">✏️</span> Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onTogglePin(note.id, !note.is_pinned)}
        >
          <span aria-hidden="true">📌</span> {note.is_pinned ? "Desfijar" : "Fijar"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onArchive(note.id)}>
          <span aria-hidden="true">📦</span> Archivar
        </DropdownMenuItem>
        {onStatusChange && (
          <>
            <DropdownMenuSeparator />
            {note.status !== "en_curso" && (
              <DropdownMenuItem onClick={() => onStatusChange(note.id, "en_curso")}>
                <span aria-hidden="true">🔄</span> Marcar en curso
              </DropdownMenuItem>
            )}
            {note.status !== "completed" && (
              <DropdownMenuItem onClick={() => onStatusChange(note.id, "completed")}>
                <span aria-hidden="true">✅</span> Marcar completada
              </DropdownMenuItem>
            )}
            {note.status !== "active" && (
              <DropdownMenuItem onClick={() => onStatusChange(note.id, "active")}>
                <span aria-hidden="true">↩️</span> Marcar activa
              </DropdownMenuItem>
            )}
          </>
        )}
        {onPriorityChange && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {priorityConfig ? (
                  <span className={`inline-block h-2 w-2 rounded-full mr-1 ${priorityConfig.dotClass}`} />
                ) : null}
                Prioridad
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {priority !== "urgent" && (
                  <DropdownMenuItem onClick={() => onPriorityChange(note.id, "urgent")}>
                    <span className={`inline-block h-2 w-2 rounded-full ${NOTE_PRIORITY_CONFIG.urgent.dotClass}`} />
                    Urgente
                  </DropdownMenuItem>
                )}
                {priority !== "high" && (
                  <DropdownMenuItem onClick={() => onPriorityChange(note.id, "high")}>
                    <span className={`inline-block h-2 w-2 rounded-full ${NOTE_PRIORITY_CONFIG.high.dotClass}`} />
                    Alta
                  </DropdownMenuItem>
                )}
                {priority !== "normal" && (
                  <DropdownMenuItem onClick={() => onPriorityChange(note.id, "normal")}>
                    Normal
                  </DropdownMenuItem>
                )}
                {priority !== "low" && (
                  <DropdownMenuItem onClick={() => onPriorityChange(note.id, "low")}>
                    <span className={`inline-block h-2 w-2 rounded-full ${NOTE_PRIORITY_CONFIG.low.dotClass}`} />
                    Baja
                  </DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setShowDeleteDialog(true)}
          className="text-destructive focus:text-destructive"
        >
          <span aria-hidden="true">🗑️</span> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );

  const dragHandle = dragHandleListeners ? (
    <button
      {...dragHandleListeners}
      className="touch-none transition-all duration-150 opacity-0 group-hover:opacity-50 hover:!opacity-100 max-md:opacity-30 cursor-grab active:cursor-grabbing active:scale-110 shrink-0 rounded p-0.5 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      aria-label="Arrastrar para reordenar"
      onClick={(e) => e.stopPropagation()}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </button>
  ) : null;

  if (layout === "compact") {
    return (
      <>
        <Card
          variant="interactive"
          className={`group cursor-pointer ${
            note.is_pinned ? "border-primary/40 bg-primary/5" : ""
          } ${NOTE_STATUS_CONFIG[note.status].cardBorderClass}`}
          onClick={() => onView(note)}
        >
          <CardHeader className="px-3 py-2 pb-1">
            <div className="flex items-start justify-between gap-1">
              {dragHandle}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 min-w-0">
                  {priorityDot}
                  <CardTitle className="text-sm truncate min-w-0">
                    {note.is_pinned && (
                      <span className="mr-1" aria-hidden="true">
                        📌
                      </span>
                    )}
                    {note.title || "Sin título"}
                  </CardTitle>
                </div>
              </div>
              {actionsMenu}
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-2 pt-0">
            <p className={`text-xs text-muted-foreground line-clamp-2 ${
              note.status === "completed" ? "line-through opacity-75" : ""
            }`}>
              {contentPreview}
            </p>
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {note.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 cursor-pointer transition-colors ${tagColor(tag)}`}
                    onClick={(e) => { e.stopPropagation(); onTagClick?.(tag); }}
                  >
                    {tag}
                  </Badge>
                ))}
                {note.tags.length > 2 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    +{note.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar esta nota?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La nota &quot;
                {note.title || "Sin título"}&quot; será eliminada
                permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(note.id)}
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

  if (layout === "list") {
    return (
      <>
        <Card
          variant="interactive"
          className={`group cursor-pointer ${
            note.is_pinned ? "border-primary/40 bg-primary/5" : ""
          } ${NOTE_STATUS_CONFIG[note.status].cardBorderClass}`}
          onClick={() => onView(note)}
        >
          <div className="flex items-center gap-4 px-4 py-3">
            {/* Drag handle */}
            {dragHandle}
            {/* Index */}
            {index != null && (
              <span className="text-xs font-mono text-muted-foreground/60 shrink-0">
                #{index}
              </span>
            )}
            {/* Title + date + status */}
            <div className="min-w-0 w-32 sm:w-48 shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                {priorityDot}
                <p className="text-sm font-medium truncate min-w-0">
                  {note.is_pinned && (
                    <span className="mr-1" aria-hidden="true">
                      📌
                    </span>
                  )}
                  {note.title || "Sin título"}
                </p>
                {note.status !== "active" && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 shrink-0 ${NOTE_STATUS_CONFIG[note.status].badgeClass}`}
                  >
                    {NOTE_STATUS_CONFIG[note.status].label}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(note.updated_at)}
              </p>
            </div>
            {/* Content preview */}
            <p className={`flex-1 min-w-0 text-sm text-muted-foreground truncate ${
              note.status === "completed" ? "line-through opacity-75" : ""
            }`}>
              {contentPreview}
            </p>
            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="hidden sm:flex gap-1 shrink-0">
                {note.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={`text-xs cursor-pointer transition-colors ${tagColor(tag)}`}
                    onClick={(e) => { e.stopPropagation(); onTagClick?.(tag); }}
                  >
                    {tag}
                  </Badge>
                ))}
                {note.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{note.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            {/* Actions */}
            {actionsMenu}
          </div>
        </Card>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar esta nota?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La nota &quot;
                {note.title || "Sin título"}&quot; será eliminada
                permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(note.id)}
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

  return (
    <>
      <Card
        variant="interactive"
        className={`group cursor-pointer ${
          note.is_pinned ? "border-primary/40 bg-primary/5" : ""
        } ${NOTE_STATUS_CONFIG[note.status].cardBorderClass}`}
        onClick={() => onView(note)}
      >
        <CardHeader className="pb-2 overflow-hidden">
          <div className="flex items-start justify-between gap-2 min-w-0">
            {/* Drag handle */}
            {dragHandle}
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 min-w-0">
                {priorityDot}
                {index != null && (
                  <span className="text-xs font-mono text-muted-foreground/60 shrink-0">
                    #{index}
                  </span>
                )}
                <CardTitle className="text-base truncate min-w-0 shrink">
                  {note.is_pinned && (
                    <span className="mr-1" aria-hidden="true">
                      📌
                    </span>
                  )}
                  {note.title || "Sin título"}
                </CardTitle>
                {note.status !== "active" && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 shrink-0 whitespace-nowrap ${NOTE_STATUS_CONFIG[note.status].badgeClass}`}
                  >
                    {NOTE_STATUS_CONFIG[note.status].label}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatRelativeTime(note.updated_at)}
              </p>
            </div>
            {actionsMenu}
          </div>
        </CardHeader>
        <CardContent>
          <p className={`text-sm text-muted-foreground whitespace-pre-wrap break-words ${
            note.status === "completed" ? "line-through opacity-75" : ""
          }`}>
            {contentPreview}
          </p>
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {note.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={`text-xs cursor-pointer transition-colors ${tagColor(tag)}`}
                  onClick={(e) => { e.stopPropagation(); onTagClick?.(tag); }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta nota?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La nota &quot;
              {note.title || "Sin título"}&quot; será eliminada
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(note.id)}
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
