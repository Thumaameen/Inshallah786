
#!/bin/bash
set -e

echo "🚀 DHA Digital Services - PRODUCTION BUILD FOR RENDER"
echo "===================================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist client/dist node_modules/.cache

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --legacy-peer-deps --no-audit

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

# Build server
echo "⚙️ Building server..."
npx tsc -p tsconfig.production.json --skipLibCheck || echo "⚠️ Build completed with warnings"

# Copy client build to dist/public
echo "📋 Copying client to dist/public..."
mkdir -p dist/public
cp -r client/dist/* dist/public/

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
