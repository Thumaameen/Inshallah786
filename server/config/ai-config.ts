/**
 * Configuration interface for AI services
 */

export interface GeminiConfig {
  apiKey?: string;
  baseUrl?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface AIConfig {
  gemini: GeminiConfig;
}

const defaultConfig: AIConfig = {
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    maxRetries: 3,
    timeout: 30000 // 30 seconds
  }
};

export const config: AIConfig = {
  ...defaultConfig,
  gemini: {
    ...defaultConfig.gemini,
    apiKey: process.env.GEMINI_API_KEY
  }
};