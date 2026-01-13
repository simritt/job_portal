import { NextResponse } from "next/server"
import { db } from "@/db"
import { applicantSkills, skills } from "@/db/schema/skills"
import { getSession } from "@/lib/auth"
import { getOrCreateSkill } from "@/lib/skills"
import { eq } from "drizzle-orm"

export async function PUT(req: Request) {
  const session = await getSession()

  if (!session || session.role !== "APPLICANT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const skillsInput = body.skills as {
    name: string
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
    yearsExperience?: number
  }[]

  if (!Array.isArray(skillsInput)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  await db.transaction(async (tx) => {
    // delete all existing
    await tx
      .delete(applicantSkills)
      .where(eq(applicantSkills.applicantId, session.userId))

    // insert new
    for (const skill of skillsInput) {
      const dbSkill = await getOrCreateSkill(skill.name)

      await tx.insert(applicantSkills).values({
        applicantId: session.userId,
        skillId: dbSkill.id,
        level: skill.level,
        yearsExperience: skill.yearsExperience ?? null,
      })
    }
  })

  return NextResponse.json({ success: true })
}


export async function GET() {
  const session = await getSession()

  if (!session || session.role !== "APPLICANT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await db
    .select({
      skillId: skills.id,
      name: skills.name,
      level: applicantSkills.level,
      yearsExperience: applicantSkills.yearsExperience,
    })
    .from(applicantSkills)
    .innerJoin(skills, eq(applicantSkills.skillId, skills.id))
    .where(eq(applicantSkills.applicantId, session.userId))

  return NextResponse.json({ skills: rows })
}