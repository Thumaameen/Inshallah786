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
        this.serviceUrl = process.env.RENDER_EXTERNAL_URL || 'http://localhost:5000';
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
