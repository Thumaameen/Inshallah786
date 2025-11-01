
#!/bin/bash

echo "🧪 RENDER DEPLOYMENT TEST"
echo "========================="
echo ""

echo "📋 Testing API Key Detection..."
node -e "
const keys = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY', 
  'DATABASE_URL',
  'DHA_NPR_API_KEY',
  'DHA_ABIS_API_KEY'
];

keys.forEach(key => {
  const val = process.env[key];
  const status = val ? '✅' : '❌';
  const len = val ? val.length : 0;
  console.log(\`  \${status} \${key}: \${len} chars\`);
});
"

echo ""
echo "🔍 Testing API Connections..."
curl -s http://localhost:5000/api/health/full | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
console.log('Platform:', data.platform);
console.log('Environment:', data.environment);
console.log('');
console.log('API Tests:');
Object.entries(data.tests).forEach(([name, result]) => {
  console.log(\`  \${result.status} \${name}: \${result.message || result.error || 'OK'}\`);
});
console.log('');
console.log('Summary:', data.summary.healthy + '/' + data.summary.total, 'healthy (' + data.summary.percentage + '%)');
"

echo ""
echo "✅ Test Complete!"
