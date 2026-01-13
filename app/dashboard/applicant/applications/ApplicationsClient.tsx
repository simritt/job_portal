"use client"

import { useState } from "react"
import { StatusBadge } from "@/components/application/StatusBadge"
import { WithdrawFromHistory } from "@/components/application/WithdrawFromHistory"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

type Application = {
  applicationId: string
  status: "APPLIED" | "SHORTLISTED" | "REJECTED" | "WITHDRAWN"
  appliedAt: string
  jobTitle: string
  companyName: string
  skills?: { id: string; name: string }[]   
}


export default function ApplicationsClient({
  applications,
}: {
  applications: Application[]
}) {
  const [filter, setFilter] = useState<
    "ALL" | "APPLIED" | "SHORTLISTED" | "REJECTED" | "WITHDRAWN"
  >("ALL")

  const [search, setSearch] = useState("")

  const filteredApplications =
  applications
    .filter((app) =>
      filter === "ALL" ? true : app.status === filter
    )
    .filter((app) => {
      if (!search) return true

      const q = search.toLowerCase()

      return (
        app.jobTitle.toLowerCase().includes(q) ||
        app.companyName.toLowerCase().includes(q) ||
        app.skills?.some((s) =>
          s.name.toLowerCase().includes(q)
        )
      )
    })

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Application History</h2>

      <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "APPLIED", "SHORTLISTED", "REJECTED", "WITHDRAWN"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`rounded-full px-3 py-1 text-sm cursor-pointer transition ${
                filter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {status === "ALL" ? "All" : status}
            </button>
          )
        )}
      </div>
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />     
      <input
        type="text"
        placeholder="Search jobs, companies, skills..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
      />
      </div>
      </div>

      {/* List */}
      {filteredApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
          <h2 className="text-lg font-semibold">No applications yet</h2>
          <p className="text-sm text-muted-foreground">
            You haven’t applied to any jobs yet.
          </p>

          <Button asChild className="mt-2">
            <Link href="/dashboard/applicant">Browse jobs</Link>
          </Button>
        </div>

      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <div
              key={app.applicationId}
              className="flex items-center justify-between rounded-lg border bg-card p-4 hover:shadow-md transition-all duration-200 hover:scale-101 group"
            >
              <div>
                <p className="font-medium">{app.jobTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {app.companyName}
                </p>

                {Array.isArray(app.skills) && app.skills.length > 0 && (
  <div className="mt-2 flex flex-wrap gap-2">
    {app.skills.slice(0, 4).map((skill) => (
      <span
        key={skill.id}
        className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
      >
        {skill.name}
      </span>
    ))}
  </div>
)}

              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={app.status} />
                {app.status === "APPLIED" && (
                  <WithdrawFromHistory
                    applicationId={app.applicationId}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
