#!/bin/bash
set -e

echo "🚀 DHA Production Build & Deployment"
echo "==================================="

# Environment Setup
export NODE_ENV=production
export NODE_VERSION=20.19.1
export NODE_OPTIONS="--max-old-space-size=4096 --experimental-modules"

echo "🔍 Running service validation..."
npx tsx scripts/validate-deployment.ts || {
    echo "❌ Service validation failed"
    exit 1
}

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --no-audit

# Install specific versions for stability
echo "📦 Installing specific package versions..."
npm install --save-exact \
    @tanstack/react-query@5.28.0 \
    @solana/web3.js@1.98.4 \
    ethers@6.15.0 \
    web3@4.16.0 \
    vite@5.1.6

# Clean builds
echo "🧹 Cleaning previous builds..."
rm -rf dist client/dist node_modules/.cache

# Build client
echo "🎨 Building client..."
cd client
npm install --legacy-peer-deps
NODE_ENV=production VITE_APP_ENV=production npm run build
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
if [ ! -f "dist/server/index-minimal.js" ]; then
    echo "❌ Server build verification failed"
    exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Client build verification failed"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📝 Build artifacts ready in dist/"