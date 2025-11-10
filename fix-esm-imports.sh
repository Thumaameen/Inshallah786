#!/bin/bash
# Add .js extensions to all relative ESM imports

find server -name "*.ts" ! -name "*.d.ts" -type f | while read file; do
  # Use sed to add .js to relative imports that don't already have an extension
  sed -i "s/from ['\"\`]\(\.[^'\"]*\)['\"\`]/from '\1.js'/g" "$file"
  sed -i "s/import ['\"\`]\(\.[^'\"]*\)['\"\`]/import '\1.js'/g" "$file"
done

echo "✅ Added .js extensions to all relative imports"
