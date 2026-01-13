import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import { jobs } from "@/db/schema/jobs"
import { resumes } from "@/db/schema/resumes"
import { jobApplications } from "@/db/schema/applications"

import { getSession } from "@/lib/auth" // adjust if your helper name/path differs

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params
    /* ---------------- AUTH ---------------- */
    const session = await getSession()

    if (!session || session.role !== "APPLICANT") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const applicantId = session.userId

    console.log("APPLY jobId from params:", jobId)

    /* ---------------- JOB CHECK ---------------- */
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1)

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    if (job.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Applications are closed for this job" },
        { status: 400 }
      )
    }

    /* ---------------- INPUT ---------------- */
    const body = await req.json()
    const { resumeId, newResume } = body

    let finalResumeId: string

    /* ---------------- RESUME RESOLUTION ---------------- */
    if (resumeId) {
      // Use existing resume
      finalResumeId = resumeId
    } else if (newResume?.title && newResume?.fileUrl) {
      // Create new resume (saved permanently)
      const [createdResume] = await db
        .insert(resumes)
        .values({
          applicantId,
          title: newResume.title,
          fileUrl: newResume.fileUrl,
        })
        .returning()

      finalResumeId = createdResume.id
    } else {
      return NextResponse.json(
        { error: "Resume information is required" },
        { status: 400 }
      )
    }

    /* ---------------- DUPLICATE CHECK (SOFT) ---------------- */
    const existingApplication = await db
        .select()
        .from(jobApplications)
        .where(
            and(
            eq(jobApplications.jobId, jobId),
            eq(jobApplications.applicantId, applicantId)
            )
        )
        .limit(1)

    if (existingApplication.length > 0) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 409 }
      )
    }

    /* ---------------- CREATE APPLICATION ---------------- */
    await db.insert(jobApplications).values({
      jobId,
      applicantId,
      resumeId: finalResumeId,
      status: "APPLIED",
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Apply job error:", error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 }
    )
  }
}
