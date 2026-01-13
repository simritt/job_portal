import { NextResponse } from "next/server"
import { db } from "@/db"
import { resumes } from "@/db/schema/resumes"
import { jobApplications } from "@/db/schema/applications"
import { getSession } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function POST(
  req: Request,
  context: { params: Promise<{ resumeId: string }> }
) {
  const { resumeId } = await context.params   // ✅ FIX

  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.redirect(
      new URL("/dashboard/applicant/profile", req.url)
    )
  }

  const used = await db
    .select({ id: jobApplications.id })
    .from(jobApplications)
    .where(eq(jobApplications.resumeId, resumeId))
    .limit(1)

  if (used.length > 0) {
    return NextResponse.redirect(
      new URL(
        "/dashboard/applicant/profile/edit/resumes?error=in-use",
        req.url
      )
    )
  }

  await db
    .delete(resumes)
    .where(eq(resumes.id, resumeId))

  return NextResponse.redirect(
    new URL("/dashboard/applicant/profile/edit/resumes", req.url)
  )
}
