import express from 'express';
import { aiAssistantService } from '../services/ai-assistant';
import { ultraQueenAI } from '../services/ultra-queen-ai';
import { militaryGradeAuth } from '../middleware/military-grade-auth';
import { rateLimiter } from '../middleware/rate-limiter';
import { errorHandler } from '../middleware/error-handler';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', environment: process.env.NODE_ENV });
});

// AI Assistant endpoints
router.post('/ai/chat', rateLimiter, async (req, res, next) => {
  try {
    const response = await aiAssistantService.generateResponse(
      req.body.message,
      req.body.userId,
      req.body.conversationId,
      true,
      {
        language: req.body.language,
        enablePIIRedaction: true,
        adminMode: req.body.adminMode,
        militaryMode: req.body.militaryMode
      }
    );
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Ultra Queen AI endpoints
router.post('/ultra/process', militaryGradeAuth, async (req, res, next) => {
  try {
    const result = await ultraQueenAI.processRequest({
      message: req.body.message,
      userId: req.body.userId,
      accessLevel: req.body.accessLevel,
      unlimitedCapabilities: true,
      militaryGradeAccess: true
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Document processing endpoints
router.post('/documents/analyze', militaryGradeAuth, async (req, res, next) => {
  try {
    const analysis = await ultraQueenAI.analyzeDocument(req.body.document);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// Error handling
router.use(errorHandler);

export default router;