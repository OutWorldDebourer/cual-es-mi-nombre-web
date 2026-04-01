import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

function PlanCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pt-8 text-center">
        <Skeleton className="mx-auto h-5 w-16" />
        <Skeleton className="mx-auto mt-2 h-4 w-40" />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6">
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-10 w-24" />
          <Skeleton className="mx-auto h-4 w-32" />
        </div>
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

export default function PlansLoading() {
  return (
    <div className="space-y-6 stagger-children">
      <div>
        <Skeleton className="h-9 w-28" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-center">
        <PlanCardSkeleton />
        <PlanCardSkeleton />
        <PlanCardSkeleton />
        <PlanCardSkeleton />
      </div>
    </div>
  )
}
