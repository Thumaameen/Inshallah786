export interface HealthStatus {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    healthy: boolean;
    environment: string;
    details?: any;
}

export interface ServiceCheck {
    checkHealth(): Promise<HealthStatus>;
    isHealthy(): Promise<boolean>;
    isReady(): Promise<boolean>;
}