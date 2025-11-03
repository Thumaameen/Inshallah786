import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { aiConfig } from '../config/ai-configuration.js';

export interface AIProviderResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed?: number;
  executionTime: number;
}

class AIProviderService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private mistralClient: any = null; // Add proper Mistral client type
  private googleClient: any = null; // Add proper Google client type
  private perplexityClient: any = null; // Add proper Perplexity client type

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize OpenAI
    if (aiConfig.isProviderEnabled('openai')) {
      this.openai = new OpenAI({
        apiKey: aiConfig.getProviderConfig('openai').apiKey
      });
    }

    // Initialize Anthropic
    if (aiConfig.isProviderEnabled('anthropic')) {
      this.anthropic = new Anthropic({
        apiKey: aiConfig.getProviderConfig('anthropic').apiKey
      });
    }

    // Initialize other providers similarly
    // TODO: Add initialization for Mistral, Google, and Perplexity
  }

  async processWithOpenAI(
    message: string,
    model = 'gpt-4-turbo-preview'
  ): Promise<AIProviderResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const start = Date.now();
    const response = await this.openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: message }],
      temperature: aiConfig.getProviderConfig('openai').temperature || 0.7,
      max_tokens: aiConfig.getProviderConfig('openai').maxTokens || 4096
    });

    return {
      content: response.choices[0]?.message?.content || '',
      provider: 'openai',
      model,
      tokensUsed: response.usage?.total_tokens,
      executionTime: Date.now() - start
    };
  }

  async processWithAnthropic(
    message: string,
    model = 'claude-3-sonnet-20240229'
  ): Promise<AIProviderResponse> {
    if (!this.anthropic) throw new Error('Anthropic not initialized');

    const start = Date.now();
    const response = await this.anthropic.messages.create({
      model,
      max_tokens: aiConfig.getProviderConfig('anthropic').maxTokens || 4096,
      messages: [{ role: 'user', content: message }],
      system: "You are a helpful AI assistant."
    });

    const content = typeof response.content === 'string' 
      ? response.content 
      : Array.isArray(response.content)
        ? response.content[0]?.type === 'text'
          ? response.content[0].text
          : JSON.stringify(response.content[0])
        : '';

    return {
      content,
      provider: 'anthropic',
      model,
      executionTime: Date.now() - start
    };
  }

  async processWithBestProvider(message: string): Promise<AIProviderResponse> {
    const enabledProviders = aiConfig.getEnabledProviders();
    if (enabledProviders.length === 0) {
      throw new Error('No AI providers are enabled');
    }

    // For now, prefer OpenAI > Anthropic > Others
    if (enabledProviders.includes('openai')) {
      return this.processWithOpenAI(message);
    }
    if (enabledProviders.includes('anthropic')) {
      return this.processWithAnthropic(message);
    }

    throw new Error('No suitable AI provider available');
  }

  async process(
    message: string,
    provider?: string,
    model?: string
  ): Promise<AIProviderResponse> {
    if (!provider || provider === 'auto') {
      return this.processWithBestProvider(message);
    }

    switch (provider) {
      case 'openai':
        return this.processWithOpenAI(message, model);
      case 'anthropic':
        return this.processWithAnthropic(message, model);
      // Add other provider implementations
      default:
        throw new Error(`Provider ${provider} not implemented`);
    }
  }

  getStatus() {
    const enabledProviders = aiConfig.getEnabledProviders();
    const status = {
      totalProviders: enabledProviders.length,
      providers: enabledProviders.map(provider => ({
        name: provider,
        models: aiConfig.getProviderModels(provider),
        enabled: true
      }))
    };

    return status;
  }
}

// Export singleton instance
export const aiProvider = new AIProviderService();