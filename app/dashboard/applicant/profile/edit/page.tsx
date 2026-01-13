import { getSession } from "@/lib/auth"
import { db } from "@/db"
import { applicantProfiles } from "@/db/schema/applicant_profiles"
import { users } from "@/db/schema/users"
import { eq } from "drizzle-orm"
import EditProfileForm from "./profile-form"

export const dynamic = "force-dynamic"

export default async function EditProfilePage() {
  const session = await getSession()
  if (!session) return null

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
  .then(r => r[0])

return (
  <EditProfileForm
    initialData={{
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      avatarUrl: profile?.avatarUrl ?? null,
      headline: profile?.headline ?? "",
      bio: profile?.bio ?? "",
      location: profile?.location ?? "",
    }}
  />
)

}
