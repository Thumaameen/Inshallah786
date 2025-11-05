import { Router } from 'express';
import { militaryGradeAIAssistant, MilitaryRole, ClearanceLevel, CommandType, ClassificationLevel, MilitaryAIResponse } from '../services/military-grade-ai-assistant';
import { validateJWT } from '../middleware/auth';

const router = Router();

router.use(validateJWT);

router.post('/process', async (req: { body: { conversationId?: any; botMode?: any; targetAction?: any; executionContext?: any; autoExecute?: any; message?: any; commandType?: any; }; user: { id: any; clearanceLevel: any; role: any; }; }, res: { json: (arg0: MilitaryAIResponse) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; message: any; }): void; new(): any; }; }; }) => {
  try {
    const { message, commandType = CommandType.GENERAL_QUERY } = req.body;

    // Get user context from JWT
    const userContext = {
      userId: req.user.id,
      clearanceLevel: req.user.clearanceLevel || ClearanceLevel.CIVILIAN,
      militaryRole: req.user.role || MilitaryRole.CIVILIAN_USER,
      lastSecurityValidation: new Date(),
      accessibleClassifications: [ClassificationLevel.UNCLASSIFIED],
      specialAccessPrograms: [],
      commandAuthority: false,
      auditTrailRequired: true
    };

    const response = await militaryGradeAIAssistant.processCommand({
      message,
      commandType,
      classificationLevel: ClassificationLevel.UNCLASSIFIED,
      userContext,
      conversationId: req.body.conversationId || crypto.randomUUID(),
      botMode: req.body.botMode,
      targetAction: req.body.targetAction,
      executionContext: req.body.executionContext,
      autoExecute: req.body.autoExecute
    });

    res.json(response);
    
  } catch (error) {
    console.error('Military AI processing error:', error);
    res.status(500).json({
      error: 'Military AI processing failed',
      message: error.message
    });
  }
});

router.post('/document-security', async (req: { body: { documentType: any; }; }, res: { json: (arg0: any) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; message: any; }): void; new(): any; }; }; }) => {
  try {
    const { documentType } = req.body;
    const securityInfo = militaryGradeAIAssistant.getSecurityFeatureKnowledge(documentType);
    res.json(securityInfo);
  } catch (error) {
    console.error('Security feature retrieval failed:', error);
    res.status(500).json({
      error: 'Security feature retrieval failed',
      message: error.message
    });
  }
});

export default router;