import { Router } from 'express';
import multer from 'multer';
import { dhaDocumentGenerator } from '../services/dha-document-generator.service.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get available document types
router.get('/types', (req, res) => {
  const status = dhaDocumentGenerator.getStatus();
  res.json({
    success: true,
    documentTypes: status.documentTypes
  });
});

// Generate document
router.post('/generate', upload.single('template'), async (req, res) => {
  const {
    type,
    data: documentData,
    userEmail
  } = req.body;

  try {
    const data = typeof documentData === 'string' ? JSON.parse(documentData) : documentData;

    const result = await dhaDocumentGenerator.generate({
      type,
      data,
      template: req.file?.buffer.toString(),
      userEmail
    });

    if (!result.success || !result.document) {
      throw new Error(result.error || 'Document generation failed');
    }

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="DHA-${type}-${result.document.metadata.referenceNumber}.pdf"`
    );

    // Send PDF buffer
    res.send(result.document.buffer);
  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Document generation failed'
    });
  }
});

// Verify document
router.get('/verify/:reference', async (req, res) => {
  try {
    const result = await dhaDocumentGenerator.verify(req.params.reference);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Document verification error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed'
    });
  }
});

export default router;