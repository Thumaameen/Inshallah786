// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Blockchain Types
export interface BlockchainConfig {
  provider: 'solana' | 'ethereum' | 'polygon';
  network: 'mainnet' | 'testnet' | 'devnet';
  rpcUrl: string;
}

export interface TransactionResponse {
  hash: string;
  blockNumber: number;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
}

// AI Service Types
export interface AIConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  apiKey: string;
}

export interface AIResponse {
  success: boolean;
  content: string;
  metadata?: any;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Cloud Storage Types
export interface CloudStorageConfig {
  provider: 'azure' | 'gcp';
  container?: string;
  bucket?: string;
  region: string;
}

export interface FileUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: {
    size: number;
    contentType: string;
    lastModified: string;
  };
}

// Analytics Types
export interface AnalyticsResponse {
  success: boolean;
  metrics: {
    responseTime: number;
    errorRate: number;
    throughput: number;
    status: 'healthy' | 'degraded' | 'critical';
  };
  resources: {
    cpu: number;
    memory: number;
    storage: number;
  };
  anomalies?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

// Document Types
export interface DocumentConfig {
  type: string;
  template: string;
  validation: Record<string, any>;
}

export interface DocumentResponse {
  success: boolean;
  documentId?: string;
  url?: string;
  error?: string;
  metadata?: {
    type: string;
    createdAt: string;
    expiresAt?: string;
    status: 'draft' | 'pending' | 'approved' | 'rejected';
  };
}

// Authentication Types
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
  error?: string;
}

