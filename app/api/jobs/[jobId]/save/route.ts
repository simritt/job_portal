import { NextResponse } from "next/server"
import { db } from "@/db"
import { savedJobs } from "@/db/schema/applications"
import { and, eq } from "drizzle-orm"
import { getSession } from "@/lib/auth"

export async function POST(
  req: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.role !== "APPLICANT") {
      return NextResponse.json(
        { message: "Only applicants can save jobs" },
        { status: 403 }
      )
    }

     const { jobId } = await context.params

    //  check if already saved
    const existing = await db
      .select()
      .from(savedJobs)
      .where(
        and(
          eq(savedJobs.applicantId, session.userId),
          eq(savedJobs.jobId, jobId)
        )
      )

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Job already saved" },
        { status: 200 }
      )
    }

    // save job
    await db.insert(savedJobs).values({
      applicantId: session.userId,
      jobId,
    })

    return NextResponse.json(
      { message: "Job saved successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("SAVE_JOB_ERROR:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.role !== "APPLICANT") {
      return NextResponse.json(
        { message: "Only applicants can unsave jobs" },
        { status: 403 }
      )
    }

    const { jobId } = await context.params

    await db
      .delete(savedJobs)
      .where(
        and(
          eq(savedJobs.applicantId, session.userId),
          eq(savedJobs.jobId, jobId)
        )
      )

    return NextResponse.json(
      { message: "Job removed from saved jobs" },
      { status: 200 }
    )
  } catch (error) {
    console.error("UNSAVE_JOB_ERROR:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
