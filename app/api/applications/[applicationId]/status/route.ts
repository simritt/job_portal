import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import { jobApplications } from "@/db/schema/applications"
import { jobs } from "@/db/schema/jobs"

import { getSession } from "@/lib/auth"

const ALLOWED_STATUSES = [
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
] as const

type ApplicationStatus = typeof ALLOWED_STATUSES[number]

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ applicationId: string }> }
) {
  try {
    /* ---------------- AUTH ---------------- */
    const session = await getSession()

    if (!session || session.role !== "RECRUITER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const recruiterId = session.userId
    const { applicationId } = await context.params

    /* ---------------- INPUT ---------------- */
    const body = await req.json()
    const status = body.status as ApplicationStatus

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    /* ---------------- FETCH APPLICATION ---------------- */
    const [application] = await db
      .select({
        id: jobApplications.id,
        jobId: jobApplications.jobId,
      })
      .from(jobApplications)
      .where(eq(jobApplications.id, applicationId))
      .limit(1)

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    /* ---------------- JOB OWNERSHIP CHECK ---------------- */
    const [job] = await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.id, application.jobId),
          eq(jobs.recruiterId, recruiterId)
        )
      )
      .limit(1)

    if (!job) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    /* ---------------- UPDATE STATUS ---------------- */
    await db
      .update(jobApplications)
      .set({ status })
      .where(eq(jobApplications.id, applicationId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update application status error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
