export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical' | 'emergency';
  services: Record<string, ServiceStatus>;
  resources: SystemResources;
  security: SecurityStatus;
  compliance: ComplianceStatus;
}

export interface ServiceStatus {
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  errorRate: number;
  lastCheck: string;
}

export interface SystemResources {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface SecurityStatus {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  activeIncidents: number;
  fraudAlerts: number;
}

export interface ComplianceStatus {
  score: number;
  violations: number;
  uptime: number;
}

export interface MonitoringEvent {
  id: string;
  type: 'health_check' | 'alert' | 'incident' | 'autonomous_action' | 'maintenance';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  service?: string;
  resolved?: boolean;
  autoResolved?: boolean;
}

export interface AutonomousAction {
  id: string;
  type: string;
  service: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  result?: any;
  impact?: any;
}

export interface AlertRule {
  id: string;
  name: string;
  category: string;
  severity: string;
  enabled: boolean;
  triggered: boolean;
  lastTriggered?: string;
}

export interface CircuitBreakerStatus {
  service: string;
  state: 'closed' | 'open' | 'half_open';
  failureCount: number;
  successRate: number;
  lastFailure?: string;
}

export interface MetricsHistory {
  resources: Array<{
    timestamp: string;
    cpu: number;
    memory: number;
  }>;
  responseTime: Array<{
    timestamp: string;
    average: number;
  }>;
  errorRate: Array<{
    timestamp: string;
    rate: number;
  }>;
  throughput: Array<{
    timestamp: string;
    requests: number;
  }>;
}