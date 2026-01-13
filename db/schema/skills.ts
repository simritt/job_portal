import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core"
import { users } from "./users"
import { jobs } from "./jobs"
import { skillLevelEnum } from "./enums"

/**
 * SKILLS
 * Master list of all skills
 */
export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull().unique(),

  category: text("category"),
})

/**
 * APPLICANT_SKILLS
 * Many-to-many: applicants ↔ skills
 */
export const applicantSkills = pgTable(
  "applicant_skills",
  {
    applicantId: uuid("applicant_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    skillId: uuid("skill_id")
      .references(() => skills.id, { onDelete: "cascade" })
      .notNull(),

    level: skillLevelEnum("level").notNull(),

    yearsExperience: integer("years_experience"),
  },
  (table) => ({
    pk: primaryKey(table.applicantId, table.skillId),
  })
)

/**
 * JOB_SKILLS
 * Many-to-many: jobs ↔ required skills
 */
export const jobSkills = pgTable(
  "job_skills",
  {
    jobId: uuid("job_id")
      .references(() => jobs.id, { onDelete: "cascade" })
      .notNull(),

    skillId: uuid("skill_id")
      .references(() => skills.id, { onDelete: "cascade" })
      .notNull(),

    isMandatory: boolean("is_mandatory")
      .default(true)
      .notNull(),

    minYears: integer("min_years"),
  },
  (table) => ({
    pk: primaryKey(table.jobId, table.skillId),
  })
)
