import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { registerRoutes } from './routes-simple.js';

// Load environment variables first
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🚀 DHA Digital Services Platform - Production Server');
console.log('🇿🇦 Department of Home Affairs - Implementation');
console.log('='.repeat(60));

const PORT = parseInt(process.env.PORT || '5000');
const HOST = '0.0.0.0';

// Create Express app and HTTP server
const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.openai.com"],
    },
  },
}));

app.use(compression());
app.use(cors({
  origin: ['https://*.replit.app', 'https://*.replit.dev', 'https://*.onrender.com'],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Register routes
registerRoutes(app);

// API status endpoint for non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.json({
      message: 'DHA Digital Services API',
      version: '2.0.0',
      status: 'running',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth/login, /api/auth/register',
        ai: '/api/ai/chat'
      }
    });
  }
});

// Start server
server.listen(PORT, HOST, () => {
  console.log(`\n✅ Server running on http://${HOST}:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Ready to accept connections\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
