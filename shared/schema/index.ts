import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, boolean, jsonb, varchar } from "drizzle-orm/pg-core";

// Base Types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  country?: string;
  region?: string;
  city?: string;
  coordinates?: Coordinates;
}

// Core Tables
export const dhaDocumentVerifications = pgTable("dha_document_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  verificationCode: text("verification_code").notNull().unique(),
  documentNumber: text("document_number"),
  documentType: text("document_type"),
  issuedAt: timestamp("issued_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
  userId: varchar("user_id"),
  documentData: jsonb("document_data"),
  verificationStatus: text("verification_status").notNull().default("pending"),
  verificationMethod: text("verification_method"),
  verificationResult: jsonb("verification_result"),
  aiScore: integer("ai_score"),
  humanVerified: boolean("human_verified").notNull().default(false),
  lastVerifiedAt: timestamp("last_verified_at"),
  revokedAt: timestamp("revoked_at"),
  revocationReason: text("revocation_reason")
});

export const verificationSessions = pgTable("verification_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  sessionToken: text("session_token").notNull().unique(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  expiresAt: timestamp("expires_at").notNull(),
  lastActivity: timestamp("last_activity"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  currentVerifications: integer("current_verifications").notNull().default(0),
  maxVerifications: integer("max_verifications").notNull().default(100),
  isActive: boolean("is_active").notNull().default(true)
});

export const apiAccess = pgTable("api_access", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apiKeyId: text("api_key_id").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  hourlyQuota: integer("hourly_quota").notNull().default(1000),
  currentHourlyUsage: integer("current_hourly_usage").notNull().default(0),
  lastResetAt: timestamp("last_reset_at").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  metadata: jsonb("metadata")
});

export const verificationHistory = pgTable("verification_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  verificationId: varchar("verification_id").notNull().references(() => dhaDocumentVerifications.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  ipAddress: text("ip_address"),
  location: jsonb("location"),
  userAgent: text("user_agent"),
  verificationMethod: text("verification_method").notNull(),
  isSuccessful: boolean("is_successful").notNull(),
  metadata: jsonb("metadata")
});

// Additional monitoring and security tables
export const securityEvents = pgTable("security_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: text("event_type").notNull(),
  severity: text("severity").notNull(),
  source: text("source").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userId: varchar("user_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  resolvedAt: timestamp("resolved_at"),
  isResolved: boolean("is_resolved").notNull().default(false)
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: text("action").notNull(),
  actor: text("actor").notNull(),
  resource: text("resource"),
  resourceId: text("resource_id"),
  result: text("result").notNull(),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

export const systemMetrics = pgTable("system_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metricName: text("metric_name").notNull(),
  metricValue: integer("metric_value").notNull(),
  metricType: text("metric_type").notNull(),
  source: text("source").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

export const selfHealingActions = pgTable("self_healing_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actionType: text("action_type").notNull(),
  trigger: text("trigger").notNull(),
  status: text("status").notNull().default("pending"),
  result: text("result"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at")
});

export const fraudAlerts = pgTable("fraud_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alertType: text("alert_type").notNull(),
  severity: text("severity").notNull(),
  userId: varchar("user_id"),
  description: text("description"),
  metadata: jsonb("metadata"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  resolvedAt: timestamp("resolved_at")
});

export const securityIncidents = pgTable("security_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentType: text("incident_type").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull().default("open"),
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: text("resolved_by")
});

export const errorLogs = pgTable("error_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  errorType: text("error_type").notNull(),
  errorMessage: text("error_message").notNull(),
  stackTrace: text("stack_trace"),
  source: text("source").notNull(),
  severity: text("severity").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  resolvedAt: timestamp("resolved_at")
});

export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity").notNull(),
  status: text("status").notNull().default("open"),
  affectedSystems: jsonb("affected_systems"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: text("resolved_by")
});

// Type exports
export type DhaDocumentVerification = typeof dhaDocumentVerifications.$inferSelect;
export type InsertDhaDocumentVerification = typeof dhaDocumentVerifications.$inferInsert;

export type VerificationSession = typeof verificationSessions.$inferSelect;
export type InsertVerificationSession = typeof verificationSessions.$inferInsert;

export type ApiAccess = typeof apiAccess.$inferSelect;
export type InsertApiAccess = typeof apiAccess.$inferInsert;

export type VerificationHistory = typeof verificationHistory.$inferSelect;
export type InsertVerificationHistory = typeof verificationHistory.$inferInsert;

export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertSecurityEvent = typeof securityEvents.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

export type SystemMetric = typeof systemMetrics.$inferSelect;
export type InsertSystemMetric = typeof systemMetrics.$inferInsert;

export type SelfHealingAction = typeof selfHealingActions.$inferSelect;
export type InsertSelfHealingAction = typeof selfHealingActions.$inferInsert;

export type FraudAlert = typeof fraudAlerts.$inferSelect;
export type InsertFraudAlert = typeof fraudAlerts.$inferInsert;

export type SecurityIncident = typeof securityIncidents.$inferSelect;
export type InsertSecurityIncident = typeof securityIncidents.$inferInsert;

export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = typeof errorLogs.$inferInsert;

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;