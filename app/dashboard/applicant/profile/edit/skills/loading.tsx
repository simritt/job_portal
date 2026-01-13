import { Skeleton } from "@/components/ui/skeleton"

export default function EditSkillsLoading() {
  return (
    <div className="max-w-3xl p-6 pt-0 space-y-6">
      <Skeleton className="h-6 w-32" />

      <Skeleton className="h-10 w-full" />

      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  )
}
