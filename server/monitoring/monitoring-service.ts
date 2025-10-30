import { EventEmitter } from 'events';
import os from 'os';
import { monitorConfig } from './monitor-config';
import { SystemMetrics, AlertMessage } from './types';

class MonitoringService extends EventEmitter {
  private metrics: Map<string, any> = new Map();
  private systemMetrics: SystemMetrics;
  private responseTimeMap: Map<string, number[]> = new Map();
  private errorCountMap: Map<string, number> = new Map();
  private requestCountMap: Map<string, number> = new Map();
  private startTime: number = Date.now();

  constructor() {
    super();
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // System metrics
    setInterval(() => this.collectSystemMetrics(), monitorConfig.metrics.system.interval);
    
    // Initialize default system metrics
    this.systemMetrics = {
      timestamp: Date.now(),
      uptime: 0,
      memory: {
        total: 0,
        free: 0,
        used: 0,
        usagePercent: 0
      },
      cpu: {
        loadAvg: [0, 0, 0],
        cores: os.cpus().length
      },
      requests: {
        total: new Map(),
        errors: new Map()
      },
      responseTime: {
        average: new Map()
      }
    };
  }

  private async collectSystemMetrics() {
    try {
      this.systemMetrics = {
        timestamp: Date.now(),
        uptime: process.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
        },
        cpu: {
          loadAvg: os.loadavg(),
          cores: os.cpus().length
        },
        requests: {
          total: this.requestCountMap,
          errors: this.errorCountMap
        },
        responseTime: {
          average: this.calculateAverageResponseTime()
        }
      };

      // Check thresholds and emit alerts if needed
      this.checkThresholds(this.systemMetrics);

      // Emit metrics event
      this.emit('metrics', this.systemMetrics);

    } catch (error) {
      console.error('Error collecting system metrics:', error);
      this.emit('monitoring:error', error);
    }
  }

  private checkThresholds(metrics: SystemMetrics) {
    // Memory threshold check
    if (metrics.memory.usagePercent > monitorConfig.metrics.system.memoryThreshold) {
      this.emit('alert', {
        type: 'memory',
        message: `High memory usage: ${metrics.memory.usagePercent.toFixed(2)}%`,
        timestamp: Date.now(),
        severity: 'warning'
      } as AlertMessage);
    }

    // CPU threshold check
    const cpuUsage = metrics.cpu.loadAvg[0];
    if (cpuUsage > monitorConfig.metrics.system.cpuThreshold) {
      this.emit('alert', {
        type: 'cpu',
        message: `High CPU usage: ${cpuUsage.toFixed(2)}%`,
        timestamp: Date.now(),
        severity: 'warning'
      } as AlertMessage);
    }
  }

  public trackRequest(path: string, startTime: number, statusCode: number) {
    const duration = Date.now() - startTime;
    
    // Update response time metrics
    if (!this.responseTimeMap.has(path)) {
      this.responseTimeMap.set(path, []);
    }
    this.responseTimeMap.get(path)?.push(duration);

    // Update request count
    this.requestCountMap.set(path, (this.requestCountMap.get(path) || 0) + 1);

    // Track errors
    if (statusCode >= 400) {
      this.errorCountMap.set(path, (this.errorCountMap.get(path) || 0) + 1);
    }

    // Check response time threshold
    if (duration > monitorConfig.metrics.api.responseTimeThreshold) {
      this.emit('alert', {
        type: 'response_time',
        message: `Slow response time for ${path}: ${duration}ms`,
        timestamp: Date.now(),
        severity: 'warning',
        metadata: { path, duration, threshold: monitorConfig.metrics.api.responseTimeThreshold }
      } as AlertMessage);
    }
  }

  private calculateAverageResponseTime(): Map<string, number> {
    const averages = new Map<string, number>();

    for (const [path, times] of this.responseTimeMap.entries()) {
      if (times.length > 0) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        averages.set(path, avg);
      }
    }

    return averages;
  }

  public getMetrics() {
    return {
      system: this.systemMetrics,
      uptime: Date.now() - this.startTime,
      requests: {
        count: this.requestCountMap,
        errors: this.errorCountMap,
        responseTime: this.calculateAverageResponseTime()
      }
    };
  }
}

export const monitoringService = new MonitoringService();