import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema/users"
import { jobApplications } from "@/db/schema/applications"
import { getSession } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const used = await db
    .select({ id: jobApplications.id })
    .from(jobApplications)
    .where(eq(jobApplications.applicantId, session.userId))
    .limit(1)

  if (used.length > 0) {
    return NextResponse.json(
      { error: "Cannot delete account with applications" },
      { status: 400 }
    )
  }

  await db.delete(users).where(eq(users.id, session.userId))

  return NextResponse.json({ success: true })
}
