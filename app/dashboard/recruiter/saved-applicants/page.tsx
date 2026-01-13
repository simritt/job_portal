import Link from "next/link"
import { headers } from "next/headers"
import SavedApplicantsClient from "./SavedApplicantsClient"

export const dynamic = "force-dynamic"

type SavedApplicant = {
  applicantId: string
  name: string
  email: string
  skills: string[]
}


async function getSavedApplicants(): Promise<SavedApplicant[]> {
  const headersList = await headers()

  const host = headersList.get("host")
  const cookie = headersList.get("cookie") //  THIS WAS MISSING
  const protocol =
    process.env.NODE_ENV === "development" ? "http" : "https"

  if (!host || !cookie) return []

  const res = await fetch(
    `${protocol}://${host}/api/recruiter/saved-applicants/list`,
    {
      cache: "no-store",
      headers: {
        cookie, // 🔥 PASS COOKIES TO API
      },
    }
  )

  if (!res.ok) return []
  return res.json()
}

export default async function SavedApplicantsPage() {
  const applicants = await getSavedApplicants()

  return (
    <div className="space-y-6">
  
      {applicants.length === 0 ? (
  <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-center">
    <p className="text-sm font-medium">
      No saved applicants yet
    </p>
    <p className="text-sm text-muted-foreground">
      Bookmark applicants from job listings to see them here.
    </p>

    <Link
      href="/dashboard/recruiter/jobs"
      className="text-sm font-medium text-primary hover:underline"
    >
      Browse jobs →
    </Link>
  </div>
) : (
  <SavedApplicantsClient applicants={applicants} />
)}

    </div>
  )
}
