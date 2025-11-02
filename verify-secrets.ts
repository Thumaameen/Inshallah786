
#!/usr/bin/env tsx

console.log('🔐 Verifying API Keys from Replit Secrets\n');
console.log('==========================================\n');

const requiredKeys = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'MISTRAL_API_KEY',
  'GOOGLE_API_KEY',
  'PERPLEXITY_API_KEY',
  'DATABASE_URL',
  'SESSION_SECRET',
  'JWT_SECRET'
];

const optionalKeys = [
  'DHA_NPR_API_KEY',
  'DHA_ABIS_API_KEY',
  'SAPS_CRC_API_KEY',
  'ICAO_PKD_API_KEY',
  'ETHEREUM_RPC_URL',
  'POLYGON_RPC_URL',
  'GITHUB_TOKEN',
  'STRIPE_SECRET_KEY'
];

let passCount = 0;
let totalCount = 0;

console.log('Required API Keys:');
console.log('------------------');
for (const key of requiredKeys) {
  totalCount++;
  const value = process.env[key] || process.env[key.replace('_KEY', '_API_KEY')] || process.env[key.replace('_API_KEY', '_KEY')];
  if (value && value.length > 0) {
    console.log(`✅ ${key}: Configured (${value.substring(0, 10)}...)`);
    passCount++;
  } else {
    console.log(`❌ ${key}: Not configured`);
  }
}

console.log('\nOptional API Keys:');
console.log('------------------');
for (const key of optionalKeys) {
  totalCount++;
  const value = process.env[key] || process.env[key.replace('_KEY', '_API_KEY')] || process.env[key.replace('_API_KEY', '_KEY')];
  if (value && value.length > 0) {
    console.log(`✅ ${key}: Configured (${value.substring(0, 10)}...)`);
    passCount++;
  } else {
    console.log(`⚠️  ${key}: Not configured (optional)`);
  }
}

console.log('\n==========================================');
console.log(`System Rate: ${Math.round((passCount / totalCount) * 100)}%`);
console.log(`Configured: ${passCount}/${totalCount} API keys`);
console.log('==========================================\n');

if (passCount === totalCount) {
  console.log('🎉 All API keys configured! System ready for production.\n');
  process.exit(0);
} else if (passCount >= requiredKeys.length) {
  console.log('✅ All required API keys configured. System operational.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some required API keys missing. Please configure them in Replit Secrets.\n');
  process.exit(1);
}
