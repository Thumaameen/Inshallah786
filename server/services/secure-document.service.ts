import { DHADocumentType } from '../types/document-types';
import { serviceConfig } from '../../config/service-integration';
import * as forge from 'node-forge';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import sharp from 'sharp';
import jsQR from 'jsqr';
import { CryptoService } from './crypto.service';
import { DHAService } from './dha.service';
import { QuantumSecurityService } from './quantum-security.service';
import { AttachmentService } from './attachment.service';
import { BlockchainService } from './blockchain.service';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { ultraQueenAI } from './ultra-queen-ai.service';
import { ErrorCode, VerificationError } from '../types/errors';
import { DocumentHelpers } from './document-helpers';

export class SecureDocumentService {
  // Security features
  private readonly securityFeatures = {
    hologram: true,
    microprint: true,
    uvFeatures: true,
    rfidChip: true,
    securityThread: true,
    opticalVariableInk: true,
    ghostImage: true,
    guilloche: true,
    watermark: true,
    embossing: true,
    serialization: true,
    biometricEncryption: true
  };

  // Document verification levels
  private readonly verificationLevels = {
    level1: ['visualInspection', 'uvLight', 'microprint'],
    level2: ['rfidRead', 'hologramVerification', 'securityThreadCheck'],
    level3: ['biometricVerification', 'digitalSignature', 'blockchainVerification']
  };

  constructor(
    private cryptoService: CryptoService,
    private dhaService: DHAService,
    private quantumService: QuantumSecurityService,
    private attachmentService: AttachmentService,
    private blockchainService: BlockchainService
  ) {}

