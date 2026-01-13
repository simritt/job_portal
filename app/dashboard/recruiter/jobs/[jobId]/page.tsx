import { cookies } from "next/headers"
import ApplicantsClient from "./ApplicantsClient"

export const dynamic = "force-dynamic"

async function getJob(jobId: string) {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  const res = await fetch(
    `http://localhost:3000/api/jobs/${jobId}`,
    {
      cache: "no-store",
      headers: { Cookie: cookieHeader },
    }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch job")
  }

  return res.json()
}

async function getApplicants(
  jobId: string
): Promise<{ applications: any[] }> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/${jobId}/applications`,
    {
      cache: "no-store",
      headers: { Cookie: cookieHeader },
    }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch applicants")
  }

  return res.json()
}

export default async function JobApplicantsPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const { applications } = await getApplicants(jobId)
  const job = await getJob(jobId)

  return (
    <div className="p-6 space-y-6 pt-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{job.title}</h1>
        <p className="text-sm text-muted-foreground">
          Manage job details and applicants
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
          <h2 className="text-lg font-semibold">No applicants yet</h2>
          <p className="text-sm text-muted-foreground">
            Applications will appear here once candidates apply.
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold">Applicants</h2>
          <ApplicantsClient applications={applications} />
        </>
      )}
    </div>
  )
}
