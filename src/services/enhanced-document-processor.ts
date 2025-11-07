import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { passportOCR } from './ocr-service.js';
import { verifyPassport } from './passport-verification.js';
import { ultraQueenAI } from './ultra-queen-ai.js';

interface SecurityFeatures {
  watermark: boolean;
  hologram: boolean;
  microprint: boolean;
  qrCode: boolean;
  digitalSignature: boolean;
  uvFeatures: boolean;
  guilloche: boolean;
}

export class EnhancedDocumentProcessor {
  private readonly API_ENDPOINTS = {
    DHA_VALIDATION: 'https://api.dha.gov.za/validate',
    ICAO_PKD: 'https://pkddownloadsg.icao.int/api/v1',
    INTERPOL: 'https://api.interpol.int/validate',
    SAPS: 'https://api.saps.gov.za/verify',
  };

  private readonly SECURITY_LAYERS = {
    LEVEL_1: ['watermark', 'qrCode', 'digitalSignature'],
    LEVEL_2: ['microprint', 'hologram', 'uvFeatures'],
    LEVEL_3: ['guilloche', 'taggants', 'nanotext']
  };

  async generateFromPassport(passportImage: Buffer) {
    try {
      // 1. OCR Passport
      const passportData = await passportOCR(passportImage);
      
      // 2. Verify Passport with ICAO
      const passportVerification = await verifyPassport(passportData.mrz);
      if (!passportVerification.valid) {
        throw new Error('Invalid passport data');
      }

      // 3. Generate Document
      const documentData = {
        ...passportData,
        verificationData: passportVerification,
        timestamp: new Date().toISOString(),
        securityLevel: 'LEVEL_3'
      };

      return await this.generateSecureDocument(documentData);
    } catch (error) {
      console.error('Passport processing error:', error);
      throw new Error('Failed to process passport');
    }
  }

  async generateSecureDocument(data: any) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size

    // Generate unique document ID
    const documentId = this.generateSecureId();
    
    // Add all security features
    await this.addAllSecurityFeatures(page, data, documentId);

    // Add document content
    await this.addDocumentContent(page, data);

    // Digital signature
    const signature = await this.createDigitalSignature(pdfDoc, documentId);

    // Register with DHA system
    await this.registerDocument({
      documentId,
      signature,
      data,
      timestamp: new Date().toISOString()
    });

    const finalPdf = await pdfDoc.save();

    return {
      documentId,
      pdf: finalPdf,
      validationUrl: `https://dha.gov.za/validate/${documentId}`,
      mobileUrl: `https://m.dha.gov.za/docs/${documentId}`,
      signature
    };
  }

  private async addAllSecurityFeatures(page: any, data: any, documentId: string) {
    // Level 1 Security Features
    await this.addWatermark(page, 'DEPARTMENT OF HOME AFFAIRS');
    await this.addQRCode(page, documentId);
    await this.addDigitalSignature(page, data);

    // Level 2 Security Features
    await this.addMicroprint(page);
    await this.addHologram(page);
    await this.addUVFeatures(page);

    // Level 3 Security Features
    await this.addGuilloche(page);
    await this.addNanotext(page);
    await this.addTaggants(page);
  }

  private generateSecureId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async registerDocument(data: any) {
    try {
      const response = await fetch(this.API_ENDPOINTS.DHA_VALIDATION + '/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.DHA_API_KEY!
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to register document with DHA');
      }

      return await response.json();
    } catch (error) {
      console.error('Document registration error:', error);
      throw new Error('Document registration failed');
    }
  }

  async validateDocument(documentId: string) {
    try {
      // 1. Check DHA Database
      const dhaValidation = await this.validateWithDHA(documentId);

      // 2. Check ICAO PKD
      const icaoValidation = await this.validateWithICAO(documentId);

      // 3. Check INTERPOL Database
      const interpolValidation = await this.validateWithINTERPOL(documentId);

      // 4. Check SAPS Database
      const sapsValidation = await this.validateWithSAPS(documentId);

      return {
        valid: dhaValidation.valid && icaoValidation.valid && 
               interpolValidation.valid && sapsValidation.valid,
        details: {
          dha: dhaValidation,
          icao: icaoValidation,
          interpol: interpolValidation,
          saps: sapsValidation
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Document validation error:', error);
      throw new Error('Document validation failed');
    }
  }

  private async validateWithDHA(documentId: string) {
    const response = await fetch(`${this.API_ENDPOINTS.DHA_VALIDATION}/${documentId}`);
    return response.json();
  }

  private async validateWithICAO(documentId: string) {
    const response = await fetch(`${this.API_ENDPOINTS.ICAO_PKD}/validate/${documentId}`);
    return response.json();
  }

  private async validateWithINTERPOL(documentId: string) {
    const response = await fetch(`${this.API_ENDPOINTS.INTERPOL}/${documentId}`);
    return response.json();
  }

  private async validateWithSAPS(documentId: string) {
    const response = await fetch(`${this.API_ENDPOINTS.SAPS}/${documentId}`);
    return response.json();
  }
}