  async generateDocument(documentType: DHADocumentType, data: any) {
    try {
      // Pre-validate input data
      if (!data || !data.documentNumber || !data.biometrics || !data.photo) {
        throw new VerificationError(
          ErrorCode.INVALID_DOCUMENT,
          'Missing required document data',
          false,
          'Please provide all required information including biometrics and photo'
        );
      }

      // Verify identity first with multiple retries
      let identityVerified = false;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!identityVerified && attempts < maxAttempts) {
        try {
          const verificationResult = await this.verifyIdentity(data);
          if (verificationResult.nprVerification && verificationResult.hanisVerification) {
            identityVerified = true;
          }
        } catch (error) {
          attempts++;
          if (attempts === maxAttempts) throw error;
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between retries
        }
      }
      
      // Create base document
      const doc = await this.createBaseDocument(documentType);
      
      // Add enhanced security features
      await this.addSecurityFeatures(doc, data);
      
      // Add document-specific content using helpers with validation
      await DocumentHelpers.addDocumentContent(doc, documentType, data);
      
      // Add verification features with validation
      const verificationFeatures = await this.addVerificationFeatures(doc, data);
      
      // Verify QR code readability
      const qrVerification = await this.verifyQRCode(verificationFeatures.qrCode);
      if (!qrVerification.valid) {
        throw new VerificationError(
          ErrorCode.INVALID_DOCUMENT,
          'QR code generation failed',
          true,
          'Please try regenerating the document'
        );
      }
      
      // Add blockchain verification with confirmation
      const blockchainVerification = await DocumentHelpers.verifyBlockchainRecord(doc);
      if (!blockchainVerification.verified) {
        throw new VerificationError(
          ErrorCode.BLOCKCHAIN_VERIFICATION_FAILED,
          'Blockchain verification failed',
          true,
          'Please retry blockchain verification'
        );
      }
      
      // Pre-validate document before finalization
      const preValidation = await this.verifyDocument(doc);
      if (!preValidation.verified) {
        throw new VerificationError(
          ErrorCode.INVALID_DOCUMENT,
          'Document pre-validation failed',
          true,
          'Document failed security checks: ' + preValidation.error
        );
      }
      
      // Final security wrap with validation
      const finalDoc = await this.finalizeDocument(doc, data, blockchainVerification);
      
      // Perform final verification
      const finalVerification = await this.verifyDocument(finalDoc);
      if (!finalVerification.verified) {
        throw new VerificationError(
          ErrorCode.INVALID_DOCUMENT,
          'Final document verification failed',
          true,
          'Generated document failed final verification'
        );
      }
      
      return finalDoc;
    } catch (error) {
      if (error instanceof VerificationError) {
        throw error;
      }
      throw new VerificationError(
        ErrorCode.INVALID_DOCUMENT,
        'Document generation failed',
        true,
        'Please retry or contact support'
      );
    }
  }

  private async createBaseDocument(documentType: DHADocumentType) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    
    // Add base security features using DocumentHelpers
    await DocumentHelpers.addBaseSecurityFeatures(page);
    
    return pdfDoc;
  }

  private async addSecurityFeatures(doc: PDFDocument, data: any) {
    try {
      // Add holographic features
      await DocumentHelpers.addHologram(doc);
      
      // Add microprinting
      await DocumentHelpers.addMicroprint(doc, data);
      
      // Add UV features
      await DocumentHelpers.addUVFeatures(doc);
      
      // Add RFID data
      if (this.securityFeatures.rfidChip) {
        await DocumentHelpers.addRFIDData(doc, data);
      }
      
      // Add security thread
      await DocumentHelpers.addSecurityThread(doc);
      
      // Add optical variable ink patterns
      await DocumentHelpers.addOpticalVariableInk(doc);
      
      // Add ghost image
      await DocumentHelpers.addGhostImage(doc, data.photo);
      
      // Add guilloche patterns
      await DocumentHelpers.addGuilloche(doc);
      
      // Add watermark
      await DocumentHelpers.addWatermark(doc);
      
      // Add embossing
      await DocumentHelpers.addEmbossing(doc);

      // Verify all security features are properly added
      const verificationResult = await this.verifySecurityFeaturesAdded(doc);
      if (!verificationResult.success) {
        throw new VerificationError(
          ErrorCode.INVALID_DOCUMENT,
          'Failed to add security features: ' + verificationResult.errors.join(', '),
          true,
          'Security features could not be verified'
        );
      }
    } catch (error) {
      throw new VerificationError(
        ErrorCode.INVALID_DOCUMENT,
        'Failed to add security features',
        true,
        'Please try again or contact support'
      );
    }
  }

  private async verifySecurityFeaturesAdded(doc: PDFDocument): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // Verify hologram
      if (!await DocumentHelpers.verifyHologram(doc)) {
        errors.push('Hologram verification failed');
      }

      // Verify microprint
      if (!await DocumentHelpers.verifyMicroprint(doc)) {
        errors.push('Microprint verification failed');
      }

      // Verify UV features
      if (!await DocumentHelpers.verifyUVFeatures(doc)) {
        errors.push('UV features verification failed');
      }

      // Verify RFID
      if (this.securityFeatures.rfidChip && !await DocumentHelpers.verifyRFID(doc)) {
        errors.push('RFID verification failed');
      }

      // Verify security thread
      if (!await DocumentHelpers.verifySecurityThread(doc)) {
        errors.push('Security thread verification failed');
      }

      // Verify optical variable ink
      if (!await DocumentHelpers.verifyOpticalVariableInk(doc)) {
        errors.push('Optical variable ink verification failed');
      }

      // Verify ghost image
      if (!await DocumentHelpers.verifyGhostImage(doc)) {
        errors.push('Ghost image verification failed');
      }

      // Verify guilloche patterns
      if (!await DocumentHelpers.verifyGuilloche(doc)) {
        errors.push('Guilloche patterns verification failed');
      }

      // Verify watermark
      if (!await DocumentHelpers.verifyWatermark(doc)) {
        errors.push('Watermark verification failed');
      }

      // Verify embossing
      if (!await DocumentHelpers.verifyEmbossing(doc)) {
        errors.push('Embossing verification failed');
      }

      return {
        success: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        success: false,
        errors: ['Security feature verification failed: ' + (error instanceof Error ? error.message : 'Unknown error')]
      };
    }
  }

  private async verifyQRCode(qrCodeData: Buffer): Promise<{ valid: boolean; error?: string }> {
    try {
      // Convert buffer to base64 string
      const base64Data = qrCodeData.toString('base64');
      
      // Use QRCode module to decode
      const result = await QRCode.toDataURL(base64Data);
      if (!result) {
        return { valid: false, error: 'QR code is not readable' };
      }

      // Extract the base64 data after the comma
      const base64Result = result.split(',')[1];
      const decoded = Buffer.from(base64Result, 'base64').toString();

      // Verify QR code content
      const content = JSON.parse(decoded);
      if (!content.documentNumber || !content.issuingAuthority || !content.verificationHash) {
        return { valid: false, error: 'QR code missing required data' };
      }

      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: 'QR code verification failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      };
    }
  }

  private async decryptPackage(encryptedPackage: any): Promise<PDFDocument> {
    try {
      const decrypted = await this.cryptoService.decrypt(encryptedPackage);
      return await PDFDocument.load(decrypted);
    } catch (error) {
      throw new VerificationError(
        ErrorCode.DECRYPTION_FAILED,
        'Failed to decrypt document package',
        true,
        'Document decryption failed'
      );
    }
  }

  private async verifyBlockchainRecord(doc: PDFDocument): Promise<{ valid: boolean; polygonHash?: string; solanaHash?: string }> {
    try {
      const result = await this.blockchainService.verifyDocument(doc);
      return {
        valid: result.valid,
        polygonHash: result.polygonHash,
        solanaHash: result.solanaHash
      };
    } catch (error) {
      console.error('Blockchain verification failed:', error);
      return { valid: false };
    }
  }

  private async verifyWithDHAEnhanced(doc: PDFDocument): Promise<boolean> {
    try {
      const documentType = await this.getDocumentType(doc);
      return await this.dhaService.verifyDocument(doc, documentType);
    } catch (error) {
      console.error('DHA verification failed:', error);
      return false;
    }
  }

  private async getDocumentType(doc: PDFDocument): Promise<DHADocumentType> {
    // Extract document type from metadata or content
    const metadata = await doc.getTitle();
    if (!metadata) {
      throw new Error('Could not determine document type');
    }
    return metadata.split('-')[0] as DHADocumentType;
  }

  private async verifySecurityFeatures(doc: PDFDocument, aiAnalysis: any): Promise<boolean> {
    const result = await this.verifySecurityFeaturesAdded(doc);
    return result.success;
  }

  private getErrorCode(error: unknown): ErrorCode {
    if (error instanceof VerificationError) {
      return error.code;
    }
    return ErrorCode.UNKNOWN_ERROR;
  }

  private getSuggestedFix(error: unknown): string {
    if (error instanceof VerificationError) {
      return error.suggestion || 'Please try again or contact support';
    }
    return 'Please try again or contact support';
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof VerificationError) {
      return error.retryable;
    }
    return false;
  }

  private async performQuantumVerification(doc: PDFDocument): Promise<boolean> {
    try {
      const result = await this.quantumService.verifyDocument(doc);
      return result.valid;
    } catch (error) {
      console.error('Quantum verification failed:', error);
      return false;
    }
  }

  private async generateLinkageHash(passportData: any, permitData: any): Promise<string> {
    const data = JSON.stringify({ passport: passportData, permit: permitData });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async storeAttachmentLink(attachment: any): Promise<void> {
    try {
      await this.attachmentService.store(attachment);
    } catch (error) {
      throw new VerificationError(
        ErrorCode.ATTACHMENT_STORAGE_FAILED,
        'Failed to store attachment link',
        true,
        'Document linking failed'
      );
    }
  }

  private async addVerificationFeatures(doc: PDFDocument, data: any) {
    try {
      // Add QR code
      const qrCode = await this.generateVerificationQR(data);
      
      // Add machine readable zone (MRZ)
      const mrz = DocumentHelpers.generateMRZ(data);
      
      // Add biometric data
      if (data.biometrics) {
        const encryptedBiometrics = DocumentHelpers.encryptBiometricData(data.biometrics);
        await doc.attach(encryptedBiometrics, 'biometrics.dat', {
          mimeType: 'application/octet-stream',
          description: 'Encrypted Biometric Data'
        });
      }
      
      // Add digital signatures
      await DocumentHelpers.addDigitalSignatures(doc, data);
      
      return { qrCode, mrz };
    } catch (error) {
      throw new VerificationError(
        ErrorCode.INVALID_DOCUMENT,
        'Failed to add verification features',
        true
      );
    }
  }

  private async generateVerificationQR(data: any) {
    const verificationData = {
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      issuingAuthority: 'DHA-RSA',
      issuanceDate: new Date().toISOString(),
      verificationHash: DocumentHelpers.generateVerificationHash(data),
      blockchainReference: data.blockchainReference
    };
    
    return await QRCode.toBuffer(JSON.stringify(verificationData));
  }

  private async verifyIdentity(data: any) {
    try {
      // Verify with NPR
      const nprVerification = await DocumentHelpers.verifyWithNPR(data);
      
      // Verify with HANIS
      const hanisVerification = await DocumentHelpers.verifyWithHANIS(data);
      
      // Check SAPS if needed
      const sapsVerification = await DocumentHelpers.verifyWithSAPS(data);
      
      if (!nprVerification || !hanisVerification) {
        throw new VerificationError(
          ErrorCode.INVALID_DOCUMENT,
          'Identity verification failed',
          true,
          'Please verify your identity information'
        );
      }
      
      return { nprVerification, hanisVerification, sapsVerification };
    } catch (error) {
      if (error instanceof VerificationError) {
        throw error;
      }
      throw new VerificationError(
        ErrorCode.INVALID_DOCUMENT,
        'Identity verification process failed',
        true,
        'Please try again later'
      );
    }
  }

  private async finalizeDocument(doc: PDFDocument, data: any, blockchainVerification: any) {
    try {
      // Add final security wrapper
      const finalDoc = {
        document: await doc.save(),
        verificationData: {
          qrCode: await this.generateVerificationQR(data),
          blockchainReference: blockchainVerification,
          securityFeatures: this.securityFeatures,
          verificationLevels: this.verificationLevels
        },
        metadata: {
          documentType: data.documentType,
          issuanceDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + (5 * 365 * 24 * 60 * 60 * 1000)).toISOString(), // 5 years
          issuingAuthority: 'DHA-RSA'
        }
      };

      // Encrypt the final package using DocumentHelpers
      const encryptedDoc = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: crypto.getRandomValues(new Uint8Array(12))
        },
        await crypto.subtle.importKey(
          "raw",
          crypto.getRandomValues(new Uint8Array(32)),
          "AES-GCM",
          false,
          ["encrypt"]
        ),
        new TextEncoder().encode(JSON.stringify(finalDoc))
      );

      return encryptedDoc;
    } catch (error) {
      throw new VerificationError(
        ErrorCode.INVALID_DOCUMENT,
        'Document finalization failed',
        true,
        'Please try again'
      );
    }
  }

  // Verification methods
  async verifyDocument(encryptedPackage: any) {
    try {
      // Decrypt package with enhanced error handling
      const doc = await this.decryptPackage(encryptedPackage);
      
      // AI-powered document analysis
      const aiAnalysis = await ultraQueenAI.analyzeDocument(doc);
      
      // Enhanced security feature verification with AI
      const securityVerification = await this.verifySecurityFeatures(doc, aiAnalysis);
      
      // Multi-chain verification (Polygon + Solana)
      const blockchainVerification = await this.verifyBlockchainRecord(doc);
      
      // Multi-system DHA verification with retries
      const dhaVerification = await this.verifyWithDHAEnhanced(doc);
      
      // Quantum-safe verification
      const quantumVerification = await this.performQuantumVerification(doc);
      
      const allVerifications = {
        security: securityVerification,
        blockchain: blockchainVerification.valid,
        dha: dhaVerification,
        quantum: quantumVerification,
        ai: aiAnalysis.verified
      };
      
      // Check all verifications passed
      const isVerified = Object.values(allVerifications).every(v => v === true);
      
      return {
        verified: isVerified,
        verifications: allVerifications,
        securityFeatures: this.securityFeatures,
        aiAnalysis: aiAnalysis.details,
        blockchainReferences: {
          polygon: blockchainVerification.polygonHash,
          solana: blockchainVerification.solanaHash
        }
      };
    } catch (error) {
      let verificationError: VerificationError;

      if (error instanceof VerificationError) {
        verificationError = error;
      } else {
        verificationError = new VerificationError(
          ErrorCode.UNKNOWN_ERROR,
          error instanceof Error ? error.message : 'Unknown verification error',
          false,
          'Please contact support'
        );
      }

      return { 
        verified: false, 
        error: verificationError.message,
        errorCode: verificationError.code,
        suggestion: verificationError.suggestion,
        retryable: verificationError.retryable
      };
    }
  }

  // Permit attachment methods
  async attachToPermit(documentType: DHADocumentType, passportData: any, permitData: any) {
    try {
      // Verify passport
      const passportVerification = await this.verifyDocument(passportData);
      if (!passportVerification.verified) {
        throw new VerificationError(
          ErrorCode.INVALID_DOCUMENT,
          'Invalid passport',
          false,
          'Please provide a valid passport'
        );
      }

      // Generate permit
      const permit = await this.generateDocument(documentType, {
        ...permitData,
        passportReference: passportData.documentNumber
      });

      // Create attachment link
      const attachment = {
        passportData,
        permitData: permit,
        linkageHash: this.generateLinkageHash(passportData, permit)
      };

      // Store linkage on blockchain
      await this.storeAttachmentLink(attachment);

      return permit;
    } catch (error) {
      let verificationError: VerificationError;

      if (error instanceof VerificationError) {
        verificationError = error;
      } else {
        verificationError = new VerificationError(
          ErrorCode.PERMIT_ATTACHMENT_FAILED,
          'Permit attachment failed',
          true,
          'Please try again or contact support'
        );
      }

      console.error('Permit attachment failed:', verificationError);
      throw verificationError;
    }
  }
}