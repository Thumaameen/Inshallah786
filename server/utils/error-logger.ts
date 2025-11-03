export class ErrorLogger {
    private serviceName: string;
    private errors: Array<{timestamp: string; type: string; error: any}> = [];

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    async log(type: string, error: any): Promise<void> {
        const errorLog = {
            timestamp: new Date().toISOString(),
            service: this.serviceName,
            type,
            error: {
                message: error.message,
                stack: error.stack,
                code: error.code || 'UNKNOWN',
                status: error.status || 500
            }
        };

        // Store locally
        this.errors.push(errorLog);

        // Log to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.error('[ErrorLogger]', JSON.stringify(errorLog, null, 2));
        }

        // In production, could send to logging service
        if (process.env.NODE_ENV === 'production') {
            // Add production logging integration here
            // e.g., CloudWatch, Datadog, etc.
        }
    }

    getRecentErrors(limit: number = 10): Array<any> {
        return this.errors.slice(-limit);
    }
}