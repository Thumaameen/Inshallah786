
#!/bin/bash

echo "🚀 DHA Digital Services - Production Setup"
echo "=========================================="
echo ""

echo "📝 Setting Production Environment Variables..."

# Force Production Mode
export NODE_ENV=production
export FORCE_PRODUCTION=true

# Core Configuration
export PORT=5000
export HOST=0.0.0.0

echo "✅ Production mode enabled"
echo ""

echo "🔑 Required API Keys (add to Replit Secrets):"
echo "=============================================="
echo ""
echo "AI Providers:"
echo "  OPENAI_API_KEY=sk-..." 
echo "  ANTHROPIC_API_KEY=sk-ant-..."
echo "  MISTRAL_API_KEY=..."
echo "  GOOGLE_AI_API_KEY=..."
echo "  PERPLEXITY_API_KEY=pplx-..."
echo ""
echo "Web Services:"
echo "  STRIPE_SECRET_KEY=sk_live_..."
echo "  TWILIO_AUTH_TOKEN=..."
echo "  SENDGRID_API_KEY=SG...."
echo "  GITHUB_TOKEN=ghp_..."
echo ""
echo "Blockchain:"
echo "  ETHEREUM_RPC_URL=https://..."
echo "  POLYGON_RPC_URL=https://..."
echo "  SOLANA_RPC_URL=https://..."
echo ""
echo "Cloud Platforms:"
echo "  AWS_ACCESS_KEY_ID=..."
echo "  AWS_SECRET_ACCESS_KEY=..."
echo "  AZURE_CLIENT_ID=..."
echo "  AZURE_CLIENT_SECRET=..."
echo "  GOOGLE_CLOUD_PROJECT=..."
echo ""
echo "Government APIs (already configured):"
echo "  ✅ DHA_NPR_API_KEY"
echo "  ✅ DHA_ABIS_API_KEY"
echo "  ✅ SAPS_CRC_API_KEY"
echo "  ✅ ICAO_PKD_API_KEY"
echo ""

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --production

echo ""
echo "✅ Production setup complete!"
echo ""
echo "To start in production mode:"
echo "  NODE_ENV=production npm start"
