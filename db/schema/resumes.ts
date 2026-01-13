import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core"
import { users } from "./users"

/**
 * RESUMES
 * Multiple per applicant
 */
export const resumes = pgTable("resumes", {
  id: uuid("id").defaultRandom().primaryKey(),

  applicantId: uuid("applicant_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  title: text("title").notNull(),

  fileUrl: text("file_url").notNull(),

  isDefault: boolean("is_default")
    .default(false)
    .notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
})
