
#!/usr/bin/env tsx

/**
 * Frontend-Backend Integration Test
 * Tests all critical API endpoints
 */

async function testIntegration() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Testing Frontend-Backend Integration\n');
  
  const tests = [
    {
      name: 'Health Check',
      endpoint: '/api/health',
      method: 'GET'
    },
    {
      name: 'Document Templates',
      endpoint: '/api/documents/templates',
      method: 'GET'
    },
    {
      name: 'System Status',
      endpoint: '/api/ultra-dashboard/status',
      method: 'GET'
    },
    {
      name: 'Integration Status',
      endpoint: '/api/integrations/status',
      method: 'GET'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const response = await fetch(`${baseUrl}${test.endpoint}`, {
        method: test.method
      });
      
      if (response.ok) {
        console.log(`✅ ${test.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED (${response.status})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR (${error.message})`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

testIntegration();
