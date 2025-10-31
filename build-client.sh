#!/bin/bash
set -e

echo "🎨 Building Frontend for Production..."
echo "======================================"

cd client

echo "📦 Installing client dependencies (including dev)..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

echo "🔨 Building client..."
npm run build

echo "📋 Verifying build..."
if [ ! -f "dist/index.html" ]; then
  echo "❌ Client build failed - index.html not found"
  exit 1
fi

echo "✅ Frontend build complete!"
cd ..

echo "📂 Copying to dist/public..."
mkdir -p dist/public
cp -r client/dist/* dist/public/

echo "✅ Frontend ready for production!"