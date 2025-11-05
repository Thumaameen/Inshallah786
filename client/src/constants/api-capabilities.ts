// API Capabilities Configuration

export const API_CAPABILITIES = {
  openai: {
    name: 'OpenAI GPT-4',
    icon: '🤖',
    color: '#10a37f',
    capabilities: ['text', 'vision', 'reasoning'],
    limits: { maxTokens: 128000, rateLimit: 10000 }
  },
  anthropic: {
    name: 'Anthropic Claude',
    icon: '🧠',
    color: '#d97757',
    capabilities: ['text', 'analysis', 'reasoning'],
    limits: { maxTokens: 200000, rateLimit: 5000 }
  },
  gemini: {
    name: 'Google Gemini',
    icon: '✨',
    color: '#4285f4',
    capabilities: ['text', 'vision', 'multimodal'],
    limits: { maxTokens: 1000000, rateLimit: 15000 }
  },
  mistral: {
    name: 'Mistral AI',
    icon: '🌊',
    color: '#f77f1e',
    capabilities: ['text', 'coding'],
    limits: { maxTokens: 32000, rateLimit: 5000 }
  },
  perplexity: {
    name: 'Perplexity',
    icon: '🔍',
    color: '#20808d',
    capabilities: ['text', 'search', 'research'],
    limits: { maxTokens: 16000, rateLimit: 5000 }
  },
  xai: {
    name: 'XAI Grok',
    icon: '⚡',
    color: '#000000',
    capabilities: ['text', 'realtime'],
    limits: { maxTokens: 128000, rateLimit: 5000 }
  }
};
