import os from 'os';
import { Redis } from 'ioredis';

export class SystemMetrics {
    private redis: Redis | null = null;

    constructor() {
        if (process.env.REDIS_URL) {
            this.redis = new Redis(process.env.REDIS_URL);
        }
    }

    async getMetrics(): Promise<any> {
        const [cpuUsage, memoryMetrics, requestMetrics] = await Promise.all([
            this.getCPUUsage(),
            this.getMemoryMetrics(),
            this.getRequestMetrics()
        ]);

        return {
            timestamp: new Date().toISOString(),
            system: {
                cpu: cpuUsage,
                memory: memoryMetrics,
                uptime: process.uptime(),
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch
            },
            application: {
                requests: requestMetrics,
                environment: process.env.NODE_ENV,
                deployedVersion: process.env.npm_package_version
            }
        };
    }

    private async getCPUUsage(): Promise<any> {
        const cpus = os.cpus();
        const loadAvg = os.loadavg();

        return {
            cores: cpus.length,
            model: cpus[0].model,
            speed: cpus[0].speed,
            loadAverage: {
                '1min': loadAvg[0],
                '5min': loadAvg[1],
                '15min': loadAvg[2]
            }
        };
    }

    private getMemoryMetrics(): any {
        const total = os.totalmem();
        const free = os.freemem();
        const used = total - free;

        return {
            total: this.formatBytes(total),
            free: this.formatBytes(free),
            used: this.formatBytes(used),
            percentUsed: ((used / total) * 100).toFixed(2) + '%'
        };
    }

    private async getRequestMetrics(): Promise<any> {
        if (!this.redis) {
            return {
                total: 'Redis not configured',
                lastMinute: 'Redis not configured',
                averageResponseTime: 'Redis not configured'
            };
        }

        try {
            const [total, lastMinute, avgTime] = await Promise.all([
                this.redis.get('metrics:requests:total'),
                this.redis.get('metrics:requests:lastMinute'),
                this.redis.get('metrics:requests:avgResponseTime')
            ]);

            return {
                total: total || '0',
                lastMinute: lastMinute || '0',
                averageResponseTime: avgTime ? `${parseFloat(avgTime).toFixed(2)}ms` : '0ms'
            };
        } catch (error) {
            return {
                total: '0',
                lastMinute: '0',
                averageResponseTime: '0ms',
                error: 'Redis metrics unavailable'
            };
        }
    }

    private formatBytes(bytes: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    }
}