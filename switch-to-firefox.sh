#!/bin/bash

# Script to switch to Firefox-compatible version

echo "Switching to Firefox version..."

# Backup Chrome files if not already backed up
if [ ! -f "manifest_chrome.json" ]; then
    echo "Backing up Chrome manifest..."
    cp manifest.json manifest_chrome.json
fi

if [ ! -f "background_chrome.js" ]; then
    echo "Backing up Chrome background script..."
    cp background.js background_chrome.js
fi

# Switch to Firefox files
echo "Installing Firefox manifest..."
cp manifest_firefox.json manifest.json

echo "Installing Firefox background script..."
cp background_firefox.js background.js

echo ""
echo "✅ Switched to Firefox version!"
echo ""
echo "Next steps:"
echo "1. Open Firefox and navigate to about:debugging"
echo "2. Click 'This Firefox' → 'Load Temporary Add-on...'"
echo "3. Select the manifest.json file from this folder"
echo ""
echo "See FIREFOX_INSTALL.md for detailed instructions."
