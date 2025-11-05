import { Router } from 'express';
import { documentDownloadService } from '../services/document-download.service';
import { documentGenerator } from '../services/document-generator';
import { enhancedDocumentService } from '../services/enhanced-document.service';

const router = Router();

// Generate and download document
router.post('/generate/:documentType', async (req: { params: { documentType: any; }; body: any; }, res: { json: (arg0: { success: boolean; message: string; downloadUrl: string; mobileDownloadUrl: string; documentId: any; }) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; message: any; }): void; new(): any; }; }; }) => {
  try {
    const { documentType } = req.params;
    const documentData = req.body;
    
    // Generate document
    const doc = await documentGenerator.generateDocument(documentData);
    
    // Apply enhanced security
    const enhancedDoc = await enhancedDocumentService.generateSecureDocument(documentType, doc);
    
    // Send response with download URL
    res.json({
      success: true,
      message: 'Document generated successfully',
      downloadUrl: `/api/documents/download/${doc.id}?type=${documentType}`,
      mobileDownloadUrl: `/api/documents/mobile-download/${doc.id}?type=${documentType}`,
      documentId: doc.id
    });
    
  } catch (error) {
    console.error('Document generation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      error: 'Document generation failed',
      message: errorMessage
    });
  }
});

// Download generated document
router.get('/download/:documentId', (req: any, res: any) => {
  documentDownloadService.handleDocumentDownload(req, res);
});

// Mobile-optimized download
router.get('/mobile-download/:documentId', (req: any, res: any) => {
  documentDownloadService.handleMobileDownload(req, res);
});

// Document verification
router.post('/verify/:documentId', async (req: { params: { documentId: any; }; body: { document: any; }; }, res: { json: (arg0: { success: boolean; verified: any; metadata: any; }) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; message: any; }): void; new(): any; }; }; }) => {
  try {
    const { documentId } = req.params;
    const { document } = req.body;
    
    const verification = await documentGenerator.verifyDocument(document);
    
    res.json({
      success: true,
      verified: verification.verified,
      metadata: verification.metadata
    });
    
  } catch (error) {
    console.error('Document verification failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      error: 'Document verification failed',
      message: errorMessage
    });
  }
});

export default router;