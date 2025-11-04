import { Router } from 'express';
import { documentProcessor } from '../../src/services/document-processor';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post('/generate', validateRequest, async (req, res) => {
  try {
    const { pdf, metadata, validationId } = await documentProcessor.generatePermit(req.body);
    res.json({ success: true, pdf: pdf.toString('base64'), metadata, validationId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/validate', validateRequest, async (req, res) => {
  try {
    const result = await documentProcessor.validateDocument(Buffer.from(req.body.pdf, 'base64'));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;