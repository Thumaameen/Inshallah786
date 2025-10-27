
#!/bin/bash
echo "🔧 Building DHA Frontend"
echo "========================"

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/public

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install --legacy-peer-deps

# Build client
echo "🏗️ Building client..."
npm run build

# Verify build output
if [ -d "../dist/public" ]; then
  echo "✅ Frontend build successful!"
  echo "📦 Build output:"
  ls -la ../dist/public
  exit 0
else
  echo "❌ Frontend build failed - no output directory"
  exit 1
fi
