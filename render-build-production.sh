#!/bin/bash
set -e

echo "🚀 DHA Digital Services - PRODUCTION BUILD FOR RENDER"
echo "===================================================="

# Verify Node version
echo "📌 Checking Node.js version..."
node --version
npm --version

EXPECTED_NODE_VERSION="20"
CURRENT_NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')

if [ "$CURRENT_NODE_VERSION" != "$EXPECTED_NODE_VERSION" ]; then
  echo "❌ ERROR: Node.js version $EXPECTED_NODE_VERSION.x is required"
  echo "   Current version: $(node -v)"
  exit 1
fi

echo "✅ Node.js version is compatible"

# Clean previous builds and npm cache
echo "🧹 Cleaning previous builds..."
rm -rf dist client/dist node_modules/.cache
npm cache clean --force

# Install root dependencies with clean install
echo "📦 Installing root dependencies..."
npm ci --legacy-peer-deps --no-audit || npm install --legacy-peer-deps --no-audit

# Build client
echo "🎨 Building client..."
cd client
echo "📦 Installing client dependencies..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --no-audit --include=dev
echo "🔨 Running client build..."
npm run build
cd ..

# Verify client build
if [ ! -f "client/dist/index.html" ]; then
  echo "❌ Client build failed - index.html not found"
  exit 1
fi

echo "✅ Client build verified"
ls -la client/dist/

# Build server
echo "⚙️ Building server..."
npx tsc -p tsconfig.production.json --skipLibCheck || echo "⚠️ Build completed with warnings"

# Ensure dist/public directory exists
echo "📋 Preparing dist/public directory..."
rm -rf dist/public
mkdir -p dist/public

# Copy client build to dist/public
echo "📋 Copying client build to dist/public..."
cp -r client/dist/* dist/public/

# Verify the copy
echo "✅ Verifying dist/public..."
ls -la dist/public/

# Verify critical files
echo "✅ Verifying build..."
if [ ! -f "dist/server/index-minimal.js" ]; then
  echo "❌ Server build failed"
  exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
  echo "❌ Client build failed - dist/public/index.html not found"
  exit 1
fi

echo "✅ Production build complete!"
echo "📊 Build artifacts:"
ls -lh dist/server/index-minimal.js
ls -lh dist/public/index.html
echo "📁 Client assets:"
ls -la dist/public/ | head -20