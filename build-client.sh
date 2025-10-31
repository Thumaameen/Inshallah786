#!/bin/bash
set -e

echo "🎨 Building Frontend for Production..."
echo "======================================"

cd client

echo "📦 Installing client dependencies..."
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps

echo "🔨 Building client..."
npm run build

echo "📋 Verifying build..."
if [ ! -f "dist/index.html" ]; then
  echo "❌ Client build failed - index.html not found"
  exit 1
fi

if [ ! -d "dist/assets" ]; then
  echo "❌ Client build failed - assets directory not found"
  exit 1
fi

echo "✅ Frontend build complete!"
cd ..

echo "📂 Copying to dist/public..."
mkdir -p dist/public
cp -r client/dist/* dist/public/

echo "✅ Frontend ready for production!"
ls -la dist/public/