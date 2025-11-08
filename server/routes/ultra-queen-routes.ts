import { Router } from 'express';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10
  }
});

// Verify Queen Raeesa access
const verifyQueenAccess = async (req: any, res: any, next: any) => {
  const userEmail = req.headers['x-user-email'] || req.body.userEmail;
  const biometricToken = req.headers['x-biometric-token'];

  if (userEmail !== 'raeesa.osman@admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Ultra Queen AI is exclusive to Queen Raeesa.'
    });
  }

  if (biometricToken) {
    const verified = await biometricService.verifyToken(biometricToken);
    if (!verified) {
      return res.status(403).json({
        success: false,
        error: 'Biometric verification failed.'
      });
    }
  }

  next();
};

// Apply Queen verification to all routes
router.use(verifyQueenAccess);

// Get system status
router.get('/status', async (req, res) => {
  const status = ultraQueenAIEnhanced.getStatus();
  const govAPIs = await governmentAPIs.getConnectionStatus();

  res.json({
    success: true,
    status: {
      ai: status,
      government: govAPIs,
      documentGeneration: await dhaDocumentGenerator.getStatus(),
      biometric: await biometricService.getStatus()
    }
  });
});

// Process AI request
router.post('/process', upload.array('attachments'), async (req, res) => {
  const {
    message,
    provider,
    mode,
    userEmail
  } = req.body;

  const files = req.files as Express.Multer.File[];
  
  const attachments = files?.map(file => ({
    type: file.mimetype,
    data: file.path
  })) || [];

  const response = await ultraQueenAIEnhanced.process({
    message,
    userEmail,
    provider,
    attachments,
    mode
  });

  res.json(response);
});

// Generate document
router.post('/generate-document', upload.single('template'), async (req, res) => {
  const {
    documentType,
    data,
    userEmail
  } = req.body;

  const template = req.file;

  try {
    const document = await dhaDocumentGenerator.generate({
      type: documentType,
      data: JSON.parse(data),
      template: template?.path,
      userEmail
    });

    res.json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Document generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate document'
    });
  }
});

export default router;