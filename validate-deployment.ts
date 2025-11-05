import 'dotenv/config';
import fs from 'fs';
import path from 'path';

async function validateDeployment() {
  console.log('🚀 Validating Deployment Configuration\n');

  // Check Node.js and npm versions
  console.log('📦 Environment Versions:');
  console.log(`Node.js: ${process.version} (Required: 20.19.1)`);
  console.log(`npm: ${process.env.npm_version} (Required: 10.2.3)\n`);

  // Validate Critical Directories
  console.log('📁 Validating Directory Structure:');
  const requiredDirs = ['dist', 'dist/public', 'dist/server'];
  for (const dir of requiredDirs) {
    const exists = fs.existsSync(path.join(process.cwd(), dir));
    console.log(`${exists ? '✅' : '❌'} ${dir}`);
  }

  // Validate API Keys
  console.log('\n🔑 Validating API Keys:');
  const requiredKeys = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'MISTRAL_API_KEY',
    'PERPLEXITY_API_KEY',
    'GOOGLE_AI_API_KEY',
    'DHA_NPR_API_KEY',
    'DHA_ABIS_API_KEY',
    'DOCUMENT_ENCRYPTION_KEY',
    'QUANTUM_ENCRYPTION_KEY'
  ];

  for (const key of requiredKeys) {
    const exists = !!process.env[key];
    console.log(`${exists ? '✅' : '❌'} ${key}`);
  }

  // Validate Critical Files
  console.log('\n📄 Validating Critical Files:');
  const criticalFiles = [
    'dist/server/index-minimal.js',
    'dist/public/index.html',
    'package.json',
    'tsconfig.production.json'
  ];

  for (const file of criticalFiles) {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    console.log(`${exists ? '✅' : '❌'} ${file}`);
  }

  // Feature Validation
  console.log('\n⚙️ Validating Features:');
  const features = [
    'POPIA_COMPLIANCE',
    'PFMA_COMPLIANCE',
    'ENABLE_ALL_SECURITY_FEATURES',
    'ENABLE_GOVERNMENT_INTEGRATION',
    'ENABLE_REAL_CERTIFICATES'
  ];

  for (const feature of features) {
    const enabled = process.env[feature] === 'enforced' || process.env[feature] === 'true';
    console.log(`${enabled ? '✅' : '❌'} ${feature}`);
  }

  console.log('\n🎯 Deployment Validation Complete!');
}

validateDeployment().catch(console.error);