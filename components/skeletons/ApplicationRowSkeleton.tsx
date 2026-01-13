import { Skeleton } from "@/components/ui/skeleton"

export function ApplicationRowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>

      <Skeleton className="h-6 w-24" />
    </div>
  )
}
