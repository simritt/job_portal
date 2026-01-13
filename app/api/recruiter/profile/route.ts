import { NextResponse } from "next/server"
import { db } from "@/db"
import { recruiterProfiles } from "@/db/schema/recruiter_profiles"
import { getSession } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { users } from "@/db/schema/index"

export async function GET() {
  const session = await getSession()

  if (!session || session.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await db
    .select({
      name: users.name,
      email: users.email,
      phone: users.phone,
      avatarUrl: users.avatarUrl,
      designation: recruiterProfiles.designation,
      about: recruiterProfiles.about,
      hiringFocus: recruiterProfiles.hiringFocus,
    })
    .from(recruiterProfiles)
    .innerJoin(users, eq(users.id, recruiterProfiles.userId))
    .where(eq(recruiterProfiles.userId, session.userId))
    .limit(1)

  return NextResponse.json(profile[0])
}


export async function PATCH(req: Request) {
  const session = await getSession()

  if (!session || session.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const {
  name,
  email,
  phone,
  designation,
  about,
  hiringFocus,
} = await req.json()

await db
  .update(users)
  .set({
    name,
    email,
    phone,
  })
  .where(eq(users.id, session.userId))

  await db
    .update(recruiterProfiles)
    .set({
      designation,
      about,
      hiringFocus,
    })
    .where(eq(recruiterProfiles.userId, session.userId)) 

  return NextResponse.json({ success: true })
}
