import { Redis } from 'ioredis';

export class AIResponseCache {
    private redis: Redis;
    private readonly TTL = 3600; // Cache for 1 hour

    constructor() {
        // Initialize Redis with fallback to memory cache if Redis URL not provided
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl) {
            this.redis = new Redis(redisUrl, {
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                }
            });
        }
    }

    async get(key: string): Promise<any | null> {
        try {
            if (!this.redis) return null;
            
            const cached = await this.redis.get(this.hashKey(key));
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.warn('Cache retrieval failed:', error);
            return null;
        }
    }

    async set(key: string, value: any): Promise<void> {
        try {
            if (!this.redis) return;

            await this.redis.setex(
                this.hashKey(key),
                this.TTL,
                JSON.stringify(value)
            );
        } catch (error) {
            console.warn('Cache storage failed:', error);
        }
    }

    private hashKey(key: string): string {
        // Simple hash function for cache keys
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            const char = key.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `ai:${hash}`;
    }
}