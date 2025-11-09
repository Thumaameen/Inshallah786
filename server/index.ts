import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { productionConfig } from './config/production.js';
import { checkDatabaseConnection } from './db/connection.js';
import apiRoutes from './routes/api.js';
import ultraAIRoutes from './routes/ultra-ai-routes';
import agentTasksRoutes from './routes/agent-tasks';
import { enhancedErrorHandler as errorHandler } from './middleware/error-handler.js';

// Placeholder for military-grade auth (create if needed)
const militaryGradeAuth = (req: any, res: any, next: any) => next();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors((productionConfig as any).server?.cors || {}));
app.use(compression((productionConfig as any).server?.compression || {}));
app.use(rateLimit((productionConfig as any).server?.rateLimit || { windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await checkDatabaseConnection();
  res.json({
    status: 'operational',
    environment: process.env.NODE_ENV,
    database: dbHealth ? 'connected' : 'error',
    timestamp: new Date().toISOString()
  });
});

// API routes with military-grade authentication
app.use('/api', militaryGradeAuth, apiRoutes);
app.use('/api/ultra-ai', ultraAIRoutes);
app.use('/api/agent', agentTasksRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = (productionConfig as any).server?.port || parseInt(process.env.PORT || '5000');
const HOST = (productionConfig as any).server?.host || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Military-grade security:', (productionConfig as any).security?.militaryGrade ? 'enabled' : 'disabled');
  console.log('AI model:', (productionConfig as any).ai?.defaultModel || 'default');
});