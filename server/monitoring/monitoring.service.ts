import { EventEmitter } from 'events';
import { productionConfig } from '../config/production';

class MonitoringService extends EventEmitter {
  private static instance: MonitoringService;
  private metrics: Map<string, any>;
  private intervalId: NodeJS.Timeout | null;

  private constructor() {
    super();
    this.metrics = new Map();
    this.intervalId = null;
    this.startMonitoring();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private startMonitoring() {
    if (productionConfig.monitoring.enabled) {
      this.intervalId = setInterval(() => {
        this.collectMetrics();
      }, productionConfig.monitoring.interval);
    }
  }

  private async collectMetrics() {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
        requests: this.metrics.get('requests') || 0,
        errors: this.metrics.get('errors') || 0,
        aiProcessing: this.metrics.get('aiProcessing') || 0
      };

      if (metrics.errors > productionConfig.monitoring.alerts) {
        this.emit('alert', {
          type: 'error_threshold',
          message: `Error count exceeded threshold: ${metrics.errors}`,
          timestamp: metrics.timestamp
        });
      }

      this.metrics.set('current', metrics);
    } catch (error) {
      console.error('Monitoring error:', error);
    }
  }

  public incrementMetric(metric: string) {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + 1);
  }

  public getMetrics() {
    return {
      current: this.metrics.get('current'),
      totalRequests: this.metrics.get('requests'),
      totalErrors: this.metrics.get('errors'),
      aiProcessing: this.metrics.get('aiProcessing')
    };
  }

  public stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const monitoringService = MonitoringService.getInstance();