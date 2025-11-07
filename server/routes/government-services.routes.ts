import express from 'express';
import { NPRService } from '../services/government/npr.service';
import { SAPSService } from '../services/government/saps.service';
import { ABISService } from '../services/government/abis.service';
import { ICAOService } from '../services/government/icao.service';
import { SITAService } from '../services/government/sita.service';
import { CIPCService } from '../services/government/cipc.service';
import { DELService } from '../services/government/del.service';

const router = express.Router();

// Initialize Government Services
const npr = new NPRService();
const saps = new SAPSService();
const abis = new ABISService();
const icao = new ICAOService();
const sita = new SITAService();
const cipc = new CIPCService();
const del = new DELService();

// NPR Routes
router.get('/npr/verify/:id', async (req: { params: { id: any; }; }, res: { json: (arg0: any) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
  try {
    const verification = await npr.verifyIdentity(req.params.id);
    res.json(verification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SAPS Routes
interface BackgroundCheckRequest {
    id: string;
    type: 'criminal' | 'verification' | 'clearance';
}

interface BackgroundCheckResult {
    status: string;
    result: {
        cleared: boolean;
        details?: string;
        reportId: string;
    };
}

// ABIS Routes
router.post('/abis/verify', async (req: { body: { biometricData: any; }; }, res: { json: (arg0: any) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
  try {
    const { biometricData } = req.body;
    const verification = await abis.verifyBiometric(biometricData);
    res.json(verification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ICAO Routes
router.post('/icao/validate', async (req: { body: { passportData: any; }; }, res: { json: (arg0: any) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
  try {
    const { passportData } = req.body;
    const validation = await icao.validatePassport(passportData);
    res.json(validation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SITA Routes
router.post('/sita/process', async (req: { body: { data: any; type: any; }; }, res: { json: (arg0: any) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
  try {
    const { data, type } = req.body;
    const result = await sita.processRequest(data, type);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CIPC Routes
router.get('/cipc/verify/:registration', async (req: { params: { registration: any; }; }, res: { json: (arg0: any) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
  try {
    const verification = await cipc.verifyBusiness(req.params.registration);
    res.json(verification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DEL Routes
router.post('/del/verify', async (req: { body: { employmentData: any; }; }, res: { json: (arg0: any) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
  try {
    const { employmentData } = req.body;
    const verification = await del.verifyEmployment(employmentData);
    res.json(verification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;