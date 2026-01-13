import {
  pgTable,
  uuid,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { userRoleEnum } from "./enums"
import { varchar } from "drizzle-orm/pg-core"


export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  email: text("email").notNull().unique(),

  avatarUrl: text("avatar_url"),

  password: text("password").notNull(),

  phone: text("phone"),
  
  role: userRoleEnum("role").notNull(),

  theme: varchar("theme", { length: 10 }).default("system"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),

  deletedAt: timestamp("deleted_at"),

})
