#!/bin/bash

echo "🚀 DHA Digital Services - API Setup Validation"
echo "=========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Run setup-api-keys.sh first to create it"
    exit 1
fi

# Core AI Services
echo -e "\n📡 Testing Core AI Services..."
if grep -q "OPENAI_API_KEY=YOUR_" .env; then
    echo "❌ OpenAI API key not configured"
else
    echo "✅ OpenAI API key found"
fi

if grep -q "ANTHROPIC_API_KEY=YOUR_" .env; then
    echo "❌ Anthropic API key not configured"
else
    echo "✅ Anthropic API key found"
fi

if grep -q "MISTRAL_API_KEY=YOUR_" .env; then
    echo "❌ Mistral API key not configured"
else
    echo "✅ Mistral API key found"
fi

if grep -q "GEMINI_API_KEY=YOUR_" .env; then
    echo "❌ Gemini API key not configured"
else
    echo "✅ Gemini API key found"
fi

if grep -q "PERPLEXITY_API_KEY=YOUR_" .env; then
    echo "❌ Perplexity API key not configured"
else
    echo "✅ Perplexity API key found"
fi

# Government APIs
echo -e "\n🏛️ Testing Government APIs..."
if grep -q "DHA_NPR_API_KEY=YOUR_" .env; then
    echo "❌ DHA NPR API key not configured"
else
    echo "✅ DHA NPR API key found"
fi

if grep -q "DHA_ABIS_API_KEY=YOUR_" .env; then
    echo "❌ DHA ABIS API key not configured"
else
    echo "✅ DHA ABIS API key found"
fi

if grep -q "SAPS_CRC_API_KEY=YOUR_" .env; then
    echo "❌ SAPS CRC API key not configured"
else
    echo "✅ SAPS CRC API key found"
fi

# Database and Security
echo -e "\n🔐 Testing Database and Security Configuration..."
if grep -q "DATABASE_URL=YOUR_" .env; then
    echo "❌ Database URL not configured"
else
    echo "✅ Database URL found"
fi

if grep -q "SESSION_SECRET=" .env && ! grep -q "SESSION_SECRET=YOUR_" .env; then
    echo "✅ Session secret configured"
else
    echo "❌ Session secret not found"
fi

if grep -q "JWT_SECRET=" .env && ! grep -q "JWT_SECRET=YOUR_" .env; then
    echo "✅ JWT secret configured"
else
    echo "❌ JWT secret not found"
fi

# Blockchain Configuration
echo -e "\n⛓️ Testing Blockchain Configuration..."
if grep -q "ETHEREUM_RPC_URL=" .env && ! grep -q "ETHEREUM_RPC_URL=YOUR_" .env; then
    echo "✅ Ethereum RPC URL configured"
else
    echo "❌ Ethereum RPC URL not found"
fi

if grep -q "POLYGON_RPC_URL=" .env && ! grep -q "POLYGON_RPC_URL=YOUR_" .env; then
    echo "✅ Polygon RPC URL configured"
else
    echo "❌ Polygon RPC URL not found"
fi

if grep -q "SOLANA_RPC_URL=" .env && ! grep -q "SOLANA_RPC_URL=YOUR_" .env; then
    echo "✅ Solana RPC URL configured"
else
    echo "❌ Solana RPC URL not found"
fi

echo -e "\n📋 Next Steps:"
echo "1. Replace any ❌ items with actual API keys in .env"
echo "2. Run 'npm run test:all' for full system validation"
echo "3. Run 'npm run test:render' for deployment readiness"
echo "4. Check 'render.yaml' for service configuration"
echo ""
echo "For detailed setup instructions, see:"
echo "- RENDER_ENV_SETUP_GUIDE.md"
echo "- RENDER_DEPLOYMENT_CHECKLIST.md"