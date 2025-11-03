
import { config } from 'dotenv';

config();

console.log('\n🔍 RENDER DEPLOYMENT CONFIGURATION CHECK\n');
console.log('═'.repeat(60));

// Database check
console.log('\n📊 DATABASE:');
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  const isInternal = dbUrl.includes('.internal');
  console.log(`  ✅ DATABASE_URL configured`);
  console.log(`  ℹ️  Type: ${isInternal ? 'Internal (Render PostgreSQL)' : 'External'}`);
} else {
  console.log('  ❌ DATABASE_URL not configured');
}

// Blockchain RPC endpoints
console.log('\n⛓️  BLOCKCHAIN RPC ENDPOINTS:');

const polygonRpc = process.env.POLYGON_RPC_ENDPOINT || process.env.POLYGON_RPC_URL;
if (polygonRpc) {
  console.log('  ✅ Polygon RPC configured');
  console.log(`     URL: ${polygonRpc.substring(0, 30)}...`);
} else {
  console.log('  ⚠️  Polygon RPC not configured (will use public fallback)');
}

const solanaRpc = process.env.SOLANA_RPC_URL || process.env.SOLANA_RPC_ENDPOINT;
if (solanaRpc) {
  console.log('  ✅ Solana RPC configured');
  console.log(`     URL: ${solanaRpc.substring(0, 30)}...`);
} else {
  console.log('  ⚠️  Solana RPC not configured (will use public fallback)');
}

const ethereumRpc = process.env.ETHEREUM_RPC_URL;
if (ethereumRpc) {
  console.log('  ✅ Ethereum RPC configured');
  console.log(`     URL: ${ethereumRpc.substring(0, 30)}...`);
} else {
  console.log('  ⚠️  Ethereum RPC not configured');
}

// Critical services
console.log('\n🔐 CRITICAL SERVICES:');
const criticalServices = [
  'SESSION_SECRET',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY'
];

criticalServices.forEach(service => {
  if (process.env[service]) {
    console.log(`  ✅ ${service} configured`);
  } else {
    console.log(`  ❌ ${service} MISSING`);
  }
});

console.log('\n' + '═'.repeat(60));
console.log('\n✅ Configuration check complete!\n');
