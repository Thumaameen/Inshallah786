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
