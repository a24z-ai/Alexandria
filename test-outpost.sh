#!/bin/bash

# Test the alexandria-outpost package locally

echo "🏛️  Testing Alexandria Outpost..."

# Install dependencies
echo "Installing dependencies..."
npm install express@^5.1.0 open@^10.2.0 commander@^14.0.0 chalk@^5.6.2

# Build the package
echo "Building UI..."
npx astro build --config astro.config.outpost.mjs

echo "Building server..."
node scripts/build-server.js

# Start the server
echo "Starting server..."
node dist/cli.js serve --port 3003 --api-url https://git-gallery.com