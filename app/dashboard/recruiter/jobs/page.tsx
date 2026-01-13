import { Plus } from "lucide-react"
import { cookies } from "next/headers"
import Link from "next/link"
import JobActions from "./JobActions" 
import JobsList from "./jobs-list"

export const dynamic = "force-dynamic"

async function getRecruiterJobs() {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/recruiter/jobs`,
    {
      cache: "no-store",
      headers: {
        Cookie: cookieHeader,
      },
    }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch jobs")
  }

  return res.json()
}

export default async function RecruiterJobsPage() {
  const jobs = (await getRecruiterJobs()).jobs ?? []

  return (
    <div className="p-6 space-y-6 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold pt-0">My Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your job postings and track applications
          </p>
        </div>

        {jobs.length !== 0 && (
          <Link
            href="/dashboard/recruiter/jobs/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </Link>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">No jobs posted yet</h2>
<p className="text-sm text-muted-foreground max-w-md">
              Create your first job posting to start receiving applications from qualified candidates.
            </p>
          </div>
          <Link
            href="/dashboard/recruiter/jobs/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm underline"
          >
            <Plus className="w-4 h-4" />
            Post Your First Job →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <JobsList jobs={jobs} />
        </div>
      )}
    </div>
  )
}