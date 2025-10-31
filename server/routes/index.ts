import { Router } from 'express';
import dhaMonitor from './dha-monitor.js';

const router = Router();

// Register DHA monitoring routes
router.use('/dha-monitor', dhaMonitor);

// Register other routes here
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

export default router;