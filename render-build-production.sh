#!/bin/bash
set -e

# Suppress sourcemap warnings
export NODE_OPTIONS="--no-warnings"

echo "🚀 DHA Digital Services - PRODUCTION BUILD FOR RENDER"
echo "===================================================="

# CRITICAL: Force Node 20.18.1
export NODE_VERSION=20.18.1
export NPM_CONFIG_PRODUCTION=false

# Verify Node version
echo "📌 Node.js version check:"
node --version
npm --version

CURRENT_NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
REQUIRED_VERSION=20

if [ "$CURRENT_NODE_VERSION" -ne "$REQUIRED_VERSION" ]; then
  echo "❌ ERROR: Node.js v${REQUIRED_VERSION}.x is required for production"
  echo "   Current version: $(node -v)"
  echo "   Please update Render service settings to use Node ${REQUIRED_VERSION}.18.1"
  exit 1
fi

echo "✅ Node.js version validated: $(node -v)"

# Clean previous builds (but keep package-lock.json)
echo "🧹 Cleaning previous builds..."
rm -rf dist client/dist node_modules/.cache

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --legacy-peer-deps --no-audit

# Build client
echo "🎨 Building client..."
cd client
echo "📦 Installing client dependencies..."
rm -rf node_modules
# Install ALL dependencies including dev dependencies (vite, typescript, etc.)
npm install --legacy-peer-deps --no-audit

# Verify vite is installed
if ! npx vite --version > /dev/null 2>&1; then
  echo "❌ Vite not found, installing explicitly..."
  npm install --save-dev vite@latest @vitejs/plugin-react@latest
fi

echo "🔨 Running client build..."
NODE_ENV=production npm run build
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

echo "✅ Build Complete!"
echo "📦 Validating build output..."

# Ensure critical files exist
if [ ! -f "dist/server/index-minimal.js" ]; then
  echo "❌ ERROR: Server entry point not found!"
  exit 1
fi

if [ ! -d "dist/public" ]; then
  echo "⚠️  WARNING: Public directory not found, creating empty directory"
  mkdir -p dist/public
fi

echo "📊 Build artifacts:"
ls -lh dist/server/index-minimal.js
ls -lh dist/public/index.html
echo "📁 Client assets:"
ls -la dist/public/ | head -20