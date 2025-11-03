import { pgTable, text, timestamp, boolean, integer, json, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Documents table
export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  referenceNumber: text('reference_number').notNull().unique(),
  type: text('type').notNull(),
  status: text('status').notNull().default('pending'),
  metadata: json('metadata').notNull(),
  hash: text('hash').notNull(),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  validUntil: timestamp('valid_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: uuid('user_id').references(() => users.id).notNull()
});

// AI Conversations table
export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  provider: text('provider').notNull(),
  powerLevel: text('power_level').notNull(),
  message: text('message').notNull(),
  response: text('response').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// API Logs table
export const apiLogs = pgTable('api_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  service: text('service').notNull(),
  endpoint: text('endpoint').notNull(),
  method: text('method').notNull(),
  statusCode: integer('status_code'),
  request: json('request'),
  response: json('response'),
  error: text('error'),
  duration: integer('duration'),
  timestamp: timestamp('timestamp').defaultNow().notNull()
});

// Document Verifications table
export const verifications = pgTable('verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  documentId: uuid('document_id').references(() => documents.id).notNull(),
  status: text('status').notNull(),
  verifiedAt: timestamp('verified_at').defaultNow().notNull(),
  verifiedBy: text('verified_by').notNull(),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Government API Status table
export const apiStatus = pgTable('api_status', {
  id: uuid('id').defaultRandom().primaryKey(),
  service: text('service').notNull().unique(),
  status: text('status').notNull(),
  lastCheck: timestamp('last_check').notNull(),
  errorMessage: text('error_message'),
  metadata: json('metadata'),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// System Status table
export const systemStatus = pgTable('system_status', {
  id: uuid('id').defaultRandom().primaryKey(),
  totalDocuments: integer('total_documents').notNull().default(0),
  activeUsers: integer('active_users').notNull().default(0),
  aiRequests: integer('ai_requests').notNull().default(0),
  successRate: integer('success_rate').notNull().default(0),
  systemHealth: text('system_health').notNull(),
  lastUpdate: timestamp('last_update').defaultNow().notNull()
});