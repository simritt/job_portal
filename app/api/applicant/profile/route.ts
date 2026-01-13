import { NextResponse } from "next/server"
import { db } from "@/db"
import { applicantProfiles } from "@/db/schema/applicant_profiles"
import { users } from "@/db/schema/users"
import { getSession } from "@/lib/auth"
import { eq } from "drizzle-orm"

/* ---------------- GET PROFILE ---------------- */
export async function GET() {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await db
    .select({
      name: users.name,
      email: users.email,
      phone: users.phone,
      avatarUrl: users.avatarUrl,
      headline: applicantProfiles.headline,
      bio: applicantProfiles.bio,
      location: applicantProfiles.location,
    })
    .from(applicantProfiles)
    .innerJoin(users, eq(users.id, applicantProfiles.userId))
    .where(eq(applicantProfiles.userId, session.userId))
    .limit(1)

  return NextResponse.json(profile[0])
}

/* ---------------- UPDATE PROFILE ---------------- */
export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const {
    name,
    email,
    phone,
    headline,
    bio,
    location,
  } = await req.json()

  // update users
  await db
    .update(users)
    .set({ name, email, phone })
    .where(eq(users.id, session.userId))

  // upsert applicant profile
  await db
    .insert(applicantProfiles)
    .values({
      userId: session.userId,
      headline,
      bio,
      location,
    })
    .onConflictDoUpdate({
      target: applicantProfiles.userId,
      set: { headline, bio, location },
    })

  return NextResponse.json({ success: true })
}
