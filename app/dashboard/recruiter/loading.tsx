import { Skeleton } from "@/components/ui/skeleton"

export default function RecruiterDashboardLoading() {
  return (
    <div className="p-6 space-y-8 pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-56 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-muted/50 p-6 shadow-sm"
          >
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Charts + Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-muted/50 shadow-sm">
          <div className="p-6">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-64 mb-6" />
            <Skeleton className="h-[260px] w-full rounded-lg" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Performance Card */}
          <div className="rounded-xl border border-border bg-muted/50 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>

            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-20 mb-6" />

            <div className="pt-4 border-t border-border">
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="rounded-xl border border-border bg-muted/50 shadow-sm p-4">
            <Skeleton className="h-4 w-32 mb-4" />

            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 mb-3"
              >
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
