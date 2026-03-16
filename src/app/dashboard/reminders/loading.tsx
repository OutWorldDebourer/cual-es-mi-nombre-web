import { Skeleton } from "@/components/ui/skeleton"
import { RemindersListSkeleton } from "@/components/skeletons/reminder-card-skeleton"

export default function RemindersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <RemindersListSkeleton />
    </div>
  )
}
