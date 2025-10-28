
/**
 * Production Deployment Verification
 * Run this after deployment to verify all systems
 */

async function verifyProductionDeployment(baseUrl: string) {
  console.log('🔍 PRODUCTION DEPLOYMENT VERIFICATION');
  console.log('=====================================');
  console.log(`Testing: ${baseUrl}\n`);

  const tests = [
    {
      name: 'Health Check',
      endpoint: '/api/health',
      validate: (data: any) => data.status === 'healthy' && data.environment === 'production'
    },
    {
      name: 'System Status',
      endpoint: '/api/system/status',
      validate: (data: any) => data.status === 'operational' && data.environment === 'production'
    },
    {
      name: 'Frontend Load',
      endpoint: '/',
      validate: (html: string) => html.includes('DHA Digital Services')
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const response = await fetch(`${baseUrl}${test.endpoint}`);
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (test.validate(data)) {
        console.log(`✅ ${test.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED (invalid response)`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED (${error.message})`);
      failed++;
    }
  }

  console.log('\n=====================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(failed === 0 ? '✅ DEPLOYMENT VERIFIED' : '❌ DEPLOYMENT ISSUES DETECTED');
  
  return failed === 0;
}

// Run verification
const deploymentUrl = process.env.RENDER_EXTERNAL_URL || 'https://dha-thisone.onrender.com';
verifyProductionDeployment(deploymentUrl)
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
