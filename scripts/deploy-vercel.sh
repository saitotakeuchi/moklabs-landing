#!/bin/bash

# Vercel Deployment Script
# This script helps deploy the Next.js application to Vercel

set -e  # Exit on error

echo "🚀 Mok Labs - Vercel Deployment Script"
echo "========================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Run pre-deployment checks
echo "🔍 Running pre-deployment checks..."
echo ""

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found!"
    echo "Make sure environment variables are set in Vercel dashboard."
fi

# Type check
echo "📝 Running TypeScript type check..."
npm run type-check
if [ $? -eq 0 ]; then
    echo "✅ Type check passed!"
else
    echo "❌ Type check failed! Fix errors before deploying."
    exit 1
fi

# Lint
echo "🔍 Running ESLint..."
npm run lint
if [ $? -eq 0 ]; then
    echo "✅ Lint check passed!"
else
    echo "⚠️  Lint warnings found. Review before deploying."
fi

# Build locally to verify
echo "🏗️  Building locally to verify..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi

echo ""
echo "✅ All checks passed!"
echo ""

# Ask for deployment confirmation
read -p "Deploy to production? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying to Vercel..."
    vercel --prod

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deployment successful!"
        echo "🌐 Your site is now live!"
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "⏸️  Deployment cancelled."
    exit 0
fi
