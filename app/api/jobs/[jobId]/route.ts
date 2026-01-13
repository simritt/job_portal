import { NextResponse } from "next/server"
import { db } from "@/db"
import { jobs } from "@/db/schema/jobs"
import { getSession } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function GET(
  _req: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await context.params   // ✅ THIS IS THE FIX

  const session = await getSession()

  if (!session || session.role !== "RECRUITER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  
    const [job] = await db
  .select({
    id: jobs.id,
    title: jobs.title,
    location: jobs.location,
    description: jobs.description,
    salaryMin: jobs.salaryMin,
    salaryMax: jobs.salaryMax,
    negotiable: jobs.negotiable,
    experienceRequired: jobs.experienceRequired,
    status: jobs.status,
  })
  .from(jobs)
  .where(eq(jobs.id, jobId))
  .limit(1)

  if (!job) {
    return NextResponse.json(
      { message: "Job not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(job)
}


export async function PATCH(
  req: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await context.params
  const session = await getSession()

  if (!session || session.role !== "RECRUITER") {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    )
  }

  const body = await req.json()

  const {
    title,
    location,
    description,
    salaryMin,
    salaryMax,
    negotiable,
    experienceRequired,
  } = body

  // Ownership check
  const [job] = await db
    .select({ recruiterId: jobs.recruiterId })
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1)

  if (!job || job.recruiterId !== session.userId) {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    )
  }

  await db
    .update(jobs)
    .set({
      title,
      location,
      description,
      salaryMin,
      salaryMax,
      negotiable,
      experienceRequired,
    })
    .where(eq(jobs.id, jobId))

  return NextResponse.json({ success: true })
}
