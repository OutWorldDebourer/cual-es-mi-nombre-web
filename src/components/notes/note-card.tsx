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
import type { Note } from "@/types/database";
import { formatRelativeTime } from "@/lib/dates";
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

type NoteLayout = "grid" | "list";

import { tagColor } from "@/components/notes/note-tag-colors";

interface NoteCardProps {
  note: Note;
  layout?: NoteLayout;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string, isPinned: boolean) => void;
  onArchive: (noteId: string) => void;
  onTagClick?: (tag: string) => void;
}

export function NoteCard({
  note,
  layout = "grid",
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  onArchive,
  onTagClick,
}: NoteCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const maxPreview = layout === "list" ? 120 : 200;
  const contentPreview =
    note.content.length > maxPreview
      ? note.content.slice(0, maxPreview) + "…"
      : note.content;

  const actionsMenu = (
    <div onClick={(e) => e.stopPropagation()}>
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
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
          ✏️ Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onTogglePin(note.id, !note.is_pinned)}
        >
          {note.is_pinned ? "📌 Desfijar" : "📌 Fijar"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onArchive(note.id)}>
          📦 Archivar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setShowDeleteDialog(true)}
          className="text-destructive focus:text-destructive"
        >
          🗑️ Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );

  if (layout === "list") {
    return (
      <>
        <Card
          className={`transition-shadow hover:shadow-md cursor-pointer ${
            note.is_pinned ? "border-primary/40 bg-primary/5" : ""
          }`}
          onClick={() => onView(note)}
        >
          <div className="flex items-center gap-4 px-4 py-3">
            {/* Title + date */}
            <div className="min-w-0 w-48 shrink-0">
              <p className="text-sm font-medium truncate">
                {note.is_pinned && (
                  <span className="mr-1" aria-label="Fijada">
                    📌
                  </span>
                )}
                {note.title || "Sin título"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(note.updated_at)}
              </p>
            </div>
            {/* Content preview */}
            <p className="flex-1 min-w-0 text-sm text-muted-foreground truncate">
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
        className={`transition-shadow hover:shadow-md cursor-pointer ${
          note.is_pinned ? "border-primary/40 bg-primary/5" : ""
        }`}
        onClick={() => onView(note)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">
                {note.is_pinned && (
                  <span className="mr-1" aria-label="Fijada">
                    📌
                  </span>
                )}
                {note.title || "Sin título"}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {formatRelativeTime(note.updated_at)}
              </p>
            </div>
            {actionsMenu}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
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
