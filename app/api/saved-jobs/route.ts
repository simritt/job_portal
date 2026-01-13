import { NextResponse } from "next/server"
import { db } from "@/db"
import { savedJobs } from "@/db/schema/applications"
import { jobs } from "@/db/schema/jobs"
import { companies } from "@/db/schema/companies"
import { eq, desc } from "drizzle-orm"
import { getSession } from "@/lib/auth"
import { jobSkills, skills } from "@/db/schema/skills"
import { ilike, and, or } from "drizzle-orm"

export async function GET(req: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.role !== "APPLICANT") {
      return NextResponse.json(
        { message: "Only applicants can view saved jobs" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
const q = searchParams.get("q")

    const rows: any[] = await db
  .select({
    jobId: jobs.id,
    title: jobs.title,
    location: jobs.location,
    salaryMin: jobs.salaryMin,
    salaryMax: jobs.salaryMax,
    negotiable: jobs.negotiable,
    companyName: companies.name,
    savedAt: savedJobs.savedAt,

    skillId: skills.id,
    skillName: skills.name,
  })
  .from(savedJobs)
  .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
  .innerJoin(companies, eq(jobs.companyId, companies.id))
  .leftJoin(jobSkills, eq(jobSkills.jobId, jobs.id))
  .leftJoin(skills, eq(skills.id, jobSkills.skillId))
  .where(
    q
      ? and(
          eq(savedJobs.applicantId, session.userId),
          or(
            ilike(jobs.title, `%${q}%`),
            ilike(companies.name, `%${q}%`),
            ilike(skills.name, `%${q}%`)
          )
        )
      : eq(savedJobs.applicantId, session.userId)
  )
  .orderBy(desc(savedJobs.savedAt))

const jobMap = new Map<string, any>()

for (const row of rows) {
  if (!jobMap.has(row.jobId)) {
    jobMap.set(row.jobId, {
      jobId: row.jobId,
      title: row.title,
      location: row.location,
      salaryMin: row.salaryMin,
      salaryMax: row.salaryMax,
      negotiable: row.negotiable,
      companyName: row.companyName,
      savedAt: row.savedAt,
      skills: [],
    })
  }

  if (row.skillId) {
    jobMap.get(row.jobId).skills.push({
      id: row.skillId,
      name: row.skillName,
    })
  }
}

const results = Array.from(jobMap.values())

return NextResponse.json(results, { status: 200 })

  } catch (error) {
    console.error("GET_SAVED_JOBS_ERROR:", error)
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
}
