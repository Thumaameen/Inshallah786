// Global type definitions
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

// API Response Types
interface AIResponse {
  success: boolean;
  content: string;
  metadata?: any;
  error?: string;
  fallback?: boolean;
  response?: string;
  suggestions?: string[];
}

interface AnalyticsResponse {
  success: boolean;
  data: {
    responseTime: number;
    errorRate: number;
    status: string;
    resources: any;
    throughput: number;
  }[];
  severity?: string;
}

// Environment Variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: string;
    DATABASE_URL: string;
    OPENAI_API_KEY: string;
    ANTHROPIC_API_KEY: string;
    SOLANA_API_KEY: string;
    POLYGON_API_KEY: string;
    // Add other environment variables as needed
  }
}

// API Provider Types
type AIProvider = 'openai' | 'anthropic' | 'mistral' | 'claude' | 'perplexity';

// Custom Window Properties
interface Window {
  ethereum?: any;
  solana?: any;
}

// Define missing API_CAPABILITIES constant
const API_CAPABILITIES = {
  ai: {
    color: '#00ff00',
    icon: 'brain',
    name: 'AI Processing',
    limits: {
      requests: 1000,
      tokens: 100000
    },
    capabilities: [
      'Text Generation',
      'Code Analysis',
      'Document Processing'
    ]
  }
} as const;