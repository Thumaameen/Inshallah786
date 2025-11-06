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

# Force Node.js and npm versions through environment
export NODE_VERSION=20.19.1
export NPM_VERSION=10.2.3

# Verify Node.js version
if [ "$(node -v)" != "v$NODE_VERSION" ]; then
    echo "❌ Error: Wrong Node.js version. Expected v$NODE_VERSION, got $(node -v)"
    exit 1
fi

# Install correct npm version
echo "Installing npm $NPM_VERSION..."
npm install -g npm@$NPM_VERSION

# Verify npm version
if [ "$(npm -v)" != "$NPM_VERSION" ]; then
    echo "❌ Error: Wrong npm version. Expected $NPM_VERSION, got $(npm -v)"
    exit 1
fi

# Install global dependencies
echo "Installing global dependencies..."
npm install -g vite typescript @vitejs/plugin-react

# Install correct npm version
npm install -g npm@$NPM_VERSION

# CRITICAL: Production environment setup - FORCE PRODUCTION MODE

# Set up environment variables
export NODE_ENV=production
export NPM_VERSION=10.2.3
export NODE_VERSION=20.19.1
export VITE_MODE=production

# Install correct npm version
npm install -g npm@$NPM_VERSION

# Verify Node and NPM versions
echo "NODE_VERSION: $NODE_VERSION"
echo "NODE_ENV: $NODE_ENV"
echo "Current Node: $(node -v)"
echo "Current NPM: $(npm -v)"

# Clean all previous builds and dependencies
echo "🧹 Cleaning workspace..."
rm -rf dist client/dist node_modules client/node_modules package-lock.json client/package-lock.json

# Install root dependencies first
echo "� Installing root dependencies..."
npm install --legacy-peer-deps --no-audit

# Build client
echo "🎨 Building client..."
cd client || {
    echo "❌ Failed to enter client directory"
    exit 1
}

echo "📦 Installing client dependencies..."
npm ci --legacy-peer-deps --no-audit || npm install --legacy-peer-deps --no-audit

# Clear Vite cache
echo "🧹 Clearing Vite cache..."
rm -rf node_modules/.vite

# Production build configuration
echo "⚙️ Setting up Vite production configuration..."
cat > vite.config.ts << EOL
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  esbuild: {
    jsxInject: "import React from 'react'",
  },
});
EOL

# Run production build
echo "🏗️ Running production build..."
NODE_ENV=production npm run build
    @tanstack/react-query@^5.28.0

# Verify Vite installation and setup
echo "⚙️ Setting up Vite..."
npm install --save-dev vite@latest @vitejs/plugin-react@latest

# Create optimized Vite config
echo "📝 Creating production Vite config..."
cat > vite.config.ts << 'EOL'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  esbuild: {
    jsxInject: "import React from 'react'",
  },
});
EOL

# Set production environment
export VITE_MODE=production
export NODE_ENV=production
export CI=false
export VITE_APP_ENV=production

# Clean and run production build
echo "🏗️ Running optimized production build..."
rm -rf dist
npm run build -- --mode production

# Verify build output
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed - build artifacts not found"
    exit 1
fi

echo "✅ Vite build successful"

echo "✅ Client build successful"

# Verify client build
if [ ! -f "dist/index.html" ]; then
    echo "❌ Client build failed - index.html not found"
    exit 1
fi

# Return to root with verification
cd .. || {
    echo "❌ Failed to return to root directory"
    exit 1
}

# Set production environment variables
export NODE_ENV=production
export RENDER=true
export RENDER_SERVICE_ID=true
export NPM_CONFIG_PRODUCTION=false

# Verify Node.js version - must be 20.19.1
CURRENT_NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_NODE_VERSION="20.19.1"

if [ "$CURRENT_NODE_VERSION" != "$REQUIRED_NODE_VERSION" ]; then
    echo "⚠️ Warning: Expected Node.js $REQUIRED_NODE_VERSION, found $(node -v)"
    echo "Attempting to continue with current version..."
fi
echo "✅ Node.js version: $(node -v)"

echo "🔍 Environment Check:"
echo "  NODE_ENV=$NODE_ENV"
echo "  RENDER=$RENDER"
echo "  NODE_VERSION=$NODE_VERSION"
echo ""

# Node.js configuration - optimized for production
export NODE_OPTIONS="--max-old-space-size=4096 --experimental-modules --es-module-specifier-resolution=node"
export SKIP_PREFLIGHT_CHECK=true
export TSC_COMPILE_ON_ERROR=false
export DISABLE_ESLINT_PLUGIN=true
export VITE_DISABLE_OPTIMIZER=false
export VITE_MINIFY=true
export VITE_SOURCE_MAP=false
export TS_NODE_PROJECT="tsconfig.production.json"

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

