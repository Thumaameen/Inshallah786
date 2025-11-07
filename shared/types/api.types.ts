export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: number;
}

export interface BlockchainConfig {
  networkUrl: string;
  contractAddress: string;
  privateKey: string;
}

export interface TransactionResponse {
  hash: string;
  status: boolean;
  blockNumber: number;
}

export interface AIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AIResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface CloudStorageConfig {
  bucket: string;
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface FileUploadResponse {
  url: string;
  key: string;
  size: number;
}

export interface AnalyticsResponse {
  count: number;
  metrics: Record<string, number>;
  period: string;
}

export interface DocumentConfig {
  template: string;
  data: Record<string, any>;
  format: string;
}

export interface DocumentResponse {
  id: string;
  url: string;
  metadata: Record<string, any>;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    roles: string[];
  };
}