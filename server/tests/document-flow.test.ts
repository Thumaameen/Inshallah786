import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DocumentService } from '../services/document-service';
import { EnhancedDocumentService } from '../services/enhanced-document.service';
import { IntegratedSecurityService } from '../services/integrated-security.service';

describe('Document Generation and Download Flow', () => {
  let documentService: DocumentService;
  let enhancedService: EnhancedDocumentService;
  let securityService: IntegratedSecurityService;

  beforeEach(() => {
    documentService = new DocumentService();
    enhancedService = new EnhancedDocumentService();
    securityService = new IntegratedSecurityService();
  });

  describe('Document Generation', () => {
    it('should generate a basic document', async () => {
      const documentData = {
        documentType: 'birth_certificate',
        personalInfo: {
          fullName: 'Test User',
          idNumber: '8001015009087',
          birthDate: '1980-01-01'
        }
      };

      const doc = await documentService.generateDocument(documentData);
      expect(doc).toBeDefined();
      expect(doc.pdf).toBeDefined();
    });

    it('should add enhanced security features', async () => {
      const documentData = {
        documentType: 'passport',
        personalInfo: {
          fullName: 'Test User',
          idNumber: '8001015009087',
          birthDate: '1980-01-01',
          nationality: 'South African'
        }
      };

      const baseDoc = await documentService.generateDocument(documentData);
      const enhancedDoc = await enhancedService.generateSecureDocument(documentData.documentType, baseDoc);

      expect(enhancedDoc.securityFeatures).toBeDefined();
      expect(enhancedDoc.securityFeatures.length).toBeGreaterThan(0);
    });

    it('should validate security features', async () => {
      const documentData = {
        documentType: 'work_permit',
        personalInfo: {
          fullName: 'Test User',
          idNumber: '8001015009087',
          nationality: 'South African',
          employer: 'Test Company'
        }
      };

      const doc = await securityService.generateSecureDocument(documentData);
      const verification = await securityService.verifyAuthenticity(doc);

      expect(verification.valid).toBe(true);
      expect(verification.securityFeatures).toBeDefined();
      expect(verification.blockchainVerification).toBeDefined();
    });
  });

  describe('Download Functionality', () => {
    it('should handle standard download', async () => {
      const documentData = {
        documentType: 'birth_certificate',
        personalInfo: {
          fullName: 'Test User',
          idNumber: '8001015009087'
        }
      };

      const doc = await documentService.generateDocument(documentData);
      expect(Buffer.isBuffer(doc.pdf)).toBe(true);
    });

    it('should handle mobile download', async () => {
      const documentData = {
        documentType: 'passport',
        personalInfo: {
          fullName: 'Test User',
          idNumber: '8001015009087'
        }
      };

      const doc = await documentService.generateDocument(documentData);
      expect(Buffer.isBuffer(doc.pdf)).toBe(true);
      expect(doc.pdf.length).toBeLessThan(10 * 1024 * 1024); // Less than 10MB for mobile
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid data gracefully', async () => {
      const invalidData = {
        documentType: 'invalid_type',
        personalInfo: {
          fullName: 'Test User'
        }
      };

      await expect(documentService.generateDocument(invalidData)).rejects.toThrow();
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        documentType: 'birth_certificate',
        personalInfo: {
          // Missing required fields
        }
      };

      await expect(documentService.generateDocument(incompleteData)).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should generate documents within acceptable time', async () => {
      const documentData = {
        documentType: 'birth_certificate',
        personalInfo: {
          fullName: 'Test User',
          idNumber: '8001015009087'
        }
      };

      const startTime = Date.now();
      await documentService.generateDocument(documentData);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should take less than 5 seconds
    });
  });

  describe('Security', () => {
    it('should encrypt sensitive data', async () => {
      const documentData = {
        documentType: 'passport',
        personalInfo: {
          fullName: 'Test User',
          idNumber: '8001015009087',
          biometricData: {
            fingerprints: 'test_data'
          }
        }
      };

      const doc = await securityService.generateSecureDocument(documentData);
      expect(doc.encryptedData).toBeDefined();
      expect(typeof doc.blockchainHash).toBe('string');
    });

    it('should validate document authenticity', async () => {
      const documentData = {
        documentType: 'work_permit',
        personalInfo: {
          fullName: 'Test User',
          idNumber: '8001015009087'
        }
      };

      const doc = await securityService.generateSecureDocument(documentData);
      const verification = await securityService.verifyAuthenticity(doc);

      expect(verification.valid).toBe(true);
      expect(verification.securityFeatures.length).toBeGreaterThan(0);
    });
  });
});