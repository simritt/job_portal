import { NextResponse } from "next/server"
import { db } from "@/db"
import { savedApplicants } from "@/db/schema/applications"
import { users } from "@/db/schema/users"
import { getSession } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { applicantSkills,skills } from "@/db/schema/skills"



export async function GET() {
  const session = await getSession()
  if (!session || session.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }


const rows = await db
  .select({
    applicantId: users.id,
    name: users.name,
    email: users.email,

    skillName: skills.name,
  })
  .from(savedApplicants)
  .innerJoin(
    users,
    eq(users.id, savedApplicants.applicantId)
  )
  .leftJoin(
    applicantSkills,
    eq(applicantSkills.applicantId, users.id)
  )
  .leftJoin(
    skills,
    eq(skills.id, applicantSkills.skillId)
  )
  .where(eq(savedApplicants.recruiterId, session.userId))

const grouped = new Map<
  string,
  {
    applicantId: string
    name: string
    email: string
    skills: string[]
  }
>()

for (const row of rows) {
  if (!grouped.has(row.applicantId)) {
    grouped.set(row.applicantId, {
      applicantId: row.applicantId,
      name: row.name,
      email: row.email,
      skills: [],
    })
  }

  if (row.skillName) {
    grouped.get(row.applicantId)!.skills.push(row.skillName)
  }
}

return NextResponse.json([...grouped.values()])

}
