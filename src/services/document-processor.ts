import { PDFDocument, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import { ultraQueenAI, UltraQueenAI } from './ultra-queen-ai.js';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';
import { v4 as uuidv4 } from 'uuid';

interface DocumentMetadata {
  type: string;
  issueDate: string;
  expiryDate: string;
  documentNumber: string;
  holder: {
    name: string;
    passportNumber: string;
    nationality: string;
  };
  validationUrl: string;
  securityFeatures: string[];
}

export class DocumentProcessor {
  private static readonly SECURITY_FEATURES = [
    'qr-validation',
    'digital-watermark',
    'hologram-simulation',
    'microprint',
    'security-thread'
  ];

  async generatePermit(data: any) {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Add official header
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    page.drawText('DEPARTMENT OF HOME AFFAIRS', {
      x: 50,
      y: height - 50,
      size: 24,
      font,
      color: rgb(0, 0, 0)
    });

    // Generate QR code for validation
    const validationId = uuidv4();
    const qrCode = await QRCode.toDataURL(`https://dha.gov.za/validate/${validationId}`);
    const qrImage = await pdfDoc.embedPng(qrCode);
    page.drawImage(qrImage, {
      x: width - 150,
      y: height - 150,
      width: 100,
      height: 100
    });

    // Add security features
    await this.addSecurityFeatures(page);

    // Add document content using AI
    const content = await ultraQueenAI.generateDocument('permit', data);
    
    // Add metadata
    const metadata: DocumentMetadata = {
      type: 'DHA-PERMIT',
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      documentNumber: `DHA-${validationId.slice(0, 8).toUpperCase()}`,
      holder: {
        name: data.name,
        passportNumber: data.passportNumber,
        nationality: data.nationality
      },
      validationUrl: `https://dha.gov.za/validate/${validationId}`,
      securityFeatures: DocumentProcessor.SECURITY_FEATURES
    };

    pdfDoc.setTitle(metadata.documentNumber);
    pdfDoc.setSubject('DHA Official Document');
    pdfDoc.setKeywords(['DHA', 'Official', 'Secure', metadata.documentNumber]);
    pdfDoc.setCreator('DHA Document System');
    pdfDoc.setProducer('DHA Digital Services');

    const pdfBytes = await pdfDoc.save();
    return {
      pdf: pdfBytes,
      metadata,
      validationId
    };
  }

  private async addSecurityFeatures(page: PDFPage) {
    // Add digital watermark
    const watermark = await this.createWatermark('DHA OFFICIAL DOCUMENT');
    const watermarkImage = await page.doc.embedPng(Uint8Array.from(watermark));
    page.drawImage(watermarkImage, {
      x: 0,
      y: 0,
      width: page.getWidth(),
      height: page.getHeight(),
      opacity: 0.1
    });

    // Add microprint border
    this.addMicroprintBorder(page);

    // Add other security features
    // ... implement additional security features
  }

  private async createWatermark(text: string) {
    const canvas = createCanvas(400, 100);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.font = '20px Arial';
    ctx.rotate(-45 * Math.PI / 180);
    ctx.fillText(text, -50, 120);

    return canvas.toBuffer();
  }

  private addMicroprintBorder(page: PDFPage) {
    const { width, height } = page.getSize();
    const microprintText = 'DEPARTMENT OF HOME AFFAIRS REPUBLIC OF SOUTH AFRICA ';
    const fontSize = 0.5;

    // Draw microprint border
    for (let x = 0; x < width; x += 20) {
      page.drawText(microprintText, {
        x,
        y: 5,
        size: fontSize,
        color: rgb(0, 0, 0)
      });
      
      page.drawText(microprintText, {
        x,
        y: height - 5,
        size: fontSize,
        color: rgb(0, 0, 0)
      });
    }
  }

  async validateDocument(pdfBytes: Buffer) {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const metadata = this.extractMetadata(pdfDoc);
    
    // Validate using AI
    const validationResult = await ultraQueenAI.validateDocument(metadata.documentNumber);

    return {
      isValid: validationResult.isValid,
      metadata,
      validationDetails: validationResult
    };
  }

  private extractMetadata(pdfDoc: PDFDocument) {
    return {
      title: pdfDoc.getTitle() || '',
      subject: pdfDoc.getSubject() || '',
      creator: pdfDoc.getCreator() || '',
      producer: pdfDoc.getProducer() || '',
      keywords: pdfDoc.getKeywords() || '',
      documentNumber: pdfDoc.getTitle() || 'UNKNOWN'
    };
  }
}

export const documentProcessor = new DocumentProcessor();