"use client"

type JobStatus = "ALL" | "ACTIVE" | "DRAFT" | "CLOSED"

const filters: JobStatus[] = ["ALL", "ACTIVE", "DRAFT", "CLOSED"]

export function JobStatusFilters({
  value,
  onChange,
  counts,
}: {
  value: JobStatus
  onChange: (v: JobStatus) => void
  counts: Record<Exclude<JobStatus, "ALL">, number>
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => {
        const isActive = value === filter

        return (
          <button
            key={filter}
            onClick={() => onChange(filter)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer
              ${
                isActive
                  ? "bg-black text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {filter === "ALL"
              ? "All"
              : `${filter.charAt(0)}${filter.slice(1).toLowerCase()} (${
                  counts[filter]
                })`}
          </button>
        )
      })}
    </div>
  )
}
