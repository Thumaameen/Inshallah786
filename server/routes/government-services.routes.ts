import express, { type Router, type Request, type Response } from 'express';
import { NPRService } from '../services/government/npr.service.js';
import { SAPSService } from '../services/government/saps.service.js';
import { ABISService } from '../services/government/abis.service.js';
import { ICAOService } from '../services/government/icao.service.js';
import { SITAService } from '../services/government/sita.service.js';
import { CIPCService } from '../services/government/cipc.service.js';
import { DELService } from '../services/government/del.service.js';

const router: Router = express.Router();

// Initialize Government Services
const npr = new NPRService();
const saps = new SAPSService();
const abis = new ABISService();
const icao = new ICAOService();
const sita = new SITAService();
const cipc = new CIPCService();
const del = new DELService();

// NPR Routes
router.get('/npr/verify/:id', async (req: Request<{ id: any; }>, res: Response) => {
  try {
    const verification = await npr.verifyIdentity(req.params.id);
    res.json(verification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SAPS Routes
router.post('/saps/background-check', async (req: Request, res: Response) => {
  try {
    const { id, type } = req.body;
    const result = await saps.performBackgroundCheck(id, type);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ABIS Routes
router.post('/abis/verify', async (req: Request<{}, {}, { biometricData: any; }>, res: Response) => {
  try {
    const { biometricData } = req.body;
    const verification = await abis.verifyBiometric(biometricData);
    res.json(verification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ICAO Routes
router.post('/icao/validate', async (req: Request<{}, {}, { passportData: any; }>, res: Response) => {
  try {
    const { passportData } = req.body;
    const validation = await icao.validatePassport(passportData);
    res.json(validation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SITA Routes
router.post('/sita/process', async (req: Request<{}, {}, { data: any; type: any; }>, res: Response) => {
  try {
    const { data, type } = req.body;
    const result = await sita.processRequest(data, type);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CIPC Routes
router.get('/cipc/verify/:registration', async (req: Request<{ registration: any; }>, res: Response) => {
  try {
    const verification = await cipc.verifyBusiness(req.params.registration);
    res.json(verification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DEL Routes
router.post('/del/verify', async (req: Request<{}, {}, { employmentData: any; }>, res: Response) => {
  try {
    const { employmentData } = req.body;
    const verification = await del.verifyEmployment(employmentData);
    res.json(verification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;