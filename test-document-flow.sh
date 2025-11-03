#!/bin/bash

# Set environment to test
export NODE_ENV=test

# Run tests
echo "Running document flow tests..."
npx jest server/tests/document-flow.test.ts --verbose

# Check exit code
if [ $? -eq 0 ]; then
  echo "✅ All tests passed"
  exit 0
else
  echo "❌ Tests failed"
  exit 1
fi