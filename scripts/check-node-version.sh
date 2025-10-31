
#!/bin/bash

NODE_VERSION=$(node -v)
REQUIRED_MAJOR=20

echo "Current Node.js version: $NODE_VERSION"

# Extract major version
CURRENT_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

if [ "$CURRENT_MAJOR" -ne "$REQUIRED_MAJOR" ]; then
  echo "❌ ERROR: Node.js version $REQUIRED_MAJOR.x is required"
  echo "   Current version: $NODE_VERSION"
  echo "   Please use Node.js $REQUIRED_MAJOR.x LTS"
  exit 1
fi

echo "✅ Node.js version is compatible"
exit 0
