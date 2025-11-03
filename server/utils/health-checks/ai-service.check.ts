import { ServiceCheck, HealthStatus } from '../../types/health.types';
import { Claude } from 'anthropic';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIServiceCheck implements ServiceCheck {
    private claude: Claude;
    private openai: OpenAI;
    private gemini: GoogleGenerativeAI;

    constructor() {
        // Initialize with API keys if available
        if (process.env.ANTHROPIC_API_KEY) {
            this.claude = new Claude({ apiKey: process.env.ANTHROPIC_API_KEY });
        }
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
        if (process.env.GOOGLE_API_KEY) {
            this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        }
    }

    async checkHealth(): Promise<HealthStatus> {
        const [claudeHealth, openaiHealth, geminiHealth] = await Promise.all([
            this.checkClaude(),
            this.checkOpenAI(),
            this.checkGemini()
        ]);

        const allHealthy = claudeHealth && openaiHealth && geminiHealth;
        const degraded = !allHealthy && (claudeHealth || openaiHealth || geminiHealth);

        return {
            status: allHealthy ? 'healthy' : (degraded ? 'degraded' : 'unhealthy'),
            timestamp: new Date().toISOString(),
            healthy: allHealthy || degraded,
            environment: process.env.NODE_ENV || 'development',
            details: {
                claude: claudeHealth,
                openai: openaiHealth,
                gemini: geminiHealth
            }
        };
    }

    async isHealthy(): Promise<boolean> {
        try {
            const health = await this.checkHealth();
            return health.healthy;
        } catch {
            return false;
        }
    }

    async isReady(): Promise<boolean> {
        return await this.isHealthy();
    }

    private async checkClaude(): Promise<boolean> {
        if (!this.claude) return false;
        try {
            await this.claude.messages.create({
                model: 'claude-2.1',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'test' }]
            });
            return true;
        } catch {
            return false;
        }
    }

    private async checkOpenAI(): Promise<boolean> {
        if (!this.openai) return false;
        try {
            await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 10
            });
            return true;
        } catch {
            return false;
        }
    }

    private async checkGemini(): Promise<boolean> {
        if (!this.gemini) return false;
        try {
            const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
            await model.generateContent('test');
            return true;
        } catch {
            return false;
        }
    }
}