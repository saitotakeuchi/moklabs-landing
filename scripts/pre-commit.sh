#!/bin/bash

# Pre-commit Hook
# Run checks before committing code

set -e

echo "🔍 Running pre-commit checks..."
echo ""

# Format check
echo "📝 Checking code formatting..."
npm run format:check
if [ $? -eq 0 ]; then
    echo "✅ Code formatting is correct!"
else
    echo "❌ Code formatting issues found!"
    echo "💡 Run 'npm run format' to fix formatting"
    exit 1
fi

# Type check
echo "📝 Running TypeScript type check..."
npm run type-check
if [ $? -eq 0 ]; then
    echo "✅ Type check passed!"
else
    echo "❌ Type check failed!"
    exit 1
fi

# Lint
echo "🔍 Running ESLint..."
npm run lint
if [ $? -eq 0 ]; then
    echo "✅ Lint check passed!"
else
    echo "❌ Lint check failed!"
    exit 1
fi

echo ""
echo "✅ All pre-commit checks passed!"
