import { Claude } from 'anthropic';
import rateLimit from 'express-rate-limit';
import { ErrorLogger } from '../utils/error-logger.js';
import { AIResponseCache } from '../utils/ai-response-cache.js';
import { ServiceHealthCheck } from '../utils/service-health-check.js';

export class EnhancedAIService {
    private claude: Claude;
    private cache: AIResponseCache;
    private errorLogger: ErrorLogger;
    private healthCheck: ServiceHealthCheck;

    constructor() {
        // Initialize Claude with fallback handling
        const apiKey = this.process.env.ANTHROPIC_API_KEY || this.process.env.CLAUDE_API_KEY;
        if (!apiKey) {
            throw new Error('Anthropic API key not configured');
        }

        this.claude = new Claude({ apiKey });
        this.cache = new AIResponseCache();
        this.errorLogger = new ErrorLogger('EnhancedAIService');
        this.healthCheck = new ServiceHealthCheck();
    }

    // Rate limiter middleware
    public static rateLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later'
    });

    async process(message: string, features: any = {}) {
        try {
            // Check service health
            await this.healthCheck.verify();

            // Check cache first
            const cachedResponse = await this.cache.get(message);
            if (cachedResponse) {
                return cachedResponse;
            }

            // Process with Claude
            const response = await this.claude.messages.create({
                model: features.model || 'claude-3',
                max_tokens: features.maxTokens || 1000,
                messages: [{ role: 'user', content: message }],
                temperature: features.temperature || 0.7,
                system: features.systemPrompt || 'You are a helpful assistant focused on government and military document processing.',
                metadata: {
                    source: 'DHA-Digital-Services',
                    timestamp: new Date().toISOString(),
                    features: JSON.stringify(features)
                }
            });

            // Cache successful response
            await this.cache.set(message, response);

            // Enhance response with metadata
            return {
                ...response,
                metadata: {
                    processingTime: new Date().toISOString(),
                    model: features.model || 'claude-3',
                    cached: false
                }
            };

        } catch (error: any) {
            // Log error and attempt fallback
            await this.errorLogger.log('AI Processing Error', error);

            if (error.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }

            // Attempt fallback to backup model if primary fails
            if (features.allowFallback) {
                try {
                    return await this.processFallback(message, features);
                } catch (fallbackError) {
                    await this.errorLogger.log('Fallback Processing Error', fallbackError);
                    throw new Error('Both primary and fallback processing failed');
                }
            }

            throw new Error(`Enhanced AI processing failed: ${error.message}`);
        }
    }

    private async processFallback(message: string, features: any) {
        // Fallback to more stable model with reduced features
        return await this.claude.messages.create({
            model: 'claude-2.1',
            max_tokens: 500,
            messages: [{ role: 'user', content: message }],
            temperature: 0.5,
            metadata: {
                source: 'DHA-Digital-Services-Fallback',
                timestamp: new Date().toISOString()
            }
        });
    }

    public async getStatus(): Promise<any> {
        return {
            service: 'EnhancedAIService',
            status: 'operational',
            apiVersion: '3.0',
            timestamp: new Date().toISOString(),
            features: {
                models: ['claude-3', 'claude-2.1'],
                caching: true,
                rateLimit: true,
                fallback: true
            },
            health: await this.healthCheck.getStatus()
        };
    }
}