import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export class DrizzleDatabase {
  private pool: Pool;
  private db: ReturnType<typeof drizzle<typeof schema>>;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/dha_database",
    });

    this.db = drizzle(this.pool, { schema });
  }

  // System Metrics
  async addMetric(timestamp: Date, metricType: string, value: string, tags?: Record<string, any>) {
    return this.db.insert(schema.systemMetricsTable).values({
      timestamp,
      metricType,
      value,
      tags: tags ? tags : null
    });
  }

  async getMetrics(metricType?: string, startTime?: Date, endTime?: Date) {
    const conditions = [];
    
    if (metricType) {
      conditions.push(eq(schema.systemMetricsTable.metricType, metricType));
    }
    
    if (startTime) {
      conditions.push(gte(schema.systemMetricsTable.timestamp, startTime));
    }
    
    if (endTime) {
      conditions.push(lte(schema.systemMetricsTable.timestamp, endTime));
    }
    
    return this.db.select()
      .from(schema.systemMetricsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
  }

  // Self-Healing Actions
  async recordHealingAction(action: {
    timestamp: Date;
    actionType: string;
    description: string;
    result: string;
    metadata?: Record<string, any>;
  }) {
    return this.db.insert(schema.selfHealingActionsTable).values(action);
  }

  async getHealingActions(startTime?: Date, endTime?: Date) {
    const conditions = [];
    
    if (startTime) {
      conditions.push(gte(schema.selfHealingActionsTable.timestamp, startTime));
    }
    
    if (endTime) {
      conditions.push(lte(schema.selfHealingActionsTable.timestamp, endTime));
    }
    
    return this.db.select()
      .from(schema.selfHealingActionsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
  }

  // Compliance Events
  async logComplianceEvent(event: {
    timestamp: Date;
    eventType: typeof schema.complianceEventTypeEnum.enumValues[number];
    description: string;
    userId?: string;
    metadata?: Record<string, any>;
  }) {
    return this.db.insert(schema.complianceEventsTable).values(event);
  }

  async getComplianceEvents(
    eventType?: typeof schema.complianceEventTypeEnum.enumValues[number],
    startTime?: Date,
    endTime?: Date
  ) {
    let query = this.db.select().from(schema.complianceEventsTable);
    
    if (eventType) {
      query = query.where(({ eventType: et }) => et.equals(eventType));
    }
    
    if (startTime) {
      query = query.where(({ timestamp }) => timestamp.gte(startTime));
    }
    
    if (endTime) {
      query = query.where(({ timestamp }) => timestamp.lte(endTime));
    }
    
    return query;
  }

  // Connection management
  async close() {
    await this.pool.end();
  }
}