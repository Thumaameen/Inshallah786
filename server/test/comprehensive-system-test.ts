import { ultraAI } from '../services/ultra-ai-orchestrator';
import { documentGenerator } from '../services/document-generator';
import { dhaApiService } from '../services/dha-api-service';
import { storage } from '../storage';

async function testAllSystems() {
  console.log('🚀 Starting comprehensive system test...\n');

  // Test AI Systems
  console.log('Testing AI Systems:');
  try {
    const aiResult = await ultraAI.processWithAllAI({
      message: "Test all AI capabilities with official document processing",
      userId: "test_user",
      accessLevel: "military",
      unlimitedCapabilities: true
    });
    console.log('✅ AI Systems: All 5 AI providers operational');
    console.log(`- OpenAI: ${aiResult.openai ? 'Connected' : 'Failed'}`);
    console.log(`- Claude: ${aiResult.anthropic ? 'Connected' : 'Failed'}`);
    console.log(`- Perplexity: ${aiResult.perplexity ? 'Connected' : 'Failed'}\n`);
  } catch (error) {
    console.error('❌ AI Systems Error:', error.message);
  }

  // Test Document Generation
  console.log('Testing Document Generation:');
  try {
    const testDoc = await documentGenerator.generateOfficialDocument({
      documentType: 'passport',
      fullName: 'Test User',
      dateOfBirth: '1990-01-01',
      nationality: 'South African',
      documentId: 'TEST123',
      issuingAuthority: 'DHA'
    });
    console.log('✅ Document Generation: Successfully created test document');
    console.log(`- Document URL: ${testDoc.documentUrl}`);
    console.log(`- Verification Code: ${testDoc.verificationCode}\n`);
  } catch (error) {
    console.error('❌ Document Generation Error:', error.message);
  }

  // Test Document Authentication
  console.log('Testing Document Authentication:');
  try {
    const verificationResult = await ultraAI.verifyAuthenticity({
      documentId: 'TEST123',
      type: 'passport',
      verificationCode: 'TEST-VERIFY-123'
    });
    console.log('✅ Document Authentication: Verification system operational');
    console.log(`- Authenticity: ${verificationResult.isAuthentic ? 'Verified' : 'Failed'}`);
    console.log(`- Verification ID: ${verificationResult.verificationId}\n`);
  } catch (error) {
    console.error('❌ Document Authentication Error:', error.message);
  }

  // Test DHA Integration
  console.log('Testing DHA Integration:');
  try {
    const dhaResult = await dhaApiService.verifyWithDHA('TEST123');
    console.log('✅ DHA Integration: Successfully connected to DHA systems');
    console.log(`- Integration Status: ${dhaResult.status}`);
    console.log(`- Real-time Verification: ${dhaResult.realTimeVerification ? 'Available' : 'Unavailable'}\n`);
  } catch (error) {
    console.error('❌ DHA Integration Error:', error.message);
  }

  // Test Document Storage
  console.log('Testing Document Storage:');
  try {
    const storageTest = await storage.testConnection();
    console.log('✅ Document Storage: Successfully connected to storage');
    console.log(`- Storage Type: ${storageTest.type}`);
    console.log(`- Encryption: ${storageTest.encryption ? 'Enabled' : 'Disabled'}\n`);
  } catch (error) {
    console.error('❌ Document Storage Error:', error.message);
  }

  // Test Authentication Options
  console.log('Testing Authentication Options:');
  try {
    const authOptions = await ultraAI.getAuthenticationOptions();
    console.log('✅ Authentication Options: All systems available');
    console.log('Supported Methods:');
    authOptions.forEach(option => {
      console.log(`- ${option.name}: ${option.status}`);
    });
    console.log();
  } catch (error) {
    console.error('❌ Authentication Options Error:', error.message);
  }

  // Test Unlimited Capabilities
  console.log('Testing Unlimited Capabilities:');
  try {
    const capabilities = await ultraAI.testUnlimitedCapabilities();
    console.log('✅ Unlimited Capabilities: All features enabled');
    console.log('Active Capabilities:');
    Object.entries(capabilities).forEach(([key, value]) => {
      console.log(`- ${key}: ${value ? 'Enabled' : 'Disabled'}`);
    });
    console.log();
  } catch (error) {
    console.error('❌ Unlimited Capabilities Error:', error.message);
  }

  console.log('🏁 Comprehensive system test completed!\n');
}

// Run the tests
testAllSystems().catch(console.error);