export class ServiceHealthCheck {
    private lastCheck: Date = new Date();
    private status: 'operational' | 'degraded' | 'down' = 'operational';
    private checkInterval: number = 5 * 60 * 1000; // 5 minutes

    async verify(): Promise<boolean> {
        const now = new Date();
        if (now.getTime() - this.lastCheck.getTime() > this.checkInterval) {
            await this.performHealthCheck();
        }
        return this.status === 'operational';
    }

    private async performHealthCheck(): Promise<void> {
        try {
            // Check API keys
            this.verifyAPIKeys();

            // Check required environment variables
            this.verifyEnvironment();

            // Update status and last check time
            this.status = 'operational';
            this.lastCheck = new Date();
        } catch (error) {
            this.status = 'degraded';
            throw new Error('Service health check failed');
        }
    }

    private verifyAPIKeys(): void {
        const requiredKeys = [
            'ANTHROPIC_API_KEY',
            'OPENAI_API_KEY',
            'DATABASE_URL'
        ];

        const missingKeys = requiredKeys.filter(key => !process.env[key]);
        if (missingKeys.length > 0) {
            console.warn(`Missing API keys: ${missingKeys.join(', ')}`);
            // Don't throw - allow graceful degradation
        }
    }

    private verifyEnvironment(): void {
        const requiredVars = [
            'NODE_ENV',
            'PORT'
        ];

        const missingVars = requiredVars.filter(v => !process.env[v]);
        if (missingVars.length > 0) {
            console.warn(`Missing environment variables: ${missingVars.join(', ')}`);
            // Don't throw - allow graceful degradation
        }
    }

    async getStatus(): Promise<any> {
        return {
            status: this.status,
            lastCheck: this.lastCheck.toISOString(),
            nextCheckIn: Math.max(0, this.checkInterval - (Date.now() - this.lastCheck.getTime()))
        };
    }
}