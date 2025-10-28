export interface MetricsConfig {
  metrics: {
    system: {
      enabled: boolean;
      interval: number;
      memoryThreshold: number;
      cpuThreshold: number;
    };
    api: {
      enabled: boolean;
      responseTimeThreshold: number;
      errorRateThreshold: number;
      endpoints: string[];
    };
    database: {
      enabled: boolean;
      connectionThreshold: number;
      queryTimeThreshold: number;
      maxConnections: number;
    };
    business: {
      enabled: boolean;
      documentGenerationTime: number;
      aiResponseTime: number;
      userSessionLength: number;
    };
  };
  alerts: {
    enabled: boolean;
    channels: {
      console: boolean;
      log: boolean;
    };
    throttle: number;
  };
}

export interface SystemMetrics {
  timestamp: number;
  uptime: number;
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
  };
  cpu: {
    loadAvg: number[];
    cores: number;
  };
  requests: {
    total: Map<string, number>;
    errors: Map<string, number>;
  };
  responseTime: {
    average: Map<string, number>;
  };
}

export interface AlertMessage {
  type: 'memory' | 'cpu' | 'response_time' | 'error_rate' | 'database';
  message: string;
  timestamp: number;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  metadata?: Record<string, any>;
}