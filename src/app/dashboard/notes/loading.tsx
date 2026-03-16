import { Skeleton } from "@/components/ui/skeleton"
import { NotesGridSkeleton } from "@/components/skeletons/note-card-skeleton"

export default function NotesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-80 mt-2" />
      </div>
      <NotesGridSkeleton />
    </div>
  )
}
