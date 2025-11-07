#!/bin/bash
# Fix ESM imports by adding .js extensions

echo "Fixing ESM imports..."

# Find all TypeScript files and add .js extensions to relative imports
find server src -name "*.ts" -type f | while read file; do
  # Skip .d.ts files
  if [[ "$file" == *.d.ts ]]; then
    continue
  fi
  
  # Add .js to relative imports that don't have extensions
  sed -i -E "s|from ['\"](\./[^'\"]*)['\"]|from '\1.js'|g" "$file" 2>/dev/null || true
  sed -i -E "s|from ['\"](\.\./[^'\"]*)['\"]|from '\1.js'|g" "$file" 2>/dev/null || true
done

echo "ESM imports fixed!"
