// Shared API Response Types for DHA Digital Services

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AIResponse {
  success: boolean;
  content: string;
  provider?: string;
  metadata?: any;
  providers?: string[];
  error?: string;
  fallback?: boolean;
  response?: string;
  suggestions?: string[];
}

export interface DocumentResponse {
  success: boolean;
  documentId?: string;
  url?: string;
  error?: string;
  message?: string;
}

export interface AnalyticsResponse {
  success: boolean;
  anomalies?: Array<{
    severity: string;
    [key: string]: any;
  }>;
  recommendations?: string[];
  error?: string;
}

export interface VerificationResponse {
  success: boolean;
  verified: boolean;
  code?: string;
  error?: string;
  message?: string;
}
