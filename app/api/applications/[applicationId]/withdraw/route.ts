import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import { jobApplications } from "@/db/schema/applications"
import { getSession } from "@/lib/auth"

export async function PATCH(
  _req: Request,
  context: { params: Promise<{ applicationId: string }> }
) {
  const session = await getSession()

  if (!session || session.role !== "APPLICANT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { applicationId } = await context.params

  const [app] = await db
    .select()
    .from(jobApplications)
    .where(
      and(
        eq(jobApplications.id, applicationId),
        eq(jobApplications.applicantId, session.userId),
        eq(jobApplications.status, "APPLIED")
      )
    )
    .limit(1)

  if (!app) {
    return NextResponse.json(
      { error: "Cannot withdraw this application" },
      { status: 400 }
    )
  }

  await db
    .update(jobApplications)
    .set({ status: "WITHDRAWN" })
    .where(eq(jobApplications.id, applicationId))

  return NextResponse.json({ success: true })
}
