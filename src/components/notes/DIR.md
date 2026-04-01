# /src/components/notes/

Notes CRUD interface with Kanban board, drag-and-drop, grouping, and filtering.

## Files
| File | Description | Last Modified |
|------|-------------|---------------|
| `note-board-column.tsx` | Single Kanban column for one note status, droppable zone with collapsible header on mobile | initial · 2026-03-30 |
| `note-board-view.tsx` | Kanban board layout splitting notes into 3 columns by status (active/en_curso/completed) | initial · 2026-03-30 |
| `note-card.tsx` | Note display card (variant=interactive) with title, content preview, tags, priority, status, pin/archive/edit/delete actions | T1 · 2026-03-31 |
| `note-drag-overlay.tsx` | Elevated card overlay that follows the cursor during drag-and-drop operations | initial · 2026-03-30 |
| `note-form.tsx` | Dialog form for creating and editing notes with title, content, status, priority, and tags fields | initial · 2026-03-30 |
| `note-group-section.tsx` | Collapsible section header for tag-based note grouping with color-coded badge and count | initial · 2026-03-30 |
| `note-list.tsx` | Main notes orchestrator: CRUD, search, filters, drag-and-drop reordering, realtime sync, and layout modes | initial · 2026-03-30 |
| `note-priority-config.ts` | Priority level definitions (urgent/high/normal/low) with labels, badge classes, and icons | initial · 2026-03-30 |
| `note-priority-filter.tsx` | Filter pill bar for selecting notes by priority level | initial · 2026-03-30 |
| `note-sortable-card.tsx` | dnd-kit sortable wrapper around NoteCard enabling drag handle and smooth reorder transitions | initial · 2026-03-30 |
| `note-status-config.ts` | Status definitions (active/en_curso/completed) with labels, badge classes, and card border accents | initial · 2026-03-30 |
| `note-tag-colors.ts` | Deterministic tag-to-color mapping utility using string hash over a 6-color palette | initial · 2026-03-30 |
| `note-view-dialog.tsx` | Read-only dialog displaying full note content with status, priority, tags, and edit action | initial · 2026-03-30 |
