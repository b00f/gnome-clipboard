#!/bin/sh

# Stop on error
set -e

rm -rf dist src/build
mkdir -p dist/

# Transpile TypeScript to modern ESM
echo "Compiling TypeScript..."
tsc --p ./src

# Copy assets to dist
echo "Copying assets..."
cp -r README.md LICENSE metadata.json schemas src/*.css po dist/

# Copy compiled JavaScript to dist
echo "Copying compiled JS..."
cp -r src/build/*.js dist/

echo "Build complete."