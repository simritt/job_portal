import { NextResponse } from "next/server"
import { eq, desc } from "drizzle-orm"

import { db } from "@/db"
import { jobApplications } from "@/db/schema/applications"
import { jobs } from "@/db/schema/jobs"
import { companies } from "@/db/schema/companies"
import { getSession } from "@/lib/auth"
import { jobSkills, skills } from "@/db/schema/skills"

export async function GET() {
  const session = await getSession()

  if (!session || session.role !== "APPLICANT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows: any[] = await db
  .select({
    applicationId: jobApplications.id,
    status: jobApplications.status,
    appliedAt: jobApplications.appliedAt,

    jobId: jobs.id,
    jobTitle: jobs.title,
    companyName: companies.name,

    skillId: skills.id,
    skillName: skills.name,
  })
  .from(jobApplications)
  .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
  .innerJoin(companies, eq(jobs.companyId, companies.id))
  .leftJoin(jobSkills, eq(jobSkills.jobId, jobs.id))
  .leftJoin(skills, eq(skills.id, jobSkills.skillId))
  .where(eq(jobApplications.applicantId, session.userId))
  .orderBy(desc(jobApplications.appliedAt))

const appMap = new Map<string, any>()

for (const row of rows) {
  if (!appMap.has(row.applicationId)) {
    appMap.set(row.applicationId, {
      applicationId: row.applicationId,
      status: row.status,
      appliedAt: row.appliedAt,
      jobId: row.jobId,
      jobTitle: row.jobTitle,
      companyName: row.companyName,
      skills: [],
    })
  }

  if (row.skillId) {
    appMap.get(row.applicationId).skills.push({
      id: row.skillId,
      name: row.skillName,
    })
  }
}

const applications = Array.from(appMap.values())


  return NextResponse.json(applications)
}
