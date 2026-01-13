import { db } from "@/db"
import { skills } from "@/db/schema/skills"
import { sql } from "drizzle-orm"

export async function getOrCreateSkill(name: string) {
  const normalized = name.trim().toLowerCase()

  const [existing] = await db
    .select()
    .from(skills)
    .where(sql`lower(${skills.name}) = ${normalized}`)
    .limit(1)

  if (existing) return existing

  const [created] = await db
    .insert(skills)
    .values({ name: normalized })
    .returning()

  return created
}
