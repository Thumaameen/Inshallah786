import { HealthStatus } from '../types/health.types';
import { AIServiceCheck } from './health-checks/ai-service.check';
import { DocumentServiceCheck } from './health-checks/document-service.check';
import { SecurityServiceCheck } from './health-checks/security-service.check';
import { DatabaseCheck } from './health-checks/database.check';
import { CacheCheck } from './health-checks/cache.check';
import { APIKeyCheck } from './health-checks/api-key.check';

export class ServiceHealthMonitor {
    private aiCheck: AIServiceCheck;
    private docCheck: DocumentServiceCheck;
    private securityCheck: SecurityServiceCheck;
    private dbCheck: DatabaseCheck;
    private cacheCheck: CacheCheck;
    private apiKeyCheck: APIKeyCheck;

    constructor() {
        this.aiCheck = new AIServiceCheck();
        this.docCheck = new DocumentServiceCheck();
        this.securityCheck = new SecurityServiceCheck();
        this.dbCheck = new DatabaseCheck();
        this.cacheCheck = new CacheCheck();
        this.apiKeyCheck = new APIKeyCheck();
    }

    async getBasicHealth(): Promise<HealthStatus> {
        const isHealthy = await this.performBasicChecks();
        return {
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            healthy: isHealthy,
            environment: process.env.NODE_ENV || 'development'
        };
    }

    async getDetailedHealth(): Promise<any> {
        const [ai, doc, security, db, cache, apis] = await Promise.all([
            this.aiCheck.checkHealth(),
            this.docCheck.checkHealth(),
            this.securityCheck.checkHealth(),
            this.dbCheck.checkHealth(),
            this.cacheCheck.checkHealth(),
            this.apiKeyCheck.checkHealth()
        ]);

        const overall = {
            healthy: [ai, doc, security, db, cache, apis].every(check => check.healthy),
            timestamp: new Date().toISOString()
        };

        return {
            overall,
            services: {
                ai,
                document: doc,
                security,
                database: db,
                cache,
                apiKeys: apis
            }
        };
    }

    async getAIServicesHealth(): Promise<any> {
        return await this.aiCheck.checkHealth();
    }

    async getDocumentServicesHealth(): Promise<any> {
        return await this.docCheck.checkHealth();
    }

    async getSecurityServicesHealth(): Promise<any> {
        return await this.securityCheck.checkHealth();
    }

    async getReadinessStatus(): Promise<any> {
        const [dbReady, cacheReady, apisReady] = await Promise.all([
            this.dbCheck.isReady(),
            this.cacheCheck.isReady(),
            this.apiKeyCheck.isReady()
        ]);

        const ready = dbReady && cacheReady && apisReady;

        return {
            ready,
            timestamp: new Date().toISOString(),
            components: {
                database: dbReady,
                cache: cacheReady,
                apis: apisReady
            }
        };
    }

    private async performBasicChecks(): Promise<boolean> {
        try {
            const [dbHealth, apiKeys] = await Promise.all([
                this.dbCheck.isHealthy(),
                this.apiKeyCheck.isHealthy()
            ]);

            return dbHealth && apiKeys;
        } catch (error) {
            return false;
        }
    }
}