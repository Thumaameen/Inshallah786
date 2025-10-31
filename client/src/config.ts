export const config = {
  apiBaseUrl: import.meta.env.PROD 
    ? 'https://inshallah.onrender.com' // Render production URL
    : 'http://localhost:5000',
  apiTimeout: 60000, // Increased timeout for production
  enableDebug: import.meta.env.DEV,
  wsUrl: import.meta.env.PROD
    ? `wss://inshallah.onrender.com`
    : 'ws://localhost:5000',
  retryAttempts: 3,
  retryDelay: 1000,
  maxConcurrentRequests: 10
};

// API Configuration with full integration support
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const API_CONFIG = {
  // AI Provider Endpoints
  openai: {
    enabled: true,
    endpoint: '/api/ai/chat',
    model: 'gpt-4-turbo-preview'
  },
  anthropic: {
    enabled: true,
    endpoint: '/api/ai/claude',
    model: 'claude-3-opus-20240229'
  },
  mistral: {
    enabled: true,
    endpoint: '/api/ai/mistral',
    model: 'mistral-large-latest'
  },
  google: {
    enabled: true,
    endpoint: '/api/ai/gemini',
    model: 'gemini-pro'
  },
  perplexity: {
    enabled: true,
    endpoint: '/api/ai/perplexity',
    model: 'pplx-70b-online'
  },

  // Web Services
  github: {
    enabled: true,
    endpoint: '/api/integrations/github'
  },
  stripe: {
    enabled: true,
    endpoint: '/api/payments/stripe'
  },
  twilio: {
    enabled: true,
    endpoint: '/api/communications/twilio'
  },
  sendgrid: {
    enabled: true,
    endpoint: '/api/communications/sendgrid'
  },

  // Blockchain
  ethereum: {
    enabled: true,
    endpoint: '/api/blockchain/ethereum'
  },
  polygon: {
    enabled: true,
    endpoint: '/api/blockchain/polygon'
  },
  solana: {
    enabled: true,
    endpoint: '/api/blockchain/solana'
  },

  // Government APIs
  dha: {
    npr: {
      enabled: true,
      endpoint: '/api/government/dha/npr'
    },
    abis: {
      enabled: true,
      endpoint: '/api/government/dha/abis'
    }
  },
  saps: {
    enabled: true,
    endpoint: '/api/government/saps/crc'
  },
  icao: {
    enabled: true,
    endpoint: '/api/government/icao/pkd'
  },

  // Cloud Platforms
  railway: {
    enabled: true,
    ready: true
  },
  render: {
    enabled: true,
    ready: true
  },
  aws: {
    enabled: true,
    endpoint: '/api/cloud/aws'
  },
  azure: {
    enabled: true,
    endpoint: '/api/cloud/azure'
  },
  gcp: {
    enabled: true,
    endpoint: '/api/cloud/gcp'
  }
};