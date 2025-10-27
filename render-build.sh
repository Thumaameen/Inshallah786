#!/bin/bash

set -e

echo "🚀 RENDER PRODUCTION BUILD"
echo "========================="

# Set environment
export NODE_ENV=production
export NODE_VERSION=20.18.1

# Install and use correct Node.js version
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20.18.1
nvm use 20.18.1

# Force npm to ignore engine restrictions
export npm_config_engine_strict=false
export npm_config_force=true

# Verify Node version
echo "🔍 Node.js version:"
node -v

# Clean install dependencies
echo "📦 Installing dependencies..."
npm install --no-audit --no-fund --legacy-peer-deps --ignore-engines || {
    echo "⚠️ Initial install failed, retrying with legacy peer deps..."
    npm install --legacy-peer-deps --ignore-engines --no-audit
}

# Prepare build directory
echo "🧹 Preparing build directory..."
rm -rf dist
mkdir -p dist

# Build TypeScript
echo "🏗️ Building TypeScript..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build:ts || {
    echo "⚠️ TypeScript build failed, trying with --skipLibCheck..."
    NODE_OPTIONS="--max-old-space-size=4096" npm run build:ts -- --skipLibCheck || {
        echo "❌ TypeScript build failed completely"
        exit 1
    }
}

# Copy necessary files
echo "📋 Copying configuration files..."
cp package.json dist/
cp package-lock.json dist/ || true
cp .env dist/ || true

# Verify build
echo "✅ Verifying build..."
if [ ! -f "dist/server/index.js" ]; then
    echo "❌ Build verification failed - missing dist/server/index.js"
    exit 1
fi

echo "🎉 Build completed successfully!"