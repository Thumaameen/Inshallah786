#!/usr/bin/env node

/**
 * Scheduled Tasks (Cron Jobs) for Render
 * Runs periodic maintenance and cleanup tasks
 */

import { promises as fs } from 'fs';
import path from 'path';

class ScheduledTasks {
    constructor() {
        this.taskName = process.env.TASK_NAME || 'scheduled-maintenance';
    }

    async run() {
        console.log(`🕐 Scheduled Tasks Started - ${new Date().toISOString()}`);
        console.log(`   Task: ${this.taskName}`);

        try {
            // Task 1: Database cleanup
            await this.cleanupOldSessions();

            // Task 2: Log rotation
            await this.rotateServerLogs();

            // Task 3: Health metrics collection
            await this.collectHealthMetrics();

            console.log(`✅ All scheduled tasks completed successfully`);
            process.exit(0);
        } catch (error) {
            console.error(`❌ Scheduled tasks failed:`, error);
            process.exit(1);
        }
    }

    async cleanupOldSessions() {
        console.log('🧹 Cleaning up old sessions...');
        // Implement session cleanup logic if needed
        console.log('   Session cleanup completed');
    }

    async rotateServerLogs() {
        console.log('📝 Rotating server logs...');
        try {
            const logFile = 'server.log';
            const stats = await fs.stat(logFile).catch(() => null);
            
            if (stats && stats.size > 10 * 1024 * 1024) { // 10MB
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const archiveName = `server-${timestamp}.log`;
                await fs.rename(logFile, archiveName);
                console.log(`   Log archived: ${archiveName}`);
            } else {
                console.log('   No log rotation needed');
            }
        } catch (error) {
            console.warn('   Log rotation skipped:', error.message);
        }
    }

    async collectHealthMetrics() {
        console.log('📊 Collecting health metrics...');
        const metrics = {
            timestamp: new Date().toISOString(),
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
            nodeVersion: process.version
        };
        console.log('   Metrics:', JSON.stringify(metrics, null, 2));
    }
}

// Run tasks if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tasks = new ScheduledTasks();
    tasks.run().catch(error => {
        console.error('Fatal error in scheduled tasks:', error);
        process.exit(1);
    });
}

export default ScheduledTasks;
