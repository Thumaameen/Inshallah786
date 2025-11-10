import express from 'express';
import { ServiceHealthMonitor } from '../utils/service-health-monitor.js';
import { SystemMetrics } from '../utils/system-metrics.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const healthMonitor = new ServiceHealthMonitor();
const metrics = new SystemMetrics();

// Rate limiting for health check endpoints
const healthCheckLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30 // 30 requests per minute
});

// Basic health check
router.get('/', healthCheckLimiter, async (req, res) => {
    const status = await healthMonitor.getBasicHealth();
    res.status(status.healthy ? 200 : 503).json(status);
});

// Detailed system health
router.get('/detailed', healthCheckLimiter, async (req, res) => {
    const detailed = await healthMonitor.getDetailedHealth();
    res.status(detailed.overall.healthy ? 200 : 503).json(detailed);
});

// Service-specific health checks
router.get('/ai', healthCheckLimiter, async (req, res) => {
    const aiStatus = await healthMonitor.getAIServicesHealth();
    res.status(aiStatus.healthy ? 200 : 503).json(aiStatus);
});

router.get('/document', healthCheckLimiter, async (req, res) => {
    const docStatus = await healthMonitor.getDocumentServicesHealth();
    res.status(docStatus.healthy ? 200 : 503).json(docStatus);
});

router.get('/security', healthCheckLimiter, async (req, res) => {
    const securityStatus = await healthMonitor.getSecurityServicesHealth();
    res.status(securityStatus.healthy ? 200 : 503).json(securityStatus);
});

// System metrics
router.get('/metrics', healthCheckLimiter, async (req, res) => {
    const systemMetrics = await metrics.getMetrics();
    res.json(systemMetrics);
});

// Service readiness
router.get('/ready', healthCheckLimiter, async (req, res) => {
    const readiness = await healthMonitor.getReadinessStatus();
    res.status(readiness.ready ? 200 : 503).json(readiness);
});

export default router;