import { NextResponse } from "next/server"
import { db } from "@/db"
import { resumes } from "@/db/schema/resumes"
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

  // unset previous default
  await db
    .update(resumes)
    .set({ isDefault: false })
    .where(eq(resumes.applicantId, session.userId))

  // set new default
  await db
    .update(resumes)
    .set({ isDefault: true })
    .where(eq(resumes.id, resumeId))

  return NextResponse.redirect(
    new URL("/dashboard/applicant/profile/edit/resumes", req.url)
  )
}
