import { ComponentType } from 'react';

export interface DocumentTypeInfo {
  type: string;
  displayName: string;
  description: string;
  category: string;
  formNumber: string;
  icon: ComponentType<any>;
  color: string;
  isImplemented: boolean;
}

export interface DocumentGenerationRequest {
  documentType: string;
  fullName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  idNumber?: string;
  passportNumber?: string;
  passportType?: 'ordinary' | 'diplomatic' | 'official';
  dateOfIssue?: string;
  dateOfExpiry?: string;
  placeOfIssue?: string;
  [key: string]: any;
}

export interface DocumentTemplate {
  id: string;
  type: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  formNumber: string;
  icon: string;
  color: string;
  isImplemented: boolean;
  requirements: string[];
  securityFeatures: string[];
  processingTime: string;
  fees: string;
}

export interface TemplatesResponse {
  success: boolean;
  totalTemplates: number;
  templates: DocumentTemplate[];
  categories: Record<string, {
    name: string;
    icon: string;
    color: string;
    count: number;
  }>;
  timestamp: string;
  message: string;
}

export interface DocumentValidationError {
  field: string;
  message: string;
}

export interface DocumentGenerationResult {
  success: boolean;
  documentId?: string;
  documentUrl?: string;
  verificationCode?: string;
  message?: string;
  error?: string;
  metadata?: Record<string, any>;
  securityFeatures?: {
    enabled?: string[];
    totalCount?: number;
  };
}