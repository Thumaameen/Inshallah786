import { SecurityFeaturesV2 } from './security-features-v2.js';
import { MRZParser } from './dha-mrz-parser.js';
import { DocumentService } from './document-service.js';
import { EnhancedDocumentService } from './enhanced-document.service.js';
import { PKDService } from './icao-pkd-integration.js';
import { NPRService } from './dha-npr-adapter.js';
import { ABISService } from './dha-abis-adapter.js';
import { BlockchainService } from './blockchain-service.js';
import { QuantumEncryptionService } from './quantum-security.service.js';

export class IntegratedSecurityService {
  private readonly securityFeatures: SecurityFeaturesV2;
  private readonly mrzParser: MRZParser;
  private readonly documentService: DocumentService;
  private readonly enhancedService: EnhancedDocumentService;
  private readonly pkdService: PKDService;
  private readonly nprService: NPRService;
  private readonly abisService: ABISService;
  private readonly blockchainService: BlockchainService;
  private readonly quantumService: QuantumEncryptionService;

  constructor() {
    this.securityFeatures = new SecurityFeaturesV2();
    this.mrzParser = new MRZParser();
    this.documentService = new DocumentService();
    this.enhancedService = new EnhancedDocumentService();
    this.pkdService = new PKDService();
    this.nprService = new NPRService();
    this.abisService = new ABISService();
    this.blockchainService = new BlockchainService();
    this.quantumService = new QuantumEncryptionService();
  }

  async validateDocument(document: any): Promise<boolean> {
    // 1. Verify document integrity
    const integrityCheck = await this.securityFeatures.verifyIntegrity(document);
    if (!integrityCheck) return false;

    // 2. Parse and validate MRZ
    const mrzData = await this.mrzParser.parse(document.mrz);
    if (!mrzData.isValid) return false;

    // 3. Check with NPR
    const nprVerification = await this.nprService.verifyIdentity(mrzData.idNumber);
    if (!nprVerification.verified) return false;

    // 4. Validate against PKD
    const pkdValidation = await this.pkdService.validateDocument(document);
    if (!pkdValidation.valid) return false;

    // 5. Check biometric data
    if (document.biometricData) {
      const biometricVerification = await this.abisService.verifyBiometrics(document.biometricData);
      if (!biometricVerification.match) return false;
    }

    // 6. Verify blockchain record
    const blockchainVerification = await this.blockchainService.verifyDocument(document.blockchainHash);
    if (!blockchainVerification.verified) return false;

    // 7. Quantum security check
    const quantumCheck = await this.quantumService.verifyEncryption(document.encryptedData);
    if (!quantumCheck.secure) return false;

    return true;
  }

  async generateSecureDocument(data: any): Promise<any> {
    // 1. Generate base document
    const baseDoc = await this.documentService.generateDocument(data);

    // 2. Add enhanced security features
    const enhancedDoc = await this.enhancedService.generateSecureDocument(data.documentType, baseDoc);

    // 3. Add MRZ
    const mrz = await this.mrzParser.generate(data);
    enhancedDoc.mrz = mrz;

    // 4. Register with PKD
    await this.pkdService.registerDocument(enhancedDoc);

    // 5. Add blockchain verification
    const blockchainData = await this.blockchainService.addDocument(enhancedDoc);
    enhancedDoc.blockchainHash = blockchainData.hash;

    // 6. Apply quantum encryption
    const encryptedDoc = await this.quantumService.encrypt(enhancedDoc);

    return encryptedDoc;
  }

  async verifyAuthenticity(document: any): Promise<{
    valid: boolean;
    securityFeatures: string[];
    verificationMethod: string;
    blockchainVerification?: any;
    quantumVerification?: any;
  }> {
    const validDocument = await this.validateDocument(document);
    if (!validDocument) return { valid: false, securityFeatures: [], verificationMethod: 'none' };

    return {
      valid: true,
      securityFeatures: this.securityFeatures.getEnabledFeatures(document.documentType),
      verificationMethod: 'integrated',
      blockchainVerification: await this.blockchainService.getVerificationDetails(document.blockchainHash),
      quantumVerification: await this.quantumService.getVerificationDetails(document.encryptedData)
    };
  }
}

export const integratedSecurityService = new IntegratedSecurityService();