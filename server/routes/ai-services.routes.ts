import { Router, Request, Response } from 'express';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { RateLimiter } from '../utils/rate-limiter.js';
import { ErrorLogger } from '../utils/error-logger.js';

// Initialize router
const router = express.Router();

// Initialize rate limiter
const rateLimiter = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
};

// Error logging utility
const logError = (error: Error, context: string) => {
    console.error(`[${context}] ${error.message}`, {
        timestamp: new Date().toISOString(),
        stack: error.stack
    });
};

// Environment variables interface
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ANTHROPIC_API_KEY?: string;
            NODE_ENV?: string;
        }
    }
}

// Environment variables
const {
  ANTHROPIC_API_KEY,
  NODE_ENV
} = process.env;

// Initialize Enhanced AI Service
const enhancedAI = new EnhancedAIService();

// Enhanced AI Service with Claude
class EnhancedAIService {
    private claude: Claude | null = null;
    private ready: boolean = false;

    constructor() {
        try {
            const apiKey = process.env.ANTHROPIC_API_KEY;
            if (!apiKey) {
                console.warn('ANTHROPIC_API_KEY not configured');
                return;
            }
            this.claude = new Claude({ apiKey });
            this.ready = true;
        } catch (error) {
            console.error('Failed to initialize Claude:', error);
        }
    }

    async process(message: string, features: any = {}) {
        if (!this.ready || !this.claude) {
            throw new Error('AI service not properly initialized');
        }

        try {
            return await this.claude.messages.create({
                model: features.model || 'claude-3',
                max_tokens: features.maxTokens || 1000,
                messages: [{ role: 'user', content: message }],
                temperature: features.temperature || 0.7,
                metadata: {
                    source: 'DHA-Digital-Services',
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error: any) {
            console.error('AI Processing Error:', error);
            throw new Error(`Enhanced AI processing failed: ${error.message}`);
        }
    }

    async getStatus(): Promise<any> {
        return {
            ready: this.ready,
            model: 'claude-3',
            timestamp: new Date().toISOString()
        };
    }
}

// AI Service Routes
router.post('/process', async (req: Request, res: Response) => {
    try {
        const { message, features } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = await enhancedAI.process(message, features);
        res.json({
            success: true,
            data: response,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        logError(error, 'AI-Process');
        res.status(500).json({ 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// System Status Routes
router.get('/status', async (req: Request, res: Response) => {
    try {
        const status = await enhancedAI.getStatus();
        res.json({
            ...status,
            version: '3.0',
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error: any) {
        logError(error, 'AI-Status');
        res.status(500).json({ 
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;