import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  res.json({
    status: 'operational',
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'configured' : 'not configured',
    timestamp: new Date().toISOString(),
    message: 'Ultra Queen AI Raeesa Backend is running'
  });
});

// API status endpoint
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'success',
    message: 'API is operational',
    timestamp: new Date().toISOString()
  });
});

// System status endpoint
app.get('/api/system/status', async (req, res) => {
  res.json({
    status: 'online',
    services: {
      database: process.env.DATABASE_URL ? 'available' : 'not configured',
      session: process.env.SESSION_SECRET ? 'configured' : 'not configured',
      ai: process.env.OPENAI_API_KEY ? 'configured' : 'gracefully degraded'
    },
    timestamp: new Date().toISOString()
  });
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('');
  console.log('👑 '.repeat(35));
  console.log(`✅ Ultra Queen AI Raeesa Backend Server LIVE`);
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log(`🔐 Session: ${process.env.SESSION_SECRET ? 'Configured' : 'Not configured'}`);
  console.log('👑 '.repeat(35));
  console.log('');
});
