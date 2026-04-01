import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SettingsLoading() {
  return (
    <div className="space-y-6 stagger-children">
      <div>
        <Skeleton className="h-9 w-44" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      {/* Profile card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-1 h-4 w-72" />
        </CardHeader>
        <CardContent className="max-w-md space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-52" />
        </CardContent>
      </Card>

      {/* Assistant card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-1 h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-72" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-44" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-80" />
          </div>
        </CardContent>
      </Card>

      <div className="max-w-md">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
