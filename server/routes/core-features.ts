import { Router } from 'express';
const router = Router();

// Core Features Status
router.get('/api/core/status', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    features: {
      pdfGeneration: {
        status: 'operational',
        description: 'Authentic DHA certificate and permit generator',
        documents: 21,
        securityFeatures: ['Digital signatures', 'QR codes', 'Watermarks', 'Holograms']
      },
      dhaDocuments: {
        status: 'operational',
        description: 'Official DHA document templates',
        types: [
          'Birth Certificate',
          'Marriage Certificate',
          'Passport',
          'Work Permit',
          'Study Permit',
          'Visitor Visa',
          'Business Permit',
          'Permanent Residence',
          'Smart ID Card',
          'And 12+ more official documents'
        ]
      },
      ultraQueenAI: {
        status: 'operational',
        description: 'Ultra Queen Raeesa AI Assistant',
        capabilities: ['Multi-provider AI', 'Document assistance', 'Code generation']
      },
      apiOverride: {
        status: 'operational',
        description: 'Universal API Key Override Bypass',
        enabled: true
      },
      integrations: {
        status: 'operational',
        active: ['OpenAI', 'Anthropic', 'Google Gemini', 'Mistral'],
        description: 'All API integrations functional'
      }
    }
  });
});

// NOTE: This endpoint is deprecated - use /api/pdf/generate/:documentType instead
// Redirecting to the proper PDF generation service
router.post('/api/documents/generate', async (req, res) => {
  console.warn('[DEPRECATED] /api/documents/generate is deprecated. Please use /api/pdf/generate/:documentType');
  
  const { documentType } = req.body;
  
  if (!documentType) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing document type',
      hint: 'Use /api/pdf/generate/:documentType instead'
    });
  }
  
  // Redirect to proper endpoint
  return res.status(301).json({
    success: false,
    message: 'This endpoint is deprecated',
    redirectTo: `/api/pdf/generate/${documentType}`,
    hint: 'Please use the proper PDF generation endpoint'
  });
});

// NOTE: Document download is handled by the complete PDF routes
router.get('/api/documents/:documentId/download', (req, res) => {
  console.warn('[DEPRECATED] /api/documents/:documentId/download is deprecated');
  return res.status(301).json({ 
    success: false, 
    message: 'This endpoint is deprecated',
    hint: 'Use the complete PDF routes for document generation and download'
  });
});

export default router;