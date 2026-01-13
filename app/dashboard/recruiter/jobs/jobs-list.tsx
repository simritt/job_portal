"use client"

import { useState } from "react"
import { JobStatusFilters } from "./job-status-filters"
import JobActions from "./JobActions"
import Link from "next/link"

type JobSkill = {
  id: string
  name: string
  isMandatory: boolean
}

type Job = {
  id: string
  title: string
  location?: string | null
  status: "ACTIVE" | "DRAFT" | "CLOSED"
  applicantsCount: number
  skills?: JobSkill[]
}

export default function JobsList({ jobs }: { jobs: Job[] }) {
  const [filter, setFilter] = useState<
    "ALL" | "ACTIVE" | "DRAFT" | "CLOSED"
  >("ALL")

  const filteredJobs =
    filter === "ALL"
      ? jobs
      : jobs.filter((job) => job.status === filter)

  const counts = {
    ACTIVE: jobs.filter((j) => j.status === "ACTIVE").length,
    DRAFT: jobs.filter((j) => j.status === "DRAFT").length,
    CLOSED: jobs.filter((j) => j.status === "CLOSED").length,
  }

  return (
    <div className="space-y-4">
      <JobStatusFilters
        value={filter}
        onChange={setFilter}
        counts={counts}
      />

      {filteredJobs.map((job) => (
        <div
          key={job.id}
          className="flex items-center justify-between rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-102 group"
        >
          {/* LEFT */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg text-foreground">
                {job.title}
              </h3>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  job.status === "ACTIVE"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : job.status === "CLOSED"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
              >
                {job.status === "ACTIVE"
                  ? "Active"
                  : job.status === "CLOSED"
                  ? "Closed"
                  : "Draft"}
              </span>
            </div>

            {job.location && (
              <p className="text-sm text-muted-foreground">
                {job.location}
              </p>
            )}

            {/* 🔹 SKILLS BELOW LOCATION */}
            {job.skills && job.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {job.skills.slice(0, 5).map((skill) => (
                  <span
                    key={skill.id}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      skill.isMandatory
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {skill.name}
                  </span>
                ))}

                {job.skills.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{job.skills.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-5 ml-10">
            {job.status !== "DRAFT" && (
              <div className="text-sm text-muted-foreground">
                {job.applicantsCount}{" "}
                {job.applicantsCount === 1
                  ? "applicant"
                  : "applicants"}
              </div>
            )}

            <JobActions jobId={job.id} status={job.status} />

            {job.status !== "DRAFT" && (
              <Link
                href={`/dashboard/recruiter/jobs/${job.id}`}
                className="text-sm font-medium hover:underline"
              >
                View Applications →
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
