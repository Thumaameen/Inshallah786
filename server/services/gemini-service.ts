/**
 * Google Gemini AI Integration
 * Optional AI provider that gracefully degrades when not configured
 */
import { config } from '../config/ai-config.js';
import { logger } from '../utils/logger.js';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiService {
  private static instance: GeminiService;
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly timeout: number;
  private isConfigured: boolean;

  private constructor() {
    this.apiKey = config.gemini.apiKey;
    this.baseUrl = config.gemini.baseUrl || 'https://generativelanguage.googleapis.com/v1';
    this.maxRetries = config.gemini.maxRetries || 3;
    this.timeout = config.gemini.timeout || 30000;
    this.isConfigured = Boolean(this.apiKey);
    
    if (!this.isConfigured) {
      logger.info('Google Gemini AI service not configured - will fallback to other AI providers');
    }
  }

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  private async makeRequest(url: string, options: RequestInit, retryCount = 0): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        logger.warn(`Gemini API request failed, retrying (${retryCount + 1}/${this.maxRetries})...`);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return this.makeRequest(url, options, retryCount + 1);
      }
      throw error;
    }
  }

  async processQuery(query: string): Promise<{
    success: boolean;
    response?: string;
    message: string;
  }> {
    if (!this.isConfigured) {
      return {
        success: false,
        message: 'Gemini AI not configured - query routed to alternate AI provider'
      };
    }

    try {
      const url = `${this.baseUrl}/models/gemini-pro:generateContent`;
      const response = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('Gemini API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json() as GeminiResponse;
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
      }

      return {
        success: true,
        response: data.candidates[0].content.parts[0].text,
        message: 'Query processed successfully'
      };
    } catch (error) {
      logger.error('Gemini AI processing error:', error);
      return {
        success: false,
        message: 'Error processing query - falling back to alternate AI provider'
      };
    }
  }

  getStatus(): {
    available: boolean;
    message: string;
  } {
    return {
      available: this.isConfigured,
      message: this.isConfigured 
        ? 'Gemini AI service ready'
        : 'Gemini AI not configured - using fallback AI providers'
    };
  }
}

export const geminiService = GeminiService.getInstance();

interface GeminiConfig {
  apiKey?: string;
}

export const geminiConfig = {
  gemini: {} as GeminiConfig
};