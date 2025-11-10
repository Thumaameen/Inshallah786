import express, { type Router, type Request, type Response } from 'express';
import { UltraPDFEditorService } from '../services/pdf/ultra-pdf-editor.service.js';
import { GlobalDocumentVerificationService } from '../services/document/global-document-verification.service.js';
import { BlockchainService } from '../services/blockchain/blockchain.service.js';
import { BiometricService } from '../services/biometric/biometric.service.js';

const router: Router = express.Router();

// Initialize Services
const pdfEditor = new UltraPDFEditorService();
const documentVerification = new GlobalDocumentVerificationService();
const blockchain = new BlockchainService();
const biometric = new BiometricService();

// PDF Editor Routes
router.post('/edit', async (req: Request, res: Response) => {
  try {
    const { pdfData, edits } = req.body;
    const editedPDF = await pdfEditor.editPDF(pdfData, edits);
    res.json({ success: true, pdf: editedPDF });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Document Verification Routes
router.post('/verify', async (req: { body: { document: any; type: any; }; }, res: { json: (arg0: any) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
  try {
    const { document, type } = req.body;
    const verificationResult = await documentVerification.verifyDocument(document, type);
    res.json(verificationResult);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Blockchain Verification Routes
router.post('/blockchain/verify', async (req: Request, res: Response) => {
  try {
    const { documentHash } = req.body;
    const verification = await blockchain.verifyDocument(documentHash);
    res.json(verification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Biometric Verification Routes
router.post('/biometric/verify', async (req: Request, res: Response) => {
  try {
    const { biometricData, documentId } = req.body;
    const verification = await biometric.verifyBiometric(biometricData, documentId);
    res.json(verification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;