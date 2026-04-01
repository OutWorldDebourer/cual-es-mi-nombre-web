import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function GoogleSettingsLoading() {
  return (
    <div className="space-y-6 stagger-children">
      {/* Page heading */}
      <div>
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </div>

      {/* Connection status card */}
      <Card className="overflow-hidden">
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="mt-1 h-4 w-80 max-w-full" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-72 max-w-full" />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-10 w-full sm:w-44" />
            <Skeleton className="h-10 w-full sm:w-36" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
