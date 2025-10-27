
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

# Ensure vite is installed
echo "📦 Installing vite explicitly..."
npm install --save-dev vite@^5.4.10 --legacy-peer-deps

# Install all other dependencies
npm install --legacy-peer-deps --include=dev

# Verify vite is available
if ! npx vite --version; then
  echo "❌ Vite installation failed"
  exit 1
fi

# Build client
echo "🏗️ Building client with vite..."
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
