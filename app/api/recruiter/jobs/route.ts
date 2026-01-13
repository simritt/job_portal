import { NextResponse } from "next/server"
import { db } from "@/db"
import { jobs } from "@/db/schema/jobs"
import { jobApplications } from "@/db/schema/applications"
import { jobSkills, skills } from "@/db/schema/skills"
import { getSession } from "@/lib/auth"
import { eq, sql } from "drizzle-orm"

export async function GET() {
  const session = await getSession()

  if (!session || session.role !== "RECRUITER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const rows = await db
    .select({
      jobId: jobs.id,
      title: jobs.title,
      location: jobs.location,
      status: jobs.status,
      createdAt: jobs.createdAt,
      applicantsCount: sql<number>`count(${jobApplications.id})`,
      skillId: skills.id,
      skillName: skills.name,
      isMandatory: jobSkills.isMandatory,
    })
    .from(jobs)
    .leftJoin(jobApplications, eq(jobApplications.jobId, jobs.id))
    .leftJoin(jobSkills, eq(jobSkills.jobId, jobs.id))
    .leftJoin(skills, eq(skills.id, jobSkills.skillId))
    .where(eq(jobs.recruiterId, session.userId))
    .groupBy(jobs.id, skills.id, jobSkills.isMandatory)
    .orderBy(jobs.createdAt)

  const jobMap = new Map<string, any>()

  for (const row of rows) {
    if (!jobMap.has(row.jobId)) {
      jobMap.set(row.jobId, {
        id: row.jobId,
        title: row.title,
        location: row.location,
        status: row.status,
        createdAt: row.createdAt,
        applicantsCount: Number(row.applicantsCount ?? 0),
        skills: [],
      })
    }

    if (row.skillId) {
      jobMap.get(row.jobId).skills.push({
        id: row.skillId,
        name: row.skillName,
        isMandatory: row.isMandatory,
      })
    }
  }

  return NextResponse.json({
    jobs: Array.from(jobMap.values()),
  })
}
