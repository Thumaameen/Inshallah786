import { testConfig } from './test/test-config.ts';

// Set environment variables
Object.entries(testConfig).forEach(([key, value]) => {
  process.env[key] = value;
});

import { ultraAI } from './services/ultra-ai-orchestrator.ts';
import { documentGenerator } from './services/document-generator.ts';
import { dhaApiService } from './services/dha-api-service.ts';

async function verifyComponents() {
  console.log('🔍 Verifying all components...\n');
  
  // Test AI System
  try {
    const aiTest = await ultraAI.processWithAllAI({
      message: "Test system capabilities",
      userId: "system_test",
      accessLevel: "military"
    });
    console.log('✅ AI System: Operational');
  } catch (error) {
    console.error('❌ AI System Error:', error);
  }

  // Test Document Generation
  try {
    const docTest = await documentGenerator.generateOfficialDocument({
      documentType: 'test',
      data: { test: true }
    });
    console.log('✅ Document Generation: Operational');
  } catch (error) {
    console.error('❌ Document Generation Error:', error);
  }

  // Test DHA Integration
  try {
    const dhaTest = await dhaApiService.verifyWithDHA('TEST_DOC');
    console.log('✅ DHA Integration: Operational');
  } catch (error) {
    console.error('❌ DHA Integration Error:', error);
  }

  console.log('\n🏁 Verification complete!');
}

verifyComponents().catch(console.error);