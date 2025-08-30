#!/bin/bash

echo "🧹 Clearing Next.js cache..."
rm -rf .next

echo "🧹 Clearing node_modules cache..."
npm cache clean --force

echo "📦 Reinstalling dependencies..."
npm install

echo "🔨 Building application..."
npm run build

echo "✅ Cache cleared and application rebuilt successfully!"
