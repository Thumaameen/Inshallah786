
#!/bin/bash
echo "🔧 Building DHA Frontend"
echo "========================"

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/public

# Create dist directory structure
mkdir -p dist/public

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install --legacy-peer-deps --include=dev

# Build client
echo "🏗️ Building client..."
npm run build

# Go back to root
cd ..

# Verify build output exists
if [ -d "dist/public" ] && [ "$(ls -A dist/public)" ]; then
  echo "✅ Frontend build successful!"
  echo "📦 Build output:"
  ls -la dist/public
  exit 0
else
  echo "❌ Frontend build failed - no output directory or empty"
  exit 1
fi
