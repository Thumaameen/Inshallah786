import { Router } from 'express';
import { ultraQueenAI, AI_INTERFACE_STYLE, AI_POWER_LEVEL } from '../services/ultra-queen-ai.service';
import { ultraPDFEditor } from '../services/ultra-pdf-editor.service';
import { globalDocumentVerification } from '../services/global-document-verification.service';
import { integratedSecurityService } from '../services/integrated-security.service';

const router = Router();

// Enhanced AI with multiple interface styles
router.post('/ai/process', async (req, res) => {
  try {
    const { input, style = AI_INTERFACE_STYLE.UNLIMITED, powerLevel = AI_POWER_LEVEL.QUANTUM } = req.body;
    
    const response = await ultraQueenAI.processUnlimited(input, style);
    res.json(response);
  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Document generation and verification
router.post('/documents/generate', async (req, res) => {
  try {
    const { documentType, data } = req.body;
    
    // Verify document data
    const verificationResult = await globalDocumentVerification.verifyDocument(data);
    if (!verificationResult.valid) {
      throw new Error('Document verification failed');
    }

    // Generate enhanced PDF
    const pdfBuffer = await ultraPDFEditor.enhancePDF({
      text: data.textContent,
      images: data.images,
      watermark: { text: 'OFFICIAL DHA DOCUMENT' },
      security: {
        userPassword: data.userPassword,
        ownerPassword: process.env.DOCUMENT_OWNER_PASSWORD,
        permissions: {
          printing: true,
          modifying: false,
          copying: false,
          annotating: false
        }
      },
      verification: {
        blockchain: true,
        quantum: true,
        government: true
      }
    });

    // Apply integrated security
    const secureDocument = await integratedSecurityService.generateSecureDocument(data);

    res.json({
      success: true,
      document: {
        buffer: pdfBuffer.toString('base64'),
        verificationId: verificationResult.blockchainRecord.id,
        securityFeatures: secureDocument.securityFeatures,
        quantumSignature: verificationResult.quantumSignature
      }
    });
  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Document verification
router.post('/documents/verify', async (req, res) => {
  try {
    const { document } = req.body;
    
    const isAuthentic = await globalDocumentVerification.validateAuthenticDocument(document);
    
    res.json({
      valid: isAuthentic,
      verifiedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Document verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;