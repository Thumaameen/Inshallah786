
#!/bin/bash
set -e

echo "🚀 Full Production Build"
echo "======================="

# Clean everything
echo "🧹 Cleaning previous builds..."
rm -rf dist client/dist node_modules/.cache

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --legacy-peer-deps

# Build client
echo "🎨 Building client..."
cd client
npm install --legacy-peer-deps
npm run build
cd ..

# Verify client build exists
if [ ! -f "client/dist/index.html" ]; then
  echo "❌ Client build failed"
  exit 1
fi

echo "✅ Client built successfully"

# Build server
echo "⚙️ Building server..."
npx tsc -p tsconfig.production.json --skipLibCheck

# Create dist/public and copy client
echo "📋 Setting up dist/public..."
mkdir -p dist/public
cp -r client/dist/* dist/public/

# Verify everything
echo "✅ Verifying build..."
if [ ! -f "dist/server/index-minimal.js" ]; then
  echo "❌ Server build missing"
  exit 1
fi

if [ ! -f "dist/public/index.html" ]; then
  echo "❌ Client copy failed"
  exit 1
fi

echo "✅ Build complete!"
echo "📊 Build artifacts:"
ls -lh dist/server/index-minimal.js
ls -lh dist/public/index.html

echo ""
echo "🚀 Ready to start with: npm start"
