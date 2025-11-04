#!/bin/bash
set -e

echo "🚀 DHA Production Build & Deployment"
echo "==================================="

# Enforce Node.js version
required_node="v20.19.1"
current_node=$(node -v)

if [ "$current_node" != "$required_node" ]; then
    echo "❌ Error: Required Node.js version $required_node not found (current: $current_node)"
    exit 1
fi

# Environment Setup
export NODE_ENV=production
export RENDER=true
export NODE_OPTIONS="--max-old-space-size=4096 --experimental-modules --es-module-specifier-resolution=node"

# Verify environment variables
required_vars=(
    "OPENAI_API_KEY"
    "ANTHROPIC_API_KEY"
    "AZURE_OPENAI_KEY"
    "GOOGLE_AI_KEY"
    "PERPLEXITY_API_KEY"
    "TOGETHER_API_KEY"
    "SOLANA_MAINNET_RPC"
    "ETH_MAINNET_RPC"
    "POLYGON_MAINNET_RPC"
    "DATABASE_URL"
    "JWT_SECRET"
    "SESSION_SECRET"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    fi
done

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist client/dist node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --no-audit

# Install specific versions for stability
npm install --save-exact \
    vite@5.1.6 \
    @vitejs/plugin-react@5.1.6 \
    @tanstack/react-query@5.28.0 \
    @solana/web3.js@1.98.4 \
    ethers@6.15.0 \
    web3@4.16.0

# Build client with Vite
echo "🎨 Building client..."
cd client

echo "📦 Installing client dependencies..."
npm install --legacy-peer-deps
npm install --save-dev \
    vite@latest \
    @vitejs/plugin-react \
    @types/react \
    @types/react-dom \
    @types/node

echo "🔨 Building client with Vite..."
VITE_APP_ENV=production \
NODE_ENV=production \
npm run build

cd ..

# Verify client build
if [ ! -f "client/dist/index.html" ]; then
    echo "❌ Client build failed"
    exit 1
fi

# Build server
echo "⚙️ Building server..."
npx tsc -p tsconfig.production.json --skipLibCheck --noEmitOnError false

# Fix ES Module imports
echo "🔧 Fixing ES module imports..."
find dist -type f -name "*.js" -exec sed -i -E 's|from ["'\''](\.\.?/[^"'\''\.]+)["'\'']|from "\1.js"|g' {} +

# Setup production structure
echo "📋 Setting up production structure..."
mkdir -p dist/public
cp -r client/dist/* dist/public/

# Verify build artifacts
if [ ! -f "dist/server/index-minimal.js" ]; then
    echo "❌ Server build failed - index-minimal.js not found"
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Client build failed - index.html not found"
    exit 1
fi

# Optimize production build
echo "📦 Optimizing production build..."
npm prune --production

echo "✅ Build completed successfully!"
echo "📝 Build artifacts:"
echo "  - Server: dist/server/index-minimal.js"
echo "  - Client: dist/public/index.html"
echo "🚀 Ready for production deployment"