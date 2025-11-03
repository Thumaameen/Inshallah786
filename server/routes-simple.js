import express from 'express';
import aiServicesRoutes from './routes/ai-services.routes';
import documentServicesRoutes from './routes/document-services.routes';
import governmentServicesRoutes from './routes/government-services.routes';
import securityServicesRoutes from './routes/security-services.routes';

export function registerRoutes(app) {
  // AI Services
  app.use('/api/ai', aiServicesRoutes);
  
  // Document Services
  app.use('/api/documents', documentServicesRoutes);
  
  // Government Integration Services 
  app.use('/api/government', governmentServicesRoutes);
  
  // Security Services
  app.use('/api/security', securityServicesRoutes);
  
  // Root API response
  app.get('/api', (req, res) => {
    res.json({
      status: 'active',
      version: process.env.npm_package_version || '1.0.0',
      availableEndpoints: {
        ai: ['/api/ai/chat', '/api/ai/military', '/api/ai/enhanced', '/api/ai/ultra'],
        documents: ['/api/documents/edit', '/api/documents/verify', '/api/documents/blockchain/verify', '/api/documents/biometric/verify'],
        government: ['/api/government/npr', '/api/government/saps', '/api/government/abis', '/api/government/icao', '/api/government/sita', '/api/government/cipc', '/api/government/del'],
        security: ['/api/security/encrypt', '/api/security/decrypt', '/api/security/quantum', '/api/security/pki', '/api/security/hsm']
      }
    });
  });
}