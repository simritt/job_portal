import { NextResponse } from "next/server"
import { db } from "@/db"
import { companies } from "@/db/schema/companies"
import { recruiterProfiles } from "@/db/schema/recruiter_profiles"
import { getSession } from "@/lib/auth"
import { eq } from "drizzle-orm"

export async function GET() {
  const session = await getSession()

  if (!session || session.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await db
    .select({
      name: companies.name,
      location: companies.location,
    })
    .from(recruiterProfiles)
    .innerJoin(companies, eq(companies.id, recruiterProfiles.companyId))
    .where(eq(recruiterProfiles.userId, session.userId))
    .limit(1)

  return NextResponse.json(result[0])
}

export async function PATCH(req: Request) {
  const session = await getSession()

  if (!session || session.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, location } = await req.json()

  const profile = await db
    .select({ companyId: recruiterProfiles.companyId })
    .from(recruiterProfiles)
    .where(eq(recruiterProfiles.userId, session.userId))
    .limit(1)

  if (!profile[0]) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 })
  }

  await db
    .update(companies)
    .set({ name, location })
    .where(eq(companies.id, profile[0].companyId))

  return NextResponse.json({ success: true })
}
