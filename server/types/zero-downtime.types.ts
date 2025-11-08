export interface NodeMetrics {
  cpu: number;
  memory: number;
  network: {
    in: number;
    out: number;
  };
  requests: {
    total: number;
    success: number;
    failed: number;
  };
  responseTime: {
    avg: number;
    p95: number;
    p99: number;
  };
}

export interface ServiceNode {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'backup' | 'load_balancer';
  status: 'active' | 'standby' | 'failed' | 'maintenance' | 'draining';
  health: 'healthy' | 'warning' | 'critical' | 'unknown';
  load: number;
  capacity: number;
  currentConnections: number;
  responseTime: number;
  errorRate: number;
  lastUpdate: Date;
  endpoint?: string;
  metadata?: Record<string, unknown>;
}

export interface LoadBalancerConfig {
  algorithm: 'round_robin' | 'least_connections' | 'weighted' | 'health_based' | 'ai_optimized';
  healthCheckInterval: number;
  failureThreshold: number;
  recoveryThreshold: number;
  sessionAffinity: boolean;
  stickySession: boolean;
  autoScaling: boolean;
  maxNodes: number;
  minNodes: number;
  fastFailover: boolean;
  aggressiveHealing: boolean;
  gracefulDegradation: boolean;
  loadBalancingTimeout: number;
}

export interface FailoverPolicy {
  id: string;
  name: string;
  service: string;
  triggerConditions: FailoverCondition[];
  actions: FailoverAction[];
  priority: number;
  enabled: boolean;
  autoFailback: boolean;
  failbackConditions?: FailoverCondition[];
  maxFailovers: number;
  cooldownPeriod: number;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface FailoverCondition {
  type: 'health_score' | 'response_time' | 'error_rate' | 'load' | 'availability' | 'custom';
  operator: '<' | '>' | '=' | '<=' | '>=' | '!=';
  threshold: number;
  duration?: number;
  weight?: number;
}

export interface FailoverAction {
  type: 'switch_primary' | 'promote_secondary' | 'scale_up' | 'restart_service' | 
        'drain_traffic' | 'isolate_node' | 'alert' | 'custom';
  target: string;
  parameters: Record<string, unknown>;
  timeout: number;
  rollback?: FailoverAction;
}

export interface FailoverEvent {
  id: string;
  policyId: string;
  triggerTime: Date;
  completionTime?: Date;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  triggeredBy: string;
  sourceNode: string;
  targetNode: string;
  actions: FailoverActionResult[];
  impact: {
    downtime: number;
    affectedRequests: number;
    dataLoss: boolean;
  };
  rollbackPlan?: FailoverAction[];
}

export interface FailoverActionResult {
  action: FailoverAction;
  startTime: Date;
  endTime?: Date;
  status: 'success' | 'failed' | 'in_progress';
  error?: string;
}
export interface InsertAuditLog {
  id?: string;
  timestamp: Date;
  eventType: string;
  category: string;
  severity: string;
  description: string;
  target: string;
  action: string;
  trigger: any;
  status: string;
  result: any;
  aiAssisted: boolean;
}

export interface InsertSystemMetric {
  id?: string;
  timestamp: Date;
  metricType: string;
  value: number;
  metadata?: any;
}
