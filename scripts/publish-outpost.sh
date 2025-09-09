#!/bin/bash

# Script to publish alexandria-outpost to npm

echo "🏛️  Publishing Alexandria Outpost to npm..."

# Clean up previous builds
echo "Cleaning previous builds..."
rm -rf dist/ outpost-dist/

# Build the package
echo "Building UI..."
npx astro build --config astro.config.outpost.mjs

echo "Building server..."
node scripts/build-server.js

# Create temporary directory for publishing
echo "Preparing package..."
mkdir -p publish-temp
cp package-outpost.json publish-temp/package.json
cp README-outpost.md publish-temp/README.md
cp -r dist publish-temp/
cp -r outpost-dist publish-temp/

# Publish to npm
echo "Publishing to npm..."
cd publish-temp
npm publish --access public
cd ..
rm -rf publish-temp

echo "✅ Alexandria Outpost published successfully!"