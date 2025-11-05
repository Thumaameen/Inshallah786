#!/bin/bash
set -e

echo "🚀 DHA Production Deployment"
echo "==================================="

# Environment Setup
export NODE_ENV=production
export NODE_VERSION=20.19.1
export NODE_OPTIONS="--max-old-space-size=4096 --experimental-modules --es-module-specifier-resolution=node"

# Check Node version
if [ "$(node -v)" != "v$NODE_VERSION" ]; then
    echo "❌ Required Node.js version v$NODE_VERSION not found"
    echo "Current version: $(node -v)"
    exit 1
fi

# Install dependencies with exact versions
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --save-exact \
    @tanstack/react-query@5.28.0 \
    @solana/web3.js@1.98.4 \
    ethers@6.15.0 \
    web3@4.16.0 \
    vite@5.1.6 \
    @vitejs/plugin-react@4.2.1

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist client/dist

# Build client
echo "🎨 Building client..."
cd client
npm install --legacy-peer-deps
NODE_ENV=production CI=false npm run build
cd ..

# Verify client build
if [ ! -f "client/dist/index.html" ]; then
    echo "❌ Client build failed"
    exit 1
fi

# Build server
echo "⚙️ Building server..."
npx tsc -p tsconfig.production.json \
    --skipLibCheck \
    --noEmitOnError false

# Fix ES Module imports
echo "🔧 Fixing ES module imports..."
find dist -type f -name "*.js" -exec sed -i -E 's|from ["'\''](\.\.?/[^"'\''\.]+)["'\'']|from "\1.js"|g' {} +

# Copy client build
echo "📋 Copying client build..."
mkdir -p dist/public
cp -r client/dist/* dist/public/

# Final verification
echo "✅ Verifying build..."
if [ ! -f "dist/server/index-minimal.js" ]; then
    echo "❌ Server build failed"
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Client build failed"
    exit 1
fi

# Validate all services
echo "🔍 Validating services..."
node -e "
const { validateEnv } = require('./src/config/env');
const { validateConfig } = require('./src/services/api-config');

async function validate() {
    if (!validateEnv()) {
        console.error('❌ Environment validation failed');
        process.exit(1);
    }
    
    if (!await validateConfig()) {
        console.error('❌ Service validation failed');
        process.exit(1);
    }
    
    console.log('✅ All services validated');
}

validate().catch(console.error);
"

echo "✅ Build and validation complete!"
echo "📝 Build artifacts:"
echo "  - Server: dist/server/index-minimal.js"
echo "  - Client: dist/public/index.html"