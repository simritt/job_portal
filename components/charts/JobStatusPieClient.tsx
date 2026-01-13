"use client"

import JobStatusPie from "./JobStatusPie"

type Job = {
  status: "DRAFT" | "ACTIVE" | "CLOSED"
}

export default function JobStatusPieClient({
  jobs,
}: {
  jobs: Job[]
}) {
  return <JobStatusPie jobs={jobs} />
}
