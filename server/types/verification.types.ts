export interface AIAnalysisResult {
  score: number;
  recommendations: string[];
  validationIssues: string[];
  metadata: Record<string, any>;
  extractedFields: Record<string, any>;
  completeness: number;
  suggestions: string[];
}

export interface VerificationRecord {
  id: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  verificationResult: unknown;
  documentType: string;
  issuedAt: Date;
  verificationCode: string;
  documentNumber: string;
  documentData: string;
  isValid: boolean;
  qrCodeData: string;
  qrCodeUrl: string;
  verificationCount: number;
  documentId: string;
  revocationReason: string;
}

export interface Storage {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  getNotifications: (params?: any, options?: any) => Promise<any>;
  createSecurityEvent: (event: any) => Promise<void>;
  createSystemMetric: (metric: any) => Promise<void>;
}