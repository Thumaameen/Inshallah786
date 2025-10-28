import { EventEmitter } from 'events';
import os from 'os';
import { monitorConfig } from './monitor-config';

class MonitoringService extends EventEmitter {
  private metrics: Map<string, any> = new Map();
  private startTime: number = Date.now();

  constructor() {
    super();
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // System metrics
    setInterval(() => this.collectSystemMetrics(), monitorConfig.metrics.system.interval);
    
    // Initialize response time tracking
    this.metrics.set('responseTime', new Map());
    this.metrics.set('errorCount', new Map());
    this.metrics.set('requestCount', new Map());
  }

  private async collectSystemMetrics() {
    try {
      const metrics = {
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
          total: this.metrics.get('requestCount'),
          errors: this.metrics.get('errorCount')
        },
        responseTime: {
          average: this.calculateAverageResponseTime()
        }
      };

      // Check thresholds and emit alerts if needed
      this.checkThresholds(metrics);

      // Store metrics
      this.metrics.set('system', metrics);
      this.emit('metrics', metrics);

    } catch (error) {
      console.error('Error collecting system metrics:', error);
      this.emit('monitoring:error', error);
    }
  }

  private checkThresholds(metrics: any) {
    // Memory threshold check
    if (metrics.memory.usagePercent > monitorConfig.metrics.system.memoryThreshold) {
      this.emit('alert', {
        type: 'memory',
        message: \`High memory usage: \${metrics.memory.usagePercent.toFixed(2)}%\`,
        timestamp: Date.now()
      });
    }

    // CPU threshold check
    const cpuUsage = metrics.cpu.loadAvg[0];
    if (cpuUsage > monitorConfig.metrics.system.cpuThreshold) {
      this.emit('alert', {
        type: 'cpu',
        message: \`High CPU usage: \${cpuUsage.toFixed(2)}%\`,
        timestamp: Date.now()
      });
    }
  }

  public trackRequest(path: string, startTime: number, statusCode: number) {
    const duration = Date.now() - startTime;
    
    // Update response time metrics
    const responseTimeMap = this.metrics.get('responseTime');
    if (!responseTimeMap.has(path)) {
      responseTimeMap.set(path, []);
    }
    responseTimeMap.get(path).push(duration);

    // Update request count
    const requestCount = this.metrics.get('requestCount');
    requestCount.set(path, (requestCount.get(path) || 0) + 1);

    // Track errors
    if (statusCode >= 400) {
      const errorCount = this.metrics.get('errorCount');
      errorCount.set(path, (errorCount.get(path) || 0) + 1);
    }

    // Check response time threshold
    if (duration > monitorConfig.metrics.api.responseTimeThreshold) {
      this.emit('alert', {
        type: 'response_time',
        message: \`Slow response time for \${path}: \${duration}ms\`,
        timestamp: Date.now()
      });
    }
  }

  private calculateAverageResponseTime(): Map<string, number> {
    const averages = new Map();
    const responseTimeMap = this.metrics.get('responseTime');

    for (const [path, times] of responseTimeMap.entries()) {
      if (times.length > 0) {
        const avg = times.reduce((a: number, b: number) => a + b, 0) / times.length;
        averages.set(path, avg);
      }
    }

    return averages;
  }

  public getMetrics() {
    return {
      system: this.metrics.get('system'),
      uptime: Date.now() - this.startTime,
      requests: {
        count: this.metrics.get('requestCount'),
        errors: this.metrics.get('errorCount'),
        responseTime: this.calculateAverageResponseTime()
      }
    };
  }
}

export const monitoringService = new MonitoringService();