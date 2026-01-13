import { NextResponse } from "next/server"
import { db } from "@/db"
import { savedApplicants } from "@/db/schema/applications"
import { getSession } from "@/lib/auth"
import { eq, and } from "drizzle-orm"

export async function POST(req: Request) {
  const session = await getSession()

  if (!session || session.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { applicantId } = await req.json()

  await db
    .insert(savedApplicants)
    .values({
      recruiterId: session.userId,
      applicantId,
    })
    .onConflictDoNothing() // ✅ IMPORTANT

  return NextResponse.json({ saved: true })
}

export async function DELETE(req: Request) {
  const session = await getSession()

  if (!session || session.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { applicantId } = await req.json()

  await db
    .delete(savedApplicants)
    .where(
      and(
        eq(savedApplicants.recruiterId, session.userId),
        eq(savedApplicants.applicantId, applicantId)
      )
    )

  return NextResponse.json({ saved: false })
}
