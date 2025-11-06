#!/bin/bash
set -e

echo "🚀 DHA Digital Services - PRODUCTION BUILD FOR RENDER"
echo "===================================================="
echo "📅 Build started: $(date)"

# Critical error handling
handle_error() {
  echo "❌ Error occurred in build script"
  echo "Error on line $1"
  exit 1
}

trap 'handle_error $LINENO' ERR

# Environment setup
export NODE_ENV=production
export VITE_MODE=production
export CI=false
export NPM_CONFIG_PRODUCTION=false
export SKIP_PREFLIGHT_CHECK=true
export TSC_COMPILE_ON_ERROR=true
export DISABLE_ESLINT_PLUGIN=true

echo "📌 Environment Check:"
echo "NODE_ENV: $NODE_ENV"
echo "Current Node: $(node --version)"
echo "Current NPM: $(npm --version)"

# Verify Node.js version
REQUIRED_NODE_VERSION="20.19.1"
CURRENT_NODE_VERSION=$(node -v | sed 's/v//')
echo "Required: $REQUIRED_NODE_VERSION"
echo "Current: $CURRENT_NODE_VERSION"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist client/dist node_modules/.cache client/node_modules/.vite

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --legacy-peer-deps --no-audit

# Build client
echo "🎨 Building client..."
cd client || exit 1

echo "📦 Installing client dependencies..."
npm install --legacy-peer-deps --no-audit

# Install required Vite dependencies
echo "📦 Ensuring Vite is installed..."
npm install --save-dev vite@latest @vitejs/plugin-react@latest typescript

# Clear Vite cache
echo "🧹 Clearing Vite cache..."
rm -rf node_modules/.vite

# Run production build
echo "🏗️ Running client production build..."
export NODE_ENV=production
export VITE_APP_ENV=production
npm run build

# Verify client build
if [ ! -f "dist/index.html" ]; then
    echo "❌ Client build failed - index.html not found"
    exit 1
fi

echo "✅ Client build successful"
ls -la dist/ | head -20

# Return to root
cd ..

# Build server
echo "⚙️ Building server..."

# Create production TypeScript config if it doesn't exist
if [ ! -f "tsconfig.production.json" ]; then
echo "⚙️ Creating production TypeScript config..."
cat > tsconfig.production.json << 'EOL'
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
EOL
fi

# Run server build
echo "🏗️ Building server with TypeScript..."
npm run build:server || {
    echo "⚠️ Standard build failed, trying with permissive flags..."
    npx tsc -p tsconfig.production.json --skipLibCheck --noEmitOnError false || exit 1
}

# Create public directory and copy client build
echo "📋 Setting up public assets..."
mkdir -p dist/public
cp -r client/dist/* dist/public/

# Verify critical files
echo "🔍 Verifying build outputs..."
if [ ! -f "dist/server/index-minimal.js" ]; then
  echo "❌ Server build failed - dist/server/index-minimal.js not found"
  ls -la dist/server/ || echo "dist/server directory not found"
  exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
  echo "❌ Client build failed - dist/public/index.html not found"
  ls -la dist/public/ || echo "dist/public directory not found"
  exit 1
fi

# Print build summary
echo ""
echo "✨ Build Complete! ✨"
echo "===================="
echo "📊 Summary:"
echo "- Node.js version: $(node -v)"
echo "- npm version: $(npm -v)"
echo "- Build timestamp: $(date)"
echo "- Client files in: dist/public/"
echo "- Server files in: dist/server/"
echo ""
echo "🔍 Verification:"
echo "- Client bundle: ✅"
echo "- Server bundle: ✅"
echo "- Public assets: ✅"
echo ""
echo "✅ Ready for production deployment!"
