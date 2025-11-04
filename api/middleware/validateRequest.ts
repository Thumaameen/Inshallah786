import { Request, Response, NextFunction } from 'express';
import { validateAndGetKey } from './keyManagement';

export async function validateRequest(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate API keys
    const openaiKey = await validateAndGetKey('OPENAI_API_KEYS', req);
    const anthropicKey = await validateAndGetKey('ANTHROPIC_API_KEYS', req);
    
    // Attach validated keys to request
    (req as any).validatedKeys = {
      openaiKey,
      anthropicKey
    };

    // Validate request body for document generation
    if (req.path === '/generate' && req.method === 'POST') {
      const { name, passportNumber, nationality } = req.body;
      
      if (!name || !passportNumber || !nationality) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['name', 'passportNumber', 'nationality']
        });
      }
    }

    // Validate request body for document validation
    if (req.path === '/validate' && req.method === 'POST') {
      const { pdf } = req.body;
      
      if (!pdf) {
        return res.status(400).json({
          error: 'Missing PDF data',
          required: ['pdf']
        });
      }

      try {
        Buffer.from(pdf, 'base64');
      } catch {
        return res.status(400).json({
          error: 'Invalid PDF data format. Must be base64 encoded'
        });
      }
    }

    next();
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}