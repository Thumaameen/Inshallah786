import express from 'express';
import { monitoringService } from './monitoring-service.js';

const router = express.Router();

// Get current metrics
router.get('/metrics', (req, res) => {
  const metrics = monitoringService.getMetrics();
  res.json(metrics);
});

// Get system health status
router.get('/health', (req, res) => {
  const metrics = monitoringService.getMetrics();
  const systemMetrics = metrics.system;

  const health = {
    status: 'healthy',
    timestamp: Date.now(),
    checks: {
      memory: {
        status: systemMetrics?.memory?.usagePercent < 85 ? 'healthy' : 'warning',
        value: systemMetrics?.memory?.usagePercent
      },
      cpu: {
        status: systemMetrics?.cpu?.loadAvg[0] < 80 ? 'healthy' : 'warning',
        value: systemMetrics?.cpu?.loadAvg[0]
      },
      responseTime: {
        status: 'healthy',
        averages: metrics.requests.responseTime
      }
    }
  };

  res.json(health);
});

export const monitoringRoutes = router;