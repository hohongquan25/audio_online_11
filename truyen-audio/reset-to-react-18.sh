#!/bin/bash

echo "🔄 Resetting to React 18..."

# Stop any running dev server
echo "⏹️  Stopping dev server..."
pkill -f "next dev" || true

# Clean everything
echo "🧹 Cleaning caches..."
rm -rf .next
rm -rf node_modules
rm -rf pnpm-lock.yaml

# Clean pnpm store
echo "🗑️  Cleaning pnpm store..."
pnpm store prune

# Install React 18
echo "📦 Installing React 18.3.1..."
pnpm add react@18.3.1 react-dom@18.3.1

# Install all dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma
echo "🔧 Generating Prisma client..."
pnpm prisma generate

echo "✅ Done! Now run: pnpm dev"
