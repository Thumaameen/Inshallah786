import { PDFDocument } from 'pdf-lib';
import { ultraQueenAI } from '../services/ultra-queen-ai.js';
import { ErrorCode, VerificationError } from '../types/errors.js';
import { DHADocumentType } from '../types/documents.js';
import { NPRService } from '../services/government/npr.service.js';
import { ABISService } from '../services/government/abis.service.js';
import { BlockchainService } from '../services/blockchain.service.js';

export class DocumentVerificationHelpers {
  static async verifyHologram(doc: PDFDocument): Promise<boolean> {
    try {
      const hologramData = await (ultraQueenAI as any).analyzeSecurityFeature(doc, 'hologram');
      return hologramData.valid && hologramData.confidence > 0.95;
    } catch (error) {
      console.error('Hologram verification failed:', error);
      return false;
    }
  }

  static async verifyMicroprint(doc: PDFDocument): Promise<boolean> {
    try {
      const microprintData = await (ultraQueenAI as any).analyzeSecurityFeature(doc, 'microprint');
      return microprintData.valid && microprintData.textClear && microprintData.resolution > 1200;
    } catch (error) {
      console.error('Microprint verification failed:', error);
      return false;
    }
  }

  static async verifyUVFeatures(doc: PDFDocument): Promise<boolean> {
    try {
      const uvData = await (ultraQueenAI as any).analyzeSecurityFeature(doc, 'uv');
      return uvData.valid && uvData.patternMatch && uvData.fluorescence > 0.9;
    } catch (error) {
      console.error('UV features verification failed:', error);
      return false;
    }
  }

  static async verifyRFID(doc: PDFDocument): Promise<boolean> {
    try {
      const rfidData = await (ultraQueenAI as any).analyzeSecurityFeature(doc, 'rfid');
      return rfidData.valid && rfidData.signatureValid && rfidData.dataIntegrity;
    } catch (error) {
      console.error('RFID verification failed:', error);
      return false;
    }
  }

  static async verifySecurityThread(doc: PDFDocument): Promise<boolean> {
    try {
      const threadData = await (ultraQueenAI as any).analyzeSecurityFeature(doc, 'thread');
      return threadData.valid && threadData.position === 'correct' && threadData.material === 'authentic';
    } catch (error) {
      console.error('Security thread verification failed:', error);
      return false;
    }
  }

  static async verifyOpticalVariableInk(doc: PDFDocument): Promise<boolean> {
    try {
      const oviData = await (ultraQueenAI as any).analyzeSecurityFeature(doc, 'ovi');
      return oviData.valid && oviData.colorShift && oviData.pattern === 'authentic';
    } catch (error) {
      console.error('Optical variable ink verification failed:', error);
      return false;
    }
  }

  static async verifyGhostImage(doc: PDFDocument): Promise<boolean> {
    try {
      const ghostData = await (ultraQueenAI as any).analyzeSecurityFeature(doc, 'ghost');
      return ghostData.valid && ghostData.clarity > 0.85 && ghostData.matches;
    } catch (error) {
      console.error('Ghost image verification failed:', error);
      return false;
    }
  }

  static async verifyGuilloche(doc: PDFDocument): Promise<boolean> {
    try {
      const guillocheData = await (ultraQueenAI as any).analyzeSecurityFeature(doc, 'guilloche');
      return guillocheData.valid && guillocheData.pattern === 'authentic' && guillocheData.complexity > 0.9;
    } catch (error) {
      console.error('Guilloche verification failed:', error);
      return false;
    }
  }

  static async verifyWatermark(doc: PDFDocument): Promise<boolean> {
    try {
      const watermarkData = await (ultraQueenAI as any).analyzeSecurityFeature(doc, 'watermark');
      return watermarkData.valid && watermarkData.visibility === 'correct' && watermarkData.pattern === 'authentic';
    } catch (error) {
      console.error('Watermark verification failed:', error);
      return false;
    }
  }

  static async verifyEmbossing(doc: PDFDocument): Promise<boolean> {
    try {
      const embossingData = await (ultraQueenAI as any).analyzeSecurityFeature(doc, 'embossing');
      return embossingData.valid && embossingData.depth > 0.8 && embossingData.pattern === 'authentic';
    } catch (error) {
      console.error('Embossing verification failed:', error);
      return false;
    }
  }

  static async verifyWithDHA(doc: PDFDocument, documentType: DHADocumentType): Promise<boolean> {
    try {
      // Verify with NPR
      const nprResult = await NPRService.verifyDocument(doc, documentType);
      if (!nprResult.valid) {
        throw new VerificationError(
          ErrorCode.NPR_VERIFICATION_FAILED,
          'NPR verification failed',
          true
        );
      }

      // Verify with ABIS
      const abisResult = await ABISService.verifyBiometrics(doc);
      if (!abisResult.valid) {
        throw new VerificationError(
          ErrorCode.ABIS_VERIFICATION_FAILED,
          'ABIS verification failed',
          true
        );
      }

      return true;
    } catch (error) {
      console.error('DHA verification failed:', error);
      return false;
    }
  }

  static async verifyBlockchainRecord(doc: PDFDocument): Promise<boolean> {
    try {
      // Verify on Polygon network
      const polygonVerification = await blockchainService.verifyOnPolygon(doc);
      if (!polygonVerification.valid) {
        throw new VerificationError(
          ErrorCode.BLOCKCHAIN_VERIFICATION_FAILED,
          'Polygon verification failed',
          true
        );
      }

      // Verify on Solana network
      const solanaVerification = await blockchainService.verifyOnSolana(doc);
      if (!solanaVerification.valid) {
        throw new VerificationError(
          ErrorCode.BLOCKCHAIN_VERIFICATION_FAILED,
          'Solana verification failed',
          true
        );
      }

      return true;
    } catch (error) {
      console.error('Blockchain verification failed:', error);
      return false;
    }
  }
}