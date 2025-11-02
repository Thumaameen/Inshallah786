
import { Router } from 'express';

const router = Router();

// ALL MOCK APIS PERMANENTLY DISABLED FOR PRODUCTION
// This file exists only to prevent import errors
// All routes return 501 Not Implemented

router.all('*', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Mock APIs are permanently disabled in production',
    message: 'This deployment uses only real government API credentials configured in environment variables.',
    deployment: 'production',
    timestamp: new Date().toISOString()
  });
});

export default router;
