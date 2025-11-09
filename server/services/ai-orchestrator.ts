
import { aiAssistantService } from './ai-assistant';
import { ultraQueenAI } from './ultra-queen-ai';
import { geminiService } from './gemini-service';
import { perplexityService } from './perplexity-service';

export class AIOrchestrator {
  async processQuery(query: string, options: {
    provider?: 'auto' | 'openai' | 'anthropic' | 'gemini' | 'perplexity';
    mode?: 'assistant' | 'agent' | 'architect';
    userId?: string;
  }) {
    const { provider = 'auto', mode = 'assistant', userId } = options;

    // Route to appropriate AI service
    if (provider === 'auto') {
      // Intelligent routing based on query type
      return await this.autoRouteQuery(query, mode, userId);
    }

    switch (provider) {
      case 'openai':
        return await aiAssistantService.processAIRequest(query, mode as any, userId);
      case 'anthropic':
        return await ultraQueenAI.process({ message: query, provider: 'anthropic' });
      case 'gemini':
        return await geminiService.generateContent(query);
      case 'perplexity':
        return await perplexityService.query(query);
      default:
        return await aiAssistantService.processAIRequest(query, mode as any, userId);
    }
  }

  private async autoRouteQuery(query: string, mode: string, userId?: string) {
    // Analyze query to determine best provider
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('code') || queryLower.includes('debug')) {
      return await ultraQueenAI.process({ message: query, provider: 'anthropic' });
    } else if (queryLower.includes('search') || queryLower.includes('latest')) {
      return await perplexityService.query(query);
    } else if (queryLower.includes('vision') || queryLower.includes('image')) {
      return await geminiService.generateContent(query);
    }
    
    return await aiAssistantService.processAIRequest(query, mode as any, userId);
  }
}

export const aiOrchestrator = new AIOrchestrator();
