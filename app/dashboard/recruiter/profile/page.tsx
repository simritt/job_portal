import Link from "next/link"
import { getSession } from "@/lib/auth"
import { db } from "@/db"
import { recruiterProfiles } from "@/db/schema/recruiter_profiles"
import { companies } from "@/db/schema/companies"
import { users } from "@/db/schema/users"
import { eq } from "drizzle-orm"
import DashboardNav from "@/components/layout/DashboardNav"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function RecruiterProfilePage() {
  const session = await getSession()
  if (!session) return null

  const profile = await db
    .select({
      name: users.name,
      email: users.email,
      phone: users.phone,
      // avatar: users.avatarUrl,
      designation: recruiterProfiles.designation,
      company: companies.name,
      location: companies.location,
      about: recruiterProfiles.about,
      hiringFocus: recruiterProfiles.hiringFocus,
    })
    .from(recruiterProfiles)
    .innerJoin(users, eq(users.id, recruiterProfiles.userId))
    .innerJoin(companies, eq(companies.id, recruiterProfiles.companyId))
    .where(eq(recruiterProfiles.userId, session.userId))
    .limit(1)
    .then((rows) => rows[0])

    const fields = [
  // { label: "Profile photo", value: profile?.avatar },
  { label: "Profile photo", value: false },
  { label: "Phone number", value: profile?.phone },
  { label: "Designation", value: profile?.designation },
  { label: "About section", value: profile?.about },
  { label: "Hiring focus", value: profile?.hiringFocus },
  { label: "Company name", value: profile?.company },
  { label: "Company location", value: profile?.location },
]

const totalFields = fields.length
const completedFields = fields.filter(f => Boolean(f.value)).length

const completionPercent = Math.round(
  (completedFields / totalFields) * 100
)

const missingFields = fields.filter(f => !f.value)

const getInitials = (name?: string | null) => {
  if (!name) return "U"
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 px-10">
      {/* ================= LEFT PROFILE COLUMN ================= */}
<div className="space-y-6 sticky top-24 self-start">
  {/* Profile Card */}
  <Card>
    <CardContent className="text-center space-y-3">
      {/* Avatar placeholder */}
      <div className="mx-auto h-20 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xl font-semibold text-zinc-700 dark:text-zinc-200">
        {getInitials(profile?.name)}
      </div>

      <div>
        <p className="font-medium">
          {profile?.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {profile?.email}
        </p>
        
        {profile?.phone && (
          <p className="text-sm text-muted-foreground">
            📞 {profile.phone}
          </p>
        )}
      </div>

      <Link href="/dashboard/recruiter/profile/edit">
        <Button variant="outline" size="sm" className="w-full">
          Edit Profile
        </Button>
      </Link>
    </CardContent>
  </Card>

  {/* Profile Completeness */}
  <Card>
  <CardHeader >
    <CardTitle className="text-base">
      Profile Completeness
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-3 pt-0 mt-0">
    {/* Progress bar */}
    <div className="h-2 w-full rounded bg-muted overflow-hidden pt-0">
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${completionPercent}%` }}
      />
    </div>

    <p className="text-sm text-muted-foreground">
      {completionPercent}% completed
    </p>

    {missingFields.length > 0 && (
      <div className="pt-2 space-y-1">
        <p className="text-sm font-medium">
          To improve:
        </p>

        <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-0.5">
          {missingFields.map((f) => (
            <li key={f.label}>
              <Link
                href="/dashboard/recruiter/profile/edit"
                className="hover:underline hover:text-primary cursor-pointer"
              >
                {f.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )}
  </CardContent>
</Card>

</div>
      {/* ================= RIGHT PROFILE DETAILS COLUMN ================= */}
    <div className="space-y-8 pl-4">
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {profile?.name}
          </h1>

          <p className="text-sm text-muted-foreground">
            {profile?.designation || "Add designation"}
          </p>

          <p className="text-sm text-muted-foreground">
            {profile?.company && `${profile.company}`}
            {profile?.location && ` • ${profile.location}`}
          </p>
        </div>

        <Link href="/dashboard/recruiter/profile/edit">
          <Button variant="outline">
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* ================= ABOUT ================= */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.about ? (
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {profile.about}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tell applicants about your role and hiring philosophy.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ================= HIRING FOCUS ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Hiring Focus</CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.hiringFocus ? (
            <p className="text-sm">
              {profile.hiringFocus}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Roles, teams, or experience levels you usually hire for.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ================= COMPANY ================= */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Company</CardTitle>
          <Link
            href="/dashboard/recruiter/profile/edit/company"
            className="text-sm font-medium text-primary hover:underline"
          >
            Edit
          </Link>
        </CardHeader>

        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Name:</span>{" "}
            {profile?.company}
          </p>

          <p>
            <span className="text-muted-foreground">Location:</span>{" "}
            {profile?.location || "Not specified"}
          </p>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}
