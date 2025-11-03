import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { DocumentService } from './document-service';
import { EnhancedDocumentService } from './enhanced-document.service';
import { serviceConfig } from '../../config/service-integration';

export class DocumentDownloadService {
  private documentService: DocumentService;
  private enhancedService: EnhancedDocumentService;
  private downloadDir: string;

  constructor() {
    this.documentService = new DocumentService();
    this.enhancedService = new EnhancedDocumentService();
    this.downloadDir = path.join(process.cwd(), 'downloads');
  }

  async handleDocumentDownload(req: Request, res: Response) {
    try {
      const { documentId, documentType } = req.params;
      
      // Generate document
      const documentData = await this.documentService.generateSecureDocument(req.body, documentType);
      
      // Enhanced security features
      const enhancedDocument = await this.enhancedService.generateSecureDocument(documentType, documentData);
      
      // Ensure download directory exists
      await fs.mkdir(this.downloadDir, { recursive: true });
      
      // Generate unique filename
      const filename = `${documentType}_${Date.now()}.pdf`;
      const filepath = path.join(this.downloadDir, filename);
      
      // Save file
      await fs.writeFile(filepath, enhancedDocument.document);
      
      // Set response headers for download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Content-Length', (await fs.stat(filepath)).size);
      
      // Stream the file
      const fileStream = fs.createReadStream(filepath);
      fileStream.pipe(res);
      
      // Clean up file after sending
      fileStream.on('end', async () => {
        try {
          await fs.unlink(filepath);
        } catch (error) {
          console.error('Error cleaning up file:', error);
        }
      });
      
      // Emit download success event
      req.app.emit('pdf-download-success', {
        documentId,
        documentType,
        filename
      });

    } catch (error) {
      console.error('Document download failed:', error);
      
      // Emit download error event
      req.app.emit('pdf-download-error', {
        documentType: req.params.documentType,
        error: error.message
      });
      
      res.status(500).json({
        error: 'Document download failed',
        message: error.message
      });
    }
  }

  async handleMobileDownload(req: Request, res: Response) {
    try {
      const { documentId, documentType } = req.params;
      
      // Generate mobile-optimized document
      const documentData = await this.documentService.generateSecureDocument(req.body, documentType);
      const enhancedDocument = await this.enhancedService.generateSecureDocument(documentType, documentData);
      
      // Convert to mobile-friendly format
      const mobileDoc = await this.optimizeForMobile(enhancedDocument.document);
      
      // Set headers for mobile devices
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${documentType}_${Date.now()}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Send optimized document
      res.send(mobileDoc);
      
    } catch (error) {
      console.error('Mobile download failed:', error);
      res.status(500).json({
        error: 'Mobile download failed',
        message: error.message
      });
    }
  }

  private async optimizeForMobile(document: Buffer): Promise<Buffer> {
    // Implement mobile optimization if needed
    // For now, return the original document
    return document;
  }
}

export const documentDownloadService = new DocumentDownloadService();