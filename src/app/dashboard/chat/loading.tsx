import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex h-[calc(100vh-10rem)] flex-col rounded-xl border bg-card shadow-sm">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Messages skeleton */}
        <div className="flex-1 space-y-3 overflow-hidden p-4">
          {/* Assistant bubble */}
          <div className="flex justify-start">
            <Skeleton className="h-16 w-64 rounded-2xl rounded-bl-sm" />
          </div>
          {/* User bubble */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-48 rounded-2xl rounded-br-sm" />
          </div>
          {/* Assistant bubble */}
          <div className="flex justify-start">
            <Skeleton className="h-20 w-72 rounded-2xl rounded-bl-sm" />
          </div>
          {/* User bubble */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-40 rounded-2xl rounded-br-sm" />
          </div>
          {/* Assistant bubble */}
          <div className="flex justify-start">
            <Skeleton className="h-14 w-56 rounded-2xl rounded-bl-sm" />
          </div>
        </div>

        {/* Input skeleton */}
        <div className="flex items-end gap-2 border-t px-4 py-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
