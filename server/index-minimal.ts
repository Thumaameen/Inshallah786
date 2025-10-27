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

// Serve static files in production
const staticPath = join(process.cwd(), 'dist/public');
const fs = await import('fs');

// Check if dist exists, if not serve API-only mode
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  
  // Serve React app for non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      const indexPath = join(staticPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.send('<h1>DHA API Server Running</h1><p>Frontend not built yet. API endpoints available at /api/*</p>');
      }
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
} else {
  console.log('⚠️  Frontend not built - serving API-only mode');
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.send(`
        <html>
          <head><title>DHA API Server</title></head>
          <body style="font-family: Arial; padding: 40px; background: #0a0a0a; color: white;">
            <h1>🇿🇦 DHA Digital Services API Server</h1>
            <p>✅ Server is running successfully</p>
            <p>⚠️ Frontend not built yet</p>
            <p>Run: <code>npm run build:client</code> to build the frontend</p>
            <h2>Available API Endpoints:</h2>
            <ul>
              <li>/api/health - Health check</li>
              <li>/api/ai/chat - AI Assistant</li>
              <li>/api/auth/* - Authentication</li>
              <li>/api/documents/* - Document services</li>
            </ul>
          </body>
        </html>
      `);
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
}

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
