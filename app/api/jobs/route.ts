import { NextResponse } from "next/server"
import { db } from "@/db"
import { jobs } from "@/db/schema/jobs"
import { users } from "@/db/schema/users"
import { jobApplications, savedJobs } from "@/db/schema/applications"
import { recruiterProfiles } from "@/db/schema/recruiter_profiles"
import { getSession } from "@/lib/auth"
import { eq, and, sql, ilike, or, type SQL } from "drizzle-orm"
import { companies } from "@/db/schema/companies"
import { jobSkills, skills } from "@/db/schema/index"


export async function GET(req: Request) {
  try {
    const session = await getSession()
    const applicantId = session?.userId ?? null
    const isRecruiter = session?.role === "RECRUITER"

    const { searchParams } = new URL(req.url)
const q = searchParams.get("q")


const rows: any[] = isRecruiter
  ? await db
      .select({
        id: jobs.id,
        title: jobs.title,
        location: jobs.location,
        companyName: companies.name,
        applicationApplicantId: jobApplications.applicantId,
        applicationStatus: jobApplications.status,
        applicationId: jobApplications.id,
      })
      .from(jobs)
      .innerJoin(users, eq(jobs.recruiterId, users.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(jobApplications, eq(jobApplications.jobId, jobs.id))

  : await db
      .select({
        id: jobs.id,
        title: jobs.title,
        location: jobs.location,
        companyName: companies.name,

        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        negotiable: jobs.negotiable,

        applicationApplicantId: jobApplications.applicantId,
        applicationStatus: jobApplications.status,
        applicationId: jobApplications.id,

        isSaved: sql<boolean>`
          CASE 
            WHEN ${savedJobs.jobId} IS NOT NULL THEN true 
            ELSE false 
          END
        `,

        skillId: skills.id,
        skillName: skills.name,
        skillMandatory: jobSkills.isMandatory,
      })
      .from(jobs)
      .innerJoin(users, eq(jobs.recruiterId, users.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(
  jobApplications,
  and(
    eq(jobApplications.jobId, jobs.id),
    eq(jobApplications.applicantId, applicantId!)
  )
)
      .leftJoin(
        savedJobs,
        and(
          eq(savedJobs.jobId, jobs.id),
          eq(savedJobs.applicantId, applicantId!)
        )
      )
      .leftJoin(jobSkills, eq(jobSkills.jobId, jobs.id))
      .leftJoin(skills, eq(skills.id, jobSkills.skillId))
      .where(
        q
          ? and(
              eq(jobs.status, "ACTIVE"),
              or(
                ilike(jobs.title, `%${q}%`),
                ilike(companies.name, `%${q}%`),
                ilike(skills.name, `%${q}%`)
              )
            )
          : eq(jobs.status, "ACTIVE")
      )


    const jobMap = new Map<string, any>()

for (const row of rows) {
  if (!jobMap.has(row.id)) {
    const isCurrentUserApplication =
      applicantId &&
      row.applicationApplicantId === applicantId

    jobMap.set(row.id, {
      id: row.id,
      title: row.title,
      location: row.location,
      companyName: row.companyName,
      salaryMin: row.salaryMin,
      salaryMax: row.salaryMax,
      negotiable: row.negotiable,
      hasApplied: Boolean(isCurrentUserApplication),
      applicationStatus: isCurrentUserApplication
        ? row.applicationStatus
        : null,
      applicationId: isCurrentUserApplication
        ? row.applicationId
        : null,
      isSaved: row.isSaved ?? false,
      skills: [], 
    })
  }

  if (row.skillId) {
    jobMap.get(row.id).skills.push({
      id: row.skillId,
      name: row.skillName,
      isMandatory: row.skillMandatory,
    })
  }
}

const result = Array.from(jobMap.values())


    return NextResponse.json(result)
  } catch (error) {
    console.error("Fetch jobs error:", error)
    return NextResponse.json(
      { message: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()

    if (!session || session.role !== "RECRUITER") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      title,
      location,
      description,
      salaryMin,
      salaryMax,
      negotiable,
      experienceRequired,
    } = body

    // Backend safety validations
    if (
      salaryMin !== null &&
      salaryMin < 0
    ) {
      return NextResponse.json(
        { message: "Salary min cannot be negative" },
        { status: 400 }
      )
    }

    if (
      salaryMax !== null &&
      salaryMax < 0
    ) {
      return NextResponse.json(
        { message: "Salary max cannot be negative" },
        { status: 400 }
      )
    }

    if (
      salaryMin !== null &&
      salaryMax !== null &&
      salaryMax < salaryMin
    ) {
      return NextResponse.json(
        { message: "Salary max must be greater than or equal to salary min" },
        { status: 400 }
      )
    }

    if (
      experienceRequired !== null &&
      experienceRequired < 0
    ) {
      return NextResponse.json(
        { message: "Experience cannot be negative" },
        { status: 400 }
      )
    }


    if (!title || !location || !description) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    const recruiterProfile = await db
      .select({ companyId: recruiterProfiles.companyId })
      .from(recruiterProfiles)
      .where(eq(recruiterProfiles.userId, session.userId))
      .then((res) => res[0])

    if (!recruiterProfile?.companyId) {
      return NextResponse.json(
        { message: "Recruiter company not found" },
        { status: 400 }
      )
    }

    const [job] = await db
      .insert(jobs)
      .values({
        title,
        location,
        description,
        recruiterId: session.userId,
        companyId: recruiterProfile.companyId,
        salaryMin,
        salaryMax,
        negotiable,
        experienceRequired,
      })
      .returning()

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error("Create job error:", error)
    return NextResponse.json(
      { message: "Failed to create job" },
      { status: 500 }
    )
  }
}
