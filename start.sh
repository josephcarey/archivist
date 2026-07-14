#!/bin/bash
set -e

# Ensure common node install locations are on PATH
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# archivist — start script
# Installs dependencies if needed, then launches the wiki in your browser.

echo "=== archivist ==="
echo ""

# Check for Node/npm
echo "checking for Node.js and npm..."
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed."
  echo "Please install it from https://nodejs.org (choose the LTS version)."
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo "ERROR: npm is not installed. It usually comes with Node.js."
  echo "Please install Node.js from https://nodejs.org"
  exit 1
fi

# Install script dependencies if needed
echo "checking for script dependencies..."
if [ ! -d "scripts/node_modules" ]; then
  echo "Installing script dependencies (first run only)..."
  (cd scripts && npm install --silent)
  echo "Done."
  echo ""
fi

# Install docsify-cli if needed
echo "checking for docsify-cli..."
if ! command -v docsify &> /dev/null; then
  echo "Installing docsify (first run only)..."
  npm install -g docsify-cli
  echo "Done."
  echo ""
fi

echo "Starting wiki at http://localhost:3000"
echo "Press Ctrl+C to stop."
echo ""
docsify serve docs --open
