#!/bin/bash

# AI-Optimized Build Script for CV Processing
# Optimizes build for AI processing capabilities and performance

set -e

echo "🤖 Starting AI-Optimized CV Processing Build..."

# Environment setup
export NODE_ENV=production
export BABEL_ENV=production

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# TypeScript compilation with AI optimizations
echo "📝 Compiling TypeScript with AI optimizations..."
npm run build:types

# AI-specific optimizations
echo "🧠 Optimizing AI processing modules..."
# Bundle AI services separately for better caching
npx rollup -c --config-ai-optimized=true

# Validate AI integrations
echo "🔍 Validating AI integrations..."
node -e "
  const aiServices = require('./dist/backend/services/index.js');
  console.log('✅ AI services loaded successfully');
  console.log('Available AI services:', Object.keys(aiServices));
"

# Test AI pipeline integrity
echo "🧪 Testing AI pipeline integrity..."
npm run test:ai-pipeline --silent

# Build size analysis
echo "📊 Analyzing build size..."
du -sh dist/
echo "AI modules size:"
find dist/ -name "*ai*" -o -name "*claude*" -o -name "*ml*" | xargs du -sh 2>/dev/null || true

# Validation checks
echo "✅ Running validation checks..."
npm run type-check
node -e "
  const pkg = require('./package.json');
  const fs = require('fs');
  
  // Validate exports exist
  Object.keys(pkg.exports).forEach(exportPath => {
    const fullPath = pkg.exports[exportPath];
    if (typeof fullPath === 'object') {
      Object.values(fullPath).forEach(path => {
        if (!fs.existsSync(path)) {
          throw new Error(\`Export path not found: \${path}\`);
        }
      });
    }
  });
  
  console.log('✅ All exports validated');
"

echo "🎉 AI-Optimized CV Processing Build Complete!"
echo "📦 Build artifacts available in ./dist/"