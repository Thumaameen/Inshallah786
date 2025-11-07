#!/bin/bash
set -e

echo "=========================================="
echo "🚀 DHA Digital Services - RENDER BUILD"
echo "=========================================="
echo "Build started: $(date)"
echo ""

# Error handler
handle_error() {
  echo ""
  echo "=========================================="
  echo "❌ BUILD FAILED at line $1"
  echo "=========================================="
  exit 1
}

trap 'handle_error $LINENO' ERR

# Environment setup
echo "📌 Setting up environment..."
export NODE_ENV=production
export VITE_MODE=production
export CI=true

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Working directory: $(pwd)"
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist client/dist node_modules/.cache client/node_modules/.vite || true
echo "✅ Cleaned"
echo ""

# Install root dependencies (production only)
echo "📦 Installing root dependencies..."
NPM_CONFIG_PRODUCTION=true npm ci --legacy-peer-deps --no-audit || npm install --legacy-peer-deps --no-audit --production
echo "✅ Root dependencies installed"
echo ""

# Build client
echo "=========================================="
echo "🎨 BUILDING CLIENT"
echo "=========================================="

cd client || {
  echo "❌ Failed to enter client directory"
  exit 1
}

echo "Current directory: $(pwd)"
echo ""

echo "📦 Installing client dependencies (including dev tools)..."
npm ci --legacy-peer-deps || npm install --legacy-peer-deps --no-audit
echo "✅ Client dependencies installed"
echo ""

echo "🧹 Clearing Vite cache..."
rm -rf node_modules/.vite || true
echo "✅ Cache cleared"
echo ""

echo "🏗️ Building client application..."
NODE_OPTIONS="--max-old-space-size=2048" npm run build || {
  echo "⚠️ First build attempt failed, trying with reduced memory..."
  NODE_OPTIONS="--max-old-space-size=1536" npm run build || {
    echo "❌ Client build failed"
    exit 1
  }
}
echo "✅ Client build complete"
echo ""

echo "🔍 Verifying client build..."
if [ ! -f "dist/index.html" ]; then
  echo "❌ Client build failed - index.html not found"
  echo "Contents of client directory:"
  ls -la . || true
  echo "Contents of dist directory (if exists):"
  ls -la dist || true
  exit 1
fi

echo "✅ Client build successful"
echo "Client build contents:"
ls -la dist/ | head -10
echo ""

# Return to root
cd .. || {
  echo "❌ Failed to return to root directory"
  exit 1
}

echo "=========================================="
echo "⚙️  BUILDING SERVER"
echo "=========================================="

echo "Current directory: $(pwd)"
echo ""

# Create production TypeScript config if needed
if [ ! -f "tsconfig.production.json" ]; then
  echo "⚙️  Creating production TypeScript config..."
  cat > tsconfig.production.json << 'TSCONFIG'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "sourceMap": false,
    "declaration": false,
    "skipLibCheck": true,
    "noEmitOnError": false,
    "allowJs": true,
    "checkJs": false,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "module": "ESNext",
    "target": "ES2020",
    "outDir": "dist"
  },
  "include": ["server/**/*", "shared/**/*"],
  "exclude": ["node_modules", "client", "**/*.test.ts", "**/*.spec.ts"]
}
TSCONFIG
  echo "✅ Created tsconfig.production.json"
fi

echo "🏗️  Compiling TypeScript..."
npm run build:server || {
  echo "⚠️  Standard build failed, trying with permissive flags..."
  npx tsc -p tsconfig.production.json --skipLibCheck --noEmitOnError false || {
    echo "❌ Server build failed"
    exit 1
  }
}
echo "✅ Server compiled"
echo ""

# Create public directory and copy client build
echo "📋 Setting up public assets..."
mkdir -p dist/public
cp -r client/dist/* dist/public/ || {
  echo "❌ Failed to copy client build to dist/public"
  exit 1
}
echo "✅ Assets copied"
echo ""

# Verify build outputs
echo "=========================================="
echo "🔍 VERIFYING BUILD"
echo "=========================================="

echo "Checking for server entry point..."
if [ ! -f "dist/server/index-minimal.js" ]; then
  echo "❌ Server build failed - dist/server/index-minimal.js not found"
  echo "Contents of dist directory:"
  ls -la dist || true
  echo "Contents of dist/server (if exists):"
  ls -la dist/server || true
  exit 1
fi
echo "✅ Server entry point exists"

echo "Checking for client build..."
if [ ! -f "dist/public/index.html" ]; then
  echo "❌ Client build failed - dist/public/index.html not found"
  echo "Contents of dist/public:"
  ls -la dist/public || true
  exit 1
fi
echo "✅ Client build exists"
echo ""

# Build summary
echo "=========================================="
echo "✅ BUILD COMPLETE!"
echo "=========================================="
echo "Build finished: $(date)"
echo ""
echo "📊 Build Summary:"
echo "  ✅ Client built successfully"
echo "  ✅ Server built successfully"
echo "  ✅ Assets copied to dist/public/"
echo ""
echo "📦 Output structure:"
ls -la dist/ | head -10 || true
echo ""
echo "🚀 Ready for deployment!"
echo "=========================================="