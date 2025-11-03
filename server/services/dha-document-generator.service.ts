import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { createHash } from 'crypto';
import { storage } from '../storage.js';
import { governmentAPIs } from './government-api-integrations.js';

interface DocumentGenerationRequest {
  type: string;
  data: any;
  template?: string;
  userEmail?: string;
}

interface DocumentVerificationRequest {
  referenceNumber: string;
  [key: string]: any;
}

interface GovernmentVerificationResult {
  valid: boolean;
  metadata?: DocumentMetadata;
}

interface DocumentVerificationResult {
  valid: boolean;
  metadata?: DocumentMetadata;
  error?: string;
}

interface DocumentMetadata {
  id: string;
  type: string;
  referenceNumber: string;
  issuedAt: Date;
  validUntil: Date;
  verificationUrl: string;
  qrCode: string;
  hash: string;
}

class DHADocumentGenerator {
  [x: string]: any;
  private readonly DOCUMENT_TYPES = [
    'temporary_passport',
    'emergency_travel_cert',
    'birth_certificate',
    'death_certificate',
    'marriage_certificate',
    'visa_application',
    'permit_application',
    'citizenship_certificate',
    'refugee_status',
    'permanent_residence'
  ];

  private async generateReferenceNumber(type: string): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefix = type.substring(0, 3).toUpperCase();
    return `DHA-${prefix}-${timestamp}-${random}`;
  }

  private async generateQRCode(metadata: DocumentMetadata): Promise<string> {
    const verificationData = {
      ref: metadata.referenceNumber,
      type: metadata.type,
      issued: metadata.issuedAt,
      valid: metadata.validUntil,
      verify: metadata.verificationUrl,
      hash: metadata.hash
    };

    return QRCode.toDataURL(JSON.stringify(verificationData));
  }

  private async createDocumentMetadata(
    type: string,
    data: any
  ): Promise<DocumentMetadata> {
    const referenceNumber = await this.generateReferenceNumber(type);
    const issuedAt = new Date();
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 10); // Default 10 year validity

    const verificationUrl = `https://dha.gov.za/verify/${referenceNumber}`;
    
    // Create document hash
    const hash = createHash('sha256')
      .update(JSON.stringify({ type, data, referenceNumber, issuedAt }))
      .digest('hex');

    const metadata: DocumentMetadata = {
      id: createHash('md5').update(referenceNumber).digest('hex'),
      type,
      referenceNumber,
      issuedAt,
      validUntil,
      verificationUrl,
      hash,
      qrCode: '' // Will be set after generation
    };

    metadata.qrCode = await this.generateQRCode(metadata);

    return metadata;
  }

  private async validateDocumentData(type: string, data: any): Promise<boolean> {
    // Validate required fields based on document type
    const requiredFields: Record<string, string[]> = {
      temporary_passport: ['firstName', 'lastName', 'idNumber', 'dateOfBirth'],
      emergency_travel_cert: ['firstName', 'lastName', 'idNumber', 'reason'],
      birth_certificate: ['childName', 'dateOfBirth', 'parentNames', 'placeOfBirth'],
      // Add other document types
    };

    const fields = requiredFields[type];
    if (!fields) {
      throw new Error(`Invalid document type: ${type}`);
    }

    return fields.every(field => data[field]);
  }

  private async createPDFDocument(
    type: string,
    data: any,
    metadata: DocumentMetadata
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size

    // Add fonts
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    // Add header
    page.drawText('DEPARTMENT OF HOME AFFAIRS', {
      x: 50,
      y: 800,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0.8)
    });

    page.drawText('REPUBLIC OF SOUTH AFRICA', {
      x: 50,
      y: 780,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0.8)
    });

    // Add document title
    const title = type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    page.drawText(title, {
      x: 50,
      y: 740,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0)
    });

    // Add metadata
    page.drawText(`Reference: ${metadata.referenceNumber}`, {
      x: 50,
      y: 700,
      size: 12,
      font: font
    });

    page.drawText(`Issue Date: ${metadata.issuedAt.toLocaleDateString()}`, {
      x: 50,
      y: 680,
      size: 12,
      font: font
    });

    page.drawText(`Valid Until: ${metadata.validUntil.toLocaleDateString()}`, {
      x: 50,
      y: 660,
      size: 12,
      font: font
    });

    // Add document data
    let yPosition = 620;
    Object.entries(data).forEach(([key, value]) => {
      const label = key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      page.drawText(`${label}:`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: boldFont
      });

      page.drawText(String(value), {
        x: 200,
        y: yPosition,
        size: 12,
        font: font
      });

      yPosition -= 25;
    });

    // Add QR code
    const qrImage = await pdfDoc.embedPng(metadata.qrCode);
    const qrDims = qrImage.scale(0.5);
    
    page.drawImage(qrImage, {
      x: page.getWidth() - qrDims.width - 50,
      y: 50,
      width: qrDims.width,
      height: qrDims.height
    });

    // Add verification text
    page.drawText('Verify this document at:', {
      x: 50,
      y: 100,
      size: 10,
      font: font
    });

    page.drawText(metadata.verificationUrl, {
      x: 50,
      y: 85,
      size: 10,
      font: font,
      color: rgb(0, 0, 0.8)
    });

    return pdfDoc.save();
  }

  async generate(request: DocumentGenerationRequest): Promise<{
    success: boolean;
    document?: {
      buffer: Buffer;
      metadata: DocumentMetadata;
    };
    error?: string;
  }> {
    try {
      // Validate document type
      if (!this.DOCUMENT_TYPES.includes(request.type)) {
        throw new Error(`Invalid document type: ${request.type}`);
      }

      // Validate document data
      const isValid = await this.validateDocumentData(request.type, request.data);
      if (!isValid) {
        throw new Error('Invalid document data');
      }

      // Generate metadata
      const metadata = await this.createDocumentMetadata(request.type, request.data);

      // Create PDF document
      const pdfBytes = await this.createPDFDocument(
        request.type,
        request.data,
        metadata
      );

      // Store document metadata
      await storage.set(`document:${metadata.id}`, {
        metadata,
        data: request.data
      });

      // Register with government APIs
      await governmentAPIs.registerDocument(metadata);

      return {
        success: true,
        document: {
          buffer: Buffer.from(pdfBytes),
          metadata
        }
      };
    } catch (error) {
      console.error('Document generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Document generation failed'
      };
    }
  }

  async verify(referenceNumber: string): Promise<DocumentVerificationResult> {
    try {
      // Query government APIs
      const verificationResult = await governmentAPIs.verifyDocument({
        documentId: referenceNumber,
        documentType: 'any',
        verificationCode: 'auto'
      });

      if (!verificationResult.authentic) {
        throw new Error(verificationResult.error || 'Document verification failed');
      }

      return {
        valid: true,
        metadata: verificationResult.documentDetails
      };
    } catch (error) {
      console.error('Document verification error:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  getStatus() {
    return {
      documentTypes: this.DOCUMENT_TYPES,
      governmentIntegration: true,
      verificationEnabled: true
    };
  }
}

// Export singleton instance
export const dhaDocumentGenerator = new DHADocumentGenerator();