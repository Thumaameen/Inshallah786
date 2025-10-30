import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { registerRoutes } from './routes-simple.js';
import fs from 'fs';

// Load environment variables first
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const lockFile = path.join(__dirname, '../../server-running.lock');

// Clean up lock file on startup
if (fs.existsSync(lockFile)) {
  fs.unlinkSync(lockFile);
}

// Create Express app and HTTP server
const app = express();
const server = createServer(app);

// Server configuration
const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Security middleware - Production-hardened CSP
const isProduction = process.env.NODE_ENV === 'production';
const isRenderDeployment = process.env.RENDER === 'true';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // For Render production, allow inline styles only for Vite-bundled CSS; for Replit dev, keep unsafe-inline
      styleSrc: isRenderDeployment ? ["'self'", "https://fonts.googleapis.com"] : ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      // For Render production, remove unsafe-inline; for Replit dev, keep for HMR
      scriptSrc: isRenderDeployment ? ["'self'"] : ["'self'", "'unsafe-inline'", "https://replit.com"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.anthropic.com", "wss:", "ws:"],
    },
  },
}));

app.use(compression());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://dha-thisone.onrender.com',
      'http://localhost:5000',
      'http://localhost:3000'
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Temporarily allow all origins in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Register routes
registerRoutes(app);

// Add monitoring middleware and routes (non-intrusive)
import { monitoringMiddleware } from './monitoring/monitoring-middleware.js';
import { monitoringRoutes } from './monitoring/monitoring-routes.js';
app.use(monitoringMiddleware); // Add monitoring without affecting existing routes
app.use('/api/monitor', monitoringRoutes); // Add monitoring endpoints

// Serve static files in production
const staticPath = join(process.cwd(), 'dist/public');

// Check if dist exists, if not serve API-only mode
if (fs.existsSync(staticPath)) {
  console.log('✅ Serving static files from:', staticPath);

  // Serve static files with no-cache headers for development
  app.use(express.static(staticPath, {
    maxAge: 0,
    etag: false,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }));

  // Serve React app for non-API routes (SPA fallback)
  app.get('*', (req, res) => {
    // Don't serve HTML for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }

    // Serve index.html for all other routes (React Router will handle routing)
    const indexPath = join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(503).send(`
        <html>
          <head><title>DHA Services - Building</title></head>
          <body style="font-family: Arial; padding: 40px; background: #0a0a0a; color: white;">
            <h1>🇿🇦 DHA Digital Services</h1>
            <p>⚠️ Frontend is being built...</p>
            <p>API is running at <a href="/api/health" style="color: #4CAF50;">/api/health</a></p>
          </body>
        </html>
      `);
    }
  });
} else {
  console.log('⚠️  Frontend not built - serving API-only mode');
  console.log('💡 Run: ./build-client.sh or npm run build:client');

  // Serve helpful message for non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }

    res.send(`
      <html>
        <head><title>DHA API Server</title></head>
        <body style="font-family: Arial; padding: 40px; background: #0a0a0a; color: white;">
          <h1>🇿🇦 DHA Digital Services API Server</h1>
          <p>✅ Server is running successfully</p>
          <p>⚠️ Frontend not built yet</p>
          <p>Run: <code>./build-client.sh</code> or <code>npm run build:client</code></p>
          <h2>Available API Endpoints:</h2>
          <ul>
            <li><a href="/api/health" style="color: #4CAF50;">/api/health</a> - Health check</li>
            <li>/api/ai/chat - AI Assistant</li>
            <li>/api/auth/* - Authentication</li>
            <li>/api/documents/* - Document services</li>
          </ul>
        </body>
      </html>
    `);
  });
}

// Start server
server.listen(PORT, HOST, () => {
  console.log('\n🚀 DHA Digital Services Platform - Production Server');
  console.log('🇿🇦 Department of Home Affairs - Implementation');
  console.log('='.repeat(60));
  console.log(`\n✅ Server running on http://${HOST}:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Ready to accept connections\n`);
});

// Graceful shutdown
process.on('exit', () => {
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
  }
});

process.on('SIGTERM', () => {
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
  }
  process.exit(0);
});