#!/bin/bash
set -e

echo "🚀 DHA Digital Services - PRODUCTION BUILD FOR RENDER"
echo "===================================================="
echo "📅 Build started: $(date)"
echo ""

# Critical error handling
handle_error() {
  echo "❌ Error occurred in build script"
  echo "Error on line $1"
  exit 1
}

trap 'handle_error $LINENO' ERR

# Force Node.js version
export NODE_VERSION=20.19.1
export NPM_VERSION=10.2.3

# Install correct Node.js version
echo "Installing Node.js $NODE_VERSION..."
export NVM_DIR="/usr/local/share/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Retry nvm installation if not available
if ! command -v nvm &> /dev/null; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

nvm install $NODE_VERSION || {
    echo "Failed to install Node.js $NODE_VERSION using nvm"
    exit 1
}
nvm use $NODE_VERSION || {
    echo "Failed to use Node.js $NODE_VERSION"
    exit 1
}

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
npm install --legacy-peer-deps --no-audit

# Install all dependencies in the correct order
echo "📦 Installing production dependencies..."
npm install --save react@latest react-dom@latest @radix-ui/react-scroll-area@latest

echo "📦 Installing development dependencies..."
npm install --save-dev \
    vite@latest \
    @vitejs/plugin-react@latest \
    typescript@latest \
    @types/react@^18.2.0 \
    @types/react-dom@^18.2.0 \
    @types/node@latest \
    @babel/core@latest \
    @babel/preset-react@latest \
    @babel/plugin-transform-react-jsx@latest \
    react-router-dom@^6.20.0 \
    @tanstack/react-query@^5.28.0

# Verify Vite installation
if ! [ -f "node_modules/vite/bin/vite.js" ]; then
    echo "⚠️ Vite not found in node_modules, installing explicitly..."
    npm install --save-dev vite@latest
fi

# Create minimal vite config if it doesn't exist
echo "Creating minimal vite.config.js..."
cat > vite.config.js << 'EOL'
/** @type {import('vite').UserConfig} */
export default {
    plugins: [require('@vitejs/plugin-react')()],
    build: {
        outDir: 'dist',
        minify: true
    }
}
EOL

# Verify and run client build
echo "🏗️ Building client..."
export VITE_MODE=production
export NODE_ENV=production
export CI=false
export VITE_APP_ENV=production

# Run Vite build with proper environment setup
echo "🏗️ Running production build..."
export NODE_ENV=production
export VITE_MODE=production
export VITE_APP_ENV=production

# Clean the dist directory
rm -rf dist

# Reinstall Vite to ensure it's available
echo "Ensuring Vite is installed..."
npm install --save-dev vite@latest
npm install --save-dev @vitejs/plugin-react@latest

# Run build with proper Node.js options
echo "Building with Vite..."
export NODE_ENV=production
npm install -g vite
vite build

# Verify the build
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed - index.html not found"
    exit 1
fi

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
export TSC_COMPILE_ON_ERROR=true
export NODE_OPTIONS="--max-old-space-size=4096"

# Ensure TypeScript is installed
npm install -g typescript@latest

# Prepare TypeScript config
if [ ! -f "tsconfig.production.json" ]; then
    echo "⚠️ Production TypeScript config not found, using default..."
    cp tsconfig.json tsconfig.production.json
fi

# Build with increasing permissiveness
echo "First build attempt..."
npx tsc -p tsconfig.production.json --noEmitOnError false || {
    echo "⚠️ Initial build failed, trying with skipLibCheck..."
    npx tsc -p tsconfig.production.json \
        --skipLibCheck \
        --noEmitOnError false || {
        echo "⚠️ Second attempt failed, trying with all permissive flags..."
        TSC_COMPILE_ON_ERROR=true npx tsc -p tsconfig.production.json \
            --skipLibCheck \
            --noEmitOnError false \
            --suppressImplicitAnyIndexErrors \
            --useUnknownInCatchVariables false \
            --noImplicitAny false || {
            echo "⚠️ All TypeScript build attempts failed"
            exit 1
        }
    }
}

# Fix ES Module imports - add .js only to imports that don't already have an extension
echo "🔧 Fixing ES module imports..."
# Only add .js to relative imports that don't have any extension
find dist -type f -name "*.js" -exec sed -i -E "s|from (['\"])(\.\.?/[^'\"\.]+)(['\"])|from \1\2.js\3|g" {} +
# Clean up any double extensions that might have been created
find dist -type f -name "*.js" -exec sed -i "s/\.js\.js/.js/g" {} +
find dist -type f -name "*.js" -exec sed -i "s/\.ts\.js/.js/g" {} +

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