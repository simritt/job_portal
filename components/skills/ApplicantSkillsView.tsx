import { db } from "@/db"
import { applicantSkills, skills } from "@/db/schema/skills"
import { getSession } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { Badge } from "@/components/ui/badge"

type Props = {
  userId?: string
  readOnly?: boolean
}

export default async function ApplicantSkillsView({
  userId,
}: Props) {
  const session = await getSession()
  const targetUserId = userId ?? session?.userId

  if (!targetUserId) return null

  const rows = await db
    .select({
      skillName: skills.name,
      level: applicantSkills.level,
      years: applicantSkills.yearsExperience,
    })
    .from(applicantSkills)
    .innerJoin(skills, eq(applicantSkills.skillId, skills.id))
    .where(eq(applicantSkills.applicantId, targetUserId))

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No skills added yet.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {rows.map((skill) => (
        <Badge key={skill.skillName} variant="secondary">
          {skill.skillName}
          {skill.level && ` • ${skill.level}`}
          {skill.years ? ` • ${skill.years}y` : ""}
        </Badge>
      ))}
    </div>
  )
}
