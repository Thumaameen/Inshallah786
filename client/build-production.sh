
#!/bin/bash
set -e

echo "🎨 Building client for production..."

# Install dependencies
npm install --legacy-peer-deps

# Install missing packages
npm install --legacy-peer-deps --save-dev \
  @types/react@^18.2.0 \
  @types/react-dom@^18.2.0 \
  react-router-dom@^6.20.0 \
  @types/react-router-dom@^5.3.0

npm install --legacy-peer-deps \
  @tanstack/react-query@^5.28.0

# Build with Vite
NODE_ENV=production \
VITE_APP_ENV=production \
npx vite build --mode production

echo "✅ Client build complete"
