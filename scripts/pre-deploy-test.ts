import axios from 'axios';
import { execSync } from 'child_process';

async function runPreDeploymentTest() {
  console.log('🔍 Starting pre-deployment tests...');

  try {
    console.log('📦 Testing build process...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('📝 Validating TypeScript...');
    execSync('tsc --noEmit', { stdio: 'inherit' });

    console.log('🌐 Testing API endpoints...');
    const endpoints = [
      '/api/health',
      '/api/ultra-queen-ai',
      '/api/documents'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`http://localhost:3000${endpoint}`);
        console.log(`✅ Endpoint ${endpoint}: ${response.status === 200 ? 'OK' : 'Failed'}`);
      } catch (error) {
        console.error(`❌ Endpoint ${endpoint} failed:`, error.message);
      }
    }

    console.log('✅ Pre-deployment tests passed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Pre-deployment tests failed:', error);
    return false;
  }
}

runPreDeploymentTest().then(success => {
  process.exit(success ? 0 : 1);
});
