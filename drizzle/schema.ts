import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Retirement scenarios table - stores user's retirement planning scenarios
 */
export const retirementScenarios = mysqlTable("retirementScenarios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  
  // Personal Info
  currentAge: int("currentAge").notNull(),
  retirementAge: int("retirementAge").notNull(),
  lifeExpectancy: int("lifeExpectancy").notNull(),
  
  // Financial Data
  currentSavings: int("currentSavings").notNull(), // in dollars
  monthlyExpenses: int("monthlyExpenses").notNull(), // in dollars
  socialSecurityAge: int("socialSecurityAge").notNull(),
  estimatedSocialSecurity: int("estimatedSocialSecurity").notNull(), // monthly amount
  
  // Spouse Data (optional)
  hasSpouse: int("hasSpouse").default(0).notNull(), // 0 = no, 1 = yes
  spouseAge: int("spouseAge"),
  spouseRetirementAge: int("spouseRetirementAge"),
  spouseSocialSecurityAge: int("spouseSocialSecurityAge"),
  spouseSocialSecurity: int("spouseSocialSecurity"),
  
  // Results (calculated)
  readinessScore: int("readinessScore"), // 0-100
  projectedShortfall: int("projectedShortfall"), // in dollars
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RetirementScenario = typeof retirementScenarios.$inferSelect;
export type InsertRetirementScenario = typeof retirementScenarios.$inferInsert;

/**
 * Roth conversion analyses table
 */
export const rothConversions = mysqlTable("rothConversions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  scenarioId: int("scenarioId"),
  
  // Input data
  currentAge: int("currentAge").notNull(),
  traditionalIraBalance: int("traditionalIraBalance").notNull(),
  currentTaxBracket: int("currentTaxBracket").notNull(), // percentage
  retirementTaxBracket: int("retirementTaxBracket").notNull(), // percentage
  conversionAmount: int("conversionAmount").notNull(),
  conversionYear: int("conversionYear").notNull(),
  
  // Results
  taxesPaidNow: int("taxesPaidNow"),
  taxesSavedLater: int("taxesSavedLater"),
  netBenefit: int("netBenefit"),
  recommendation: text("recommendation"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RothConversion = typeof rothConversions.$inferSelect;
export type InsertRothConversion = typeof rothConversions.$inferInsert;