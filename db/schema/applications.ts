import {
  pgTable,
  uuid,
  timestamp,
  primaryKey,
  index, 
  unique,
} from "drizzle-orm/pg-core"
import { users } from "./users"
import { jobs } from "./jobs"
import { applicationStatusEnum } from "./enums"
import { resumes } from "./resumes"


/**
 * JOB APPLICATIONS
 */
export const jobApplications = pgTable(
  "job_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    jobId: uuid("job_id")
      .references(() => jobs.id, { onDelete: "cascade" })
      .notNull(),

    applicantId: uuid("applicant_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    resumeId: uuid("resume_id")
        .references(() => resumes.id, { onDelete: "restrict" })
        .notNull(),

    status: applicationStatusEnum("status")
      .default("APPLIED")
      .notNull(),

    appliedAt: timestamp("applied_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueApplication: unique().on(table.jobId, table.applicantId),
    statusIdx: index("application_status_idx").on(table.status),
  })
)

/**
 * SAVED JOBS (Applicant → Job)
 */
export const savedJobs = pgTable(
  "saved_jobs",
  {
    applicantId: uuid("applicant_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    jobId: uuid("job_id")
      .references(() => jobs.id, { onDelete: "cascade" })
      .notNull(),

    savedAt: timestamp("saved_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey(table.applicantId, table.jobId),
  })
)

/**
 * SAVED APPLICANTS (Recruiter → Applicant)
 */
export const savedApplicants = pgTable(
  "saved_applicants",
  {
    recruiterId: uuid("recruiter_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    applicantId: uuid("applicant_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    savedAt: timestamp("saved_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey(table.recruiterId, table.applicantId),
  })
)
