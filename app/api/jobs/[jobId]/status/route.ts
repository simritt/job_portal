import { NextResponse } from "next/server"
import { db } from "@/db"
import { jobs } from "@/db/schema/jobs"
import { getSession } from "@/lib/auth"
import { eq, and } from "drizzle-orm"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getSession()

    if (!session || session.role !== "RECRUITER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { jobId } = await context.params   
    const { status } = await req.json()

    if (!["ACTIVE", "DRAFT", "CLOSED"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status" },
        { status: 400 }
      )
    }

    const result = await db
      .update(jobs)
      .set({ status })
      .where(
        and(
          eq(jobs.id, jobId),
          eq(jobs.recruiterId, session.userId)
        )
      )
      .returning({ id: jobs.id, status: jobs.status })

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Job not found or not owned by recruiter" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update job status error:", error)
    return NextResponse.json(
      { message: "Failed to update job status" },
      { status: 500 }
    )
  }
}
