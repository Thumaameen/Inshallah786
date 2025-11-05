import express from 'express';
import { SecurityService } from '../services/security/security.service';
import { QuantumService } from '../services/security/quantum.service';
import { PKIService } from '../services/security/pki.service';
import { HSMService } from '../services/security/hsm.service';

const router = express.Router();

// Initialize Security Services
const security = new SecurityService();
const quantum = new QuantumService();
const pki = new PKIService();
const hsm = new HSMService();

// Security Routes
router.post('/encrypt', async (req, res) => {
  try {
    const { data, type } = req.body;
    const encrypted = await security.encryptData(data, type);
    res.json(encrypted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/decrypt', async (req, res) => {
  try {
    const { data, type } = req.body;
    const decrypted = await security.decryptData(data, type);
    res.json(decrypted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Quantum Security Routes
router.post('/quantum/encrypt', async (req, res) => {
  try {
    const { data } = req.body;
    const encrypted = await quantum.encryptData(data);
    res.json(encrypted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/quantum/decrypt', async (req, res) => {
  try {
    const { data } = req.body;
    const decrypted = await quantum.decryptData(data);
    res.json(decrypted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PKI Routes
router.post('/pki/sign', async (req, res) => {
  try {
    const { data, keyId } = req.body;
    const signature = await pki.signData(data, keyId);
    res.json(signature);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/pki/verify', async (req, res) => {
  try {
    const { data, signature, keyId } = req.body;
    const verification = await pki.verifySignature(data, signature, keyId);
    res.json(verification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// HSM Routes
router.post('/hsm/sign', async (req, res) => {
  try {
    const { data, keyLabel } = req.body;
    const signature = await hsm.signData(data, keyLabel);
    res.json(signature);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/hsm/verify', async (req, res) => {
  try {
    const { data, signature, keyLabel } = req.body;
    const verification = await hsm.verifySignature(data, signature, keyLabel);
    res.json(verification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;