import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { documentVerificationService } from '../services/document-verification.service';
import { web3Service } from '../services/web3.service';
import { ultraAI } from '../services/ultra-ai.service';
import { apiConfig } from '../../config/production-api.config';
import multer from 'multer';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Initialize AI clients with fallback
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

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

// Get available AI providers
router.get('/ai/providers', (req, res) => {
  const providers = {
    'gpt-4o': { available: !!openai, name: 'GPT-4 Optimized', provider: 'openai' },
    'gpt-4-turbo': { available: !!openai, name: 'GPT-4 Turbo', provider: 'openai' },
    'claude-3.5-sonnet': { available: !!anthropic, name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
    'claude-3-opus': { available: !!anthropic, name: 'Claude 3 Opus', provider: 'anthropic' },
    'claude-3-sonnet': { available: !!anthropic, name: 'Claude 3 Sonnet', provider: 'anthropic' }
  };

  res.json({ success: true, providers });
});

// Multi-provider AI chat with file upload
router.post('/ai/chat', upload.array('files', 10), async (req, res) => {
  try {
    const { message, model = 'gpt-4o', mode = 'assistant' } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message required' });
    }

    let response = null;
    let usedModel = model;

    // Handle file attachments
    let fileContext = '';
    if (files && files.length > 0) {
      fileContext = `\n\nAttached files: ${files.map(f => f.originalname).join(', ')}`;
    }

    const fullMessage = message + fileContext;

    // Route to appropriate AI provider
    if (model.startsWith('gpt-') && openai) {
      const completion = await openai.chat.completions.create({
        model: model === 'gpt-4o' ? 'gpt-4o' : 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant for the DHA Digital Services Platform.' },
          { role: 'user', content: fullMessage }
        ],
        max_tokens: 4000
      });
      response = completion.choices[0].message.content;
    } else if (model.startsWith('claude-') && anthropic) {
      const completion = await anthropic.messages.create({
        model: model === 'claude-3.5-sonnet' ? 'claude-3-5-sonnet-20241022' : 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [{ role: 'user', content: fullMessage }]
      });
      response = completion.content[0].type === 'text' ? completion.content[0].text : '';
    } else {
      return res.status(503).json({ success: false, error: 'Selected AI model not available' });
    }

    res.json({
      success: true,
      content: response,
      model: usedModel,
      filesProcessed: files?.length || 0
    });
  } catch (error: any) {
    console.error('AI Chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;