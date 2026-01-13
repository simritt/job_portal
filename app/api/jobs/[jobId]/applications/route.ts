import { NextRequest, NextResponse } from "next/server"
import { and, eq, not } from "drizzle-orm"

import { db } from "@/db"
import { jobs } from "@/db/schema/jobs"
import { users } from "@/db/schema/users"
import { resumes } from "@/db/schema/resumes"
import { jobApplications, savedApplicants } from "@/db/schema/applications"
import { applicantSkills, skills } from "@/db/schema/skills"

import { getSession } from "@/lib/auth" // adjust path if needed


const ALLOWED_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "REJECTED",
  "HIRED",
] as const

type ApplicationStatus = typeof ALLOWED_STATUSES[number]

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    /* ---------------- AUTH ---------------- */
    const session = await getSession()

    if (!session || session.role !== "RECRUITER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const recruiterId = session.userId
    const { jobId } = await context.params

    /* ---------------- JOB OWNERSHIP CHECK ---------------- */
    const [job] = await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.id, jobId),
          eq(jobs.recruiterId, recruiterId)
        )
      )
      .limit(1)

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or access denied" },
        { status: 403 }
      )
    }

    /* ---------------- OPTIONAL STATUS FILTER ---------------- */
    const statusParam = req.nextUrl.searchParams.get("status")

    const status = ALLOWED_STATUSES.includes(
        statusParam as ApplicationStatus
    )
        ? (statusParam as ApplicationStatus)
        : undefined


    /* ---------------- FETCH APPLICATIONS ---------------- */
    const conditions = [
  eq(jobApplications.jobId, jobId),
  not(eq(jobApplications.status, "WITHDRAWN")),
]

if (status) {
  conditions.push(eq(jobApplications.status, status))
}

/* ---------------- FETCH APPLICATIONS ---------------- */
const results = await db
  .select({
    applicationId: jobApplications.id,
    appliedAt: jobApplications.updatedAt,
    status: jobApplications.status,

    applicantId: users.id,
    applicantName: users.name,
    applicantEmail: users.email,

    skillId: skills.id,
    skillName: skills.name,

    resumeId: resumes.id,
    resumeTitle: resumes.title,
    resumeFileUrl: resumes.fileUrl,

    savedApplicantId: savedApplicants.applicantId,
  })
  .from(jobApplications)
.innerJoin(users, eq(users.id, jobApplications.applicantId))
.innerJoin(resumes, eq(resumes.id, jobApplications.resumeId))
.leftJoin(
  savedApplicants,
  and(
    eq(savedApplicants.applicantId, users.id),
    eq(savedApplicants.recruiterId, recruiterId)
  )
)
.leftJoin(
  applicantSkills,
  eq(applicantSkills.applicantId, users.id)
)
.leftJoin(
  skills,
  eq(skills.id, applicantSkills.skillId)
)
  .where(and(...conditions))
  .orderBy(jobApplications.updatedAt)
    /* ---------------- RESPONSE SHAPING ---------------- */
    const applicationsMap = new Map<string, any>()

for (const row of results) {
  if (!applicationsMap.has(row.applicationId)) {
    applicationsMap.set(row.applicationId, {
      applicationId: row.applicationId,
      appliedAt: row.appliedAt,
      status: row.status,
      applicant: {
        id: row.applicantId,
        name: row.applicantName,
        email: row.applicantEmail,
        skills: [],
      },
      resume: {
        id: row.resumeId,
        title: row.resumeTitle,
        fileUrl: row.resumeFileUrl,
      },
      isSaved: !!row.savedApplicantId,
    })
  }

  if (row.skillId) {
    applicationsMap
      .get(row.applicationId)
      .applicant.skills.push({
        id: row.skillId,
        name: row.skillName,
      })
  }
}

const applications = Array.from(applicationsMap.values())

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Fetch applications error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
