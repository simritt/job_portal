import Link from "next/link"
import { getSession } from "@/lib/auth"
import { db } from "@/db"
import { applicantProfiles } from "@/db/schema/applicant_profiles"
import { users } from "@/db/schema/users"
import { eq } from "drizzle-orm"
import ApplicantSkillsView from "@/components/skills/ApplicantSkillsView"
import { applicantSkills } from "@/db/schema/skills"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/* ---------------- RESUME FETCH ---------------- */
import { headers } from "next/headers"

export const dynamic = "force-dynamic"

async function getResumes() {
  const headersList = await headers()
  const host = headersList.get("host")
  const cookie = headersList.get("cookie")
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https"

  if (!host || !cookie) return []

  const res = await fetch(`${protocol}://${host}/api/resumes`, {
    headers: { cookie },
    cache: "no-store",
  })

  if (!res.ok) return []
  return res.json()
}

export default async function ApplicantProfilePage() {
  const session = await getSession()
  if (!session) return null

  /* ---------------- PROFILE (SAFE LEFT JOIN) ---------------- */
  const profile = await db
    .select({
      name: users.name,
      email: users.email,
      phone: users.phone,
      avatarUrl: users.avatarUrl,
      headline: applicantProfiles.headline,
      bio: applicantProfiles.bio,
      location: applicantProfiles.location,
    })
    .from(users)
    .leftJoin(
      applicantProfiles,
      eq(applicantProfiles.userId, users.id)
    )
    .where(eq(users.id, session.userId))
    .limit(1)
    .then((rows) => rows[0])

  /* ---------------- RESUMES ---------------- */
  const resumes = await getResumes()

  /* ---------------- HELPERS ---------------- */
  const getInitials = (name?: string) => {
    if (!name) return "U"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (
      parts[0][0] + parts[parts.length - 1][0]
    ).toUpperCase()
  }

  /* ---------------- COMPLETENESS ---------------- */
  const skillsCount = await db
  .select()
  .from(applicantSkills)
  .where(eq(applicantSkills.applicantId, session.userId))
  .then((rows) => rows.length)


const completenessFields = [
  {
    label: "Profile photo",
    done: Boolean(profile?.avatarUrl),
    href: "/dashboard/applicant/profile/edit",
  },
  {
    label: "Headline",
    done: Boolean(profile?.headline),
    href: "/dashboard/applicant/profile/edit",
  },
  {
    label: "About",
    done: Boolean(profile?.bio),
    href: "/dashboard/applicant/profile/edit",
  },
  {
    label: "Location",
    done: Boolean(profile?.location),
    href: "/dashboard/applicant/profile/edit",
  },
  {
    label: "Phone number",
    done: Boolean(profile?.phone),
    href: "/dashboard/applicant/profile/edit",
  },
  {
    label: "At least one skill",
    done: skillsCount > 0,
    href: "/dashboard/applicant/profile/edit/skills",
  },
  {
    label: "Resume uploaded",
    done: resumes.length > 0,
    href: "/dashboard/applicant/profile/edit/resumes",
  },
]
const completed = completenessFields.filter(f => f.done).length
const total = completenessFields.length
const percent = Math.round((completed / total) * 100)

const missing = completenessFields.filter(f => !f.done)


  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">

      {/* ================= LEFT COLUMN ================= */}
      {/* LEFT COLUMN */}
<div className="space-y-6 sticky top-24 self-start">

  {/* PROFILE CARD */}
  <Card>
    <CardContent className="pt-6 space-y-4 text-center">
      {profile?.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          className="mx-auto h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold">
          {getInitials(profile?.name)}
        </div>
      )}

      <div className="space-y-1">
        <p className="font-medium">{profile?.name}</p>
        <p className="text-sm text-muted-foreground">
          {profile?.email}
        </p>
        {profile?.phone && (
          <p className="text-sm text-muted-foreground">
            {profile.phone}
          </p>
        )}
      </div>

      <Link href="/dashboard/applicant/profile/edit">
        <Button variant="outline" className="w-full">
          Edit Profile
        </Button>
      </Link>
    </CardContent>
  </Card>

  {/* COMPLETENESS */}
  <Card>
    <CardHeader>
      <CardTitle className="text-sm">
        Profile Completeness
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-3">
      <div className="h-2 rounded bg-muted overflow-hidden">
        <div
          className="h-full bg-primary"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {percent}% complete
      </p>

      {missing.length > 0 && (
  <ul className="mt-3 space-y-1">
    {missing.map((item) => (
      <li key={item.label}>
        <Link
          href={item.href}
          className="text-xs text-primary hover:underline"
        >
          Add {item.label.toLowerCase()}
        </Link>
      </li>
    ))}
  </ul>
)}
    </CardContent>
  </Card>
</div>


      {/* ================= RIGHT COLUMN ================= */}
      <div className="space-y-8">

        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {profile?.name}
            </h1>

            <p className="text-sm text-muted-foreground">
              {profile?.headline || "Add a headline"}
              {profile?.location && ` • ${profile.location}`}
            </p>
          </div>

          <Link href="/dashboard/applicant/profile/edit">
            <Button variant="outline">Edit Profile</Button>
          </Link>
        </div>

        {/* ABOUT */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.bio ? (
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add a short bio so recruiters know who you are.
              </p>
            )}
          </CardContent>
        </Card>

        {/* SKILLS */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Skills</CardTitle>
            <Link
              href="/dashboard/applicant/profile/edit/skills"
              className="text-sm font-medium text-primary hover:underline"
            >
              Edit
            </Link>
          </CardHeader>
          <CardContent>
            <ApplicantSkillsView />
          </CardContent>
        </Card>

        {/* RESUMES */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Resumes</CardTitle>
            <Link
              href="/dashboard/applicant/profile/edit/resumes"
              className="text-sm font-medium text-primary hover:underline"
            >
              Manage
            </Link>
          </CardHeader>

          <CardContent className="space-y-3">
            {resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No resumes uploaded yet.
              </p>
            ) : (
              resumes.map((resume: any) => {
                const ext =
                  resume.fileUrl?.split(".").pop()?.toUpperCase() ||
                  "FILE"

                return (
                  <div
                    key={resume.id}
                    className="flex items-center justify-between rounded-md border px-4 py-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {resume.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ext} • Uploaded{" "}
                        {resume.createdAt
                          ? new Date(
                              resume.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>

                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {resume.fileUrl.endsWith(".pdf")
                        ? "View"
                        : "Download"}
                    </a>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
