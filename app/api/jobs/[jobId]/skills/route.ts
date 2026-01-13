import { NextResponse } from "next/server"
import { db } from "@/db"
import { jobSkills } from "@/db/schema/skills"
import { getSession } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { getOrCreateSkill } from "@/lib/skills"
import { skills } from "@/db/schema/skills"

export async function GET(
  _req: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await context.params

  const session = await getSession()
  if (!session || session.role !== "RECRUITER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const rows = await db
    .select({
      name: skills.name,          // ✅ human-readable
      isMandatory: jobSkills.isMandatory,
      minYears: jobSkills.minYears,
    })
    .from(jobSkills)
    .innerJoin(skills, eq(jobSkills.skillId, skills.id))
    .where(eq(jobSkills.jobId, jobId))

  return NextResponse.json({ skills: rows })
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await context.params   // ✅ CRITICAL

  const session = await getSession()
  if (!session || session.role !== "RECRUITER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { skills } = await req.json()

  await db.transaction(async (tx) => {
    // delete old skills
    await tx
      .delete(jobSkills)
      .where(eq(jobSkills.jobId, jobId))

    // insert new
    for (const skill of skills) {
      const dbSkill = await getOrCreateSkill(skill.name)

      await tx.insert(jobSkills).values({
        jobId,                         // ✅ NOW NEVER NULL
        skillId: dbSkill.id,
        isMandatory: skill.isMandatory,
        minYears: skill.minYears ?? null,
      })
    }
  })

  return NextResponse.json({ success: true })
}
