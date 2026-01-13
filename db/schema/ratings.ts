import {
  pgTable,
  uuid,
  integer,
  text,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core"
import { users } from "./users"
import { ratedEntityEnum } from "./enums"


/**
 * RATINGS
 * Single table for applicants & companies
 */
export const ratings = pgTable("ratings", {
  id: uuid("id").defaultRandom().primaryKey(),

  ratedEntityType: ratedEntityEnum("rated_entity_type").notNull(),

  ratedEntityId: uuid("rated_entity_id").notNull(),

  ratedByUserId: uuid("rated_by_user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  rating: integer("rating").notNull(),

  review: text("review"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
},
  (table) => ({
    entityIdx: index("rating_entity_idx").on(
      table.ratedEntityType,
      table.ratedEntityId
    ),
  })
)

/**
 * RATING STATS
 * Precomputed averages for fast queries
 */
export const ratingStats = pgTable(
  "rating_stats",
  {
    entityType: ratedEntityEnum("entity_type").notNull(),

    entityId: uuid("entity_id").notNull(),

    avgRating: integer("avg_rating").notNull(),

    ratingCount: integer("rating_count").notNull(),
  },
  (table) => ({
    pk: primaryKey(table.entityType, table.entityId),
  })
)
