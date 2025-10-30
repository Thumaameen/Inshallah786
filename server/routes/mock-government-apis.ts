/**
 * PRODUCTION ONLY - REAL GOVERNMENT APIS
 * All mock/simulation endpoints have been removed
 * This file now only handles production government API routing
 */

import express, { Request, Response, Router } from 'express';

const router = Router();

// All mock endpoints removed - production requires real government API credentials
router.all('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Mock APIs disabled in production',
    message: 'Please configure real government API credentials in environment variables'
  });
});

export default router;