declare module '@/types/api' {
  export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }

  export interface MonitoringData {
    responseTime: number;
    errorRate: number;
    status: string;
    resources: {
      cpu: number;
      memory: number;
      disk: number;
      network: number;
    };
    throughput: number;
  }

  export interface AIResponse {
    success: boolean;
    content: string;
    error?: string;
    provider?: AIProvider;
    metadata?: {
      executionTime?: number;
      confidence?: number;
      model?: string;
      quantumEnhanced?: boolean;
    };
    providers?: Array<{
      name: string;
      content: string;
      confidence: number;
      executionTime: number;
    }>;
  }

  export type AIProvider = 'auto' | 'openai' | 'anthropic' | 'perplexity' | 'mistral' | 'quantum';

  export interface AnalyticsResponse {
    success: boolean;
    error?: string;
    data: Array<{
      severity: string;
      message: string;
      timestamp: string;
      [key: string]: any;
    }>;
  }
}