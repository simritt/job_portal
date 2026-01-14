import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ApplyButton from "@/components/jobs/ApplyButton"
import { StatusBadge } from "@/components/application/StatusBadge"
import WithdrawButton from "./WithdrawButton"
import SaveJobButton from "./SaveJobButton"
import { Search } from "lucide-react"
import { headers } from "next/headers"

type JobSkill = {
  id: string
  name: string
  isMandatory: boolean
}

type Job = {
  id: string
  title: string
  location: string
  companyName: string
  salaryMin: number | null
  salaryMax: number | null
  negotiable: boolean
  hasApplied: boolean
  applicationStatus: "APPLIED" | "SHORTLISTED" | "REJECTED" | "HIRED" | null
  applicationId?: string
  isSaved: boolean
  skills: JobSkill[]
}

async function getJobs(search?: string): Promise<Job[]> {
  const headersList = await headers()
  const host = headersList.get("host")
  const cookie = headersList.get("cookie")
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https"

  const url = new URL(`${protocol}://${host}/api/jobs`)
  if (search) url.searchParams.set("q", search)

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { cookie: cookie ?? "" },
  })

  if (!res.ok) throw new Error("Failed to fetch jobs")
  return res.json()
}

export default async function ApplicantDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const jobs = await getJobs(q)

  return (
    <div className="p-6 pt-0 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Find Jobs</h1>

        <form className="relative">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              name="q"
              placeholder="Search jobs, companies, skills..."
              defaultValue={q ?? ""}
              className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
            />
          </div>

          {q && (
            <a
              href="/dashboard/applicant"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </a>
          )}
        </form>
      </div>

      {jobs.length === 0 ? (
        <p className="text-muted-foreground">No jobs available right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {jobs.map((job) => (
            <Card key={job.id} className="flex h-full flex-col">
              {/* HEADER */}
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">{job.title}</CardTitle>

                <p className="text-sm text-muted-foreground">
                  {job.companyName}
                  {job.location ? ` • ${job.location}` : ""}
                </p>

                {job.skills?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.skills.slice(0, 4).map((skill) => {
                      const isMatch =
                        q &&
                        skill.name
                          .toLowerCase()
                          .includes(q.toLowerCase())

                      return (
                        <span
                          key={skill.id}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            isMatch
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {skill.name}
                        </span>
                      )
                    })}

                    {job.skills.length > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{job.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>

              {/* FOOTER / ACTION ROW */}
              <CardContent className="mt-auto pt-0">
                <div className="flex items-center justify-between">
                  {/* Salary */}
                  <div className="text-sm font-medium">
                    {job.salaryMin && job.salaryMax
                      ? `₹ ${job.salaryMin} – ${job.salaryMax}`
                      : job.negotiable
                      ? "Negotiable"
                      : "Salary not disclosed"}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <SaveJobButton
                      jobId={job.id}
                      initialSaved={job.isSaved}
                    />

                    {job.applicationId ? (
  <div className="flex flex-col items-end gap-2">
    <StatusBadge status={job.applicationStatus ?? "APPLIED"} />
    {job.applicationStatus === "APPLIED" && (
      <WithdrawButton applicationId={job.applicationId} />
    )}
  </div>
) : (
  <ApplyButton jobId={job.id} />
)}

                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
