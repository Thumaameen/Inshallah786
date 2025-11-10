// Types for database models
export interface SecurityEvent {
  eventType: string;
  severity: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface SystemMetric {
  metricName: string;
  metricValue: number;
  metricType: string;
  source: string;
  value?: number;
}

export interface AuditLogEntry {
  action: string;
  actor: string;
  result: string;
  metadata?: Record<string, any>;
  resource?: string;
}