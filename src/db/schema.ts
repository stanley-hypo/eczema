import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  date,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

// ── Daily Log (one per day) ──
export const dailyLogs = pgTable(
  "daily_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    logDate: date("log_date").notNull(),
    overallSeverity: integer("overall_severity"), // 1-10
    itchLevel: integer("itch_level"), // 1-10
    sleepQuality: integer("sleep_quality"), // 1-5
    stressLevel: integer("stress_level"), // 1-5
    mood: varchar("mood", { length: 20 }),
    notes: text("notes"),
    // Weather (auto-fetched)
    weatherTemp: integer("weather_temp"),
    weatherHumidity: integer("weather_humidity"),
    weatherDesc: varchar("weather_desc", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_daily_logs_date").on(table.logDate),
  ]
);

// ── Affected Areas ──
export const affectedAreas = pgTable("affected_areas", {
  id: uuid("id").defaultRandom().primaryKey(),
  logId: uuid("log_id")
    .references(() => dailyLogs.id, { onDelete: "cascade" })
    .notNull(),
  bodyZone: varchar("body_zone", { length: 50 }).notNull(), // e.g. face, neck, arms, legs, hands, torso, back
  severity: integer("severity").notNull(), // 1-10
  oozing: boolean("oozing").default(false),
  scaling: boolean("scaling").default(false),
  redness: boolean("redness").default(false),
  swelling: boolean("swelling").default(false),
  photoUrl: text("photo_url"),
  notes: text("notes"),
});

// ── Medications (topical/oral) ──
export const medications = pgTable("medications", {
  id: uuid("id").defaultRandom().primaryKey(),
  logId: uuid("log_id")
    .references(() => dailyLogs.id, { onDelete: "cascade" })
    .notNull(),
  productName: varchar("product_name", { length: 200 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // cream, ointment, oral, lotion, other
  bodyZones: jsonb("body_zones").$type<string[]>().default([]),
  timesApplied: integer("times_applied").default(1),
  amount: varchar("amount", { length: 50 }), // e.g. "thin layer", "pea-sized"
  notes: text("notes"),
});

// ── Food Entries ──
export const foodEntries = pgTable("food_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  logId: uuid("log_id")
    .references(() => dailyLogs.id, { onDelete: "cascade" })
    .notNull(),
  mealType: varchar("meal_type", { length: 20 }).notNull(), // breakfast, lunch, dinner, snack
  items: jsonb("items").$type<string[]>().notNull(),
  suspectTrigger: boolean("suspect_trigger").default(false),
  photoUrl: text("photo_url"),
  notes: text("notes"),
});

// ── Triggers (environmental/lifestyle) ──
export const triggers = pgTable("triggers", {
  id: uuid("id").defaultRandom().primaryKey(),
  logId: uuid("log_id")
    .references(() => dailyLogs.id, { onDelete: "cascade" })
    .notNull(),
  triggerType: varchar("trigger_type", { length: 50 }).notNull(), // sweat, fabric, detergent, pet, dust, pollen, other
  description: text("description"),
  severity: integer("severity"), // 1-5 how much they think it affected
});

// Types
export type DailyLog = typeof dailyLogs.$inferSelect;
export type NewDailyLog = typeof dailyLogs.$inferInsert;
export type AffectedArea = typeof affectedAreas.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type FoodEntry = typeof foodEntries.$inferSelect;
export type Trigger = typeof triggers.$inferSelect;
