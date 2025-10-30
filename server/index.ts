import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { productionConfig } from './config/production';
import { checkDatabaseConnection } from './db/connection';
import apiRoutes from './routes/api';
import { errorHandler } from './middleware/error-handler';
import { militaryGradeAuth } from './middleware/military-grade-auth';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(productionConfig.server.cors));
app.use(compression(productionConfig.server.compression));
app.use(rateLimit(productionConfig.server.rateLimit));
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

// Error handling
app.use(errorHandler);

// Start server
const PORT = productionConfig.server.port;
const HOST = productionConfig.server.host;

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Military-grade security:', productionConfig.security.militaryGrade ? 'enabled' : 'disabled');
  console.log('AI model:', productionConfig.ai.defaultModel);
});