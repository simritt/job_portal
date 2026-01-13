import { Skeleton } from "@/components/ui/skeleton"

export function JobCardSkeleton() {
  return (
    <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
      <Skeleton className="h-5 w-3/5" />
      <Skeleton className="h-4 w-2/5" />

      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}
