export const AI_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    organization: process.env.OPENAI_ORG_ID || ''
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || ''
  },
  mistral: {
    apiKey: process.env.MISTRAL_API_KEY || ''
  },
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY || ''
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || ''
  },
  defaultModel: 'gpt-4o'
};
