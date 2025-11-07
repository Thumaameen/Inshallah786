#!/bin/bash
set -e

echo "🚀 DHA Digital Services - OPTIMIZED PRODUCTION BUILD"
echo "=================================================="
echo "📅 Build started: $(date)"

# Error handling
handle_error() {
    echo "❌ Error on line $1"
    echo "Stack trace:"
    echo "$(caller)"
    exit 1
}
trap 'handle_error $LINENO' ERR

# Environment setup
export NODE_ENV=production
export NPM_CONFIG_PRODUCTION=false
export NODE_VERSION=20.19.1
export NPM_VERSION=10.2.3

# Function to verify version
verify_version() {
    local cmd=$1
    local version=$2
    local actual
    actual=$($cmd --version)
    if [[ "$actual" != *"$version"* ]]; then
        echo "❌ Wrong $cmd version. Required: $version, Found: $actual"
        return 1
    fi
    echo "✅ $cmd version verified: $actual"
    return 0
}

# Node.js setup
echo "📦 Setting up Node.js environment..."
export NVM_DIR="${HOME}/.nvm"
mkdir -p $NVM_DIR
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use correct Node version
echo "🔄 Installing Node.js ${NODE_VERSION}..."
nvm install ${NODE_VERSION}
nvm use ${NODE_VERSION}
verify_version node "v${NODE_VERSION}"

# Update npm to correct version
echo "🔄 Updating npm to version ${NPM_VERSION}..."
npm install -g npm@${NPM_VERSION}
verify_version npm "${NPM_VERSION}"

# Clear npm cache and remove old dependencies
echo "🧹 Cleaning npm cache..."
npm cache clean --force
rm -rf node_modules
rm -rf client/node_modules

# Install dependencies
echo "📦 Installing server dependencies..."
npm ci --legacy-peer-deps

echo "📦 Installing client dependencies..."
cd client
npm ci --legacy-peer-deps
npm install @radix-ui/react-scroll-area --save --legacy-peer-deps

# Build client
echo "🏗️ Building client..."
npm run build
cd ..

# Build server
echo "🏗️ Building server..."
npm run build:server

# Verify dist directory
echo "✅ Verifying build artifacts..."
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found!"
    exit 1
fi

if [ ! -f "dist/server/index-minimal.js" ]; then
    echo "❌ index-minimal.js not found!"
    exit 1
fi

echo "🎉 Build completed successfully!"
echo "📅 Build finished: $(date)"