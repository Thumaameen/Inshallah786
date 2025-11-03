import { z } from 'zod';

// AI Provider Configuration Schema
const AIProviderConfigSchema = z.object({
  enabled: z.boolean(),
  apiKey: z.string(),
  models: z.array(z.string()),
  baseURL: z.string().optional(),
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
  timeout: z.number().optional()
});

type AIProviderConfig = z.infer<typeof AIProviderConfigSchema>;

// Complete AI Configuration Schema
const AIConfigSchema = z.object({
  openai: AIProviderConfigSchema,
  anthropic: AIProviderConfigSchema,
  mistral: AIProviderConfigSchema,
  google: AIProviderConfigSchema,
  perplexity: AIProviderConfigSchema
});

type AIConfig = z.infer<typeof AIConfigSchema>;

class AIConfigurationService {
  private config: AIConfig = {
    openai: {
      enabled: true,
      apiKey: process.env.OPENAI_API_KEY || '',
      models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'],
      maxTokens: 4096,
      temperature: 0.7
    },
    anthropic: {
      enabled: true,
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      models: ['claude-3-sonnet-20240229'],
      maxTokens: 4096,
      temperature: 0.7
    },
    mistral: {
      enabled: true,
      apiKey: process.env.MISTRAL_API_KEY || '',
      models: ['mistral-large-latest'],
      maxTokens: 4096,
      temperature: 0.7
    },
    google: {
      enabled: true,
      apiKey: process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '',
      models: ['gemini-pro'],
      maxTokens: 2048,
      temperature: 0.7
    },
    perplexity: {
      enabled: true,
      apiKey: process.env.PERPLEXITY_API_KEY || '',
      models: ['pplx-70b', 'pplx-7b'],
      maxTokens: 4096,
      temperature: 0.7
    }
  };

  constructor() {
    this.validateConfig();
  }

  private validateConfig() {
    try {
      AIConfigSchema.parse(this.config);
      console.log('✅ AI Configuration validated successfully');
    } catch (error) {
      console.error('❌ AI Configuration validation failed:', error);
    }
  }

  getProviderConfig(provider: keyof AIConfig): AIProviderConfig {
    return this.config[provider];
  }

  isProviderEnabled(provider: keyof AIConfig): boolean {
    const config = this.config[provider];
    return config.enabled && !!config.apiKey;
  }

  getEnabledProviders(): Array<keyof AIConfig> {
    return Object.keys(this.config).filter(
      key => this.isProviderEnabled(key as keyof AIConfig)
    ) as Array<keyof AIConfig>;
  }

  getProviderModels(provider: keyof AIConfig): string[] {
    return this.config[provider].models;
  }

  updateProviderConfig(
    provider: keyof AIConfig,
    config: Partial<AIProviderConfig>
  ) {
    this.config[provider] = {
      ...this.config[provider],
      ...config
    };
    this.validateConfig();
  }

  getAllConfig(): AIConfig {
    return this.config;
  }
}

// Export singleton instance
export const aiConfig = new AIConfigurationService();

// Export types for use in other files
export type { AIConfig, AIProviderConfig };