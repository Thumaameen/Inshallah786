import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { createHash } from 'crypto';

export interface DocumentData {
  documentType: string;
  applicantName?: string;
  idNumber?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: string;
  [key: string]: any;
}

export class PDFGeneratorService {
  private static instance: PDFGeneratorService;

  static getInstance(): PDFGeneratorService {
    if (!this.instance) {
      this.instance = new PDFGeneratorService();
    }
    return this.instance;
  }

  async generateDocument(data: DocumentData): Promise<Buffer> {
    const { documentType } = data;

    switch (documentType.toLowerCase()) {
      case 'passport':
        return this.generatePassport(data);
      case 'id':
      case 'id_document':
        return this.generateID(data);
      case 'birth_certificate':
        return this.generateBirthCertificate(data);
      case 'marriage_certificate':
        return this.generateMarriageCertificate(data);
      case 'visa':
        return this.generateVisa(data);
      default:
        return this.generateGenericDocument(data);
    }
  }

  private async generatePassport(data: DocumentData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Header
    page.drawText('REPUBLIC OF SOUTH AFRICA', {
      x: 150,
      y: 780,
      size: 18,
      font: fontBold,
      color: rgb(0, 0, 0.5),
    });

    page.drawText('PASSPORT / PASSEPORT', {
      x: 180,
      y: 750,
      size: 20,
      font: fontBold,
      color: rgb(0, 0, 0.5),
    });

    // Document number
    const docNumber = this.generateDocumentNumber('P');
    page.drawText(`Document No: ${docNumber}`, {
      x: 50,
      y: 700,
      size: 12,
      font: fontBold,
    });

    // Personal Information
    const personalInfo = [
      { label: 'Surname:', value: data.surname || data.applicantName?.split(' ').pop() || 'N/A' },
      { label: 'Given Names:', value: data.givenNames || data.applicantName?.split(' ').slice(0, -1).join(' ') || 'N/A' },
      { label: 'Nationality:', value: data.nationality || 'South African' },
      { label: 'Date of Birth:', value: data.dateOfBirth || 'N/A' },
      { label: 'Place of Birth:', value: data.placeOfBirth || 'South Africa' },
      { label: 'ID Number:', value: data.idNumber || 'N/A' },
      { label: 'Sex:', value: data.gender || 'N/A' },
    ];

    let yPosition = 650;
    for (const info of personalInfo) {
      page.drawText(info.label, {
        x: 50,
        y: yPosition,
        size: 11,
        font: fontBold,
      });
      page.drawText(info.value, {
        x: 200,
        y: yPosition,
        size: 11,
        font,
      });
      yPosition -= 30;
    }

    // Issue and expiry dates
    const issueDate = new Date().toISOString().split('T')[0];
    const expiryDate = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    page.drawText(`Date of Issue: ${issueDate}`, {
      x: 50,
      y: yPosition,
      size: 11,
      font: fontBold,
    });
    yPosition -= 25;
    page.drawText(`Date of Expiry: ${expiryDate}`, {
      x: 50,
      y: yPosition,
      size: 11,
      font: fontBold,
    });

    // Add QR Code for verification
    await this.addQRCode(page, pdfDoc, docNumber, 400, 200);

    // Add security watermark
    page.drawText('OFFICIAL DOCUMENT', {
      x: 150,
      y: 150,
      size: 40,
      font: fontBold,
      color: rgb(0.9, 0.9, 0.9)
    });

    // Add footer
    page.drawText('© Department of Home Affairs - Republic of South Africa', {
      x: 120,
      y: 30,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    return Buffer.from(await pdfDoc.save());
  }

  private async generateID(data: DocumentData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Header
    page.drawText('REPUBLIC OF SOUTH AFRICA', {
      x: 150,
      y: 780,
      size: 18,
      font: fontBold,
      color: rgb(0, 0.4, 0),
    });

    page.drawText('IDENTITY DOCUMENT', {
      x: 180,
      y: 750,
      size: 20,
      font: fontBold,
    });

    const idNumber = data.idNumber || this.generateIDNumber();
    const docNumber = this.generateDocumentNumber('ID');

    // ID Information
    const idInfo = [
      { label: 'ID Number:', value: idNumber },
      { label: 'Document Number:', value: docNumber },
      { label: 'Surname:', value: data.surname || data.applicantName?.split(' ').pop() || 'N/A' },
      { label: 'Names:', value: data.givenNames || data.applicantName?.split(' ').slice(0, -1).join(' ') || 'N/A' },
      { label: 'Date of Birth:', value: data.dateOfBirth || idNumber.substring(0, 6) },
      { label: 'Gender:', value: data.gender || (parseInt(idNumber.substring(6, 10)) >= 5000 ? 'Male' : 'Female') },
      { label: 'Citizenship:', value: data.citizenship || 'South African Citizen' },
      { label: 'Country of Birth:', value: data.countryOfBirth || 'ZA' },
    ];

    let yPosition = 680;
    for (const info of idInfo) {
      page.drawText(info.label, {
        x: 50,
        y: yPosition,
        size: 12,
        font: fontBold,
      });
      page.drawText(info.value, {
        x: 220,
        y: yPosition,
        size: 12,
        font,
      });
      yPosition -= 35;
    }

    // Add QR Code
    await this.addQRCode(page, pdfDoc, docNumber, 400, 300);

    // Add issue date
    const issueDate = new Date().toISOString().split('T')[0];
    page.drawText(`Date of Issue: ${issueDate}`, {
      x: 50,
      y: 200,
      size: 11,
      font: fontBold,
    });

    // Footer
    page.drawText('This is an official document issued by the Department of Home Affairs', {
      x: 80,
      y: 30,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    return Buffer.from(await pdfDoc.save());
  }

  private async generateBirthCertificate(data: DocumentData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText('REPUBLIC OF SOUTH AFRICA', {
      x: 150,
      y: 780,
      size: 18,
      font: fontBold,
      color: rgb(0.6, 0, 0.6),
    });

    page.drawText('BIRTH CERTIFICATE', {
      x: 180,
      y: 750,
      size: 20,
      font: fontBold,
    });

    const certNumber = this.generateDocumentNumber('BC');
    page.drawText(`Certificate Number: ${certNumber}`, {
      x: 50,
      y: 700,
      size: 12,
      font: fontBold,
    });

    const birthInfo = [
      { label: 'Full Name:', value: data.fullName || data.applicantName || 'N/A' },
      { label: 'Date of Birth:', value: data.dateOfBirth || 'N/A' },
      { label: 'Place of Birth:', value: data.placeOfBirth || 'South Africa' },
      { label: 'Gender:', value: data.gender || 'N/A' },
      { label: 'Mother\'s Name:', value: data.motherName || 'N/A' },
      { label: 'Father\'s Name:', value: data.fatherName || 'N/A' },
      { label: 'Registration Date:', value: new Date().toISOString().split('T')[0] },
    ];

    let yPosition = 650;
    for (const info of birthInfo) {
      page.drawText(info.label, {
        x: 50,
        y: yPosition,
        size: 12,
        font: fontBold,
      });
      page.drawText(info.value, {
        x: 220,
        y: yPosition,
        size: 12,
        font,
      });
      yPosition -= 35;
    }

    await this.addQRCode(page, pdfDoc, certNumber, 400, 400);

    page.drawText('This certifies that the above particulars have been extracted from the National', {
      x: 70,
      y: 150,
      size: 9,
      font,
    });
    page.drawText('Population Register', {
      x: 210,
      y: 135,
      size: 9,
      font: fontBold,
    });

    return Buffer.from(await pdfDoc.save());
  }

  private async generateMarriageCertificate(data: DocumentData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText('REPUBLIC OF SOUTH AFRICA', {
      x: 150,
      y: 780,
      size: 18,
      font: fontBold,
      color: rgb(0.8, 0, 0),
    });

    page.drawText('MARRIAGE CERTIFICATE', {
      x: 170,
      y: 750,
      size: 20,
      font: fontBold,
    });

    const certNumber = this.generateDocumentNumber('MC');

    const marriageInfo = [
      { label: 'Certificate Number:', value: certNumber },
      { label: 'Spouse 1:', value: data.spouse1Name || 'N/A' },
      { label: 'Spouse 2:', value: data.spouse2Name || 'N/A' },
      { label: 'Date of Marriage:', value: data.marriageDate || 'N/A' },
      { label: 'Place of Marriage:', value: data.placeOfMarriage || 'N/A' },
      { label: 'Marriage Officer:', value: data.marriageOfficer || 'N/A' },
      { label: 'Registration Date:', value: new Date().toISOString().split('T')[0] },
    ];

    let yPosition = 680;
    for (const info of marriageInfo) {
      page.drawText(info.label, {
        x: 50,
        y: yPosition,
        size: 12,
        font: fontBold,
      });
      page.drawText(info.value, {
        x: 220,
        y: yPosition,
        size: 12,
        font,
      });
      yPosition -= 35;
    }

    await this.addQRCode(page, pdfDoc, certNumber, 400, 400);

    return Buffer.from(await pdfDoc.save());
  }

  private async generateVisa(data: DocumentData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText('REPUBLIC OF SOUTH AFRICA', {
      x: 150,
      y: 780,
      size: 18,
      font: fontBold,
      color: rgb(0, 0, 0.5),
    });

    page.drawText('VISA PERMIT', {
      x: 220,
      y: 750,
      size: 20,
      font: fontBold,
    });

    const visaNumber = this.generateDocumentNumber('V');
    const validFrom = new Date().toISOString().split('T')[0];
    const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const visaInfo = [
      { label: 'Visa Number:', value: visaNumber },
      { label: 'Visa Type:', value: data.visaType || 'Visitor Visa' },
      { label: 'Full Name:', value: data.applicantName || 'N/A' },
      { label: 'Passport Number:', value: data.passportNumber || 'N/A' },
      { label: 'Nationality:', value: data.nationality || 'N/A' },
      { label: 'Valid From:', value: validFrom },
      { label: 'Valid Until:', value: validUntil },
      { label: 'Entries:', value: data.entries || 'Multiple' },
    ];

    let yPosition = 680;
    for (const info of visaInfo) {
      page.drawText(info.label, {
        x: 50,
        y: yPosition,
        size: 12,
        font: fontBold,
      });
      page.drawText(info.value, {
        x: 220,
        y: yPosition,
        size: 12,
        font,
      });
      yPosition -= 35;
    }

    await this.addQRCode(page, pdfDoc, visaNumber, 400, 350);

    return Buffer.from(await pdfDoc.save());
  }

  private async generateGenericDocument(data: DocumentData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText('REPUBLIC OF SOUTH AFRICA', {
      x: 150,
      y: 780,
      size: 18,
      font: fontBold,
    });

    page.drawText(data.documentType.toUpperCase(), {
      x: 150,
      y: 750,
      size: 16,
      font: fontBold,
    });

    const docNumber = this.generateDocumentNumber('DOC');
    page.drawText(`Document Number: ${docNumber}`, {
      x: 50,
      y: 700,
      size: 12,
      font: fontBold,
    });

    let yPosition = 650;
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'documentType' && typeof value === 'string') {
        page.drawText(`${key}:`, {
          x: 50,
          y: yPosition,
          size: 11,
          font: fontBold,
        });
        page.drawText(value, {
          x: 200,
          y: yPosition,
          size: 11,
          font,
        });
        yPosition -= 30;
      }
    }

    await this.addQRCode(page, pdfDoc, docNumber, 400, 400);

    return Buffer.from(await pdfDoc.save());
  }

  private async addQRCode(page: any, pdfDoc: PDFDocument, data: string, x: number, y: number): Promise<void> {
    try {
      const qrDataUrl = await QRCode.toDataURL(data, {
        width: 150,
        margin: 1,
      });

      const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      const qrImage = await pdfDoc.embedPng(qrImageBytes as any);

      page.drawImage(qrImage, {
        x,
        y,
        width: 120,
        height: 120,
      });
    } catch (error) {
      console.error('Error adding QR code:', error);
    }
  }

  private generateDocumentNumber(prefix: string): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp.substring(timestamp.length - 8)}-${random}`;
  }

  private generateIDNumber(): string {
    const year = new Date().getFullYear() - 25;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const gender = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const citizenship = '0';
    const checksum = String(Math.floor(Math.random() * 10));

    return `${year.toString().substring(2)}${month}${day}${gender}${citizenship}8${checksum}`;
  }
}

export const pdfGenerator = PDFGeneratorService.getInstance();