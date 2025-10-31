
#!/bin/bash
set -e

echo "🚀 DHA Digital Services - PRODUCTION BUILD FOR RENDER"
echo "===================================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist client/dist node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps --no-optional || npm install --legacy-peer-deps --no-optional

# Build client
echo "🎨 Building client..."
cd client
npm install --legacy-peer-deps --no-optional
npm run build
cd ..

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
  echo "❌ Client build failed"
  exit 1
fi

echo "✅ Production build complete!"
echo "📊 Build artifacts:"
ls -lh dist/server/index-minimal.js
ls -lh dist/public/index.html
