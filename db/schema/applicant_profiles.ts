import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core"
import { users } from "./users"


/**
 * APPLICANT PROFILES
 * One-to-one with users
 */
export const applicantProfiles = pgTable("applicant_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  bio: text("bio"),

  headline: text("headline"),

  location: text("location"),

  experienceYears: integer("experience_years"),

  expectedSalaryMin: integer("expected_salary_min"),

  expectedSalaryMax: integer("expected_salary_max"),

  openToNegotiation: boolean("open_to_negotiation")
    .default(false)
    .notNull(),
},
  (table) => ({
    locationIdx: index("applicant_location_idx").on(table.location),
  })
)
