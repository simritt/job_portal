import { Skeleton } from "@/components/ui/skeleton"

export default function ManageResumesLoading() {
  return (
    <div className="max-w-3xl p-6 pt-0 space-y-6">
      <Skeleton className="h-6 w-40" />

      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}
