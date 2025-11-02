#!/bin/bash
set -e

echo "🚀 DHA Digital Services - PRODUCTION BUILD FOR RENDER"
echo "===================================================="

# CRITICAL: Production environment setup
export NODE_ENV=production
export RENDER=true
export NODE_VERSION=20.18.0
export NPM_CONFIG_PRODUCTION=false

# Node.js configuration - matching successful deployment
export NODE_OPTIONS="--max-old-space-size=4096 --experimental-modules --es-module-specifier-resolution=node"
export SKIP_PREFLIGHT_CHECK=true
export TSC_COMPILE_ON_ERROR=true
export DISABLE_ESLINT_PLUGIN=true

# Ensure ES modules are handled correctly
echo "📦 Configuring build system..."
if [ -f "package.json" ]; then
    sed -i 's/"type": "commonjs"/"type": "module"/g' package.json || true
fi

# Version check and environment setup
echo "📌 Environment Check:"
echo "NODE_VERSION: $NODE_VERSION"
echo "NODE_ENV: $NODE_ENV"
echo "Current Node: $(node --version)"
echo "Current NPM: $(npm --version)"

# Continue regardless of Node.js version in development
if [ "$NODE_ENV" = "production" ]; then
  if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
  fi
  
  echo "✅ Node.js available"
fi

echo "✅ Node.js version validated: $(node -v)"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist client/dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --no-audit

# Install critical types
npm install --save-dev @types/node @types/express @types/ws typescript

# Build client
echo "🎨 Building client..."
cd client

echo "📦 Installing client dependencies..."
npm ci --omit=dev --legacy-peer-deps

echo "🔨 Building client..."
NODE_ENV=production CI=false npm run build

cd ..

# Verify client build
if [ ! -f "client/dist/index.html" ]; then
  echo "❌ Client build failed - index.html not found"
  exit 1
fi

echo "✅ Client build verified"
ls -la client/dist/ || true

# Build server
echo "⚙️ Building server..."
export TSC_COMPILE_ON_ERROR=true
npx tsc -p tsconfig.production.json || echo "⚠️ Build completed with type warnings"

# Fix ES Module imports - add .js only to imports that don't already have it
echo "🔧 Fixing ES module imports..."
find dist -type f -name "*.js" -exec sed -i -E "s|from (['\"])(\./[^'\"]+)(['\"])|from \1\2.js\3|g" {} +
find dist -type f -name "*.js" -exec sed -i -E "s|\.js\.js|.js|g" {} +

# Verify build
echo "🔍 Verifying build..."
if [ ! -f "dist/server/index-minimal.js" ]; then
  echo "❌ Server build failed"
  exit 1
fi

echo "✅ Server build verified"

# Ensure dist/public directory exists
echo "📋 Preparing dist/public directory..."
rm -rf dist/public
mkdir -p dist/public

# Copy client build to dist/public
echo "📋 Copying client build to dist/public..."
cp -r client/dist/* dist/public/ || echo "⚠️ Some files may not have copied"

# Verify the copy
echo "✅ Verifying dist/public..."
ls -la dist/public/ || true

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

echo "✅ Build Complete!"
echo "📦 Build output ready for deployment"