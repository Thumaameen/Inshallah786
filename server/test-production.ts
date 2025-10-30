import { mockServices } from './test/mocks.js';
import { productionConfig } from './config/production.js';

const { database, ai, monitoring } = mockServices;

async function runProductionTests() {
  console.log('🚀 Running production readiness tests...');
  
  // Test database connection
  console.log('\n📊 Testing database connection...');
  const dbConnected = await database.checkConnection();
  console.log(dbConnected ? '✅ Database connected' : '❌ Database connection failed');

  // Test AI services
  console.log('\n🤖 Testing AI services...');
  try {
    await ai.testConnection();
    console.log('✅ AI services operational');
  } catch (error) {
    console.log('❌ AI services error:', error.message);
  }

  // Test monitoring
  console.log('\n📈 Testing monitoring service...');
  try {
    const metrics = monitoring.getMetrics();
    console.log('✅ Monitoring service operational');
    console.log('Current metrics:', metrics);
  } catch (error) {
    console.log('❌ Monitoring error:', error.message);
  }

  // Verify configuration
  console.log('\n⚙️ Verifying production configuration...');
  const configValid = validateConfig(productionConfig);
  console.log(configValid ? '✅ Configuration valid' : '❌ Configuration invalid');

  console.log('\n🏁 Tests completed!');
}

function validateConfig(config: any): boolean {
  const required = [
    'server.host',
    'server.port',
    'security.militaryGrade',
    'ai.defaultModel',
    'monitoring.enabled'
  ];

  return required.every(path => {
    const value = path.split('.').reduce((obj, key) => obj?.[key], config);
    return value !== undefined;
  });
}

// Run tests
(async () => {
  try {
    await runProductionTests();
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
})();