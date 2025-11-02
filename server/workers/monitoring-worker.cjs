#!/usr/bin/env node

/**
 * Monitoring Worker Service for Render
 * Runs as a background worker to monitor the main web service
 */

const { EventEmitter } = require('events');

class MonitoringWorker extends EventEmitter {
    constructor() {
        super();
        this.isRunning = false;
        this.monitorInterval = parseInt(process.env.MONITOR_INTERVAL || '60000');
        this.targetService = process.env.TARGET_SERVICE || 'dha-digital-services';
        // Updated to check RENDER_SERVICE_URL first, then RENDER_EXTERNAL_URL, with a fallback to localhost:10000
        const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL || process.env.RENDER_SERVICE_URL || 'http://localhost:10000';
        this.serviceUrl = RENDER_EXTERNAL_URL;
    }

    async start() {
        this.isRunning = true;
        console.log('🔍 DHA Monitoring Worker Started');
        console.log(`   Target: ${this.targetService}`);
        console.log(`   URL: ${this.serviceUrl}`);
        console.log(`   Interval: ${this.monitorInterval}ms`);

        // Run monitoring checks periodically
        setInterval(() => this.performHealthCheck(), this.monitorInterval);

        // Initial check
        await this.performHealthCheck();

        // Keep the worker alive
        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
    }

    async performHealthCheck() {
        try {
            const response = await fetch(`${this.serviceUrl}/api/health`);
            const data = await response.json();

            if (data.status === 'healthy') {
                console.log(`✅ Health check passed - ${new Date().toISOString()}`);
                this.emit('health-check-success', data);
            } else {
                console.warn(`⚠️ Health check warning - ${new Date().toISOString()}`);
                this.emit('health-check-warning', data);
            }
        } catch (error) {
            console.error(`❌ Health check failed - ${new Date().toISOString()}:`, error.message);
            this.emit('health-check-failure', error);
        }
    }

    shutdown() {
        console.log('🛑 Monitoring worker shutting down gracefully...');
        this.isRunning = false;
        process.exit(0);
    }
}

// Start the worker if running directly
if (require.main === module) {
    const worker = new MonitoringWorker();
    worker.start().catch(error => {
        console.error('Failed to start monitoring worker:', error);
        process.exit(1);
    });
}

module.exports = MonitoringWorker;
```javascript
#!/usr/bin/env node

/**
 * Background Monitoring Worker for Render
 * Performs health checks and monitoring tasks
 */

const HEALTH_CHECK_INTERVAL = parseInt(process.env.MONITOR_INTERVAL || '60000', 10);
const SERVICE_URL = process.env.RENDER_EXTERNAL_URL || 'http://localhost:10000';

class MonitoringWorker {
    constructor() {
        this.isRunning = false;
        this.healthCheckCount = 0;
    }

    async start() {
        console.log('🔍 Monitoring Worker Started');
        console.log(`   Service URL: ${SERVICE_URL}`);
        console.log(`   Check Interval: ${HEALTH_CHECK_INTERVAL}ms`);
        
        this.isRunning = true;
        
        // Run initial health check
        await this.performHealthCheck();
        
        // Schedule recurring health checks
        this.scheduleHealthChecks();
        
        // Handle graceful shutdown
        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
    }

    scheduleHealthChecks() {
        this.intervalId = setInterval(async () => {
            if (this.isRunning) {
                await this.performHealthCheck();
            }
        }, HEALTH_CHECK_INTERVAL);
    }

    async performHealthCheck() {
        this.healthCheckCount++;
        
        try {
            const https = require('https');
            const http = require('http');
            const url = new URL(`${SERVICE_URL}/api/health`);
            const protocol = url.protocol === 'https:' ? https : http;
            
            const response = await new Promise((resolve, reject) => {
                const req = protocol.get(url, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => resolve({ status: res.statusCode, data }));
                });
                req.on('error', reject);
                req.setTimeout(5000, () => {
                    req.destroy();
                    reject(new Error('Health check timeout'));
                });
            });

            if (response.status === 200) {
                console.log(`✅ Health check passed (#${this.healthCheckCount})`);
            } else {
                console.warn(`⚠️  Health check warning (#${this.healthCheckCount}): Status ${response.status}`);
            }
        } catch (error) {
            console.error(`❌ Health check failed (#${this.healthCheckCount}):`, error.message);
        }
    }

    shutdown() {
        console.log('🛑 Shutting down monitoring worker...');
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        process.exit(0);
    }
}

// Start the worker
const worker = new MonitoringWorker();
worker.start().catch(error => {
    console.error('Fatal error in monitoring worker:', error);
    process.exit(1);
});
```
