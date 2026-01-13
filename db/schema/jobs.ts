import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core"
import { companies } from "./companies"
import { users } from "./users"
import { jobStatusEnum } from "./enums"


/**
 * JOBS
 * Core entity for hiring
 */
export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "restrict" })
    .notNull(),

  recruiterId: uuid("recruiter_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  title: text("title").notNull(),

  description: text("description").notNull(),

  location: text("location"),

  salaryMin: integer("salary_min"),

  salaryMax: integer("salary_max"),

  negotiable: boolean("negotiable")
    .default(false)
    .notNull(),

  experienceRequired: integer("experience_required"),

  employmentType: text("employment_type"),

  status: jobStatusEnum("status")
    .default("DRAFT")
    .notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),

},
  (table) => ({
    statusIdx: index("job_status_idx").on(table.status),
    locationIdx: index("job_location_idx").on(table.location),
    salaryIdx: index("job_salary_idx").on(table.salaryMin, table.salaryMax),
    companyIdx: index("job_company_idx").on(table.companyId),
    titleIdx: index("jobs_title_idx").on(table.title),
  })
)
