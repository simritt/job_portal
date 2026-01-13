import {
  pgTable,
  uuid,
  text,
} from "drizzle-orm/pg-core"
import { users } from "./users"
import { companies } from "./companies"

/**
 * RECRUITER PROFILES
 * One-to-one with users
 */
export const recruiterProfiles = pgTable("recruiter_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "restrict" })
    .notNull(),

  designation: text("designation"),

  about: text("about"),
  hiringFocus: text("hiring_focus"),
})
