import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { documentVerificationService } from '../services/document-verification.service';
import { web3Service } from '../services/web3.service';
import { ultraAI } from '../services/ultra-ai.service';
import { apiConfig } from '../../config/production-api.config';

const router = express.Router();

// Type definitions
interface VerificationResult {
  success: boolean;
  verified: boolean;
  documentId?: string;
  verificationId?: string;
  timestamp?: string;
  error?: string;
}

interface BlockchainVerificationResult {
  polygon: boolean;
  solana: boolean;
  timestamp: string;
  error?: string;
}

interface GovernmentVerificationRequest {
  documentId: string;
  verificationLevel: 'basic' | 'enhanced' | 'full';
  metadata?: Record<string, any>;
}

interface GovernmentVerificationResponse {
  status: 'success' | 'failure';
  verificationId?: string;
  error?: string;
}

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', environment: 'production' });
});

// Document verification endpoints
router.post(
  '/documents/verify',
  [authMiddleware.validateApiKey, authMiddleware.validateGovernmentAccess],
  async (req: Request, res: Response<VerificationResult>) => {
    try {
      const verificationResult = await documentVerificationService.verifyDocument(req.body);
      res.json({
        success: true,
        verified: verificationResult.verified,
        documentId: verificationResult.id,
        timestamp: verificationResult.timestamp
      });
    } catch (error) {
      console.error('[Document Verification] Error:', error);
      res.status(500).json({
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Document verification failed'
      });
    }
  }
);

// Blockchain verification endpoints
router.post(
  '/blockchain/verify',
  [authMiddleware.validateApiKey, authMiddleware.validateGlobalAccess],
  async (req: Request<{}, {}, { documentHash: string }>, res: Response<BlockchainVerificationResult>) => {
    try {
      const { documentHash } = req.body;
      if (!documentHash) {
        return res.status(400).json({
          polygon: false,
          solana: false,
          timestamp: new Date().toISOString(),
          error: 'Document hash is required'
        });
      }
      const result = await web3Service.verifyDocumentOnChain(documentHash);
      res.json({
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[Blockchain Verification] Error:', error);
      res.status(500).json({
        polygon: false,
        solana: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Blockchain verification failed'
      });
    }
  }
);

// AI service endpoints
router.post(
  '/ai/analyze',
  [authMiddleware.validateApiKey],
  async (req: Request, res: Response) => {
    try {
      const result = await ultraAI.processDocument(req.body);
      if (!result) {
        return res.status(400).json({
          success: false,
          error: 'Analysis failed - invalid input',
          details: 'Please provide valid document data'
        });
      }
      res.json({
        success: true,
        result,
        metadata: {
          confidence: result.confidence,
          processingTime: result.processingTime
        }
      });
    } catch (error) {
      console.error('[AI Analysis] Error:', error);
      res.status(500).json({
        success: false,
        error: 'AI analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
);

// Government integration endpoints
router.post(
  '/government/verify',
  [authMiddleware.validateApiKey, authMiddleware.validateGovernmentAccess],
  async (req: Request<{}, {}, GovernmentVerificationRequest>, res: Response<GovernmentVerificationResponse>) => {
    try {
      const { documentId, verificationLevel, metadata } = req.body;

      if (!documentId || !verificationLevel) {
        return res.status(400).json({
          status: 'failure',
          error: 'Document ID and verification level are required'
        });
      }

      const verificationResult = await documentVerificationService.verifyWithGovernment({
        documentId,
        verificationLevel,
        metadata
      });

      res.json({
        status: 'success',
        verificationId: verificationResult.id
      });
    } catch (error) {
      console.error('[Government Verification] Error:', error);
      res.status(500).json({
        status: 'failure',
        error: error instanceof Error ? error.message : 'Government verification failed'
      });
    }
  }
);

export default router;