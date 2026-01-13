import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core"


/**
 * COMPANIES
 * Central business entity
 */
export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  description: text("description"),

  industry: text("industry"),

  location: text("location"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
},
  (table) => ({
    nameIdx: index("company_name_idx").on(table.name),
  })
)
