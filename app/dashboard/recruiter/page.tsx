import { cookies } from "next/headers"
import Link from "next/link"
import JobStatusPieClient from "@/components/charts/JobStatusPieClient"
import { Briefcase, Users, FileText, TrendingUp, Clock, Plus } from "lucide-react"

export const dynamic = "force-dynamic"

type RecruiterJob = {
  id: string
  title: string
  location: string
  status: "DRAFT" | "ACTIVE" | "CLOSED"
  createdAt: string
  applicantsCount: number
}

async function getRecruiterJobs(): Promise<{ jobs: RecruiterJob[] }> {
  const cookieStore = await cookies()

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  const res = await fetch("http://localhost:3000/api/recruiter/jobs", {
    cache: "no-store",
    headers: {
      Cookie: cookieHeader,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch recruiter jobs")
  }

  return res.json()
}

export default async function RecruiterDashboardPage() {
  const { jobs } = await getRecruiterJobs()

  const activeJobs = jobs.filter((j) => j.status === "ACTIVE")
  const draftJobs = jobs.filter((j) => j.status === "DRAFT")
  const closedJobs = jobs.filter((j) => j.status === "CLOSED")

  const totalApplicants = jobs.reduce(
    (sum, j) => sum + (Number(j.applicantsCount) ?? 0), 0
  )

  const responseRate =
  activeJobs.length > 0
    ? Math.min(
        100,
        Math.round((totalApplicants / (activeJobs.length * 10)) * 100)
      )
    : null
  

  return (
    <div className="p-6 space-y-8 pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold pt-0">
          Recruiter Dashboard
        </h1>

        <Link
          href="/dashboard/recruiter/jobs/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </Link>
      </div>

      {/* Stats — UNTOUCHED */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Jobs"
          value={jobs.length}
          trend="+12% from last month"
        />

        <StatCard
          label="Active Jobs"
          value={activeJobs.length}
          trend={`${draftJobs.length} drafts pending`}
        />

        <StatCard
          label="Total Applicants"
          value={totalApplicants}
          trend={
            activeJobs.length > 0
              ? `Avg ${Math.round(
                  totalApplicants / activeJobs.length
                )} per job`
              : "No active jobs"
          }
        />

        <StatCard
          label="Closed Jobs"
          value={closedJobs.length}
          trend={`${jobs.length - closedJobs.length} still open`}
        />
      </div>

      {/* Charts + Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Overview — 2 columns */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:scale-102 group">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Job Status Overview
            </h2>
            <p className="text-sm text-muted-foreground">
              Distribution of your job postings
            </p>

            <JobStatusPieClient jobs={jobs} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Performance — white background */}
          <div className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:scale-102 group">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">
                  Performance
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Response Rate
                  </p>
                  <p className="text-2xl font-bold text-muted-foreground">
                    {responseRate ? `${responseRate}%` : "N/A"}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-slate-600 mb-1">
                    Avg. Time to Fill
                  </p>
                  <p className="text-2xl font-bold text-muted-foreground">
                    14 days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity — simplified */}
          <div className="rounded-xl border border-border bg-card shadow-sm p-6 hover:shadow-md transition-all duration-200 hover:scale-102 group">
            <h2 className="text-lg font-medium mb-2 pt-0">
              Recent activity
            </h2>

            {jobs.length === 0 ? (
              <div>
                <p className="text-sm text-muted-foreground">
                  No jobs posted yet.
                </p>
                <Link
                  href="/dashboard/recruiter/jobs/new"
                  className="text-sm text-primary underline"
                >
                  Post your first job →
                </Link>
              </div>
            ) : (
              <ul className="space-y-3 text-sm text-muted-foreground pl-5">
                {jobs.slice(0, 3).map((job) => (
                  <li
                    key={job.id}
                    className="flex items-center gap-2 m-0"
                  >
                    <span 
                      className={`h-2 w-2 rounded-full ${
                        job.status === "ACTIVE"
                          ? "bg-green-500"
                          : job.status === "DRAFT"
                          ? "bg-gray-400"
                          : "bg-red-500"
                      }`}
                    />
                    <span>
                      <Link
                        href={`/dashboard/recruiter/jobs/${job.id}`}
                        className="flex items-center gap-2 hover:bg-muted/50 p-2 rounded-md"
                      >
                        <span className="font-medium text-foreground">
                          {job.title}
                        </span>{" "}
                        <span className="capitalize text-muted-foreground">
                          {job.status.toLowerCase()}
                        </span>
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* StatCard — COMPLETELY UNCHANGED */
function StatCard({
  label,
  value,
  trend,
}: {
  label: string
  value: number
  trend?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-muted-foreground mb-2">
            {value}
          </p>
          {trend && (
            <p className="text-xs text-muted-foreground">
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
