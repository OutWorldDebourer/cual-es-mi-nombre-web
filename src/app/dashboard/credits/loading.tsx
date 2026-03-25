import { Skeleton } from "@/components/ui/skeleton"
import { CreditsSkeleton } from "@/components/skeletons/credits-skeleton"

export default function CreditsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <CreditsSkeleton />
    </div>
  )
}
