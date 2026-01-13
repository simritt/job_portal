import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ApplyButton from "@/components/jobs/ApplyButton"
import SaveJobButton from "../SaveJobButton"
import { headers } from "next/headers"
import { Search } from "lucide-react"

type SavedJob = {
  jobId: string
  title: string
  location: string | null
  companyName: string
  salaryMin: number | null
  salaryMax: number | null
  negotiable: boolean
  savedAt: string
  skills?: { id: string; name: string }[] 
}

async function getSavedJobs(search?: string): Promise<SavedJob[]> {
  const headersList = await headers()
  const host = headersList.get("host")
  const cookie = headersList.get("cookie")
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https"

  const url = new URL(`${protocol}://${host}/api/saved-jobs`)
if (search) url.searchParams.set("q", search)

const res = await fetch(url.toString(), {
  cache: "no-store",
  headers: {
    cookie: cookie ?? "",
  },
})


  if (!res.ok) throw new Error("Failed to fetch saved jobs")
  return res.json()
}

export const dynamic = "force-dynamic"

export default async function SavedJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const jobs = await getSavedJobs(q)

  return (
    <div className="p-6 pt-0 space-y-6">
      <div className="flex items-center justify-between gap-4">
  <h1 className="text-2xl font-semibold">Saved Jobs</h1>

  <form className="relative">
    <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <input
      type="text"
      name="q"
      placeholder="Search saved jobs..."
      defaultValue={q ?? ""}
      className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
    />
    </div>

    {q && (
      <a
        href="/dashboard/applicant/saved-jobs"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        ✕
      </a>
    )}
  </form>
</div>

      {jobs.length === 0 ? (
        <p className="text-muted-foreground">
          You haven’t saved any jobs yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Card key={job.jobId}>
              <CardHeader>
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {job.companyName}
                  {job.location ? ` • ${job.location}` : ""}
                </p>
                {Array.isArray(job.skills) && job.skills.length > 0 && (
  <div className="mt-2 flex flex-wrap gap-2">
    {job.skills.slice(0, 4).map((skill) => (
      <span
        key={skill.id}
        className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
      >
        {skill.name}
      </span>
    ))}

    {job.skills.length > 4 && (
      <span className="text-xs text-muted-foreground">
        +{job.skills.length - 4} more
      </span>
    )}
  </div>
)}
              </CardHeader>

              <CardContent className="flex items-center justify-between gap-4">
                <span className="text-sm">
                  {job.salaryMin && job.salaryMax
                    ? `₹ ${job.salaryMin} – ${job.salaryMax}`
                    : job.negotiable
                    ? "Negotiable"
                    : "Salary not disclosed"}
                </span>

                <div className="flex items-center gap-3">
                  <SaveJobButton
                    jobId={job.jobId}
                    initialSaved={true}
                  />
                  <ApplyButton jobId={job.jobId} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
