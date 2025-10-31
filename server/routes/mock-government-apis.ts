
/**
 * PRODUCTION ONLY - NO MOCK APIs
 * All endpoints disabled - use real government API credentials only
 */

import { Router, Request, Response } from 'express';

const router = Router();

// All endpoints return 410 Gone - mocks permanently disabled
router.all('*', (req: Request, res: Response) => {
  res.status(410).json({
    success: false,
    error: 'Mock APIs permanently disabled',
    message: 'Production deployment requires real government API credentials. All API keys must be configured in environment variables.',
    requiredKeys: [
      'DHA_NPR_API_KEY',
      'DHA_ABIS_API_KEY', 
      'SAPS_CRC_API_KEY',
      'ICAO_PKD_API_KEY'
    ]
  });
});

export default router;
