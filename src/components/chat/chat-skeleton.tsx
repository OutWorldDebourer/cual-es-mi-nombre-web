"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ChatSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header bar skeleton */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>

      {/* Message bubbles */}
      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 py-4">
        {/* Assistant message */}
        <div className="flex justify-start">
          <Skeleton className="h-14 w-[60%] rounded-2xl rounded-bl-sm" />
        </div>

        {/* User message */}
        <div className="flex justify-end" style={{ animationDelay: "75ms" }}>
          <Skeleton className="h-12 w-[45%] rounded-2xl rounded-br-sm" />
        </div>

        {/* Assistant message */}
        <div className="flex justify-start" style={{ animationDelay: "150ms" }}>
          <Skeleton className="h-16 w-[70%] rounded-2xl rounded-bl-sm" />
        </div>

        {/* User message */}
        <div className="flex justify-end" style={{ animationDelay: "225ms" }}>
          <Skeleton className="h-12 w-[55%] rounded-2xl rounded-br-sm" />
        </div>
      </div>

      {/* Input bar skeleton */}
      <div className="flex items-end gap-2 border-t px-4 py-3">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
      </div>
    </div>
  )
}
