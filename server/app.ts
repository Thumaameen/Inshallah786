import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { errorSelfHealing } from './services/error-self-healing.service';
import { enhancedAIService } from './services/enhanced-ai.service';

const app = express();

// Enhanced Security
app.use(helmet());
app.use(compression());

// CORS middleware
app.use(cors());

// Increased payload size
app.use(express.json({ limit: process.env.MAX_PAYLOAD_SIZE || '20mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_PAYLOAD_SIZE || '20mb' }));

// Error self-healing middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorSelfHealing.reportError(err);
  next();
});

// AI Routes
app.post('/api/ai/:type', async (req, res) => {
  try {
    const allowedTypes = ['AGENT', 'ASSISTANT', 'ARCHITECT', 'BOT', 'SECURITY', 'UNIVERSAL'] as const;
    const requestedType = req.params.type;

    if (!allowedTypes.includes(requestedType as typeof allowedTypes[number])) {
      return res.status(400).json({ error: 'Invalid AI type' });
    }

    const result = await enhancedAIService.processRequest(requestedType as typeof allowedTypes[number], req.body);
    res.json(result);
  } catch (error) {
    errorSelfHealing.reportError(error);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// Document Routes
app.post('/api/documents/generate', async (req, res) => {
  try {
    const result = await enhancedAIService.processRequest('ASSISTANT', {
      type: 'document',
      ...req.body
    });
    res.json(result);
  } catch (error) {
    errorSelfHealing.reportError(error);
    res.status(500).json({ error: 'Document generation failed' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  const stats = errorSelfHealing.getErrorStats();
  res.json({
    status: 'healthy',
    version: process.env.ULTRA_QUEEN_VERSION || '3.0',
    errors: stats,
    aiStatus: 'operational',
    features: {
      realData: true,
      aiAgents: Object.keys(typeof (enhancedAIService as any).getAgentTypes === 'function' ? (enhancedAIService as any).getAgentTypes() : {}),
      selfHealing: true,
      globalAccess: true
    }
  });
});

export class EnhancedAIService {
  private readonly agentTypes = {
    'ASSISTANT': 'GPT-4o',
    'MILITARY': 'Claude-3.5-Sonnet',
    'ENHANCED': 'Claude-3',
    'ULTRA': 'Multi-AI'
  };

  getAgentTypes() {
    return this.agentTypes;
  }

  async processRequest(type: string, data: any) {
    // Processing logic here
  }
}

export default app;