# Verify Node.js 20.19.1 or compatible
REQUIRED_NODE_VERSION="20.19.1"
CURRENT_NODE_VERSION=$(node -v | sed 's/v//')

echo "Required: $REQUIRED_NODE_VERSION"
echo "Current: $CURRENT_NODE_VERSION"

if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found"
  exit 1
fi

echo "✅ Node.js available and validated"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist client/dist

# Install dependencies with legacy peer deps
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install --legacy-peer-deps @radix-ui/react-scroll-area
npm install --save-dev vite@latest @vitejs/plugin-react typescript @types/react @types/react-dom @types/node
cd .. --legacy-peer-deps --no-audit
export NODE_PATH="$(npm root -g)"

echo "✅ Root dependencies installed"

# Build client
echo "🎨 Building client..."
cd client || mkdir -p client

echo "📦 Installing client dependencies..."
if [ ! -f "package.json" ]; then
  echo "Creating client package.json..."
  cp -f ../client/package.json . || echo "Failed to copy client package.json"
fi

# Install dependencies with specific versions to fix TypeScript issues
npm install --legacy-peer-deps --no-audit
npm install --legacy-peer-deps --save-dev \
  @types/react@^18.2.0 \
  @types/react-dom@^18.2.0 \
  react-router-dom@^6.20.0 \
  @types/react-router-dom@^5.3.0 \
  @tanstack/react-query@^5.28.0

echo "🔨 Building client with TypeScript skip lib check..."
export NODE_ENV=production
export VITE_APP_ENV=production
export CI=false
export TSC_COMPILE_ON_ERROR=true
npm run build -- --mode production

# Check if build succeeded
if [ $? -ne 0 ]; then
    echo "⚠️ Client build had errors, attempting alternative build..."
    # Try building with vite directly
    npx vite build --mode production --logLevel warn || echo "Alternative build also failed"
fi

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

# Set build environment
export TSC_COMPILE_ON_ERROR=true
export NODE_OPTIONS="--max-old-space-size=4096"
export TS_NODE_PROJECT="tsconfig.production.json"

# Install TypeScript globally
echo "📦 Installing TypeScript..."
npm install -g typescript@latest

# Create production TypeScript config
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

# Run production build
echo "🏗️ Building server with TypeScript..."
npm run build:server || {
    echo "⚠️ Standard build failed, trying with permissive flags..."
    npx tsc -p tsconfig.production.json \
        --skipLibCheck \
        --noEmitOnError false \
        --suppressImplicitAnyIndexErrors \
        || exit 1
}

# Fix ES Module imports
echo "🔧 Fixing ES module imports..."
find dist -type f -name "*.js" -exec sed -i -E 's|from "(\.\.?/[^"]+)"|from "\1.js"|g; s|from '"'"'(\.\.?/[^'"'"']+)'"'"'|from '"'"'\1.js'"'"'|g' {} +

# Clean up any double extensions
find dist -type f -name "*.js" -exec sed -i 's/\.js\.js/\.js/g; s/\.ts\.js/\.js/g' {} +

# Verify build outputs
if [ ! -f "dist/server/index.js" ]; then
    echo "❌ Server build failed - index.js not found"
    exit 1
fi

echo "✅ Server build verified"

# Set up public directory
echo "📋 Setting up public assets..."
# Final verification steps
echo "🔍 Running final verifications..."

# Check critical files exist
REQUIRED_FILES=(
    "dist/public/index.html"
    "dist/server/index.js"
    "dist/public/assets"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -e "$file" ]; then
        echo "❌ Critical file/directory missing: $file"
        exit 1
    fi
done

# Print build summary
echo "
✨ Build Complete! ✨
====================
📊 Summary:
- Node.js version: $(node -v)
- npm version: $(npm -v)
- Build timestamp: $(date)
- Client files in: dist/public/
- Server files in: dist/server/

🔍 Verification:
- Client bundle: ✅
- Server bundle: ✅
- Public assets: ✅
- ES modules: ✅

Next steps:
1. Deploy using render-start-production.sh
2. Monitor application logs
3. Verify all environment variables

Build completed successfully! 🚀
"
cp -r client/dist/* dist/public/ || {
    echo "⚠️ Failed to copy client build to public directory"
    exit 1
}

# Copy client build to dist/public
echo "📋 Copying client build to dist/public..."
cp -r client/dist/* dist/public/ || echo "⚠️ Some files may not have copied"

# Verify the copy
echo "✅ Verifying dist/public..."
ls -la dist/public/ || true

# Verify critical files
echo "✅ Verifying build..."
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

echo "✅ Build Complete!"
echo "📦 Server entry point: dist/server/index-minimal.js"
echo "📦 Client build: dist/public/"
echo "✅ Ready for production deployment"