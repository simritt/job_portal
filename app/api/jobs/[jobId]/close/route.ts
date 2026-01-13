import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import { jobs } from "@/db/schema/jobs"
import { getSession } from "@/lib/auth"

export async function PATCH(
  req: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getSession()

    if (!session || session.role !== "RECRUITER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const jobId = params.jobId

    const job = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .then((res) => res[0])

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    if (job.recruiterId !== session.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    if (job.status === "CLOSED") {
      return NextResponse.json({ success: true })
    }

    await db
      .update(jobs)
      .set({ status: "CLOSED" })
      .where(
        and(
          eq(jobs.id, jobId),
          eq(jobs.recruiterId, session.id)
        )
      )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Close job error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
