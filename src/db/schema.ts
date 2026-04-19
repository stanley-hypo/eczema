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

// ── Users ──
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"), // "admin" | "user"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

// ── Sessions ──
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Daily Log (one per day per user) ──
export const dailyLogs = pgTable(
  "daily_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    logDate: date("log_date").notNull(),
    overallSeverity: integer("overall_severity"),
    itchLevel: integer("itch_level"),
    sleepQuality: integer("sleep_quality"),
    stressLevel: integer("stress_level"),
    mood: varchar("mood", { length: 20 }),
    notes: text("notes"),
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

// ── Affected Areas (with sub-locations + expanded symptoms) ──
export const affectedAreas = pgTable("affected_areas", {
  id: uuid("id").defaultRandom().primaryKey(),
  logId: uuid("log_id")
    .references(() => dailyLogs.id, { onDelete: "cascade" })
    .notNull(),
  bodyZone: varchar("body_zone", { length: 50 }).notNull(),
  subLocations: jsonb("sub_locations").$type<string[]>().default([]),
  severity: integer("severity").notNull(),
  // Expanded symptoms stored as JSON array of symptom IDs
  symptoms: jsonb("symptoms").$type<string[]>().default([]),
  // Keep legacy boolean fields for backward compat
  oozing: boolean("oozing").default(false),
  scaling: boolean("scaling").default(false),
  redness: boolean("redness").default(false),
  swelling: boolean("swelling").default(false),
  photoUrl: text("photo_url"),
  notes: text("notes"),
});

// ── Medications ──
export const medications = pgTable("medications", {
  id: uuid("id").defaultRandom().primaryKey(),
  logId: uuid("log_id")
    .references(() => dailyLogs.id, { onDelete: "cascade" })
    .notNull(),
  productName: varchar("product_name", { length: 200 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  bodyZones: jsonb("body_zones").$type<string[]>().default([]),
  timesApplied: integer("times_applied").default(1),
  amount: varchar("amount", { length: 50 }),
  notes: text("notes"),
});

// ── Food Entries ──
export const foodEntries = pgTable("food_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  logId: uuid("log_id")
    .references(() => dailyLogs.id, { onDelete: "cascade" })
    .notNull(),
  mealType: varchar("meal_type", { length: 20 }).notNull(),
  items: jsonb("items").$type<string[]>().notNull(),
  suspectTrigger: boolean("suspect_trigger").default(false),
  photoUrl: text("photo_url"),
  notes: text("notes"),
});

// ── Triggers ──
export const triggers = pgTable("triggers", {
  id: uuid("id").defaultRandom().primaryKey(),
  logId: uuid("log_id")
    .references(() => dailyLogs.id, { onDelete: "cascade" })
    .notNull(),
  triggerType: varchar("trigger_type", { length: 50 }).notNull(),
  description: text("description"),
  severity: integer("severity"),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type NewDailyLog = typeof dailyLogs.$inferInsert;
export type AffectedArea = typeof affectedAreas.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type FoodEntry = typeof foodEntries.$inferSelect;
export type Trigger = typeof triggers.$inferSelect;
