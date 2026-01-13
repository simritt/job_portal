import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * ENUM for user roles
 * Stored in DB as strict uppercase values
 */
export const userRoleEnum = pgEnum("user_role", [
  "APPLICANT",
  "RECRUITER",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  email: text("email").notNull().unique(),

  password: text("password").notNull(),

  phone: text("phone"), // optional for now

  role: userRoleEnum("role")
    .notNull()
    .default("APPLICANT"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),

  deletedAt: timestamp("deleted_at"), // NULL = active user
});


export const applicants = pgTable("applicants", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  resumeUrl: text("resume_url"),
});



export const recruiters = pgTable("recruiters", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  companyName: text("company_name"),
});
