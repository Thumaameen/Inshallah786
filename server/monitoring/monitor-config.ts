import { MetricsConfig } from './types';

export const monitorConfig: MetricsConfig = {
  metrics: {
    // System metrics
    system: {
      enabled: true,
      interval: 60000, // 1 minute
      memoryThreshold: 85, // Alert if memory usage > 85%
      cpuThreshold: 80,    // Alert if CPU usage > 80%
    },
    // API metrics
    api: {
      enabled: true,
      responseTimeThreshold: 5000, // 5 seconds
      errorRateThreshold: 5, // 5% error rate threshold
      endpoints: [
        '/api/health',
        '/api/documents',
        '/api/ai/chat',
        '/api/auth'
      ]
    },
    // Database metrics
    database: {
      enabled: true,
      connectionThreshold: 3000, // 3 seconds
      queryTimeThreshold: 5000,  // 5 seconds
      maxConnections: 100
    },
    // Custom business metrics
    business: {
      enabled: true,
      documentGenerationTime: 10000, // 10 seconds
      aiResponseTime: 15000,        // 15 seconds
      userSessionLength: 3600000    // 1 hour
    }
  },
  alerts: {
    enabled: true,
    channels: {
      console: true,
      log: true
    },
    throttle: 300000 // 5 minutes between similar alerts
  }
};