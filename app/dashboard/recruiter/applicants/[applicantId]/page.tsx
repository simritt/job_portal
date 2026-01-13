import { db } from "@/db"
import { users } from "@/db/schema/users"
import { applicantProfiles } from "@/db/schema/applicant_profiles"
import { jobApplications, savedApplicants } from "@/db/schema/applications"
import { jobs } from "@/db/schema/jobs"
import { resumes } from "@/db/schema/resumes"
import { getSession } from "@/lib/auth"
import { eq, and } from "drizzle-orm"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import ApplicantSkillsView from "@/components/skills/ApplicantSkillsView"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function RecruiterApplicantProfilePage({
  params,
}: {
  params: Promise<{ applicantId: string }>
}) {
  const session = await getSession()
  if (!session || session.role !== "RECRUITER") return null

  const { applicantId } = await params

  /* ---------------- ACCESS CHECK ---------------- */

  // 1️⃣ Check if applicant is saved
  const saved = await db
    .select({ id: savedApplicants.applicantId })
    .from(savedApplicants)
    .where(
      and(
        eq(savedApplicants.applicantId, applicantId),
        eq(savedApplicants.recruiterId, session.userId)
      )
    )
    .limit(1)

  // 2️⃣ Check if applicant applied to recruiter job
  const applied = await db
    .select({ id: jobApplications.id })
    .from(jobApplications)
    .innerJoin(
      jobs,
      eq(jobs.id, jobApplications.jobId)
    )
    .where(
      and(
        eq(jobApplications.applicantId, applicantId),
        eq(jobs.recruiterId, session.userId)
      )
    )
    .limit(1)

  if (saved.length === 0 && applied.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        You don’t have access to this applicant.
      </p>
    )
  }

  /* ---------------- PROFILE ---------------- */

  const profile = await db
    .select({
      name: users.name,
      email: users.email,
      headline: applicantProfiles.headline,
      bio: applicantProfiles.bio,
      location: applicantProfiles.location,
    })
    .from(users)
    .leftJoin(
      applicantProfiles,
      eq(applicantProfiles.userId, users.id)
    )
    .where(eq(users.id, applicantId))
    .limit(1)
    .then((r) => r[0])

  /* ---------------- RESUMES ---------------- */

  const applicantResumes = await db
    .select()
    .from(resumes)
    .where(eq(resumes.applicantId, applicantId))

  return (
    
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between ">
  <div>
    <h1 className="text-2xl font-semibold">
      {profile?.name}
    </h1>
    <p className="text-sm text-muted-foreground">
      {profile?.headline || "Applicant profile"}
      {profile?.location && ` • ${profile.location}`}
    </p>
  </div>

  <Link href="/dashboard/recruiter/saved-applicants">
    <Button variant="outline" className="mt-2">
      Back
    </Button>
  </Link>
</div>


      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.bio ? (
            <p className="text-sm whitespace-pre-line">
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No bio provided.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <ApplicantSkillsView userId={applicantId} />
        </CardContent>
      </Card>

      {/* Resumes */}
      <Card>
        <CardHeader>
          <CardTitle>Resumes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {applicantResumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No resumes uploaded.
            </p>
          ) : (
            applicantResumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {resume.title}
                  </p>
                </div>

                <a
                  href={resume.fileUrl}
                  target="_blank"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View
                </a>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
