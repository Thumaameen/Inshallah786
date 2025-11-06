#!/usr/bin/env node

/**
 * Monitoring Worker Service for Render
 * Runs as a background worker to monitor the main web service
 */

const { EventEmitter } = require('events');

class MonitoringWorker extends EventEmitter {
    constructor() {
        super();
        // Get the web service URL from environment
        const webServiceUrl = process.env.RENDER_EXTERNAL_URL ||
                            process.env.TARGET_SERVICE_URL ||
                            'https://dha-thisone.onrender.com';
        this.targetUrl = webServiceUrl;
        this.monitorInterval = parseInt(process.env.MONITOR_INTERVAL || '60000', 10);
        this.isRunning = false;
        console.log(`🎯 Monitoring worker targeting: ${this.targetUrl}`);
    }

    async start() {
        this.isRunning = true;
        console.log('🔍 DHA Monitoring Worker Started');
        console.log(`   URL: ${this.targetUrl}`);
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
        const maxRetries = 3;
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(`${this.targetUrl}/api/health`, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Render-Monitoring-Worker/1.0'
                    }
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Health check passed - ${new Date().toISOString()}`, {
                        status: data.status,
                        attempt: attempt
                    });
                    this.emit('health-check-success', data);
                    return true;
                } else {
                    console.warn(`⚠️ Health check returned status ${response.status} (attempt ${attempt}/${maxRetries})`);
                }
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Health check attempt ${attempt}/${maxRetries} failed: ${error.message}`);

                if (attempt < maxRetries) {
                    // Wait before retry with exponential backoff
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }

        console.error(`❌ All health check attempts failed. Last error:`, lastError?.message);
        this.emit('health-check-failure', lastError);
        return false;
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