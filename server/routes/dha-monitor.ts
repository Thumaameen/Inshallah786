import express from 'express';
import { DHAServicesGuarantee } from '../services/dha-services-guarantee.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const dhaGuarantee = DHAServicesGuarantee.getInstance();

// Initialize DHA services on startup
(async () => {
  try {
    await dhaGuarantee.initializeServices();
    logger.info('🚀 DHA Services Guarantee System activated');
  } catch (error) {
    logger.error('❌ Failed to initialize DHA Services Guarantee System:', error);
    process.exit(1); // Exit if critical services can't be initialized
  }
})();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const status = await dhaGuarantee.verifyAllServices();
    const allServicesHealthy = Object.values(status).every(Boolean);

    res.json({
      status: allServicesHealthy ? 'healthy' : 'degraded',
      services: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check services health',
      timestamp: new Date().toISOString()
    });
  }
});

// Force service recovery endpoint
router.post('/recover/:service', async (req, res) => {
  const { service } = req.params;
  
  try {
    const recovered = await dhaGuarantee.forceServiceRecovery(service);
    
    if (recovered) {
      res.json({
        status: 'success',
        message: `${service} recovered successfully`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: `Failed to recover ${service}`,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error(`Service recovery failed for ${service}:`, error);
    res.status(500).json({
      status: 'error',
      message: `Recovery attempt failed for ${service}`,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;