#!/bin/bash

echo "=== Validating Production Build ==="

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found!"
    exit 1
fi

# Check for critical files
required_files=(
    "dist/index.html"
    "dist/assets"
)

for file in "${required_files[@]}"; do
    if [ ! -e "$file" ]; then
        echo "❌ Error: $file not found!"
        exit 1
    fi
done

# Check file sizes
echo "Checking bundle sizes..."
find dist -type f -name "*.js" -exec du -h {} \;

# Check env vars
echo "Checking environment configuration..."
if [ ! -f ".env.production" ]; then
    echo "⚠️ Warning: .env.production not found"
else
    echo "✅ .env.production exists"
fi

# Optional: Start local server for testing
if command -v npx &> /dev/null; then
    echo "Starting local server for testing..."
    npx serve dist &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 2
    
    # Test health endpoint
    if curl -s "http://localhost:3000/api/health" &> /dev/null; then
        echo "✅ Health endpoint responding"
    else
        echo "⚠️ Warning: Health endpoint not responding"
    fi
    
    # Cleanup
    kill $SERVER_PID
fi

echo "=== Validation Complete ==="